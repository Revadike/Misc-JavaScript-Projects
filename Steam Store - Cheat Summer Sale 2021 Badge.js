/*
 * Made by Revadike (License MIT)
 *
 * The Masked Avenger (badge 51) = choices sum 14-16
 * The Trailblazing Explorer (badge 52) = choices sum 17-19
 * The Gorilla Scientist (badge 53) = choices sum 20-22
 * The Paranormal Professor (badge 54) = choices sum 23-25
 * The Ghost Detective (badge 55) = choices sum 26-28
*/

let choices = [1,1,1,1,1,1,1,1,1,1,1,1,1,1]; // make sure the sum matches your desired badge!

for (let i = 1; i <= 14; i++) {
    jQuery.post("https://store.steampowered.com/promotion/ajaxclaimstickerforgenre", { genre: i, choice: choices[i-1], sessionid: g_sessionID }, (res) => console.log("genre " + i + ":", res))
}
