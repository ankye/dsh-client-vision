/**
 * Shared form model behind the vision card (self-contained copy; the
 * browser bundle purity gate forbids importing it from another client
 * package).
 *
 * A card stages what the user types and writes it only when they save. Each
 * settings write is a durable, revision-fenced document mutation, so a control
 * that committed as it settled turned one edit into a write the user never
 * asked for and could not preview; staged text makes what is on screen exactly
 * what a save would store.
 */
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** The write one field's staged text performs when the card is saved. */
export type FieldWrite = {
    kind: 'set';
    value: unknown;
} | {
    kind: 'clear';
};
/** How one section field converts between its stored value and its draft text. */
export interface CardFieldSpec {
    /** Field name inside the namespace section. */
    field: string;
    /** Render a stored value as draft text; the empty string when the section carries none. */
    format: (value: unknown) => string;
    /** The write this draft text stages, or undefined when the text is not a value this field accepts. */
    parse: (text: string) => FieldWrite | undefined;
}
/** A control whose value is written outside the settings section. */
export interface CardSecretSpec {
    /** Field name addressing this control inside the card's form. */
    field: string;
    /** Write the staged text; resolves to whether the Host accepted it. */
    write: (text: string) => Promise<boolean>;
}
/** One field as a card's control renders it. */
export interface CardFieldState {
    /** Draft text the control renders. */
    text: string;
    /** Whether saving would leave a user-layer entry for this field. */
    overridden: boolean;
    /** Whether the draft is not a value this field accepts, which blocks saving. */
    invalid: boolean;
}
/** Form state every plugin card shares. */
export interface CardShell {
    /** False while the namespace is not served to this client; the card renders nothing. */
    available: boolean;
    /** Whether the Host document accepts writes. */
    writable: boolean;
    /** Whether the form holds edits that a save would write. */
    dirty: boolean;
    /** Whether any staged draft is invalid, which blocks the save. */
    invalid: boolean;
    /** Whether a save is crossing the wire. */
    saving: boolean;
    /** Whether the last save did not land as staged; cleared by the next edit or save. */
    failed: boolean;
}
/** The write actions every plugin card's slot entry injects. */
export interface CardActions {
    /** Stage draft text for one field. */
    edit: (field: string, text: string) => void;
    /** Stage a clear, so saving lets the field re-inherit the composition layer. */
    resetField: (field: string) => void;
    /** Write every staged edit, then re-seed from what the Host accepted. */
    save: () => void;
    /** Drop every staged edit. */
    discard: () => void;
}
/** A free-text field. An empty draft clears the field. */
export declare function textField(field: string): CardFieldSpec;
/**
 * An enum field rendered as a select. A stored value the options no longer
 * list still renders, but only an offered option is accepted back.
 */
export declare function selectField(field: string, options: readonly string[]): CardFieldSpec;
/**
 * Stages one card's edits over one settings namespace and writes them on save.
 */
export declare class CardForm<T> {
    private readonly scope;
    private readonly specs;
    private readonly secretSpecs;
    private readonly staged;
    private readonly listeners;
    private saving;
    private failed;
    constructor(scope: SettingsScope<T>, specs: CardFieldSpec[], secrets?: CardSecretSpec[]);
    bind<S>(project: () => S): SnapshotStore<S>;
    shell(): CardShell;
    field(field: string): CardFieldState;
    actions(): CardActions;
    save(): Promise<void>;
    private plan;
    private clear;
    private store;
    private stage;
    private spec;
    private snapshotOf;
    private sectionValue;
    private baseValue;
    private userLayer;
    private stored;
    private publish;
}
//# sourceMappingURL=card-form.d.ts.map