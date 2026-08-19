"use client";
import React from "react";
import { CloseSVG } from "../common/icons";
import type { LegalItem } from "../common/types";

interface LegalModalProps {
  item: LegalItem;
  onClose: () => void;
}

export default function LegalModal({ item, onClose }: LegalModalProps) {
  return (
    <div className="modal open" id="legalModal">
      <div className="ovl" onClick={onClose} />
      <div className="modal-box legal-box">
        <button className="m-close" onClick={onClose} aria-label="إغلاق">
          <CloseSVG />
        </button>
        <h3>{item.title}</h3>
        <span className="lg-date">آخر تحديث: غشت 2026</span>
        <div className="lg-body" dangerouslySetInnerHTML={{ __html: item.body }} />
      </div>
    </div>
  );
}
