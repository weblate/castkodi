import assert from "node:assert";
import sinon from "sinon";
import { kodi } from "../../../../src/core/kodi.js";
import * as scraper from "../../../../src/core/scraper/theguardian.js";

describe("core/scraper/theguardian.js", function () {
    describe("extractVideo()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://support.theguardian.com/eu" +
                                                                 "/contribute");

            const file = await scraper.extractVideo(url);
            assert.strictEqual(file, null);
        });

        it("should return null when it's not a video", async function () {
            const url = new URL("https://www.theguardian.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body></body>
                    </html>`, "text/html")),
            };
            const options = { incognito: false };

            const file = await scraper.extractVideo(url, content, options);
            assert.strictEqual(file, null);
        });

        it("should return video URL", async function () {
            const stub = sinon.stub(kodi.addons, "getAddons").resolves([]);

            const url = new URL("https://www.theguardian.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <div class="youtube-media-atom__iframe"
                             data-asset-id="bar" />
                      </body>
                    </html>`, "text/html")),
            };
            const options = { incognito: false };

            const file = await scraper.extractVideo(url, content, options);
            assert.strictEqual(file,
                "plugin://plugin.video.youtube/play/" +
                                               "?video_id=bar&incognito=false");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, ["video"]);
        });

        it("should return video URL in incognito mode", async function () {
            const stub = sinon.stub(kodi.addons, "getAddons").resolves([]);

            const url = new URL("https://www.theguardian.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <div class="youtube-media-atom__iframe"
                             data-asset-id="bar" />
                      </body>
                    </html>`, "text/html")),
            };
            const options = { incognito: true };

            const file = await scraper.extractVideo(url, content, options);
            assert.strictEqual(file,
                "plugin://plugin.video.youtube/play/" +
                                                "?video_id=bar&incognito=true");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, ["video"]);
        });
    });

    describe("extractAudio()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://support.theguardian.com/eu" +
                                                                 "/contribute");

            const file = await scraper.extractAudio(url);
            assert.strictEqual(file, null);
        });

        it("should return null when it's not an audio", async function () {
            const url = new URL("https://www.theguardian.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body></body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extractAudio(url, content);
            assert.strictEqual(file, null);
        });

        it("should return audio URL", async function () {
            const url = new URL("https://www.theguardian.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <figure id="audio-component-container"
                                data-source="https://bar.com/baz.mp3" />
                      </body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extractAudio(url, content);
            assert.strictEqual(file, "https://bar.com/baz.mp3");
        });
    });
});
