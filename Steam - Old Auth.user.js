// ==UserScript==
// @name         Steam - Old Auth
// @namespace    revadike
// @version      1.0.0
// @description  try to take over the world!
// @author       You
// @match        https://steamcommunity.com/login*
// @match        https://store.steampowered.com/login*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @run-at       document-start
// ==/UserScript==

(function() {
    "use strict";
    let url = new URL(window.location.href);

    if (url.searchParams.has("oldauth")) {
        return;
    }

    switch (url.pathname) {
        case '/login/home/':
        case '/login/home':
        case '/login/':
        case '/login':
            url.searchParams.set("oldauth", "1");
            window.location.replace(url);
            break;

        default:
            break;
    }
})();
