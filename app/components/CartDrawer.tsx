// components/CartDrawer.tsx
"use client";

import { useUI } from "../contexts/UIContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "../constants";
import { useRouter } from "next/navigation";


export const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  
  const router = useRouter();

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleProceedToCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  // Function to generate WhatsApp message
  const generateWhatsAppMessage = () => {
    if (isAr) {
      return `مرحباً دار صودفا 🌿، أريد تأكيد طلبي لهذه المنتجات:\n${cartItems.map((i) => `• ${i.name} (الكمية: ${i.qty})`).join("\n")}\n\nالمجموع: ${cartTotal.toFixed(2)} د.م`;
    } else {
      return `Hello SODFA Store 🌿, I want to place an order for:\n${cartItems.map((i) => `• ${i.name} (Qty: ${i.qty})`).join("\n")}\n\nTotal: ${cartTotal.toFixed(2)} MAD`;
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        dir={isAr ? "rtl" : "ltr"}
        aria-label={isAr ? "حقيبة التسوق" : "Shopping Bag"}
        className={`fixed top-0 bottom-0 ${isAr ? "right-0" : "left-auto right-0"} w-full max-w-md bg-stone-50 shadow-2xl z-[999] transform transition-transform duration-300 ease-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with Dark Emerald & Gold Luxury Theme */}
        <div
          className="px-6 py-5 flex items-center justify-between text-white shadow-md relative"
          style={{
            background: "linear-gradient(135deg, #061c16 0%, #0b2e22 60%, #0d3428 100%)",
            borderBottom: "1px solid rgba(205, 165, 82, 0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                background: "rgba(205, 165, 82, 0.15)",
                border: "1px solid rgba(205, 165, 82, 0.4)",
              }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: "#cda552" }} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    border: "2px solid #061c16",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide" style={{ color: "#f7ebd0" }}>
                {isAr ? "حقيبة التسوق" : "Shopping Bag"}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {totalItems === 0
                  ? isAr ? "لا توجد منتجات بعد" : "No items added yet"
                  : isAr
                  ? `${totalItems} منتج في الحقيبة`
                  : `${totalItems} item${totalItems > 1 ? "s" : ""} selected`}
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="p-2 rounded-xl text-white/80 hover:text-white transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-stone-400" />
              </div>
              <h4 className="font-bold text-stone-900 text-lg mb-1.5">{isAr ? "حقيبتك فارغة" : "Your bag is empty"}</h4>
              <p className="text-stone-500 text-sm max-w-[240px]">
                {isAr ? "أضف بعض المنتجات الجميلة إلى حقيبتك" : "Add some beautiful products to your bag"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 px-6">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/images/no_image.png";
                      }}
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-stone-900">
                        {(item.price * item.qty).toFixed(2)} {isAr ? "د.م" : "MAD"}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        {item.price.toFixed(2)} × {item.qty}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                      aria-label={isAr ? "إزالة المنتج" : "Remove product"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-stone-900">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Bottom Section with Totals & CTAs */}
        <div className="border-t border-stone-200 bg-white p-6 space-y-4">
          {/* Totals Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-stone-600">
              <span className="text-sm">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span className="text-sm font-bold text-stone-900">
                {cartTotal.toFixed(2)} {isAr ? "د.م" : "MAD"}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span className="text-sm">{isAr ? "رسوم التوصيل" : "Delivery Fee"}</span>
              <span className="text-sm font-bold text-emerald-700">
                {cartTotal === 0
                  ? (isAr ? "مجاني" : "FREE")
                  : (isAr ? "محسوب عند الدفع" : "Calculated at checkout")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200">
              <span className="text-base font-bold text-stone-900">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <span className="text-base font-extrabold text-stone-900" style={{ color: "#0b2e22" }}>
                {cartTotal.toFixed(2)}{" "}
                {isAr ? "د.م" : "MAD"}
              </span>
            </div>
          </div>

          {/* Primary CTA: Proceed to Checkout */}
          <button
            onClick={handleProceedToCheckout}
            disabled={cartItems.length === 0}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
              cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: "linear-gradient(135deg, #061c16 0%, #0b2e22 50%, #0d3428 100%)",
              boxShadow: "0 4px 18px rgba(6, 28, 22, 0.35)",
              border: "1px solid rgba(205, 165, 82, 0.4)",
              color: "#f7ebd0",
            }}
          >
            <span>{isAr ? "متابعة الشراء (الدفع عند الاستلام)" : "Proceed to Checkout (COD)"}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          {/* WhatsApp Quick Order Button */}
          <a
            href={`${WHATSAPP_LINK}?text=${encodeURIComponent(generateWhatsAppMessage())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl border border-emerald-800/20 bg-white text-emerald-900/90 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
          >
            <span>{isAr ? "أو طلب عبر الواتساب" : "Or Order via WhatsApp"}</span>
            <MessageCircle className="w-4 h-4 text-emerald-700" />
          </a>
        </div>
      </aside>
    </>
  );
};