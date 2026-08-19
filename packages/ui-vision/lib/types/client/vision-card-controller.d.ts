/**
 * The vision card's staged form over the `vision` settings namespace.
 *
 * The API key is the one control that does not live in the section: its
 * literal never rides a response, so the card learns only whether one is
 * configured and writes it through the credentials domain, addressed by the
 * reference the section names. Channel and model are enum selects, so adding a
 * recognition channel later is one option here and one section value.
 */
import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client';
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import { type CardActions, type CardFieldState, type CardShell } from './card-form.ts';
/** Namespace of the vision capability. Spelled here rather than imported. */
export declare const VISION_NS = "vision";
/** Credential reference the provider resolves when the section names none. */
export declare const DEFAULT_API_KEY_REF = "VISION_GPT_API_KEY";
/** Recognition channels offered by the current host package. */
export declare const VISION_CHANNELS: readonly ["gpt"];
/** Models offered by the `gpt` channel (aligned with the host's model list). */
export declare const VISION_MODELS: readonly ["gpt-5.5", "gpt-5.6-sol", "gpt-5.6-terra"];
/** The vision fields this card edits. */
export interface VisionSettings {
    /** Active recognition channel. */
    channel?: string;
    /** Endpoint prefix; `/chat/completions` is appended by the channel. */
    baseUrl?: string;
    /** Recognition model name. */
    model?: string;
    /** Credential reference naming the environment key. */
    apiKeyEnv?: string;
}
/** What the vision card renders. */
export interface VisionCardState extends CardShell {
    /** Active recognition channel. */
    channel: CardFieldState;
    /** Endpoint prefix. */
    baseUrl: CardFieldState;
    /** Recognition model. */
    model: CardFieldState;
    /** The staged credential, which starts blank on every load. */
    apiKey: CardFieldState;
    /** Whether the Host reports a credential configured for the referenced key. */
    apiKeyConfigured: boolean;
    /** Whether the credentials domain accepts a write for it; false disables the control. */
    apiKeyWritable: boolean;
}
/** The registration-side face the vision card's slot entry injects. */
export interface VisionCardFace extends CardActions {
    hooks: {
        /** Card snapshot bound by the renderer as useVisionCard. */
        visionCard: SnapshotStore<VisionCardState>;
    };
}
/** Bridges the `vision` scope and the credentials domain onto the card. */
export declare class VisionCardController {
    private readonly scope;
    private readonly api;
    private readonly form;
    private readonly store;
    private credential;
    /**
     * @param scope - the bound settings scope for the `vision` namespace.
     * @param api - wire face used for the credential the section references.
     */
    constructor(scope: SettingsScope<VisionSettings>, api: Pick<IApiClient, 'credentials'>);
    private projection;
    /**
     * Ask the credentials domain about the reference the section currently names.
     *
     * The answer is stored with the reference it describes: `apiKeyEnv` can
     * change between the request and its response, and two reads can settle out
     * of order, so a response is published only while it still answers for the
     * reference in force.
     */
    private readCredential;
    /**
     * Re-read after the Host reports a change to the reference this card watches.
     * @param ref - the reference the Host reports as changed.
     */
    refreshCredential(ref: string): void;
    /**
     * Build the face the card's slot registration injects.
     * @returns the card's snapshot and its form actions.
     */
    inject(): VisionCardFace;
    /**
     * Write the staged key, then re-read whether the Host now holds one.
     * @param value - the staged credential literal.
     * @returns whether the Host reports a configured credential afterwards.
     */
    private writeKey;
}
//# sourceMappingURL=vision-card-controller.d.ts.map