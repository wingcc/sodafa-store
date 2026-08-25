"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUI } from "../../contexts/UIContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { ProductCard } from "../../components/ProductCard";
import type { Product } from "../../types/product";

function ProductSectionSkeleton() {
  return (
    <div>
      <div className="wrap">
        <div className="sec-head">
          <div className="pd-skeleton-eyeb" />
          <div className="pd-skeleton-title" />
          <div className="pd-skeleton-desc" />
        </div>
        <div className="pd-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pd-skeleton-card">
              <div className="pd-skeleton-image" />
              <div className="pd-skeleton-content">
                <div className="pd-skeleton-line" style={{ width: "80%", height: "14px" }} />
                <div className="pd-skeleton-line" style={{ width: "40%", height: "10px" }} />
                <div className="pd-skeleton-line" style={{ width: "60%", height: "16px" }} />
                <div className="pd-skeleton-line" style={{ width: "100%", height: "40px", borderRadius: "12px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, openCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/products?showInStore=true&status=active");
        const json = await res.json();
        if (cancelled || !json.success || !Array.isArray(json.data)) return;
        const mapped: Product[] = json.data
          .map((row: Record<string, unknown>) => {
            const regularPrice = typeof row.regular_price === "number" ? row.regular_price : 0;
            const salePrice = typeof row.sale_price === "number" ? row.sale_price : null;
            const price = salePrice ?? regularPrice;
            const originalPrice = salePrice !== null ? regularPrice : null;
            const imageSrcs = Array.isArray(row.images)
              ? row.images
                  .map((img: unknown) => {
                    if (typeof img === "string") return img;
                    if (img && typeof img === "object" && "src" in img)
                      return String((img as { src: unknown }).src ?? "");
                    return "";
                  })
                  .filter(Boolean)
              : [];
            return {
              id: String(row.id ?? ""),
              name: String(row.name ?? ""),
              price,
              originalPrice,
              image: imageSrcs[0] ?? "/assets/images/no_image.png",
              imageAlt: String(row.name ?? ""),
              badge: row.featured ? "Featured" : row.ADS ? "ADS" : null,
              inStock: Number(row.stock ?? 0) > 0,
              brand: row.brand ? String(row.brand) : undefined,
              category: row.subcategory ? String(row.subcategory) : undefined,
              rating: typeof row.rating === "number" ? row.rating : undefined,
              reviews: typeof row.review_count === "number" ? row.review_count : undefined,
              description: String(row.short_description ?? row.full_description ?? ""),
              tags: Array.isArray(row.tags) ? row.tags : [],
              images: imageSrcs.map((src) => ({ src })),
              isOffer: Boolean(row.IsOffer ?? row.isOffer ?? false),
              offerTime: row.OfferTime ? String(row.OfferTime) : row.offerTime ? String(row.offerTime) : undefined,
            } as Product;
          })
          .sort((a: Product, b: Product) => (b.sales ?? 0) - (a.sales ?? 0) || (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 3);
        setProducts(mapped);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = useCallback(
    (id: string | number) => {
      const product = products.find((p) => p.id === id);
      if (!product || product.inStock === false) return;
      const imgSrc = typeof product.image === "string" ? product.image : "";
      addToCart({ id: product.id, name: product.name, price: product.price, image: imgSrc }, 1);
      setAddedIds((prev) => [...prev, id]);
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((x) => x !== id));
        openCart();
      }, 400);
    },
    [products, addToCart, openCart]
  );

  // Show skeleton during loading
  if (loading) {
    return <ProductSectionSkeleton />;
  }

  // Show nothing if no products (after loading)
  if (products.length === 0) return null;

  return (
    <div>
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyeb">{isAr ? "تشكيلتنا" : "Our Collection"}</span>
          <h2>{isAr ? "اختاري منتجك الطبيعي" : "Choose Your Natural Product"}</h2>
          <p>
            {isAr
              ? "كل منتج مختار بعناية باش تعتني بشعرك طبيعياً في كل مناسبة"
              : "Each product is carefully selected to care for your hair naturally on every occasion"}
          </p>
        </div>

        <div className="pd-grid">
          {products.map((product, i) => (
            <div key={product.id} className="" data-d={i * 100}>
              <ProductCard
                product={product}
                href={`/store/${product.id}`}
                onAddToCart={handleAddToCart}
                added={addedIds.includes(product.id)}
              />
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            href="/store"
            className="btn btn-main"
            style={{ padding: ".9rem 2.4rem", fontSize: ".95rem" }}
          >
            {isAr ? "عرض الكل" : "View All"}
          </Link>
        </div>
      </div>
    </div>
  );
}
