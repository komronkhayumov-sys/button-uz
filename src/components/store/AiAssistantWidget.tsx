"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Send, Ruler, MessageSquare, ArrowRight, Check, RefreshCw } from "lucide-react";
import { Language } from "@/types";
import { translations } from "@/lib/i18n";

interface AiAssistantWidgetProps {
  lang: Language;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "chat">("calculator");
  const [height, setHeight] = useState<string>("178");
  const [weight, setWeight] = useState<string>("75");
  const [calculating, setCalculating] = useState(false);
  const [sizeResult, setSizeResult] = useState<{
    size: string;
    suitSize: string;
    reply: string;
  } | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text:
        lang === "ru"
          ? "Здравствуйте! Я AI-консультант BUTTON Men's Wear. Чем могу вам помочь? Вы можете спросить о филиалах, доставке по Ташкенту или подобрать нужный размер!"
          : "Assalomu alaykum! Men BUTTON Men's Wear do'konining sun'iy intellekt stilistiman. Sizga qanday yordam bera olaman? 4 ta filialimiz, yetkazib berish yoki o'lcham tanlash haqida so'rashingiz mumkin!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const t = translations[lang];

  // Quick questions
  const quickQuestions =
    lang === "ru"
      ? [
          "Где находятся филиалы?",
          "Сколько длится доставка по Ташкенту?",
          "До скольки вы работаете?",
          "Как оплатить заказ?",
        ]
      : [
          "Filiallar qayerda joylashgan?",
          "Toshkent bo'ylab yetkazib berish qancha vaqt oladi?",
          "Ish vaqti qachongacha?",
          "To'lov turlari qanaqa?",
        ];

  const handleCalculateSize = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return;

    setCalculating(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "size_recommendation",
          height: h,
          weight: w,
          lang,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSizeResult({
          size: data.size,
          suitSize: data.suitSize,
          reply: data.reply,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isTyping) return;

    const userMsg = text.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    if (!textToSend) setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              lang === "ru"
                ? "Извините, произошла ошибка. Пожалуйста, позвоните нам по номеру +998 94 613 55 55."
                : "Kechirasiz, xatolik yuz berdi. Iltimos, +998 94 613 55 55 raqamiga qo'ng'iroq qiling.",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            lang === "ru"
              ? "Связь временно недоступна. Попробуйте еще раз."
              : "Aloqa vaqtincha uzildi. Qaytadan urinib ko'ring.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Widget Header */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin" style={{ animationDuration: "6s" }} />
            {t.aiAssistantTitle}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t.aiAssistantSubtitle}
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "calculator"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-violet-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{t.calculateSizeTab}</span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-violet-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.chatTab}</span>
        </button>
      </div>

      {/* Tab 1: Size Calculator */}
      {activeTab === "calculator" ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <form onSubmit={handleCalculateSize} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.heightLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="140"
                    max="220"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
                    sm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.weightLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="40"
                    max="160"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-violet-700/20 cursor-pointer active:scale-98"
            >
              {calculating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.calculateBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {sizeResult && (
            <div className="p-3.5 rounded-xl bg-violet-600/10 border border-violet-600/30 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.recommendedSize}
                </span>
                <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-violet-700 text-white shadow-xs">
                  {sizeResult.size}
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {sizeResult.reply}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Chat */
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          {/* Quick Questions pills */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
              {t.quickQuestions}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-all text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-violet-700 text-white rounded-tr-xs"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-xs border border-zinc-200 dark:border-zinc-700/60"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-zinc-400">
                <div className="w-6 h-6 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t.chatPlaceholder}
              className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-violet-700 hover:bg-violet-800 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 cursor-pointer shadow-xs shadow-violet-700/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
