"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  Check,
  Copy,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Flame,
  Shirt,
  MapPin,
  Clock,
  Truck,
  CreditCard,
  Ruler,
} from "lucide-react";
import { Language, Product, StoreSettings } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface AiModeSectionProps {
  products: Product[];
  lang: Language;
  settings?: StoreSettings | null;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onOrderOutfit?: (comboItems: Product[], totalAmount: number, comboTitle: string) => void;
  onNavigateToProfile?: () => void;
  onNavigateToProducts?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  recommendedProductIds?: string[];
}

export const AiModeSection: React.FC<AiModeSectionProps> = ({
  products,
  lang,
  settings,
  onAddToCart,
  onSelectProduct,
  onNavigateToProducts,
}) => {
  const isUz = lang === "uz";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialGreetingUz =
    `Assalomu alaykum! Men **BUTTON Men's Wear** shaxsiy AI stilisti va do'kon maslahatchisiman 👔\n\n` +
    `Mendan quyidagi barcha masalalar bo'yicha erkin so'rashingiz mumkin:\n` +
    `• 🤵 **Kiyinish uslubi va obrazlar:** To'y, tantana, ofis, romantik uchrashuv yoki kundalik kiyinish bo'yicha maslahat\n` +
    `• 🎨 **Ranglar uyg'unligi:** Shim, ko'ylak, kurtka va poyabzallarni bir-biriga moslash\n` +
    `• 📏 **O'lcham hisoblash:** Bo'yingiz (sm) va vazningizni (kg) aytsangiz, aniq razmerni aytib beraman\n` +
    `• 📍 **Do'konimiz ma'lumotlari:** Filiallarimiz manzili, ish vaqti, dostavka va to'lov turlari\n\n` +
    `Sizga qanday kiyim yoki maslahat kerak? Quyidagi tayyor savollardan birini tanlashingiz yoki o'zingiz yozishingiz mumkin!`;

  const initialGreetingRu =
    `Здравствуйте! Я персональный AI-стилист и консультант **BUTTON Men's Wear** 👔\n\n` +
    `Вы можете задать мне любые вопросы:\n` +
    `• 🤵 **Стиль и готовые образы:** Подбор одежды на свадьбу, в офис, на свидание или на каждый день\n` +
    `• 🎨 **Цветовые сочетания:** Гармония верха, низа, обуви и аксессуаров\n` +
    `• 📏 **Подбор размера:** Назовите ваш рост (см) и вес (кг), и я мгновенно рассчитаю точный размер\n` +
    `• 📍 **Информация о магазине:** Адреса филиалов, график работы, доставка и способы оплаты\n\n` +
    `Чем могу помочь? Выберите готовый вопрос ниже или напишите свой!`;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg-init",
        sender: "bot",
        text: isUz ? initialGreetingUz : initialGreetingRu,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping]);

  // Quick prompt presets
  const quickPrompts = [
    {
      emoji: "🤵",
      titleUz: "To'y & tantanaga qanday kiyinsam bo'ladi?",
      titleRu: "Что надеть на свадьбу или торжество?",
    },
    {
      emoji: "💼",
      titleUz: "Biznes & ofis uchun qanday look mos?",
      titleRu: "Деловой образ в офис и на переговоры",
    },
    {
      emoji: "☕",
      titleUz: "Romantik uchrashuvga qanday obraz tanlash kerak?",
      titleRu: "Образ для свидания и ужина",
    },
    {
      emoji: "🏙️",
      titleUz: "Kundalik qulay kiyimlar to'plami",
      titleRu: "Удобный повседневный стиль (Casual)",
    },
    {
      emoji: "🍂",
      titleUz: "Bahorgi va kuzgi kurtkalar tavsiyasi",
      titleRu: "Весенние и осенние куртки и бомберы",
    },
    {
      emoji: "📏",
      titleUz: "Bo'yim 178 sm, vaznim 75 kg. Qaysi o'lcham?",
      titleRu: "Рост 178 см, вес 75 кг. Какой размер?",
    },
    {
      emoji: "📍",
      titleUz: "Toshkentdagi filiallar manzillari va ish vaqti?",
      titleRu: "Адреса филиалов и время работы в Ташкенте?",
    },
    {
      emoji: "🚚",
      titleUz: "Toshkent va viloyatlarga dostavka shartlari?",
      titleRu: "Условия доставки по Ташкенту и регионам?",
    },
    {
      emoji: "💳",
      titleUz: "Qanday to'lov usullari mavjud? (Click, Payme)",
      titleRu: "Способы оплаты (Click, Payme, Uzum)?",
    },
    {
      emoji: "👞",
      titleUz: "Lofer va krossovkalar qanday bor?",
      titleRu: "Какие есть лоферы и кроссовки?",
    },
  ];

  // Match products mentioned in AI response
  const detectRecommendedProducts = (text: string): Product[] => {
    const lower = text.toLowerCase();
    return products
      .filter((p) => {
        const pName = p.name.toLowerCase();
        const pNameRu = (p.nameRu || "").toLowerCase();
        if (lower.includes(pName) || (pNameRu && lower.includes(pNameRu))) return true;
        if ((pName.includes("kardigan") || pName.includes("cardigan")) && (lower.includes("kardigan") || lower.includes("кардиган"))) return true;
        if (pName.includes("bomber") && (lower.includes("bomber") || lower.includes("бомбер"))) return true;
        if ((pName.includes("jinsi") || pName.includes("jeans")) && (lower.includes("jinsi") || lower.includes("джинс"))) return true;
        if ((pName.includes("chinos") || pName.includes("chino")) && (lower.includes("chino") || lower.includes("чинос"))) return true;
        if ((pName.includes("lofer") || pName.includes("loafers")) && (lower.includes("lofer") || lower.includes("лофер"))) return true;
        if ((pName.includes("krossovka") || pName.includes("sneakers")) && (lower.includes("krossovka") || lower.includes("кед"))) return true;
        if ((pName.includes("futbolka") || pName.includes("t-shirt")) && (lower.includes("futbolka") || lower.includes("футболк"))) return true;
        if ((pName.includes("jiletka") || pName.includes("vest")) && (lower.includes("jiletka") || lower.includes("жилет"))) return true;
        if ((pName.includes("chelsi") || pName.includes("chelsea")) && (lower.includes("chelsi") || lower.includes("челси"))) return true;
        if ((pName.includes("oksford") || pName.includes("oxford")) && (lower.includes("oksford") || lower.includes("oxford") || lower.includes("оксфорд"))) return true;
        if (pName.includes("polo") && (lower.includes("polo") || lower.includes("поло"))) return true;
        if ((pName.includes("sport") || pName.includes("to'plam")) && (lower.includes("sport to'plam") || lower.includes("спортивн"))) return true;
        return false;
      })
      .slice(0, 3);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || isBotTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsBotTyping(true);

    try {
      const historyPayload = chatMessages
        .filter((m) => m.id !== "msg-init")
        .slice(-8)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      const localGeminiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("button_gemini_api_key") || settings?.geminiApiKey || ""
          : settings?.geminiApiKey || "";

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          message: textToSend,
          history: historyPayload,
          lang,
          geminiApiKey: localGeminiKey,
        }),
      });

      const data = await res.json();
      if (data.savedApiKey && typeof window !== "undefined") {
        localStorage.setItem("button_gemini_api_key", data.savedApiKey);
      }
      const replyText =
        data.reply ||
        (isUz
          ? "Kechirasiz, so'rovingizni qayta ishlay olmadim. Iltimos, boshqacha tarzda so'rab ko'ring."
          : "Извините, не удалось обработать запрос. Пожалуйста, попробуйте сформулировать иначе.");

      const matched = detectRecommendedProducts(replyText);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendedProductIds: matched.map((p) => p.id),
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: isUz
          ? "Aloqada vaqtinchalik uzilish yuz berdi. Iltimos, qaytadan urinib ko'ring yoki filiallarimizga qo'ng'iroq qiling (+998 94 613 55 55)."
          : "Временная ошибка связи. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону (+998 94 613 55 55).",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "bot",
        text: isUz ? initialGreetingUz : initialGreetingRu,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCopyText = (text: string, id: string) => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown-like bold text & bullet points
  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      // Split bold formatting: **bold text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-extrabold text-violet-700 dark:text-violet-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={pIdx} className="italic text-zinc-500 dark:text-zinc-400">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "leading-relaxed my-0.5"}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-12 animate-fade-in font-sans">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-violet-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>BUTTON AI STYLIST & CONSULTANT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              {isUz ? "Shaxsiy Stilist & Do'kon Maslahatchisi" : "Персональный AI-Стилист и Консультант"}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {isUz
                ? "Kiyinish uslublari, ranglar uyg'unligi, o'lcham tanlash, 20 ta mahsulot katalogi, Toshkentdagi filiallar va dostavka bo'yicha to'liq onlayn maslahat."
                : "Консультация по стилю, подбор размера, сочетания цветов, адреса 3 филиалов в Ташкенте и быстрая доставка."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleResetChat}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              title={isUz ? "Suhbatni tozalash" : "Очистить диалог"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isUz ? "Yangi suhbat" : "Новый диалог"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Question Chips (Horizontal scrollable & categorized) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>{isUz ? "Tezkor maslahat mavzulari:" : "Популярные вопросы:"}</span>
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            {isUz ? "1-bosishda javob oling" : "Кликните для ответа"}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(isUz ? item.titleUz : item.titleRu)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0f172a] hover:bg-violet-50 dark:hover:bg-violet-950/40 text-xs font-semibold text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs flex items-center gap-2 group active:scale-95"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span>{isUz ? item.titleUz : item.titleRu}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Chat Stream Container */}
      <div className="rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px] sm:h-[620px]">
        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {chatMessages.map((msg) => {
            const isBot = msg.sender === "bot";
            const recommendedProducts = msg.recommendedProductIds
              ? products.filter((p) => msg.recommendedProductIds?.includes(p.id))
              : [];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${isBot ? "justify-start" : "justify-end"}`}
              >
                {/* Bot Avatar */}
                {isBot && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-violet-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-700/25 mt-0.5">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}

                <div className={`space-y-2.5 max-w-[88%] sm:max-w-[78%] ${isBot ? "items-start" : "items-end"}`}>
                  {/* Bubble Content */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm shadow-xs relative group ${
                      isBot
                        ? "bg-[#F8FAFC] dark:bg-[#1e293b]/90 text-[#0F172A] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-700/80 rounded-tl-sm"
                        : "bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-700 text-white rounded-tr-sm shadow-md shadow-violet-700/20"
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Copy text action for bot responses */}
                    {isBot && (
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-[#94A3B8]">
                        <span className="font-mono text-[10px]">{msg.time}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                          title={isUz ? "Nusxa olish" : "Копировать"}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">{isUz ? "Nusxalandi" : "Скопировано"}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isUz ? "Nusxalash" : "Копировать"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {!isBot && (
                      <div className="flex justify-end pt-1 text-[10px] text-violet-200 font-mono">
                        {msg.time}
                      </div>
                    )}
                  </div>

                  {/* Recommended Products Embed (If matched) */}
                  {isBot && recommendedProducts.length > 0 && (
                    <div className="p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isUz ? "Maslahatga mos do'kondagi kiyimlar:" : "Товары из рекомендации:"}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectProduct(p)}
                            className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-violet-100 dark:border-slate-800 flex items-center gap-2 hover:border-violet-500 transition-all cursor-pointer shadow-xs group"
                          >
                            <div className="w-10 h-10 rounded-lg relative overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                              <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[11px] font-bold text-[#0F172A] dark:text-white truncate">
                                {p.name}
                              </h4>
                              <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 font-bold">
                                {formatUzbekCurrency(p.price)}
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-600 transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isBotTyping && (
            <div className="flex gap-3 items-center animate-fade-in">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 flex items-center gap-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  {isUz ? "AI stilist tahlil qilmoqda" : "AI стилист думает"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-[#E2E8F0] dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              ref={inputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                isUz
                  ? "AI stilistga savolingizni yozing (masalan: To'yga nima kiysam bo'ladi?)..."
                  : "Напишите вопрос стилисту (например: Что надеть на свадьбу?)..."
              }
              className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-600 shadow-xs"
            />

            <button
              type="submit"
              disabled={isBotTyping || !chatInput.trim()}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-700 hover:from-violet-600 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-violet-700/25 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{isUz ? "Yuborish" : "Отправить"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiModeSection;
