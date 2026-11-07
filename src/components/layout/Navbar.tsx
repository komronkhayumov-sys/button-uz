"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun, ShieldAlert, ShoppingBag, MapPin, LayoutGrid, Package } from "lucide-react";
import { Language, StoreSettings } from "@/types";
import { translations } from "@/lib/i18n";
import { WORKING_HOURS } from "@/constants";

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  settings?: StoreSettings | null;
  activeTab?: "catalog" | "branches" | "orders";
  onTabChange?: (tab: "catalog" | "branches" | "orders") => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  isDark,
  onToggleTheme,
  settings,
  activeTab = "catalog",
  onTabChange,
  cartCount = 0,
  onOpenCart,
}) => {
  const [isOpenNow, setIsOpenNow] = useState(true);
  const t = translations[lang];
  const isUz = lang === "uz";
  const logoSrc = settings?.storeAvatar || "/btn-logo.png";

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const tashkentHour = (utcHour + 5) % 24;
      setIsOpenNow(tashkentHour >= WORKING_HOURS.startHour && tashkentHour < WORKING_HOURS.endHour);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#090d16]/95 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-blue-600/25 shrink-0 border border-blue-400/20 bg-zinc-900 relative">
            <Image src={logoSrc} alt={settings?.storeName || "BUTTON"} fill className="object-cover" unoptimized priority />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-wider text-zinc-950 dark:text-zinc-50 uppercase font-sans">
                {settings?.storeName ? settings.storeName.split(" ")[0] : "BUTTON"}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
                MEN
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                }`}
              />
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {isOpenNow ? t.storeStatusOpen : t.storeStatusClosed}
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => onTabChange("catalog")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "catalog"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isUz ? "Katalog" : "Каталог"}</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("branches")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "branches"
                  ? "bg-blue-600 text-white shadow-sm font-black"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isUz ? "Filiallar" : "Филиалы"}</span>
            </button>

            <Link
              href="/orders"
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isUz ? "Buyurtmalarim" : "Мои заказы"}</span>
            </Link>
          </nav>
        )}

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Desktop Cart Button */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Savat"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{isUz ? "Savat" : "Корзина"}</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold">
            <button
              onClick={() => onLanguageChange("uz")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                lang === "uz"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => onLanguageChange("ru")}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                lang === "ru"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              RU
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-violet-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            title="Admin Panel"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
