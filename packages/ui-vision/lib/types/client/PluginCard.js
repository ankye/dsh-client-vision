import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * One plugin's card: a header naming the plugin and what its settings govern,
 * disclosing that plugin's controls in place, with the save that writes them
 * (self-contained copy; the bundle purity gate forbids importing another
 * client package's chrome).
 */
import { useState } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './PluginCard.module.css';
/**
 * Render one plugin card.
 * @param props - the plugin's copy keys, its form state, and its controls.
 * @returns the card, or nothing when the namespace is unavailable.
 */
export function PluginCard(props) {
    const [open, setOpen] = useState(false);
    const { state } = props;
    if (!state.available)
        return null;
    const title = props.t(props.titleKey);
    const blocked = !state.dirty || state.invalid || state.saving;
    return (_jsxs("li", { className: clsx(css.card, open && css.cardOpen), children: [_jsxs("button", { type: "button", className: css.header, "aria-expanded": open, "aria-label": `${props.t(open ? 'collapse' : 'expand')}: ${title}`, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { className: css.headText, children: [_jsx("span", { className: css.name, children: title }), _jsx("span", { className: css.description, children: props.t(props.descriptionKey) })] }), state.dirty ? _jsx("span", { className: css.pending, children: props.t('unsaved') }) : null, _jsx(IconChevronDownOutline14, { className: clsx(css.chevron, open && css.chevronOpen) })] }), open
                ? (_jsxs("div", { className: css.body, children: [!state.writable ? _jsx("p", { className: css.readOnly, role: "status", children: props.t('readOnly') }) : null, props.children, _jsxs("div", { className: css.footer, children: [state.failed ? _jsx("p", { className: css.failed, role: "status", children: props.t('saveFailed') }) : null, _jsx("button", { type: "button", className: css.discard, disabled: !state.dirty || state.saving, onClick: props.onDiscard, children: props.t('discard') }), _jsx("button", { type: "button", className: css.save, disabled: blocked, onClick: props.onSave, children: props.t(state.saving ? 'saving' : 'save') })] })] }))
                : null] }));
}
//# sourceMappingURL=PluginCard.js.map