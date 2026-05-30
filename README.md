# PesoBridge — Monad Blitz Buenos Aires 🇦🇷

**PesoBridge** lets any Argentine merchant keep charging with the MercadoPago QR they already use, while automatically receiving digital dollars (USDC) on Monad. A buyer pays in pesos; an AI settlement agent confirms the payment, converts ARS to USDC at the live rate, and mints USDC on-chain to the merchant in seconds.

*Note: All code in this repository was initiated and built during the Monad Blitz Buenos Aires hackathon.*

## Pitch Structure

Our pitch follows the recommended structure:

### 1. Problema
Argentina runs on MercadoPago QR for everyday payments, but the peso loses value constantly. Merchants want dollars, and getting them on-chain today means manual exchanges, KYC friction, and crypto knowledge most shop owners do not have.

### 2. Solución
PesoBridge sits between the MercadoPago payment and Monad:
1. The merchant generates a MercadoPago QR for an amount in ARS.
2. The buyer pays in pesos (sandbox in the demo, with a simulate fallback so the live flow never breaks).
3. The AI agent receives the confirmation, fetches the live ARS/USD rate (with a hardcoded fallback), computes the USDC amount, and calls `settlePayment` on Monad.
4. USDC is minted to the merchant's wallet. The agent returns an LLM-generated receipt and answers natural-language questions ("how much did I convert today?").

### 3. Cómo se usa Monad
Per-payment on-chain settlement at retail scale only works when transactions are near-free and confirm in milliseconds. Monad's high throughput and low latency make it viable to settle every QR payment individually, where slower or pricier chains would not.

### 4. Modelo de negocio / Impacto
A payment rail that turns MercadoPago revenue into self-custodied dollars on-chain, charging a small spread or per-settlement fee. It gives Argentine merchants dollar savings without crypto friction, and is distributable later as a WooCommerce or Shopify app.

## Architecture & Deliverables

- **Smart Contract (Monad Testnet)** — `contracts/src/PesoBridge.sol`: a minimal USDC-style ERC-20 (`mUSDC`, 6 decimals) with an agent-gated `settlePayment(merchant, usdcAmount, arsAmount, mpPaymentId)`. Includes a `MerchantRegistry` and per-payment replay protection.
- **Agent** — `agent/server.js`: Node + Express + ethers. Endpoint `/webhook/mercadopago` settles a confirmed payment; `/crypto-confirm` confirms direct USDC transfers; `/ask` answers merchant questions. Optional Anthropic LLM for receipts and Q&A.
- **Frontend Demo** — `frontend/demo.html`: single-page merchant checkout with light/dark theme and WCAG 2.1 AA accessibility. Displays the agnostic QR and runs the simulation with settlement explorer links.

## 🚀 Cómo probar el proyecto (Paso a Paso)

Sigue estos pasos para levantar el entorno completo en tu máquina local y probar tanto la integración UI como el backend que se comunica con Monad Testnet.

### 1. Iniciar el Agente (Backend)
El agente escucha los webhooks simulados de MercadoPago y ejecuta las transacciones en Monad.

1. Abre una terminal y navega a la carpeta del agente:
   ```bash
   cd agent
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno (ya hay un `.env.example` o puedes usar el `.env` provisto si tienes las claves):
   ```bash
   cp .env.example .env
   ```
4. Arranca el servidor del agente (requiere Node.js v20+ por la carga de env-file):
   ```bash
   npm start
   ```
   > Deberías ver: `Agent router running on port 8787`

### 2. Levantar la Interfaz Gráfica (Frontend)
El frontend contiene la simulación del QR, el nuevo botón **Monad Pay Button**, y el flujo interactivo.

1. Abre **otra** pestaña en tu terminal y navega a la carpeta raíz o a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Inicia un servidor web local (puedes usar `serve`, `http-server` o el que prefieras):
   ```bash
   npx serve -l 3000
   ```

### 3. Probar las Demos (Los 2 flujos)

Abre tu navegador y explora estas dos URLs:

- 🎨 **El "Monad Pay Button" UI (Checkout de Integración)**  
  👉 **`http://localhost:3000/checkout.html`**  
  *¿Qué hace?* Muestra cómo un comercio real (ej. Academia QA) integra el botón embebible de 1 sola línea de código en su propio flujo de carrito de compras, con soporte para Modo Oscuro/Claro automático. Haz clic en el botón de pago para ver el modal animado con sus 5 estados (Elección de riel → Código QR/Wallet → Procesamiento → Éxito).

- ⚙️ **La Demo Funcional E2E con el Agente**  
  👉 **`http://localhost:3000/demo.html`**  
  *¿Qué hace?* Muestra el dashboard del comerciante. Ingresa un monto, genera el QR de cobro, y usa el botón para simular que MercadoPago confirmó el pago. Esto dispara el Webhook al agente en el puerto 8787, quien liquida la transacción on-chain y devuelve el link real al explorador de Monad.

## Deployment reference

- **Chain ID**: `10143`
- **RPC**: `https://testnet-rpc.monad.xyz`
- **Explorer**: `https://testnet.monadexplorer.com`
- **Deployed Contract Address**: `0x4435060926077427821D3121B14aB3Eaf5889403`
