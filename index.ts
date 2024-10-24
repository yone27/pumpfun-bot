import { PublicKey, Connection, ParsedInstruction } from "@solana/web3.js";
import { getParsedTransaction } from "./parseTransaction";  // Asegúrate de que tienes este helper

const startMonitoringPumpFun = async () => {
  try {
    // PUMP FUN ADDRESS
    const publicKey = new PublicKey(
      "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
    );
    // Use default RPC but shyft or helius or other provider is recommended
    const connection = new Connection("https://api.mainnet-beta.solana.com", {
      wsEndpoint: "wss://api.mainnet-beta.solana.com",
    });

    const signature = "5M84xFpm8CjkL7uqZXPAcdaAXEQir5bFT6cWsHCsm3c7PGV9Zk5F3CNtayniQDRv6uZero9HmvFkYH8YfG8B3v7d"

    const parsedTransaction = await connection.getParsedTransaction(
      signature,
      {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,  // Specify the max supported version
      }
    );

    // console.log(JSON.stringify(parsedTransaction))

    const tokenName = await getTokenName(connection, "2Ko2THor5MhTXu9aFjcr6vESvK7NcBSrYAuyp1Ugpump");
    console.log("Token Name:", tokenName);

    return

    connection.onLogs(
      publicKey,
      async (logs, context) => {
        if (
          logs.logs &&
          // Look for this instruction in the logs
          logs.logs.some((log: any) =>
            log.includes("Program log: Instruction: InitializeMint2")
          )
        ) {
          console.log(logs.signature, " Received Signature");

          const signature = logs.signature;

          if (signature) {
            // Fetch the parsed transaction details with maxSupportedTransactionVersion set to 0
            const parsedTransaction = await connection.getParsedTransaction(
              signature,
              {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,  // Specify the max supported version
              }
            );

            if (parsedTransaction) {
              // console.log(parsedTransaction, "Parsed Transaction");

              // Find token-related instructions
              const tokenInstruction = parsedTransaction?.transaction.message.instructions.find(
                (inst: any) => inst.program === "spl-token"
              );

              // Ensure the instruction is of type 'ParsedInstruction'
              if (tokenInstruction && isParsedInstruction(tokenInstruction)) {
                const mintAddress = tokenInstruction?.parsed?.info?.mint;
                if (mintAddress) {
                  console.log("Mint Address:", mintAddress);

                  // Fetch token metadata (you may need to use a metadata service here)
                  const tokenName = await getTokenName(connection, mintAddress);
                  console.log("Token Name:", tokenName);
                }
              } else {
                console.log("No parsed token instruction found or instruction is not parsed.");
              }
            }
          }
        }
      },
      "confirmed"
    );
  } catch (error) {
    console.log(error);
  }
};

// Function to check if the instruction is of type 'ParsedInstruction'
function isParsedInstruction(
  instruction: any
): instruction is ParsedInstruction {
  return 'parsed' in instruction;
}

const getTokenName = async (connection: Connection, mintAddress: string) => {
  try {
    // Fetch the token account info
    const tokenInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));

    console.log(JSON.stringify(tokenInfo))
    return

  //   if (tokenInfo && tokenInfo.value) {
  //     // Check if 'data' is of type 'ParsedAccountData' and has 'parsed' property
  //     const accountData = tokenInfo.value.data;
  //     if (typeof accountData === 'object' && 'parsed' in accountData) {
  //       return accountData.parsed?.info?.name || "Unknown Token";
  //     } else {
  //       return "Unknown Token Data Format";
  //     }
  //   }
  //   return "Unknown Token";
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return "Unknown Token";
  }
};

startMonitoringPumpFun();