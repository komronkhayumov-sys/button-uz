"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  MapPin,
  Clock,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { Customer, CustomerNavSection, Language, StoreSettings } from "@/types";
import { translations } from "@/lib/i18n";

interface CustomerNavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeSection: CustomerNavSection;
  onSectionChange: (section: CustomerNavSection) => void;
  settings?: StoreSettings | null;
  customer?: Customer | null;
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  lang,
  onLanguageChange,
  isDark,
  onToggleTheme,
  activeSection,
  onSectionChange,
  settings,
  customer,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const isUz = lang === "uz";
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global keyboard shortcut: Command/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("customer-global-search");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isKatalogActive =
    activeSection === "katalog" ||
    activeSection === "home" ||
    activeSection === "products";

  return (
    <header className="sticky top-0 z-40 w-full max-w-[100vw] overflow-x-clip backdrop-blur-xl bg-white/95 dark:bg-[#0f172a]/95 border-b border-[#E2E8F0] dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Brand Identity matching user mockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => onSectionChange("katalog")}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left focus:outline-none"
          >
            {/* Dynamic Store Logo from Admin or /btn-logo.png */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden relative shadow-sm shrink-0 border border-slate-200 dark:border-slate-700 bg-black">
              <Image
                src={settings?.storeAvatar || "/btn-logo.png"}
                alt={settings?.storeName || "BUTTON"}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-black text-sm sm:text-lg tracking-tight text-[#0F172A] dark:text-white font-sans">
                  BUTTON
                </span>
                <span className="bg-violet-700 text-white font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
                  MEN
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#64748B] dark:text-slate-400 font-medium leading-none mt-0.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{isUz ? "Hozir ochiq (10:00 – 23:00)" : "Сейчас открыто (10:00 – 23:00)"}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links (Unified, Perfectly Aligned Horizontal Segment) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-xs">
          {/* 1. Katalog */}
          <button
            type="button"
            onClick={() => onSectionChange("katalog")}
            className={`h-9 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
              isKatalogActive
                ? "bg-violet-700 text-white shadow-xs font-black"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{isUz ? "Katalog" : "Каталог"}</span>
          </button>

          {/* 2. Filiallar */}
          <button
            type="button"
            onClick={() => onSectionChange("branches")}
            className={`h-9 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
              activeSection === "branches"
                ? "bg-violet-700 text-white shadow-xs font-black"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{isUz ? "Filiallar" : "Филиалы"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeSection === "branches"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              4
            </span>
          </button>

          {/* 3. AI Stylist */}
          <button
            type="button"
            onClick={() => onSectionChange("ai-mode")}
            className={`h-9 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
              activeSection === "ai-mode"
                ? "bg-violet-700 text-white shadow-xs font-black"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>AI Stylist</span>
          </button>

          {/* 4. Buyurtmalarim */}
          <button
            type="button"
            onClick={() => onSectionChange("orders")}
            className={`h-9 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
              activeSection === "orders"
                ? "bg-violet-700 text-white shadow-xs font-black"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{isUz ? "Buyurtmalarim" : "Мои заказы"}</span>
          </button>

          {/* 5. Profil */}
          <button
            type="button"
            onClick={() => onSectionChange("profile")}
            className={`h-9 px-3 lg:px-3.5 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
              activeSection === "profile"
                ? "bg-violet-700 text-white shadow-xs font-black"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50"
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>{isUz ? "Profil" : "Профиль"}</span>
          </button>
        </nav>

        {/* Right Actions: Search, Wishlist, Cart, Language, Theme, Shield, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Search Field */}
          <div className="hidden lg:flex items-center relative">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border transition-all ${
                isSearchFocused
                  ? "border-[#2563EB] ring-2 ring-blue-100 dark:ring-blue-900/40 w-64"
                  : "border-[#E2E8F0] dark:border-slate-700 w-44 xl:w-52"
              }`}
            >
              <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <input
                id="customer-global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onSearchSubmit) {
                    onSearchSubmit();
                  }
                }}
                placeholder={isUz ? "Qidiruv..." : "Поиск..."}
                className="bg-transparent border-none text-xs text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none w-full"
              />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-mono text-[#94A3B8]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Sevimlilar (Wishlist - Visible on sm and up) */}
          <button
            type="button"
            onClick={onOpenWishlist}
            className="hidden sm:flex relative p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-800 transition-all cursor-pointer"
            title={isUz ? "Sevimlilar" : "Избранное"}
            aria-label="Wishlist"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E5485D] text-white text-[10px] font-black flex items-center justify-center animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Savat (Cart) */}
          <Link
            href="/cart"
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-800 transition-all cursor-pointer shrink-0"
            title={isUz ? "Savat" : "Корзина"}
            aria-label="Cart"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Switcher (UZ / RU Pill matching mockup) */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1e293b] p-0.5 rounded-full border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => onLanguageChange("uz")}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                lang === "uz"
                  ? "bg-[#2563EB] text-white shadow-xs font-black"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ru")}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                lang === "ru"
                  ? "bg-[#2563EB] text-white shadow-xs font-black"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              RU
            </button>
          </div>

          {/* Theme Toggle (Sun/Moon) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
            title={isDark ? "Yorug' rejim (Light mode)" : "Qorong'u rejim (Dark mode)"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-violet-400" /> : <Moon className="w-4 h-4 text-violet-700" />}
          </button>

          {/* Security / Info Shield Icon */}
          <div
            className="hidden sm:flex p-2 rounded-xl text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#1e293b]"
            title="100% Original Mahsulotlar Kafolati"
          >
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          </div>

          {/* Profile Button (Avatar / Circle - Desktop/Tablet only, mobile has it in bottom nav) */}
          <button
            type="button"
            onClick={() => onSectionChange("profile")}
            className={`hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all cursor-pointer border ${
              activeSection === "profile"
                ? "bg-violet-700 border-violet-700 text-white shadow-md shadow-violet-700/30"
                : "bg-white dark:bg-[#1e293b] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
            title={customer?.name ? customer.name : isUz ? "Profil" : "Профиль"}
            aria-label="Profile"
          >
            {customer?.name ? (
              <span className="font-bold text-xs uppercase text-[#0F172A] dark:text-white">
                {customer.name.slice(0, 2)}
              </span>
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
