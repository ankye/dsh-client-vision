/**
 * The channel registry: maps the `vision.channel` setting to one backend.
 * Adding a channel is one folder under `channels/<id>/` plus one registry
 * entry — the tool schemas never change.
 * @module @deepseek-ai/dsh-tool-vision/channels
 */
import { gptAnalyze } from "./gpt/index.js";
/** Registered recognition channels, keyed by the `vision.channel` setting. */
export const channels = {
    gpt: { label: 'GPT', analyze: gptAnalyze },
};
//# sourceMappingURL=index.js.map