**This "fixes" `product already available in steam library` error on SteamDB, by temporarily removing existing owned packages of games and restore it after redeeming the free-on-demand (FOD) package.**

**Disclaimer! Please do not execute this if you have too many results saying `product already available in steam library`, as you may end up stressing the servers of SteamDB.**

0. Install the SteamDB browser extension
1. Run free packages script (<https://steamdb.info/freepackages/>) via the `Activate these packages now` button
2. Run this script and copy the `subs` array:
```js
console.log([...new Set([].concat(...(await Promise.all($("#loading > div:contains(already) a").get().map(async (a) => {
let fodsub = a.href.split("/")[4];
let appid = $('.package[data-subid="' + fodsub + '"]').data("appid");
let data = await $.get("https://steamdb.info/app/" + appid + "/subs/");
let subs = $('.package[data-subid]:not([data-subid="' + fodsub + '"]) a', data).get().map(a => a.innerText);
return subs;
})))))].join(","));
```
3. Go to <https://help.steampowered.com/>
4. Run this script with your `subs` array (removes owned subs):
```js
subs = [PASTE_SUBS_ARRAY_HERE];
subs.forEach(sub => $J.ajax({ url: '/en/wizard/AjaxDoPackageRemove', type: "POST", dataType : 'json', data: { packageid: sub, sessionid: g_sessionID, wizard_ajax: 1 }, success: function( data, status, xhr ){ if (data.success){ console.log(data.hash); } else { console.log(data.errorMsg); } }, fail: function( data, status, xhr ){ console.log(status); } }));
```
5. Re-run free packages script (<https://steamdb.info/freepackages/>) via the `Activate these packages now` button
6. Go to <https://help.steampowered.com/> again
7. Run this script with your `subs` array (restores owned subs):
```js
subs = [PASTE_SUBS_ARRAY_HERE];
subs.forEach(sub => $J.ajax({ url: '/en/wizard/AjaxDoPackageRestore', type: "POST", dataType : 'json', data: { packageid: sub, sessionid: g_sessionID, wizard_ajax: 1 }, success: function( data, status, xhr ){ if (data.success){ console.log(data.hash); } else { console.log(data.errorMsg); } }, fail: function( data, status, xhr ){ console.log(status); } }));
```
