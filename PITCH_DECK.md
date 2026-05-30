# Monad Pay Button — Pitch Deck (Monad Blitz Buenos Aires)

## 1. El Problema 📉
Los comerciantes en Argentina y LATAM operan masivamente con QRs de MercadoPago, pero sufren la devaluación constante del peso. 
**Deseo:** Quieren dólares.
**Fricción:** No saben usar exchanges, evitan el KYC corporativo complejo y no quieren cambiar su flujo de cobro diario ni educar a sus cajeros.

## 2. La Solución 🌉
**Monad Pay Button:** Una capa de pagos *white-label*.
- El comercio sigue imprimiendo y mostrando **un solo QR** (agnóstico).
- El cliente decide si paga en Pesos (con MercadoPago) o con Cripto (USDC).
- **El comercio siempre recibe USDC on-chain en su wallet.**

## 3. ¿Por qué Monad? 🟣
- **Velocidad y Costo:** Para que la liquidación sea instantánea mientras el cliente aún está en la caja, necesitamos una blockchain con finalidad de sub-segundos y fees ínfimos. Monad permite que el AI Agent liquide la transacción en el backend antes de que el cajero imprima el ticket.
- **EVM Compatible:** Nos permitió usar Solidity estándar para nuestro contrato `Monad Pay ButtonUSDC` y `MerchantRegistry`, acelerando el desarrollo en el hackathon.

## 4. Arquitectura de la Demo ⚙️
1. **Frontend:** QR agnóstico que simula el checkout de MercadoPago.
2. **AI Agent (Node + Ethers):** Escucha el webhook de MercadoPago, busca el tipo de cambio cripto en tiempo real, calcula el equivalente en USDC y dispara la transacción on-chain.
3. **Smart Contract (Monad Testnet):** Un mock de USDC con una función `settlePayment` protegida, que solo el Agente IA puede llamar para mintear los dólares al comercio registrado.

## 5. El Futuro (Roadmap) 🚀
- Plugins oficiales para WooCommerce y Shopify (Plug & Play).
- Integración de swaps en DEX nativos de Monad para no depender de un mock token.
- Expansión a PIX (Brasil) y PSE (Colombia).
