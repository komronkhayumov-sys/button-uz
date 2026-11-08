"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { X, Check, ShoppingBag, Plus, Minus, Sparkles, ShieldCheck } from "lucide-react";
import { Language, Product } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface QuickVariationModalProps {
  product: Product | null;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, size: string, color: string, quantity: number) => void;
}

// Color palette mapping for visual swatch representation
const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  "qora": { bg: "#0f172a", border: "#334155" },
  "black": { bg: "#0f172a", border: "#334155" },
  "ko'k": { bg: "#1e3a8a", border: "#3b82f6" },
  "to'q ko'k": { bg: "#172554", border: "#1d4ed8" },
  "navy": { bg: "#172554", border: "#1d4ed8" },
  "oq": { bg: "#f8fafc", border: "#cbd5e1" },
  "white": { bg: "#f8fafc", border: "#cbd5e1" },
  "moviy": { bg: "#38bdf8", border: "#0284c7" },
  "blue": { bg: "#38bdf8", border: "#0284c7" },
  "kulrang": { bg: "#64748b", border: "#94a3b8" },
  "gray": { bg: "#64748b", border: "#94a3b8" },
  "grafit": { bg: "#334155", border: "#64748b" },
  "qaymoqrang": { bg: "#fef3c7", border: "#fde68a" },
  "cream": { bg: "#fef3c7", border: "#fde68a" },
  "jigarrang": { bg: "#78350f", border: "#b45309" },
  "brown": { bg: "#78350f", border: "#b45309" },
  "zamsh": { bg: "#92400e", border: "#d97706" },
  "yashil": { bg: "#166534", border: "#22c55e" },
  "green": { bg: "#166534", border: "#22c55e" },
  "binafsha": { bg: "#6b21a8", border: "#a855f7" },
};

function getColorStyle(colorName: string): { bg: string; border: string } {
  const lower = colorName.toLowerCase();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return { bg: "#475569", border: "#64748b" };
}

export const QuickVariationModal: React.FC<QuickVariationModalProps> = ({
  product,
  lang,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const isUz = lang === "uz";

  // Derive options
  const availableSizes = useMemo(() => {
    if (!product || !product.sizes || product.sizes.length === 0) {
      return ["M", "L", "XL", "2XL"];
    }
    return product.sizes;
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return ["Asosiy rang"];
    if (product.colors && product.colors.length > 0) return product.colors;

    // Check parenthetical colors in title e.g. "(Ko'k/Qora)" or "(Oq/Moviy)"
    const match = product.name.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const parts = match[1].split(/[\/,]/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts;
    }

    // Category-specific natural default colors
    if (product.category === "shoes") {
      return ["Jigarrang (Brown)", "Qora (Black)"];
    }
    if (product.category === "pants") {
      return ["Qora (Black)", "To'q ko'k (Navy)"];
    }
    if (product.category === "suits") {
      return ["To'q ko'k (Navy)", "Grafit kulrang"];
    }
    return ["Klassik Qora", "To'q Ko'k", "Oq (White)"];
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Sync state whenever product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(availableSizes[0] || "M");
      setSelectedColor(availableColors[0] || "Qora");
      setQuantity(1);
    }
  }, [product, availableSizes, availableColors]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onConfirm(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const totalPrice = (product.price || 0) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Brief Header */}
        <div className="p-5 pb-4 flex gap-4 items-center border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 mb-1">
              {product.category}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {isUz ? product.name : product.nameRu || product.name}
            </h3>
            <p className="font-mono font-black text-base text-violet-700 dark:text-violet-400 mt-0.5">
              {formatUzbekCurrency(product.price)}
            </p>
          </div>
        </div>

        {/* Variation Selectors */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{isUz ? "O'lcham (Size):" : "Размер:"}</span>
                <span className="text-violet-600 dark:text-violet-400 font-bold">{selectedSize}</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {availableSizes.length} {isUz ? "xil o'lcham" : "размеров"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[46px] h-10 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      isSelected
                        ? "bg-violet-700 text-white border-violet-700 shadow-md shadow-violet-700/25 scale-105"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{sz}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{isUz ? "Rang (Color):" : "Цвет:"}</span>
                <span className="text-violet-600 dark:text-violet-400 font-bold">{selectedColor}</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableColors.map((col) => {
                const isSelected = selectedColor === col;
                const style = getColorStyle(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm ring-2 ring-violet-500/40"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                      style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
                    />
                    <span>{col}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Quantity Counter */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {isUz ? "Miqdori:" : "Количество:"}
            </span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                aria-label="Kamaytirish"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono font-black text-xs min-w-[24px] text-center text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                aria-label="Ko'paytirish"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-5 pt-3 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3.5 px-4 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-sm flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-violet-700/25 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>{isUz ? "Savatga qo'shish" : "Добавить в корзину"}</span>
            </div>
            <span className="font-mono font-black">
              {formatUzbekCurrency(totalPrice)}
            </span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            {isUz
              ? "Tanlangan o'lcham va rang buyurtmangizda aniq saqlanadi"
              : "Выбранный размер и цвет будут точно зафиксированы"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickVariationModal;
