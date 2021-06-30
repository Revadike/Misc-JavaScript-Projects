// ==UserScript==
// @name         SteamDB - Free Packages Refresher & Executer
// @namespace    Revadike
// @version      0.1
// @author       Revadike
// @include      https://steamdb.info/freepackages*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at       document-idle
// @grant        none
// ==/UserScript==

const waitForHours = 1;
const greenBtn = document.getElementById("js-activate-now");
setTimeout(() => greenBtn.click(), 5000);
setTimeout(() => location.reload(), waitForHours * 60 * 60 * 1000);
