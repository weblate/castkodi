import assert from "node:assert";
import sinon from "sinon";
import * as scraper from "../../../../src/core/scraper/srf.js";

describe("core/scraper/srf.js", function () {
    describe("extractVideo()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://www.srf.ch/foo");

            const file = await scraper.extractVideo(url);
            assert.strictEqual(file, null);
        });

        it("should return null when there isn't urn", async function () {
            const url = new URL("https://www.srf.ch/play/tv/foo/video/bar");

            const file = await scraper.extractVideo(url);
            assert.strictEqual(file, null);
        });

        it("should return null when urn is invalid", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({ status: "foo" }),
            ));

            const url = new URL("https://www.srf.ch/play/tv/bar/video/baz" +
                                                                    "?urn=qux");

            const file = await scraper.extractVideo(url);
            assert.strictEqual(file, null);

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://il.srgssr.ch/integrationlayer/2.0/mediaComposition" +
                                                                   "/byUrn/qux",
            ]);
        });

        it("should return video URL", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    chapterList: [{
                        resourceList: [{
                            analyticsMetadata: {
                                // eslint-disable-next-line camelcase
                                media_url: "http://foo.ch/bar.m3u8",
                            },
                        }],
                    }],
                }),
            ));

            const url = new URL("https://www.srf.ch/play/tv/baz/video/qux" +
                                                                   "?urn=quux");

            const file = await scraper.extractVideo(url);
            assert.strictEqual(file, "http://foo.ch/bar.m3u8");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://il.srgssr.ch/integrationlayer/2.0/mediaComposition" +
                                                                  "/byUrn/quux",
            ]);
        });
    });

    describe("extractRedirect()", function () {
        it("should return null when it's a unsupported URL", async function () {
            const url = new URL("https://www.srf.ch/play/tv/redirect/foo");

            const file = await scraper.extractRedirect(url);
            assert.strictEqual(file, null);
        });

        it("should return null when urn is invalid", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({ status: "foo" }),
            ));

            const url = new URL("https://www.srf.ch/play/tv/redirect/detail" +
                                                                        "/bar");

            const file = await scraper.extractRedirect(url);
            assert.strictEqual(file, null);

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://il.srgssr.ch/integrationlayer/2.0/mediaComposition" +
                                                     "/byUrn/urn:srf:video:bar",
            ]);
        });

        it("should return video URL", async function () {
            const stub = sinon.stub(globalThis, "fetch").resolves(new Response(
                JSON.stringify({
                    chapterList: [{
                        resourceList: [{
                            analyticsMetadata: {
                                // eslint-disable-next-line camelcase
                                media_url: "http://foo.ch/bar.m3u8",
                            },
                        }],
                    }],
                }),
            ));

            const url = new URL("https://www.srf.ch/play/tv/redirect/detail" +
                                                                        "/baz");

            const file = await scraper.extractRedirect(url);
            assert.strictEqual(file, "http://foo.ch/bar.m3u8");

            assert.strictEqual(stub.callCount, 1);
            assert.deepStrictEqual(stub.firstCall.args, [
                "https://il.srgssr.ch/integrationlayer/2.0/mediaComposition" +
                                                     "/byUrn/urn:srf:video:baz",
            ]);
        });
    });
});
