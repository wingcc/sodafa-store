"use client";
import React from "react";

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="toast show" id="toast" data-page="toast">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
