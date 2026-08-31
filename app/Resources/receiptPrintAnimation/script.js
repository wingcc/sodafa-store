/**
 * Receipt Printer Animation - Luxury Edition
 * Features: 3D Paper Drop Shadows, 100% Synced Audio & Physical Thermal Cutter Knife Tear FX
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const printerStage = document.querySelector('.printer-stage');
  const receiptPaper = document.getElementById('receiptPaper');
  const cutterBladeFlash = document.getElementById('cutterBladeFlash');

  const btnPrintReceipt = document.getElementById('btnPrintReceipt');
  const btnPrintText = document.getElementById('btnPrintText');
  const btnTearReceipt = document.getElementById('btnTearReceipt');
  
  const btnModeClassic = document.getElementById('btnModeClassic');
  const btnModeSmooth = document.getElementById('btnModeSmooth');
  const btnModeSample = document.getElementById('btnModeSample');
  const optionBtns = document.querySelectorAll('.option-btn');

  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');

  const statusTitle = document.getElementById('statusTitle');
  const statusSub = document.getElementById('statusSub');

  // Customizer Drawer Elements
  const btnOpenCustomizer = document.getElementById('btnOpenCustomizer');
  const btnCloseCustomizer = document.getElementById('btnCloseCustomizer');
  const customizerDrawer = document.getElementById('customizerDrawer');
  const btnSaveCustomizer = document.getElementById('btnSaveCustomizer');
  const btnAddItem = document.getElementById('btnAddItem');
  const itemsContainer = document.getElementById('itemsContainer');
  const inputHeader = document.getElementById('inputHeader');
  const inputMeta = document.getElementById('inputMeta');
  const inputTaxRate = document.getElementById('inputTaxRate');

  // Display Elements
  const dispHeaderTitle = document.getElementById('dispHeaderTitle');
  const dispTotalAmount = document.getElementById('dispTotalAmount');
  const dispMeta = document.getElementById('dispMeta');
  const dispItemsList = document.getElementById('dispItemsList');
  const dispSubtotal = document.getElementById('dispSubtotal');
  const dispTax = document.getElementById('dispTax');
  const dispGrandTotal = document.getElementById('dispGrandTotal');

  // Application State
  let currentMode = 'smooth'; // 'classic' | 'smooth' | 'sample'
  let isPrinting = false;
  let isPrinted = false;
  let soundEnabled = true;

  // Receipt Data Model (Default Bizy Media Digital Agency Services)
  let receiptData = {
    header: "DIGITAL SERVICES RECEIPT",
    meta: "10TH AUGUST 2026 | INVOICE PAID",
    taxRate: 5,
    items: [
      { name: "1X Web Development & Design", price: 1499.00 },
      { name: "1X SEO Optimization (Monthly)", price: 499.00 },
      { name: "1X Digital Marketing & Branding", price: 799.00 }
    ]
  };

  // Sample Presets for Agency Services
  const samplePresets = [
    {
      header: "DIGITAL SERVICES RECEIPT",
      meta: "10TH AUGUST 2026 | INVOICE PAID",
      taxRate: 5,
      items: [
        { name: "1X Web Development & Design", price: 1499.00 },
        { name: "1X SEO Optimization (Monthly)", price: 499.00 },
        { name: "1X Digital Marketing & Branding", price: 799.00 }
      ]
    },
    {
      header: "WEB DEV & TECHNICAL SEO",
      meta: "15TH AUGUST 2026 | PAID VIA CARD",
      taxRate: 8.5,
      items: [
        { name: "1X Custom Next.js Web App", price: 1800.00 },
        { name: "1X Technical SEO Audit", price: 350.00 },
        { name: "1X Core Web Vitals Speed Boost", price: 450.00 }
      ]
    },
    {
      header: "FULL AGENCY BRANDING & MARKETING",
      meta: "20TH AUGUST 2026 | STRIPE (PAID)",
      taxRate: 5.0,
      items: [
        { name: "1X Corporate Brand Identity", price: 1200.00 },
        { name: "1X Google & Social Ads Campaign", price: 850.00 },
        { name: "1X Organic SEO Growth Suite", price: 650.00 }
      ]
    }
  ];
  let sampleIndex = 0;

  // ==========================================================================
  // Web Audio Synthesizer (Strictly Synced with Motion Duration)
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play mechanical step / whirr sound effect — 100% Synced with paper rollout duration!
  function playPrinterSound(mode, motionDurationMs) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const duration = motionDurationMs / 1000; // Exact 2.5s duration

    // Create noise buffer for mechanical motor background
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Bandpass filter for realistic thermal printer hum
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(mode === 'classic' ? 850 : 600, now);
    filter.Q.setValueAtTime(3.5, now);

    const gainNode = audioCtx.createGain();
    const peakGain = mode === 'classic' ? 0.07 : 0.04;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.08);
    gainNode.gain.setValueAtTime(peakGain, now + duration - 0.12);
    // Ramp down to zero in the final 120ms so sound stops EXACTLY when paper stops!
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration); // STOPS EXACTLY AT DURATION!

    // Stepper pulse clicks for Classic mode (only during paper motion)
    if (mode === 'classic') {
      const stepCount = 14;
      const interval = (duration - 0.1) / stepCount;

      for (let i = 0; i < stepCount; i++) {
        const stepTime = now + (i * interval);
        const osc = audioCtx.createOscillator();
        const stepGain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(210 + Math.random() * 60, stepTime);
        
        stepGain.gain.setValueAtTime(0.05, stepTime);
        stepGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.02);

        osc.connect(stepGain);
        stepGain.connect(audioCtx.destination);

        osc.start(stepTime);
        osc.stop(stepTime + 0.02);
      }
    }
  }

  // Play realistic mechanical cutter blade slice sound
  function playTearSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const duration = 0.35;
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.06));
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // ==========================================================================
  // Mode Selection Handling (Centered Control Bar)
  // ==========================================================================
  function setMode(mode) {
    if (isPrinting) return;
    currentMode = mode;

    optionBtns.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (mode === 'sample') {
      // Cycle through sample data presets
      sampleIndex = (sampleIndex + 1) % samplePresets.length;
      receiptData = JSON.parse(JSON.stringify(samplePresets[sampleIndex]));
      renderReceiptData();
      statusTitle.textContent = "Sample Loaded";
      statusSub.textContent = `Showing preset: "${receiptData.header}"`;
      
      // Auto trigger print to showcase sample
      if (!isPrinted) {
        triggerPrint();
      }
    } else if (mode === 'classic') {
      statusTitle.textContent = "Classic Step Mode";
      statusSub.textContent = "Realistic mechanical stepper motor print animation";
    } else if (mode === 'smooth') {
      statusTitle.textContent = "Smooth Easing Mode";
      statusSub.textContent = "Fluid continuous motion print animation";
    }
  }

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setMode(mode);
    });
  });

  // Sound Toggle
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIconOn.classList.remove('hidden');
        soundIconOff.classList.add('hidden');
        initAudio();
      } else {
        soundIconOn.classList.add('hidden');
        soundIconOff.classList.remove('hidden');
      }
    });
  }

  // ==========================================================================
  // Print & Tear Animation Triggers
  // ==========================================================================
  function triggerPrint() {
    if (isPrinting) return;

    // Reset classes
    receiptPaper.classList.remove('tearing', 'retracted', 'printed', 'printing-classic', 'printing-smooth', 'vibrating');
    cutterBladeFlash.classList.remove('active');

    // Force DOM reflow
    void receiptPaper.offsetWidth;

    isPrinting = true;
    printerStage.classList.add('has-printed');
    btnPrintText.textContent = "Printing...";
    btnPrintReceipt.disabled = true;

    // EXACT 2.5s Animation & Audio Duration — Stops 100% synchronously!
    const animDuration = 2500;

    // Play Audio FX — sound lasts exactly 2.5s
    playPrinterSound(currentMode, animDuration);

    // Apply Animation Classes
    if (currentMode === 'classic') {
      receiptPaper.classList.add('printing-classic', 'vibrating');
    } else {
      receiptPaper.classList.add('printing-smooth');
    }

    // Finished Callback: Motion and Sound end EXACTLY together at 2000ms!
    setTimeout(() => {
      receiptPaper.classList.remove('printing-classic', 'printing-smooth', 'vibrating');
      receiptPaper.classList.add('printed');
      
      isPrinting = false;
      isPrinted = true;
      
      btnPrintText.textContent = "Re-print receipt";
      btnPrintReceipt.disabled = false;
      btnTearReceipt.classList.remove('hidden');
      
      statusTitle.textContent = "Payment Successful";
      statusSub.textContent = "You're all set—now let the receipt roll!";
    }, animDuration);
  }

  function triggerTear() {
    if (!isPrinted || isPrinting) return;

    // 1. Play mechanical cutter knife audio
    playTearSound();

    // 2. Trigger cutter blade flash animation at slot slit
    cutterBladeFlash.classList.add('active');

    // 3. Trigger physical cut-and-drop animation
    receiptPaper.classList.add('tearing');
    btnTearReceipt.classList.add('hidden');
    
    statusTitle.textContent = "Receipt Cut & Torn";
    statusSub.textContent = "Ready to print a fresh copy anytime.";

    // 4. Reset paper to retracted position after tear animation completes (550ms)
    setTimeout(() => {
      receiptPaper.classList.remove('tearing', 'printed');
      receiptPaper.classList.add('retracted');
      cutterBladeFlash.classList.remove('active');
      printerStage.classList.remove('has-printed');
      isPrinted = false;
      btnPrintText.textContent = "Print receipt";
    }, 550);
  }

  btnPrintReceipt.addEventListener('click', () => {
    initAudio();
    if (isPrinted) {
      // Re-print action resets and prints again
      receiptPaper.classList.remove('printed');
      receiptPaper.classList.add('retracted');
      printerStage.classList.remove('has-printed');
      isPrinted = false;
      setTimeout(() => {
        triggerPrint();
      }, 300);
    } else {
      triggerPrint();
    }
  });

  btnTearReceipt.addEventListener('click', triggerTear);

  // ==========================================================================
  // Render Receipt Data & Dollar ($) Currency Formatting
  // ==========================================================================
  function formatDollar(amount) {
    return '$' + Number(amount).toFixed(2);
  }

  function renderReceiptData() {
    dispHeaderTitle.textContent = receiptData.header;
    dispMeta.textContent = receiptData.meta;

    dispItemsList.innerHTML = '';
    let subtotal = 0;

    receiptData.items.forEach(item => {
      subtotal += item.price;
      const row = document.createElement('div');
      row.className = 'receipt-item-row';
      row.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-price">${formatDollar(item.price)}</span>
      `;
      dispItemsList.appendChild(row);
    });

    const tax = subtotal * (receiptData.taxRate / 100);
    const grandTotal = subtotal + tax;

    dispSubtotal.textContent = formatDollar(subtotal);
    dispTax.textContent = formatDollar(tax);
    dispGrandTotal.textContent = formatDollar(grandTotal);
    dispTotalAmount.textContent = formatDollar(grandTotal);
  }

  // ==========================================================================
  // Customizer Drawer Logic
  // ==========================================================================
  if (btnOpenCustomizer) {
    btnOpenCustomizer.addEventListener('click', () => {
      customizerDrawer.classList.remove('hidden');
      populateCustomizerForm();
    });
  }

  btnCloseCustomizer.addEventListener('click', () => {
    customizerDrawer.classList.add('hidden');
  });

  function populateCustomizerForm() {
    inputHeader.value = receiptData.header;
    inputMeta.value = receiptData.meta;
    inputTaxRate.value = receiptData.taxRate;

    itemsContainer.innerHTML = '';
    receiptData.items.forEach((item, index) => {
      addItemInputRow(item.name, item.price);
    });
  }

  function addItemInputRow(name = '', price = 0) {
    const row = document.createElement('div');
    row.className = 'custom-item-row';
    row.innerHTML = `
      <input type="text" placeholder="Item name" value="${name}" class="item-name-input">
      <input type="number" placeholder="Price ($)" value="${price}" step="0.01" class="item-price-input">
      <button type="button" class="remove-item-btn">&times;</button>
    `;

    row.querySelector('.remove-item-btn').addEventListener('click', () => {
      row.remove();
    });

    itemsContainer.appendChild(row);
  }

  btnAddItem.addEventListener('click', () => {
    addItemInputRow('1X New Item', 9.99);
  });

  btnSaveCustomizer.addEventListener('click', () => {
    receiptData.header = inputHeader.value || "PAYMENT SUCCESSFUL";
    receiptData.meta = inputMeta.value || "28TH APRIL 2026 | CARD(PAID)";
    receiptData.taxRate = parseFloat(inputTaxRate.value) || 0;

    const nameInputs = itemsContainer.querySelectorAll('.item-name-input');
    const priceInputs = itemsContainer.querySelectorAll('.item-price-input');
    
    receiptData.items = [];
    nameInputs.forEach((input, idx) => {
      const name = input.value.trim() || '1X Item';
      const price = parseFloat(priceInputs[idx].value) || 0;
      receiptData.items.push({ name, price });
    });

    renderReceiptData();
    customizerDrawer.classList.add('hidden');

    if (isPrinted) {
      statusTitle.textContent = "Receipt Updated";
      statusSub.textContent = "Customized details updated in real-time.";
    }
  });

  // Initialize display
  renderReceiptData();
});
