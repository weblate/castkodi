import assert from "node:assert";
import { extract } from "../../../src/core/scrapers.js";

describe("Scraper: Bigo Live", function () {
    it("should return URL when it's not a video", async function () {
        const url = new URL("https://www.bigo.tv/games");
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.strictEqual(file, url.href);
    });

    it("should return video URL", async function () {
        // Récupérer l'URL d'une vidéo avec l'API de Bigo Live.
        const response = await fetch("https://www.bigo.tv/OInterfaceWeb" +
                                         "/vedioList/11?tabType=00&fetchNum=1");
        const json = await response.json();

        const url = new URL(`https://www.bigo.tv/${json.data.data[0].bigo_id}`);
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.ok(null !== file && new URL(file).pathname.endsWith(".m3u8"),
                  `new URL("${file}").pathname.endsWith(...) from ${url}`);
    });

    it("should return video URL from french version", async function () {
        // Récupérer l'URL d'une vidéo avec l'API de Bigo Live.
        const response = await fetch("https://www.bigo.tv/OInterfaceWeb" +
                                         "/vedioList/11?tabType=00&fetchNum=1");
        const json = await response.json();

        const url = new URL("https://www.bigo.tv/fr/" +
                            json.data.data[0].bigo_id);
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.ok(null !== file && new URL(file).pathname.endsWith(".m3u8"),
                  `new URL("${file}").pathname.endsWith(...) from ${url}`);
    });

    it("should return URL when it's not a live", async function () {
        const url = new URL("https://www.bigo.tv/0");
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.strictEqual(file, url.href);
    });
});
