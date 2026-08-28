/**
 * Vision settings card, browser half — one card registered into the
 * configurable-plugins tab under the `vision` settings namespace.
 *
 * The tab (owned by ui-settings-plugins) enumerates Host-served namespaces
 * and dispatches cards by key; this package contributes only its own card and
 * locale. Cross-package collaboration goes through the service — the slot
 * declaration, the settings scope, the credentials domain — never a value
 * import (client bundle purity gate).
 */

// Type-only: the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: the settings shell's SlotMap merge and the ctx.settingsScope
// Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: the settings.plugin.item slot declaration (ui-settings-plugins).
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: the ctx.remote Context merge and the forwarded-event key face.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: the tool.call.toolview slot declaration (ui-tool).
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import { VisionCard } from './VisionCard.tsx'
import { ViewImageToolView } from './ViewImageToolView.tsx'
import { VISION_NS, VisionCardController } from './vision-card-controller.ts'
import { en, zh } from './locales.ts'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'remote', 'remote.credentials', 'settingsScope']

/**
 * Mount the vision settings card.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(VISION_NS, { zh, en }), 'ui-vision: dictionaries')

  const vision = new VisionCardController(ctx.settingsScope.bind({ namespace: VISION_NS }), ctx.remote.credentials)

  // A key written on another surface (Models page, another card) reaches the
  // Host without touching this section; the forwarded event is the only
  // signal the badge can re-read on.
  ctx.effect(
    () => ctx.remote.$on('credentials/reference-updated', (ref) => { vision.refreshCredential(ref) }),
    'ui-vision: credential invalidations',
  )

  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview',
    key: 'view_image',
    locale: VISION_NS,
  }, ViewImageToolView))

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: VISION_NS,
    locale: VISION_NS,
    inject: () => vision.inject(),
  }, VisionCard))
}
