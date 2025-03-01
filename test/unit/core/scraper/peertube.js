import assert from "node:assert";
import sinon from "sinon";
import * as scraper from "../../../../src/core/scraper/peertube.js";

describe("core/scraper/peertube.js", function () {
    describe("extract()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://joinpeertube.org/fr/faq/");

            const file = await scraper.extract(url);
            assert.strictEqual(file, null);
        });

        it("should return null when it's not a video", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({}),
            ));

            const url = new URL("https://foo.com/w/bar");

            const file = await scraper.extract(url);
            assert.strictEqual(file, null);

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://foo.com/api/v1/videos/bar",
            ]);
        });

        it("should return video URL", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    streamingPlaylists: [{
                        playlistUrl: "http://foo.fr/bar.avi",
                    }],
                }),
            ));

            const url = new URL("https://baz.com/w/qux");

            const file = await scraper.extract(url);
            assert.strictEqual(file, "http://foo.fr/bar.avi");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://baz.com/api/v1/videos/qux",
            ]);
        });

        it("should return video URL from watch page", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    files: [{ fileUrl: "http://foo.io/bar.avi" }],
                }),
            ));

            const url = new URL("https://baz.com/videos/watch/qux");

            const file = await scraper.extract(url);
            assert.strictEqual(file, "http://foo.io/bar.avi");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://baz.com/api/v1/videos/qux",
            ]);
        });

        it("should return video URL from embed page", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    files: [{ fileUrl: "http://foo.fr/bar.avi" }],
                }),
            ));

            const url = new URL("https://baz.com/videos/embed/qux");

            const file = await scraper.extract(url);
            assert.strictEqual(file, "http://foo.fr/bar.avi");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://baz.com/api/v1/videos/qux",
            ]);
        });

        it("should return null when it's not a PeerTube website",
                                                             async function () {
            const stub = sinon.stub(globalThis, "fetch")
                              .rejects(new Error("foo"));

            const url = new URL("https://bar.com/w/baz");

            const file = await scraper.extract(url);
            assert.strictEqual(file, null);

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://bar.com/api/v1/videos/baz",
            ]);
        });
    });
});
