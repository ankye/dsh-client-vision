/**
 * The vision card's staged form over the `vision` settings namespace.
 *
 * The API key is the one control that does not live in the section: its
 * literal never rides a response, so the card learns only whether one is
 * configured and writes it through the credentials domain, addressed by the
 * reference the section names. Channel and model are enum selects, so adding a
 * recognition channel later is one option here and one section value.
 */
import { CardForm, selectField, textField, } from "./card-form.js";
/** Namespace of the vision capability. Spelled here rather than imported. */
export const VISION_NS = 'vision';
/** Credential reference the provider resolves when the section names none. */
export const DEFAULT_API_KEY_REF = 'VISION_GPT_API_KEY';
/** Channel assumed while the section carries none. */
export const DEFAULT_CHANNEL = 'gpt';
/** Recognition channels offered by the current host package. */
export const VISION_CHANNELS = ['gpt', 'zhipu', 'ollama'];
/**
 * Models offered per channel (aligned with the host package's model lists).
 * The model control is free-text; these lists drive the dropdown options and
 * switch with the selected channel.
 */
export const VISION_MODEL_LISTS = {
    gpt: ['gpt-5.5', 'gpt-5.6-sol', 'gpt-5.6-terra'],
    zhipu: ['glm-4v-plus', 'glm-4v-flash'],
    ollama: ['llava', 'llava-llama3', 'bakllava', 'moondream', 'qwen2-vl', 'minicpm-v'],
};
/** Form field the credential control stages under. */
const API_KEY_FIELD = 'apiKey';
/** Bridges the `vision` scope and the credentials domain onto the card. */
export class VisionCardController {
    scope;
    credentials;
    form;
    store;
    credential = { ref: '', configured: false, writable: true };
    /**
     * @param scope - the bound settings scope for the `vision` namespace.
     * @param credentials - Remote face used for the credential the section references.
     */
    constructor(scope, credentials) {
        this.scope = scope;
        this.credentials = credentials;
        this.form = new CardForm(scope, [selectField('channel', VISION_CHANNELS), textField('baseUrl'), textField('model')], [{ field: API_KEY_FIELD, write: text => this.writeKey(text) }]);
        this.store = this.form.bind(() => this.projection());
        scope.subscribe(() => { void this.readCredential(); });
        void this.readCredential();
    }
    projection() {
        const channel = this.form.field('channel').text || DEFAULT_CHANNEL;
        return {
            ...this.form.shell(),
            channel: this.form.field('channel'),
            baseUrl: this.form.field('baseUrl'),
            model: this.form.field('model'),
            apiKey: this.form.field(API_KEY_FIELD),
            apiKeyConfigured: this.credential.configured,
            apiKeyWritable: channel === 'ollama' ? false : this.credential.writable,
            modelOptions: VISION_MODEL_LISTS[channel] ?? VISION_MODEL_LISTS.gpt ?? [],
            keyVisible: channel !== 'ollama',
        };
    }
    /**
     * Ask the credentials domain about the reference the section currently names.
     *
     * The answer is stored with the reference it describes: `apiKeyEnv` can
     * change between the request and its response, and two reads can settle out
     * of order, so a response is published only while it still answers for the
     * reference in force.
     */
    async readCredential() {
        const ref = refOf(this.scope.getSnapshot());
        if (ref !== this.credential.ref) {
            // A new reference knows nothing yet; keeping the old answer would claim
            // the key is configured under a name nobody has checked.
            this.credential = { ref, configured: false, writable: true };
            this.store.set(this.projection());
        }
        let response;
        try {
            response = await this.credentials.describe([ref]);
        }
        catch (_credentialReadFailure) {
            // The card stays usable without this: the key control simply reports the
            // last state it knew, and a write still reaches the Host.
            return;
        }
        if (!response.ok || ref !== refOf(this.scope.getSnapshot()))
            return;
        const view = response.value[ref];
        const next = {
            ref,
            configured: view?.configured ?? false,
            // An unknown reference is treated as writable: the control stays usable
            // and the Host is what refuses, rather than the card guessing a refusal.
            writable: view?.writable ?? true,
        };
        if (next.configured === this.credential.configured && next.writable === this.credential.writable)
            return;
        this.credential = next;
        this.store.set(this.projection());
    }
    /**
     * Re-read after the Host reports a change to the reference this card watches.
     * @param ref - the reference the Host reports as changed.
     */
    refreshCredential(ref) {
        if (ref !== this.credential.ref)
            return;
        void this.readCredential();
    }
    /**
     * Build the face the card's slot registration injects.
     * @returns the card's snapshot and its form actions.
     */
    inject() {
        return { hooks: { visionCard: this.store }, ...this.form.actions() };
    }
    /**
     * Write the staged key, then re-read whether the Host now holds one.
     * @param value - the staged credential literal.
     * @returns whether the Host reports a configured credential afterwards.
     */
    async writeKey(value) {
        try {
            await this.credentials.set(refOf(this.scope.getSnapshot()), value);
        }
        catch (_credentialWriteFailure) {
            // Refusals surface through the re-read below: the Host is the only
            // authority on whether the key now exists.
        }
        await this.readCredential();
        return this.credential.configured;
    }
}
/**
 * The credential reference the section names, or the provider's default.
 * @param snapshot - the current scope snapshot.
 * @returns the reference to address.
 */
function refOf(snapshot) {
    const declared = snapshot.value?.apiKeyEnv;
    return declared !== undefined && declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
}
//# sourceMappingURL=vision-card-controller.js.map