'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import {
  Star,
  Truck,
  ShieldCheck,
  Award,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Sparkles,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react';
import { ProductCard } from '../../../../components/ProductCard';
import { useUI } from '../../../../contexts/UIContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import type { Product } from '../../../../types/product';
import { WHATSAPP_LINK } from '../../../../constants';

interface ReviewItem {
  name: string;
  rating: number;
  date: string;
  location: string;
  text: string;
}

interface ProductDetailClientProps {
  product: Product | null;
}

export default function ProductDetailClient({ product: initialProduct }: ProductDetailClientProps) {
  const { addToCart, openCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const product = initialProduct;

  if (!product) {
    return (
      <main className="min-h-screen bg-stone-50 pt-6 pb-20 font-sans flex items-center justify-center">
        <p className="text-stone-500">Product not found.</p>
      </main>
    );
  }

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Review Form State
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      name: isAr ? 'سعاد بناني' : 'Sarah Bennani',
      rating: 5,
      date: isAr ? 'منذ 3 أيام' : '3 days ago',
      location: isAr ? 'الدار البيضاء' : 'Casablanca',
      text: isAr
        ? 'المنتج رائع جداً، لاحظت الفرق بعد أسبوع واحد فقط من الاستعمال. التوصيل كان سريع والتعامل راقي.'
        : 'Amazing product! I noticed a visible difference after just one week of use. Fast delivery too!',
    },
    {
      name: isAr ? 'مريم الودغيري' : 'Maryam El Wadghiri',
      rating: 5,
      date: isAr ? 'منذ أسبوع' : '1 week ago',
      location: isAr ? 'الرباط' : 'Rabat',
      text: isAr
        ? 'جودة ممتازة 100% طبيعي، ريحته زوينة وكيخلي البشرة رطبة ومغذية. شكراً دار صودفا.'
        : 'Top quality 100% natural formula. Smells divine and leaves skin deeply hydrated. Thanks SODFA!',
    },
    {
      name: isAr ? 'فاطمة الزهراء' : 'Fatima Zohra',
      rating: 5,
      date: isAr ? 'منذ اسبوعين' : '2 weeks ago',
      location: isAr ? 'مراكش' : 'Marrakech',
      text: isAr
        ? 'وصلني في الوقت المحدد، الدفع عند الاستلام وسرعة في التجاوب عبر الواتساب. أنصح به بحرارة.'
        : 'Arrived right on time with cash on delivery. Excellent customer service on WhatsApp!',
    },
  ]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const newRev: ReviewItem = {
      name: newName.trim(),
      rating: newRating,
      date: isAr ? 'الآن' : 'Just now',
      location: newLocation.trim() || (isAr ? 'المغرب' : 'Morocco'),
      text: newComment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setNewName('');
    setNewLocation('');
    setNewComment('');
    setNewRating(5);
    setShowReviewForm(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Fallback images if product doesn't have an array
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [
        { src: typeof product.image === 'string' ? product.image : '', alt: product.imageAlt || product.name },
        { src: typeof product.bannerImage === 'string' ? product.bannerImage : '', alt: product.bannerImageAlt || product.name }
      ].filter(i => i.src);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (product.inStock === false) return;
    const imgSrc = typeof product.image === 'string' ? product.image : (productImages[0]?.src as string || '');
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: imgSrc,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const ratingBreakdown = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 12 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 280;
    carouselRef.current.scrollBy({
      left: dir === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const whatsappMessage = encodeURIComponent(
    isAr
      ? `مرحباً دار صودفا 🌿، أريد استفسار أو طلب المنتج:\n*${product.name}*\nالسعر: ${product.price} د.م`
      : `Hello SODFA Store 🌿, I would like to order:\n*${product.name}*\nPrice: ${product.price} MAD`
  );

  useEffect(() => {
    if (!product) return;
    fetch('/api/products?limit=4')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const related = json.data
            .filter((p: Record<string, unknown>) => String((p as { id?: unknown }).id) !== String(product.id))
            .slice(0, 4);
          setRelatedProducts(related as Product[]);
        }
      })
      .catch(() => {
        setRelatedProducts([]);
      });
  }, [product]);

  return (
    <main className="min-h-screen bg-stone-50 pt-6 pb-20 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 font-medium overflow-x-auto">
            <Link href="/" className="hover:text-emerald-800 transition-colors shrink-0">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            {isAr ? <ChevronLeft className="w-3.5 h-3.5 text-stone-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
            <Link href="/store" className="hover:text-emerald-800 transition-colors shrink-0">
              {isAr ? 'المتجر' : 'Store'}
            </Link>
            {isAr ? <ChevronLeft className="w-3.5 h-3.5 text-stone-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
            <span className="text-stone-900 font-bold truncate max-w-[200px] shrink-0">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Details Main Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-stone-200/80 shadow-sm">
            {/* LEFT: Image Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Image View */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
                <img
                  src={
                    typeof productImages[activeImage]?.src === 'string'
                      ? (productImages[activeImage].src as string)
                      : typeof product.image === 'string'
                      ? product.image
                      : ''
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.badge && (
                    <span
                      className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white shadow-md backdrop-blur-md"
                      style={{
                        background: 'linear-gradient(135deg, #cda552 0%, #b8922e 100%)',
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-100 flex items-center gap-1 shadow-sm backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {isAr ? '100% طبيعي' : '100% Natural'}
                  </span>
                </div>

                {/* Discount Badge */}
                {discount && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1.5 rounded-full text-xs font-black bg-red-600 text-white shadow-md">
                      -{discount}%
                    </span>
                  </div>
                )}

                {/* Like & Share Action Buttons */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="p-2.5 rounded-full bg-white/90 text-stone-700 hover:text-red-500 shadow-md backdrop-blur-md transition-all hover:scale-110"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-white/90 text-stone-700 hover:text-emerald-800 shadow-md backdrop-blur-md transition-all hover:scale-110 relative"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied && (
                      <span className="absolute bottom-full mb-2 right-0 bg-stone-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-lg">
                        {isAr ? 'تم نسخ الرابط!' : 'Copied link!'}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Thumbnail Selector */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === i
                          ? 'border-[#cda552] shadow-md scale-105'
                          : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={typeof img.src === 'string' ? img.src : ''}
                        alt={img.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info & Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Brand */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#cda552]">
                    {product.brand || 'SODFA'} · {product.category || (isAr ? 'عناية طبيعية' : 'Natural Care')}
                  </span>
                  {/* Stock Status Indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? 'متوفر في المخزون' : 'In Stock'}</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {product.rating || 4.9} / 5
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    ({reviews.length} {isAr ? 'تقييم موثق' : 'verified reviews'})
                  </span>
                </div>

                {/* Pricing Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-stone-900" style={{ color: '#0b2e22' }}>
                    {(product.price ?? 0).toFixed(2)}{' '}
                    <span className="text-lg font-bold text-stone-600">{isAr ? 'د.م' : 'MAD'}</span>
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-stone-400 line-through font-semibold">
                      {product.originalPrice.toFixed(2)} {isAr ? 'د.م' : 'MAD'}
                    </span>
                  )}
                  {discount && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                      {isAr ? `توفير ${discount}%` : `Save ${discount}%`}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-stone-600 leading-relaxed pt-1">
                  {product.description ||
                    (isAr
                      ? 'تركيبة مغذية فاخرة مستخلصة من أفضل الزيوت والأعشاب الطبيعية المغربية للعناية الفائقة والنتائج الملحوظة من الاستعمال الأول.'
                      : 'A luxury nourishing formula crafted with pure botanical oils to deeply hydrate and restore natural radiance.')}
                </p>

                {/* Variants Selection */}
                {product.variants &&
                  Object.entries(product.variants).map(([key, options]) => (
                    <div key={key} className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                        {key}:{' '}
                        <span className="text-[#cda552] normal-case">
                          {selectedVariants[key] || options[0]}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              setSelectedVariants((prev) => ({ ...prev, [key]: opt }))
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              (selectedVariants[key] || options[0]) === opt
                                ? 'bg-emerald-950 text-amber-200 border-emerald-900 shadow-sm'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Quantity Stepper & Add To Cart Actions */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-stone-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Add To Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 60%, #0d3428 100%)',
                      boxShadow: '0 4px 18px rgba(6, 28, 22, 0.35)',
                      border: '1px solid rgba(205, 165, 82, 0.4)',
                      color: '#f7ebd0',
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>
                      {added
                        ? isAr
                          ? 'تمت الإضافة بنجاح!'
                          : 'Added to Bag!'
                        : isAr
                        ? `إضافة إلى الحقيبة — ${(product.price * qty).toFixed(2)} د.م`
                        : `Add to Bag — ${(product.price * qty).toFixed(2)} MAD`}
                    </span>
                  </button>
                </div>

                {/* Order via WhatsApp Direct Button */}
                <a
                  href={`${WHATSAPP_LINK}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isAr ? 'طلب سريع وتأكيد مباشر عبر الواتساب' : 'Quick Order via WhatsApp'}
                  </span>
                </a>
              </div>

              {/* Trust Features Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Truck className="w-5 h-5 text-emerald-800 mb-1" />
                  <span className="text-xs font-bold text-stone-800">
                    {isAr ? 'توصيل سريع' : 'Fast Shipping'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? '24 - 48 ساعة' : '24-48 hours'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xs font-bold text-stone-800">
                    {isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? 'افحصي قبل الدفع' : 'Inspect on delivery'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Award className="w-5 h-5 text-emerald-800 mb-1" />
                  <span className="text-xs font-bold text-stone-800">
                    {isAr ? 'ضمان الجودة' : '100% Authentic'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? 'منتج أصلي' : 'Original formula'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights & Verified Reviews Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
            {/* Highlights Column */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
              <h2 className="text-xl font-extrabold text-stone-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#cda552]" />
                <span>{isAr ? 'مميزات المنتج الرئيسية' : 'Key Product Highlights'}</span>
              </h2>
              <ul className="space-y-4">
                {(
                  product.highlights || [
                    isAr ? 'مستخلص من مكونات طبيعية 100%' : '100% Natural Botanical Extract',
                    isAr ? 'يغذي ويرطب العميقة من الاستعمال الأول' : 'Deeply nourishes & hydrates skin',
                    isAr ? 'خالٍ من المواد الكيميائية الضارة' : 'Paraben & Sulfate Free',
                    isAr ? 'اختُبر طبياً ومناسب لجميع أنواع البشرة' : 'Dermatologically Tested',
                  ]
                ).map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(205, 165, 82, 0.15)' }}
                    >
                      <Check className="w-3.5 h-3.5" style={{ color: '#cda552' }} />
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-stone-700 leading-relaxed">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Reviews Column */}
            <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">
                    {isAr ? 'آراء وتقييمات العميلات' : 'Customer Reviews'}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isAr ? 'تجارب حقيقية من زبناء دار صودفا' : 'Real experiences from SODFA customers'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-stone-900">{product.rating || 4.9}</span>
                    <span className="text-xs text-stone-400">/ 5</span>
                  </div>

                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)',
                      color: '#f7ebd0',
                      border: '1px solid rgba(205, 165, 82, 0.4)',
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAr ? 'إضافة تقييم' : 'Write Review'}</span>
                  </button>
                </div>
              </div>

              {/* Review Success Notification */}
              {reviewSubmitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      {isAr ? 'تم نشر تقييمكِ بنجاح! 🎉' : 'Your review has been published! 🎉'}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {isAr ? 'شكراً لمشاركة تجربتكِ مع عائلة صودفا.' : 'Thank you for sharing your experience with SODFA.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Write A Review Interactive Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleAddReview}
                  className="mb-8 p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-fade-in"
                >
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#cda552]" />
                    <span>{isAr ? 'أضيفي تقييمكِ وتجربتكِ للمنتج' : 'Rate & Review this product'}</span>
                  </h3>

                  {/* Rating Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">
                      {isAr ? 'تقييمكِ:' : 'Your Rating:'}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || newRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        {isAr ? 'الاسم:' : 'Your Name:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={isAr ? 'مثال: خديجة م.' : 'e.g. Sarah M.'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        {isAr ? 'المدينة:' : 'Your City:'}
                      </label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder={isAr ? 'مثال: الدار البيضاء' : 'e.g. Casablanca'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      {isAr ? 'تجربتكِ مع المنتج (التعليق):' : 'Your Review / Comment:'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        isAr
                          ? 'اكتبي انطباعكِ وتجربتكِ عن المنتج...'
                          : 'Write your thoughts and experience...'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)',
                        color: '#f7ebd0',
                      }}
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAr ? 'نشر التقييم' : 'Submit Review'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Rating Bars */}
              <div className="space-y-2 mb-8">
                {ratingBreakdown.map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-500 w-8 text-right">
                      {stars} ★
                    </span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #cda552 0%, #b8922e 100%)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-stone-400 w-8">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 transition-all hover:border-stone-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                          style={{
                            background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)',
                          }}
                        >
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-stone-900">{rev.name}</h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {isAr ? 'مشتري موثق' : 'Verified'}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {rev.location} · {rev.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related / Paired Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#cda552]">
                    {isAr ? 'منتجات مقترحة لكِ' : 'Frequently Paired'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    {isAr ? 'قد يعجبكِ أيضاً' : 'You Might Also Like'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-500 transition-all shadow-xs"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-500 transition-all shadow-xs"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Frequently Paired Carousel using Store ProductCard with variant="compact" */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth scrollbar-none"
              >
                {relatedProducts.map((rp) => {
                  const rpImageSrc = typeof rp.image === 'string' ? rp.image : '';
                  const rpId = typeof rp.id === 'string' || typeof rp.id === 'number' ? rp.id : '';
                  const rpName = typeof rp.name === 'string' ? rp.name : '';
                  const rpPrice = typeof rp.price === 'number' ? rp.price : 0;

                  return (
                    <div key={rpId} className="w-52 sm:w-60 flex-shrink-0">
                      <ProductCard
                        product={rp}
                        variant="compact"
                        href={`/store/${rpId}`}
                        onAddToCart={() => {
                          addToCart({ id: rpId, name: rpName, price: rpPrice, image: rpImageSrc }, 1);
                          openCart();
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
  );
}