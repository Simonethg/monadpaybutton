/**
 * Monad Pay Button - Zero-dependency embeddable script
 */
(function() {
  // 1. Find the script tag and target container
  const scriptTag = document.currentScript || document.querySelector('script[src*="btn.js"]');
  const targetId = "monad-pay";
  let targetEl = document.getElementById(targetId);

  // Read configuration
  const amountStr = scriptTag ? (scriptTag.getAttribute('data-amount') || '0.00') : '0.00';
  const amountVal = Number(amountStr);
  const amount = isNaN(amountVal) ? amountStr : amountVal.toLocaleString('es-AR', { minimumFractionDigits: amountStr.includes('.') ? 2 : 0 });
  const currency = scriptTag ? (scriptTag.getAttribute('data-currency') || 'USDC') : 'USDC';
  const lang = scriptTag ? (scriptTag.getAttribute('data-lang') || 'es') : 'es';
  const theme = scriptTag ? (scriptTag.getAttribute('data-theme') || 'auto') : 'auto';

  // 2. Inject CSS if not already present
  if (!document.getElementById('monad-pay-css')) {
    const link = document.createElement('link');
    link.id = 'monad-pay-css';
    link.rel = 'stylesheet';
    // For local dev, we assume it's in the same folder. In production this would be absolute URL.
    link.href = './monad-pay.css'; 
    document.head.appendChild(link);
    
    // Inject fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Newsreader:wght@400;500&display=swap';
    document.head.appendChild(fontLink);
  }

  // 3. Define translations
  const t = {
    es: {
      pay: "Pagar",
      payWithMonad: "Pagar con Monad",
      processing: "Procesando…",
      success: "Listo · liquidado en USDC",
      error: "No se pudo. Reintentar",
      chooseTitle: "¿Cómo querés pagar?",
      chooseSub: "Pagues como pagues, el comercio recibe USDC en Monad.",
      fiatBtn: "QR MercadoPago",
      cryptoBtn: "QR cripto",
      qrConfirm: "Ya escaneé · confirmar",
      walletNote: "Conectá tu wallet para pagar con cripto.",
      step1: "Confirmando pago",
      step2: "Convirtiendo a USDC",
      step3: "Liquidando en Monad",
      receiptTitle: "Pago exitoso",
      receiptDesc: "El comercio ya recibió los fondos.",
      backBtn: "Acceder a mi curso →"
    },
    en: {
      pay: "Pay",
      payWithMonad: "Pay with Monad",
      processing: "Processing…",
      success: "Done · settled in USDC",
      error: "Couldn't process. Retry",
      chooseTitle: "How do you want to pay?",
      chooseSub: "Regardless of how you pay, the merchant receives USDC on Monad.",
      fiatBtn: "Pesos · MercadoPago QR",
      cryptoBtn: "Crypto · Wallet",
      qrConfirm: "I already scanned · confirm",
      walletNote: "Connect your wallet to pay with crypto.",
      step1: "Confirming payment",
      step2: "Converting to USDC",
      step3: "Settling on Monad",
      receiptTitle: "Payment successful",
      receiptDesc: "The merchant has received the funds.",
      backBtn: "Access my course →"
    }
  };
  const txt = t[lang] || t['en'];

  // SVG Mark
  const markSvg = `
    <span class="pb-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" aria-hidden="true" style="width:58%;height:58%">
        <path d="M11 15 C 21 15, 23 24, 31 24" fill="none" stroke="#fff" stroke-width="5.2" stroke-linecap="round"/>
        <path d="M11 33 C 21 33, 23 24, 31 24" fill="none" stroke="#fff" stroke-width="5.2" stroke-linecap="round"/>
        <circle cx="34" cy="24" r="4" fill="#fff"/>
      </svg>
    </span>`;

  // 4. Render the Pay Button
  function renderButton() {
    if (!targetEl) return;
    targetEl.classList.add('monad-pay-container');
    if (theme !== 'auto') {
      targetEl.setAttribute('data-pb-theme', theme);
    }
    
    targetEl.innerHTML = `
      <button class="pb-btn" type="button" aria-label="${txt.payWithMonad}" data-state="default">
        <div class="pb-btn-content">
          ${markSvg}
          <span class="pb-btn-text-default">${txt.pay} <span class="pb-btn-mono">${currency} ${amount}</span></span>
          <span class="pb-btn-text-success">${txt.success}</span>
        </div>
        <div class="pb-spinner" aria-hidden="true"></div>
        <div class="pb-check-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </button>
    `;

    const btn = targetEl.querySelector('.pb-btn');
    btn.addEventListener('click', openModal);
  }

  // 5. Render Modal Shell
  let modalWrapper;
  function renderModalHTML() {
    modalWrapper = document.createElement('div');
    modalWrapper.className = 'monad-pay-container';
    if (theme !== 'auto') modalWrapper.setAttribute('data-pb-theme', theme);

    modalWrapper.innerHTML = `
      <div class="pb-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pb-modal-title">
        <div class="pb-modal" tabindex="-1">
          <button class="pb-modal-close" aria-label="Cerrar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          
          <!-- Panel: Choose -->
          <div class="pb-panel pb-active" id="pb-panel-choose">
            <div class="pb-modal-header">
              <h2 id="pb-modal-title" class="pb-modal-title">${txt.chooseTitle}</h2>
              <p class="pb-modal-subtitle">${txt.chooseSub}</p>
            </div>
            <button class="pb-rail-btn" id="pb-btn-fiat">
              <span class="pb-rail-icon" aria-hidden="true">📱</span>
              <div class="pb-rail-text">
                <span class="pb-rail-title">${txt.fiatBtn}</span>
                <span class="pb-rail-desc">Paga en ARS, comercio recibe USDC</span>
              </div>
            </button>
            <button class="pb-rail-btn" id="pb-btn-crypto">
              <span class="pb-rail-icon" aria-hidden="true">🦊</span>
              <div class="pb-rail-text">
                <span class="pb-rail-title">${txt.cryptoBtn}</span>
                <span class="pb-rail-desc">USDC, ETH, SOL</span>
              </div>
            </button>
          </div>

          <!-- Panel: QR -->
          <div class="pb-panel" id="pb-panel-qr">
            <div class="pb-modal-header">
              <h2 class="pb-modal-title">Escanea con MercadoPago</h2>
            </div>
            <div class="pb-qr-wrap" id="pb-qr-container"></div>
            <p style="text-align:center; font-family:'IBM Plex Mono'; font-weight:500;">${currency} ${amount}</p>
            <button class="pb-btn" style="width:100%; margin-top:16px;" id="pb-btn-qr-confirm">
              <span class="pb-btn-text-default">${txt.qrConfirm}</span>
            </button>
          </div>

          <!-- Panel: Wallet -->
          <div class="pb-panel" id="pb-panel-wallet">
            <div class="pb-modal-header">
              <h2 class="pb-modal-title">Wallet Connect</h2>
              <p class="pb-modal-subtitle">${txt.walletNote}</p>
            </div>
            <button class="pb-btn" style="width:100%; margin-top:16px;" id="pb-btn-wallet-confirm">
              <span class="pb-btn-text-default">Firmar y Pagar</span>
            </button>
          </div>

          <!-- Panel: Processing -->
          <div class="pb-panel" id="pb-panel-processing">
            <div class="pb-modal-header">
              <h2 class="pb-modal-title">${txt.processing}</h2>
            </div>
            <div style="padding: 24px 12px;">
              <div class="pb-progress-step pb-active" id="pb-step-1">
                <div class="pb-dot"></div> <span>${txt.step1}</span>
              </div>
              <div class="pb-progress-step" id="pb-step-2">
                <div class="pb-dot"></div> <span>${txt.step2}</span>
              </div>
              <div class="pb-progress-step" id="pb-step-3">
                <div class="pb-dot"></div> <span>${txt.step3}</span>
              </div>
            </div>
          </div>

          <!-- Panel: Success -->
          <div class="pb-panel" id="pb-panel-success">
            <div class="pb-modal-header">
              <div class="pb-success-check">✓</div>
              <h2 class="pb-modal-title">${txt.receiptTitle}</h2>
              <p class="pb-modal-subtitle">${txt.receiptDesc}</p>
            </div>
            <div style="text-align:center; margin-bottom:24px;">
              <div style="font-family:'IBM Plex Mono'; font-size:24px; font-weight:600;">+${currency} ${amount}</div>
              <p class="pb-microcopy">Liquidado en Monad Testnet<br/>
                <a href="#" class="pb-tx-link">0xabc123...def456</a>
              </p>
            </div>
            <button class="pb-btn" style="width:100%; background:var(--pb-surface-2); color:var(--pb-text); box-shadow:none;" id="pb-btn-done">
              <span class="pb-btn-text-default">${txt.backBtn}</span>
            </button>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(modalWrapper);

    // Event Listeners for Modal
    modalWrapper.querySelector('.pb-modal-close').addEventListener('click', closeModal);
    modalWrapper.querySelector('.pb-modal-backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('pb-modal-backdrop')) closeModal();
    });

    // Routing
    modalWrapper.querySelector('#pb-btn-fiat').addEventListener('click', () => {
      showPanel('pb-panel-qr');
      // Mock QR generation
      const qrEl = modalWrapper.querySelector('#pb-qr-container');
      if(qrEl.innerHTML === "") {
        const scr = document.createElement('script');
        scr.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        scr.onload = () => new QRCode(qrEl, { text: "mock_payment", width: 188, height: 188 });
        document.head.appendChild(scr);
      }
    });

    modalWrapper.querySelector('#pb-btn-crypto').addEventListener('click', () => {
      showPanel('pb-panel-wallet');
    });

    modalWrapper.querySelector('#pb-btn-qr-confirm').addEventListener('click', startProcessing);
    modalWrapper.querySelector('#pb-btn-wallet-confirm').addEventListener('click', startProcessing);
    modalWrapper.querySelector('#pb-btn-done').addEventListener('click', finishFlow);
  }

  // Navigation
  function showPanel(id) {
    modalWrapper.querySelectorAll('.pb-panel').forEach(p => p.classList.remove('pb-active'));
    modalWrapper.querySelector('#' + id).classList.add('pb-active');
  }

  // Animation Sequence
  async function startProcessing() {
    showPanel('pb-panel-processing');
    const s1 = modalWrapper.querySelector('#pb-step-1');
    const s2 = modalWrapper.querySelector('#pb-step-2');
    const s3 = modalWrapper.querySelector('#pb-step-3');

    // Mocks waiting
    await new Promise(r => setTimeout(r, 800));
    s1.classList.remove('pb-active'); s1.classList.add('pb-done');
    s2.classList.add('pb-active');
    
    await new Promise(r => setTimeout(r, 800));
    s2.classList.remove('pb-active'); s2.classList.add('pb-done');
    s3.classList.add('pb-active');

    await new Promise(r => setTimeout(r, 800));
    s3.classList.remove('pb-active'); s3.classList.add('pb-done');
    
    await new Promise(r => setTimeout(r, 300));
    showPanel('pb-panel-success');
    
    // Announce to screen reader
    const modalTitle = modalWrapper.querySelector('#pb-modal-title');
    modalTitle.textContent = txt.receiptTitle; // update aria-labelledby text
  }

  function finishFlow() {
    closeModal();
    const btn = targetEl.querySelector('.pb-btn');
    btn.setAttribute('data-state', 'success');
    setTimeout(() => {
      btn.setAttribute('data-state', 'default');
      showPanel('pb-panel-choose'); // reset modal
      // Reset progress steps
      modalWrapper.querySelectorAll('.pb-progress-step').forEach(s => {
        s.classList.remove('pb-active', 'pb-done');
      });
      modalWrapper.querySelector('#pb-step-1').classList.add('pb-active');
    }, 2600);
  }

  // Modal Lifecycle
  let lastFocusedElement;
  function openModal() {
    if (!modalWrapper) renderModalHTML();
    lastFocusedElement = document.activeElement;
    const bd = modalWrapper.querySelector('.pb-modal-backdrop');
    bd.classList.add('pb-open');
    // Trap Focus (simplified for brevity)
    setTimeout(() => modalWrapper.querySelector('.pb-modal-close').focus(), 100);
    document.addEventListener('keydown', handleEsc);
  }

  function closeModal() {
    if (!modalWrapper) return;
    modalWrapper.querySelector('.pb-modal-backdrop').classList.remove('pb-open');
    if (lastFocusedElement) lastFocusedElement.focus();
    document.removeEventListener('keydown', handleEsc);
  }

  function handleEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderButton);
  } else {
    renderButton();
  }

})();
