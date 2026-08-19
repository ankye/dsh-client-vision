/**
 * One plugin's card: a header naming the plugin and what its settings govern,
 * disclosing that plugin's controls in place, with the save that writes them
 * (self-contained copy; the bundle purity gate forbids importing another
 * client package's chrome).
 */
import type { CardShell } from './card-form.ts';
import type { VisionLocaleKey } from './locales.ts';
/** Card chrome shared by every plugin section. */
export interface PluginCardProps {
    /** Locale reader for this section's copy. */
    t: (key: VisionLocaleKey) => string;
    /** Locale key of the plugin's name. */
    titleKey: VisionLocaleKey;
    /** Locale key of the line describing what this plugin's settings govern. */
    descriptionKey: VisionLocaleKey;
    /** The card's form state: availability, writability, and what a save would do. */
    state: CardShell;
    /** Write every staged edit. */
    onSave: () => void;
    /** Drop every staged edit. */
    onDiscard: () => void;
    /** The plugin's controls. */
    children: import('react').ReactNode;
}
/**
 * Render one plugin card.
 * @param props - the plugin's copy keys, its form state, and its controls.
 * @returns the card, or nothing when the namespace is unavailable.
 */
export declare function PluginCard(props: PluginCardProps): import("react").JSX.Element | null;
//# sourceMappingURL=PluginCard.d.ts.map