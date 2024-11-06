import { Connection, PublicKey } from "@solana/web3.js";
import {
  getEnv,
  getTopHolders,
  listenTokenFromPumpPortal,
  listenTokensFromPumpPortal
} from "./utils";
import WebSocket from "ws";
import axios from "axios";

interface TokenEntity {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: "create" | "buy" | "sell";
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  name: string;
  symbol: string;
  uri: string;
  totalTopHolderPercentage: number;
  associated_bonding_curve: string;
}

interface TokenUpdate extends TokenEntity {
  newTokenBalance: number;
  tokenAmount: number;
}

const { MC, TOP_HOLDERS, RPC, RPC_WSS } = getEnv();

(async () => {
  const ws = new WebSocket("wss://pumpportal.fun/api/data");

  const tokensString: string[] = [];
  const tokensToMonitor: TokenEntity[] = [];
  const finalTokensList: TokenEntity[] = [];

  async function handleNewToken(token: TokenEntity) {
    // TOP HOLDERS
    if (Number(TOP_HOLDERS)) {
      const connection = new Connection(RPC || "", {
        wsEndpoint: RPC_WSS
      });
      const tokenMint = new PublicKey(token.mint);
      const tokenTop10 = await getTopHolders(
        tokenMint,
        connection,
        Number(TOP_HOLDERS),
        token.associated_bonding_curve
      );
      token.totalTopHolderPercentage = Number(
        tokenTop10.totalTopHolderPercentage
      );
    }

    tokensToMonitor.push(token);
    tokensString.push(token.mint);
    listenTokenFromPumpPortal(tokensString, ws);
  }

  async function updateFinalTokensList(token: TokenUpdate) {
    const criterios = token.marketCapSol > MC;

    // 1 - CRITERIOS: Top holders
    if (Number(TOP_HOLDERS)) {
      const connection = new Connection(RPC || "", {
        wsEndpoint: RPC_WSS
      });
      const tokenMint = new PublicKey(token.mint);
      const tokenTop10 = await getTopHolders(
        tokenMint,
        connection,
        Number(TOP_HOLDERS),
        token.associated_bonding_curve
      );
      token.totalTopHolderPercentage = Number(
        tokenTop10.totalTopHolderPercentage
      );
    }

    if (criterios) {
      const index = finalTokensList.findIndex((t) => t.mint === token.mint);

      if (index === -1) {
        finalTokensList.push(token);
      } else {
        finalTokensList[index].marketCapSol = token.marketCapSol;
      }
    } else {
      const index = finalTokensList.findIndex((t) => t.mint === token.mint);
      if (index !== -1) {
        finalTokensList.splice(index, 1);
      }
    }

    console.log(
      "finalTokensList actualizado:",
      JSON.stringify(
        finalTokensList.map((item) => ({
          mint: item.mint,
          marketCapSol: item.marketCapSol,
          totalTopHolderPercentage: item.totalTopHolderPercentage
        })),
        null,
        2
      )
    );
  }

  ws.on("open", () => {
    listenTokensFromPumpPortal(ws);
    listenTokenFromPumpPortal(tokensString, ws);
  });

  ws.on("message", async function message(data: string) {
    const parsedData = JSON.parse(data);

    if (parsedData.txType === "create") {
      const { data } = await axios.get(
        "https://frontend-api.pump.fun/coins/" + parsedData.mint
      );
      parsedData.associated_bonding_curve = data.associated_bonding_curve;

      await handleNewToken(parsedData);
      console.log("parsedData create", JSON.stringify(parsedData, null, 2));
    } else if (parsedData.txType === "buy" || parsedData.txType === "sell") {
      console.log(
        "parsedData buy || sell",
        JSON.stringify(parsedData, null, 2)
      );
      await updateFinalTokensList(parsedData);
    }
  });

  ws.on("close", () => console.log("Conexión WebSocket cerrada."));
  ws.on("error", (error) => console.error("Error en WebSocket:", error));
})();
