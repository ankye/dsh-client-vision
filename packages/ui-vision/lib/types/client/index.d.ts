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
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Mount the vision settings card.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map