# PesoBridge — Checklist Monad Blitz Buenos Aires

## Requisitos obligatorios del reglamento

- [ ] Equipo registrado (1 a 4 personas, cada integrante por separado) en blitz.devnads.com
- [ ] Código iniciado DURANTE el evento (lo de hoy es solo blueprint, regenerar en vivo con commits del día) — CRÍTICO
- [ ] Al menos 1 contrato desplegado en Monad testnet (PesoBridge.sol)
- [ ] Address del contrato pegada en el README y verificable en el explorer
- [ ] Demo funcional end to end
- [ ] Repo público en GitHub con README
- [ ] Pitch de 3 min: Problema, Solución, Cómo se usa Monad, Modelo/Impacto
- [ ] Proyecto subido en https://blitz.devnads.com/events/monad-blitz-buenos-aires antes del cierre

## Setup técnico de Monad (antes de empezar a codear)

- [ ] MetaMask con Monad testnet: Chain ID 10143, RPC https://testnet-rpc.monad.xyz
- [ ] MON de prueba del faucet https://faucet.monad.xyz
- [ ] Explorer a mano: https://testnet.monadexplorer.com

## Contingencias de QA (para que la demo no se caiga)

- [ ] Botón "simular pago confirmado" como respaldo si falla el sandbox de MercadoPago
- [ ] Tasa de cambio fija de fallback configurada por si la API de FX no responde
- [ ] Video corto del flujo completo grabado por si falla internet o el proyector
- [ ] Wallet de prueba con saldo y address del contrato anotada antes de pitchear

## Plan de 2 horas (cronometrado)

- [ ] 0:00-0:15 Setup: MetaMask + Monad testnet, faucet, repo nuevo en GitHub
- [ ] 0:15-0:35 Desplegar PesoBridge.sol en Remix, copiar address + ABI
- [ ] 0:35-1:10 Levantar el agente (Node) y el frontend, conectar address + ABI
- [ ] 1:10-1:30 Probar flujo completo y cargar datos de demo
- [ ] 1:30-1:45 README final + repo público + submit en el sitio
- [ ] 1:45-2:00 Grabar video de respaldo + ensayar pitch contra reloj
