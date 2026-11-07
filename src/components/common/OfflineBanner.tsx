"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Language } from "@/types";

interface OfflineBannerProps {
  lang: Language;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ lang }) => {
  const [isOffline, setIsOffline] = useState(false);
  const isUz = lang === "uz";

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#E5485D] text-white px-4 py-2.5 text-xs font-bold shadow-lg animate-slide-down flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            {isUz
              ? "Internet aloqasi uzildi. Ba'zi ma'lumotlar keshdan ko'rsatilmoqda."
              : "Отсутствует подключение к интернету. Данные загружаются из кеша."}
          </span>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isUz ? "Yangilash" : "Обновить"}</span>
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
