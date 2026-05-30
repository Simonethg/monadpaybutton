# Prompts — Market research, Pitch deck, Disruptive landing (Monad Pay Button)

Three copy-paste prompts. Each is standalone: prepend the SHARED CONTEXT block to whichever prompt you run.

---

## SHARED CONTEXT (prepend to any prompt below)

Product: **Monad Pay Button** — a white-label, embeddable "pay button" added to any e-commerce site with one line of code. Customers pay with a MercadoPago QR (Argentine pesos) or a crypto wallet; the merchant automatically receives **USDC stablecoin on the Monad blockchain**. One button, pay in pesos or crypto, the merchant always gets digital dollars. Distribution: (1) embeddable one-line widget, (2) AI assistant skill, (3) WooCommerce/Shopify plugins (roadmap). An AI "settlement agent" detects the payment on either rail, converts ARS→USDC at the live rate, and settles on-chain to the merchant's verified wallet. Core thesis: LATAM/Argentine merchants escape peso inflation by auto-saving sales in dollars, with cross-border payment upside.

Brand: disruptive crypto-fintech meets fintech-grade trust. Aligned with Monad's signature violet/purple. Always provide light AND dark themes with a toggle; meet WCAG 2.1 AA (contrast, visible focus, labels, aria-live, keyboard support). Signature motion: two payment rails (pesos + crypto) converging into one USDC stream.

Language: ALL user-facing copy and generated output must be in **Argentine Spanish (rioplatense, voseo)** — taglines, headlines, body, microcopy, slide text. Keep only code identifiers and technical labels in English. The audience is the Buenos Aires showcase.

Geographic focus: **LATAM-first.** Lead with regional LATAM data and frame the opportunity as pan-LATAM (MercadoPago operates across Argentina, Brazil, Mexico, Chile, Colombia, Uruguay, Peru). Use Argentina as the beachhead / hero case, but size the market and tell the story at the LATAM level.

---

## PROMPT 1 — Market research

You are a market analyst. Using web search, produce a sourced market research brief for Monad Pay Button (see SHARED CONTEXT). Cite a source URL after every figure; prefer 2024–2025 data. Cover:

1. **E-commerce universe (for TAM), LATAM-first:** total number of online e-commerce stores worldwide; global e-commerce market size + CAGR; **LATAM e-commerce size + growth, broken down by key markets (Brazil, Mexico, Argentina, Colombia, Chile)**; Argentina as the beachhead. Lead with the regional LATAM totals.
2. **Platform breakdown (critical — include explicitly):** total **WooCommerce** stores and market share; total **Shopify** stores and market share; Shopify GMV. These size the plugin roadmap.
3. **Payments rail:** MercadoPago TPV, MAU, Argentina growth, and QR/wallet penetration in Argentina and LATAM.
4. **Dollarization thesis:** stablecoin market cap and volume; USDC specifics; Argentina/LATAM stablecoin adoption (% of crypto volume that is stablecoins); Argentina inflation; LATAM remittances size.
5. **Competitive landscape:** Coinbase Commerce, BitPay, Binance Pay, Stripe/Shift4/BVNK, Bitso Business, Lemon Cash, Belo, Ripio, Num Finance, Transak, MoonPay, dLocal — what each does and how Monad Pay Button differs (white-label + AI agent + MercadoPago-QR-native + auto-settle to USDC). Identify whether any does "fiat QR in → merchant auto-receives stablecoin out."
6. **Output:** a TAM / SAM / SOM model with stated assumptions, and a 3–4 line "white space / positioning" summary.

Baseline figures to verify and update (do not just copy — confirm and refresh): global e-commerce ~$33.9T (2025, ~21.6% CAGR); LATAM e-commerce ~$769B (2025, +21%); Argentina ~$19B (2025, +24%); ~26–28M online stores worldwide; WooCommerce ~4.53M stores (33.4% share); Shopify ~2.66M stores (19.6% share), GMV ~$378B (2025); MercadoPago acquiring TPV $47.7B (Q3 2025, +32%), ~72M MAU; stablecoins 61.8% of Argentine crypto volume; Argentina inflation 211% (2024) → ~36% (2025); LATAM remittances ~$174B (2025). Flag anything that has changed.

---

## PROMPT 2 — Pitch deck

Build a **pitch deck for a 3-minute hackathon showcase** for Monad Pay Button (see SHARED CONTEXT). Format: a single self-contained **HTML slide deck** (keyboard arrow navigation, one slide per view), disruptive design per the brand, light/dark toggle, WCAG 2.1 AA. (If you prefer, also output a .pptx version.)

Slides, in order:
1. **Title** — "Monad Pay Button", tagline, one-line what-it-is.
2. **Problem** — Argentine/LATAM merchants charge in pesos but the peso loses value; getting dollars on-chain is full of friction. (Inflation 211%→~36%; stablecoins are 61.8% of Argentine crypto volume.)
3. **Solution** — one button, pay in pesos or crypto, merchant auto-receives USDC on Monad. Show the agnostic QR + two-rails-converging visual.
4. **How it works** — onboarding in under 2 min (connect MercadoPago like WooCommerce, add wallet, verify on-chain), then the AI settlement agent's six actions: detect, validate, convert, settle, confirm, answer.
5. **Product / distribution** — the 3 channels: one-line widget, AI skill, WooCommerce/Shopify plugins (roadmap).
6. **Why Monad** — per-payment on-chain settlement only works with near-free, millisecond transactions; Monad's throughput makes retail-scale stablecoin settlement viable.
7. **Market (TAM/SAM/SOM) — LATAM-first** — use these researched figures with sources: LATAM e-commerce ~$769B (2025, +21%, fastest-growing region); ~26–28M online stores worldwide; global e-commerce ~$33.9T; WooCommerce ~4.53M stores (33.4%) + Shopify ~2.66M (19.6%) = the plugin-addressable base; MercadoPago acquiring TPV $47.7B/qtr, ~72M users across LATAM; digital wallets/QR ~60% of LATAM consumer spend. Frame TAM = LATAM online commerce (~$769B), SAM = LATAM e-commerce on WooCommerce/Shopify/MercadoPago, SOM = Argentina as the beachhead in years 1–2 then expand across LATAM.
8. **Competition** — a 2x2 or matrix showing the white space: crypto-in gateways (Coinbase Commerce, BitPay), enterprise settlement (Stripe/Shift4/BVNK), consumer wallets that spend crypto as pesos (Lemon/Belo/Ripio), on-ramps (Transak/MoonPay) — none do white-label "fiat QR in → merchant auto-USDC out" with an AI agent.
9. **Business model** — white-label B2B2C: small spread or per-settlement fee, sold to platforms/PSPs with thousands of merchants. Stablecoin volume $33T in 2025 validates scale.
10. **Roadmap** — today (widget + skill + deployed contract on Monad), next (WooCommerce + Shopify plugins, crypto swap, treasury rules, mainnet).
11. **Ask / close** — one bold line + the converging-rails motion.

Keep copy punchy (few words per slide), data visual (charts where useful), and every market stat sourced in a footnote. All slide copy in Argentine Spanish (voseo).

---

## PROMPT 3 — Disruptive promotional landing

Build a **single-file responsive HTML promotional landing page** for Monad Pay Button (see SHARED CONTEXT). Disruptive crypto-fintech design, Monad violet, light/dark toggle at top, WCAG 2.1 AA, smooth scroll, tasteful motion. Sections:

1. **Hero** — bold headline (e.g., "Cobrá en pesos. Guardá en dólares."), subhead, primary CTA ("Get the button" / "Probar la demo"), and an animated visual of two rails (pesos + crypto) converging into a USDC stream. Show the literal one-line embed snippet.
2. **Value prop** — 3 cards: save in dollars automatically, one-line install, customers pay however they want.
3. **How it works** — 4 steps with the onboarding (connect MercadoPago, add wallet, verify, embed) and the agent settling on Monad.
4. **The 3 implementations (key section — show how each looks):**
   - **Widget**: a mock e-commerce product page with a "Pay with Monad Pay Button" button that opens a checkout modal showing the agnostic QR and the two rails, ending in a USDC-settled card with a Monad explorer link.
   - **AI skill**: a chat mockup where a merchant types "cobrale 50.000 a Juan" and the assistant calls the skill, returns a pay link, and confirms settlement in USDC.
   - **Plugin (roadmap)**: a mock WooCommerce/Shopify checkout with Monad Pay Button as a payment method, badged "roadmap".
   Make these interactive/animated where possible so visitors can click through each.
5. **Why Monad** — short band: near-free, instant, retail-scale settlement.
6. **Market proof (LATAM-first)** — a stats strip with sourced figures: LATAM e-commerce ~$769B (fastest-growing region); MercadoPago ~72M users across LATAM; digital wallets/QR ~60% of LATAM consumer spend; stablecoins lead LATAM crypto volume (61.8% in Argentina); WooCommerce + Shopify ~7M stores.
7. **White-label / pricing** — pitch it as the engine other platforms embed under their brand.
8. **Footer CTA** — email capture + GitHub link.

Use CSS variables for theming, no external dependencies except a QR library from CDN if needed, and keep all interactivity in vanilla JS. Make it feel premium and disruptive, not template-y.
