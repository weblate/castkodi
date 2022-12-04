import assert from "node:assert/strict";
import sinon from "sinon";
import { kodi } from "../../../src/core/jsonrpc/kodi.js";
import * as menu from "../../../src/core/menu.js";

describe("core/menu.js", function () {
    describe("update()", function () {
        it("shouldn't add item", async function () {
            browser.storage.local.set({
                "server-mode":   "single",
                "menu-actions":  [],
                "menu-contexts": ["audio"],
            });

            await menu.update();
            // eslint-disable-next-line no-underscore-dangle
            const items = browser.contextMenus._getAll();
            assert.deepEqual(items, []);
        });

        it("should add one item", async function () {
            browser.storage.local.set({
                "server-mode":   "single",
                "menu-actions":  ["send"],
                "menu-contexts": ["frame"],
            });

            await menu.update();
            // eslint-disable-next-line no-underscore-dangle
            const items = browser.contextMenus._getAll();
            assert.deepEqual(items, [{
                contexts: ["frame"],
                id:       "send",
                title:    "Play now to Kodi",
            }]);
        });

        it("should add two items", async function () {
            browser.storage.local.set({
                "server-mode":   "single",
                "menu-actions":  ["insert", "add"],
                "menu-contexts": ["link"],
            });

            await menu.update();
            // eslint-disable-next-line no-underscore-dangle
            const items = browser.contextMenus._getAll();
            assert.deepEqual(items, [{
                contexts: ["link"],
                id:       "parent",
                title:    "Cast to Kodi",
                children: [{
                    contexts: ["link"],
                    id:       "insert",
                    parentId: "parent",
                    title:    "Play next",
                }, {
                    contexts: ["link"],
                    id:       "add",
                    parentId: "parent",
                    title:    "Queue item",
                }],
            }]);
        });

        it("should add two servers", async function () {
            browser.storage.local.set({
                "server-mode":   "multi",
                "server-list":   [{
                    address: "192.168.0.1",
                    name:    "foo",
                }, {
                    address: "ws://192.168.0.1:9090/jsonrpc",
                    name:    "",
                }],
                "server-active": 1,
                "menu-actions":  ["send"],
                "menu-contexts": ["page"],
            });

            await menu.update();
            // eslint-disable-next-line no-underscore-dangle
            const items = browser.contextMenus._getAll();
            assert.deepEqual(items, [{
                contexts: ["page"],
                id:       "parent",
                title:    "Cast to Kodi",
                children: [{
                    contexts: ["page"],
                    id:       "send",
                    parentId: "parent",
                    title:    "Play now",
                }, {
                    contexts: ["page"],
                    id:       "separator",
                    parentId: "parent",
                    type:     "separator",
                }, {
                    checked:  false,
                    contexts: ["page"],
                    id:       "0",
                    parentId: "parent",
                    title:    "foo",
                    type:     "radio",
                }, {
                    checked:  true,
                    contexts: ["page"],
                    id:       "1",
                    parentId: "parent",
                    title:    "(noname 2)",
                    type:     "radio",
                }],
            }]);
        });

        it("should add three items and one multi-server", async function () {
            browser.storage.local.set({
                "server-mode":   "multi",
                "server-list":   [{
                    address: "foo",
                    name:    "  ",
                }],
                "server-active": 1,
                "menu-actions":  ["send", "insert", "add"],
                "menu-contexts": ["selection", "video"],
            });

            await menu.update();
            // eslint-disable-next-line no-underscore-dangle
            const items = browser.contextMenus._getAll();
            assert.deepEqual(items, [{
                contexts: ["selection", "video"],
                id:       "parent",
                title:    "Cast to Kodi",
                children: [{
                    contexts: ["selection", "video"],
                    id:       "send",
                    parentId: "parent",
                    title:    "Play now",
                }, {
                    contexts: ["selection", "video"],
                    id:       "insert",
                    parentId: "parent",
                    title:    "Play next",
                }, {
                    contexts: ["selection", "video"],
                    id:       "add",
                    parentId: "parent",
                    title:    "Queue item",
                }, {
                    contexts: ["selection", "video"],
                    id:       "separator",
                    parentId: "parent",
                    type:     "separator",
                }, {
                    checked:  false,
                    contexts: ["selection", "video"],
                    id:       "0",
                    parentId: "parent",
                    title:    "(noname 1)",
                    type:     "radio",
                }],
            }]);
        });
    });

    describe("aggregate()", function () {
        it("should return bookmark url", async function () {
            const { id } = browser.bookmarks.create({ url: "http://foo.com/" });

            const urls = await menu.aggregate({
                menuItemId: "send",
                modifiers:  [],
                editable:   false,
                bookmarkId: id,
            });
            assert.deepEqual(urls, ["http://foo.com/"]);
        });

        it("should return bookmark title", async function () {
            const { id } = browser.bookmarks.create({
                url:   undefined,
                title: "foo",
            });

            const urls = await menu.aggregate({
                menuItemId: "send",
                modifiers:  [],
                editable:   false,
                bookmarkId: id,
            });
            assert.deepEqual(urls, ["foo"]);
        });

        it("should ignore URLs (with audio)", async function () {
            await browser.storage.local.set({ "menu-contexts": ["video"] });

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            const urls = await menu.aggregate({
                menuItemId:    "send",
                modifiers:     [],
                editable:      false,
                mediaType:     "audio",
                selectionText: "foo",
                linkUrl:       "bar",
                srcUrl:        "baz",
                frameUrl:      "qux",
                pageUrl:       "quux",
            });
            assert.deepEqual(urls, []);
        });

        it("should ignore URLs (with video)", async function () {
            await browser.storage.local.set({ "menu-contexts": ["audio"] });

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            const urls = await menu.aggregate({
                menuItemId:    "send",
                modifiers:     [],
                editable:      false,
                mediaType:     "video",
                selectionText: "foo",
                linkUrl:       "bar",
                srcUrl:        "baz",
                frameUrl:      "qux",
                pageUrl:       "quux",
            });
            assert.deepEqual(urls, []);
        });

        it("should return URLs (with audio)", async function () {
            await browser.storage.local.set({
                "menu-contexts": [
                    "selection", "link", "audio", "frame", "page",
                ],
            });

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            const urls = await menu.aggregate({
                menuItemId:    "send",
                modifiers:     [],
                editable:      false,
                mediaType:     "audio",
                selectionText: "foo",
                linkUrl:       "bar",
                srcUrl:        "baz",
                frameUrl:      "qux",
                pageUrl:       "quux",
            });
            assert.deepEqual(urls, ["foo", "bar", "baz", "qux", "quux"]);
        });

        it("should return URLs (with video)", async function () {
            await browser.storage.local.set({
                "menu-contexts": [
                    "selection", "link", "video", "frame", "page",
                ],
            });

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            const urls = await menu.aggregate({
                menuItemId:    "send",
                modifiers:     [],
                editable:      false,
                mediaType:     "video",
                selectionText: "foo",
                linkUrl:       "bar",
                srcUrl:        "baz",
                frameUrl:      "qux",
                pageUrl:       "quux",
            });
            assert.deepEqual(urls, ["foo", "bar", "baz", "qux", "quux"]);
        });
    });

    describe("click()", function () {
        it("should notify not granted", async function () {
            // Comme il n'est pas possible de remplacer un export avec sinon,
            // remplacer la function appelée par l'export.
            const stub = sinon.stub(browser.notifications, "create")
                              .resolves("foo");

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            await menu.click({
                menuItemId: "add",
                modifiers:  [],
                editable:   false,
                linkUrl:    "http://bar.com/",
            });

            assert.equal(stub.callCount, 1);
            assert.deepEqual(stub.firstCall.args, [{
                type:    "basic",
                iconUrl: "/img/icon128.png",
                title:   "Authorization not granted",
                message: "The extension cannot access websites.",
            }]);
        });

        it("should cast link", async function () {
            await browser.permissions.request({ origins: ["<all_urls>"] });
            await browser.storage.local.set({ "menu-contexts": ["link"] });
            browser.extension.inIncognitoContext = true;
            // Comme il n'est pas possible de remplacer un export avec sinon,
            // remplacer la function appelée par l'export.
            const stub = sinon.stub(kodi.playlist, "add").resolves("OK");

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            await menu.click({
                menuItemId: "add",
                modifiers:  [],
                editable:   false,
                linkUrl:    "http://foo.com/",
            });

            assert.equal(stub.callCount, 1);
            assert.deepEqual(stub.firstCall.args, ["http://foo.com/"]);
        });

        it("should notify bad link", async function () {
            await browser.permissions.request({ origins: ["<all_urls>"] });
            await browser.storage.local.set({ "menu-contexts": ["link"] });
            // Comme il n'est pas possible de remplacer un export avec sinon,
            // remplacer la function appelée par l'export.
            const stub = sinon.stub(browser.notifications, "create")
                              .resolves("foo");

            // @ts-ignore: Désactiver la vérification de TypeScript car la
            // déclaration du type OnClickData (argument de aggregate) n'est pas
            // bonne sur la propriété bookmarkId. https://bugzil.la/1707405
            await menu.click({
                menuItemId: "add",
                modifiers:  [],
                editable:   false,
                linkUrl:    "???",
            });

            assert.equal(stub.callCount, 1);
            assert.deepEqual(stub.firstCall.args, [{
                type:    "basic",
                iconUrl: "/img/icon128.png",
                title:   "Unsupported link",
                message: "Link ??? is invalid.",
            }]);
        });
    });

    describe("change()", function () {
        it("should change server", async function () {
            await browser.storage.local.set({ "server-active": 0 });

            await menu.change(1);
            const config = await browser.storage.local.get();
            assert.deepEqual(config, { "server-active": 1 });
        });
    });
});
