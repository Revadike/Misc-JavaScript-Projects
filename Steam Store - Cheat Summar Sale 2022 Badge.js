/* eslint-env browser */
/* global g_sessionID jQuery */

/*  HOW TO USE:
    1.  Open Console tab of your browser's DevTools.
        Chrome: CTRL+SHIFT+J
        Firefox: CTRL+SHIFT+K
    2.  Copy-paste this entire script.
    3.  Press ENTER and wait.
        It should claim all 10 badges and then the final reward.
*/

/* Thanks to Sqbika#0657 for the initial script */

(async() => {
    if (!jQuery("#application_config").data("userinfo")) {
        // eslint-disable-next-line no-alert
        alert("Sale settings not found. Redirecting to a compatible page...");
        location.href = "https://store.steampowered.com/sale/clorthax_quest";
        return;
    }

    let delay = (ms) => new Promise((res) => setTimeout(res, ms));
    let { authwgtoken } = jQuery("#application_config").data("userinfo");
    await jQuery.post("/saleaction/ajaxopendoor", {
        authwgtoken,
        "sessionid":      g_sessionID,
        "door_index":     0,
        "clan_accountid": 41316928,
    });
    for (let link of [
        "/category/arcade_rhythm/?snr=1_614_615_clorthaxquest_1601",
        "/category/strategy_cities_settlements/?snr=1_614_615_clorthaxquest_1601",
        "/category/sports/?snr=1_614_615_clorthaxquest_1601",
        "/category/simulation/?snr=1_614_615_clorthaxquest_1601",
        "/category/multiplayer_coop/?snr=1_614_615_clorthaxquest_1601",
        "/category/casual/?snr=1_614_615_clorthaxquest_1601",
        "/category/rpg/?snr=1_614_615_clorthaxquest_1601",
        "/category/horror/?snr=1_614_615_clorthaxquest_1601",
        "/vr/?snr=1_614_615_clorthaxquest_1601",
        "/category/strategy/?snr=1_614_615_clorthaxquest_1601",
    ]) {
        try {
            let html = await jQuery.get(link);
            await jQuery.post("/saleaction/ajaxopendoor", {
                "sessionid":      g_sessionID,
                "authwgtoken":    jQuery("#application_config", html).data("userinfo").authwgtoken,
                "door_index":     jQuery("#application_config", html).data("capsuleinsert").payload,
                "clan_accountid": 41316928,
                "datarecord":     jQuery("#application_config", html).data("capsuleinsert").datarecord,
            });
            console.log("You got a new badge!");
        } catch (e) {
            console.error("Failed to obtain badge!", e);
        } finally {
            await delay(1500);
        }
    }
    await jQuery.post("/saleaction/ajaxopendoor", {
        authwgtoken,
        "sessionid":      g_sessionID,
        "door_index":     11, // final reward
        "clan_accountid": 39049601, // https://store.steampowered.com/news/group/39049601
    }).done((json) => {
        // eslint-disable-next-line eqeqeq
        if (json.success == 1) {
            console.log("Claimed final reward!");
        } else {
            console.error("Failed to claim final reward.\nTry again or claim it yourself?", json);
        }
    })
        .fail(() => { console.error("Final reward request failed!"); });
})();
