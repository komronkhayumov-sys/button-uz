"use client";

import React, { useState } from "react";
import { X, Copy, Check, CreditCard, ExternalLink, CheckCircle2, ShieldCheck, Banknote } from "lucide-react";
import { PaymentMethod } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface PaymentModalProps {
  isOpen: boolean;
  orderId: string;
  totalAmount: number;
  cardNumber: string;
  cardHolder: string;
  cardBank: string;
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onClose: () => void;
  onPaymentConfirmed?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  orderId,
  totalAmount,
  cardNumber,
  cardHolder,
  cardBank,
  selectedMethod,
  onSelectMethod,
  onClose,
  onPaymentConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const rawCard = cardNumber.replace(/\s+/g, "");

  const handleCopyCard = () => {
    navigator.clipboard.writeText(rawCard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Payment app links
  // Click P2P payment url / app intent
  const clickUrl = `https://my.click.uz/clickp2p/${rawCard}?amount=${totalAmount}`;
  // Payme transfer url
  const paymeUrl = `https://payme.uz/fallback/pay/?card=${rawCard}&amount=${totalAmount * 100}`;
  // Uzum bank fallback / universal link
  const uzumUrl = `https://uzumbank.uz/transfer`;

  const handleOpenApp = (method: PaymentMethod) => {
    onSelectMethod(method);
    if (method === "click") {
      window.open(clickUrl, "_blank");
    } else if (method === "payme") {
      window.open(paymeUrl, "_blank");
    } else if (method === "uzum") {
      window.open(uzumUrl, "_blank");
    }
  };

  const handleConfirmPaid = () => {
    setIsConfirmed(true);
    if (onPaymentConfirmed) onPaymentConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-400 flex items-center justify-center mx-auto mb-2">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            To'lov usulini tanlang
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Buyurtma #{orderId} • Summa: <b className="text-emerald-500 font-mono text-sm">{formatUzbekCurrency(totalAmount)}</b>
          </p>
        </div>

        {/* Card Details Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 text-white border border-zinc-700/60 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />

          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
                Qabul qiluvchi karta
              </span>
              <span className="text-xs font-semibold text-violet-300">
                {cardBank || "O'zbekiston bank kartasi"}
              </span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10 mb-2">
            <span className="font-mono text-base font-bold tracking-wider text-white">
              {cardNumber}
            </span>
            <button
              onClick={handleCopyCard}
              className="px-2.5 py-1 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nusxa olish</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] text-zinc-400">
            <span>Egasi: <b className="text-white">{cardHolder}</b></span>
            <span>UZCARD / HUMO</span>
          </div>
        </div>

        {/* 4 Payment Apps */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            Ilovani tanlang va 1-bosishda to'lang:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Click */}
            <button
              onClick={() => handleOpenApp("click")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] ${
                selectedMethod === "click"
                  ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-blue-500/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  C
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block group-hover:text-blue-500">
                    Click
                  </span>
                  <span className="text-[10px] text-zinc-400">Click orqali to'lash</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500" />
            </button>

            {/* Payme */}
            <button
              onClick={() => handleOpenApp("payme")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] ${
                selectedMethod === "payme"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  P
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block group-hover:text-emerald-500">
                    Payme
                  </span>
                  <span className="text-[10px] text-zinc-400">Payme orqali to'lash</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500" />
            </button>

            {/* Uzum Bank */}
            <button
              onClick={() => handleOpenApp("uzum")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] ${
                selectedMethod === "uzum"
                  ? "border-purple-500 bg-purple-500/10 text-purple-500 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  U
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block group-hover:text-purple-500">
                    Uzum Bank
                  </span>
                  <span className="text-[10px] text-zinc-400">Uzum o'tkazma</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-500" />
            </button>

            {/* Cash / Terminal */}
            <button
              onClick={() => onSelectMethod("cash")}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] ${
                selectedMethod === "cash"
                  ? "border-violet-600 bg-violet-600/10 text-violet-700 dark:text-violet-400 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-violet-600/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block group-hover:text-violet-700 dark:group-hover:text-violet-400">
                    Naqd / Terminal
                  </span>
                  <span className="text-[10px] text-zinc-400">Kuryerga to'lash</span>
                </div>
              </div>
              <Check className={`w-3.5 h-3.5 ${selectedMethod === "cash" ? "text-violet-600 dark:text-violet-400" : "text-transparent"}`} />
            </button>
          </div>
        </div>

        {/* Payment Confirmation Button */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {isConfirmed ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                To'lov haqida xabar adminga yuborildi!
              </span>
              <p className="text-[11px] text-zinc-400">
                Menejerimiz to'lovni tekshirib, buyurtmangizni darhol jo'natadi.
              </p>
            </div>
          ) : (
            <button
              onClick={handleConfirmPaid}
              className="w-full py-3 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-700/20 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>To'lov qildim (Tasdiqlash)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
