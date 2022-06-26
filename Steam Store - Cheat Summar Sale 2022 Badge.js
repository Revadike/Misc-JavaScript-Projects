/* eslint-env browser */
/* global g_sessionID jQuery */

/* Thanks to Sqbika#0657 for the initial script */

(async() => {
    let delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await jQuery.post("/saleaction/ajaxopendoor", {
        "sessionid":      g_sessionID,
        "authwgtoken":    jQuery("#application_config").data("userinfo").authwgtoken,
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
    };
    
	try {
		console.log("Claiming the final reward... (1/3)");
		let html = await jQuery.get("/sale/clorthax_quest");
		await jQuery.post("/saleaction/ajaxopendoor", {
			"sessionid":      g_sessionID,
			"authwgtoken":    jQuery("#application_config", html).data("userinfo").authwgtoken,
			"door_index":     11, // final reward
			"clan_accountid": 39049601, // https://store.steampowered.com/news/group/39049601
		})
		.done((data) => {
			console.log("Response received: (2/3)");
			const json = JSON.parse(data);
			if (json.success == 1) {
				console.log("Succeeded! (3/3)");
			} else {
				console.error(data);
				console.error("Error occured. Try again or click yourself? (3/3)");
			}
		})
		.fail(() => {console.error("Final reward request failed!")});
	} catch (e) {
		console.error("Failed to obtain final reward!", e);
	} finally {
		await delay(1500);
	}
})();
