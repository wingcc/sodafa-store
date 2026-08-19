// components/StickyOrderButton.tsx
"use client";

import { useRouter } from "next/navigation";

export const StickyOrderButton = () => {
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <button
      onClick={handleCheckout}
      type="button"
      className="bg-[linear-gradient(135deg,rgb(17,24,39)_0%,rgb(36,123,0)_100%)] shadow-[0_2px_7px_0_rgba(0,0,0,0.36)] text-white hidden text-2xl font-medium justify-center leading-[normal] max-h-max min-h-[50px] fixed text-center w-full z-[999999999] px-0 py-2.5 rounded-[14px] bottom-0 md:max-h-none md:bottom-auto"
    >
      <div className="items-center flex justify-center w-full">
        <div className="mx-3">
          <i className="block italic font-normal before:content-['🛒'] before:inline-block before:text-2xl"></i>
        </div>
        <div>
          <span>اضغط هنا للطلب</span>
          <div className="text-[15px] mt-1">الدفع عند الاستلام</div>
        </div>
      </div>
    </button>
  );
};