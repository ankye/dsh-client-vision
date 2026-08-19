/** Locale bundles for the vision settings card (its own namespace). */
/** Locale keys these surfaces render. */
export type VisionLocaleKey = 'title' | 'description' | 'apiKey' | 'apiKeyHint' | 'apiKeySet' | 'apiKeyUnset' | 'baseUrl' | 'baseUrlHint' | 'channel' | 'channelHint' | 'model' | 'modelHint' | 'overridden' | 'reset' | 'readOnly' | 'expand' | 'collapse' | 'save' | 'saving' | 'discard' | 'unsaved' | 'saveFailed' | 'invalidNumber';
/** English copy. */
export declare const en: Record<VisionLocaleKey, string>;
/** Simplified Chinese copy. */
export declare const zh: Record<VisionLocaleKey, string>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        vision: VisionLocaleKey;
    }
}
//# sourceMappingURL=locales.d.ts.map