"use client";

import { useState, useEffect } from "react";

export type FlashSaleProduct = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  discount?: string;
  isNew?: boolean;
  bgColor?: string;
};

const products: FlashSaleProduct[] = [
  {
    id: 1,
    name: "Avocado Bliss",
    rating: 5.0,
    reviews: 35,
    price: 12.0,
    oldPrice: 59.0,
    discount: "-24%",
    bgColor: "bg-[#edf7ed]",
  },
  {
    id: 2,
    name: "Pure Green Bliss",
    rating: 4.7,
    reviews: 67,
    price: 18.0,
    oldPrice: 50.0,
    discount: "-20%",
    bgColor: "bg-[#edf7ed]",
  },
  {
    id: 3,
    name: "Berry Burst Pack",
    rating: 5.0,
    reviews: 28,
    price: 21.0,
    oldPrice: 32.0,
    discount: "-25%",
    bgColor: "bg-[#edf7ed]",
  },
  {
    id: 4,
    name: "Spicy Green Chili",
    rating: 4.5,
    reviews: 34,
    price: 8.0,
    oldPrice: 15.0,
    isNew: true,
    bgColor: "bg-[#edf7ed]",
  },
  {
    id: 5,
    name: "Green Crunch",
    rating: 4.0,
    reviews: 21,
    price: 15.0,
    oldPrice: 26.0,
    discount: "-20%",
    bgColor: "bg-[#edf7ed]",
  },
];

function formatTimeUnit(value: number) {
  return String(value).padStart(2, "0");
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(targetDate.getHours() + 12);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = window.setInterval(calculateTimeLeft, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
      {Object.entries({ Days: timeLeft.days, Hours: timeLeft.hours, Mins: timeLeft.mins, Secs: timeLeft.secs }).map(
        ([label, value]) => (
          <div
            key={label}
            className="flex flex-col items-center bg-[#0f3d3e] border-2 border-[#2e6b5b] rounded-xl px-5 py-2 shadow-lg min-w-[60px]"
          >
            <span className="text-2xl font-bold">{formatTimeUnit(Number(value))}</span>
            <span className="text-[10px] text-gray-300 uppercase">{label}</span>
          </div>
        )
      )}
    </div>
  );
}

export function FlashSaleCard({ product }: { product: FlashSaleProduct }) {
  return (
    <div className={`flex flex-col gap-4 bg-white p-5 rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.06)] border border-gray-100 ${product.bgColor ?? ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.rating} ★ · {product.reviews} تقييم</p>
        </div>
        {product.discount && (
          <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">
            {product.discount}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">{product.price.toFixed(2)} د.م.</p>
          {product.oldPrice && (
            <p className="text-sm text-gray-400 line-through">{product.oldPrice.toFixed(2)} د.م.</p>
          )}
        </div>
        {product.isNew && (
          <span className="text-sm font-semibold text-white bg-blue-500 rounded-full px-3 py-1">
            جديد
          </span>
        )}
      </div>

      <button className="mt-2 inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
        أضف إلى السلة
      </button>
    </div>
  );
}

export function FlashSales() {
  return (
    <section className="bg-[#0f3d3e] text-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold">تخفيضات سريعة</h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            أقصى خصوماتنا اليوم على أفضل المنتجات المختارة بعناية.
          </p>
        </div>

        <CountdownTimer />

        <div className="grid gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <FlashSaleCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
