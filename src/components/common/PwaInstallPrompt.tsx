"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone, ExternalLink, MoreVertical, Sparkles } from "lucide-react";
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const isRu = lang === "ru";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone PWA mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://") ||
      window.location.search.includes("mode=pwa");

    if (standalone) {
      setIsStandaloneApp(true);
      return;
    }

    // 2. Detect device and browser environment
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    const inApp = /telegram|instagram|fbav|line|whatsapp|micromessenger/i.test(ua);

    setIsIos(iosDevice);
    setIsAndroid(androidDevice);
    setIsInAppBrowser(inApp);

    // 3. Android / Chrome PWA install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Custom global trigger listener
    const handleGlobalTrigger = () => {
      setShowPrompt(true);
      setIsMinimized(false);
      handleInstallClick();
    };

    window.addEventListener("open-pwa-install", handleGlobalTrigger);

    // 5. Always display install recommendation after brief delay if not in standalone
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-pwa-install", handleGlobalTrigger);
      clearTimeout(timer);
    };
  }, [target]);

  const handleInstallClick = async () => {
    // If native prompt is available (Android Chrome)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setShowPrompt(false);
          setIsMinimized(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.warn("[pwa] Native prompt error:", err);
      }
    }

    // Otherwise show tailored visual instructions
    setShowGuideModal(true);
  };

  const handleDismiss = () => {
    // Minimize to floating quick-install badge (persists until user actually installs)
    setIsMinimized(true);
  };

  // If already opened inside installed app, don't show prompts
  if (isStandaloneApp) return null;

  return (
    <>
      {/* 1. Minimized Floating Install Badge (Shown if user clicks X) */}
      {showPrompt && isMinimized && (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            handleInstallClick();
          }}
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-400/40 animate-scale-in cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0 border border-white/40">
            <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" unoptimized />
          </div>
          <span>
            {target === "admin"
              ? isRu ? "📲 Установить Admin App" : "📲 Admin ilovasini o'rnatish"
              : isRu ? "📲 Установить приложение" : "📲 Ilovani o'rnatish"}
          </span>
          <Download className="w-3.5 h-3.5 animate-bounce" />
        </button>
      )}

      {/* 2. Full Floating Install Recommendation Card */}
      {showPrompt && !isMinimized && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[410px] z-50 animate-slide-left">
          <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-slate-900/98 via-[#0f172a]/98 to-[#170e2b]/98 backdrop-blur-xl border border-blue-500/40 text-white shadow-2xl flex items-center justify-between gap-3 ring-1 ring-blue-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden relative shrink-0 border border-blue-400/50 shadow-md bg-black">
                <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" priority unoptimized />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 truncate">
                  <span>{target === "admin" ? "BUTTON Admin App" : "BUTTON Men's Wear"}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    APP
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-300 truncate">
                  {target === "admin"
                    ? isRu
                      ? "Установите приложение для управления заказами"
                      : "Buyurtmalarni boshqarish uchun ilovani o'rnating"
                    : isRu
                    ? "Установите приложение — быстрый доступ в 1 клик"
                    : "Ilovani o'rnating — 1 bosishda tezkor xarid"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/30 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRu ? "Установить" : "O'rnatish"}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isRu ? "Свернуть" : "Kichraytirish"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Universal Device Installation Guide Modal */}
      {showGuideModal && (
        <div
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0f172a] border border-blue-500/40 p-5 text-white space-y-4 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {target === "admin"
                      ? isRu ? "Установка BUTTON Admin" : "BUTTON Admin ilovasini o'rnatish"
                      : isRu ? "Установка BUTTON Men's Wear" : "BUTTON ilovasini o'rnatish"}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {isRu ? "Добавление на главный экран" : "Bosh ekranga ilova sifatida qo'shish"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-App Browser Warning (Telegram / Instagram) */}
            {isInAppBrowser && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isRu ? "Вы открыли в Telegram / Instagram" : "Siz Telegram / Instagram ichki brauzeridasiz"}
                </span>
                <p className="text-[11px] text-zinc-300">
                  {isRu
                    ? "Нажмите ⋮ (меню) в правом верхнем углу и выберите «Открыть в браузере» (Chrome / Safari), чтобы установить приложение."
                    : "Ilovani o'rnatish uchun yuqoridagi ⋮ uch nuqtani bosib, «Brauzerda ochish» (Chrome yoki Safari) ni tanlang."}
                </p>
              </div>
            )}

            {/* Instructions: iOS Steps */}
            {isIos ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1-qadam (Шаг 1):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "В Safari нажмите кнопку «Поделиться» (иконка со стрелкой вверх внизу экрана)"
                        : "Safari brauzerining pastki qismidagi «Ulashish» (strelkali kvadrat) tugmasini bosing"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2-qadam (Шаг 2):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Прокрутите вниз и выберите «На экран «Домой» (Add to Home Screen)"
                        : "Pastga suring va «Bosh ekranga qo'shish» (Add to Home Screen) bandini tanlang"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">3-qadam (Шаг 3):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Нажмите «Добавить» в правом верхнем углу. Готово!"
                        : "Yuqoridagi «Qo'shish» (Add) tugmasini bosing. Ilova tayyor!"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Instructions: Android / Chrome / Desktop Steps */
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1-qadam (Шаг 1):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Нажмите на меню браузера (три точки ⋮ в правом верхнем углу)"
                        : "Brauzerning yuqori o'ng burchagidagi uch nuqta (⋮) tugmasini bosing"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2-qadam (Шаг 2):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Выберите «Установить приложение» или «Добавить на главный экран»"
                        : "«Ilovani o'rnatish» yoki «Bosh ekranga qo'shish» bandini tanlang"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">3-qadam (Шаг 3):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Подтвердите установку. Иконка появится на вашем рабочем столе!"
                        : "«O'rnatish» tugmasini bosing. Ilova telefoningizga o'rnatiladi!"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Close */}
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {isRu ? "Понятно, закрыть" : "Tushundim, yopish"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
