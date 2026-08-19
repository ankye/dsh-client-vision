/**
 * The `gpt` recognition channel: an OpenAI-compatible vision request with a
 * `data:` image URL, mirroring the repo's own LLM adapters (native `fetch`,
 * Bearer auth, structured error handling). The key is resolved from the
 * credentials service at call time.
 * @module @deepseek-ai/dsh-tool-vision/channels/gpt
 */
import type { Context } from '@deepseek-ai/cordis';
import type { VisionCall } from '../types.ts';
/** Models the OpenAI-compatible gateway exposes for vision. */
export declare const VISION_MODELS: readonly ["gpt-5.5", "gpt-5.6-sol", "gpt-5.6-terra"];
/**
 * Run one vision call against the OpenAI-compatible endpoint named by the
 * active section.
 * @param ctx - plugin context supplying the credentials seam.
 * @param call - the prepared image and the active section.
 * @returns the model's plain-text answer.
 */
export declare function gptAnalyze(ctx: Context, call: VisionCall): Promise<string>;
//# sourceMappingURL=index.d.ts.map