export const HeroActions = () => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href="#products"
        className="flex items-center gap-2 bg-teal-950 text-white px-7 py-3.5 rounded-full font-bold text-base shadow-lg shadow-teal-950/30 hover:bg-yellow-600 hover:shadow-yellow-600/30 transition-all duration-300 hover:-translate-y-1"
      >
        اكتشفي التشكيلة
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
      <a
        href="https://wa.me/212626038407?text=%D8%B3%D9%84%D8%A7%D9%85%20%D8%AF%D8%A7%D8%B1%20%D9%83%D8%B1%D9%8A%D9%85%D8%A9%D8%8C%20%D8%A8%D8%BA%D9%8A%D8%AA%20%D9%86%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%20%D8%B9%D9%84%D9%89%20%D9%85%D9%86%D8%AA%D8%AC"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-teal-950 border-2 border-teal-950 px-7 py-3.5 rounded-full font-bold text-base hover:bg-teal-950 hover:text-white transition-all duration-300"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
        </svg>
        تواصلي واتساب
      </a>
    </div>
  );
};