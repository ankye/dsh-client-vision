/**
 * Hand-written controls for the vision card's form. Each renders one field's
 * label, its staged text, whether saving would leave an override, and — when
 * one stands — the reset that stages a clear back to the composition layer.
 * Nothing here writes: a control reports what the user typed, and the card's
 * save is the single point where a draft becomes a document mutation.
 */
import type { ReactNode } from 'react';
/** What every field control needs regardless of its value type. */
export interface FieldProps {
    /** Stable id associating the label with its control. */
    id: string;
    /** Visible label. */
    label: string;
    /** One-line explanation rendered under the control. */
    hint: string;
    /** Draft text this control renders. */
    text: string;
    /** True when saving would leave a user-layer entry for this field. */
    overridden: boolean;
    /** True when the draft is not a value this field accepts. */
    invalid: boolean;
    /** Copy for the overridden badge. */
    overriddenLabel: string;
    /** Copy for the reset control. */
    resetLabel: string;
    /** Copy shown in place of the hint while the draft is invalid. */
    invalidLabel: string;
    /** Disables every control (read-only document, or an unavailable namespace). */
    disabled: boolean;
    /** Stage draft text. */
    onEdit: (text: string) => void;
    /** Stage a clear so the field re-inherits the composition layer. */
    onReset: () => void;
}
/** A staged value field. */
export declare function ValueField(props: FieldProps & {
    /** Hints a numeric keypad without narrowing what the control accepts. */
    numeric?: boolean;
    /** Placeholder shown while the draft is empty. */
    placeholder?: string;
}): import("react").JSX.Element;
/** A write-only credential control. The value never rides a response. */
export declare function SecretField(props: Pick<FieldProps, 'id' | 'label' | 'hint' | 'text' | 'disabled' | 'onEdit'> & {
    /** Whether the Host reports a configured credential for this reference. */
    configured: boolean;
    /** Copy describing the configured state. */
    stateLabel: string;
}): import("react").JSX.Element;
/**
 * A staged enum control. The select always carries one of the offered options;
 * a draft naming a value the options no longer list still renders so the user
 * can see what the section holds, and saving it back is refused until it names
 * an offered option.
 */
export declare function SelectField(props: FieldProps & {
    /** The offered values with their visible labels. */
    options: readonly {
        value: string;
        label: string;
    }[];
}): import("react").JSX.Element;
/** Re-export the children node type used by the card chrome. */
export type { ReactNode };
//# sourceMappingURL=fields.d.ts.map