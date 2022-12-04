/**
 * @module
 */

import * as linkedom from "./lib/linkedom.js";

// Utiliser LinkeDOM pour simuler DOMParser dans le service worker.
// https://crbug.com/1056354
if (!("DOMParser" in globalThis)) {
    globalThis.DOMParser = linkedom.DOMParser;

    // Ajouter des propriétés manquantes dans les classes fournies par LinkeDOM.
    // Comme document.querySelector() ne retourne pas la classe spécifique :
    // ajouter les propriétés dans HTMLElement.
    // https://github.com/WebReflection/linkedom/issues/183
    // https://github.com/WebReflection/linkedom/issues/184
    Object.defineProperties(linkedom.HTMLElement.prototype, {
        // Ajouter HTMLEmbedElement.type.
        type: {
            get() {
                return this.getAttribute("type") ?? "";
            },
        },
        // Ajouter HTMLVideoElement.poster.
        poster: {
            get() {
                return this.getAttribute("poster") ?? "";
            },
        },
        // Ajouter HTMLBlockquoteElement.cite.
        cite: {
            get() {
                return this.getAttribute("cite") ?? "";
            },
        },
        // Ajouter HTMLMetaElement.content.
        content: {
            get() {
                return this.getAttribute("content") ?? "";
            },
        },
    });
}
