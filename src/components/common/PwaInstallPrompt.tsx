"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone } from "lucide-react";
import { Language } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallPromptProps {
  lang?: Language;
  target?: "store" | "admin";
}

export default function PwaInstallPrompt({ lang = "uz", target = "store" }: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const isRu = lang === "ru";

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check dismissed
    const dismissedKey = target === "admin" ? "btn_pwa_admin_dismissed" : "btn_pwa_dismissed";
    const isDismissed = localStorage.getItem(dismissedKey);
    if (isDismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|optios|ucbrowser/.test(userAgent);

    if (iosDevice && isSafari) {
      setIsIos(true);
      // Small delay before showing prompt
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome / Desktop PWA
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [target]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const dismissedKey = target === "admin" ? "btn_pwa_admin_dismissed" : "btn_pwa_dismissed";
    localStorage.setItem(dismissedKey, "true");
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Install Banner */}
      <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-left">
        <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-slate-900/95 to-[#150f28]/95 backdrop-blur-xl border border-blue-500/30 text-white shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl overflow-hidden relative shrink-0 border border-blue-400/40 shadow-md">
              <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" priority unoptimized />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 truncate">
                <span>{target === "admin" ? "BUTTON Admin App" : "BUTTON Men's Wear"}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400">
                  PWA
                </span>
              </h4>
              <p className="text-[10px] text-zinc-300 truncate">
                {isRu
                  ? "Установите приложение на телефон"
                  : "Ilovani telefoningizga o'rnating"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRu ? "Установить" : "O'rnatish"}</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div
          onClick={() => setShowIosGuide(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0f172a] border border-blue-500/30 p-5 text-white space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {isRu ? "Установка на iPhone / iPad" : "iPhone / iPad ga o'rnatish"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">1-qadam:</span>
                  <span className="text-zinc-300 text-[11px]">
                    {isRu
                      ? "В Safari нажмите кнопку «Поделиться» (иконка со стрелкой вверх внизу экрана)"
                      : "Safari brauzerining pastki qismidagi «Ulashish» (strelkali kvadrat) tugmasini bosing"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">2-qadam:</span>
                  <span className="text-zinc-300 text-[11px]">
                    {isRu
                      ? "Прокрутите вниз и выберите «На экран «Домой»"
                      : "Menyuni pastga suring va «Bosh ekranga qo'shish» (Add to Home Screen) bandini tanlang"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
            >
              {isRu ? "Понятно" : "Tushundim"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
