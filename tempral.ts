// import { PumpApi } from "@cryptoscan/pumpfun-sdk";

import { Connection, PublicKey } from "@solana/web3.js";
import { getTopHolders } from "./utils";
import axios from "axios";

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

// import WebSocket from "ws";

// const ws = new WebSocket("wss://pumpportal.fun/api/data");

// ws.on("open", function open() {
//   // Subscribing to token creation events
//   // let payload = {
//   //   method: "subscribeNewToken"
//   // };
//   // ws.send(JSON.stringify(payload));

//   let payload = {
//       method: "subscribeTokenTrade",
//       keys: ["AME5HASnyFV9fZRtKeF8VoterBV5YJRKRR5JS9EZfxzX"]
//     }
//   ws.send(JSON.stringify(payload));
// });

// ws.on("message", function message(data: string) {
//   console.log(JSON.parse(data));
// });

// (async () => {
//   const {data} = await axios.get("https://api.rugcheck.xyz/v1/tokens/H9pk9Wn2D2AVNyiFbeedP6yjDAA64fDo9YSEGZYpump/report/summary");
//   console.log(JSON.stringify(data, null, 2))
// })();
(async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com", {
    wsEndpoint: "wss://api.mainnet-beta.solana.com"
  });
  const tokenMint = new PublicKey(
    "HNWKrXFJZ29inRB9f1hNJTXm7ULnGMkinbcFkchVpump"
  );
  const tokenBOunding = "DBKtkLmRLcHcVL8W1JvLJUaTtDF46vFkkjqxq2kb16Dw"

  const tokenTop10 = await getTopHolders(tokenMint, connection, 10, tokenBOunding);
  console.log(JSON.stringify(tokenTop10.topHolders, null, 2));
  console.log(tokenTop10.totalTopHolderPercentage);
})();