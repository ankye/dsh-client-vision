/**
 * The recognition-channel contract: one `analyze` implementation per backend.
 *
 * Each channel lives in its own folder under `channels/` so it can later be
 * extracted into a separate package or composition row without touching the
 * tool definitions.
 * @module @deepseek-ai/dsh-tool-vision/channels
 */
import type { Context } from '@deepseek-ai/cordis';
import type { VisionConfig } from '../index.ts';
/** One call the active channel must serve. */
export interface VisionCall {
    /** Base64-encoded image bytes (already downscaled). */
    imageB64: string;
    /** MIME type of the encoded image. */
    mime: string;
    /** Instruction for the vision model. */
    prompt: string;
    /** The active section. */
    config: VisionConfig;
    /** Cancellation signal forwarded to the HTTP call. */
    signal?: AbortSignal;
}
/** One recognition backend: an `analyze` that returns plain text. */
export interface VisionChannel {
    /** Human-readable channel name. */
    label: string;
    /** Submit the image and return the model's plain-text answer. */
    analyze(ctx: Context, call: VisionCall): Promise<string>;
}
//# sourceMappingURL=types.d.ts.map