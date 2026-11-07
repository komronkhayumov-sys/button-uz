"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Sparkles, ShoppingBag, Check, ArrowRight, Wand2, Star, Layers } from "lucide-react";
import { Language, Product } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface AiOutfitModalProps {
  isOpen: boolean;
  products: Product[];
  lang: Language;
  onOrderOutfit: (products: Product[], totalAmount: number, comboTitle: string) => void;
  onClose: () => void;
}

export const AiOutfitModal: React.FC<AiOutfitModalProps> = ({
  isOpen,
  products,
  lang,
  onOrderOutfit,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"curated" | "custom">("curated");
  const [selectedTopId, setSelectedTopId] = useState<string>(products[0]?.id || "");
  const isUz = lang === "uz";

  if (!isOpen) return null;

  // Build Curated Looks dynamically from stock
  const suit = products.find((p) => p.category === "suits") || products[0];
  const bomber = products.find((p) => p.category === "jackets") || products[1];
  const hoodie = products.find((p) => p.category === "hoodies") || products[2];
  const coat = products.find((p) => p.id === "btn-004") || products[3];
  const polo = products.find((p) => p.category === "polos") || products[4];
  const pants = products.find((p) => p.category === "pants") || products[5];
  const shoes = products.find((p) => p.category === "shoes") || products[6];
  const belt = products.find((p) => p.category === "accessories") || products[7];

  const curatedLooks = [
    {
      id: "look-classic",
      badge: isUz ? "Biznes Klassika" : "Бизнес Классика",
      title: isUz ? "Premium Biznes & Rasmiy Obraz" : "Премиум Деловой Образ",
      desc: isUz
        ? "Muhim uchrashuvlar, to'y va rasmiy marosimlar uchun mukammal moslangan to'plam."
        : "Идеальный костюм-двойка с классическими туфлями и ремнем.",
      items: [suit, shoes, belt].filter(Boolean),
      discountPercent: 10,
    },
    {
      id: "look-street",
      badge: isUz ? "Streetwear" : "Уличный Стиль",
      title: isUz ? "Urban Streetwear Qulay To'plam" : "Городской Стиль Streetwear",
      desc: isUz
        ? "Har kungi qulaylik, do'stlar davrasi va shahar bo'ylab sayr uchun zamonaviy uslub."
        : "Плотный оверсайз худи, стильный бомбер и удобные чиносы.",
      items: [bomber, hoodie, pants].filter(Boolean),
      discountPercent: 8,
    },
    {
      id: "look-smart",
      badge: isUz ? "Smart Casual" : "Смарт Кэжуал",
      title: isUz ? "Smart Casual & Palto To'plami" : "Образ с Пальто Smart Casual",
      desc: isUz
        ? "Nafis kashmir palto, nafas oluvchi polo va kundalik qulay shim kombinatsiyasi."
        : "Кашемировое пальто, поло пике и брюки чинос.",
      items: [coat, polo, pants].filter(Boolean),
      discountPercent: 12,
    },
  ];

  // Custom Mix & Match logic
  const selectedTop = products.find((p) => p.id === selectedTopId) || products[0];
  let recommendedBottom = pants;
  let recommendedShoe = shoes;

  if (selectedTop?.category === "suits") {
    recommendedBottom = pants;
    recommendedShoe = shoes;
  } else if (selectedTop?.category === "hoodies") {
    recommendedBottom = pants;
    recommendedShoe = shoes;
  }

  const customLookItems = [selectedTop, recommendedBottom, recommendedShoe].filter(Boolean);
  const customOriginalTotal = customLookItems.reduce((acc, p) => acc + p.price, 0);
  const customComboPrice = Math.round((customOriginalTotal * 0.9) / 1000) * 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-h-[92vh] overflow-y-auto space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 border border-purple-500/20 shadow-xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
            <span>AI Stilist & Kiyim Kombinatsiyalari</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-sm mx-auto">
            {isUz
              ? "Qaysi kiyim qaysi shim yoki poyabzal bilan yarashishini o'ylab o'tirmang! AI sizga tayyor mukammal obrazlarni tavsiya qiladi."
              : "Готовые стильные комбинации от AI стилиста. Экономьте время и покупайте полный стильный образ в 1 клик."}
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab("curated")}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "curated"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>{isUz ? "Tayyor Obrazlar" : "Готовые Образы"}</span>
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isUz ? "O'z Obrazingizni Yaratish" : "Собрать Образ"}</span>
          </button>
        </div>

        {/* TAB 1: CURATED OUTFITS */}
        {activeTab === "curated" && (
          <div className="space-y-4">
            {curatedLooks.map((look) => {
              const origTotal = look.items.reduce((acc, it) => acc + (it?.price || 0), 0);
              const comboTotal = Math.round((origTotal * (1 - look.discountPercent / 100)) / 1000) * 1000;

              return (
                <div
                  key={look.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3 hover:border-purple-500/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                      {look.badge}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      -{look.discountPercent}% Combo Chegirma
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {look.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      {look.desc}
                    </p>
                  </div>

                  {/* Garments items row */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    {look.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-center space-y-1"
                      >
                        <div className="relative aspect-square w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-1">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="block text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-mono">
                          {formatUzbekCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & 1-Click order */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                          {formatUzbekCurrency(comboTotal)}
                        </span>
                        <span className="text-xs text-zinc-400 line-through">
                          {formatUzbekCurrency(origTotal)}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        To'plamdagi 3 ta mahsulot uchun narx
                      </span>
                    </div>

                    <button
                      onClick={() => onOrderOutfit(look.items, comboTotal, look.title)}
                      className="py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isUz ? "To'plamni olish" : "Купить образ"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CUSTOM MIX & MATCH */}
        {activeTab === "custom" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {isUz ? "1. Asosiy kiyimni tanlang:" : "1. Выберите верхнюю одежду:"}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {products
                  .filter((p) => ["suits", "jackets", "hoodies", "polos"].includes(p.category))
                  .map((p) => {
                    const isSelected = selectedTopId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedTopId(p.id)}
                        className={`p-2 rounded-2xl border text-center shrink-0 w-28 space-y-1 transition-all cursor-pointer ${
                          isSelected
                            ? "border-purple-600 bg-purple-600/10 text-purple-600 shadow-sm"
                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600"
                        }`}
                      >
                        <div className="relative aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                        </div>
                        <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </span>
                        <span className="block text-[10px] font-mono text-purple-500 font-bold">
                          {formatUzbekCurrency(p.price)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* AI Generated Recommendation */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Stilist moslashtirgan kiyimlar:</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {customLookItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-1"
                  >
                    <span className="block text-[9px] font-bold text-purple-500 uppercase">
                      {idx === 0 ? "Yuqori kiyim" : idx === 1 ? "Mos shim" : "Poyabzal"}
                    </span>
                    <div className="relative aspect-square w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <span className="block text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-purple-800/40">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Kombinatsiya narxi (-10% chegirma):</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
                      {formatUzbekCurrency(customComboPrice)}
                    </span>
                    <span className="text-xs text-zinc-400 line-through">
                      {formatUzbekCurrency(customOriginalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onOrderOutfit(
                      customLookItems,
                      customComboPrice,
                      `Maxsus AI Kombinatsiya (${selectedTop.name})`
                    )
                  }
                  className="py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isUz ? "To'plamni buyurtma qilish" : "Купить образ"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
