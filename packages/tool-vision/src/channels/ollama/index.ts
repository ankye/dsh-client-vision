/**
 * The `ollama` local channel: a native `POST /api/chat` call to a local
 * Ollama server (default http://localhost:11434). No API key — the model runs
 * on the machine. Accepts any installed vision model (`llava`,
 * `llava-llama3`, `bakllava`, `moondream`, `qwen2-vl`, `minicpm-v`, …).
 * @module @deepseek-ai/dsh-tool-vision/channels/ollama
 */

import type { Context } from '@deepseek-ai/cordis'
import type { VisionCall } from '../types.ts'
import { abortedError, isAbortError } from '../../abort.ts'
import { buildOllamaChatBody, ollamaAnswerOf, resolveOllamaEndpoint } from './request.ts'

export { OLLAMA_DEFAULT_BASE_URL, OLLAMA_DEFAULT_MODEL, OLLAMA_MODELS } from './request.ts'

/** Minimal Ollama chat response this channel reads. */
interface OllamaChatResponse {
  message?: { content?: unknown }
  error?: unknown
}

/**
 * Run one vision call against a local Ollama server.
 * @param _ctx - plugin context (unused: no credentials involved).
 * @param call - the prepared image and the active section.
 * @returns the model's plain-text answer.
 */
export async function ollamaAnalyze(_ctx: Context, call: VisionCall): Promise<string> {
  const { config, imageB64, prompt, signal } = call
  const baseUrl = resolveOllamaEndpoint(config.baseUrl)
  const body = buildOllamaChatBody(config.model, prompt, imageB64)

  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      redirect: 'error',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      ...signal !== undefined ? { signal } : {},
    })
  } catch (error: unknown) {
    if (signal?.aborted === true || isAbortError(error)) throw abortedError()
    throw new Error(`ollama request failed (is the Ollama server running at ${baseUrl}?): ${String(error)}`)
  }

  let payload: OllamaChatResponse
  try {
    payload = await response.json() as OllamaChatResponse
  } catch (error: unknown) {
    if (signal?.aborted === true || isAbortError(error)) throw abortedError()
    throw new Error(`ollama returned an unprocessable response (HTTP ${response.status}): ${String(error)}`)
  }

  if (!response.ok) {
    const detail = typeof payload.error === 'string' && payload.error.length > 0
      ? payload.error
      : `HTTP ${response.status}`
    throw new Error(`ollama request failed: ${detail}`)
  }

  return ollamaAnswerOf(payload)
}
