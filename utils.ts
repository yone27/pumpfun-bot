import { Connection, PublicKey } from "@solana/web3.js";

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getEnv = () => {
  return {
    MC: process.env.MC ? parseFloat(process.env.MC) : 0,
    TOP_HOLDERS: process.env.TOP_HOLDERS
      ? parseFloat(process.env.TOP_HOLDERS)
      : 0,
    TOP_HOLDER_PERCENTAGE: process.env.TOP_HOLDER_PERCENTAGE
      ? parseFloat(process.env.TOP_HOLDER_PERCENTAGE)
      : 0,
    RPC: process.env.RPC,
    RPC_WSS: process.env.RPC_WSS,
    RUG_CHECK: true,
    ONE_SOCIAL: process.env.ONE_SOCIAL == "TRUE" ? true : false
  };
};

export async function getTopHolders(
  tokenMint: PublicKey,
  connection: Connection,
  numberHolders: number,
  bondingCurved: string
) {
  try {
    let decimals: number = 0;

    // Obtener la cantidad total de tokens : aunque podría quitar esta consulta ya que los tokens de pumpfun tienen 1b de supply
    const { value: tokenSupply } = await connection.getTokenSupply(tokenMint);
    decimals = tokenSupply.decimals;
    const totalSupply = parseFloat(tokenSupply.uiAmountString ?? "0");

    // Obtener las cuentas de los holders principales y filtrar el bonding curve
    const largestAccounts = await connection.getTokenLargestAccounts(tokenMint);
    const filteredAccounts = largestAccounts.value.filter(
      (item) => item.address.toBase58() !== bondingCurved
    );

    // Calcular el porcentaje de tokens de cada holder principal
    let totalTopHolderPercentage = 0;
    const topHolders = filteredAccounts
      .slice(0, numberHolders)
      .map((account: any) => {
        const balance =
          account.uiAmount ??
          parseFloat(account.amount) / Math.pow(10, decimals);
        const percentage = ((balance / totalSupply) * 100).toFixed(2);
        totalTopHolderPercentage += Number(percentage);

        return {
          publicKey: account.address.toBase58(),
          balance: balance.toLocaleString("es", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          percentage: `${percentage}%`,
          ...account
        };
      });

    return {
      topHolders,
      totalTopHolderPercentage: totalTopHolderPercentage.toFixed(2)
    };
  } catch (error) {
    console.error("Error fetching token information:", error);
    return { topHolders: [], totalTopHolderPercentage: "0%" };
  }
}

export async function getMinHolders(
  tokenMint: PublicKey,
  connection: Connection,
  ownerMint: string
) {
  try {
    const largestAccounts = await connection.getTokenLargestAccounts(tokenMint);
    console.log(`Top holders: ${largestAccounts.value.length}`);
  } catch (error) {
    console.error("Error fetching token information:", error);
  }
}

export async function listenTokensFromOficial() {
  setInterval(async () => {
    const tokenPriceUrl =
      "https://frontend-api.pump.fun/coins/currently-live?limit=1&offset=0&includeNsfw=true";
    try {
      const response = await axios.get(tokenPriceUrl);
      if (response.data) {
        console.log(
          `${response.data[0].symbol} - MC: ${response.data[0].usd_market_cap} USD`
        );
      }
      return;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return null;
    }
  }, 1000);
}

export function listenTokensFromPumpPortal(ws: any) {
  const payload = {
    method: "subscribeNewToken"
  };
  ws.send(JSON.stringify(payload));
}

export function listenTokenFromPumpPortal(tokens: string[], ws: any) {
  const payload = {
    method: "subscribeTokenTrade",
    keys: tokens
  };
  ws.send(JSON.stringify(payload));
}
