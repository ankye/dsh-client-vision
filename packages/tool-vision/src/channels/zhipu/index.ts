/**
 * The `zhipu` channel: Zhipu GLM-4V (OpenAI-compatible
 * `POST /chat/completions`, image_url data URL). The request shape is
 * identical to the `gpt` channel, so this channel reuses `gptAnalyze` and
 * only adds its endpoint check.
 *
 * Default endpoint: https://open.bigmodel.cn/api/paas/v4
 * @module @deepseek-ai/dsh-tool-vision/channels/zhipu
 */

import { gptAnalyze } from '../gpt/index.ts'
import type { VisionCall } from '../types.ts'
import { requireZhipuEndpoint } from './request.ts'

export { ZHIPU_DEFAULT_BASE_URL, ZHIPU_MODELS } from './request.ts'

/**
 * Run one vision call against Zhipu. Shares the OpenAI-compatible request
 * with the gpt channel; the endpoint is checked here so a missing baseUrl
 * fails with an actionable message instead of a fetch on a relative URL.
 * @param ctx - plugin context supplying the credentials seam.
 * @param call - the prepared image and the active section.
 * @returns the model's plain-text answer.
 */
export async function zhipuAnalyze(ctx: Parameters<typeof gptAnalyze>[0], call: VisionCall): Promise<string> {
  requireZhipuEndpoint(call.config.baseUrl)
  return gptAnalyze(ctx, call)
}
