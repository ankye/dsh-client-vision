/**
 * The vision card's staged form over the `vision` settings namespace.
 *
 * The API key is the one control that does not live in the section: its
 * literal never rides a response, so the card learns only whether one is
 * configured and writes it through the credentials domain, addressed by the
 * reference the section names. Channel and model are enum selects, so adding a
 * recognition channel later is one option here and one section value.
 */

import type { IApiClient } from '@deepseek-ai/dsh-client-connection/client'
import type { SettingsScope, SettingsScopeSnapshot, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import {
  CardForm, selectField, textField,
  type CardActions, type CardFieldState, type CardShell,
} from './card-form.ts'

/** Namespace of the vision capability. Spelled here rather than imported. */
export const VISION_NS = 'vision'

/** Credential reference the provider resolves when the section names none. */
export const DEFAULT_API_KEY_REF = 'VISION_GPT_API_KEY'

/** Channel assumed while the section carries none. */
export const DEFAULT_CHANNEL = 'gpt'

/** Recognition channels offered by the current host package. */
export const VISION_CHANNELS = ['gpt', 'zhipu', 'ollama'] as const

/**
 * Models offered per channel (aligned with the host package's model lists).
 * The model control is free-text; these lists drive the dropdown options and
 * switch with the selected channel.
 */
export const VISION_MODEL_LISTS: Record<string, readonly string[]> = {
  gpt: ['gpt-5.5', 'gpt-5.6-sol', 'gpt-5.6-terra'],
  zhipu: ['glm-4v-plus', 'glm-4v-flash'],
  ollama: ['llava', 'llava-llama3', 'bakllava', 'moondream', 'qwen2-vl', 'minicpm-v'],
}

/** Form field the credential control stages under. */
const API_KEY_FIELD = 'apiKey'

/** The vision fields this card edits. */
export interface VisionSettings {
  /** Active recognition channel. */
  channel?: string
  /** Endpoint prefix; `/chat/completions` is appended by the channel. */
  baseUrl?: string
  /** Recognition model name. */
  model?: string
  /** Credential reference naming the environment key. */
  apiKeyEnv?: string
}

/** What the credentials domain last reported, and for which reference. */
interface CredentialState {
  /** Reference this answer describes; a stale response for another one is dropped. */
  ref: string
  /** Whether any layer supplies a value for it. */
  configured: boolean
  /** Whether `credentials.set` can affect it; false disables the control. */
  writable: boolean
}

/** What the vision card renders. */
export interface VisionCardState extends CardShell {
  /** Active recognition channel. */
  channel: CardFieldState
  /** Endpoint prefix. */
  baseUrl: CardFieldState
  /** Recognition model. */
  model: CardFieldState
  /** The staged credential, which starts blank on every load. */
  apiKey: CardFieldState
  /** Whether the Host reports a credential configured for the referenced key. */
  apiKeyConfigured: boolean
  /** Whether the credentials domain accepts a write for it; false disables the control. */
  apiKeyWritable: boolean
  /** Model options for the currently selected channel. */
  modelOptions: readonly string[]
  /** Whether the key control applies (false for keyless channels like ollama). */
  keyVisible: boolean
}

/** The registration-side face the vision card's slot entry injects. */
export interface VisionCardFace extends CardActions {
  hooks: {
    /** Card snapshot bound by the renderer as useVisionCard. */
    visionCard: SnapshotStore<VisionCardState>
  }
}

/** Bridges the `vision` scope and the credentials domain onto the card. */
export class VisionCardController {
  private readonly form: CardForm<VisionSettings>
  private readonly store: SnapshotStore<VisionCardState>
  private credential: CredentialState = { ref: '', configured: false, writable: true }

  /**
   * @param scope - the bound settings scope for the `vision` namespace.
   * @param api - wire face used for the credential the section references.
   */
  constructor(
    private readonly scope: SettingsScope<VisionSettings>,
    private readonly api: Pick<IApiClient, 'credentials'>,
  ) {
    this.form = new CardForm(
      scope,
      [selectField('channel', VISION_CHANNELS), textField('baseUrl'), textField('model')],
      [{ field: API_KEY_FIELD, write: text => this.writeKey(text) }],
    )
    this.store = this.form.bind(() => this.projection())
    scope.subscribe(() => { void this.readCredential() })
    void this.readCredential()
  }

  private projection(): VisionCardState {
    const channel = this.form.field('channel').text || DEFAULT_CHANNEL
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
    }
  }

  /**
   * Ask the credentials domain about the reference the section currently names.
   *
   * The answer is stored with the reference it describes: `apiKeyEnv` can
   * change between the request and its response, and two reads can settle out
   * of order, so a response is published only while it still answers for the
   * reference in force.
   */
  private async readCredential(): Promise<void> {
    const ref = refOf(this.scope.getSnapshot())
    if (ref !== this.credential.ref) {
      // A new reference knows nothing yet; keeping the old answer would claim
      // the key is configured under a name nobody has checked.
      this.credential = { ref, configured: false, writable: true }
      this.store.set(this.projection())
    }
    let response: Awaited<ReturnType<IApiClient['credentials']['describe']>>
    try {
      response = await this.api.credentials.describe({ refs: [ref] })
    } catch (_credentialReadFailure) {
      // The card stays usable without this: the key control simply reports the
      // last state it knew, and a write still reaches the Host.
      return
    }
    if (!response.result.ok || ref !== refOf(this.scope.getSnapshot())) return
    const view = response.result.value.credentials[ref]
    const next: CredentialState = {
      ref,
      configured: view?.configured ?? false,
      // An unknown reference is treated as writable: the control stays usable
      // and the Host is what refuses, rather than the card guessing a refusal.
      writable: view?.writable ?? true,
    }
    if (next.configured === this.credential.configured && next.writable === this.credential.writable) return
    this.credential = next
    this.store.set(this.projection())
  }

  /**
   * Re-read after the Host reports a change to the reference this card watches.
   * @param ref - the reference the Host reports as changed.
   */
  refreshCredential(ref: string): void {
    if (ref !== this.credential.ref) return
    void this.readCredential()
  }

  /**
   * Build the face the card's slot registration injects.
   * @returns the card's snapshot and its form actions.
   */
  inject(): VisionCardFace {
    return { hooks: { visionCard: this.store }, ...this.form.actions() }
  }

  /**
   * Write the staged key, then re-read whether the Host now holds one.
   * @param value - the staged credential literal.
   * @returns whether the Host reports a configured credential afterwards.
   */
  private async writeKey(value: string): Promise<boolean> {
    try {
      await this.api.credentials.set({ ref: refOf(this.scope.getSnapshot()), value })
    } catch (_credentialWriteFailure) {
      // Refusals surface through the re-read below: the Host is the only
      // authority on whether the key now exists.
    }
    await this.readCredential()
    return this.credential.configured
  }
}

/**
 * The credential reference the section names, or the provider's default.
 * @param snapshot - the current scope snapshot.
 * @returns the reference to address.
 */
function refOf(snapshot: SettingsScopeSnapshot<VisionSettings>): string {
  const declared = snapshot.value?.apiKeyEnv
  return declared !== undefined && declared.length > 0 ? declared : DEFAULT_API_KEY_REF
}
