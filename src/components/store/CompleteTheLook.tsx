"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Plus, Check, ShoppingBag, ArrowRight } from "lucide-react";
import { Language, Product } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface CompleteTheLookProps {
  currentProduct: Product;
  allProducts: Product[];
  lang?: Language;
  onAddToCart?: (product: Product, size: string, color?: string, quantity?: number) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function CompleteTheLook({
  currentProduct,
  allProducts,
  lang = "uz",
  onAddToCart,
  onSelectProduct,
}: CompleteTheLookProps) {
  const isRu = lang === "ru";
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Complementary category mapping
  const complementaryProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const otherProds = allProducts.filter((p) => p.id !== currentProduct.id && p.isAvailable);

    // Pick products from complementary categories
    const recommendations: Product[] = [];

    // Prioritize different categories
    const diffCat = otherProds.filter((p) => p.category !== currentProduct.category);
    if (diffCat.length > 0) {
      recommendations.push(...diffCat.slice(0, 3));
    } else {
      recommendations.push(...otherProds.slice(0, 3));
    }

    return recommendations;
  }, [currentProduct, allProducts]);

  if (complementaryProducts.length === 0) return null;

  const handleAddSingle = (p: Product) => {
    if (onAddToCart) {
      const defaultSize = p.sizes?.[0] || "M";
      const defaultColor = p.colors?.[0] || "";
      onAddToCart(p, defaultSize, defaultColor, 1);
      setAddedItems((prev) => ({ ...prev, [p.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [p.id]: false }));
      }, 2500);
    }
  };

  const handleAddAllBundle = () => {
    complementaryProducts.forEach((p) => {
      if (onAddToCart) {
        onAddToCart(p, p.sizes?.[0] || "M", p.colors?.[0] || "", 1);
      }
    });
    const newAdded: Record<string, boolean> = {};
    complementaryProducts.forEach((p) => {
      newAdded[p.id] = true;
    });
    setAddedItems(newAdded);
    setTimeout(() => setAddedItems({}), 2500);
  };

  const bundleTotal = complementaryProducts.reduce((acc, p) => acc + p.price, currentProduct.price);
  const bundleDiscounted = Math.round(bundleTotal * 0.9); // 10% discount

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#10172d] to-[#181133] border border-blue-500/30 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-violet-700/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm tracking-wide">
              {isRu ? "Завершите образ (Complete the Look)" : "Obrazni To'ldiring (Complete the Look)"}
            </h4>
            <p className="text-[10px] text-zinc-400">
              {isRu ? "Стилисты BUTTON подобрали идеальное сочетание" : "BUTTON stilistlari tanlagan mos to'plam"}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          -10% to'plam
        </span>
      </div>

      {/* Recommended Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {complementaryProducts.map((p) => {
          const isAdded = addedItems[p.id];
          return (
            <div
              key={p.id}
              className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-2 hover:border-blue-500/40 transition-all group"
            >
              <Link
                href={`/product/${p.id}`}
                className="cursor-pointer space-y-1.5 block group"
              >
                <div className="relative aspect-[3/3.5] w-full rounded-xl overflow-hidden bg-zinc-800">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-[11px] truncate text-white group-hover:text-blue-400 transition-colors">
                    {isRu ? p.nameRu || p.name : p.name}
                  </h5>
                  <p className="font-mono font-black text-xs text-blue-400 mt-0.5">
                    {formatUzbekCurrency(p.price)}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleAddSingle(p)}
                className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Qo'shildi!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>+ Savatga</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bundle Add-All button */}
      <button
        type="button"
        onClick={handleAddAllBundle}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>
          {isRu
            ? `Добавить весь образ в корзину (${formatUzbekCurrency(bundleDiscounted)})`
            : `Butun obrazni savatga olish (${formatUzbekCurrency(bundleDiscounted)})`}
        </span>
      </button>
    </div>
  );
}
