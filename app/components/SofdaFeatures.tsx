// components/SofdaFeatures.tsx
export const SofdaFeatures = () => {
  const features = [
    { icon: "🌿", title: "طبيعي 100%", desc: "خالي من السليكون والمواد الكيميائية" },
    { icon: "⚡", title: "توصيل سريع", desc: "يصل لباب دارك في 24-48 ساعة" },
    { icon: "🔄", title: "إرجاع مجاني", desc: "خلال 48 ساعة إذا لم ترضيك النتيجة" },
    { icon: "💳", title: "الدفع عند الاستلام", desc: "تخلّصي بعد ما تشوفي السلعة بعينيك" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-green-700 font-bold tracking-wider uppercase text-sm">لماذا تختاريننا</span>
          <h2 className="text-3xl md:text-4xl font-bold font-amiri text-gray-900 mt-2">
            ثقة وجودة من الطبيعة
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="text-center p-6 bg-[#fdf8f3] rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{feat.icon}</div>
              <h4 className="font-bold text-gray-800 text-lg mb-1">{feat.title}</h4>
              <p className="text-gray-500 text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};