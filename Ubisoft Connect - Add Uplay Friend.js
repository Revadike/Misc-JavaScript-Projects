// the uplay group list, please change
const UPLAYGROUP = `

PERSON1
PERSON2
PERSON3
ETC
REPLACE THIS
PASTE THE UPLAY GROUP LIST HERE

`;

// the code, do not touch

/* eslint-disable no-console */
const DELAY = 4000;

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

// the code, do not touch
async function addUplayFriend(name, delay) {
    if (delay) {
        await sleep(delay);
    }
    let data = JSON.parse(localStorage.PRODOverlayConnectLoginData);
    let { profiles } = await fetch(`https://public-ubiservices.ubi.com/v2/profiles?nameOnPlatform=${name}&platformType=uplay`, {
        "headers": {
            "accept":          "*/*",
            "accept-language": "en",
            "authorization":   `Ubi_v1 t=${data.ticket}`,
            "cache-control":   "no-cache",
            "pragma":          "no-cache",
            "sec-fetch-dest":  "empty",
            "sec-fetch-mode":  "cors",
            "sec-fetch-site":  "cross-site",
            "sec-gpc":         "1",
            "ubi-appid":       "314d4fef-e568-454a-ae06-43e3bece12a6",
            "ubi-sessionid":   data.sessionId,
        },
        "referrer":       "https://connect.ubisoft.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body":           null,
        "method":         "GET",
        "mode":           "cors",
        "credentials":    "omit",
    }).then((res) => res.json());

    let friend = profiles[0];
    if (!friend) {
        throw new Error(`Could not find uplay user: ${name}`);
    }

    let result = await fetch(`https://public-ubiservices.ubi.com/v3/profiles/${data.user_id}/friends`, {
        "headers": {
            "accept":          "*/*",
            "accept-language": "en",
            "authorization":   `Ubi_v1 t=${data.ticket}`,
            "cache-control":   "no-cache",
            "content-type":    "application/json;charset=UTF-8",
            "pragma":          "no-cache",
            "sec-fetch-dest":  "empty",
            "sec-fetch-mode":  "cors",
            "sec-fetch-site":  "cross-site",
            "sec-gpc":         "1",
            "ubi-appid":       "314d4fef-e568-454a-ae06-43e3bece12a6",
            "ubi-sessionid":   data.sessionId,
        },
        "referrer":       "https://connect.ubisoft.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body":           `{"friends":["${friend.userId}"]}`,
        "method":         "POST",
        "mode":           "cors",
        "credentials":    "omit",
    }).then((res) => res.json());

    console.log("Added Uplay Friend", JSON.stringify({ friend, result }, null, 4));
}

(async() => {
    await Promise.all(UPLAYGROUP.split("\n").map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((name, i) => addUplayFriend(name, i * DELAY).catch((err) => console.error(err))));

    console.log("Done adding all Uplay friends!\nLove, Revadike <3");
})();
