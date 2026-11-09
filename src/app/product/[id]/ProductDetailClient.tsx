"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Check,
  ShoppingBag,
  Sparkles,
  Ruler,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sun,
  Moon,
} from "lucide-react";
import { CartItem, Language, Product, StoreSettings } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";
import SmartSizeCalculator from "@/components/store/SmartSizeCalculator";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";

interface ProductDetailClientProps {
  product: Product;
  allProducts: Product[];
  settings: StoreSettings;
}

export default function ProductDetailClient({
  product,
  allProducts,
  settings,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("uz");
  const isRu = lang === "ru";
  const [isDark, setIsDark] = useState<boolean>(false);

  // Gallery
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Selection
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  // Modals & UI States
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [addedRelId, setAddedRelId] = useState<string | null>(null);

  // Curated matching recommendations (8 items, strictly unique, no duplicates)
  const recommendedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id && p.isAvailable !== false)
    .slice(0, 8);

  // Load theme and cart from localStorage
  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("button_theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }

    // Lang sync
    const savedLang = localStorage.getItem("button_lang");
    if (savedLang === "uz" || savedLang === "ru") {
      setLang(savedLang);
    }

    try {
      const saved = localStorage.getItem("button_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    try {
      localStorage.setItem("button_theme", nextTheme ? "dark" : "light");
      if (nextTheme) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
      }
    } catch (e) {}
  };

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("button_cart", JSON.stringify(items));
  };

  const handleAddToCart = (p: Product, size: string, color?: string, qty = 1) => {
    const itemId = `${p.id}-${size}-${color || "default"}`;
    const existing = cartItems.find((it) => it.id === itemId);

    let updated: CartItem[];
    if (existing) {
      updated = cartItems.map((it) =>
        it.id === itemId ? { ...it, quantity: it.quantity + qty } : it
      );
    } else {
      updated = [
        ...cartItems,
        {
          id: itemId,
          productId: p.id,
          product: p,
          size,
          color,
          quantity: qty,
          price: p.price,
        },
      ];
    }
    saveCart(updated);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart(product, selectedSize, selectedColor, quantity);
    router.push("/cart");
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} — BUTTON Men's Wear`,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1120] text-[#0F172A] dark:text-white pb-28 font-sans selection:bg-[#2563EB] selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">{isRu ? "Назад" : "Orqaga"}</span>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden relative border border-[#2563EB]/30">
              <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" unoptimized />
            </div>
            <span className="font-black text-sm tracking-widest text-[#0F172A] dark:text-white">
              BUTTON MEN
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Lang switcher */}
            <div className="flex p-0.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLang("uz");
                  localStorage.setItem("button_lang", "uz");
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  lang === "uz" ? "bg-[#2563EB] text-white shadow-xs font-black" : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang("ru");
                  localStorage.setItem("button_lang", "ru");
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  lang === "ru" ? "bg-[#2563EB] text-white shadow-xs font-black" : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                RU
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-violet-400" /> : <Moon className="w-4 h-4 text-violet-700" />}
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-violet-700 text-white hover:bg-violet-800 transition-colors shadow-md shadow-violet-700/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5485D] text-white text-[10px] font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/4.8] w-full rounded-3xl overflow-hidden bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 group shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-2xl">
              <Image
                src={gallery[activeImgIdx] || product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-lg">
                  {product.badge}
                </span>
              )}

              {/* Prev / Next Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImgIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-[#2563EB] scale-95 shadow-md shadow-blue-500/30"
                        : "border-[#E2E8F0] dark:border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Options */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  BUTTON Men's Wear
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? (isRu ? "Скопировано!" : "Nusxalandi!") : (isRu ? "Поделиться" : "Ulashish")}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-[#0F172A] dark:text-white">
                {isRu ? product.nameRu || product.name : product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-violet-700 dark:text-violet-400">
                  {formatUzbekCurrency(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-sm sm:text-base font-mono text-[#64748B] dark:text-slate-400 line-through">
                    {formatUzbekCurrency(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed shadow-xs">
              {isRu ? product.descriptionRu || product.description : product.description}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block">
                  {isRu ? "Цвет:" : "Rang:"} <span className="text-[#0F172A] dark:text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isChosen = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isChosen
                            ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-600/30"
                            : "bg-[#F1F5F9] dark:bg-[#1e293b] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes & Calculator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#64748B] dark:text-slate-400">
                  {isRu ? "Размер:" : "O'lcham:"} <span className="text-[#0F172A] dark:text-white font-bold">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSizeCalcOpen(true)}
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{isRu ? "Таблица размеров" : "O'lcham jadvali"}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isChosen = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[46px] px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        isChosen
                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-600/30"
                          : "bg-[#F1F5F9] dark:bg-[#1e293b] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">{isRu ? "Количество:" : "Miqdor:"}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-sm cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm text-[#0F172A] dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-sm cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Trust features */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B] dark:text-slate-400">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
                <Truck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                <span>{isRu ? "Доставка по Ташкенту" : "Toshkent bo'ylab yetkazish"}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{isRu ? "100% Гарантия качества" : "100% Sifat kafolati"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section — Vertical 2-Column Grid (Standard E-Commerce UX) */}
        {recommendedProducts.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white">
                  {isRu ? "Вам также может понравиться" : "Tavsiya etilgan kiyimlar"}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">
                {recommendedProducts.length} {isRu ? "товаров" : "ta kiyim"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {recommendedProducts.map((rel) => {
                const isRelAdded = addedRelId === rel.id;
                const isXit = rel.badge === "Xit" || rel.isFeatured;
                const isYangi = rel.badge === "Yangi" || (!isXit && rel.badge);

                return (
                  <div
                    key={rel.id}
                    className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-xs dark:shadow-lg hover:border-[#2563EB]/50 transition-all flex flex-col justify-between group"
                  >
                    {/* Clickable Image & Info -> navigates to that product's page */}
                    <Link href={`/product/${rel.id}`} className="cursor-pointer block flex-1">
                      <div className="relative aspect-[3/4] m-2 rounded-2xl overflow-hidden bg-[#F1F3F9] dark:bg-[#1e293b]">
                        <Image
                          src={rel.image}
                          alt={rel.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isXit ? (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-violet-700 dark:bg-violet-600 text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                            XIT
                          </span>
                        ) : isYangi ? (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#10B981] text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                            YANGI
                          </span>
                        ) : null}
                      </div>

                      <div className="p-3 pt-1 space-y-2">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                          {isRu ? rel.nameRu || rel.name : rel.name}
                        </h4>

                        {/* Sizes */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          {rel.sizes && rel.sizes.length > 0 ? (
                            rel.sizes.slice(0, 4).map((sz) => (
                              <span
                                key={sz}
                                className="px-1.5 py-0.5 rounded-md bg-[#F1F3F9] dark:bg-[#1e293b] text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400"
                              >
                                {sz}
                              </span>
                            ))
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#F1F3F9] dark:bg-[#1e293b] text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400">
                              Universal
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs sm:text-sm text-violet-700 dark:text-violet-400 font-mono">
                            {formatUzbekCurrency(rel.price)}
                          </p>
                          {rel.oldPrice && rel.oldPrice > rel.price && (
                            <p className="text-[10px] text-[#94A3B8] line-through">
                              {formatUzbekCurrency(rel.oldPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Add to Cart Button */}
                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(rel, rel.sizes?.[0] || "M", rel.colors?.[0] || "", 1);
                          setAddedRelId(rel.id);
                          setTimeout(() => setAddedRelId(null), 1500);
                        }}
                        className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                          isRelAdded
                            ? "bg-[#10B981] text-white shadow-emerald-500/20"
                            : "bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/20"
                        }`}
                      >
                        {isRelAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isRu ? "Добавлено!" : "Qo'shildi!"}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{isRu ? "В корзину" : "Savatga"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-[#E2E8F0] dark:border-slate-800 p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),12px)] transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleAddToCart(product, selectedSize, selectedColor, quantity)}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#E2E8F0] dark:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>{isRu ? "В корзину" : "Savatga qo'shish"}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-[1.5] py-3.5 px-4 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-700/25 transition-all cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 fill-current" />
            <span>{isRu ? "Оформить заказ в корзине" : "Hoziroq Xarid Qilish"}</span>
          </button>
        </div>
      </div>

      {/* Added to cart toast */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-[#10B981] text-white text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isRu ? "Товар добавлен в корзину!" : "Mahsulot savatga qo'shildi!"}</span>
        </div>
      )}

      {/* Smart Size Calculator Modal */}
      <SmartSizeCalculator
        isOpen={isSizeCalcOpen}
        lang={lang}
        onClose={() => setIsSizeCalcOpen(false)}
        onSelectSize={(sz) => setSelectedSize(sz)}
        availableSizes={product.sizes}
      />

      {/* PWA Prompt */}
      <PwaInstallPrompt lang={lang} target="store" />

      {/* Persistent Floating Cart Button (Temu / Alibaba style) */}
      <div className="fixed bottom-24 md:bottom-20 right-4 sm:right-6 md:right-8 z-40 animate-fade-in">
        <Link
          href="/cart"
          aria-label={isRu ? `Корзина (${totalCartCount})` : `Savat (${totalCartCount})`}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-2 border-violet-600 shadow-[0_10px_25px_rgba(109,40,217,0.35)] flex items-center justify-center text-violet-700 dark:text-violet-400 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        >
          <ShoppingBag className="w-6 h-6 stroke-[2.5] group-hover:rotate-6 transition-transform" />
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full font-mono text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[#0f172a] shadow-md transition-all ${
              totalCartCount > 0 ? "bg-[#E5485D] text-white animate-pulse" : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {totalCartCount}
          </span>
        </Link>
      </div>
    </div>
  );
}
