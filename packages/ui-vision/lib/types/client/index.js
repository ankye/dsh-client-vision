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
import { VisionCard } from "./VisionCard.js";
import { ViewImageToolView } from "./ViewImageToolView.js";
import { VISION_NS, VisionCardController } from "./vision-card-controller.js";
import { en, zh } from "./locales.js";
/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'remote', 'remote.credentials', 'settingsScope'];
/**
 * Mount the vision settings card.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(VISION_NS, { zh, en }), 'ui-vision: dictionaries');
    const vision = new VisionCardController(ctx.settingsScope.bind({ namespace: VISION_NS }), ctx.remote.credentials);
    // A key written on another surface (Models page, another card) reaches the
    // Host without touching this section; the forwarded event is the only
    // signal the badge can re-read on.
    ctx.effect(() => ctx.remote.$on('credentials/reference-updated', (ref) => { vision.refreshCredential(ref); }), 'ui-vision: credential invalidations');
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
        name: 'tool.call.toolview',
        key: 'view_image',
        locale: VISION_NS,
    }, ViewImageToolView));
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name: 'settings.plugin.item',
        key: VISION_NS,
        locale: VISION_NS,
        inject: () => vision.inject(),
    }, VisionCard));
}
//# sourceMappingURL=index.js.map