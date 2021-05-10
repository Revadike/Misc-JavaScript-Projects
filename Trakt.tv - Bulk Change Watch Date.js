// Changes all your watch dates in history listings to release date

let lastpage = 64;
let username = "";
let csrfToken = "";

async function fixWatchDate(type, url, id) {
    await fetch(url + "/watch/remove", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-csrf-token": csrfToken,
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://trakt.tv/users/" + username + "/history",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "type=" + type + "&trakt_id=" + id,
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    });
    await fetch(url + "/watch", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-csrf-token": csrfToken,
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://trakt.tv/users/" + username + "/history",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "type=" + type + "&trakt_id=" + id + "&watched_at=released&collected_at=released&force=false",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    });

}


for (let page = 1; page <= lastpage; page++) {
    let html = await fetch("https://trakt.tv/users/" + username + "/history/all/added?page=" + page, {
      "headers": {
        "accept": "text/html, application/xhtml+xml",
        "accept-language": "en",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "turbolinks-referrer": "https://trakt.tv/users/" + username + "/history"
      },
      "referrer": "https://trakt.tv/users/" + username + "/history",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(res => res.text());
    let parser = new DOMParser();
    let DOM = parser.parseFromString(html, "text/html");
    let promises = [];
    for (let node of DOM.querySelectorAll(".grid-item")) {
        let { url, type } = node.dataset
        let id = node.dataset[type + "Id"];
        promises.push(fixWatchDate(type, url, id).catch(error => console.log({id, type, url, error})));
    }
    await Promise.all(promises);
}
