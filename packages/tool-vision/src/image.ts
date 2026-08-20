/**
 * Image preparation: downscale the long edge and re-encode as JPEG through the
 * platform image backend, then return base64 bytes for the recognition channel.
 * @module @deepseek-ai/dsh-tool-vision/image
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-fs'
import type { SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox'
import { basename, isAbsolute, join, resolve as resolvePath } from 'node:path'
import { tmpdir } from 'node:os'
import { currentPlatform, shellOutputPath, type CapturePlatform } from './capture.ts'

/** Long-edge cap applied before submission (control gateway payload size). */
const MAX_EDGE = 1568

/** JPEG quality for the prepared image. */
const JPEG_QUALITY = 80

/** Upper bound on prepared image bytes read back from disk. */
const MAX_BYTES = 12 * 1024 * 1024

/** A prepared image ready for a channel call. */
export interface PreparedImage {
  /** Base64-encoded JPEG bytes. */
  base64: string
  /** MIME type of the encoded bytes (`image/jpeg`). */
  mime: string
  /** Pixel width of the prepared image. */
  width: number
  /** Pixel height of the prepared image. */
  height: number
}

/** Quote one path for the shell that serves the current platform. */
function quotePath(path: string, platform: CapturePlatform): string {
  return platform === 'win32'
    ? `'${path.replace(/'/g, "''")}'`
    : `'${path.replace(/'/g, "'\\''")}'`
}

/** Build the platform-native resize and JPEG encoding command. */
export function buildImagePreparationCommand(
  imagePath: string,
  outPath: string,
  platform: CapturePlatform = currentPlatform(),
): string {
  const input = quotePath(imagePath, platform)
  const output = quotePath(outPath, platform)
  switch (platform) {
    case 'darwin':
      return `sips -Z ${MAX_EDGE} -s format jpeg -s formatOptions ${JPEG_QUALITY} ${input} --out ${output}`
    case 'win32':
      // The confined shell may write only its private temp, so save there and
      // echo the path for the caller to read back.
      return `Add-Type -AssemblyName System.Drawing; $ErrorActionPreference='Stop'; `
        + `$p=Join-Path $env:TEMP '${basename(outPath)}'; `
        + `$src=$null; $bitmap=$null; $graphics=$null; $params=$null; `
        + `try { $src=[System.Drawing.Image]::FromFile(${input}); `
        + `$edge=[Math]::Max($src.Width,$src.Height); `
        + `$scale=[Math]::Min([double]1,[double]${MAX_EDGE}/$edge); `
        + `$width=[Math]::Max(1,[int][Math]::Round($src.Width*$scale)); `
        + `$height=[Math]::Max(1,[int][Math]::Round($src.Height*$scale)); `
        + `$bitmap=New-Object System.Drawing.Bitmap $width,$height; `
        + `$graphics=[System.Drawing.Graphics]::FromImage($bitmap); `
        + `$graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; `
        + `$graphics.DrawImage($src,0,0,$width,$height); `
        + `$encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }; `
        + `if ($null -eq $encoder) { throw 'JPEG encoder is unavailable' }; `
        + `$params=New-Object System.Drawing.Imaging.EncoderParameters 1; `
        + `$params.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]${JPEG_QUALITY}); `
        + `$bitmap.Save($p,$encoder,$params) } finally { `
        + `if ($null -ne $params) { $params.Dispose() }; `
        + `if ($null -ne $graphics) { $graphics.Dispose() }; `
        + `if ($null -ne $bitmap) { $bitmap.Dispose() }; `
        + `if ($null -ne $src) { $src.Dispose() } }; `
        + `Write-Output $p`
    default:
      return `convert ${input} -resize '${MAX_EDGE}x${MAX_EDGE}>' -quality ${JPEG_QUALITY} ${output}`
  }
}

/** Build the platform-native image-dimension command. */
export function buildImageSizeCommand(
  imagePath: string,
  platform: CapturePlatform = currentPlatform(),
): string {
  const input = quotePath(imagePath, platform)
  switch (platform) {
    case 'darwin':
      return `sips -g pixelWidth -g pixelHeight ${input}`
    case 'win32':
      return `Add-Type -AssemblyName System.Drawing; $image=[System.Drawing.Image]::FromFile(${input}); `
        + `try { Write-Output ('pixelWidth: ' + $image.Width); Write-Output ('pixelHeight: ' + $image.Height) } `
        + `finally { $image.Dispose() }`
    default:
      return `identify -format 'pixelWidth: %w\\npixelHeight: %h\\n' ${input}`
  }
}

/** Dependency hint for one platform image backend. */
function imageDependencyHint(platform: CapturePlatform): string {
  switch (platform) {
    case 'darwin': return '; requires the macOS sips utility'
    case 'win32': return '; requires Windows PowerShell with System.Drawing (built into Windows)'
    default: return '; requires ImageMagick (`convert` and `identify`)'
  }
}

/** Throw a command failure with the platform dependency context when applicable. */
function imageCommandFailure(action: string, imagePath: string, platform: CapturePlatform, result: {
  exitCode: number
  stderr: { text: string }
  stdout: { text: string }
}): never {
  const detail = result.stderr.text.trim() || result.stdout.text.trim()
  const missing = /command not found|not recognized|not found/i.test(detail)
  throw new Error(
    `${action} failed for ${imagePath} (exit ${result.exitCode}): ${detail}`
    + (missing ? imageDependencyHint(platform) : ''),
  )
}

/**
 * Downscale/re-encode one image file and return it base64-encoded.
 * @param ctx - plugin context supplying the fs and shell seams.
 * @param imagePath - the image file path (sandbox-resolved against `cwd`).
 * @param cwd - the agent's session cwd, for relative paths.
 * @param signal - caller cancellation signal.
 * @returns the prepared image.
 */
export async function prepareImage(
  ctx: Context,
  imagePath: string,
  cwd: string | undefined,
  signal?: AbortSignal,
  sandboxPolicy?: SandboxExecutionPolicy,
): Promise<PreparedImage> {
  const resolvedPath = isAbsolute(imagePath) ? imagePath : resolvePath(cwd ?? '', imagePath)
  const precomputedPath = join(tmpdir(), `dsh-vision-img-${Date.now()}.jpg`)
  const platform = currentPlatform()
  const result = await ctx.shell.run(ctx.shell.resolve({
    command: buildImagePreparationCommand(resolvedPath, precomputedPath, platform),
    ...cwd !== undefined ? { workdir: cwd } : {},
    timeoutMs: 30000,
    signal,
    ...sandboxPolicy !== undefined ? { sandboxPolicy } : {},
  }))
  if (result.exitCode !== 0) imageCommandFailure('image preparation', imagePath, platform, result)
  const outPath = shellOutputPath(result.stdout.text, platform, precomputedPath)
  const target = await ctx.fs.resolve(outPath, signal === undefined ? {} : { signal })
  const bytes = await ctx.fs.readBytes(target, signal, MAX_BYTES)
  const size = await imageSizeOf(ctx, outPath, signal, sandboxPolicy)
  return { base64: Buffer.from(bytes).toString('base64'), mime: 'image/jpeg', width: size.width, height: size.height }
}

/** Read a PNG/JPEG's pixel dimensions through the platform image backend. */
export async function imageSizeOf(
  ctx: Context,
  path: string,
  signal?: AbortSignal,
  sandboxPolicy?: SandboxExecutionPolicy,
): Promise<{ width: number; height: number }> {
  const platform = currentPlatform()
  const result = await ctx.shell.run(ctx.shell.resolve({
    command: buildImageSizeCommand(path, platform),
    timeoutMs: 15000,
    signal,
    ...sandboxPolicy !== undefined ? { sandboxPolicy } : {},
  }))
  if (result.exitCode !== 0) imageCommandFailure('image size read', path, platform, result)
  const text = result.stdout.text
  return { width: dimensionOf(text, 'pixelWidth'), height: dimensionOf(text, 'pixelHeight') }
}

/** Parse one `key: N` dimension line from a platform image backend. */
function dimensionOf(text: string, key: string): number {
  const match = text.match(new RegExp(`${key}:\\s*(\\d+)`))
  return match === null ? 0 : Number(match[1])
}
