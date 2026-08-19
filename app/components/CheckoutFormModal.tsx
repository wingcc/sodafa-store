// components/CheckoutFormModal.tsx
"use client";

import { useUI } from "../contexts/UIContext";
import { CheckoutForm } from "./forms/CheckoutForm";

export const CheckoutFormModal = () => {
  const { isCheckoutOpen, closeCheckout } = useUI();

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white shadow-[0_2px_7px_0_rgba(0,0,0,0.18)] w-full max-w-md p-6 rounded-lg relative">
        <button
          onClick={closeCheckout}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <CheckoutForm />
      </div>
    </div>
  );
};
// This file has been removed as the checkout modal is no longer used.
// The checkout flow now navigates directly to the /checkout page.
