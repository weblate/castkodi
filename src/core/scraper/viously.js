/**
 * @module
 */
/* eslint-disable require-await */

import { matchPattern } from "../tools/matchpattern.js";

/**
 * Extrait les informations nécessaire pour lire une vidéo sur Kodi.
 *
 * @param {URL} url L'URL d'une vidéo Viously.
 * @returns {Promise<string>} Une promesse contenant le lien du
 *                            <em>fichier</em>.
 */
const action = async function ({ pathname }) {
    const id = pathname.slice(pathname.indexOf("/", 1) + 1);
    return `https://v.kolplay.com/${id}/index.m3u8`;
};
export const extract = matchPattern(action,
    "*://www.viously.com/export/*",
    "*://www.viously.com/amp/*");
