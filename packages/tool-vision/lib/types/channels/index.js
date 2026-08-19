/**
 * The channel registry: maps the `vision.channel` setting to one backend.
 * Adding a channel is one folder under `channels/<id>/` plus one registry
 * entry — the tool schemas never change.
 * @module @deepseek-ai/dsh-tool-vision/channels
 */
import { gptAnalyze } from "./gpt/index.js";
import { ollamaAnalyze } from "./ollama/index.js";
import { zhipuAnalyze } from "./zhipu/index.js";
export { OLLAMA_MODELS } from "./ollama/index.js";
export { ZHIPU_MODELS } from "./zhipu/index.js";
export { VISION_MODELS } from "./gpt/index.js";
/** Registered recognition channels, keyed by the `vision.channel` setting. */
export const channels = {
    gpt: { label: 'GPT', analyze: gptAnalyze },
    zhipu: { label: 'Zhipu GLM-4V', analyze: zhipuAnalyze },
    ollama: { label: 'Ollama (local)', analyze: ollamaAnalyze },
};
//# sourceMappingURL=index.js.map