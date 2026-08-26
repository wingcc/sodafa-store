'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './OrderConfirmButton.module.css';

interface OrderConfirmButtonProps {
  onClick: () => void;
  disabled?: boolean;
  total: string;
}

const ANIM_MS = 8000;

export default function OrderConfirmButton({ onClick, disabled, total }: OrderConfirmButtonProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const [state, setState] = useState<'idle' | 'animating' | 'done'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || state !== 'idle') return;
    setState('animating');
    onClick();

    timerRef.current = setTimeout(() => {
      setState('done');
      timerRef.current = setTimeout(() => {
        setState('idle');
      }, 2500);
    }, ANIM_MS);
  }, [disabled, state, onClick]);

  const animClass =
    state === 'animating' ? styles.animate : state === 'done' ? styles.done : '';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className={`${styles.btn} ${animClass}`}
    >
      {/* Default text */}
      <span className={`${styles.text} ${styles.default}`}>
        {isAr ? `تأكيد الطلب الآن — ${total}` : `Confirm Order — ${total}`}
      </span>

      {/* Success text */}
      <span className={`${styles.text} ${styles.success}`}>
        {isAr ? 'تم الطلب بنجاح' : 'Order Placed'}
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>

      {/* Animation stage */}
      <div className={styles.stage}>
        {/* Road lines */}
        <div className={styles.lines} />

        {/* Truck */}
        <div className={styles.truck}>
          <div className={`${styles.truckArm} ${styles.truckArmTop}`} />
          <div className={`${styles.truckArm} ${styles.truckArmBottom}`} />
          <div className={styles.truckBack} />
          <div className={styles.truckFront}>
            <div className={styles.truckFrontSep} />
            <div className={styles.truckFrontFace} />
            <div className={styles.window}>
              <div className={styles.windowDark} />
              <div className={styles.windowShine} />
            </div>
          </div>
          <div className={`${styles.light} ${styles.lightTop}`}>
            <div className={styles.lightGlow} />
          </div>
          <div className={`${styles.light} ${styles.lightBottom}`}>
            <div className={styles.lightGlow} />
          </div>
        </div>

        {/* Box */}
        <div className={styles.box}>
          <div className={`${styles.boxStripe} ${styles.boxStripeThick}`} />
          <div className={`${styles.boxStripe} ${styles.boxStripeThin}`} />
        </div>
      </div>
    </button>
  );
}
