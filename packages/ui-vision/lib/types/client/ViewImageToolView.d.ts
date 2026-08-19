/**
 * The `view_image` tool's conversation card: shows the captured screenshot in
 * the Web UI while the model context keeps only the plain-text description.
 *
 * The host render emits a `[view-image: /dsh-vision/<file>]` marker in the
 * result text; this card parses the marker, renders the PNG (served by the
 * host's `/dsh-vision` route), and shows the description. The image bytes
 * never enter the model context.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Props the toolview renderer binds. */
export type ViewImageToolViewProps = PropsRuntime<'tool.call.toolview'> & PropsLocale<'vision'>;
/**
 * Render the view_image call card.
 * @param props - the tool call block and locale.
 * @returns the image + description, or plain text when no screenshot marker.
 */
export declare function ViewImageToolView(props: ViewImageToolViewProps): import("react").JSX.Element | null;
//# sourceMappingURL=ViewImageToolView.d.ts.map