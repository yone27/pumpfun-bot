import { Connection, PublicKey } from "@solana/web3.js";
import { getTopHolders } from "./utils";


(async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com", {
    wsEndpoint: "wss://api.mainnet-beta.solana.com"
  });
  const tokenMint = new PublicKey(
    "2ArXioYqAudYaQTZKdgAwiHbdH1m1QRR6he6mr5fpump"
  );

  const tokenTop10 = await getTopHolders(tokenMint, connection);
  console.log("Token top 10 holders:", tokenTop10);
})();