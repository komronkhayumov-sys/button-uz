"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  ExternalLink,
  MoreVertical,
  Sparkles,
  Check,
  Copy,
  Laptop,
} from "lucide-react";
import { Language } from "@/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallPromptProps {
  lang?: Language;
  target?: "store" | "admin";
}

export default function PwaInstallPrompt({
  lang = "uz",
  target = "store",
}: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<"android" | "ios" | "desktop">("android");

  const isRu = lang === "ru";
  const isAdmin = target === "admin";

  // Keep promptRef in sync with state
  useEffect(() => {
    promptRef.current = deferredPrompt;
  }, [deferredPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone PWA mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standalone) {
      setIsStandaloneApp(true);
      return;
    }

    // 2. Detect device and browser environment
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    const inApp = /telegram|instagram|fbav|line|whatsapp|micromessenger/i.test(ua);
    const desktopDevice = !iosDevice && !androidDevice;

    setIsIos(iosDevice);
    setIsAndroid(androidDevice);
    setIsInAppBrowser(inApp);
    setIsDesktop(desktopDevice);

    if (iosDevice) {
      setActivePlatformTab("ios");
    } else if (desktopDevice) {
      setActivePlatformTab("desktop");
    } else {
      setActivePlatformTab("android");
    }

    // 3. Check for pre-captured global prompt from ServiceWorkerRegister
    if (window.__deferredInstallPrompt) {
      setDeferredPrompt(window.__deferredInstallPrompt);
      promptRef.current = window.__deferredInstallPrompt;
      setShowPrompt(true);
    }

    // 4. Android / Chrome PWA install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const pEvent = e as BeforeInstallPromptEvent;
      window.__deferredInstallPrompt = pEvent;
      setDeferredPrompt(pEvent);
      promptRef.current = pEvent;
      setShowPrompt(true);
    };

    const handlePromptReady = () => {
      if (window.__deferredInstallPrompt) {
        setDeferredPrompt(window.__deferredInstallPrompt);
        promptRef.current = window.__deferredInstallPrompt;
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-prompt-ready", handlePromptReady);

    // 5. Custom global trigger listener (from anywhere in the app)
    const handleGlobalTrigger = () => {
      setShowPrompt(true);
      setIsMinimized(false);
      triggerInstallFlow();
    };

    window.addEventListener("open-pwa-install", handleGlobalTrigger);

    // 6. Show initial recommendation banner if not in standalone (fast 400ms response)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 400);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-prompt-ready", handlePromptReady);
      window.removeEventListener("open-pwa-install", handleGlobalTrigger);
      clearTimeout(timer);
    };
  }, [target]);

  const triggerInstallFlow = async () => {
    // Check local state or global window reference
    const p = promptRef.current || (typeof window !== "undefined" ? window.__deferredInstallPrompt : null);

    if (p) {
      try {
        await p.prompt();
        const choice = await p.userChoice;
        if (choice.outcome === "accepted") {
          setShowPrompt(false);
          setIsMinimized(false);
          setShowGuideModal(false);
          if (typeof window !== "undefined") {
            window.__deferredInstallPrompt = null;
          }
          setDeferredPrompt(null);
          promptRef.current = null;
          return;
        }
      } catch (err) {
        console.warn("[pwa] Native prompt error:", err);
      }
    }

    // If native prompt wasn't available or was already prompted, show the comprehensive guide modal
    setShowGuideModal(true);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If already opened inside installed app or dismissed by user in this session, don't show prompts
  if (isStandaloneApp || isDismissed) return null;

  return (
    <>
      {/* 1. Minimized Floating Quick Install Badge */}
      {showPrompt && isMinimized && (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            triggerInstallFlow();
          }}
          className="fixed top-3 left-3 md:top-auto md:bottom-8 md:left-8 z-50 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-400/40 animate-scale-in cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0 border border-white/40">
            <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" unoptimized />
          </div>
          <span>
            {isAdmin
              ? isRu ? "📲 Установить Admin App" : "📲 Admin ilovasini o'rnatish"
              : isRu ? "📲 Установить приложение" : "📲 Ilovani o'rnatish"}
          </span>
          <Download className="w-3.5 h-3.5 animate-bounce" />
        </button>
      )}

      {/* 2. Floating Recommendation Banner (Top on mobile so it never collides with bottom nav/cart; bottom-left on desktop) */}
      {showPrompt && !isMinimized && (
        <div className="fixed top-3 left-3 right-3 sm:left-6 sm:right-auto sm:w-[390px] md:top-auto md:bottom-8 md:left-8 z-50 animate-fade-in">
          <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/98 backdrop-blur-xl border border-blue-500/40 text-white shadow-2xl flex items-center justify-between gap-3 ring-1 ring-blue-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden relative shrink-0 border border-blue-400/50 shadow-md bg-black">
                <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" priority unoptimized />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 truncate">
                  <span>{isAdmin ? "BUTTON Admin App" : "BUTTON Men's Wear"}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    APP
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-300 truncate">
                  {isAdmin
                    ? isRu
                      ? "Установите приложение для управления магазином"
                      : "Buyurtmalarni tezkor boshqarish uchun ilovani o'rnating"
                    : isRu
                    ? "Установите приложение — быстрый доступ в 1 клик"
                    : "Ilovani o'rnating — 1 bosishda tezkor xarid"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={triggerInstallFlow}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/30 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRu ? "Установить" : "O'rnatish"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDismissed(true);
                  setShowPrompt(false);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isRu ? "Закрыть" : "Yopish"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Universal Device Installation Guide Modal (Always Top Z-Index) */}
      {showGuideModal && (
        <div
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-blue-500/40 p-5 sm:p-6 text-white space-y-4 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {isAdmin
                      ? isRu ? "Установка BUTTON Admin" : "BUTTON Admin ilovasini o'rnatish"
                      : isRu ? "Установка BUTTON Men's Wear" : "BUTTON ilovasini o'rnatish"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {isRu ? "Добавление на рабочий стол телефона" : "Bosh ekranga ilova sifatida o'rnatish"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-App Browser Warning (Telegram / Instagram) */}
            {isInAppBrowser && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ExternalLink className="w-4 h-4" />
                  {isRu ? "Вы открыли в Telegram / Instagram" : "Siz Telegram yoki Instagram ichki brauzeridasiz"}
                </span>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {isRu
                    ? "Telegram / Instagram ichki brauzerida ilova o'rnatish cheklangan. Havolani Chrome yoki Safari brauzerida oching:"
                    : "Ilovani o'rnatish uchun ushbu havolani Chrome yoki Safari brauzerida ochish kerak:"}
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (isRu ? "Ссылка скопирована!" : "Havola nusxalandi!") : (isRu ? "Скопировать ссылку" : "Havolani nusxalash")}</span>
                </button>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePlatformTab("android")}
                className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activePlatformTab === "android"
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatformTab("ios")}
                className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activePlatformTab === "ios"
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iOS</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatformTab("desktop")}
                className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activePlatformTab === "desktop"
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Kompyuter</span>
              </button>
            </div>

            {/* Platform Instructions */}
            {activePlatformTab === "android" && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1-qadam (Шаг 1):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Нажмите на меню Chrome (три точки ⋮ в правом верхнем углу)"
                        : "Chrome brauzerining yuqori o'ng burchagidagi uch nuqta (⋮) belgisini bosing"}
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
                        ? "Выберите пункт «Установить приложение» или «Добавить на главный экран»"
                        : "Menyudan «Ilovani o'rnatish» (yoki «Bosh ekranga qo'shish») bandini tanlang"}
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
                        ? "Подтвердите «Установить». Иконка появится на рабочем столе!"
                        : "«O'rnatish» tugmasini bosing. Ilova tayyor bo'ladi!"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activePlatformTab === "ios" && (
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
                        : "Pastga surib «Bosh ekranga qo'shish» (Add to Home Screen) bandini tanlang"}
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
            )}

            {activePlatformTab === "desktop" && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1-qadam (Шаг 1):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "В адресной строке Chrome/Edge справа нажмите иконку «Установить приложение»"
                        : "Brauzer manzil qatori (URL bar) o'ng tomonidagi «Ilovani o'rnatish» belgisini bosing"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2-qadam (Шаг 2):</span>
                    <span className="text-zinc-300 text-[11px]">
                      {isRu
                        ? "Подтвердите «Установить». Приложение откроется в отдельном окне!"
                        : "«O'rnatish» tugmasini bosing. Panel alohida dastur oynasida ochiladi!"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Native Install Retry Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={triggerInstallFlow}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isAdmin
                    ? isRu ? "Попробовать прямую установку" : "To'g'ridan-to'g'ri o'rnatish"
                    : isRu ? "Установить приложение" : "Ilovani o'rnatish"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {isRu ? "Закрыть" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
