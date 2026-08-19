/**
 * The `ollama` local channel: a native `POST /api/chat` call to a local
 * Ollama server (default http://localhost:11434). No API key — the model runs
 * on the machine. Accepts any installed vision model (`llava`,
 * `llava-llama3`, `bakllava`, `moondream`, `qwen2-vl`, `minicpm-v`, …).
 * @module @deepseek-ai/dsh-tool-vision/channels/ollama
 */
import type { Context } from '@deepseek-ai/cordis';
import type { VisionCall } from '../types.ts';
export { OLLAMA_DEFAULT_BASE_URL, OLLAMA_DEFAULT_MODEL, OLLAMA_MODELS } from './request.ts';
/**
 * Run one vision call against a local Ollama server.
 * @param _ctx - plugin context (unused: no credentials involved).
 * @param call - the prepared image and the active section.
 * @returns the model's plain-text answer.
 */
export declare function ollamaAnalyze(_ctx: Context, call: VisionCall): Promise<string>;
//# sourceMappingURL=index.d.ts.map