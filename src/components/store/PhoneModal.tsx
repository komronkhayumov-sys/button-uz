"use client";

import React from "react";
import { X, Phone } from "lucide-react";
import { StoreSettings } from "@/types";
import { CONTACT_PHONES } from "@/constants";

interface PhoneModalProps {
  isOpen: boolean;
  settings?: StoreSettings | null;
  onClose: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, settings, onClose }) => {
  if (!isOpen) return null;

  const phone1 = settings?.phone1 || CONTACT_PHONES[0].display;
  const phone2 = settings?.phone2 || CONTACT_PHONES[1].display;

  const phones = [
    { display: phone1, raw: phone1.replace(/\s+/g, ""), label: "1-Filial / Operator" },
    { display: phone2, raw: phone2.replace(/\s+/g, ""), label: "2-Filial / Qo'llab-quvvatlash" },
  ];

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

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <Phone className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
            Qo'ng'iroq qilish
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Qaysi raqam bilan bog'lanmoqchisiz?
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {phones.map((phone, idx) => (
            <a
              key={idx}
              href={`tel:${phone.raw}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#1e293b] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 transition-all group"
            >
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#64748B] dark:text-slate-400">
                  {phone.label}
                </span>
                <span className="text-sm font-bold font-mono text-[#0F172A] dark:text-white group-hover:text-emerald-500 transition-colors">
                  {phone.display}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
