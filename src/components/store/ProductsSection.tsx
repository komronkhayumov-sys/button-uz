"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  ShoppingBag,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Language, Product } from "@/types";
import { CATEGORIES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import ProductSkeleton from "@/components/common/ProductSkeleton";
import { QuickVariationModal } from "./QuickVariationModal";

interface ProductsSectionProps {
  products: Product[];
  lang: Language;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  initialCategory?: string;
  initialSearchQuery?: string;
  isLoading?: boolean;
}

type SortOption = "featured" | "newest" | "price_asc" | "price_desc";
type PriceFilterOption = "all" | "under300" | "300to600" | "above600";

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  lang,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart,
  initialCategory = "all",
  initialSearchQuery = "",
  isLoading = false,
}) => {
  const isUz = lang === "uz";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Advanced Filters (Phase 4.2)
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>("all");
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>("all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<PriceFilterOption>("all");
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState<boolean>(false);

  // Pagination / Infinite Feed state
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [addedItemAnim, setAddedItemAnim] = useState<string | null>(null);
  const [variationProduct, setVariationProduct] = useState<Product | null>(null);
  const bottomObserverRef = useRef<HTMLDivElement | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Sizes available across products
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  // Colors available
  const availableColors = [
    { id: "all", labelUz: "Barchasi", labelRu: "Все" },
    { id: "Qora", labelUz: "Qora", labelRu: "Черный", hex: "#111827" },
    { id: "To'q ko'k", labelUz: "To'q ko'k", labelRu: "Темно-синий", hex: "#1E3A8A" },
    { id: "Kulrang", labelUz: "Kulrang", labelRu: "Серый", hex: "#6B7280" },
    { id: "Oq", labelUz: "Oq", labelRu: "Белый", hex: "#F3F4F6" },
    { id: "Jigarrang", labelUz: "Jigarrang", labelRu: "Коричневый", hex: "#78350F" },
  ];

  // Price range presets
  const pricePresets: Array<{ id: PriceFilterOption; labelUz: string; labelRu: string }> = [
    { id: "all", labelUz: "Barcha narxlar", labelRu: "Все цены" },
    { id: "under300", labelUz: "300 000 so'mgacha", labelRu: "До 300 000 сум" },
    { id: "300to600", labelUz: "300 000 – 600 000 so'm", labelRu: "300 000 – 600 000 сум" },
    { id: "above600", labelUz: "600 000 so'mdan yuqori", labelRu: "Выше 600 000 сум" },
  ];

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (onlyAvailableFilter && p.isAvailable === false) {
        return false;
      }
      // Size filter
      if (selectedSizeFilter !== "all" && !p.sizes?.includes(selectedSizeFilter)) {
        return false;
      }
      // Color filter
      if (selectedColorFilter !== "all") {
        const matchesColor = p.colors?.some((c) =>
          c.toLowerCase().includes(selectedColorFilter.toLowerCase())
        );
        if (!matchesColor) return false;
      }
      // Price preset filter
      if (selectedPriceFilter === "under300" && p.price > 300000) {
        return false;
      }
      if (selectedPriceFilter === "300to600" && (p.price < 300000 || p.price > 600000)) {
        return false;
      }
      if (selectedPriceFilter === "above600" && p.price < 600000) {
        return false;
      }
      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.nameRu && p.nameRu.toLowerCase().includes(q)) ||
        (p.descriptionRu && p.descriptionRu.toLowerCase().includes(q))
      );
    });

    // Sorting
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result = [...result].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }

    return result;
  }, [
    products,
    selectedCategory,
    onlyAvailableFilter,
    selectedSizeFilter,
    selectedColorFilter,
    selectedPriceFilter,
    searchQuery,
    sortBy,
  ]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

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

  const handleAddToCartClick = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    setVariationProduct(p);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedSizeFilter("all");
    setSelectedColorFilter("all");
    setSelectedPriceFilter("all");
    setOnlyAvailableFilter(false);
    setSearchQuery("");
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedSizeFilter !== "all" ? 1 : 0) +
    (selectedColorFilter !== "all" ? 1 : 0) +
    (selectedPriceFilter !== "all" ? 1 : 0) +
    (onlyAvailableFilter ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* 4.1. Header & Breadcrumbs matching Mockup */}
      <div className="space-y-1">
        <div className="text-xs text-[#9AA6B6] flex items-center gap-1.5 font-medium">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#F5F7FA]">
            {isUz ? "Mahsulotlar" : "Товары"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F5F7FA] tracking-tight">
          {isUz ? "Barcha mahsulotlar" : "Все товары"}
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA6B6]">
          {isUz ? "Siz uchun eng yaxshi tanlov" : "Лучший выбор для вашего стиля"}
        </p>
      </div>

      {/* 4.1. Search, Filter Button, Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-[#9AA6B6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUz ? "Qidiruv..." : "Поиск товаров..."}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#151B25] border border-[#293241] text-xs sm:text-sm text-[#F5F7FA] placeholder-[#657184] focus:outline-none focus:border-[#2878F0] focus:ring-1 focus:ring-[#2878F0]/30 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA6B6] hover:text-[#F5F7FA]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filter Sheet Button */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(!isFilterSheetOpen)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeFilterCount > 0
                ? "bg-[#2878F0] border-[#2878F0] text-white shadow-md shadow-blue-500/25"
                : "bg-[#151B25] border-[#293241] text-[#F5F7FA] hover:border-zinc-500"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isUz ? "Filtrlar" : "Фильтры"}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-zinc-950 font-black text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Select */}
          <div className="flex items-center bg-[#151B25] px-2.5 py-1.5 rounded-2xl border border-[#293241] text-xs font-bold">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#9AA6B6] mr-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[#F5F7FA] py-1 pr-1 focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="featured" className="bg-[#151B25]">
                {isUz ? "Saralash: Tavsiya etilgan" : "Сортировка: Рекомендуемые"}
              </option>
              <option value="newest" className="bg-[#151B25]">
                {isUz ? "Saralash: Yangilar" : "Сортировка: Новинки"}
              </option>
              <option value="price_asc" className="bg-[#151B25]">
                {isUz ? "Narxi: arzonidan qimmatiga" : "Цена: сначала дешевле"}
              </option>
              <option value="price_desc" className="bg-[#151B25]">
                {isUz ? "Narxi: qimmatidan arzoniga" : "Цена: сначала дороже"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 4.1. Horizontal Category Pills (Barchasi 245, Kostyum 48, etc.) */}
      <nav
        aria-label={isUz ? "Kategoriyalar filtri" : "Фильтр категорий"}
        className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const label = isUz ? cat.nameUz : cat.nameRu;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#2878F0] text-white shadow-md shadow-blue-500/30 font-black scale-[1.02]"
                  : "bg-[#151B25] text-[#9AA6B6] border border-[#293241] hover:text-[#F5F7FA] hover:border-zinc-500"
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#1C2430] text-[#9AA6B6]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 4.2. Advanced Filters Drawer / Bottom Sheet (Kategoriya, Narx, Razmer, Rang, Mavjudlik) */}
      {isFilterSheetOpen && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[#151B25] border border-[#293241] space-y-4 animate-slide-down shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#293241]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#E5A850]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#F5F7FA]">
                {isUz ? "Filtrlar paneli" : "Панель фильтров"}
              </h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#E5A850] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isUz ? "Tozalash" : "Сбросить"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* A. Narx oralig'i */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#9AA6B6] block">
                {isUz ? "Narx oralig'i:" : "Диапазон цен:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pricePresets.map((pr) => (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => setSelectedPriceFilter(pr.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedPriceFilter === pr.id
                        ? "bg-[#2878F0] text-white shadow-xs"
                        : "bg-[#1C2430] text-[#9AA6B6] border border-[#293241] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {isUz ? pr.labelUz : pr.labelRu}
                  </button>
                ))}
              </div>
            </div>

            {/* B. Razmerlar */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#9AA6B6] block">
                {isUz ? "O'lcham (Razmer):" : "Размер одежды:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSizeFilter("all")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                    selectedSizeFilter === "all"
                      ? "bg-[#2878F0] text-white"
                      : "bg-[#1C2430] text-[#9AA6B6] border border-[#293241]"
                  }`}
                >
                  {isUz ? "Barchasi" : "Все"}
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSizeFilter(size)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedSizeFilter === size
                        ? "bg-[#2878F0] text-white shadow-xs"
                        : "bg-[#1C2430] text-[#9AA6B6] border border-[#293241] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Ranglar & Mavjudlik */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#9AA6B6] block">
                {isUz ? "Rang:" : "Цвет:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColorFilter(col.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedColorFilter === col.id
                        ? "bg-[#2878F0] text-white shadow-xs"
                        : "bg-[#1C2430] text-[#9AA6B6] border border-[#293241] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {col.hex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: col.hex }}
                      />
                    )}
                    <span>{isUz ? col.labelUz : col.labelRu}</span>
                  </button>
                ))}
              </div>

              {/* Faqat mavjud bo'lganlar toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F7FA]">
                  <input
                    type="checkbox"
                    checked={onlyAvailableFilter}
                    onChange={(e) => setOnlyAvailableFilter(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2878F0] focus:ring-0 bg-[#1C2430] border-[#293241]"
                  />
                  <span>{isUz ? "Faqat sotuvda mavjud bo'lganlar" : "Только товары в наличии"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Apply button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-[#2878F0] hover:bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              {isUz ? `Natijalarni ko'rish (${filteredProducts.length})` : `Показать результаты (${filteredProducts.length})`}
            </button>
          </div>
        </div>
      )}

      {/* 4.1. Product Grid or Loading Skeleton */}
      {isLoading ? (
        <ProductSkeleton count={8} />
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3 shadow-sm dark:shadow-xl">
          <ShoppingBag className="w-12 h-12 text-[#9AA6B6] mx-auto opacity-50" />
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
            {products.length === 0
              ? (isUz ? "Hozircha mahsulotlar mavjud emas" : "Товары пока не добавлены")
              : (isUz ? "Mahsulot topilmadi" : "Товары не найдены")}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
            {products.length === 0
              ? (isUz ? "Yangi kolleksiya tez kunda katalogga joylanadi." : "Новая коллекция скоро появится в каталоге.")
              : (isUz
                ? "Bu qidiruv yoki filtrlar bo'yicha mahsulot topilmadi. Boshqa so'z bilan qidirib ko'ring."
                : "По данному запросу товаров не найдено. Попробуйте изменить параметры поиска.")}
          </p>
          {products.length > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
            >
              {isUz ? "Filtrlarni tozalash" : "Сбросить фильтры"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {displayedProducts.map((p, idx) => {
              const isWishlisted = wishlistIds.includes(p.id);
              const isJustAdded = addedItemAnim === p.id;
              const isAvailable = p.isAvailable !== false;

              return (
                <div
                  key={p.id}
                  className={`group relative rounded-2xl sm:rounded-3xl bg-[#151B25] border border-[#293241] overflow-hidden flex flex-col justify-between hover:border-[#2878F0]/40 transition-all shadow-md ${
                    !isAvailable ? "opacity-75" : ""
                  }`}
                >
                  <Link href={`/product/${p.id}`} className="block cursor-pointer flex-1">
                  {/* Product Image & Wishlist Button */}
                  <div className="relative aspect-[3/4] w-full bg-[#1C2430] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                        !isAvailable ? "grayscale" : ""
                      }`}
                      priority={idx < 4}
                    />

                    {/* Badge top-left */}
                    {!isAvailable ? (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-900/90 text-zinc-400 border border-zinc-700">
                        {isUz ? "Tugagan" : "Нет в наличии"}
                      </span>
                    ) : p.badge ? (
                      <span
                        className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                          p.badge === "Yangi" || p.badge === "Новинка"
                            ? "bg-[#16A879] text-white"
                            : "bg-[#E5A850] text-zinc-950"
                        }`}
                      >
                        {p.badge}
                      </span>
                    ) : null}

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(p.id);
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                        isWishlisted
                          ? "bg-[#E5485D] text-white"
                          : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs sm:text-sm text-[#F5F7FA] line-clamp-1 group-hover:text-[#2878F0] transition-colors">
                        {isUz ? p.name : p.nameRu || p.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-sm sm:text-base text-[#F5F7FA]">
                          {formatUzbekCurrency(p.price)}
                        </span>
                        {p.oldPrice && (
                          <span className="text-[10px] sm:text-xs text-[#9AA6B6] line-through">
                            {formatUzbekCurrency(p.oldPrice)}
                          </span>
                        )}
                      </div>

                      {/* Sizes Pill row */}
                      {p.sizes && p.sizes.length > 0 && (
                        <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
                          {p.sizes.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-[#1C2430] border border-[#293241] text-[9px] font-mono text-[#9AA6B6]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                  {/* Add to Cart CTA */}
                  <div className="p-3 sm:p-4 pt-0">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isAvailable) handleAddToCartClick(e, p);
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                        !isAvailable
                          ? "bg-[#1C2430] text-[#9AA6B6] border border-[#293241] cursor-not-allowed"
                          : isJustAdded
                          ? "bg-[#16A879] text-white"
                          : "bg-[#E5A850] hover:bg-[#d69840] text-zinc-950"
                      }`}
                    >
                      {!isAvailable ? (
                        <span>{isUz ? "Sotuvda mavjud emas" : "Нет в наличии"}</span>
                      ) : isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isUz ? "Qo'shildi!" : "Добавлено!"}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isUz ? "Savatga qo'shish" : "В корзину"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite Scroll Continuous Feed Sentinel */}
          {filteredProducts.length > visibleCount ? (
            <div ref={bottomObserverRef} className="py-6 flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#E5A850] border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] font-bold text-[#9AA6B6]">
                {isUz ? "Ko'proq mahsulotlar yuklanmoqda..." : "Загружаем больше товаров..."}
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="py-6 text-center text-xs font-bold text-[#9AA6B6] border-t border-slate-200 dark:border-slate-800 mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {isUz
                  ? `Barcha mahsulotlar ko'rsatildi (${filteredProducts.length} ta)`
                  : `Все товары показаны (${filteredProducts.length})`}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Variation Modal (Size Selector & Color Picker) */}
      <QuickVariationModal
        product={variationProduct}
        lang={lang}
        isOpen={Boolean(variationProduct)}
        onClose={() => setVariationProduct(null)}
        onConfirm={(prod, sz, col, qty) => {
          onAddToCart(prod, sz, col, qty);
          setAddedItemAnim(prod.id);
          setTimeout(() => setAddedItemAnim(null), 1200);
        }}
      />
    </div>
  );
};
