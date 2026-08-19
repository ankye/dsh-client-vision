/**
 * Image preparation: downscale the long edge and re-encode as JPEG through
 * macOS `sips`, then return base64 bytes for the recognition channel.
 * @module @deepseek-ai/dsh-tool-vision/image
 */
import type { Context } from '@deepseek-ai/cordis';
/** A prepared image ready for a channel call. */
export interface PreparedImage {
    /** Base64-encoded JPEG bytes. */
    base64: string;
    /** MIME type of the encoded bytes (`image/jpeg`). */
    mime: string;
    /** Pixel width of the prepared image. */
    width: number;
    /** Pixel height of the prepared image. */
    height: number;
}
/**
 * Downscale/re-encode one image file and return it base64-encoded.
 * @param ctx - plugin context supplying the fs and shell seams.
 * @param imagePath - the image file path (sandbox-resolved against `cwd`).
 * @param cwd - the agent's session cwd, for relative paths.
 * @param signal - caller cancellation signal.
 * @returns the prepared image.
 */
export declare function prepareImage(ctx: Context, imagePath: string, cwd: string | undefined, signal?: AbortSignal): Promise<PreparedImage>;
/** Read a PNG/JPEG's pixel dimensions through `sips`. */
export declare function imageSizeOf(ctx: Context, path: string, signal?: AbortSignal): Promise<{
    width: number;
    height: number;
}>;
//# sourceMappingURL=image.d.ts.map