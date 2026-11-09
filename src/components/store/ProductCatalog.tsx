"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, X, Plus, Check, Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Language, Product } from "@/types";
import { translations } from "@/lib/i18n";
import { CATEGORIES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";

interface ProductCatalogProps {
  products: Product[];
  lang: Language;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string, color?: string) => void;
}

type SortOption = "featured" | "newest" | "price_asc" | "price_desc";

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  lang,
  onSelectProduct,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [addedItemAnim, setAddedItemAnim] = useState<string | null>(null);

  const t = translations[lang];
  const isUz = lang === "uz";

  const handleAddToCartClick = (e: React.MouseEvent, product: Product, size?: string) => {
    e.stopPropagation();
    if (onAddToCart) {
      const defaultSize = size || product.sizes?.[0] || "M";
      const defaultColor = product.colors?.[0];
      onAddToCart(product, defaultSize, defaultColor);
      setAddedItemAnim(product.id);
      setTimeout(() => setAddedItemAnim(null), 1200);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.nameRu && p.nameRu.toLowerCase().includes(q)) ||
        (p.descriptionRu && p.descriptionRu.toLowerCase().includes(q));

      return matchSearch;
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
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUz ? "Kiyimlarni qidirish (kostyum, kurtka, shim...)" : "Поиск одежды (костюмы, куртки...)"}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-xs font-bold">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 ml-2 mr-1" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-zinc-800 dark:text-zinc-200 py-1.5 pr-2 focus:outline-none cursor-pointer text-xs"
            >
              <option value="featured" className="dark:bg-zinc-900">{isUz ? "Tavsiya etilgan" : "Рекомендуемые"}</option>
              <option value="newest" className="dark:bg-zinc-900">{isUz ? "Yangi kelganlar" : "Новинки"}</option>
              <option value="price_asc" className="dark:bg-zinc-900">{isUz ? "Narx: arzonroq" : "Сначала дешевые"}</option>
              <option value="price_desc" className="dark:bg-zinc-900">{isUz ? "Narx: qimmatroq" : "Сначала дорогие"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pills */}
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
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-black scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? "bg-white/25 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Product List Grid (Responsive: 2 on mobile, 3 on tablet, 4 on desktop) */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            {isUz ? "Mahsulot topilmadi" : "Товар не найден"}
          </p>
          <p className="text-xs max-w-sm mx-auto">
            {isUz
              ? "Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang."
              : "Попробуйте изменить поисковый запрос или выбрать другую категорию."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product, idx) => {
            const productName = !isUz && product.nameRu ? product.nameRu : product.name;
            const isRecentlyAdded = addedItemAnim === product.id;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-blue-500/50 hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/3.8] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={productName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority={idx < 4}
                  />

                  {/* Badge top-left */}
                  {product.badge && (
                    <span
                      className={`absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-sm ${
                        product.badge === "Xit" || product.badge === "Хит"
                          ? "bg-violet-700 text-white font-bold"
                          : product.badge === "Yangi" || product.badge === "Новинка"
                          ? "bg-emerald-500 text-white font-bold"
                          : "bg-rose-500 text-white font-bold"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}

                  {/* Direct Product Page Link top-right */}
                  <Link
                    href={`/product/${product.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:scale-110 transition-all shadow-md cursor-pointer z-10"
                    title={isUz ? "Alohida sahifani ochish" : "Открыть страницу товара"}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-xs font-bold text-white uppercase px-3 py-1 rounded-xl bg-zinc-900/90 border border-white/20">
                        {t.outOfStock}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {productName}
                    </h3>

                    {/* Sizes row */}
                    <div className="flex flex-wrap items-center gap-1">
                      {product.sizes.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                          {s}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          +{product.sizes.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Colors preview if available */}
                    {product.colors && product.colors.length > 0 && (
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        🎨 {product.colors.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-sm sm:text-base text-blue-600 dark:text-blue-400 font-mono">
                        {formatUzbekCurrency(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                          {formatUzbekCurrency(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: 1-Tap Order & Add to Cart */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        disabled={!product.isAvailable}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isUz ? "Xarid qilish" : "Купить"}</span>
                      </button>

                      {onAddToCart && (
                        <button
                          onClick={(e) => handleAddToCartClick(e, product)}
                          disabled={!product.isAvailable}
                          title={isUz ? "Savatga qo'shish" : "В корзину"}
                          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                            isRecentlyAdded
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                              : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                          }`}
                        >
                          {isRecentlyAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
