// https://www.allkeyshop.com/blog/list/Revadike/305737/

console.log(JSON.stringify([...document.querySelectorAll("tr.game-row")].map(e => ({
gameId: e.dataset.gameId,
productId: e.querySelector(".metacritic-button").dataset.productId,
name: e.querySelector(".game-name").innerText.trim(),
metacriticScore: Number(e.querySelector(".metacritic-button").innerText.trim()),
steamPriceEUR: Number((e.querySelector(".game-steam-price").innerHTML.split("<br>")[1]||"").trim().replace("€", "")),
aksPriceEUR: Number(e.querySelector(".game-lowest-price a").innerText.trim().replace("€", "")),
url: e.querySelector("td:nth-child(2) > a").href,
img: e.querySelector("td:nth-child(2) > a > img").src
}))))
