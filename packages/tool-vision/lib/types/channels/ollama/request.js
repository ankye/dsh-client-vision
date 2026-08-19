/**
 * Pure request construction for the Ollama channel. Kept dependency-free so
 * the command shapes are unit-testable standalone (node:test).
 * @module @deepseek-ai/dsh-tool-vision/channels/ollama/request
 */
/** Default local endpoint when none is configured. */
export const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434';
/** Default model when none is configured. */
export const OLLAMA_DEFAULT_MODEL = 'llava';
/** Vision-capable models Ollama commonly serves (free-text entry also works). */
export const OLLAMA_MODELS = [
    'llava',
    'llava-llama3',
    'bakllava',
    'moondream',
    'qwen2-vl',
    'minicpm-v',
];
/**
 * Resolve the effective Ollama endpoint (trailing slashes trimmed; falls back
 * to the local default).
 * @param baseUrl - the configured endpoint, possibly blank.
 * @returns the endpoint with no trailing slash.
 */
export function resolveOllamaEndpoint(baseUrl) {
    return (baseUrl ?? '').trim().replace(/\/+$/, '') || OLLAMA_DEFAULT_BASE_URL;
}
/**
 * Build the `/api/chat` request body. The image travels as a bare base64
 * string in the `images` array (Ollama's format, not a data URL).
 * @param model - the model name (blank falls back to the default).
 * @param prompt - the user instruction.
 * @param imageB64 - base64-encoded image bytes.
 * @returns the JSON body.
 */
export function buildOllamaChatBody(model, prompt, imageB64) {
    return {
        model: (model ?? '').trim() || OLLAMA_DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt, images: [imageB64] }],
        stream: false,
    };
}
/**
 * Extract the plain-text answer from an Ollama `/api/chat` payload.
 * @param payload - the parsed response.
 * @returns the trimmed answer.
 */
export function ollamaAnswerOf(payload) {
    const message = payload?.message;
    const content = message?.content;
    if (typeof content !== 'string' || content.trim() === '') {
        throw new Error('ollama returned an empty answer (is the model vision-capable?)');
    }
    return content.trim();
}
//# sourceMappingURL=request.js.map