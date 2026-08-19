/**
 * Pure constants and validation for the Zhipu channel. Dependency-free so the
 * shapes are unit-testable standalone (node:test).
 * @module @deepseek-ai/dsh-tool-vision/channels/zhipu/request
 */
/** Models the Zhipu API serves for vision. */
export declare const ZHIPU_MODELS: readonly ["glm-4v-plus", "glm-4v-flash"];
/** Default Zhipu endpoint prefix; `/chat/completions` is appended. */
export declare const ZHIPU_DEFAULT_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
/**
 * Validate the configured endpoint, returning it trimmed of trailing slashes.
 * @param baseUrl - the configured endpoint, possibly blank.
 * @returns the endpoint with no trailing slash.
 * @throws when no endpoint is configured.
 */
export declare function requireZhipuEndpoint(baseUrl: string | undefined): string;
//# sourceMappingURL=request.d.ts.map