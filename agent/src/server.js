// All code comments must be in English
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import skillRoutes from "./routes/skill.js";

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const FX_FALLBACK = process.env.FX_FALLBACK ? parseInt(process.env.FX_FALLBACK) : 1000;
const MONAD_RPC = process.env.MONAD_RPC || "https://testnet-rpc.monad.xyz";

// Monad Setup
const provider = new ethers.JsonRpcProvider(MONAD_RPC);
// Fallback to a random wallet if no private key is provided to avoid crashing
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey, provider);

// Minimal ABI for settlement
const contractABI = [
    "function settlePayment(address merchant, uint256 usdcAmount, uint256 arsAmount, string calldata paymentIntentId)",
    "function merchants(address) view returns (string mpMerchantHash, bool isRegistered)"
];
const contractAddress = process.env.CONTRACT_ADDRESS || ethers.ZeroAddress;
const pesoBridge = new ethers.Contract(contractAddress, contractABI, wallet);

// Mount the skill routes
app.use("/skill", skillRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", agentAddress: wallet.address });
});

// Helper function to get FX rate (mocking a public API with fallback)
async function getFxRate() {
    // In a real app, you would fetch from a public FX API here.
    // For the hackathon, we'll use the fallback if no live API is integrated.
    return FX_FALLBACK;
}

// Simulated LLM Receipt Generator
function generateReceipt(arsAmount, usdcAmount, intentId) {
    // Deterministic template fallback
    return `Receipt for payment ${intentId}: Received ${arsAmount} ARS, settled as ${usdcAmount} mUSDC.`;
}

// 1. Webhook for MercadoPago (Pesos to USDC)
app.post("/webhook/mercadopago", async (req, res) => {
    try {
        const { merchantAddress, arsAmount, paymentIntentId } = req.body;

        if (!merchantAddress || !arsAmount || !paymentIntentId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`[Agent] Received MP payment for ${merchantAddress}: ${arsAmount} ARS`);

        // Check if merchant is registered
        const merchantData = await pesoBridge.merchants(merchantAddress);
        if (!merchantData.isRegistered) {
            return res.status(400).json({ error: "Merchant not registered on-chain" });
        }

        // Get FX Rate and compute USDC (6 decimals)
        const rate = await getFxRate();
        const usdcAmount = (arsAmount / rate).toFixed(6);
        const usdcAmountWei = ethers.parseUnits(usdcAmount, 6);

        console.log(`[Agent] Settling payment: ${usdcAmount} USDC at rate ${rate} ARS/USD`);

        // Call settlePayment on Monad
        const tx = await pesoBridge.settlePayment(
            merchantAddress,
            usdcAmountWei,
            arsAmount,
            paymentIntentId
        );
        const receipt = await tx.wait();

        const llmReceipt = generateReceipt(arsAmount, usdcAmount, paymentIntentId);

        res.json({
            success: true,
            txHash: receipt.hash,
            explorerLink: `https://testnet.monadexplorer.com/tx/${receipt.hash}`,
            usdcAmount: usdcAmount,
            rate: rate,
            receipt: llmReceipt
        });
    } catch (error) {
        console.error("[Agent] Settlement error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Crypto Confirm (Direct USDC)
app.post("/crypto-confirm", async (req, res) => {
    try {
        const { merchantAddress, usdcAmount, paymentIntentId } = req.body;
        // In a full implementation, the agent would verify the on-chain transfer here.
        // For now, we record the direct transfer.
        console.log(`[Agent] Confirmed direct crypto payment of ${usdcAmount} USDC to ${merchantAddress}`);
        
        res.json({
            success: true,
            message: "Crypto payment recorded",
            intentId: paymentIntentId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Ask endpoint (Merchant Q&A)
app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;
        console.log(`[Agent] Merchant asks: ${question}`);
        
        // Simple deterministic fallback for demo
        let answer = "I am your AI settlement assistant. I handle converting your MercadoPago payments to USDC on Monad.";
        if (question.toLowerCase().includes("today")) {
            answer = "You have received 3 payments today, totaling 150 USDC.";
        } else if (question.toLowerCase().includes("rail")) {
            answer = "Most of your payments today came through the MercadoPago (Pesos) rail.";
        }

        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Agent router running on port ${PORT}`);
});
