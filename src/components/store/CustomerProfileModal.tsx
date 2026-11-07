"use client";

import React, { useState } from "react";
import { X, User, Phone, MapPin, Check, CheckCircle2, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { Customer, Language, Order } from "@/types";

interface CustomerProfileModalProps {
  isOpen: boolean;
  customer: Customer | null;
  orders: Order[];
  lang: Language;
  onSaveCustomer: (customer: Customer) => void;
  onClose: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  customer,
  orders,
  lang,
  onSaveCustomer,
  onClose,
}) => {
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "+998 ");
  const [address, setAddress] = useState(customer?.address || "");
  const [preferredSize, setPreferredSize] = useState(customer?.preferredSize || "L");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const isUz = lang === "uz";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) val = "+998 ";
    setPhone(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg(isUz ? "Ismingizni kiriting" : "Введите ваше имя");
      return;
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 9) {
      cleanPhone = "998" + cleanPhone;
    }
    if (cleanPhone.length < 12) {
      setErrorMsg(isUz ? "To'liq telefon raqamini kiriting (+998 ...)" : "Введите полный номер телефона (+998 ...)");
      return;
    }
    const formattedPhone = `+${cleanPhone}`;

    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: formattedPhone,
          address: address.trim(),
          preferredSize,
        }),
      });

      const data = await res.json();
      if (data.success && data.customer) {
        onSaveCustomer(data.customer);
        localStorage.setItem("button_customer_phone", data.customer.phone);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      setErrorMsg("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="w-14 h-14 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {customer ? (isUz ? "Shaxsiy Profilingiz" : "Ваш Профиль") : (isUz ? "Xaridor Ro'yxatdan O'tish" : "Регистрация Покупателя")}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isUz
              ? "Buyurtmalarni tezkor rasmiylashtirish va bonuslar uchun ma'lumotlaringizni kiriting"
              : "Для быстрого оформления заказов и бонусов заполните данные"}
          </p>
        </div>

        {savedSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-xs text-emerald-500">
              {isUz ? "Ma'lumotlaringiz saqlandi!" : "Данные успешно сохранены!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isUz ? "Ismingiz:" : "Ваше имя:"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isUz ? "Masalan: Jasur" : "Например: Жасур"}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isUz ? "Telefon raqamingiz:" : "Номер телефона:"}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isUz ? "Yetkazish manzili (Tuman, ko'cha, uy):" : "Адрес доставки (Район, улица, дом):"}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isUz ? "Chilonzor 9, 15-uy" : "Чиланзар 9, дом 15"}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isUz ? "Sevimli o'lchamingiz:" : "Ваш основной размер:"}
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {["S", "M", "L", "XL", "XXL", "3XL", "48", "50", "52"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPreferredSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      preferredSize === sz
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 cursor-pointer active:scale-98"
            >
              {saving ? "Saqlanmoqda..." : isUz ? "Profilni saqlash" : "Сохранить профиль"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
