/**
 * Image preparation: downscale the long edge and re-encode as JPEG through
 * macOS `sips`, then return base64 bytes for the recognition channel.
 * @module @deepseek-ai/dsh-tool-vision/image
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-fs'
import { isAbsolute, resolve as resolvePath } from 'node:path'

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
): Promise<PreparedImage> {
  // Resolve a relative image path against the session cwd, and run the shell
  // command from that cwd so both sips and the fs seam agree on the identity.
  const resolvedPath = isAbsolute(imagePath) ? imagePath : resolvePath(cwd ?? '', imagePath)
  const outPath = `/tmp/dsh-vision-img-${Date.now()}.jpg`
  const command = `sips -Z ${MAX_EDGE} -s format jpeg -s formatOptions ${JPEG_QUALITY} '${resolvedPath}' --out '${outPath}'`
  const result = await ctx.shell.run(ctx.shell.resolve({
    command,
    ...cwd !== undefined ? { workdir: cwd } : {},
    timeoutMs: 30000,
    signal,
  }))
  if (result.exitCode !== 0) {
    throw new Error(`image preparation failed for ${imagePath} (exit ${result.exitCode}): ${result.stderr.text.trim() || result.stdout.text.trim()}`)
  }
  const target = await ctx.fs.resolve(outPath, signal === undefined ? {} : { signal })
  const bytes = await ctx.fs.readBytes(target, signal, MAX_BYTES)
  const size = await imageSizeOf(ctx, outPath, signal)
  return { base64: Buffer.from(bytes).toString('base64'), mime: 'image/jpeg', width: size.width, height: size.height }
}

/** Read a PNG/JPEG's pixel dimensions through `sips`. */
export async function imageSizeOf(
  ctx: Context,
  path: string,
  signal?: AbortSignal,
): Promise<{ width: number; height: number }> {
  const result = await ctx.shell.run(ctx.shell.resolve({
    command: `sips -g pixelWidth -g pixelHeight '${path}'`,
    timeoutMs: 15000,
    signal,
  }))
  const text = result.stdout.text
  return { width: dimensionOf(text, 'pixelWidth'), height: dimensionOf(text, 'pixelHeight') }
}

/** Parse one `key: N` dimension line from `sips -g`. */
function dimensionOf(text: string, key: string): number {
  const match = text.match(new RegExp(`${key}:\\s*(\\d+)`))
  return match === null ? 0 : Number(match[1])
}
