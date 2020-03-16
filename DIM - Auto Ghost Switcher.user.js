// ==UserScript==
// @name         DIM - Auto Ghost Switcher [Steam only]
// @description  DIM - Auto Ghost Switcher [Steam only]
// @namespace    Revadike
// @author       Revadike
// @version      1.0.0
// @include      https://app.destinyitemmanager.com/*/d2/inventory
// @connect      steamcommunity.com
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// ==/UserScript==

// ==Config==
const STEAMID3 = 82699538; // steamID3, get from https://steamid.io/lookup/
const INTERVAL = 1; // seconds, time between checking current in-game status
// ==/Config==

// ==Code==
(() => {
    "use strict";

    function pickGhost(ghosts, o_area) {
        var area = o_area.toLowerCase();
        var ghost = ghosts.default;

        switch (true) {
            case area.includes("edz"):
            case area.includes("earth"):
                ghost = ghosts.edzplus || ghosts.edz || ghosts.default;
                break;
            case area.includes("titan"):
                ghost = ghosts.titanplus || ghosts.titan || ghosts.default;
                break;
            case area.includes("nessus"):
                ghost = ghosts.nessusplus || ghosts.nessus || ghosts.default;
                break;
            case o_area.includes("Io"):
                ghost = ghosts.ioplus || ghosts.io || ghosts.default;
                break;
            case area.includes("mercury"):
                ghost = ghosts.mercuryplus || ghosts.mercury || ghosts.default;
                break;
            case area.includes("mars"):
            case area.includes("hellas basin"):
                ghost = ghosts.marsplus || ghosts.mars || ghosts.default;
                break;
            case area.includes("tangled shore"):
                ghost = ghosts.tangledplus || ghosts.tangled || ghosts.default;
                break;
            case area.includes("dreaming city"):
                ghost = ghosts.dreamingplus || ghosts.dreaming || ghosts.default;
                break;
            case area.includes("vanguard"):
            case area.includes("strike"):
                ghost = ghosts.strikesplus || ghosts.strike || ghosts.default;
                break;
            case area.includes("crucible"):
                ghost = ghosts.crucibleplus || ghosts.crucible || ghosts.default;
                break;
            case area.includes("gambit"):
                ghost = ghosts.gambitplus || ghosts.gambit || ghosts.default;
                break;
            case area.includes("leviathan"):
                ghost = ghosts.leviathanplus || ghosts.leviathan || ghosts.default;
                break;
            case area.includes("moon"):
                ghost = ghosts.moonplus || ghosts.moon || ghosts.default;
                break;
        }

        console.log("Equipping ghost: " + ghost.name);
        ghost.equip();
    }

    function getD2Area(doc) {
        var elem = doc.querySelector(".rich_presence");
        return elem ? elem.innerText.trim() : null;
    }

    function monitorInGameStatus(ghosts) {
        var currentArea = null;
        var monitor = setInterval(() => {
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://steamcommunity.com/miniprofile/" + STEAMID3 + "?t=" + Date.now(),
                onload: (response) => {
                    var html = response.responseText;
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, "text/html")
                    var area = getD2Area(doc);
                    if (!area || currentArea === area) { return; }

                    console.log(area);
                    currentArea = area;
                    pickGhost(ghosts, area);
                }
            });
        }, INTERVAL * 1000);
    }

    function doubleClick(elem) {
        var event = new MouseEvent("dblclick", {
            view: unsafeWindow,
            bubbles: true,
            cancelable: true
        });
        elem.dispatchEvent(event);
    }

    function initGhostSwitcher() {
        console.log("DIM ready");

        var ghosts = {};
        var rows = document.querySelectorAll(".store-row");

        for (var row of rows) {
            if (!row.querySelector("[aria-label=Ghost]")) { continue; }

            var items = row.querySelectorAll(".item");

            for (let item of items) {
                var text = item.querySelector("span");
                if (!text) { continue; }

                var aoe = text.innerText.replace("+", "plus"); // area of effect
                if (!aoe) { continue; }

                var equip = () => doubleClick(item);
                var name = item.title;
                var node = item;
                var ghost = { equip, name, ghost };
                ghosts[aoe] = ghosts[aoe] || ghost; // keep first, assuming best is first
                ghosts.default = ghosts.default || ghost;
            }
        }

        var arr = Object.values(ghosts);
        console.log("Found " + arr.length + " special ghosts:\n" + arr.map(i => i.name).join("\n"));
        monitorInGameStatus(ghosts);
    }

    function observeDIM() {
        var observer = new MutationObserver((records) => {
            for (var record of records) {
                for (var node of record.removedNodes) {
                    if (node.classList && node.classList.contains("exit-done")) {
                        initGhostSwitcher();
                        return;
                    }
                }
            }
        });

        observer.observe(document.getElementById('app'), { childList: true, subtree: true });
    }

    observeDIM();
})();
// ==/Code==