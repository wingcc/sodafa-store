"use client";

import Link from "next/link";
import { useLanguage } from "../../../contexts/LanguageContext";

export type ProductCardProps = {
  productLabel: string;
  exampleText: string;
  title?: string;
  price?: number;
  href?: string;
};

export const ProductCard = ({ productLabel, exampleText, title = "اسم المنتج هنا", price = 0, href }: ProductCardProps) => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const currency = isAr ? "د.م" : "MAD";

  return (
    <div className="group h-full flex flex-col bg-stone-50 shadow-[0_10px_30px_-20px_rgba(15,61,49,0.25)] overflow-hidden rounded-[20px] border border-stone-300 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(15,61,49,0.35)]">
      <div className="relative overflow-hidden bg-orange-100 border-b border-orange-300 text-teal-950 flex justify-center text-center p-5">
        <div className="relative w-full max-w-full aspect-[3/4] rounded-[16px] bg-white border border-orange-200 flex items-center justify-center text-sm text-stone-500">
          <span>{isAr ? "صورة المنتج هنا" : "Product image here"}</span>
        </div>
        <span className="absolute right-4 top-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.35px]">
          {productLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-teal-950 text-xl font-bold leading-[22px] break-words font-tajawal">
            {title}
          </h3>
          <p className="text-stone-500 text-sm mt-2">{exampleText}</p>

          <div className="flex items-center gap-x-2.5 mt-4 mb-3.5">
            <span className="text-yellow-600 text-[20px] font-extrabold leading-[28px]">
              {price.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {href ? (
          <Link href={href} className="inline-flex w-full items-center justify-center rounded-full bg-teal-950 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-800">
            {isAr ? "اطلبي الآن" : "Order Now"}
          </Link>
        ) : (
          <button className="inline-flex w-full items-center justify-center rounded-full bg-teal-950 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-800">
            {isAr ? "اطلبي الآن" : "Order Now"}
          </button>
        )}
      </div>
    </div>
  );
};
