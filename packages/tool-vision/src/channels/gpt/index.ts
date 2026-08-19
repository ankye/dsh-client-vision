/**
 * The `gpt` recognition channel: an OpenAI-compatible vision request with a
 * `data:` image URL, mirroring the repo's own LLM adapters (native `fetch`,
 * Bearer auth, structured error handling). The key is resolved from the
 * credentials service at call time.
 * @module @deepseek-ai/dsh-tool-vision/channels/gpt
 */

import type { Context } from '@deepseek-ai/cordis'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-credentials'
import type { VisionCall } from '../types.ts'
import { abortedError, isAbortError } from '../../abort.ts'

/** Models the OpenAI-compatible gateway exposes for vision. */
export const VISION_MODELS = ['gpt-5.5', 'gpt-5.6-sol', 'gpt-5.6-terra'] as const

/** Attribution header sent on every request. */
const USER_AGENT = 'deepseek-harness/0.0.1'

/** Upper bound on generated tokens for the vision request. */
const DEFAULT_MAX_TOKENS = 1024

/** Minimal OpenAI chat-completion response shape this channel reads. */
interface ChatCompletionResponse {
  choices?: readonly {
    message?: { content?: unknown }
  }[]
}

/**
 * Run one vision call against the OpenAI-compatible endpoint named by the
 * active section.
 * @param ctx - plugin context supplying the credentials seam.
 * @param call - the prepared image and the active section.
 * @returns the model's plain-text answer.
 */
export async function gptAnalyze(ctx: Context, call: VisionCall): Promise<string> {
  const { config, imageB64, mime, prompt, signal } = call
  const apiKey = await resolveApiKey(ctx, config.apiKeyEnv, signal)
  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`
  const body = {
    model: config.model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${imageB64}` } },
      ],
    }],
    max_tokens: DEFAULT_MAX_TOKENS,
    temperature: 0,
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'error',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify(body),
      ...signal !== undefined ? { signal } : {},
    })
  } catch (error: unknown) {
    if (signal?.aborted === true || isAbortError(error)) throw abortedError()
    throw new Error(`vision request failed: ${String(error)}`)
  }

  if (!response.ok) {
    const status = response.status
    let message = `vision API error (HTTP ${status})`
    try {
      const parsed = await response.json() as {
        error?: { message?: string } | string
        message?: string
      }
      const detail = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message ?? parsed.message
      if (detail !== undefined && detail.length > 0) message = detail
    } catch {
      // The HTTP status message stands; a non-JSON error body (gateway 5xx/429)
      // cannot cost the real error.
    }
    throw new Error(message)
  }

  let payload: ChatCompletionResponse
  try {
    payload = await response.json() as ChatCompletionResponse
  } catch (error: unknown) {
    if (signal?.aborted === true || isAbortError(error)) throw abortedError()
    throw new Error(`vision API returned an unprocessable response: ${String(error)}`)
  }

  const text = payload.choices?.[0]?.message?.content
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('vision API returned no text content')
  }
  return text
}

/**
 * Resolve the API key for one call through the credentials service.
 * @param ctx - plugin context.
 * @param apiKeyEnv - the credential reference the section names.
 * @param signal - caller cancellation signal.
 * @returns the key.
 */
async function resolveApiKey(ctx: Context, apiKeyEnv: string, signal?: AbortSignal): Promise<string> {
  if (signal?.aborted === true) throw abortedError()
  const credentials = ctx.get('credentials')
  if (credentials === undefined) {
    throw new Error(`vision has no credentials service; store the key for "${apiKeyEnv}" through the credentials service`)
  }
  const resolved = await credentials.resolve(credentialRef(apiKeyEnv))
  if (resolved !== undefined && resolved.value.length > 0) return resolved.value
  throw new Error(`vision has no API key for "${apiKeyEnv}"; set it in Settings → Plugins → Vision`)
}
