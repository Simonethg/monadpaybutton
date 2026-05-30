// Standalone smoke test for the deterministic core of the agent:
// FX retrieval (with fallback) and the ARS -> USDC math. No chain or keys needed.
import { ethers } from "ethers";

const FX_FALLBACK = Number(process.env.FX_FALLBACK || "1450");

async function getArsPerUsd() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/cripto", { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.venta ?? data.compra);
      if (rate > 0) return { rate, source: "dolarapi.com (cripto)" };
    }
  } catch (_) {}
  return { rate: FX_FALLBACK, source: "fallback (hardcoded)" };
}

function assert(cond, msg) {
  if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; }
  else console.log("PASS:", msg);
}

const { rate, source } = await getArsPerUsd();
assert(rate > 0, `FX rate is positive (${rate} from ${source})`);

const ars = 50000;
const usdc = ars / rate;
const onChain = ethers.parseUnits(usdc.toFixed(6), 6);
assert(usdc > 0 && usdc < ars, `ARS ${ars} -> ${usdc.toFixed(2)} USDC`);
assert(onChain > 0n, `USDC encodes to 6-decimal units (${onChain.toString()})`);

assert(ethers.isAddress("0x000000000000000000000000000000000000dEaD"), "demo buyer address is valid");
assert(!ethers.isAddress("0x123"), "bad address rejected");

const key = ethers.keccak256(ethers.toUtf8Bytes("MP-123"));
assert(key.length === 66, "mpPaymentId hashes to bytes32");

console.log("\nSmoke test complete.");
