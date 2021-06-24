/*
 * Made by Revadike (License MIT)
 *
 * The Masked Avenger (badge 51) = sum choices must be 14-16
 * The Trailblazing Explorer (badge 52) = sum choices must be 17-19
 * The Gorilla Scientist (badge 53) = sum choices must be 20-22
 * The Paranormal Professor (badge 54) = sum choices must be 23-25
 * The Ghost Detective (badge 55) = sum choices must be 26-28
*/

// Your 14 preferred story choices:
let choices = [2,2,2,2,2,2,2,2,2,2,2,2,2,2];

for (let i = 1; i <= 14; i++) {
    jQuery.post("https://store.steampowered.com/promotion/ajaxclaimstickerforgenre", { genre: i, choice: choices[i-1], sessionid: g_sessionID }, (res) => console.log("genre " + i + ":", res))
}
