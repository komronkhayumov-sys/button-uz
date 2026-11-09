"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Check,
  Phone,
  Send,
  Wifi,
  ShoppingBag,
  MapPin,
  Sparkles,
  Heart,
  Zap,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { Customer, Language, Product, StoreSettings } from "@/types";
import { DEFAULT_SETTINGS, BRANCHES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import { QuickVariationModal } from "./QuickVariationModal";
import { getStoreTimeStatus } from "@/lib/time";

interface HomeSectionProps {
  lang: Language;
  settings?: StoreSettings | null;
  customer?: Customer | null;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product, mode?: "detail" | "checkout") => void;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onViewCatalog: (category?: string) => void;
  onOpenAiMode: () => void;
  onOpenBranches: () => void;
  onOpenWifiModal: () => void;
  onOpenPhoneModal: () => void;
  onSearchSubmit?: (query: string) => void;
  recentlyViewedProducts?: Product[];
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  lang,
  settings,
  customer,
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart,
  onViewCatalog,
  onOpenAiMode,
  onOpenBranches,
  onOpenWifiModal,
  onOpenPhoneModal,
  onSearchSubmit,
  recentlyViewedProducts,
}) => {
  const isUz = lang === "uz";
  const currentSettings = settings || DEFAULT_SETTINGS;
  const instagramUrl = currentSettings.instagramUrl || "https://www.instagram.com/button_uz/";
  const telegramUrl = currentSettings.telegramUrl || "https://t.me/button_uz";

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Category list matching the mockup image with dynamic counts
  const categoryFilters = useMemo(() => {
    const counts: Record<string, number> = {
      all: products.filter((p) => p.isAvailable !== false).length,
      suits: products.filter((p) => (p.category === "suits" || p.category === "pants") && p.isAvailable !== false).length,
      jackets: products.filter((p) => p.category === "jackets" && p.isAvailable !== false).length,
      hoodies: products.filter((p) => p.category === "hoodies" && p.isAvailable !== false).length,
      polos: products.filter((p) => p.category === "polos" && p.isAvailable !== false).length,
      shoes: products.filter((p) => (p.category === "shoes" || p.category === "accessories") && p.isAvailable !== false).length,
    };

    return [
      { id: "all", labelUz: "Barchasi", labelRu: "Все", count: counts.all },
      { id: "suits", labelUz: "Kostyum & Shim", labelRu: "Костюм и брюки", count: counts.suits },
      { id: "jackets", labelUz: "Kurtka & Palto", labelRu: "Куртки и пальто", count: counts.jackets },
      { id: "hoodies", labelUz: "Xudi & Sviter", labelRu: "Худи и свитеры", count: counts.hoodies },
      { id: "polos", labelUz: "Polo & Futbolka", labelRu: "Поло и футболки", count: counts.polos },
      { id: "shoes", labelUz: "Poyabzal & Aksessuar", labelRu: "Обувь и аксессуары", count: counts.shoes },
    ];
  }, [products]);

  // Filtered products based on search & category
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.isAvailable !== false);

    if (selectedCategory !== "all") {
      if (selectedCategory === "suits") {
        list = list.filter((p) => p.category === "suits" || p.category === "pants");
      } else if (selectedCategory === "shoes") {
        list = list.filter((p) => p.category === "shoes" || p.category === "accessories");
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameRu && p.nameRu.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, selectedCategory, searchQuery]);

  // Quick Variation Modal & Uzbekistan Time Status
  const [variationProduct, setVariationProduct] = useState<Product | null>(null);
  const [timeStatus, setTimeStatus] = useState(() => getStoreTimeStatus(lang));

  useEffect(() => {
    setTimeStatus(getStoreTimeStatus(lang));
    const timer = setInterval(() => {
      setTimeStatus(getStoreTimeStatus(lang));
    }, 20000);
    return () => clearInterval(timer);
  }, [lang]);

  // Infinite Scroll & Micro-interaction States (Start with 24 to show all products immediately)
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [addedId, setAddedId] = useState<string | null>(null);
  const bottomObserverRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, searchQuery]);

  // IntersectionObserver to auto-load more items as user scrolls down
  useEffect(() => {
    const sentinel = bottomObserverRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  // Strictly unique products — no duplicate repeating items
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* ========================================================
          1. BRAND PROFILE HERO CARD (Instagram Business Profile Look)
          ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-[0_4px_20px_rgba(109,40,217,0.06)] dark:shadow-xl">
        {/* Subtle decorative atmospheric gradient on right corner */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
          {/* Avatar with Instagram story gradient rim & verified badge */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0 overflow-visible shadow-sm">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#0f172a] p-[1.5px]">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#F8FAFC] dark:bg-[#1e293b]">
                <Image
                  src={currentSettings.storeAvatar || "/btn-logo.png"}
                  alt={currentSettings.storeName || "Button Erkaklar Kiyim Do‘koni"}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
            {/* Blue verified badge with checkmark */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a] shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* Text Info (Exact Instagram Profile Typography & Info) */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <h1 className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white tracking-tight leading-snug truncate">
              {(currentSettings.storeName || "BUTTON Men's Wear").replace(/\s*\(\s*button_uz\s*\)/i, "").trim()}
            </h1>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-400 hover:underline cursor-pointer"
            >
              <span>{currentSettings.storeHandle || "@button_uz"}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-1 sm:line-clamp-none">
              {isUz
                ? (currentSettings.storeBioUz || "Zamonaviy erkaklar kiyimlari, poyabzal va aksessuarlar.")
                : (currentSettings.storeBioRu || "Стильная мужская одежда, обувь и аксессуары.")}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 font-medium pt-0.5">
              <button
                type="button"
                onClick={onOpenBranches}
                className="hover:text-violet-700 dark:hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
              >
                <MapPin className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                <span>{isUz ? "Toshkent filiallari" : "Филиалы в Ташкенте"}</span>
              </button>
              <span>•</span>
              <span className={`font-semibold flex items-center gap-1 ${timeStatus.isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${timeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span>{isUz ? timeStatus.statusTextUz : timeStatus.statusTextRu}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. 4 QUICK ACTION BUTTONS (Qo'ng'iroq, Instagram, Telegram, Wi-Fi & QR)
          ======================================================== */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
        {/* 1. Qo'ng'iroq */}
        <button
          type="button"
          onClick={onOpenPhoneModal}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-[#2563EB]/40 transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-1 text-[#10B981] group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
            {isUz ? "Qo'ng'iroq" : "Звонок"}
          </span>
        </button>

        {/* 2. Instagram */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-pink-500/40 transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center mb-1 text-[#E1306C] group-hover:scale-110 transition-transform">
            <InstagramIcon className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
            Instagram
          </span>
        </a>

        {/* 3. Telegram */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-sky-500/40 transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center mb-1 text-[#2AABEE] group-hover:scale-110 transition-transform">
            <Send className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
            Telegram
          </span>
        </a>

        {/* 4. Wi-Fi & QR */}
        <button
          type="button"
          onClick={onOpenWifiModal}
          className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs hover:border-purple-500/40 transition-all cursor-pointer group active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-1 text-[#7C3AED] group-hover:scale-110 transition-transform">
            <Wifi className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
            Wi-Fi & QR
          </span>
        </button>
      </div>

      {/* ========================================================
          3. SEARCH INPUT (Kiyimlarni qidirish...)
          ======================================================== */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? "Kiyimlarni qidirish (kostyum, kurtka, polo...)"
                : "Поиск одежды (костюм, куртка, поло...)"
            }
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-xs text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          5. CATEGORY FILTER PILLS (Barchasi 8, Kostyum & Shim 1...)
          ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categoryFilters.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-violet-700 text-white shadow-md shadow-violet-700/25 scale-[1.02]"
                  : "bg-white dark:bg-[#0f172a] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-800 hover:border-violet-600/40 hover:text-violet-700 dark:hover:text-violet-400"
              }`}
            >
              <span>{isUz ? cat.labelUz : cat.labelRu}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          6. PRODUCT FEED GRID (Exact card matching the mockup)
          ======================================================== */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-[#94A3B8] mx-auto opacity-40" />
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
              {isUz ? "Mahsulotlar topilmadi" : "Товары не найдены"}
            </h3>
            <p className="text-xs text-[#94A3B8]">
              {isUz ? "Boshqa toifa yoki qidiruv so'zini sinab ko'ring" : "Попробуйте выбрать другую категорию"}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
            >
              {isUz ? "Filtrlarni tozalash" : "Сбросить фильтры"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {displayedProducts.map((p, idx) => {
              const isWishlisted = wishlistIds.includes(p.id);
              const isXit = p.badge === "Xit" || p.isFeatured;
              const isYangi = p.badge === "Yangi" || (!isXit && p.badge);
              const isJustAdded = addedId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Clickable Image & Info -> Dedicated Product Page */}
                  <Link
                    href={`/product/${p.id}`}
                    className="cursor-pointer block"
                  >
                    <div className="relative aspect-[3/4] m-2 rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-[#1e293b]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={idx < 4}
                      />

                      {/* Top-left Badge (XIT / YANGI) */}
                      {isXit ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-violet-700 dark:bg-violet-600 text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                          XIT
                        </span>
                      ) : isYangi ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#10B981] text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                          YANGI
                        </span>
                      ) : null}

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleWishlist(p.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-[#64748B] hover:text-[#E5485D] transition-colors cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isWishlisted ? "fill-[#E5485D] text-[#E5485D]" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 pt-1 space-y-2">
                      {/* Title */}
                      <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                        {isUz ? p.name : p.nameRu || p.name}
                      </h3>

                      {/* Sizes Row matching mockup */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {p.sizes && p.sizes.length > 0 ? (
                          <>
                            {p.sizes.slice(0, 4).map((sz) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1e293b] text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700"
                              >
                                {sz}
                              </span>
                            ))}
                            {p.sizes.length > 4 && (
                              <span className="px-1 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1e293b] text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700">
                                +{p.sizes.length - 4}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1e293b] text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700">
                            Universal
                          </span>
                        )}
                      </div>

                      {/* Price Row */}
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm sm:text-base text-violet-700 dark:text-violet-400 font-mono" suppressHydrationWarning>
                          {formatUzbekCurrency(p.price)}
                        </p>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <p className="text-[11px] text-[#94A3B8] line-through" suppressHydrationWarning>
                            {formatUzbekCurrency(p.oldPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Savatga Button (Opens Size Selector & Color Picker Modal) */}
                  <div className="p-3 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVariationProduct(p);
                      }}
                      className={`w-full py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                        isJustAdded
                          ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/25"
                          : "bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/20"
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isUz ? "Qo'shildi!" : "Добавлено!"}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                          <span>{isUz ? "Savatga" : "В корзину"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Sentinel (Only when more unique items exist) */}
        {filteredProducts.length > visibleCount ? (
          <div ref={bottomObserverRef} className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400">
              {isUz ? "Ko'proq kiyimlar yuklanmoqda..." : "Загружаем больше товаров..."}
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="py-6 text-center text-xs font-bold text-[#64748B] dark:text-slate-400 border-t border-[#E2E8F0] dark:border-slate-800/60 mt-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {isUz
                ? `Barcha mahsulotlar ko'rsatildi (${filteredProducts.length} ta mahsulot)`
                : `Все товары показаны (${filteredProducts.length} товаров)`}
            </span>
          </div>
        ) : null}
      </div>

      {/* Quick Variation Modal (Size Selector & Color Picker) */}
      <QuickVariationModal
        product={variationProduct}
        lang={lang}
        isOpen={Boolean(variationProduct)}
        onClose={() => setVariationProduct(null)}
        onConfirm={(prod, sz, col, qty) => {
          onAddToCart(prod, sz, col, qty);
          setAddedId(prod.id);
          setTimeout(() => setAddedId(null), 1500);
        }}
      />
    </div>
  );
};

export default HomeSection;
