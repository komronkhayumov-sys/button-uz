"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { InstagramIcon, TelegramIcon } from "@/components/icons";
import { Branch, Language, StoreSettings } from "@/types";
import { BRANCHES, CONTACT_PHONES, STORE_HANDLE, STORE_INSTAGRAM, STORE_TELEGRAM } from "@/constants";
import { getStoreTimeStatus } from "@/lib/time";

interface StoreFooterProps {
  lang: Language;
  settings?: StoreSettings | null;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({ lang, settings }) => {
  const isUz = lang === "uz";
  const branches: Branch[] = settings?.branches && settings.branches.length > 0 ? settings.branches : BRANCHES;
  const timeStatus = getStoreTimeStatus(lang);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0F172A] text-slate-300 border-t border-slate-800 transition-colors pt-12 pb-28 md:pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden relative border border-slate-700 bg-black shrink-0 shadow-md">
                <Image
                  src={settings?.storeAvatar || "/btn-logo.png"}
                  alt="BUTTON Men's Wear"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-lg text-white tracking-tight">BUTTON</h3>
                  <span className="bg-violet-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    MEN
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Men's Wear Tashkent</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isUz
                ? (settings?.storeBioUz || "Zamonaviy erkaklar kiyimlari, poyabzal va aksessuarlar do'koni. Sifat va qulaylik uyg'unligi.")
                : (settings?.storeBioRu || "Магазин современной мужской одежды, обуви и аксессуаров. Сочетание премиум стиля и комфорта.")}
            </p>

            {/* Live Working Hours Status Badge */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  <span>{isUz ? "Ish tartibi:" : "Режим работы:"}</span>
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  timeStatus.isOpen
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${timeStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  <span>{isUz ? (timeStatus.isOpen ? "Ochiq" : "Yopiq") : (timeStatus.isOpen ? "Открыто" : "Закрыто")}</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-white">
                {settings?.workingHoursUz || "Har kuni 10:00 – 22:00 (dam olishsiz)"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isUz ? timeStatus.statusTextUz : timeStatus.statusTextRu}
              </p>
            </div>
          </div>

          {/* Column 2: Branches (Filiallar) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className="w-4 h-4 text-violet-400" />
              <h4>{isUz ? "Toshkentdagi Filiallarimiz" : "Наши филиалы в Ташкенте"}</h4>
            </div>

            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.id} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">
                      {isUz ? b.name : b.nameRu || b.name}
                    </p>
                    {b.yandexMap && (
                      <a
                        href={b.yandexMap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 inline-flex items-center gap-0.5"
                      >
                        <span>{isUz ? "Xarita" : "Карта"}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {isUz ? b.address : b.addressRu || b.address}
                  </p>
                  <p className="text-[10px] text-violet-300/80 mt-1">
                    🎯 {isUz ? b.landmark : b.landmarkRu || b.landmark}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Delivery & Payment (Yetkazib berish va To'lov) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Truck className="w-4 h-4 text-violet-400" />
              <h4>{isUz ? "Yetkazib berish & To'lov" : "Доставка и Оплата"}</h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUz ? "Toshkent bo'ylab tezkor yetkazish" : "Быстрая доставка по Ташкенту"}</span>
                </p>
                <p className="text-[11px]">
                  {isUz ? "1-3 soat ichida (Yandex / BTS orqali)" : "В течение 1-3 часов (через Yandex / BTS)"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUz ? "O'zbekiston viloyatlariga" : "Во все регионы Узбекистана"}</span>
                </p>
                <p className="text-[11px]">
                  {isUz ? "1-2 kun ichida pochta orqali uyingizgacha" : "1-2 дня почтой прямо до вашей двери"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                  <span>{isUz ? "Qulay to'lov usullari:" : "Способы оплаты:"}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Uzcard", "Humo", "Visa", "Mastercard", "Click", "Payme", "Naqd pul"].map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Social Channels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Phone className="w-4 h-4 text-violet-400" />
              <h4>{isUz ? "Aloqa va Savollar" : "Контакты и Связь"}</h4>
            </div>

            <div className="space-y-2">
              {CONTACT_PHONES.map((cp) => (
                <a
                  key={cp.raw}
                  href={`tel:${cp.raw}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cp.display}</span>
                  </span>
                  <span className="text-[10px] font-sans font-normal text-slate-400">{cp.label}</span>
                </a>
              ))}
            </div>

            {/* Social Link Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={settings?.telegramUrl || STORE_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <TelegramIcon className="w-4 h-4 fill-white" />
                <span>Telegram: @button_uzbekistan</span>
              </a>

              <a
                href={settings?.instagramUrl || STORE_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram: {settings?.storeHandle || STORE_HANDLE}</span>
              </a>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isUz ? "100% kafolatlangan xavfsiz xarid va original mahsulotlar" : "100% безопасные покупки и оригинальная одежда"}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} BUTTON Men's Wear. {isUz ? "Barcha huquqlar himoyalangan." : "Все права защищены."}</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px]">Toshkent, O'zbekiston</span>
            <span>•</span>
            <span className="text-[11px]">Designed for Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
