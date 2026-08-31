'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Printer, Scissors, RefreshCw } from 'lucide-react';

interface ReceiptItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

interface ReceiptPrinterProps {
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  isAr?: boolean;
}

export default function ReceiptPrinter({
  orderNumber,
  createdAt,
  paymentMethod,
  items,
  subtotal,
  discount,
  shippingCost,
  total,
  isAr = false,
}: ReceiptPrinterProps) {
  const [isPrinted, setIsPrinted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [hasPrintedOnce, setHasPrintedOnce] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cutterRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundEnabled] = useState(true);

  const formattedDate = new Date(createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const metaText = `${formattedDate} | ${paymentMethod ? paymentMethod.replace('_', ' ').toUpperCase() : 'CASH ON DELIVERY'}`;
  const trackUrl = typeof window !== 'undefined' ? `${window.location.origin}/track-order?order=${encodeURIComponent(orderNumber)}` : `https://sodfa.store/track-order?order=${encodeURIComponent(orderNumber)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(trackUrl)}&bgcolor=fafaf8`;

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playPrinterSound = (mode: 'classic' | 'smooth', durationMs: number) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(mode === 'classic' ? 850 : 600, now);
    filter.Q.setValueAtTime(3.5, now);
    const gainNode = ctx.createGain();
    const peakGain = mode === 'classic' ? 0.07 : 0.04;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.08);
    gainNode.gain.setValueAtTime(peakGain, now + duration - 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
    if (mode === 'classic') {
      const stepCount = 14;
      const interval = (duration - 0.1) / stepCount;
      for (let i = 0; i < stepCount; i++) {
        const stepTime = now + i * interval;
        const osc = ctx.createOscillator();
        const stepGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(210 + Math.random() * 60, stepTime);
        stepGain.gain.setValueAtTime(0.05, stepTime);
        stepGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.02);
        osc.connect(stepGain);
        stepGain.connect(ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + 0.02);
      }
    }
  };

  const playTearSound = () => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const duration = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  };

  const triggerPrint = () => {
    if (isPrinting) return;
    if (receiptRef.current) {
      receiptRef.current.classList.remove('tearing', 'retracted', 'printed', 'printing-classic', 'printing-smooth', 'vibrating');
      void receiptRef.current.offsetWidth;
    }
    if (cutterRef.current) cutterRef.current.classList.remove('active');
    setIsPrinting(true);
    setIsTearing(false);
    if (stageRef.current) stageRef.current.classList.add('has-printed');
    const animDuration = 2500;
    playPrinterSound('smooth', animDuration);
    if (receiptRef.current) {
      receiptRef.current.classList.add('printing-smooth');
    }
    setTimeout(() => {
      if (receiptRef.current) {
        receiptRef.current.classList.remove('printing-smooth', 'printing-classic', 'vibrating');
        receiptRef.current.classList.add('printed');
      }
      setIsPrinting(false);
      setIsPrinted(true);
      setHasPrintedOnce(true);
    }, animDuration);
  };

  const triggerTear = () => {
    if (!isPrinted || isPrinting) return;
    playTearSound();
    if (cutterRef.current) cutterRef.current.classList.add('active');
    if (receiptRef.current) receiptRef.current.classList.add('tearing');
    setIsTearing(true);
    setTimeout(() => {
      if (receiptRef.current) {
        receiptRef.current.classList.remove('tearing', 'printed');
        receiptRef.current.classList.add('retracted');
      }
      if (cutterRef.current) cutterRef.current.classList.remove('active');
      if (stageRef.current) stageRef.current.classList.remove('has-printed');
      setIsPrinted(false);
      setIsTearing(false);
    }, 550);
  };

  const handlePrintClick = () => {
    initAudio();
    if (isPrinted) {
      if (receiptRef.current) {
        receiptRef.current.classList.remove('printed');
        receiptRef.current.classList.add('retracted');
      }
      if (stageRef.current) stageRef.current.classList.remove('has-printed');
      setIsPrinted(false);
      setTimeout(() => triggerPrint(), 300);
    } else {
      triggerPrint();
    }
  };

  const handleSave = async () => {
    if (!receiptRef.current) return;
    // Use browser print as fallback; html2canvas can be added later if needed
    window.print();
  };

  // Auto-print on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPrint();
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="receipt-printer-wrapper w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .receipt-printer-wrapper {
          --paper-bg: #fafaf8;
          --paper-ink: #222222;
          --font-mono: 'JetBrains Mono', monospace;
          --font-ui: 'Plus Jakarta Sans', sans-serif;
        }
        .machine-unit {
          width: 100%;
          max-width: 360px;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 30;
        }
        /* Easy, beautiful, minimal machine — flat green, clean */
        .machine-hood-top {
          width: 100%;
          max-width: 360px;
          height: 38px;
          border-radius: 16px 16px 8px 8px;
          background: #064e3b;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 20px rgba(6,78,59,0.18);
          position: relative;
          overflow: hidden;
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .machine-hood-top::after {
          content: "SODFA";
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.24em;
          color: rgba(255,255,255,0.92);
          pointer-events: none;
        }
        .hood-highlight { display: none; }
        .machine-slot-slit {
          width: 88%;
          max-width: 320px;
          height: 10px;
          margin-top: -2px;
          background: #0a1f14;
          border-radius: 999px;
          box-shadow: inset 0 3px 8px rgba(0,0,0,0.45);
          position: relative;
          z-index: 5;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .machine-slot-slit::before { display: none; }
        .cutter-blade-flash {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 330px;
          height: 3px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #ffffff 50%, rgba(255,255,255,0) 100%);
          box-shadow: 0 0 10px #ffffff;
          z-index: 35;
          opacity: 0;
          pointer-events: none;
        }
        .cutter-blade-flash.active {
          animation: cutterBladeFlash 0.35s ease-out forwards;
        }
        @keyframes cutterBladeFlash {
          0% { opacity: 0; transform: translateX(-50%) scaleX(0.1); }
          50% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          100% { opacity: 0; transform: translateX(-50%) scaleX(1); }
        }
        .machine-hood-bottom {
          width: 100%;
          max-width: 360px;
          height: 10px;
          margin-top: -1px;
          border-radius: 0 0 14px 14px;
          background: #064e3b;
          border: 1px solid rgba(255,255,255,0.08);
          border-top: none;
          box-shadow: 0 6px 16px rgba(0,0,0,0.07);
          position: relative;
          z-index: 10;
        }
        .paper-viewport {
          position: absolute;
          top: 39px;
          left: 50%;
          transform: translateX(-50%);
          width: 94%;
          max-width: 340px;
          clip-path: inset(0px -60px -1200px -60px);
          z-index: 8;
          padding-bottom: 20px;
          pointer-events: none;
          perspective: 1200px;
          perspective-origin: 50% 0%;
          filter: drop-shadow(0 16px 32px rgba(6,40,28,0.16)) drop-shadow(0 4px 10px rgba(6,40,28,0.08));
        }
        .receipt-paper-wrapper {
          width: 92%;
          max-width: 315px;
          margin: 0 auto;
          background-color: var(--paper-bg);
          position: relative;
          transform-origin: top center;
          transform-style: preserve-3d;
          transition: transform 2.5s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
          user-select: none;
          pointer-events: auto;
          clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 10px), 98.33% 100%, 96.67% calc(100% - 10px), 95% 100%, 93.33% calc(100% - 10px), 91.67% 100%, 90% calc(100% - 10px), 88.33% 100%, 86.67% calc(100% - 10px), 85% 100%, 83.33% calc(100% - 10px), 81.67% 100%, 80% calc(100% - 10px), 78.33% 100%, 76.67% calc(100% - 10px), 75% 100%, 73.33% calc(100% - 10px), 71.67% 100%, 70% calc(100% - 10px), 68.33% 100%, 66.67% calc(100% - 10px), 65% 100%, 63.33% calc(100% - 10px), 61.67% 100%, 60% calc(100% - 10px), 58.33% 100%, 56.67% calc(100% - 10px), 55% 100%, 53.33% calc(100% - 10px), 51.67% 100%, 50% calc(100% - 10px), 48.33% 100%, 46.67% calc(100% - 10px), 45% 100%, 43.33% calc(100% - 10px), 41.67% 100%, 40% calc(100% - 10px), 38.33% 100%, 36.67% calc(100% - 10px), 35% 100%, 33.33% calc(100% - 10px), 31.67% 100%, 30% calc(100% - 10px), 28.33% 100%, 26.67% calc(100% - 10px), 25% 100%, 23.33% calc(100% - 10px), 21.67% 100%, 20% calc(100% - 10px), 18.33% 100%, 16.67% calc(100% - 10px), 15% 100%, 13.33% calc(100% - 10px), 11.67% 100%, 10% calc(100% - 10px), 8.33% 100%, 6.67% calc(100% - 10px), 5% 100%, 3.33% calc(100% - 10px), 1.67% 100%, 0% calc(100% - 10px));
        }
        .receipt-paper-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 1;
        }
        .receipt-paper-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 35%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.04) 100%);
          pointer-events: none;
          z-index: 3;
        }
        .receipt-paper-wrapper.retracted {
          transform: translateY(-93%) rotateX(-16deg) translateZ(-25px);
        }
        .receipt-paper-wrapper.printed {
          transform: translateY(0%) rotateX(0deg) translateZ(0px);
        }
        .receipt-paper-wrapper.printing-smooth {
          animation: printSmooth3D 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes printSmooth3D {
          0% { transform: translateY(-93%) rotateX(-18deg) translateZ(-30px) scale(0.97); opacity: 0.4; }
          20% { transform: translateY(-70%) rotateX(-12deg) translateZ(20px) scale(0.985); opacity: 0.85; }
          45% { transform: translateY(-40%) rotateX(-6deg) translateZ(26px) scale(0.995); opacity: 1; }
          75% { transform: translateY(-12%) rotateX(-2deg) translateZ(10px) scale(1); }
          90% { transform: translateY(1%) rotateX(0.8deg) translateZ(2px) scale(1); }
          100% { transform: translateY(0%) rotateX(0deg) translateZ(0px) scale(1); opacity: 1; }
        }
        .receipt-paper-wrapper.tearing {
          animation: paperTearAway 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          pointer-events: none;
          transform-origin: top right;
        }
        @keyframes paperTearAway {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          20% { transform: translateY(6px) translateX(18px) rotate(-3deg); opacity: 1; }
          50% { transform: translateY(14px) translateX(55px) rotate(-8deg) scale(0.98); opacity: 0.8; }
          100% { transform: translateY(22px) translateX(110px) rotate(-14deg) scale(0.94); opacity: 0; }
        }
        .receipt-content {
          padding: 1.35rem 1.25rem 1.6rem 1.25rem;
          font-family: var(--font-mono);
          color: var(--paper-ink);
          position: relative;
          z-index: 2;
        }
        .stage-info {
          margin-top: 3.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: margin-top 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .printer-stage.has-printed .stage-info {
          margin-top: 26rem;
        }
        @media (max-width: 640px) {
          .printer-stage.has-printed .stage-info { margin-top: 24rem; }
          .machine-unit { max-width: 320px; }
          .machine-hood-top, .machine-hood-bottom { max-width: 320px; }
          .paper-viewport { max-width: 300px; }
          .receipt-paper-wrapper { max-width: 270px; }
        }
        @media print {
          .receipt-printer-wrapper .stage-info, .receipt-printer-wrapper .reprint-fab { display: none !important; }
          .receipt-paper-wrapper { box-shadow: none !important; }
        }
      `}</style>

      <div ref={stageRef} className="printer-stage w-full flex flex-col items-center">
        {/* Machine - easy, beautiful, green — two parts with ticket between */}
        <div className="machine-unit">
          <div className="machine-hood-top">
            <div className="hood-highlight" />
            {/* Reprint — small icon only, top near SODFA inside machine */}
            <button
              onClick={handlePrintClick}
              disabled={isPrinting}
              title={isAr ? 'طباعة' : 'Print'}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white/15 backdrop-blur border border-white/20 grid place-items-center text-white hover:bg-white hover:text-[#064e3b] hover:border-white transition disabled:opacity-40"
              style={{ display: hasPrintedOnce ? 'none' : 'grid' }}
            >
              <Printer size={13} />
            </button>
            <button
              onClick={handlePrintClick}
              disabled={isPrinting}
              title={isAr ? 'إعادة الطباعة' : 'Re-print'}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white border border-white/60 shadow grid place-items-center text-[#064e3b] hover:bg-emerald-50 hover:border-emerald-200 transition disabled:opacity-50"
              style={{ display: hasPrintedOnce ? 'grid' : 'none' }}
            >
              <RefreshCw size={13} className={isPrinting ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="machine-slot-slit" />
          <div ref={cutterRef} className="cutter-blade-flash" />

          <div ref={viewportRef} className="paper-viewport">
            <div
              ref={receiptRef}
              className={`receipt-paper-wrapper ${isPrinted ? 'printed' : 'retracted'} ${isPrinting ? 'printing-smooth' : ''} ${isTearing ? 'tearing' : ''}`}
            >
              <div className="receipt-content">
                {/* Header — text logo, no image, clean & beautiful */}
                <div className="receipt-header flex items-start justify-between mb-3">
                  <div className="header-brand-info flex flex-col gap-1 w-[68%]">
                    <div className="brand-company-name text-[0.82rem] font-extrabold tracking-[0.14em] text-[#064e3b] font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      SODFA STORE
                    </div>
                    <div className="payment-title text-[0.66rem] font-semibold tracking-wider text-[#6b7280] leading-tight font-mono">
                      {isAr ? 'إيصال الطلب' : 'ORDER RECEIPT'}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[0.58rem] font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full w-fit">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" /> {isAr ? 'موثّق' : 'VERIFIED'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#0d7a5f] to-[#065f46] grid place-items-center text-white shadow-[0_6px_16px_rgba(6,78,59,.18)] border border-white/10">
                      <span className="font-black tracking-[0.16em] text-[11px]">SODFA</span>
                    </div>
                    <span className="text-[8px] font-bold tracking-[0.18em] text-[#064e3b]/60">EST. 2024 • MA</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="receipt-amount-section mb-3">
                  <div className="receipt-amount text-[1.65rem] font-bold tracking-tight text-[#111] leading-none font-mono">
                    {total.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                  </div>
                  <div className="receipt-meta text-[0.6rem] font-medium uppercase tracking-wider text-[#888] font-mono mt-1">
                    {metaText}
                  </div>
                </div>

                <div className="receipt-divider w-full h-0 border-b border-dashed border-[#d1d5db] my-2.5" />

                {/* Items */}
                <div className="receipt-items-list flex flex-col gap-1.5">
                  {items.map((item) => (
                    <div key={item.productId} className="receipt-item-row flex justify-between items-center text-[0.76rem] font-medium font-mono">
                      <span className="item-name text-[#333] max-w-[68%] truncate">
                        {item.qty}X {item.productName}
                      </span>
                      <span className="item-price font-semibold text-[#222]">
                        {(item.unitPrice * item.qty).toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="receipt-divider w-full h-0 border-b border-dashed border-[#d1d5db] my-2.5" />

                {/* Totals */}
                <div className="receipt-totals-section flex flex-col gap-1 text-[0.76rem] font-mono">
                  <div className="total-row flex justify-between text-[#6b7280] font-medium">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-semibold text-[#222]">{subtotal.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                  </div>
                  {discount > 0 && (
                    <div className="total-row flex justify-between text-red-600">
                      <span>{isAr ? 'الخصم' : 'Discount'}</span>
                      <span className="font-semibold">-{discount.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                    </div>
                  )}
                  <div className="total-row flex justify-between text-[#6b7280] font-medium">
                    <span>{isAr ? 'الشحن' : 'Shipping'}</span>
                    <span className="font-semibold text-emerald-700">
                      {shippingCost === 0 ? (isAr ? 'مجاني' : 'FREE') : `${shippingCost.toFixed(2)} ${isAr ? 'د.م' : 'MAD'}`}
                    </span>
                  </div>
                  <div className="receipt-grand-total flex justify-between items-center mt-1.5 pt-2 border-t border-[#d1d5db] font-bold text-[0.8rem] text-[#111]">
                    <span>{isAr ? 'الإجمالي الكلي' : 'GRAND TOTAL'}</span>
                    <span className="text-[1.35rem] font-black leading-none text-[#111]">{total.toFixed(2)} {isAr ? 'د.م' : 'MAD'}</span>
                  </div>
                </div>

                <div className="receipt-footer text-center mt-3 pt-1">
                  <div className="footer-msg text-[0.66rem] font-semibold tracking-widest text-[#6b7280] font-mono">
                    {isAr ? 'شكراً لك' : 'HAVE A NICE DAY!'}
                  </div>
                  {/* QR only — barcode removed, keep totals clean */}
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="group block">
                      <img
                        src={qrSrc}
                        alt="QR"
                        width={92}
                        height={92}
                        className="w-[92px] h-[92px] rounded-xl border border-stone-200 bg-white p-1.5 shadow-sm group-hover:shadow-md transition"
                        loading="lazy"
                      />
                      <div className="text-[0.6rem] font-medium text-[#0d7a5f] mt-1 group-hover:underline text-center">{isAr ? 'امسح للتتبع' : 'Scan to track'}</div>
                    </a>
                    <div className="barcode-num text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[#333] font-mono bg-stone-100 px-2 py-1 rounded-full border border-stone-200">
                      {orderNumber}
                    </div>
                  </div>
                </div>
              </div>

              <div className="serrated-edge w-full h-3" />
            </div>
            {/* Beautiful Tear button — at bottom serrated edge */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ bottom: '-14px', display: hasPrintedOnce ? 'block' : 'none' }}>
              <button
                onClick={triggerTear}
                disabled={!isPrinted || isPrinting}
                title={isAr ? 'تمزيق الإيصال — اضغط للقص' : 'Tear receipt — click to cut'}
                aria-label={isAr ? 'تمزيق الإيصال' : 'Tear receipt'}
                className={`group w-11 h-11 rounded-full border-2 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] grid place-items-center transition-all hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:scale-105 active:scale-95 ${isPrinted && !isPrinting ? 'border-stone-200 text-stone-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300' : 'border-stone-200 text-stone-400 cursor-not-allowed opacity-60'}`}
              >
                <Scissors size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-widest uppercase text-stone-400 whitespace-nowrap pointer-events-none">
                {isAr ? 'قص' : 'TEAR'}
              </div>
            </div>
          </div>
        </div>



        {/* Stage Info & Controls */}
        <div className="stage-info w-full max-w-[380px]">
          <h1 className="status-heading text-[17px] font-bold text-[#064e3b] tracking-tight" style={{ fontFamily: 'var(--font-ui)' }}>
            {isAr ? 'تم الدفع بنجاح' : 'Payment Successful'}
          </h1>
          <p className="status-subtext text-[13px] text-[#6b7280] mt-1 leading-5" style={{ fontFamily: 'var(--font-ui)' }}>
            {isAr ? 'كل شيء جاهز — الآن دع الإيصال يطبع!' : "You're all set—now let the receipt roll!"}
          </p>

          <div className="centered-action-bar flex items-center justify-center gap-2.5 mt-5 flex-wrap">
            <button
              onClick={handlePrintClick}
              disabled={isPrinting}
              className="print-action-btn inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border bg-white text-[#064e3b] font-bold text-[13px] shadow-md hover:shadow-lg hover:bg-[#ecfdf5] transition-all disabled:opacity-50"
              style={{ borderColor: '#a7f3d0', fontFamily: 'var(--font-ui)' }}
            >
              <Printer size={16} />
              <span>{isPrinting ? (isAr ? 'جاري الطباعة...' : 'Printing...') : hasPrintedOnce ? (isAr ? 'إعادة الطباعة' : 'Re-print') : (isAr ? 'طباعة الإيصال' : 'Print receipt')}</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 text-center leading-4">
            {isAr ? 'QR يعمل — امسح للذهاب إلى صفحة التتبع الحقيقية' : 'QR works — scan to open real tracking page'}
          </p>
        </div>
      </div>
    </div>
  );
}
