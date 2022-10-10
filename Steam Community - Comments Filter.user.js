// ==UserScript==
// @name         Steam Community - Comments Filter
// @namespace    Revadike
// @version      1.0.0
// @description  Filter comments by user and date range
// @author       Revadike
// @match        https://steamcommunity.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamcommunity.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// ==/UserScript==


// DO NOT TOUCH


// whitelist of steam user you show comments of
let whitelist = [];
// only show the comments of the last x days
let showMostRecentDays = 7;
// ms between each request (avoid steam rate limit ban)
let delay = 0;
// steam web api key
let apikey = "";

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function steamid2accountid(steam64str) {
    let divide = (str) => {
        let { length } = str;
        let result = [];
        let num = 0;
        for (let i = 0; i < length; i++) {
            num += Number(str[i]);
            let r = Math.floor(num / 2);
            num = ((num - (2 * r)) * 10);
            if (r !== 0 || result.length !== 0) {
                result.push(r);
            }
        }
        return [result, num > 0 ? 1 : 0];
    };
    let getBinary = (str) => {
        let upper32 = 0;
        let lower32 = 0;
        let index = 0;
        let bit = 0;
        let _str = str;
        do {
            [_str, bit] = divide(_str);
            if (bit) {
                if (index < 32) {
                    lower32 |= (1 << index);
                } else {
                    upper32 |= (1 << (index - 32));
                }
            }
            index++;
        } while (_str.length > 0);
        return [upper32, lower32];
    };
    let [upper32, lower32] = getBinary(steam64str);
    let _y = lower32 & 1;
    return ((lower32 & (((1 << 31) - 1) << 1)) >> 1) << 1 | _y;
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

async function getSid(s) {
    s = s.replace("https://steamcommunity.com/profiles/", "").replace("https://steamcommunity.com/id/", "")
        .replace("/", "");
    if (isFinite(s) && s.toString().length === 18) {
        return s;
    }
    let { response } = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apikey}&vanityurl=${s}&url_type=1`, { "credentials": "omit" }).then((res) => res.json());
    await sleep(delay);
    if (response.success === 1) {
        return response.steamid;
    }
    throw new Error(`Failed to get steamid for '${s}'`);
}

async function convertWhiteList() {
    whitelist = await Promise.all(whitelist.map(async(p) => {
        p = p.toString().replace("https://steamcommunity.com/id/", "")
            .replace("https://steamcommunity.com/profiles/", "")
            .replace("/", "");
        if (isFinite(p) && p.toString().length === 17) {
            return steamid2accountid(p);
        }
        if (isFinite(p) && p.toString().length < 17) {
            return Number(p);
        }
        let { response } = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apikey}&vanityurl=${p}&url_type=1`, { "credentials": "omit" }).then((res) => res.json());
        await sleep(delay);
        if (response.success === 1) {
            return steamid2accountid(response.steamid);
        }
        throw new Error(`Failed to get steamid for '${p}'`);
    }));
}

async function cleanGroupComments(evt) {
    evt.target.closest("button").disabled = true;
    await convertWhiteList();
    let gid = await getGid(location.pathname.split("/")[2]);
    let parser = new DOMParser();
    let allComments = [];
    let total = Infinity;
    let start = 0;
    let count = 1000;
    let enddate = (Date.now() - (showMostRecentDays * 24 * 60 * 60 * 1000)) / 1000;
    let commentdate = Infinity;
    while (total > start * count && commentdate > enddate) {
        let { comments_html, total_count } = await fetch(`https://steamcommunity.com/comment/Clan/render/${gid}/-1/?start=${start * count}&totalcount=${total}&count=${count}`).then((res) => res.json());
        if (!comments_html) {
            throw new Error(`Failed to get comments for group ${gid}`);
        }
        let doc = parser.parseFromString(comments_html, "text/html");
        let comments = [...doc.querySelectorAll(".commentthread_comment")];
        commentdate = Math.min(...comments.map((c) => Number(c.querySelector("[data-timestamp]").getAttribute("data-timestamp"))));
        allComments = allComments.concat(comments);
        total = total_count;
        start++;
        await sleep(delay);
    }
    let filteredComments = allComments.filter((c) => whitelist.includes(Number(c.querySelector(".commentthread_comment_avatar [data-miniprofile]").getAttribute("data-miniprofile"))));
    document.querySelector(".commentthread_count_label > span").innerHTML = filteredComments.length;
    for (let node of document.querySelectorAll(".commentthread_paging")) {
        node.remove();
    }
    document.querySelector(".commentthread_comments").innerHTML = filteredComments.map((c) => c.outerHTML).join("");
    alert("Done!");
    evt.target.closest("button").disabled = false;
}

async function cleanDiscussionComments(evt) {
    evt.target.closest("button").disabled = true;
    await convertWhiteList();
    let parser = new DOMParser();
    let allComments = [];
    let total = Infinity;
    let start = 0;
    let count = 1000;
    let enddate = (Date.now() - (showMostRecentDays * 24 * 60 * 60 * 1000)) / 1000;
    let commentdate = Infinity;
    let { owner, extended_data, feature, feature2 } = Object.values(unsafeWindow.g_rgCommentThreads)[0].m_rgCommentData;
    while (total > start * count && commentdate > enddate) {
        let { comments_html, total_count } = await fetch(`https://steamcommunity.com/comment/ForumTopic/render/${owner}/${feature}/?start=${start * count}&totalcount=${total}&count=${count}&extended_data=${encodeURIComponent(extended_data)}&feature2=${feature2}&oldestfirst=true&include_raw=true`).then((res) => res.json());
        if (!comments_html) {
            throw new Error(`Failed to get comments for discussion ${feature2} of group ${owner}`);
        }
        let doc = parser.parseFromString(comments_html, "text/html");
        let comments = [...doc.querySelectorAll(".commentthread_comment")];
        commentdate = Math.min(...comments.map((c) => Number(c.querySelector("[data-timestamp]").getAttribute("data-timestamp"))));
        allComments = allComments.concat(comments);
        total = total_count;
        start++;
        await sleep(delay);
    }
    let filteredComments = allComments.filter((c) => whitelist.includes(Number(c.querySelector(".commentthread_comment_avatar [data-miniprofile]").getAttribute("data-miniprofile"))));
    document.querySelector(".forum_paging_summary").innerHTML = `Showing ${filteredComments.length} comments`;
    for (let node of document.querySelectorAll(".forum_paging_controls")) {
        node.remove();
    }
    document.querySelector(".commentthread_comments").innerHTML = filteredComments.map((c) => c.outerHTML).join("");
    alert("Done!");
    evt.target.closest("button").disabled = false;
}

async function cleanProfileComments(evt) {
    evt.target.closest("button").disabled = true;
    await convertWhiteList();
    let sid = await getSid(location.pathname.split("/")[2]);
    let parser = new DOMParser();
    let allComments = [];
    let total = Infinity;
    let start = 0;
    let count = 1000;
    let enddate = (Date.now() - (showMostRecentDays * 24 * 60 * 60 * 1000)) / 1000;
    let commentdate = Infinity;
    while (total > start * count && commentdate > enddate) {
        let { comments_html, total_count } = await fetch(`https://steamcommunity.com/comment/Profile/render/${sid}/-1/?start=${start * count}&totalcount=${total}&count=${count}`).then((res) => res.json());
        if (!comments_html) {
            throw new Error(`Failed to get comments for profile ${sid}`);
        }
        let doc = parser.parseFromString(comments_html, "text/html");
        let comments = [...doc.querySelectorAll(".commentthread_comment")].filter((c) => c.querySelector("[data-timestamp]"));
        commentdate = Math.min(...comments.map((c) => Number(c.querySelector("[data-timestamp]").getAttribute("data-timestamp"))));
        allComments = allComments.concat(comments);
        total = total_count;
        start++;
        await sleep(delay);
    }
    let filteredComments = allComments.filter((c) => whitelist.includes(Number(c.querySelector(".commentthread_comment_avatar [data-miniprofile]").getAttribute("data-miniprofile"))));
    document.querySelector(".commentthread_count_label > span").innerHTML = filteredComments.length;
    for (let node of document.querySelectorAll(".commentthread_paging")) {
        node.remove();
    }
    document.querySelector(".commentthread_comments").innerHTML = filteredComments.map((c) => c.outerHTML).join("");
    alert("Done!");
    evt.target.closest("button").disabled = false;
}

async function setWhitelist() {
    let _whitelist = prompt("Enter a comma separated list of steamids to whitelist", whitelist.join(","));
    if (_whitelist === null) {
        return;
    }
    _whitelist = _whitelist.split(",").map((x) => x.trim())
        .join(",");
    await GM.setValue("whitelist", _whitelist);
    whitelist = _whitelist.split(",");
}

async function setDays() {
    let _days = prompt("Enter the number of most recent days to show comments from", showMostRecentDays);
    if (_days === null) {
        return;
    }
    _days = Number(_days);
    if (isNaN(_days)) {
        alert("Invalid number");
        return;
    }
    await GM.setValue("days", _days);
    showMostRecentDays = _days;
}

async function setDelay() {
    let _delay = prompt("Enter the delay between each request in ms", delay);
    if (_delay === null) {
        return;
    }
    _delay = Number(_delay);
    if (isNaN(_delay)) {
        alert("Invalid number");
        return;
    }
    await GM.setValue("delay", _delay);
    delay = _delay;
}

(async() => {
    console.log("Comments Filter by Revadike");
    whitelist = (await GM.getValue("whitelist", "")).split(",");
    showMostRecentDays = Number(await GM.getValue("days", 7));
    delay = Number(await GM.getValue("delay", 0));
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
                <span>Filter Comments</span>
            </button>
            <button class="btn_blue_white_innerfade btn_medium" id="setWhitelistBtn">
                <span>Set Whitelist</span>
            </button>
            <button class="btn_blue_white_innerfade btn_medium" id="setDaysBtn">
                <span>Set Days</span>
            </button>
            <button class="btn_blue_white_innerfade btn_medium" id="setDelayBtn">
                <span>Set Delay</span>
            </button>
        </div>
        <div class="rule"></div>
    `;

    let setButtons = () => {
        document.querySelector("#setWhitelistBtn").addEventListener("click", setWhitelist);
        document.querySelector("#setDaysBtn").addEventListener("click", setDays);
        document.querySelector("#setDelayBtn").addEventListener("click", setDelay);
    };

    switch (true) {
        case /^\/groups\/.+\/discussions\/.+/.test(location.pathname):
            document.querySelector("#group_tab_content_discussions > div > div.rightcol.responsive_local_menu > div:nth-child(2)").insertAdjacentHTML("afterbegin", buttonsHtml);
            document.querySelector("#filterBtn").addEventListener("click", cleanDiscussionComments);
            setButtons();
            break;

        case /^\/(id|profiles)\/.+\/allcomments\/?$/.test(location.pathname):
            document.querySelector("#BG_bottom > div").insertAdjacentHTML("afterbegin", buttonsHtml);
            document.querySelector("#filterBtn").addEventListener("click", cleanProfileComments);
            setButtons();
            break;

        case /^\/groups\/.+\/comments\/?$/.test(location.pathname):
            document.querySelector(".hasContentBoxes").insertAdjacentHTML("afterbegin", buttonsHtml);
            document.querySelector("#filterBtn").addEventListener("click", cleanGroupComments);
            setButtons();
            break;
        default:
            break;
    }
})();
