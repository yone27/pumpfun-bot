import { Connection, PublicKey } from "@solana/web3.js";
import {
  API_URL,
  getEnv,
  getTopHolders,
  listenTokenFromPumpPortal
} from "./utils";
import WebSocket from "ws";
import axios from "axios";
import { Token, TokenUpdate } from "./entities";

const { MC, TOP_HOLDERS, RPC, RPC_WSS, RUG_CHECK, TOP_HOLDER_PERCENTAGE } =
  getEnv();

(async () => {
  const ws = new WebSocket("wss://pumpportal.fun/api/data");

  const tokensMap: Map<string, Token> = new Map();
  const tokensString: string[] = [];
  const qualifiedTokens: Map<string, Token> = new Map();

  function handleNewTokens(token: Token) {
    // Verifica si el token ya existe en el Map
    if (!tokensMap.has(token.mint)) {
      tokensMap.set(token.mint, token);
      tokensString.push(token.mint);

      listenTokenFromPumpPortal(tokensString, ws);
    }
  }

  async function updateFinalTokensList(token: TokenUpdate) {
    const currentToken = tokensMap.get(token.mint);
    let criterios = [];

    // Verificar criterios como Market Cap y Top Holders
    if (MC) {
      // console.log("MC:", MC);
      // console.log("marketCapSol:", token.marketCapSol);
      // console.log("Mint:", token.mint);

      criterios.push(token.marketCapSol < MC ? false : true);
    }

    if (Number(TOP_HOLDERS)) {
      // console.log({ TOP_HOLDERS });
    }

    if (RUG_CHECK) {
      // console.log({ RUG_CHECK });
    }

    // Siempre actualizamos el marketCapSol en el token actual
    if (currentToken) {
      currentToken.marketCapSol = token.marketCapSol;
    }

    if (criterios.every((c) => c)) {
      if (currentToken) {
        qualifiedTokens.set(token.mint, currentToken);
        console.log(
          "Qualified Tokens después de actualizar:",
          Array.from(qualifiedTokens.keys())
        );
      }
    } else {
      qualifiedTokens.delete(token.mint);
    }
  }

  ws.on("open", () => {
    listenTokenFromPumpPortal(tokensString, ws);
  });

  ws.on("message", async function message(data: string) {
    const parsedData = JSON.parse(data);

    if (parsedData.txType === "buy" || parsedData.txType === "sell") {
      console.log({parsedData})
      await updateFinalTokensList(parsedData);
      console.log("Tokens escuchandos: " + tokensString.length);
    }
  });

  // Función para obtener los datos de nuevos tokens
  const fetchNewTokens = async () => {
    try {
      const response = await axios.get(API_URL);
      const token: Token = response.data;
      // const tokens: Token[] = response.data;

      // for (const token of tokens) {
        handleNewTokens(token);
      // }
    } catch (error) {
      console.error("Error al obtener los tokens:", error);
    }
  };

  setInterval(fetchNewTokens, 20000);

  ws.on("close", () => console.log("Conexión WebSocket cerrada."));
  ws.on("error", (error) => console.error("Error en WebSocket:", error));
})();
