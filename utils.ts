import { Connection, PublicKey } from "@solana/web3.js";

export async function getTopHolders(
    tokenMint: PublicKey,
    connection: Connection
  ) {
    try {
      let decimals: number = 0;
  
      // Obtener la cantidad total de tokens : aunque podria quitar esta consulta ya que los tokens de pumpfun tiene 1b de supply
      const { value: tokenSupply } = await connection.getTokenSupply(tokenMint);
      decimals = tokenSupply.decimals;
      const totalSupply = parseFloat(tokenSupply.uiAmountString ?? "0");
  
      // Obtener las cuentas de los holders principales
      const largestAccounts = await connection.getTokenLargestAccounts(tokenMint);
  
      // Calcular el porcentaje de tokens de cada holder principal
      const topHolders = largestAccounts.value
        .slice(0, 10)
        .map((account: any) => {
          const balance =
            account.uiAmount ??
            parseFloat(account.amount) / Math.pow(10, decimals);
          const percentage = ((balance / totalSupply) * 100).toFixed(2);
  
          return {
            publicKey: account.address.toBase58(),
            balance: balance.toLocaleString("es", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }),
            percentage: `${percentage}%`
          };
        });
  
      return { topHolders };
    } catch (error) {
      console.error("Error fetching token information:", error);
      return { topHolders: [] };
    }
  }