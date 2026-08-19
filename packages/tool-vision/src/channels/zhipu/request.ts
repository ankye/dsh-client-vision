/**
 * Pure constants and validation for the Zhipu channel. Dependency-free so the
 * shapes are unit-testable standalone (node:test).
 * @module @deepseek-ai/dsh-tool-vision/channels/zhipu/request
 */

/** Models the Zhipu API serves for vision. */
export const ZHIPU_MODELS = ['glm-4v-plus', 'glm-4v-flash'] as const

/** Default Zhipu endpoint prefix; `/chat/completions` is appended. */
export const ZHIPU_DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'

/**
 * Validate the configured endpoint, returning it trimmed of trailing slashes.
 * @param baseUrl - the configured endpoint, possibly blank.
 * @returns the endpoint with no trailing slash.
 * @throws when no endpoint is configured.
 */
export function requireZhipuEndpoint(baseUrl: string | undefined): string {
  const endpoint = (baseUrl ?? '').trim().replace(/\/+$/, '')
  if (endpoint === '') {
    throw new Error(
      `zhipu has no endpoint (vision.baseUrl); set it in Settings → Plugins → Vision — e.g. ${ZHIPU_DEFAULT_BASE_URL}`,
    )
  }
  return endpoint
}
