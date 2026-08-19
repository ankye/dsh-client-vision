import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Marker line the host render emits for screenshot results. */
const SHOT_MARKER = /\[view-image: ([^\]]+)\]/;
/**
 * Render the view_image call card.
 * @param props - the tool call block and locale.
 * @returns the image + description, or plain text when no screenshot marker.
 */
export function ViewImageToolView(props) {
    const block = props.block;
    // RunningToolCall carries no `kind` tag; only the settled result node does.
    if (!('kind' in block) || block.kind !== 'tool-result')
        return null;
    const text = block.content
        .filter((b) => b.type === 'text')
        .map(b => b.text)
        .join('\n');
    const match = SHOT_MARKER.exec(text);
    if (match === null) {
        return _jsx("pre", { style: { whiteSpace: 'pre-wrap' }, children: text });
    }
    const url = match[1];
    const description = text.replace(SHOT_MARKER, '').trim();
    return (_jsxs("div", { children: [_jsx("img", { src: url, alt: "view-image", style: { maxWidth: '100%', borderRadius: 8, display: 'block' } }), description !== '' ? _jsx("p", { children: description }) : null] }));
}
//# sourceMappingURL=ViewImageToolView.js.map