# Monad Pay Button — Monad Blitz Buenos Aires 🇦🇷

🎉 **LIVE DEMO:** [https://monadpaybutton.vercel.app/](https://monadpaybutton.vercel.app/)
*(Interactive Landing Page and functional checkout demo)*

**Monad Pay Button** lets any Argentine merchant keep charging with the MercadoPago QR they already use, while automatically receiving digital dollars (USDC) on Monad. A buyer pays in pesos; an AI settlement agent confirms the payment, converts ARS to USDC at the live rate, and mints USDC on-chain to the merchant in seconds.

*Note: All code in this repository was initiated and built during the Monad Blitz Buenos Aires hackathon.*

## Pitch Structure

Our pitch follows the recommended structure:

### 1. Problema
Argentina runs on MercadoPago QR for everyday payments, but the peso loses value constantly. Merchants want dollars, and getting them on-chain today means manual exchanges, KYC friction, and crypto knowledge most shop owners do not have.

### 2. Solución
Monad Pay Button sits between the MercadoPago payment and Monad:
1. The merchant generates a MercadoPago QR for an amount in ARS.
2. The buyer pays in pesos (sandbox in the demo, with a simulate fallback so the live flow never breaks).
3. The AI agent receives the confirmation, fetches the live ARS/USD rate (with a hardcoded fallback), computes the USDC amount, and calls `settlePayment` on Monad.
4. USDC is minted to the merchant's wallet. The agent returns an LLM-generated receipt and answers natural-language questions ("how much did I convert today?").

### 3. User Flows & Integrations

**Payment Flows**
1. **MercadoPago QR:** The customer scans and pays in local currency (ARS). The AI Agent intercepts the webhook, converts ARS to USD, and settles the payment by sending **USDC on Monad** to the merchant's wallet.
2. **Crypto QR:** The customer pays directly with USDC on any compatible network. The system routes the transaction and the merchant receives **USDC on Monad**.

**Merchant Integration Methods**
- **Plugin (Shopify / WordPress):** A 1-click native extension that automatically injects the "Monad Pay Button" into the checkout.
- **API Integration:** RESTful endpoints for custom e-commerce platforms to send webhooks and settle programmatically.
- **AI Agent:** A ready-to-use *Skill* (SDK) for autonomous AIs to generate payment links and manage merchant finances via conversational interfaces.

### 3. Cómo se usa Monad
Per-payment on-chain settlement at retail scale only works when transactions are near-free and confirm in milliseconds. Monad's high throughput and low latency make it viable to settle every QR payment individually, where slower or pricier chains would not.

### 4. Modelo de negocio / Impacto
A payment rail that turns MercadoPago revenue into self-custodied dollars on-chain, charging a small spread or per-settlement fee. It gives Argentine merchants dollar savings without crypto friction, and is distributable later as a WooCommerce or Shopify app.

## Architecture & Deliverables

- **Smart Contract (Monad Testnet)** — `contracts/src/Monad Pay Button.sol`: a minimal USDC-style ERC-20 (`mUSDC`, 6 decimals) with an agent-gated `settlePayment(merchant, usdcAmount, arsAmount, mpPaymentId)`. Includes a `MerchantRegistry` and per-payment replay protection.
- **Agent** — `agent/server.js`: Node + Express + ethers. Endpoint `/webhook/mercadopago` settles a confirmed payment; `/crypto-confirm` confirms direct USDC transfers; `/ask` answers merchant questions. Optional Anthropic LLM for receipts and Q&A.
- **Frontend Demo** — `frontend/demo.html`: single-page merchant checkout with light/dark theme and WCAG 2.1 AA accessibility. Displays the agnostic QR and runs the simulation with settlement explorer links.

## 🚀 How to Run the Project (Step by Step)

Follow these steps to set up the complete environment on your local machine and test both the UI integration and the backend communicating with the Monad Testnet.

### 1. Start the Agent (Backend)
The agent listens to the simulated MercadoPago webhooks and executes the transactions on Monad.

1. Open a terminal and navigate to the agent folder:
   ```bash
   cd agent
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (you can use `.env.example` or the provided `.env` if you have the keys):
   ```bash
   cp .env.example .env
   ```
4. Start the agent server (requires Node.js v20+ for env-file support):
   ```bash
   npm start
   ```
   > You should see: `Agent router running on port 8787`

### 2. Start the Frontend (UI)
The frontend contains the QR simulation, the new **Monad Pay Button**, and the interactive flows.

1. Open **another** terminal tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start a local web server (you can use `serve`, `http-server`, etc.):
   ```bash
   npx serve -l 3000
   ```

### 3. Test the Demos (The 2 flows)

Open your browser and explore these two URLs:

- 🎨 **The "Monad Pay Button" UI (Checkout Integration)**  
  👉 **`http://localhost:3000/checkout.html`**  
  *What it does:* Shows how a real merchant integrates the 1-line-of-code embeddable button into their own shopping cart, featuring automatic Light/Dark mode. Click the payment button to view the animated modal with its 5 states (Rail Selection → QR/Wallet → Processing → Success).

- ⚙️ **The E2E Functional Demo with the Agent**  
  👉 **`http://localhost:3000/demo.html`**  
  *What it does:* Shows the Merchant Dashboard. Enter an amount, generate the payment QR, and use the button to simulate MercadoPago confirming the payment. This triggers the Webhook to the agent on port 8787, which settles the transaction on-chain and returns the real Monad block explorer link.

## Deployment reference

- **Chain ID**: `10143`
- **RPC**: `https://testnet-rpc.monad.xyz`
- **Explorer**: `https://testnet.monadexplorer.com`
- **Deployed Contract Address**: `0x4435060926077427821D3121B14aB3Eaf5889403`
