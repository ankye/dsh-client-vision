/**
 * Shared cancellation helpers for the vision tools.
 * @module @deepseek-ai/dsh-tool-vision/abort
 */

import { HarnessError } from '@deepseek-ai/dsh-llm'
import { TOOL_ABORTED } from '@deepseek-ai/dsh-tools'

/** Build the registry-stable abort error (thrown when `exec.signal` fires). */
export function abortedError(): HarnessError {
  const error = new HarnessError('tool call aborted', TOOL_ABORTED)
  error.name = 'AbortError'
  return error
}

/** True for a fetch/`AbortSignal` abort, surfaced as a tool abort. */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
