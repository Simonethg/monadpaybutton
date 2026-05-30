import { ethers } from "ethers";

const rpcUrl = process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz";
const contractAddress = process.env.CONTRACT_ADDRESS;
const agentKey = process.env.AGENT_PRIVATE_KEY;

if (!contractAddress || !agentKey) {
  console.error("Missing CONTRACT_ADDRESS or AGENT_PRIVATE_KEY in .env");
  process.exit(1);
}

// Minimal ABI to register a merchant
const ABI = ["function registerMerchant(string mpMerchantHash) external"];

async function main() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // Using the agent key just to quickly register a merchant for testing purposes
  const wallet = new ethers.Wallet(agentKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  console.log(`Registering merchant ${wallet.address} on-chain...`);
  try {
    const tx = await contract.registerMerchant("demo-merchant-hash");
    console.log("Waiting for tx to mine:", tx.hash);
    await tx.wait();
    console.log("Merchant successfully registered!");

    console.log("\nNow simulating a MercadoPago webhook to the Agent...");
    const payload = {
      id: "demo_" + Date.now(),
      status: "approved",
      transaction_amount: 50000, // ARS
      buyer: wallet.address // The merchant wallet receiving USDC
    };

    const res = await fetch("http://localhost:8787/webhook/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Agent response:", data);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

main();
