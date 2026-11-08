"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Wifi,
  Copy,
  Check,
  Store,
  Compass,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Branch, Language, Product } from "@/types";
import { translations } from "@/lib/i18n";
import { BRANCHES } from "@/constants";
import { getStoreTimeStatus } from "@/lib/time";

interface BranchHubProps {
  lang: Language;
  branches?: Branch[];
  selectedProduct?: Product | null;
  onReserveProduct?: (branch: Branch, product: Product) => void;
}

export const BranchHub: React.FC<BranchHubProps> = ({
  lang,
  branches,
  selectedProduct,
  onReserveProduct,
}) => {
  const isUz = lang === "uz";
  const activeBranches = branches && branches.length > 0 ? branches : BRANCHES;
  const [copiedWifiIndex, setCopiedWifiIndex] = useState<number | null>(null);
  const [reservedBranchId, setReservedBranchId] = useState<string | null>(null);

  const handleCopyWifi = (index: number) => {
    navigator.clipboard.writeText("button_fashion");
    setCopiedWifiIndex(index);
    setTimeout(() => setCopiedWifiIndex(null), 2000);
  };

  const handleReserve = (branch: Branch) => {
    if (selectedProduct && onReserveProduct) {
      onReserveProduct(branch, selectedProduct);
    }
    setReservedBranchId(branch.id);
    setTimeout(() => setReservedBranchId(null), 3000);
  };

  return (
    <div className="space-y-4 text-[#0F172A] dark:text-white">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2563EB]" />
            <span>{isUz ? "Toshkentdagi 4 ta Showroom" : "4 Шоурума в Ташкенте"}</span>
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            {isUz
              ? "O'zingizga eng yaqin filialni tanlang, kiyimni ko'ring va kiyib ko'ring"
              : "Выберите ближайший филиал, примерьте и оцените качество"}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isUz ? "Barcha filiallar ochiq" : "Все филиалы открыты"}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeBranches.map((branch, index) => {
          const branchName = lang === "ru" ? branch.nameRu || branch.name : branch.name;
          const branchAddress = lang === "ru" ? branch.addressRu || branch.address : branch.address;
          const branchLandmark = lang === "ru" ? branch.landmarkRu || branch.landmark : branch.landmark;
          const workingHours = lang === "ru" ? branch.workingHoursRu || branch.workingHours : branch.workingHours;

          return (
            <div
              key={branch.id || index}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 hover:border-[#2563EB]/40 transition-all space-y-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl group"
            >
              <div className="space-y-3">
                {/* Branch header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-blue-500/20">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-[#0F172A] dark:text-white group-hover:text-[#2563EB] transition-colors">
                        {branchName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${getStoreTimeStatus(lang).isOpen ? "text-emerald-500" : "text-rose-500"}`} />
                          <span>{workingHours}</span>
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStoreTimeStatus(lang).isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className={`font-bold text-[10px] ${getStoreTimeStatus(lang).isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {getStoreTimeStatus(lang).isOpen
                            ? isUz ? "Hozir ochiq" : "Открыто"
                            : isUz ? "Hozir yopiq" : "Закрыто"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700">
                    Toshkent
                  </span>
                </div>

                {/* Branch details */}
                <div className="text-xs text-[#64748B] dark:text-slate-400 space-y-1.5 bg-[#F8FAFC] dark:bg-[#1e293b] p-3 rounded-2xl border border-[#E2E8F0] dark:border-slate-700">
                  <p className="flex items-start gap-2 leading-relaxed text-[#0F172A] dark:text-slate-200">
                    <span className="text-[#2563EB] shrink-0">📍</span>
                    <span>{branchAddress}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[11px] text-violet-700 dark:text-violet-400 font-medium">
                    <span className="shrink-0">🎯</span>
                    <span>{isUz ? "Mo'ljal:" : "Ориентир:"} {branchLandmark}</span>
                  </p>
                </div>

                {/* Wi-Fi & Availability Pill */}
                <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-[#F1F5F9] dark:bg-[#1e293b]/60 rounded-xl border border-[#E2E8F0] dark:border-slate-700/60">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isUz ? "Katalog kiyimlari mavjud" : "В наличии"}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyWifi(index)}
                    className="flex items-center gap-1 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                  >
                    <Wifi className="w-3 h-3 text-[#2563EB]" />
                    <span>{copiedWifiIndex === index ? (isUz ? "Parol nusxalandi" : "Скопировано") : "Showroom Wi-Fi"}</span>
                  </button>
                </div>

                {/* If selectedProduct is passed, show instant branch reservation */}
                {selectedProduct && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleReserve(branch)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 text-[#2563EB] dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>
                        {reservedBranchId === branch.id
                          ? (isUz ? "✅ 2 soatga bepul band qilindi!" : "✅ Забронировано на 2 часа!")
                          : (isUz ? "Ushbu filialda bepul band qilish" : "Забронировать в этом филиале")}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Action buttons with Yandex Go Taxi */}
              <div className="space-y-2 pt-1 border-t border-[#E2E8F0] dark:border-slate-800">
                {/* Yandex Go taxi one-tap call button */}
                <a
                  href={
                    branch.coordinates
                      ? `https://3.redirect.appmetrica.yandex.com/route?end-lat=${branch.coordinates.lat}&end-lon=${branch.coordinates.lng}&appmetrica_tracking_id=1178268795219780156&ref=button_uz`
                      : branch.yandexMap
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-violet-700/20 transition-all cursor-pointer active:scale-98"
                >
                  <span className="text-sm">🚕</span>
                  <span>{lang === "ru" ? "Вызвать такси в шоурум (Yandex Go)" : "Showroomga taksi chaqirish (Yandex Go)"}</span>
                </a>

                <div className="grid grid-cols-3 gap-2">
                  {/* Yandex Maps */}
                  <a
                    href={branch.yandexMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 text-rose-500 dark:text-rose-400 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 transition-all text-center"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Yandex</span>
                  </a>

                  {/* Google Maps */}
                  <a
                    href={branch.googleMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 text-[#2563EB] dark:text-blue-400 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google</span>
                  </a>

                  {/* Direct Call */}
                  <a
                    href={`tel:${branch.phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-[#E2E8F0] dark:border-slate-700 transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BranchHub;
