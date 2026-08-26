'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './OrderSteps.module.css';

interface Step {
  label: string;
  subLabel?: string;
  done: boolean;
  active?: boolean;
}

interface OrderStepsProps {
  /** 0-based index of the currently active step */
  currentStep?: number;
}

export default function OrderSteps({ currentStep = 1 }: OrderStepsProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const steps: Step[] = [
    {
      label: isAr ? 'تم استقبال الطلب' : 'Order Received',
      subLabel: isAr ? 'تم' : 'Done',
      done: true,
    },
    {
      label: isAr ? 'جاري التجهيز' : 'Processing',
      subLabel: isAr ? 'جاري' : 'Now',
      done: currentStep >= 1,
      active: currentStep === 1,
    },
    {
      label: isAr ? 'مع شركة الشحن' : 'In Transit',
      subLabel: isAr ? 'قريباً' : 'Soon',
      done: currentStep >= 2,
      active: currentStep === 2,
    },
    {
      label: isAr ? 'تم التسليم' : 'Delivered',
      subLabel: isAr ? 'الأخيرة' : 'Final',
      done: currentStep >= 3,
      active: currentStep === 3,
    },
  ];

  // Calculate line fill percentage
  // Each step segment = 100% / (steps.length - 1)
  // Completed steps fill their segment fully, active step fills partially
  const segmentWidth = 100 / (steps.length - 1);
  const completedSegments = steps.filter((s) => s.done && !s.active).length;
  const fillPercent = Math.min(
    100,
    mounted ? completedSegments * segmentWidth + segmentWidth * 0.5 : 0
  );

  return (
    <div className={styles.stepper}>
      {/* Connecting line */}
      <div className={styles.lineTrack}>
        <div
          className={styles.lineFill}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* Steps */}
      {steps.map((step, i) => {
        const stateClass = step.done && !step.active
          ? styles.stepDone
          : step.active
          ? styles.stepActive
          : styles.stepPending;

        return (
          <div key={i} className={`${styles.step} ${stateClass}`}>
            <div className={styles.circle}>
              {step.done && !step.active && (
                <span className={styles.checkIcon}>
                  <Check className="w-5 h-5" strokeWidth={3} />
                </span>
              )}
              <span className={styles.stepNumber}>{i + 1}</span>
              {step.active && <div className={styles.pulseRing} />}
            </div>
            <span className={styles.label}>{step.label}</span>
            {step.subLabel && (
              <span className={styles.subLabel}>{step.subLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
