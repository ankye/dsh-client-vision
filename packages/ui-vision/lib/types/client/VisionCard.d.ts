/**
 * The vision card: the recognition channel, its endpoint, its model, and the
 * key — which is written through the credentials domain, never into the
 * settings section, so the literal never rides a response.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type VisionCardFace } from './vision-card-controller.ts';
/** Props the renderer binds for the vision card. */
export type VisionCardProps = PropsRuntime<'settings.plugin.item'> & PropsLocale<'vision'> & InjectFace<VisionCardFace>;
/**
 * Render the vision card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card.
 */
export declare function VisionCard(props: VisionCardProps): import("react").JSX.Element;
//# sourceMappingURL=VisionCard.d.ts.map