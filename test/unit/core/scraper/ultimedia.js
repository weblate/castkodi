import assert from "node:assert";
import * as scraper from "../../../../src/core/scraper/ultimedia.js";

describe("core/scraper/ultimedia.js", function () {
    describe("extract()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://www.ultimedia.com/default" +
                                                           "/presentation/cgu");

            const file = await scraper.extract(url);
            assert.strictEqual(file, null);
        });

        it("should return null when no script", async function () {
            const url = new URL("https://www.ultimedia.com/deliver/generic" +
                                                                 "/iframe/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body></body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, null);
        });

        it("should return null when no inline script", async function () {
            const url = new URL("https://www.ultimedia.com/deliver/generic" +
                                                                 "/iframe/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <script src="https://www.ultimedia.com/script.js">` +
                                                                      `</script>
                      </body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, null);
        });

        it("should return null when no station", async function () {
            const url = new URL("https://www.ultimedia.com/deliver/generic" +
                                                                 "/iframe/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <script>
                            DtkPlayer.init({});
                        </script>
                      </body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, null);
        });

        it("should return video URL", async function () {
            const url = new URL("https://www.ultimedia.com/deliver/generic" +
                                                                 "/iframe/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <script>
                            DtkPlayer.init({
                                "mp4":{
                                    "mp4_1080":"https://bar.com/baz_1080.mp4",
                                    "mp4_720":"https://bar.com/baz_720.mp4"
                                }
                            });
                        </script>
                      </body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, "https://bar.com/baz_1080.mp4");
        });
    });
});
