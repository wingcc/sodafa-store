"use client";
import React from "react";
import type { ProductItem, SiteConfig } from "../common/types";

interface ProductSectionProps {
  products: ProductItem[];
  site: SiteConfig;
}

const delays = [0, 100, 200];

export default function ProductSection({ products, site }: ProductSectionProps) {
  return (
    <section id="products">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">تشكيلتنا</span>
          <h2>اختاري منتجك الطبيعي</h2>
          <p>كل منتج مختار بعناية باش تعتني بشعرك طبيعياً في كل مناسبة</p>
        </div>

        <div className="pd-grid">
          {products.map((p, i) => (
            <div key={i} className="pd-card rv" data-d={delays[i] != null ? delays[i] : i * 100}>
              <div className="pd-img">
                <span className="pd-label">{p.label}</span>
                <img loading="lazy" src={p.img} alt={p.title} />
              </div>
              <div className="pd-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="pd-price">{p.price}</div>
                <button className="pd-btn" data-order={p.title}>اطلبي الآن</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
