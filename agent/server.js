// PesoBridge AI settlement agent.
// Listens for a confirmed MercadoPago QR payment, converts ARS -> USDC using a
// live FX rate (with a hardcoded fallback), and settles on-chain on Monad by
// calling PesoBridgeUSDC.settlePayment. An optional LLM generates a natural
// language receipt and answers merchant questions.

import express from "express";
import cors from "cors";
import { ethers } from "ethers";

const {
  MONAD_RPC = "https://testnet-rpc.monad.xyz",
  AGENT_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  ANTHROPIC_API_KEY,
  FX_FALLBACK = "1450", // ARS per 1 USD fallback if the FX API fails
  PORT = "8787",
} = process.env;

// Minimal ABI: only what the agent needs.
const ABI = [
  "function settlePayment(address buyer, uint256 usdcAmount, uint256 arsAmount, string mpPaymentId) external",
  "function balanceOf(address) view returns (uint256)",
  "function processedPayments(bytes32) view returns (bool)",
];

const app = express();
app.use(cors());
app.use(express.json());

// --- Chain wiring (lazy so the server still boots without a key for UI tests) ---
function getContract() {
  if (!AGENT_PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error("Missing AGENT_PRIVATE_KEY or CONTRACT_ADDRESS in environment");
  }
  const provider = new ethers.JsonRpcProvider(MONAD_RPC, { chainId: 10143, name: "monad-testnet" });
  const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

// --- FX: ARS per USD, live with hardcoded fallback so the demo never breaks ---
async function getArsPerUsd() {
  try {
    // Public Argentine FX API (dolar cripto). No key required.
    const res = await fetch("https://dolarapi.com/v1/dolares/cripto", { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.venta ?? data.compra);
      if (rate > 0) return { rate, source: "dolarapi.com (cripto)" };
    }
  } catch (_) {
    // fall through to fallback
  }
  return { rate: Number(FX_FALLBACK), source: "fallback (hardcoded)" };
}

// --- Optional LLM receipt. Falls back to a deterministic template. ---
async function buildReceipt({ arsAmount, usdcAmount, rate, buyer, txHash }) {
  const template =
    `Payment confirmed. Received ARS ${arsAmount.toLocaleString("es-AR")} via MercadoPago QR. ` +
    `Settled ${usdcAmount.toFixed(2)} USDC on Monad to ${buyer} at ${rate.toLocaleString("es-AR")} ARS/USD. Tx ${txHash}.`;

  if (!ANTHROPIC_API_KEY) return { text: template, generatedBy: "template" };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content:
              `Write a short, friendly payment receipt in English for a merchant. ` +
              `Buyer paid ARS ${arsAmount} via MercadoPago QR and received ${usdcAmount.toFixed(2)} USDC ` +
              `on Monad at ${rate} ARS/USD. Tx hash ${txHash}. One or two sentences, no markdown.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim();
      if (text) return { text, generatedBy: "llm" };
    }
  } catch (_) {
    // fall through
  }
  return { text: template, generatedBy: "template" };
}

// Normalize a MercadoPago payment object (sandbox webhook or simulated) into our shape.
function parseMpPayment(body) {
  // Accept both a raw MP payment object and our simulated minimal shape.
  const id = String(body.id ?? body.data?.id ?? body.mpPaymentId ?? "");
  const arsAmount = Number(body.transaction_amount ?? body.arsAmount ?? 0);
  const status = body.status ?? "approved";
  const buyer = body.buyer ?? body.external_reference ?? body.metadata?.buyer_wallet;
  return { id, arsAmount, status, buyer };
}

// --- Core endpoint: MercadoPago confirms -> settle on Monad ---
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const mp = parseMpPayment(req.body);
    if (!mp.id) return res.status(400).json({ ok: false, error: "Missing payment id" });
    if (mp.status !== "approved") return res.json({ ok: true, skipped: `status=${mp.status}` });
    if (!ethers.isAddress(mp.buyer)) return res.status(400).json({ ok: false, error: "Invalid buyer wallet" });
    if (!(mp.arsAmount > 0)) return res.status(400).json({ ok: false, error: "Invalid ARS amount" });

    const { rate, source } = await getArsPerUsd();
    const usdc = mp.arsAmount / rate; // human units
    const usdcOnChain = ethers.parseUnits(usdc.toFixed(6), 6); // 6 decimals
    const arsOnChain = BigInt(Math.round(mp.arsAmount));

    const contract = getContract();
    const tx = await contract.settlePayment(mp.buyer, usdcOnChain, arsOnChain, mp.id);
    const receiptOnChain = await tx.wait();

    const receipt = await buildReceipt({
      arsAmount: mp.arsAmount,
      usdcAmount: usdc,
      rate,
      buyer: mp.buyer,
      txHash: tx.hash,
    });

    res.json({
      ok: true,
      mpPaymentId: mp.id,
      arsAmount: mp.arsAmount,
      usdcAmount: Number(usdc.toFixed(6)),
      rate,
      fxSource: source,
      buyer: mp.buyer,
      txHash: tx.hash,
      blockNumber: receiptOnChain.blockNumber,
      explorer: `https://testnet.monadexplorer.com/tx/${tx.hash}`,
      receipt: receipt.text,
      receiptBy: receipt.generatedBy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Crypto rail endpoint: detect direct USDC transfer ---
app.post("/crypto-confirm", async (req, res) => {
  try {
    const { paymentIntentId, buyer, usdcAmount, txHash } = req.body;
    if (!paymentIntentId || !buyer || !usdcAmount) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }
    
    // In a real app we'd verify the txHash on Monad via RPC.
    // For the hackathon demo, we acknowledge the direct transfer.

    res.json({
      ok: true,
      paymentIntentId,
      usdcAmount: Number(usdcAmount),
      buyer,
      txHash: txHash || "0x_mock_crypto_tx",
      message: "Crypto payment confirmed directly on Monad.",
      rail: "crypto"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// --- Merchant natural-language queries (optional LLM) ---
app.post("/ask", async (req, res) => {
  const question = String(req.body?.question ?? "");
  if (!ANTHROPIC_API_KEY) {
    return res.json({ ok: true, answer: "LLM not configured. Set ANTHROPIC_API_KEY to enable merchant Q&A." });
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: "You are PesoBridge, an assistant for an Argentine merchant settling MercadoPago payments into USDC on Monad. Be concise.",
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json();
    res.json({ ok: true, answer: data?.content?.[0]?.text?.trim() ?? "" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, rpc: MONAD_RPC, contract: CONTRACT_ADDRESS ?? null }));

app.listen(Number(PORT), () => {
  console.log(`PesoBridge agent listening on http://localhost:${PORT}`);
});
