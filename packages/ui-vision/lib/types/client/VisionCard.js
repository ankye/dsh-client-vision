import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SecretField, SelectField, ValueField } from "./fields.js";
import { PluginCard } from "./PluginCard.js";
import { VISION_CHANNELS } from "./vision-card-controller.js";
/** Visible labels for the channel options. */
const CHANNEL_OPTIONS = [
    { value: 'gpt', label: 'GPT' },
    { value: 'zhipu', label: 'Zhipu GLM-4V' },
    { value: 'ollama', label: 'Ollama (local)' },
];
/**
 * Render the vision card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card.
 */
export function VisionCard(props) {
    const { t } = props;
    const state = props.useVisionCard(snapshot => snapshot);
    const disabled = !state.writable;
    const modelOptions = state.modelOptions.map(value => ({ value, label: value }));
    const channelOptions = CHANNEL_OPTIONS.filter(option => VISION_CHANNELS.includes(option.value));
    return (_jsxs(PluginCard, { t: t, titleKey: "title", descriptionKey: "description", state: state, onSave: props.save, onDiscard: props.discard, children: [state.keyVisible
                ? (_jsx(SecretField, { id: "plugin-config-vision-key", label: t('apiKey'), hint: t('apiKeyHint'), disabled: !state.apiKeyWritable, text: state.apiKey.text, configured: state.apiKeyConfigured, stateLabel: state.apiKeyConfigured ? t('apiKeySet') : t('apiKeyUnset'), onEdit: (text) => { props.edit('apiKey', text); } }))
                : null, _jsx(ValueField, { id: "plugin-config-vision-endpoint", label: t('baseUrl'), hint: t('baseUrlHint'), placeholder: "https://api.example.com/v1", overriddenLabel: t('overridden'), resetLabel: t('reset'), invalidLabel: t('invalidNumber'), disabled: disabled, ...state.baseUrl, onEdit: (text) => { props.edit('baseUrl', text); }, onReset: () => { props.resetField('baseUrl'); } }), _jsx(SelectField, { id: "plugin-config-vision-channel", label: t('channel'), hint: t('channelHint'), options: channelOptions, overriddenLabel: t('overridden'), resetLabel: t('reset'), invalidLabel: t('invalidNumber'), disabled: disabled, ...state.channel, onEdit: (text) => { props.edit('channel', text); }, onReset: () => { props.resetField('channel'); } }), _jsx(SelectField, { id: "plugin-config-vision-model", label: t('model'), hint: t('modelHint'), options: modelOptions, overriddenLabel: t('overridden'), resetLabel: t('reset'), invalidLabel: t('invalidNumber'), disabled: disabled, ...state.model, onEdit: (text) => { props.edit('model', text); }, onReset: () => { props.resetField('model'); } })] }));
}
//# sourceMappingURL=VisionCard.js.map