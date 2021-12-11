import assert from "node:assert";
import { extract } from "../../../src/core/scrapers.js";

describe("Scraper: Play SRF", function () {
    it("should return URL when it's not a video", async function () {
        const url = new URL("https://www.srf.ch/hilfe/kontakt" +
                                                "?srg_shorturl_source=kontakt");
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.strictEqual(file, url.href);
    });

    it("should return URL when urn is invalid", async function () {
        const url = new URL("https://www.srf.ch/play/tv/foo/video/bar" +
                     "?urn=urn:srf:video:d5cb6b79-cc9f-4e29-82fb-64e8283f02e2");
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.strictEqual(file, url.href);
    });

    it("should return video URL", async function () {
        const url = new URL("https://www.srf.ch/play/tv/mona-mittendrin/video" +
                                          "/bei-spitzenkoechin-tanja-grandits" +
                     "?urn=urn:srf:video:05fe9231-6f59-46e1-bcd1-82c3d30f9ccd");
        const options = { depth: false, incognito: false };

        const file = await extract(url, options);
        assert.ok(null !== file &&
                                new URL(file).pathname.endsWith("/master.m3u8"),
                  `new URL("${file}").pathname.endsWith(...) from ${url}`);
    });
});
