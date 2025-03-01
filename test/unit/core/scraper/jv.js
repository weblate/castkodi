import assert from "node:assert";
import sinon from "sinon";
import * as scraper from "../../../../src/core/scraper/jv.js";

describe("core/scraper/jv.js", function () {
    describe("extract()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://www.jvlemag.com/");

            const file = await scraper.extract(url);
            assert.strictEqual(file, null);
        });

        it("should return null when it's not a video", async function () {
            const url = new URL("https://www.jeuxvideo.com/foo");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body></body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, null);
        });

        it("should return video URL", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    sources: [
                        {
                            label: "272p",
                            file:  "https://foo.com/bar.avi",
                        }, {
                            label: "1080p60",
                            file:  "https://foo.com/bar.mp4",
                        }, {
                            label: "2160p (4K)",
                            file:  "https://foo.com/bar.mkv",
                        },
                    ],
                }),
            ));

            const url = new URL("https://www.jeuxvideo.com/baz");
            const content = {
                html: () => Promise.resolve(new DOMParser().parseFromString(`
                    <html>
                      <body>
                        <div data-src-video="https://qux.fr/quux.htm"></div>
                      </body>
                    </html>`, "text/html")),
            };

            const file = await scraper.extract(url, content);
            assert.strictEqual(file, "https://foo.com/bar.mkv");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                new URL("https://qux.fr/quux.htm"),
            ]);
        });
    });
});
