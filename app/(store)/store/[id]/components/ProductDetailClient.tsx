'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreToast } from '../../../components/StoreToastContext';

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
  UserCheck,
  Clock,
  Zap,
  Search,
  FileText,
  Droplet,
  Package,
  Home,
  LayoutGrid,
} from 'lucide-react';

function useCountdown(targetDate: string | undefined) {
  const target = useMemo(() => (targetDate ? new Date(targetDate).getTime() : 0), [targetDate]);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

  useEffect(() => {
    if (!target) { setMounted(true); return; }
    const diff = Math.max(0, target - Date.now());
    setTime({
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    });
    setMounted(true);

    const id = setInterval(() => {
      const d = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
        expired: d <= 0,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { ...time, mounted };
}
import { ProductCard } from '../../../../components/ProductCard';
import { useUI } from '../../../../contexts/UIContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useFavorites } from '../../../../contexts/FavoritesContext';
import type { Product } from '../../../../types/product';
import { WHATSAPP_LINK } from '../../../../constants';

interface ReviewItem {
  id?: string;
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
  const router = useRouter();
  const { addToCart, openCart } = useUI();
  const { locale } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToast } = useStoreToast();
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
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews' | 'shipping'>('description');

  const productBenefits = (product.moreInfo?.benefits && product.moreInfo.benefits.length > 0)
    ? product.moreInfo.benefits
    : (product.tags ?? []);

  const productIngredients = (product.moreInfo?.ingredients && product.moreInfo.ingredients.length > 0)
    ? product.moreInfo.ingredients
    : [
        isAr ? 'زيت الأرغان' : 'Argan Oil',
        isAr ? 'زيت الأوكي' : 'Prickly Pear Oil',
        isAr ? 'خلاصة الصبار' : 'Aloe Vera Extract',
        isAr ? 'فيتامين E' : 'Vitamin E',
      ];

  const fullIngredients = product.moreInfo?.ingredientsFull ||
    (isAr
      ? 'Argania Spinosa Kernel Oil, Opuntia Ficus-Indica Seed Oil, Tocopherol, Aloe Barbadensis Leaf Extract, Sodium Hyaluronate, Citrus Aurantium Bergamia Fruit Oil, Rosmarinus Officinalis Leaf Extract.'
      : 'Argania Spinosa Kernel Oil, Opuntia Ficus-Indica Seed Oil, Tocopherol, Aloe Barbadensis Leaf Extract, Sodium Hyaluronate, Citrus Aurantium Bergamia Fruit Oil, Rosmarinus Officinalis Leaf Extract.');

  const howToUseText = product.moreInfo?.howToUse ||
    (isAr
      ? 'ضعي 3-4 قطرات على بشرة نظيفة وجافة كل صباح قبل المرطب. تبعيه بواقي شمس SPF 30+ خلال النهار. للحصول على أفضل النتائج، استخدميه بانتظام لمدة 4-8 أسابيع.'
      : 'Apply 3-4 drops to clean, dry skin every morning before moisturizer. Follow with SPF 30+ during the day. For best results, use consistently for 4-8 weeks.');

  const shoppingInfo = product.moreInfo?.shoppingInfo ||
    (isAr
      ? 'تستخدم هذه التركيبة من قبل العناية اليومية مع روتين البشرة. يتم شحن الطلب خلال 24-48 ساعة داخل المدن الكبرى.'
      : 'Use this formula as part of your daily skincare routine. Orders are shipped within 24-48 hours in major cities.');

  const stock = product?.stock ?? 0;
  const maxQty = stock > 0 ? stock : 1;

  // Review Form State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Offer countdown
  const countdown = useCountdown(product.isOffer ? product.offerTime : undefined);
  const showOfferBanner = product.isOffer && product.offerTime && !countdown.expired && countdown.mounted;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Fetch reviews from API
  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?productId=${product.id}&status=approved`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((r: Record<string, unknown>) => ({
            id: String(r.id ?? ''),
            name: String(r.customer_name ?? 'Anonymous'),
            rating: Number(r.rating ?? 5),
            date: r.created_at ? new Date(String(r.created_at)).toLocaleDateString(isAr ? 'ar-MA' : 'en-MA', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
            location: '',
            text: String(r.comment ?? ''),
          }));
          setReviews(mapped);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product, isAr]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim() || !product) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          customerName: newName.trim(),
          rating: newRating,
          comment: newComment.trim(),
          status: 'pending',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to submit review');

      // Add to local state immediately (as pending)
      const newRev: ReviewItem = {
        id: json.data?.id,
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
    } catch {
      // Still add locally even if API fails (optimistic)
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
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Fallback images if product doesn't have an array
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [
        { src: typeof product.image === 'string' ? product.image : '', alt: product.imageAlt || product.name },
        { src: typeof product.bannerImage === 'string' ? product.bannerImage : '', alt: product.bannerImageAlt || product.name }
      ].filter(i => i.src);
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
    addToast('success', isAr ? `تمت إضافة ${product.name} إلى الحقيبة` : `${product.name} added to bag`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBuyNow = () => {
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
    router.push('/checkout');
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, pct };
  });

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 280;
    carouselRef.current.scrollBy({
      left: dir === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPosition({ x, y });
  };

  const whatsappMessage = encodeURIComponent(
    isAr
      ? `مرحباً دار صودفا 🌿، أريد استفسار أو طلب المنتج:\n*${product.name}*\nالسعر: ${product.price} د.م`
      : `Hello SODFA Store 🌿, I would like to order:\n*${product.name}*\nPrice: ${product.price} MAD`
  );

  useEffect(() => {
    if (!product) return;
    fetch('/api/products?status=active&limit=8')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const related = json.data
            .filter((p: Record<string, unknown>) => String(p.id) !== String(product.id))
            .slice(0, 4)
            .map((row: Record<string, unknown>) => {
              const regularPrice = typeof row.regular_price === 'number' ? row.regular_price : 0;
              const salePrice = typeof row.sale_price === 'number' ? row.sale_price : null;
              const price = salePrice ?? regularPrice;
              const originalPrice = salePrice !== null ? regularPrice : null;
              const imageSrcs = Array.isArray(row.images)
                ? row.images.map((img: unknown) => {
                    if (typeof img === 'string') return img;
                    if (img && typeof img === 'object' && 'src' in img) return String((img as { src: unknown }).src ?? '');
                    return '';
                  }).filter(Boolean)
                : [];
              return {
                id: String(row.id ?? ''),
                slug: row.slug ? String(row.slug).trim() : undefined,
                name: String(row.name ?? ''),
                price,
                originalPrice,
                image: imageSrcs[0] ?? '/assets/images/no_image.png',
                imageAlt: String(row.name ?? ''),
                badge: row.featured ? 'Featured' : (row.ADS ? 'ADS' : null),
                showInStore: Boolean(row.ShowInStor ?? row.showInStore ?? false),
                inStock: Number(row.stock ?? 0) > 0,
                brand: row.brand ? String(row.brand) : undefined,
                category: row.subcategory ? String(row.subcategory) : undefined,
                rating: typeof row.rating === 'number' ? row.rating : undefined,
                reviews: typeof row.review_count === 'number' ? row.review_count : undefined,
                sales: typeof row.total_sold === 'number' ? row.total_sold : undefined,
                description: String(row.short_description ?? row.full_description ?? ''),
                tags: Array.isArray(row.tags) ? row.tags : [],
                images: imageSrcs.map((src) => ({ src })),
                isOffer: Boolean(row.IsOffer ?? row.isOffer ?? false),
                offerTime: row.OfferTime ? String(row.OfferTime) : row.offerTime ? String(row.offerTime) : undefined,
              } as Product;
            });
          setRelatedProducts(related);
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
          <ol className="flex items-center whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="flex items-center text-sm text-stone-500 hover:text-emerald-800 transition-colors focus:outline-none focus:text-emerald-800"
              >
                <Home className="shrink-0 me-2 w-4 h-4" />
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
              <ChevronRight className="shrink-0 mx-2 w-4 h-4 text-stone-400" />
            </li>
            <li className="inline-flex items-center">
              <Link
                href="/store"
                className="flex items-center text-sm text-stone-500 hover:text-emerald-800 transition-colors focus:outline-none focus:text-emerald-800"
              >
                <LayoutGrid className="shrink-0 me-2 w-4 h-4" />
                {isAr ? 'المتجر' : 'Store'}
              </Link>
              <ChevronRight className="shrink-0 mx-2 w-4 h-4 text-stone-400" />
            </li>
            <li className="inline-flex items-center text-sm font-semibold text-stone-900 truncate max-w-[200px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>

        {/* Product Details Main Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-10 bg-white p-5 sm:p-7 lg:p-8 rounded-3xl border border-stone-200/80 shadow-sm items-stretch">
            {/* LEFT: Image Gallery */}
            <div className="flex flex-col gap-4 min-h-0">
              {/* Main Image View */}
              <div
                ref={imageContainerRef}
                className="relative flex-1 min-h-[300px] lg:min-h-0 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group cursor-crosshair"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={
                    typeof productImages[activeImage]?.src === 'string'
                      ? (productImages[activeImage].src as string)
                      : typeof product.image === 'string'
                      ? product.image
                      : ''
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out"
                  style={{
                    transform: isImageHovered ? `scale(1.8)` : 'scale(1)',
                    transformOrigin: `${cursorPosition.x}% ${cursorPosition.y}%`,
                  }}
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
                    onClick={() => toggleFavorite(String(product.id))}
                    className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-110 ${
                      isFavorite(String(product.id))
                        ? 'bg-red-50 text-red-500'
                        : 'bg-white/90 text-stone-700 hover:text-red-500'
                    }`}
                    aria-label={isFavorite(String(product.id)) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-red-500 text-red-500' : ''}`} />
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

                {/* Hover to Zoom Tag */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-stone-900/80 text-white flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all duration-300">
                    <Search className="w-3 h-3" />
                    {isAr ? 'مرر للتكبير' : 'Hover to zoom'}
                  </span>
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
            <div className="flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-4">
                {/* Category & Brand */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#cda552]">
                    {product.brand || 'SODFA'} · {product.category || (isAr ? 'عناية طبيعية' : 'Natural Care')}
                  </span>
                  {/* Stock Status Indicator */}
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                    product.inStock === false || (product.stock ?? 0) === 0
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      product.inStock === false || (product.stock ?? 0) === 0
                        ? 'bg-red-500'
                        : 'bg-emerald-500 animate-pulse'
                    }`} />
                    <span>
                      {product.inStock === false || (product.stock ?? 0) === 0
                        ? (isAr ? 'نفد المخزون' : 'Out of Stock')
                        : (isAr ? 'متوفر في المخزون' : 'In Stock')}
                    </span>
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

                {/* Special Offer Countdown Banner */}
                {showOfferBanner && (
                  <div
                    className="rounded-xl px-3 py-2 flex items-center gap-2"
                    style={{
                      background: '#FCD34D',
                      boxShadow: '0 4px 12px rgba(252, 211, 77, 0.4)',
                    }}
                  >
                    <Clock className="w-4 h-4 text-[#1F2937] shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F2937]/70 whitespace-nowrap">
                      {isAr ? 'ينتهي خلال' : 'ENDS IN'}
                    </span>
                    <div className="flex items-center gap-1" style={{ direction: 'ltr' }}>
                      {countdown.days > 0 && (
                        <>
                          <span className="w-7 h-7 rounded bg-[#1F2937] flex items-center justify-center text-[11px] font-black text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {String(countdown.days).padStart(2, '0')}
                          </span>
                          <span className="text-[#1F2937]/40 font-bold text-[10px]">:</span>
                        </>
                      )}
                      <span className="w-7 h-7 rounded bg-[#1F2937] flex items-center justify-center text-[11px] font-black text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[#1F2937]/40 font-bold text-[10px]">:</span>
                      <span className="w-7 h-7 rounded bg-[#1F2937] flex items-center justify-center text-[11px] font-black text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[#1F2937]/40 font-bold text-[10px] hidden sm:inline">:</span>
                      <span className="w-7 h-7 rounded bg-[#1F2937] items-center justify-center text-[11px] font-black text-white hidden sm:flex" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}

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
                {/* Row 1: Quantity + Stock Info */}
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className={`flex items-center border rounded-xl bg-stone-50 p-1 ${
                    product.inStock === false || (product.stock ?? 0) === 0
                      ? 'border-stone-200 opacity-50'
                      : 'border-stone-300'
                  }`}>
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={product.inStock === false || stock === 0}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-stone-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      disabled={product.inStock === false || stock === 0 || qty >= maxQty}
                      className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock Info */}
                  <span className="text-xs text-stone-500">
                    {product.inStock === false || stock === 0 ? (
                      <span className="font-bold text-red-600">
                        {isAr ? 'نفد المخزون' : 'Out of stock'}
                      </span>
                    ) : qty >= maxQty ? (
                      <span className="font-bold text-amber-600">
                        {isAr ? `الحد الأقصى ${stock} قطع` : `Max ${stock} items`}
                      </span>
                    ) : (
                      <>
                        {isAr ? 'فقط' : 'Only'}{' '}
                        <span className="font-bold text-emerald-700">{stock}</span>{' '}
                        {isAr ? 'قطع متبقية في المخزون' : 'items left in stock'}
                      </>
                    )}
                  </span>
                </div>

                {/* Row 2: Add to Cart + Buy Now */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Main Add To Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.inStock === false || (product.stock ?? 0) === 0}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
                      product.inStock === false || (product.stock ?? 0) === 0
                        ? 'bg-stone-400 cursor-not-allowed text-white'
                        : 'hover:scale-[1.01] active:scale-[0.99] text-white'
                    }`}
                    style={
                      product.inStock !== false && (product.stock ?? 0) > 0
                        ? {
                            background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 60%, #0d3428 100%)',
                            boxShadow: '0 4px 18px rgba(6, 28, 22, 0.35)',
                            border: '1px solid rgba(205, 165, 82, 0.4)',
                            color: '#f7ebd0',
                          }
                        : undefined
                    }
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {product.inStock === false || (product.stock ?? 0) === 0
                        ? (isAr ? 'نفد المخزون' : 'Out of Stock')
                        : added
                          ? isAr
                            ? 'تمت الإضافة بنجاح!'
                            : 'Added to Bag!'
                          : isAr
                          ? `إضافة إلى الحقيبة — ${(product.price * qty).toFixed(2)} د.م`
                          : `Add to Bag — ${(product.price * qty).toFixed(2)} MAD`}
                    </span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={product.inStock === false || (product.stock ?? 0) === 0}
                    className={`py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      product.inStock !== false && (product.stock ?? 0) > 0
                        ? 'hover:scale-[1.01] active:scale-[0.99]'
                        : ''
                    }`}
                    style={{
                      background: product.inStock !== false && (product.stock ?? 0) > 0 ? '#cda552' : '#9ca3af',
                      color: product.inStock !== false && (product.stock ?? 0) > 0 ? '#0b2e22' : '#ffffff',
                      border: `1px solid ${product.inStock !== false && (product.stock ?? 0) > 0 ? '#b8922e' : '#6b7280'}`,
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isAr ? 'شراء الآن' : 'Buy Now'}</span>
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

          {/* Product Details Tabs Section */}
          <div className="mt-10 bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-none">
              {[
                { id: 'description' as const, label: isAr ? 'الوصف' : 'Description', icon: FileText },
                { id: 'ingredients' as const, label: isAr ? 'المكونات' : 'Ingredients', icon: Droplet },
                { id: 'reviews' as const, label: isAr ? `التقييمات (${reviews.length})` : `Reviews (${reviews.length})`, icon: MessageSquare },
                { id: 'shipping' as const, label: isAr ? 'الشحن' : 'Shipping', icon: Truck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-900 text-emerald-900 bg-stone-50'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 mb-4">{isAr ? 'عن هذا المنتج' : 'About This Product'}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {product.description ||
                        (isAr
                          ? 'تركيبة مغذية فاخرة مستخلصة من أفضل الزيوت والأعشاب الطبيعية المغربية للعناية الفائقة والنتائج الملحوظة من الاستعمال الأول.'
                          : 'A luxury nourishing formula crafted with pure botanical oils to deeply hydrate and restore natural radiance.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 mb-4">{isAr ? 'الفوائد الرئيسية' : 'Key Benefits'}</h3>
                    <ul className="space-y-3">
                      {(() => {
                        const benefits: string[] = productBenefits.length > 0 ? productBenefits : [
                          isAr ? '100% مكونات طبيعية' : '100% Natural Botanical Extract',
                          isAr ? 'يغذي ويرطب البشرة بعمق' : 'Deeply nourishes & hydrates skin',
                          isAr ? 'خالٍ من البارابين والسلفات' : 'Paraben & Sulfate Free',
                          isAr ? 'اختُبر طبياً ومناسب لجميع أنواع البشرة' : 'Dermatologically Tested',
                          isAr ? 'يُقلل ظهور التجاعيد والخطوط الدقيقة' : 'Reduces appearance of fine lines',
                        ];
                        return benefits.slice(0, 6);
                      })().map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
                            <Check className="w-3 h-3 text-emerald-700" />
                          </span>
                          <span className="text-sm text-stone-700">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 mb-4">{isAr ? 'طريقة الاستعمال' : 'How to Use'}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{howToUseText}</p>
                  </div>

                </div>
              )}

              {/* Ingredients Tab */}
              {activeTab === 'ingredients' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 mb-4">{isAr ? 'المكونات الرئيسية' : 'Key Ingredients'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {productIngredients.map((ingredient, i) => (
                        <div key={`${ingredient}-${i}`} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplet className="w-4 h-4 text-emerald-700" />
                            <h4 className="text-sm font-bold text-stone-900">{ingredient}</h4>
                          </div>
                          <p className="text-xs text-stone-600">
                            {isAr ? 'مكون أساسي للعناية اليومية بالبشرة' : 'Essential daily skincare ingredient'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                    <h4 className="text-sm font-bold text-stone-900 mb-2">{isAr ? 'التركيبة الكاملة' : 'Full Ingredients List'}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">{fullIngredients}</p>
                  </div>

                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Success Notification */}
                  {reviewSubmitted && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">
                          {isAr ? 'تم نشر تقييمكِ بنجاح!' : 'Your review has been published!'}
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          {isAr ? 'شكراً لمشاركة تجربتكِ مع عائلة صودفا.' : 'Thank you for sharing your experience with SODFA.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating Overview */}
                  <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
                      <span className="text-5xl font-black text-stone-900">{product.rating || 4.9}</span>
                      <div className="flex text-amber-400 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-stone-500 mt-1">
                        {isAr ? `بناءً على ${reviews.length} تقييم` : `Based on ${reviews.length} reviews`}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingBreakdown.map(({ stars, pct }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-stone-600 w-12 text-right">{stars} {isAr ? 'نجمة' : 'stars'}</span>
                          <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: '#f59e0b' }}
                            />
                          </div>
                          <span className="text-xs font-medium text-stone-500 w-8">{reviews.filter((r) => r.rating === stars).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Write Review Button */}
                  <div className="flex justify-end">
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

                  {/* Write A Review Interactive Form */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleAddReview}
                      className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-fade-in"
                    >
                      <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#cda552]" />
                        <span>{isAr ? 'أضيفي تقييمكِ وتجربتكِ للمنتج' : 'Rate & Review this product'}</span>
                      </h3>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-600">{isAr ? 'تقييمكِ:' : 'Your Rating:'}</label>
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
                              <Star className={`w-6 h-6 ${star <= (hoverRating || newRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">{isAr ? 'الاسم:' : 'Your Name:'}</label>
                          <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={isAr ? 'مثال: خديجة م.' : 'e.g. Sarah M.'} className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 mb-1">{isAr ? 'المدينة:' : 'Your City:'}</label>
                          <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder={isAr ? 'مثال: الدار البيضاء' : 'e.g. Casablanca'} className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">{isAr ? 'تجربتكِ مع المنتج:' : 'Your Review:'}</label>
                        <textarea required rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={isAr ? 'اكتبي انطباعكِ...' : 'Write your thoughts...'} className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:border-emerald-800" />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors">
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button type="submit" disabled={isSubmittingReview} className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)', color: '#f7ebd0' }}>
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isSubmittingReview ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'نشر التقييم' : 'Submit Review')}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Review Cards List */}
                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-8 gap-3">
                        <div className="w-5 h-5 border-2 border-[#cda552] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-stone-400">{isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</span>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs text-stone-400">{isAr ? 'لا توجد تقييمات بعد. كوني أول من يقيّم!' : 'No reviews yet. Be the first to review!'}</p>
                      </div>
                    ) : (
                      reviews.map((rev, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2 transition-all hover:border-stone-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs" style={{ background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)' }}>
                                {rev.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-stone-900">{rev.name}</h4>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{isAr ? 'مشتري موثق' : 'Verified'}</span>
                                </div>
                                <span className="text-[10px] text-stone-400">{rev.location} · {rev.date}</span>
                              </div>
                            </div>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rev.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Tab — DB-driven via more_info.shoppingInfo */}
              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 mb-2">{isAr ? 'معلومات الشحن' : 'Shipping Information'}</h3>
                    <p className="text-sm text-stone-600">
                      {shoppingInfo && shoppingInfo.trim().length > 0
                        ? shoppingInfo
                        : (isAr ? 'نقدم شحن سريع وموثوق في جميع أنحاء المغرب مع خيارات توصيل متعددة تناسب احتياجاتك.' : 'We offer fast, reliable shipping across Morocco with multiple delivery options to suit your needs.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        icon: Truck,
                        title: isAr ? 'توصيل عادي' : 'Standard Delivery',
                        desc: isAr ? '2-4 أيام عمل' : '2-4 business days',
                        extra: isAr ? '30 د.م' : '30 MAD',
                        note: isAr ? 'شحن مجاني للطلبات فوق 500 د.م' : 'Free on orders over 500 MAD',
                      },
                      {
                        icon: Zap,
                        title: isAr ? 'توصيل سريع' : 'Express Delivery',
                        desc: isAr ? '24 ساعة' : '24 hours',
                        extra: isAr ? '50 د.م' : '50 MAD',
                        note: isAr ? 'اطلبي قبل الساعة 2 مساءً للشحن بنفس اليوم' : 'Order before 2 PM for same-day dispatch',
                      },
                      {
                        icon: Package,
                        title: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery',
                        desc: isAr ? 'ادفعي عند استلام طلبك' : 'Pay when you receive your order',
                        extra: '',
                        note: isAr ? 'متوفر في جميع المدن' : 'Available across all cities',
                      },
                      {
                        icon: ShieldCheck,
                        title: isAr ? 'إرجاع سهل' : 'Easy Returns',
                        desc: isAr ? 'سياسة إرجاع 30 يوم' : '30-day return policy',
                        extra: '',
                        note: isAr ? 'شحن إرجاع مجاني على المنتجات التالفة' : 'Free return shipping on defects',
                      },
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <item.icon className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                            <p className="text-xs text-stone-600 mt-0.5">{item.desc}{item.extra && ` · ${item.extra}`}</p>
                            <p className="text-[11px] text-stone-500 mt-1">{item.note}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  const rpSlug = (rp as any).slug ? String((rp as any).slug) : undefined;

                  return (
                    <div key={rpId} className="w-52 sm:w-60 flex-shrink-0">
                      <ProductCard
                        product={rp}
                        variant="compact"
                        href={`/store/${encodeURIComponent(rpSlug || String(rpId))}`}
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