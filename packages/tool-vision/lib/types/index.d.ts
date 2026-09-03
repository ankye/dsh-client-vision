/**
 * Model-facing screen capture and external image-recognition tools.
 *
 * The tool entry points are decoupled from the recognition backend: a channel
 * registry maps the `vision.channel` setting to one `analyze()` implementation.
 * Adding a backend (Claude, Gemini, a local model) is one registry entry plus a
 * settings segment, with no tool-schema change.
 * @module @deepseek-ai/dsh-tool-vision
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "tool-vision";
/** Services this plugin consumes (all host-plane; it publishes nothing). */
export declare const inject: string[];
/** Settings namespace carrying the vision configuration. */
export declare const VISION_SETTINGS_NAMESPACE = "vision";
/** Resolved vision configuration. */
export interface VisionConfig {
    /** Active recognition channel; defaults to `gpt`. */
    channel: string;
    /** Master switch; when false the recognition tool refuses. */
    enabled: boolean;
    /** Endpoint prefix (domain and optional path); `/chat/completions` is appended. */
    baseUrl: string;
    /** Recognition model name. */
    model: string;
    /** Credential reference naming the stored API key. */
    apiKeyEnv: string;
}
/** Runtime configuration schema for the vision plugin. */
export declare const Config: z<VisionConfig>;
/**
 * Mount the vision tools and settings section.
 * @param ctx - plugin context.
 * @param config - the composed row config (schema-defaulted by Cordis).
 */
export declare function apply(ctx: Context, config: VisionConfig): void;
export { VISION_MODELS } from './channels/gpt/index.ts';
export type { VisionCall, VisionChannel } from './channels/index.ts';
//# sourceMappingURL=index.d.ts.map
