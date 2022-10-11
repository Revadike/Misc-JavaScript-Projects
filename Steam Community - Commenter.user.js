// ==UserScript==
// @name         Steam Community - Commenter
// @namespace    Revadike
// @version      1.0.2
// @description  Leaves steam group & discussion comments
// @author       Revadike
// @match        https://steamcommunity.com/groups/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// ==/UserScript==

/* eslint-env browser */
/* eslint-disable no-alert */
/* global unsafeWindow, GM */

let comments = [];
let max = 7;
// ms between each request (avoid steam rate limit ban)
let delay = 0;
// steam web api key
let apikey = "";

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function getGid(g) {
    g = g.replace("https://steamcommunity.com/groups/", "").replace("https://steamcommunity.com/gid/", "")
        .replace("/", "");
    if (isFinite(g) && g.toString().length === 18) {
        return g;
    }
    let { response } = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apikey}&vanityurl=${g}&url_type=2`, { "credentials": "omit" }).then((res) => res.json());
    await sleep(delay);
    if (response.success === 1) {
        return response.steamid;
    }
    throw new Error(`Failed to get steamid for '${g}'`);
}

async function showModal(start) {
    unsafeWindow.ShowDialog("Automatic Commenter by Revadike",
        `<div style="float: right;">
        <label for="max">Max comments (in total): </label>
        <br />
        <input type="number" id="max" value="${max}" min="0"  />
        </div>
        <label for="delay">Delay between comments (in ms): </label>
        <br />
        <input type="number" id="delay" value="${delay}" min="0"  />
        <br />
        <p>Comments:</p>
        <div id="comments">
        ${comments.map((c) => `<textarea class="comment" style="width: 100%; height: 100px; margin-bottom: 10px;">${c}</textarea>`).join("")}
        </div>
        <br />
        <a href="#" id="add">Add Comment</a>
        <br />
        <br />
        <p>Log:</p>
        <textarea id="log" style="width: 100%; height: 100px; margin-bottom: 10px;" readonly></textarea>
        <br />
        <button class="btn_green_white_innerfade btn_medium" id="startBtn">
            <span>Start</span>
        </button>`);
    document.getElementById("add").addEventListener("click", () => {
        comments.push("");
        document.getElementById("comments").insertAdjacentHTML("beforeend", "<textarea class=\"comment\" style=\"width: 100%; height: 100px; margin-bottom: 10px;\"></textarea>");
    });
    document.getElementById("startBtn").addEventListener("click", async() => {
        document.getElementById("startBtn").disabled = true;
        delay = Number(document.getElementById("delay").value);
        max = Number(document.getElementById("max").value);
        comments = Array.from(document.getElementsByClassName("comment")).map((c) => c.value)
            .filter((c) => c.trim());
        await GM.setValue("comments", JSON.stringify(comments));
        await GM.setValue("delay", delay);
        await GM.setValue("max", max);
        start();
    });
}

async function groupCommenter() {
    showModal(async() => {
        let gid = await getGid(location.pathname.split("/")[2]);
        let i = 0;
        let sessionid = unsafeWindow.g_sessionID;
        while (i < max) {
            await fetch(`https://steamcommunity.com/comment/Clan/post/${gid}/-1/`, {
                "credentials": "include",
                "method":      "POST",
                "headers":     { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "body":        `comment=${encodeURIComponent(comments[i % comments.length])}&count=1&sessionid=${sessionid}&feature2=-1`,
            });
            document.getElementById("log").value += `Posted comment ${i + 1}/${max}: ${comments[i % comments.length].substring(0, 20)}...\n`;
            i++;
            await sleep(delay);
        }
        document.getElementById("log").value += "Done! Refresh page to see the results.";
    });
}

async function discussionCommenter() {
    showModal(async() => {
        let { owner, extended_data, feature, feature2 } = Object.values(unsafeWindow.g_rgCommentThreads)[0].m_rgCommentData;
        let i = 0;
        let sessionid = unsafeWindow.g_sessionID;
        while (i < max) {
            await fetch(`https://steamcommunity.com/comment/ForumTopic/post/${owner}/${feature}/`, {
                "credentials": "include",
                "method":      "POST",
                "headers":     { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "body":        `comment=${encodeURIComponent(comments[i % comments.length])}&count=1&sessionid=${sessionid}&extended_data=${encodeURIComponent(extended_data)}&feature2=${feature2}&oldestfirst=true&include_raw=true`,
            });
            document.getElementById("log").value += `Posted comment ${i + 1}/${max}: ${comments[i % comments.length].substring(0, 20)}...\n`;
            i++;
            await sleep(delay);
        }
        document.getElementById("log").value += "Done! Refresh page to see the results.";
    });
}

(async() => {
    console.log("Comments Filter by Revadike");
    comments = JSON.parse(await GM.getValue("comments", "[]")).filter((c) => c.trim());
    max = Number(await GM.getValue("max", 5));
    delay = Number(await GM.getValue("delay", 1000));
    apikey = (await GM.getValue("apikey", "")).trim();
    if (apikey === "") {
        let _apikey = await fetch("https://steamcommunity.com/dev/apikey?l=english").then((res) => res.text())
            .then((html) => html.match(/Key: ([0-9A-Z]{32})/)[1])
            .catch(() => null);
        if (!_apikey) {
            alert("Cannot find API key! Please generate one @ https://steamcommunity.com/dev/apikey");
        }
        await GM.setValue("apikey", _apikey);
        apikey = _apikey;
    }

    const buttonsHtml = `
        <div class="content">
            <button class="btn_green_white_innerfade btn_medium" id="filterBtn">
                <span>Automatic Commenter</span>
            </button>
        </div>
        <div class="rule"></div>
    `;

    switch (true) {
        case /^\/groups\/.+\/discussions\/.+/.test(location.pathname):
            document.querySelector("#group_tab_content_discussions > div > div.rightcol.responsive_local_menu > div:nth-child(2)").insertAdjacentHTML("afterbegin", buttonsHtml);
            document.querySelector("#filterBtn").addEventListener("click", discussionCommenter);
            break;
        case /^\/groups\/.+\/comments\/?$/.test(location.pathname):
            document.querySelector(".hasContentBoxes").insertAdjacentHTML("afterbegin", buttonsHtml);
            document.querySelector("#filterBtn").addEventListener("click", groupCommenter);
            break;
        default:
            break;
    }
})();
