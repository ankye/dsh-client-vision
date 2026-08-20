/**
 * Model-facing screen capture and external image-recognition tools.
 *
 * The tool entry points are decoupled from the recognition backend: a channel
 * registry maps the `vision.channel` setting to one `analyze()` implementation.
 * Adding a backend (Claude, Gemini, a local model) is one registry entry plus a
 * settings segment, with no tool-schema change.
 * @module @deepseek-ai/dsh-tool-vision
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-fs'
import type { SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-shell'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { createReadStream } from 'node:fs'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { buildScreenshotCommand, captureDependencyHint, currentPlatform, deviceCaptureHint, listWindowsViaShell, shellOutputPath, type ScreenshotArgs, type WindowEntry } from './capture.ts'
import { imageSizeOf, prepareImage } from './image.ts'
import { channels } from './channels/index.ts'
import { abortedError } from './abort.ts'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'tool-vision'

/** Services this plugin consumes (all host-plane; it publishes nothing). */
export const inject = ['tools', 'shell', 'fs', 'systemPrompt']

/** Settings namespace carrying the vision configuration. */
export const VISION_SETTINGS_NAMESPACE = settingsNamespace('vision')

/** Resolved vision configuration. */
export interface VisionConfig {
  /** Active recognition channel; defaults to `gpt`. */
  channel: string
  /** Master switch; when false the recognition tool refuses. */
  enabled: boolean
  /** Endpoint prefix (domain and optional path); `/chat/completions` is appended. */
  baseUrl: string
  /** Recognition model name. */
  model: string
  /** Credential reference naming the stored API key. */
  apiKeyEnv: string
}

/** Runtime configuration schema for the vision plugin. */
export const Config: z<VisionConfig> = z.object({
  channel: z.string().default('gpt'),
  enabled: z.boolean().default(true),
  baseUrl: z.string(),
  model: z.string().default('gpt-5.6-terra'),
  apiKeyEnv: z.string().role('credential-ref').default('VISION_GPT_API_KEY'),
})

/** The `analyze_image` tool's arguments. */
interface AnalyzeImageArgs {
  image_path?: string
  prompt?: string
}

/** The `view_image` tool's arguments. */
interface ViewImageArgs {
  /** Image to describe; omitted to capture the screen instead. */
  image_path?: string
  /** Capture mode when `image_path` is omitted (default fullscreen). */
  mode?: 'fullscreen' | 'window' | 'region' | 'interactive' | 'android' | 'ios'
  window_id?: number
  /** adb serial from `adb devices` (mode=android; required when several devices are online). */
  device?: string
  x?: number
  y?: number
  width?: number
  height?: number
  prompt?: string
}

/** Default instruction when the model passes none. */
const DEFAULT_PROMPT = 'Describe the image in detail, in the language of the conversation.'

/**
 * Resolve the calling session's sandbox policy for a direct shell call. The
 * tool layer normally stamps this per execution; the vision tools call
 * `ctx.shell` directly, so they resolve it the same way to keep the session's
 * confinement (and its persistent private temp) across capture/prepare steps.
 * @param ctx - plugin context.
 * @param exec - the executing tool call.
 * @returns the session policy, or undefined when no policy service is mounted.
 */
function sessionShellPolicy(ctx: Context, exec: ToolRunContext): SandboxExecutionPolicy | undefined {
  const sandboxPolicy = ctx.get('sandboxPolicy')
  return sandboxPolicy === undefined
    ? undefined
    : sandboxPolicy.resolve(exec.agent === undefined ? {} : { session: exec.agent.session })
}

/**
 * Mount the vision tools and settings section.
 * @param ctx - plugin context.
 * @param config - the composed row config (schema-defaulted by Cordis).
 */
export function apply(ctx: Context, config: VisionConfig): void {
  let current: () => VisionConfig = () => config
  installSettingsSection(ctx, VISION_SETTINGS_NAMESPACE, Config, config, {
    setSource: (source) => { current = source },
    onChange: () => {},
  })

  let lastScreenshotPath: string | undefined

  // Serve screenshot PNGs to the browser UI (the model context keeps text only).
  // The captured file lives at the recorded screenshot path (the platform temp
  // on macOS/Linux, the sandbox private temp on Windows), so the route serves
  // that file directly instead of re-deriving a directory.
  const webServer = ctx.get('webServer')
  if (webServer !== undefined) {
    webServer.register({
      kind: 'prefix',
      path: '/dsh-vision',
      handler: (req: IncomingMessage, res: ServerResponse) => {
        const pathname = new URL(req.url ?? '/', 'http://x').pathname
        const base = pathname.split('/').pop() ?? ''
        const target = lastScreenshotPath !== undefined && basename(lastScreenshotPath) === base
          ? lastScreenshotPath
          : undefined
        if (target === undefined) {
          res.writeHead(404)
          res.end()
          return
        }
        const stream = createReadStream(target)
        stream.on('error', () => {
          res.writeHead(404)
          res.end()
        })
        res.writeHead(200, { 'content-type': 'image/png' })
        stream.pipe(res)
      },
    })
  }

  ctx.systemPrompt.section({
    name: 'tool:vision',
    order: 120,
    text: 'To inspect what is on screen, call take_screenshot (fullscreen/window/region/interactive), '
      + 'then analyze_image on the returned path. analyze_image returns only text: the configured '
      + 'external vision channel describes the image; the model itself cannot see it.',
  })

  ctx.tools.register(defineTool({
    name: 'take_screenshot',
    description: 'Capture the screen and return a PNG path the recognition tool can read. '
      + 'mode=fullscreen captures the primary display; mode=window requires window_id from list_windows; '
      + 'mode=region captures a rectangle (x, y, width, height); mode=interactive asks the user to select a region. '
      + 'mode=android captures a connected Android device/emulator via adb (any host); '
      + 'mode=ios captures the booted iOS simulator via xcrun (macOS host). '
      + 'Host capture works on macOS (screencapture), Windows (PowerShell) and Linux (ImageMagick); on macOS the first use may require Screen Recording permission.',
    parameters: {
      mode: {
        type: 'string',
        required: true,
        enum: ['fullscreen', 'window', 'region', 'interactive', 'android', 'ios'],
        description: 'What to capture: fullscreen, an existing window, a rectangle region, an interactive user selection, an Android device/emulator (adb), or the booted iOS simulator (macOS).',
      },
      window_id: { type: 'number', description: 'Required for mode=window; a window id from list_windows.' },
      device: { type: 'string', description: 'adb serial from `adb devices` (mode=android); required when several devices are online.' },
      x: { type: 'number', description: 'Region left edge in screen points (mode=region).' },
      y: { type: 'number', description: 'Region top edge in screen points (mode=region).' },
      width: { type: 'number', description: 'Region width in screen points (mode=region).' },
      height: { type: 'number', description: 'Region height in screen points (mode=region).' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          path: { type: 'string', required: true },
          width: { type: 'number', required: true },
          height: { type: 'number', required: true },
          mode: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `Captured ${value.mode} screenshot: ${value.path} (${value.width}x${value.height})`,
      }],
    },
    async execute(args: ScreenshotArgs, exec: ToolRunContext) {
      const policy = sessionShellPolicy(ctx, exec)
      const precomputed = join(tmpdir(), `dsh-vision-${Date.now()}.png`)
      const command = buildScreenshotCommand(args, precomputed)
      const result = await ctx.shell.run(ctx.shell.resolve({
        command,
        timeoutMs: 90000,
        signal: exec.signal,
        ...policy !== undefined ? { sandboxPolicy: policy } : {},
      }))
      if (result.aborted) throw abortedError()
      if (result.exitCode !== 0) {
        const stderr = result.stderr.text.trim()
        const missing = /command not found|not recognized|not found/i.test(stderr)
        const multipleDevices = /more than one device/i.test(stderr)
        const hint = missing
          ? args.mode === 'android' || args.mode === 'ios'
            ? deviceCaptureHint(args.mode)
            : captureDependencyHint(currentPlatform())
          : multipleDevices
            ? '; multiple adb devices are online; pass device=<serial> from `adb devices`'
            : /permission|screen recording/i.test(stderr)
              ? '; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)'
              : ''
        throw new Error(`screen capture failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}${hint}`)
      }
      const path = shellOutputPath(result.stdout.text, currentPlatform(), precomputed)
      const size = await imageSizeOf(ctx, path, exec.signal, policy)
      lastScreenshotPath = path
      return { path, width: size.width, height: size.height, mode: args.mode }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'list_windows',
    description: 'List on-screen windows with their id, owning app, and title. '
      + 'Use an id as window_id for take_screenshot mode=window (works on macOS, Windows and Linux X11).',
    parameters: {},
    output: {
      schema: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'number', required: true },
            app: { type: 'string', required: true },
            title: { type: 'string', required: true },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: (value as WindowEntry[]).map(w => `${w.id}\t${w.app}\t${w.title}`).join('\n') || '(no windows)',
      }],
    },
    async execute(_args: Record<string, never>, exec: ToolRunContext) {
      return listWindowsViaShell(ctx, exec.signal, undefined, sessionShellPolicy(ctx, exec))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'analyze_image',
    description: 'Submit an image to the configured external vision channel and return a plain-text description. '
      + 'Pass image_path, or omit it to use the most recent take_screenshot result. The result is text only — the model cannot see the image directly. '
      + 'Unlike read_image (which feeds the current session model), analyze_image uses the vision settings (Settings → Plugins → Vision).',
    parameters: {
      image_path: { type: 'string', description: 'Path to a PNG/JPEG file. Omit to use the most recent take_screenshot result.' },
      prompt: { type: 'string', description: 'Instruction for the vision model; defaults to a general description.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          channel: { type: 'string', required: true },
          model: { type: 'string', required: true },
          description: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.description }],
    },
    async execute(args: AnalyzeImageArgs, exec: ToolRunContext) {
      const cfg = current()
      if (!cfg.enabled) {
        throw new Error('vision is disabled (settings vision.enabled is false); enable it in Settings → Plugins → Vision')
      }
      const channel = channels[cfg.channel]
      if (channel === undefined) {
        throw new Error(`unknown vision channel "${cfg.channel}"; registered: ${Object.keys(channels).join(', ')}`)
      }
      const imagePath = args.image_path ?? lastScreenshotPath
      if (imagePath === undefined) {
        throw new Error('no image: pass image_path or call take_screenshot first')
      }
      const prepared = await prepareImage(ctx, imagePath, exec.agent?.session.header.cwd, exec.signal, sessionShellPolicy(ctx, exec))
      const prompt = args.prompt ?? DEFAULT_PROMPT
      const description = await channel.analyze(ctx, {
        imageB64: prepared.base64,
        mime: prepared.mime,
        prompt,
        config: cfg,
        signal: exec.signal,
      })
      return { channel: cfg.channel, model: cfg.model, description }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'view_image',
    description: 'One-shot "look at this": capture the screen (or use image_path) and return the external vision channel\'s '
      + 'plain-text description. A convenience fusion of take_screenshot + analyze_image. The result is text only — the model '
      + 'cannot see the image directly.',
    parameters: {
      image_path: { type: 'string', description: 'Path to a PNG/JPEG file. Omit to capture the screen instead.' },
      mode: {
        type: 'string',
        enum: ['fullscreen', 'window', 'region', 'interactive', 'android', 'ios'],
        description: 'Capture mode when image_path is omitted (default fullscreen).',
      },
      window_id: { type: 'number', description: 'Required for mode=window; a window id from list_windows.' },
      device: { type: 'string', description: 'adb serial from `adb devices` (mode=android); required when several devices are online.' },
      x: { type: 'number', description: 'Region left edge in screen points (mode=region).' },
      y: { type: 'number', description: 'Region top edge in screen points (mode=region).' },
      width: { type: 'number', description: 'Region width in screen points (mode=region).' },
      height: { type: 'number', description: 'Region height in screen points (mode=region).' },
      prompt: { type: 'string', description: 'Instruction for the vision model; defaults to a general description.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          source: { type: 'string', required: true },
          path: { type: 'string', required: true },
          channel: { type: 'string', required: true },
          model: { type: 'string', required: true },
          description: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.source === 'screenshot'
          ? `${value.description}\n[view-image: /dsh-vision/${value.path.split('/').pop()}]`
          : value.description,
      }],
    },
    async execute(args: ViewImageArgs, exec: ToolRunContext) {
      const cfg = current()
      if (!cfg.enabled) {
        throw new Error('vision is disabled (settings vision.enabled is false); enable it in Settings → Plugins → Vision')
      }
      const channel = channels[cfg.channel]
      if (channel === undefined) {
        throw new Error(`unknown vision channel "${cfg.channel}"; registered: ${Object.keys(channels).join(', ')}`)
      }
      let path: string
      let source: 'image' | 'screenshot'
      if (args.image_path !== undefined) {
        source = 'image'
        path = args.image_path
      } else {
        source = 'screenshot'
        const policy = sessionShellPolicy(ctx, exec)
        const precomputed = join(tmpdir(), `dsh-vision-${Date.now()}.png`)
        const shotArgs: ScreenshotArgs = { mode: args.mode ?? 'fullscreen' }
        if (args.window_id !== undefined) shotArgs.window_id = args.window_id
        if (args.device !== undefined) shotArgs.device = args.device
        if (args.x !== undefined) shotArgs.x = args.x
        if (args.y !== undefined) shotArgs.y = args.y
        if (args.width !== undefined) shotArgs.width = args.width
        if (args.height !== undefined) shotArgs.height = args.height
        const shot = await ctx.shell.run(ctx.shell.resolve({
          command: buildScreenshotCommand(shotArgs, precomputed),
          timeoutMs: 90000,
          signal: exec.signal,
          ...policy !== undefined ? { sandboxPolicy: policy } : {},
        }))
        if (shot.aborted) throw abortedError()
        if (shot.exitCode !== 0) {
          const stderr = shot.stderr.text.trim()
          const missing = /command not found|not recognized|not found/i.test(stderr)
          const multipleDevices = /more than one device/i.test(stderr)
          const hint = missing
            ? shotArgs.mode === 'android' || shotArgs.mode === 'ios'
              ? deviceCaptureHint(shotArgs.mode)
              : captureDependencyHint(currentPlatform())
            : multipleDevices
              ? '; multiple adb devices are online; pass device=<serial> from `adb devices`'
              : /permission|screen recording/i.test(stderr)
                ? '; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)'
                : ''
          throw new Error(`screen capture failed (exit ${shot.exitCode}): ${stderr || shot.stdout.text.trim()}${hint}`)
        }
        path = shellOutputPath(shot.stdout.text, currentPlatform(), precomputed)
        lastScreenshotPath = path
      }
      const prepared = await prepareImage(ctx, path, exec.agent?.session.header.cwd, exec.signal, sessionShellPolicy(ctx, exec))
      const description = await channel.analyze(ctx, {
        imageB64: prepared.base64,
        mime: prepared.mime,
        prompt: args.prompt ?? DEFAULT_PROMPT,
        config: cfg,
        signal: exec.signal,
      })
      return { source, path, channel: cfg.channel, model: cfg.model, description }
    },
  }))
}

export { VISION_MODELS } from './channels/gpt/index.ts'
export type { VisionCall, VisionChannel } from './channels/index.ts'
