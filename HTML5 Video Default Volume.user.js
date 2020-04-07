// ==UserScript==
// @name         HTML5 Video Default Volume
// @namespace    https://revadike.com
// @version      1.0
// @description  Sets a default volume level for all HTML5 videos
// @author       Revadike
// @include      *
// @grant        none
// ==/UserScript==

const VOLUME = 0.1;

(function() {
    'use strict';

    for (let video of document.getElementsByTagName("video")) {
        video.volume = VOLUME;
    }
})();