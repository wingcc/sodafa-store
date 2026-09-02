// components/forms/CheckoutForm.tsx
"use client";

import { useState } from "react";

export const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("طلبك تم بنجاح! سنتواصل معك قريباً.");
      // Reset form
      setFormData({ fullName: "", address: "", phone: "" });
    } catch (err) {
      setError("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <p>
          <strong>عمّري معلوماتك وخلّصي مّنين توصلك السلعة 🌿</strong>
        </p>
      </div>

      <div>
        <label className="block text-right text-[15px] leading-6 mb-1">
          الاسم الكامل <span className="text-red-500">*</span>
        </label>
        <input
          required
          placeholder="الاسم الكامل"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border border-stone-300 px-[15px] py-[5px] rounded-md focus:outline-none focus:border-teal-950"
        />
      </div>

      <div>
        <label className="block text-right text-[15px] leading-6 mb-1">
          العنوان <span className="text-red-500">*</span>
        </label>
        <input
          required
          placeholder="العنوان"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          className="w-full border border-stone-300 px-[15px] py-[5px] rounded-md focus:outline-none focus:border-teal-950"
        />
      </div>

      <div>
        <label className="block text-right text-[15px] leading-6 mb-1">
          رقم الواتساب <span className="text-red-500">*</span>
        </label>
        <input
          required
          placeholder="06 XX XX XX XX"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border border-stone-300 px-[15px] py-[5px] rounded-md focus:outline-none focus:border-teal-950"
        />
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-[linear-gradient(135deg,rgb(17,24,39)_0%,rgb(36,123,0)_100%)] shadow-[0_2px_7px_0_rgba(0,0,0,0.36)] text-white flex text-2xl font-medium justify-center leading-[38.4px] min-h-[50px] w-full px-0 py-2.5 rounded-[14px] disabled:opacity-70"
      >
        {loading ? "جاري المعالجة..." : "اضغط هنا للطلب"}
        <div className="text-[15px] mt-1">الدفع عند الاستلام</div>
      </button>
    </form>
  );
};