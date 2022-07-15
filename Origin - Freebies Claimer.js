// https://www.origin.com/game-library

(async () => {
    let authtoken = Origin.user.accessToken();
    let { pid } = await fetch("https://gateway.ea.com/proxy/identity/pids/me", {
        "headers": {
            "accept": "*/*",
            "authorization": "Bearer " + authtoken,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
            "x-extended-pids": "true",
            "x-include-underage": "true"
        },
        "referrer": "https://www.origin.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
    }).then(res => res.json());
    let { pidId, locale, country } = pid;
    country = locale.includes(country) ? country : locale.split("_")[1];
    let { offers } = await fetch(`https://api1.origin.com/supercat/${country}/${locale}/supercat-PCWIN_MAC-${country}-${locale}.json.gz`, { credentials: "omit" }).then(res => res.json());
    // let offersToRedeem = offers.filter(e => e.isZeroPricedOffer === "true").map(e => e.offerId);
    let offersToRedeem = [...new Set(offers.map(e => e.offerId).concat(offers.map(e => e.extraContent || []).flat()))]
    for (let id of offersToRedeem) {
        let { unlocks } = await fetch(`https://api1.origin.com/supercarp/freegames/${id}/users/${pidId}/checkoutwithcart?locale=${locale}&cartName=store-cart-direct`, {
            "headers": {
                "accept": "application/json",
                "accept-language": locale,
                authtoken,
                "content-type": "text/plain;charset=UTF-8",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1"
            },
            "referrer": "https://www.origin.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "",
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        }).then(res => res.json()).catch(() => ({}));
        if (unlocks) {
            for (let { offerId } of unlocks.unlock) {
                let o = offers.find(e => e.offerId === offerId);
                let name = o ? o.itemName : offerId;
                console.log(`Unlocked ${name}`);
            }
        }
    }
    console.log("Done!");
})();
