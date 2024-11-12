import { PublicKey, Connection, ParsedInstruction } from "@solana/web3.js";

const startMonitoringPumpFun = async () => {
  try {
    const publicKey = new PublicKey(
      "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
    );
    const connection = new Connection("https://api.mainnet-beta.solana.com", {
      wsEndpoint: "wss://api.mainnet-beta.solana.com"
    });

    connection.onLogs(
      publicKey,
      async (logs) => {
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
                maxSupportedTransactionVersion: 0 // Specify the max supported version
              }
            );

            console.log(JSON.stringify(parsedTransaction));

            if (parsedTransaction) {
              const tokenInstruction =
                parsedTransaction?.transaction.message.instructions.find(
                  (inst: any) => inst.program === "spl-token"
                );

              if (tokenInstruction && isParsedInstruction(tokenInstruction)) {
                const mintAddress = tokenInstruction?.parsed?.info?.mint;
                if (mintAddress) {
                  console.log("Mint Address:", mintAddress);
                }
              } else {
                console.log(
                  "No parsed token instruction found or instruction is not parsed."
                );
              }
            }
          }
        }

        return;
      },
      "confirmed"
    );
  } catch (error) {
    console.log(error, "error");
  }
};

// Function to check if the instruction is of type 'ParsedInstruction'
function isParsedInstruction(
  instruction: any
): instruction is ParsedInstruction {
  return "parsed" in instruction;
}

startMonitoringPumpFun();
