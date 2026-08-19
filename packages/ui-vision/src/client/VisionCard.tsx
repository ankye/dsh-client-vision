/**
 * The vision card: the recognition channel, its endpoint, its model, and the
 * key — which is written through the credentials domain, never into the
 * settings section, so the literal never rides a response.
 */

import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: the settings.plugin.item slot declaration and its owner props
// live in ui-settings-plugins; cross-package collaboration goes through the
// service, never a value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import { SecretField, SelectField, ValueField } from './fields.tsx'
import { PluginCard } from './PluginCard.tsx'
import { VISION_CHANNELS, VISION_MODELS, type VisionCardFace } from './vision-card-controller.ts'

/** Props the renderer binds for the vision card. */
export type VisionCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'vision'>
  & InjectFace<VisionCardFace>

/** Visible labels for the channel options. */
const CHANNEL_OPTIONS = VISION_CHANNELS.map(value => ({ value, label: value }))

/** Visible labels for the model options. */
const MODEL_OPTIONS = VISION_MODELS.map(value => ({ value, label: value }))

/**
 * Render the vision card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card.
 */
export function VisionCard(props: VisionCardProps) {
  const { t } = props
  const state = props.useVisionCard(snapshot => snapshot)
  const disabled = !state.writable
  return (
    <PluginCard
      t={t}
      titleKey="title"
      descriptionKey="description"
      state={state}
      onSave={props.save}
      onDiscard={props.discard}
    >
      <SecretField
        id="plugin-config-vision-key"
        label={t('apiKey')}
        hint={t('apiKeyHint')}
        disabled={!state.apiKeyWritable}
        text={state.apiKey.text}
        configured={state.apiKeyConfigured}
        stateLabel={state.apiKeyConfigured ? t('apiKeySet') : t('apiKeyUnset')}
        onEdit={(text) => { props.edit('apiKey', text) }}
      />
      <ValueField
        id="plugin-config-vision-endpoint"
        label={t('baseUrl')}
        hint={t('baseUrlHint')}
        placeholder="https://token.uzstudio.com/v1"
        overriddenLabel={t('overridden')}
        resetLabel={t('reset')}
        invalidLabel={t('invalidNumber')}
        disabled={disabled}
        {...state.baseUrl}
        onEdit={(text) => { props.edit('baseUrl', text) }}
        onReset={() => { props.resetField('baseUrl') }}
      />
      <SelectField
        id="plugin-config-vision-channel"
        label={t('channel')}
        hint={t('channelHint')}
        options={CHANNEL_OPTIONS}
        overriddenLabel={t('overridden')}
        resetLabel={t('reset')}
        invalidLabel={t('invalidNumber')}
        disabled={disabled}
        {...state.channel}
        onEdit={(text) => { props.edit('channel', text) }}
        onReset={() => { props.resetField('channel') }}
      />
      <SelectField
        id="plugin-config-vision-model"
        label={t('model')}
        hint={t('modelHint')}
        options={MODEL_OPTIONS}
        overriddenLabel={t('overridden')}
        resetLabel={t('reset')}
        invalidLabel={t('invalidNumber')}
        disabled={disabled}
        {...state.model}
        onEdit={(text) => { props.edit('model', text) }}
        onReset={() => { props.resetField('model') }}
      />
    </PluginCard>
  )
}
