import { listenTokenFromPumpPortal, listenTokensFromPumpPortal } from "./utils";
import WebSocket from "ws";

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
}

interface TokenUpdate extends TokenEntity {
  newTokenBalance: number;
  tokenAmount: number;
}

(async () => {
  const ws = new WebSocket("wss://pumpportal.fun/api/data");

  const tokensString: string[] = [];
  const tokensToMonitor: TokenEntity[] = [];
  const finalTokensList: TokenEntity[] = [];

  function handleNewToken(token: TokenEntity) {
    console.log("Nuevo token detectado:", JSON.stringify(token.mint));
    tokensToMonitor.push(token);
    tokensString.push(token.mint);
    listenTokenFromPumpPortal(tokensString, ws);
  }

  function updateFinalTokensList(token: TokenUpdate) {
    const criterios = token.marketCapSol > 50;

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
          marketCapSol: item.marketCapSol
        }))
      )
    );
  }

  ws.on("open", () => {
    listenTokensFromPumpPortal(ws);
    listenTokenFromPumpPortal(tokensString, ws);
  });

  ws.on("message", function message(data: string) {
    const parsedData = JSON.parse(data);

    if (parsedData.txType === "create") {
      handleNewToken(parsedData);
    } else if (parsedData.txType === "buy" || parsedData.txType === "sell") {
      updateFinalTokensList(parsedData);
    }
  });

  ws.on("close", () => console.log("Conexión WebSocket cerrada."));
  ws.on("error", (error) => console.error("Error en WebSocket:", error));
})();
