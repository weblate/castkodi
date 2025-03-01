/**
 * @module
 */

import { matchPattern } from "../tools/matchpattern.js";

/**
 * Extrait les informations nécessaire pour lire une vidéo sur Kodi.
 *
 * @param {URL}      url          L'URL d'une vidéo JV.
 * @param {Object}   content      Le contenu de l'URL.
 * @param {Function} content.html La fonction retournant la promesse contenant
 *                                le document HTML.
 * @returns {Promise<?string>} Une promesse contenant le lien du
 *                             <em>fichier</em> ou <code>null</code>.
 */
const action = async function (url, content) {
    const doc = await content.html();
    const div = doc.querySelector("div[data-src-video]");
    if (null === div) {
        return null;
    }

    const response = await fetch(new URL(div.dataset.srcVideo, url));
    const json = await response.json();
    return json.sources.map((source) => ({
        resolution: Number.parseInt(source.label, 10),
        file:       source.file,
    })).sort((s1, s2) => s2.resolution - s1.resolution).shift().file;
};
export const extract = matchPattern(action, "*://www.jeuxvideo.com/*");
