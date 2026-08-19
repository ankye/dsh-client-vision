/**
 * Shared cancellation helpers for the vision tools.
 * @module @deepseek-ai/dsh-tool-vision/abort
 */
import { HarnessError } from '@deepseek-ai/dsh-llm';
/** Build the registry-stable abort error (thrown when `exec.signal` fires). */
export declare function abortedError(): HarnessError;
/** True for a fetch/`AbortSignal` abort, surfaced as a tool abort. */
export declare function isAbortError(error: unknown): boolean;
//# sourceMappingURL=abort.d.ts.map