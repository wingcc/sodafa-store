'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Printer, Scissors, RefreshCw, X } from 'lucide-react';

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
  const [isMobilePopup, setIsMobilePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [popupAnimationDone, setPopupAnimationDone] = useState(false);
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
    // Only play sound if audio context is initialized
    if (audioInitialized || audioCtxRef.current) {
      playPrinterSound('smooth', animDuration);
    }
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
    setAudioInitialized(true);
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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-print on mount with mobile popup
  useEffect(() => {
    const timer = setTimeout(() => {
      // Initialize audio context on first user interaction or mount
      initAudio();
      if (isMobile) {
        setIsMobilePopup(true);
        // Auto-start printing after popup appears
        setTimeout(() => {
          triggerPrint();
        }, 500);
      } else {
        triggerPrint();
      }
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const [isPopupTearing, setIsPopupTearing] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const handlePopupInteraction = () => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
  };

  const handleClosePopup = () => {
    if (isPrinted && !isPopupTearing) {
      // Trigger tear animation first
      setIsPopupTearing(true);
      playTearSound();
      setTimeout(() => {
        setPopupAnimationDone(true);
        setTimeout(() => {
          setIsMobilePopup(false);
          setIsPopupTearing(false);
        }, 400);
      }, 600);
    } else {
      setPopupAnimationDone(true);
      setTimeout(() => {
        setIsMobilePopup(false);
      }, 400);
    }
  };

  return (
    <div className="receipt-printer-wrapper w-full">
      {/* Mobile Fullscreen Popup */}
      {isMobilePopup && (
        <div
          className={`mobile-printer-popup ${popupAnimationDone ? 'closing' : ''}`}
          onTouchStart={handlePopupInteraction}
          onClick={handlePopupInteraction}
        >
          <div className="popup-backdrop" />
          
          {/* Floating particles */}
          <div className="popup-particles">
            <div className="particle particle-1" />
            <div className="particle particle-2" />
            <div className="particle particle-3" />
            <div className="particle particle-4" />
            <div className="particle particle-5" />
          </div>

          <div className="popup-content">
            {/* Header */}
            <div className="popup-header">
              <div className="popup-header-left">
                <div className="popup-check-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="popup-title">{isAr ? 'تم تأكيد طلبك' : 'Order Confirmed'}</p>
                  <p className="popup-subtitle">{isAr ? 'جاري طباعة الإيصال' : 'Printing your receipt'}</p>
                </div>
              </div>
              <button
                onClick={handleClosePopup}
                className="popup-close-btn"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printer Machine */}
            <div className="popup-printer-section">
              <div className="popup-machine">
                <div className="machine-hood-top popup-hood">
                  <div className="hood-highlight" />
                </div>
                <div className="machine-slot-slit popup-slot" />
                <div ref={cutterRef} className="cutter-blade-flash popup-cutter" />

                {/* Receipt Paper */}
                <div className="popup-viewport-area">
                  <div
                    ref={receiptRef}
                    className={`popup-receipt ${isPrinted ? 'printed' : 'retracted'} ${isPrinting ? 'printing-smooth' : ''} ${isPopupTearing ? 'tearing' : ''}`}
                  >
                    <div className="receipt-content popup-receipt-content">
                      {/* Header */}
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
                        {/* QR Code */}
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
                </div>

                {/* Action Button - tear or reprint */}
                {hasPrintedOnce && (
                  <div className="popup-tear-btn-container">
                    {isPrinted ? (
                      /* Tear mode - scissors */
                      <button
                        onClick={triggerTear}
                        disabled={isPrinting || isTearing}
                        title={isAr ? 'تمزيق الإيصال — اضغط للقص' : 'Tear receipt — click to cut'}
                        aria-label={isAr ? 'تمزيق الإيصال' : 'Tear receipt'}
                        className="group w-11 h-11 rounded-full border-2 border-amber-400 bg-white text-amber-700 shadow-[0_8px_20px_rgba(0,0,0,0.15)] grid place-items-center transition-all hover:shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:scale-105 hover:bg-amber-50 active:scale-95"
                      >
                        <Scissors size={16} className="group-hover:rotate-12 transition-transform" />
                      </button>
                    ) : (
                      /* Reprint mode - print icon */
                      <button
                        onClick={handlePrintClick}
                        disabled={isPrinting}
                        title={isAr ? 'إعادة طباعة الإيصال' : 'Re-print receipt'}
                        aria-label={isAr ? 'إعادة طباعة الإيصال' : 'Re-print receipt'}
                        className="group w-11 h-11 rounded-full border-2 border-emerald-400 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(0,0,0,0.15)] grid place-items-center transition-all hover:shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:scale-105 hover:bg-emerald-50 active:scale-95"
                      >
                        <Printer size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    <div className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mt-1">
                      {isPrinting ? (isAr ? 'جاري...' : 'PRINTING...') : isPrinted ? (isAr ? 'قص' : 'TEAR') : (isAr ? 'إعادة' : 'RE-PRINT')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Close Button */}
            <div className="popup-footer">
              <div className="popup-status-badge">
                <div className={`status-dot ${isPrinting ? 'printing' : 'done'}`} />
                <span className="popup-status-text">
                  {isPrinting ? (isAr ? 'جاري طباعة الإيصال...' : 'Printing receipt...') : 
                   isPopupTearing ? (isAr ? 'جاري قص الإيصال...' : 'Tearing receipt...') :
                   (isAr ? 'تم الطباعة بنجاح!' : 'Print complete!')}
                </span>
              </div>
              
              <button
                onClick={handleClosePopup}
                className="popup-done-btn"
              >
                {isPopupTearing ? (
                  <span className="flex items-center gap-2">
                    <Scissors size={16} className="animate-pulse" />
                    {isAr ? 'جاري القص...' : 'Tearing...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isAr ? 'تم' : 'Done'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          background: linear-gradient(180deg, #0d5c47 0%, #064e3b 50%, #043d2f 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 
            0 8px 24px rgba(6,78,59,0.25),
            0 4px 10px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .machine-hood-top::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        }
        .machine-hood-top::after {
          content: "SODFA";
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.24em;
          color: rgba(255,255,255,0.92);
          pointer-events: none;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .hood-highlight { display: none; }
        .machine-slot-slit {
          width: 88%;
          max-width: 320px;
          height: 10px;
          margin-top: -2px;
          background: linear-gradient(180deg, #020d08 0%, #0a1f14 50%, #061410 100%);
          border-radius: 999px;
          box-shadow: 
            inset 0 4px 12px rgba(0,0,0,0.5),
            inset 0 1px 3px rgba(0,0,0,0.3),
            0 2px 4px rgba(0,0,0,0.15);
          position: relative;
          z-index: 5;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .machine-slot-slit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 5%;
          right: 5%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
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
          filter: drop-shadow(0 16px 32px rgba(6,40,28,0.2)) drop-shadow(0 6px 16px rgba(6,40,28,0.12));
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
          border-radius: 2px 2px 0 0;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.12),
            0 8px 40px rgba(0, 0, 0, 0.08),
            2px 0 8px rgba(0, 0, 0, 0.04),
            -2px 0 8px rgba(0, 0, 0, 0.04);
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

        /* Mobile Fullscreen Popup Styles */
        .mobile-printer-popup {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          background: linear-gradient(165deg, #0a1a14 0%, #0d2f25 40%, #061c16 100%);
          animation: popupFadeIn 0.4s ease;
          overflow: hidden;
        }
        .mobile-printer-popup.closing {
          animation: popupFadeOut 0.5s ease forwards;
        }
        .popup-backdrop {
          display: none;
        }

        /* Floating particles */
        .popup-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          animation: floatParticle 8s ease-in-out infinite;
        }
        .particle-1 {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #cda552, transparent);
          top: 10%;
          left: -20%;
          animation-delay: 0s;
        }
        .particle-2 {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #10b981, transparent);
          top: 60%;
          right: -15%;
          animation-delay: 2s;
        }
        .particle-3 {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, #cda552, transparent);
          bottom: 20%;
          left: 10%;
          animation-delay: 4s;
        }
        .particle-4 {
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, #fff, transparent);
          top: 30%;
          right: 20%;
          animation-delay: 1s;
        }
        .particle-5 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #10b981, transparent);
          bottom: 10%;
          right: 10%;
          animation-delay: 3s;
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-15px, 20px) scale(0.9); }
          75% { transform: translate(25px, 15px) scale(1.05); }
        }

        .popup-content {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          z-index: 10;
          animation: popupSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-printer-popup.closing .popup-content {
          animation: popupSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Header */
        .popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          animation: slideDown 0.4s ease 0.2s both;
        }
        .popup-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .popup-check-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: grid;
          place-items: center;
          color: white;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
          animation: checkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 800;
          color: white;
          font-family: var(--font-ui);
          letter-spacing: -0.01em;
        }
        .popup-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--font-ui);
          margin-top: 2px;
        }
        .popup-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: grid;
          place-items: center;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .popup-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: scale(1.1);
        }

        /* Printer Section */
        .popup-printer-section {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 16px;
          padding-top: 10px;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .popup-printer-section::-webkit-scrollbar {
          width: 4px;
        }
        .popup-printer-section::-webkit-scrollbar-track {
          background: transparent;
        }
        .popup-printer-section::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .popup-machine {
          width: 100%;
          max-width: 340px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: machineEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }
        .popup-tear-btn-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
          animation: fadeInUp 0.4s ease 0.5s both;
        }
        .popup-hood {
          max-width: 340px !important;
          height: 44px !important;
          border-radius: 18px 18px 10px 10px !important;
          background: linear-gradient(180deg, #0d5c47 0%, #064e3b 50%, #043d2f 100%) !important;
          box-shadow: 
            0 10px 30px rgba(6, 78, 59, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .popup-hood::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        }
        .popup-slot {
          max-width: 300px !important;
          height: 12px !important;
          margin-top: -3px !important;
          background: linear-gradient(180deg, #020d08 0%, #0a1f14 50%, #061410 100%) !important;
          box-shadow: 
            inset 0 4px 12px rgba(0, 0, 0, 0.6),
            inset 0 1px 3px rgba(0, 0, 0, 0.4),
            0 2px 4px rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        .popup-cutter {
          top: 44px;
          max-width: 310px !important;
        }
        .popup-reprint-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
          color: white;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .popup-reprint-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-50%) scale(1.1);
        }
        .popup-reprint-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Receipt viewport - KEY: hides receipt above the slot */
        .popup-viewport-area {
          width: 100%;
          max-width: 340px;
          position: relative;
          margin-top: -2px;
          z-index: 8;
          perspective: 1200px;
          perspective-origin: 50% 0%;
          overflow: hidden;
          clip-path: inset(0 0 0 0);
        }
        .popup-receipt {
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
          border-radius: 2px 2px 0 0;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.15),
            0 8px 40px rgba(0, 0, 0, 0.1),
            2px 0 8px rgba(0, 0, 0, 0.05),
            -2px 0 8px rgba(0, 0, 0, 0.05);
          clip-path: polygon(
            0% 0%, 100% 0%, 
            100% calc(100% - 10px), 98.33% 100%, 96.67% calc(100% - 10px), 
            95% 100%, 93.33% calc(100% - 10px), 91.67% 100%, 
            90% calc(100% - 10px), 88.33% 100%, 86.67% calc(100% - 10px), 
            85% 100%, 83.33% calc(100% - 10px), 81.67% 100%, 
            80% calc(100% - 10px), 78.33% 100%, 76.67% calc(100% - 10px), 
            75% 100%, 73.33% calc(100% - 10px), 71.67% 100%, 
            70% calc(100% - 10px), 68.33% 100%, 66.67% calc(100% - 10px), 
            65% 100%, 63.33% calc(100% - 10px), 61.67% 100%, 
            60% calc(100% - 10px), 58.33% 100%, 56.67% calc(100% - 10px), 
            55% 100%, 53.33% calc(100% - 10px), 51.67% 100%, 
            50% calc(100% - 10px), 48.33% 100%, 46.67% calc(100% - 10px), 
            45% 100%, 43.33% calc(100% - 10px), 41.67% 100%, 
            40% calc(100% - 10px), 38.33% 100%, 36.67% calc(100% - 10px), 
            35% 100%, 33.33% calc(100% - 10px), 31.67% 100%, 
            30% calc(100% - 10px), 28.33% 100%, 26.67% calc(100% - 10px), 
            25% 100%, 23.33% calc(100% - 10px), 21.67% 100%, 
            20% calc(100% - 10px), 18.33% 100%, 16.67% calc(100% - 10px), 
            15% 100%, 13.33% calc(100% - 10px), 11.67% 100%, 
            10% calc(100% - 10px), 8.33% 100%, 6.67% calc(100% - 10px), 
            5% 100%, 3.33% calc(100% - 10px), 1.67% 100%, 
            0% calc(100% - 10px)
          );
        }
        .popup-receipt::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 1;
        }
        .popup-receipt::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 35%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.04) 100%);
          pointer-events: none;
          z-index: 3;
        }
        .popup-receipt.retracted {
          transform: translateY(-95%) rotateX(-12deg) translateZ(-30px);
          opacity: 0;
        }
        .popup-receipt.printed {
          transform: translateY(0%) rotateX(0deg) translateZ(0px);
          opacity: 1;
        }
        .popup-receipt.printing-smooth {
          animation: popupPrintSmooth 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popupPrintSmooth {
          0% { transform: translateY(-95%) rotateX(-15deg) translateZ(-35px) scale(0.97); opacity: 0; }
          15% { opacity: 0.3; }
          30% { transform: translateY(-60%) rotateX(-8deg) translateZ(10px) scale(0.985); opacity: 0.7; }
          50% { transform: translateY(-35%) rotateX(-4deg) translateZ(20px) scale(0.995); opacity: 0.9; }
          70% { transform: translateY(-15%) rotateX(-2deg) translateZ(8px) scale(1); opacity: 1; }
          85% { transform: translateY(-3%) rotateX(0.5deg) translateZ(2px) scale(1); }
          100% { transform: translateY(0%) rotateX(0deg) translateZ(0px) scale(1); opacity: 1; }
        }
        .popup-receipt.tearing {
          animation: popupTearAway 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          pointer-events: none;
          transform-origin: top center;
        }
        @keyframes popupTearAway {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
          15% { transform: translateY(4px) translateX(10px) rotate(-2deg) scale(1); opacity: 1; }
          40% { transform: translateY(10px) translateX(40px) rotate(-6deg) scale(0.98); opacity: 0.9; }
          70% { transform: translateY(18px) translateX(80px) rotate(-12deg) scale(0.95); opacity: 0.6; }
          100% { transform: translateY(30px) translateX(140px) rotate(-18deg) scale(0.9); opacity: 0; }
        }
        .popup-receipt-content {
          padding: 1.35rem 1.25rem 1.6rem 1.25rem;
          font-family: var(--font-mono);
          color: var(--paper-ink);
          position: relative;
          z-index: 2;
        }

        /* Footer */
        .popup-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: slideUp 0.4s ease 0.3s both;
        }
        .popup-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .status-dot.printing {
          background: #fbbf24;
          animation: pulseDot 1s ease-in-out infinite;
        }
        .status-dot.done {
          background: #10b981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .popup-status-text {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          font-family: var(--font-ui);
        }
        .popup-done-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 100px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-ui);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .popup-done-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.45);
        }
        .popup-done-btn:active {
          transform: translateY(0);
        }

        @keyframes popupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes popupSlideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popupSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          from { transform: scale(0) rotate(-45deg); }
          to { transform: scale(1) rotate(0deg); }
        }
        @keyframes machineEnter {
          from { transform: scale(0.8) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>

      <div ref={stageRef} className="printer-stage w-full flex flex-col items-center">
        {/* Machine - easy, beautiful, green — two parts with ticket between */}
        <div className="machine-unit">
          <div className="machine-hood-top">
            <div className="hood-highlight" />
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
          </div>

          {/* Action Button - tear or reprint */}
          {hasPrintedOnce && (
            <div className="flex flex-col items-center mt-4">
              {isPrinted ? (
                /* Tear mode - scissors */
                <button
                  onClick={triggerTear}
                  disabled={isPrinting || isTearing}
                  title={isAr ? 'تمزيق الإيصال — اضغط للقص' : 'Tear receipt — click to cut'}
                  aria-label={isAr ? 'تمزيق الإيصال' : 'Tear receipt'}
                  className="group w-11 h-11 rounded-full border-2 border-amber-400 bg-white text-amber-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] grid place-items-center transition-all hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:scale-105 hover:bg-amber-50 active:scale-95"
                >
                  <Scissors size={16} className="group-hover:rotate-12 transition-transform" />
                </button>
              ) : (
                /* Reprint mode - print icon */
                <button
                  onClick={handlePrintClick}
                  disabled={isPrinting}
                  title={isAr ? 'إعادة طباعة الإيصال' : 'Re-print receipt'}
                  aria-label={isAr ? 'إعادة طباعة الإيصال' : 'Re-print receipt'}
                  className="group w-11 h-11 rounded-full border-2 border-emerald-400 bg-white text-emerald-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] grid place-items-center transition-all hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:scale-105 hover:bg-emerald-50 active:scale-95"
                >
                  <Printer size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
              <div className="text-[9px] font-bold tracking-widest uppercase text-stone-400 mt-1">
                {isPrinting ? (isAr ? 'جاري...' : 'PRINTING...') : isPrinted ? (isAr ? 'قص' : 'TEAR') : (isAr ? 'إعادة' : 'RE-PRINT')}
              </div>
            </div>
          )}
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
            {isPrinted ? (
              /* Tear mode - scissors */
              <button
                onClick={triggerTear}
                disabled={isPrinting || isTearing}
                className="print-action-btn inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border bg-white text-amber-700 font-bold text-[13px] shadow-md hover:shadow-lg hover:bg-amber-50 transition-all disabled:opacity-50 border-amber-300"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <Scissors size={16} />
                <span>{isTearing ? (isAr ? 'جاري القص...' : 'Tearing...') : (isAr ? 'قص الإيصال' : 'Tear receipt')}</span>
              </button>
            ) : (
              /* Reprint mode - print icon */
              <button
                onClick={handlePrintClick}
                disabled={isPrinting}
                className="print-action-btn inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border bg-white text-[#064e3b] font-bold text-[13px] shadow-md hover:shadow-lg hover:bg-[#ecfdf5] transition-all disabled:opacity-50"
                style={{ borderColor: '#a7f3d0', fontFamily: 'var(--font-ui)' }}
              >
                <Printer size={16} />
                <span>{isPrinting ? (isAr ? 'جاري الطباعة...' : 'Printing...') : hasPrintedOnce ? (isAr ? 'إعادة الطباعة' : 'Re-print') : (isAr ? 'طباعة الإيصال' : 'Print receipt')}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 text-center leading-4">
            {isAr ? 'QR يعمل — امسح للذهاب إلى صفحة التتبع الحقيقية' : 'QR works — scan to open real tracking page'}
          </p>
        </div>
      </div>
    </div>
  );
}
