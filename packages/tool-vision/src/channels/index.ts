/**
 * The channel registry: maps the `vision.channel` setting to one backend.
 * Adding a channel is one folder under `channels/<id>/` plus one registry
 * entry — the tool schemas never change.
 * @module @deepseek-ai/dsh-tool-vision/channels
 */

import { gptAnalyze } from './gpt/index.ts'
import type { VisionChannel } from './types.ts'

export type { VisionCall, VisionChannel } from './types.ts'

/** Registered recognition channels, keyed by the `vision.channel` setting. */
export const channels: Record<string, VisionChannel> = {
  gpt: { label: 'GPT', analyze: gptAnalyze },
}
