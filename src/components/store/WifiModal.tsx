"use client";

import React, { useState } from "react";
import { X, Wifi, Copy, Check, QrCode } from "lucide-react";
import { Language, StoreSettings } from "@/types";
import { translations } from "@/lib/i18n";
import { SHOWROOM_WIFI } from "@/constants";

interface WifiModalProps {
  isOpen: boolean;
  lang: Language;
  settings?: StoreSettings | null;
  onClose: () => void;
}

export const WifiModal: React.FC<WifiModalProps> = ({ isOpen, lang, settings, onClose }) => {
  const [copied, setCopied] = useState(false);
  const t = translations[lang];

  if (!isOpen) return null;

  const ssid = settings?.wifiSsid || SHOWROOM_WIFI.ssid;
  const password = settings?.wifiPassword || SHOWROOM_WIFI.password;

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl p-5 text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-700 dark:text-violet-400 flex items-center justify-center mx-auto">
          <Wifi className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
            {t.showroomWifiTitle}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            BUTTON do'konlarimizda bepul va tezkor internet
          </p>
        </div>

        {/* Credentials box */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#64748B] dark:text-slate-400">Wi-Fi Tarmoq (SSID):</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-white">
              {ssid}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2E8F0] dark:border-slate-700 pt-2">
            <span className="text-[#64748B] dark:text-slate-400">Parol:</span>
            <span className="font-mono font-bold text-violet-700 dark:text-violet-400">
              {password}
            </span>
          </div>
        </div>

        {/* Copy Password Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t.passwordCopied}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{t.copyPassword}</span>
            </>
          )}
        </button>

        {/* Showroom QR illustration */}
        <div className="pt-2 flex flex-col items-center">
          <div className="w-24 h-24 p-2 bg-white rounded-xl shadow-xs border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center">
            <QrCode className="w-full h-full text-[#0F172A]" />
          </div>
          <span className="text-[10px] text-[#64748B] dark:text-slate-400 mt-1.5">
            Kassadagi QR kodni kamera bilan skaner qiling
          </span>
        </div>
      </div>
    </div>
  );
};
