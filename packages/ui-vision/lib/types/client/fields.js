import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './fields.module.css';
/** A staged value field. */
export function ValueField(props) {
    return (_jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, htmlFor: props.id, children: props.label }), props.overridden
                        ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: props.overriddenLabel }), _jsx("button", { type: "button", className: css.reset, disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })] }))
                        : null] }), _jsx("input", { id: props.id, className: props.invalid ? css.inputInvalid : css.input, type: "text", ...props.numeric === true ? { inputMode: 'numeric' } : {}, ...props.invalid ? { 'aria-invalid': true } : {}, value: props.text, placeholder: props.placeholder ?? '', disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); } }), _jsx("p", { className: props.invalid ? css.invalid : css.hint, children: props.invalid ? props.invalidLabel : props.hint })] }));
}
/** A write-only credential control. The value never rides a response. */
export function SecretField(props) {
    return (_jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, htmlFor: props.id, children: props.label }), _jsx("span", { className: css.badges, children: _jsx("span", { className: props.configured ? css.badge : css.badgeMuted, children: props.stateLabel }) })] }), _jsx("input", { id: props.id, className: css.input, type: "password", autoComplete: "off", value: props.text, disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); } }), _jsx("p", { className: css.hint, children: props.hint })] }));
}
/**
 * A staged enum control. The select always carries one of the offered options;
 * a draft naming a value the options no longer list still renders so the user
 * can see what the section holds, and saving it back is refused until it names
 * an offered option.
 */
export function SelectField(props) {
    const known = props.options.some(option => option.value === props.text);
    return (_jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, htmlFor: props.id, children: props.label }), props.overridden
                        ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: props.overriddenLabel }), _jsx("button", { type: "button", className: css.reset, disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })] }))
                        : null] }), _jsxs("select", { id: props.id, className: css.input, value: props.text, disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); }, children: [!known && props.text !== ''
                        ? _jsx("option", { value: props.text, disabled: true, children: props.text })
                        : null, props.options.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsx("p", { className: css.hint, children: props.hint })] }));
}
//# sourceMappingURL=fields.js.map