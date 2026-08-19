/**
 * Pure request construction for the Ollama channel. Kept dependency-free so
 * the command shapes are unit-testable standalone (node:test).
 * @module @deepseek-ai/dsh-tool-vision/channels/ollama/request
 */
/** Default local endpoint when none is configured. */
export declare const OLLAMA_DEFAULT_BASE_URL = "http://localhost:11434";
/** Default model when none is configured. */
export declare const OLLAMA_DEFAULT_MODEL = "llava";
/** Vision-capable models Ollama commonly serves (free-text entry also works). */
export declare const OLLAMA_MODELS: readonly ["llava", "llava-llama3", "bakllava", "moondream", "qwen2-vl", "minicpm-v"];
/**
 * Resolve the effective Ollama endpoint (trailing slashes trimmed; falls back
 * to the local default).
 * @param baseUrl - the configured endpoint, possibly blank.
 * @returns the endpoint with no trailing slash.
 */
export declare function resolveOllamaEndpoint(baseUrl: string | undefined): string;
/**
 * Build the `/api/chat` request body. The image travels as a bare base64
 * string in the `images` array (Ollama's format, not a data URL).
 * @param model - the model name (blank falls back to the default).
 * @param prompt - the user instruction.
 * @param imageB64 - base64-encoded image bytes.
 * @returns the JSON body.
 */
export declare function buildOllamaChatBody(model: string | undefined, prompt: string, imageB64: string): unknown;
/**
 * Extract the plain-text answer from an Ollama `/api/chat` payload.
 * @param payload - the parsed response.
 * @returns the trimmed answer.
 */
export declare function ollamaAnswerOf(payload: unknown): string;
//# sourceMappingURL=request.d.ts.map