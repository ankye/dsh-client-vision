//#region lib/types/index.js
/**
* Vision settings card, node half. The empty apply exists so the plugin
* appears in the host cordis.yml / Loader; the browser half owns the card
* through exports["./client"], discovered from the package.json `dsh.client`
* declaration. The `vision` settings namespace is owned by the
* `@deepseek-ai/dsh-tool-vision` Host package; this package only edits it.
*/
/** Host plugin body — no host-side behavior for this surface plugin. */
function apply() {}
//#endregion
export { apply };
