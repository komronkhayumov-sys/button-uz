"use client";

import React from "react";
import Image from "next/image";
import { Phone, Send, QrCode, ChevronRight, User, Sparkles, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { Customer, Language, StoreSettings } from "@/types";
import { translations } from "@/lib/i18n";
import { DEFAULT_SETTINGS } from "@/constants";

interface StoreHeroProps {
  lang: Language;
  settings?: StoreSettings | null;
  customer: Customer | null;
  onOpenWifiModal: () => void;
  onOpenPhoneModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAiOutfitModal: () => void;
  onViewCatalog: () => void;
}

export const StoreHero: React.FC<StoreHeroProps> = ({
  lang,
  settings,
  customer,
  onOpenWifiModal,
  onOpenPhoneModal,
  onOpenProfileModal,
  onOpenAiOutfitModal,
  onViewCatalog,
}) => {
  const t = translations[lang];
  const isUz = lang === "uz";

  const currentSettings = settings || DEFAULT_SETTINGS;
  const instagramUrl = currentSettings.instagramUrl || "https://www.instagram.com/button_uz/";
  const telegramUrl = currentSettings.telegramUrl || "https://t.me/button_uz";

  return (
    <div className="w-full space-y-4 pt-1">
      {/* 1. Hero Showcase Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-100/90 via-indigo-50/70 to-blue-50/90 dark:from-blue-950/40 dark:via-zinc-900/90 dark:to-slate-900/90 border border-blue-200/80 dark:border-blue-900/40 p-5 sm:p-7 md:p-8 overflow-hidden shadow-xs flex items-center justify-between gap-4">
        {/* Soft background glow circles */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-2xl pointer-events-none" />

        {/* Left Content */}
        <div className="relative z-10 max-w-sm sm:max-w-md space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kuz-Qish Kolleksiyasi 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 dark:text-white leading-tight tracking-tight">
            {isUz ? (
              <>
                Klassik va zamonaviy <br />
                <span className="text-blue-600 dark:text-blue-400">erkaklar kiyimlari</span>
              </>
            ) : (
              <>
                Классическая и стильная <br />
                <span className="text-blue-600 dark:text-blue-400">мужская одежда</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {isUz
              ? "Toshkentdagi 4 ta showroom yoki butun O'zbekiston bo'ylab tezkor yetkazib berish xizmati bilan."
              : "4 шоурума в Ташкенте или быстрая доставка по всему Узбекистану."}
          </p>

          <div className="pt-2 sm:pt-3 flex items-center gap-3">
            <button
              onClick={onViewCatalog}
              className="px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
            >
              <span>{isUz ? "Katalogni ko'rish" : "Смотреть каталог"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Model Photo */}
        <div className="relative z-10 w-28 sm:w-44 md:w-52 aspect-[3/4] shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border-2 border-white/80 dark:border-zinc-800">
          <Image
            src={currentSettings.storeHeroBanner || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"}
            alt="BUTTON Men's Model"
            fill
            className="object-cover object-top hover:scale-105 transition-transform duration-700"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* 2. Quick Action Grid (4 Buttons) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Quick Call */}
        <button
          onClick={onOpenPhoneModal}
          className="flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-500/50 hover:shadow-sm transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {t.quickCall}
          </span>
        </button>

        {/* Instagram */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-pink-500/50 hover:shadow-sm transition-all group active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <InstagramIcon className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {t.instagram}
          </span>
        </a>

        {/* Telegram */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-sky-500/50 hover:shadow-sm transition-all group active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Send className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {t.telegram}
          </span>
        </a>

        {/* Wi-Fi & QR */}
        <button
          onClick={onOpenWifiModal}
          className="flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-500/50 hover:shadow-sm transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {t.wifiHelper}
          </span>
        </button>
      </div>

      {/* 3. Side-by-side on desktop: Profile Card + AI Stilist Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Profile Card */}
        <button
          onClick={onOpenProfileModal}
          className="w-full p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-500/40 hover:shadow-sm flex items-center justify-between transition-all cursor-pointer group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                {customer ? `${customer.name}` : isUz ? "Mening Profilim" : "Мой Профиль"}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {customer
                  ? `${customer.phone} • ${customer.ordersCount} ta buyurtma`
                  : isUz
                  ? "Shaxsiy ma'lumotlar va o'lchamlar"
                  : "Личные данные и размеры"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* AI Stilist Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-100/90 via-indigo-50/70 to-blue-50/90 dark:from-blue-950/30 dark:via-zinc-900 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/40 p-4 sm:p-5 overflow-hidden flex items-center justify-between shadow-xs">
          <div className="relative z-10 max-w-[65%] space-y-1">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-black text-sm text-zinc-950 dark:text-white">
                AI Stilist & Obrazlar
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
              {isUz
                ? "Bir-biriga mos kiyimlar kombinatsiyasi"
                : "Готовые стильные комбинации одежды"}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAiOutfitModal}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
              >
                <span>{isUz ? "Kombinatsiyalarni ko'rish" : "Посмотреть"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Garments illustration */}
          <div className="relative z-10 w-24 h-20 shrink-0 flex items-center justify-center">
            <div className="relative flex items-center gap-1">
              <div className="w-11 h-14 rounded-xl bg-zinc-900 border border-blue-500/40 shadow-lg overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80"
                  alt="Suit"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="w-9 h-12 rounded-xl bg-zinc-900 border border-blue-500/40 shadow-lg overflow-hidden relative -ml-3 mt-3">
                <Image
                  src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=200&q=80"
                  alt="Pants"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
