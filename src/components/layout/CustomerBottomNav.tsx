"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, MapPin, Sparkles, Clock, User } from "lucide-react";
import { CustomerNavSection, Language } from "@/types";

interface CustomerBottomNavProps {
  activeSection: CustomerNavSection;
  onSectionChange: (section: CustomerNavSection) => void;
  lang: Language;
  isHidden?: boolean;
  cartBadgeCount?: number;
}

export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  activeSection,
  onSectionChange,
  lang,
  isHidden = false,
  cartBadgeCount = 0,
}) => {
  const isUz = lang === "uz";
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Detect virtual keyboard opening to avoid obstructing input fields
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHeight = window.innerHeight;
    const handleResize = () => {
      // If window height shrinks by more than 150px, keyboard is active
      if (initialHeight - window.innerHeight > 150) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isHidden || isKeyboardVisible) {
    return null;
  }

  const isKatalogActive =
    activeSection === "katalog" ||
    activeSection === "home" ||
    activeSection === "products";

  const navItems: Array<{
    id: CustomerNavSection;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isActive: boolean;
  }> = [
    {
      id: "katalog",
      label: isUz ? "Katalog" : "Каталог",
      icon: <ShoppingBag className="w-5 h-5 transition-transform" />,
      badge: cartBadgeCount > 0 ? cartBadgeCount : undefined,
      isActive: isKatalogActive,
    },
    {
      id: "branches",
      label: isUz ? "Filiallar" : "Филиалы",
      icon: <MapPin className="w-5 h-5 transition-transform" />,
      badge: 4,
      isActive: activeSection === "branches",
    },
    {
      id: "ai-mode",
      label: "AI Stylist",
      icon: <Sparkles className="w-5 h-5 transition-transform" />,
      isActive: activeSection === "ai-mode",
    },
    {
      id: "orders",
      label: isUz ? "Buyurtmalar" : "Заказы",
      icon: <Clock className="w-5 h-5 transition-transform" />,
      isActive: activeSection === "orders",
    },
    {
      id: "profile",
      label: isUz ? "Profil" : "Профиль",
      icon: <User className="w-5 h-5 transition-transform" />,
      isActive: activeSection === "profile",
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label={isUz ? "Mobil menyu navigatsiyasi" : "Мобильная навигация"}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 max-w-[100vw] overflow-x-clip bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-[#E2E8F0] dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 pb-[max(env(safe-area-inset-bottom),10px)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = item.isActive;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => onSectionChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative py-1 min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#2563EB] focus:outline-none ${
                isActive
                  ? "text-[#0F172A] dark:text-white"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white active:scale-95"
              }`}
            >
              {/* Active glow indicator line at top */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full shadow-[0_0_8px_rgba(109,40,217,0.6)]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <span
                  className={`block transition-all duration-200 ${
                    isActive
                      ? "text-violet-700 dark:text-violet-400 scale-105"
                      : "text-[#64748B] dark:text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-violet-700 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[9.5px] font-medium tracking-tight truncate max-w-[62px] leading-none transition-colors ${
                  isActive
                    ? "text-violet-700 dark:text-white font-bold"
                    : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
