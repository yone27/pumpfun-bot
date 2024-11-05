// import { PumpApi } from "@cryptoscan/pumpfun-sdk";

// const api = new PumpApi();

// const coinAddress = "7drQ4FvB4zr4oNn9ip5PLuPebLP1R6sFS64Hdfzpump";

// api.listenCoinBump(coinAddress, (coin) => {
//   console.log("BUMPED", coin);
// });

// api.onMint((coin) => {
//   console.log(coin);
//   console.log({
//     name: coin.name,
//     description: coin.description,
//     symbol: coin.symbol,
//     website: coin.website,
//     telegram: coin.telegram,
//     twitter: coin.twitter,
//     created_timestamp: coin.created_timestamp,
//     mint: coin.mint,
//     king_of_the_hill_timestamp: coin.king_of_the_hill_timestamp,
//     creator: coin.creator,
//     usd_market_cap: coin.usd_market_cap,
//     market_cap_sol: coin.market_cap
//   });
// });

import WebSocket from "ws";

const ws = new WebSocket("wss://pumpportal.fun/api/data");

ws.on("open", function open() {
  // Subscribing to token creation events
  // let payload = {
  //   method: "subscribeNewToken"
  // };
  // ws.send(JSON.stringify(payload));

  let payload = {
      method: "subscribeTokenTrade",
      keys: ["AME5HASnyFV9fZRtKeF8VoterBV5YJRKRR5JS9EZfxzX"]
    }
  ws.send(JSON.stringify(payload));
});

ws.on("message", function message(data: string) {
  console.log(JSON.parse(data));
});


// const connection = new Connection("https://api.mainnet-beta.solana.com", {
  //   wsEndpoint: "wss://api.mainnet-beta.solana.com"
  // });
  // const tokenMint = new PublicKey(
  //   "2ArXioYqAudYaQTZKdgAwiHbdH1m1QRR6he6mr5fpump"
  // );

  // const tokenTop10 = await getTopHolders(tokenMint, connection);
  // console.log("Token top 10 holders:", tokenTop10);