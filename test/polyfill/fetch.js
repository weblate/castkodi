import nodeFetch from "node-fetch";

/**
 * @typedef {import("node-fetch").Response} Response
 */

/**
 * L'agent utilisateur de Chromium sous Ubuntu.
 *
 * @type {string}
 */
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" +
                       " (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36";

/**
 * Cherche une ressource.
 *
 * @param {string} input  La ressource à collecter.
 * @param {Object} [init] Les paramètres de la requête.
 * @returns {Promise<Response>} Une promesse contenant la réponse.
 */
export const fetch = function (input, init) {
    const headers = {
        "Accept-Language": "*",
        // Définir "keep-alive" car node-fetch utilise par défaut "close".
        // https://github.com/node-fetch/node-fetch/pull/1473
        Connection:        "keep-alive",
        // Remplacer l'agent utilisateur "node-fetch" par la valeur d'un vrai
        // navigateur ; pour ne pas être bloqué par des sites.
        "User-Agent":      USER_AGENT,
        ...init?.headers,
    };
    return nodeFetch(input, { ...init, headers });
};
