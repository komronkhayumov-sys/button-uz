"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Phone,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Package,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Language, Order } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";
import ReceiptUploader from "@/components/store/ReceiptUploader";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("uz");
  const isRu = lang === "ru";
  const [isDark, setIsDark] = useState<boolean>(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-fill from localStorage & theme sync
  useEffect(() => {
    const savedTheme = localStorage.getItem("button_theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }

    try {
      const savedPhone =
        localStorage.getItem("button_customer_phone") ||
        localStorage.getItem("button_user_phone");
      if (savedPhone) {
        setSearchPhone(savedPhone);
        fetchOrdersByPhone(savedPhone);
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("button_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("button_theme", "light");
    }
  };

  const fetchOrdersByPhone = async (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 7) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      // Read existing local cached orders
      let localOrders: Order[] = [];
      const savedOrdersRaw = localStorage.getItem("button_customer_orders");
      if (savedOrdersRaw) {
        try {
          const parsed = JSON.parse(savedOrdersRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localOrders = parsed;
            setOrders(parsed);
          }
        } catch {}
      }

      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const serverOrders: Order[] = data.orders;
        const orderMap = new Map<string, Order>();
        localOrders.forEach((o) => orderMap.set(o.id, o));
        serverOrders.forEach((o) => orderMap.set(o.id, o));
        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(merged);
        localStorage.setItem("button_customer_orders", JSON.stringify(merged));
        localStorage.setItem("button_customer_phone", phone);

        // Auto-heal missing orders to server
        const missingOnServer = localOrders.filter((lo) => !serverOrders.some((so) => so.id === lo.id));
        if (missingOnServer.length > 0) {
          fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ syncOrders: missingOnServer }),
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrdersByPhone(searchPhone);
  };

  // Re-order items
  const handleReorder = (order: Order) => {
    try {
      const savedCart = localStorage.getItem("button_cart");
      const currentCart = savedCart ? JSON.parse(savedCart) : [];
      const newItems = order.items.map((it) => ({
        id: `${it.productId}-${it.size || "M"}-${it.color || "default"}`,
        productId: it.productId,
        product: {
          id: it.productId,
          name: it.productName,
          price: it.price,
          image: it.image || "/btn-logo.png",
          description: "",
          category: "suits",
          sizes: [it.size || "M"],
          isAvailable: true,
        },
        size: it.size || "M",
        color: it.color,
        quantity: it.quantity,
        price: it.price,
      }));
      localStorage.setItem("button_cart", JSON.stringify([...currentCart, ...newItems]));
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1120] text-[#0F172A] dark:text-white pb-24 font-sans selection:bg-[#2563EB] selection:text-white transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">{isRu ? "Главная" : "Bosh sahifa"}</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden relative border border-[#2563EB]/30">
              <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" unoptimized />
            </div>
            <span className="font-black text-sm tracking-wider text-[#0F172A] dark:text-white">BUTTON MEN</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${lang === "uz" ? "bg-[#2563EB] text-white font-black" : "text-[#64748B] dark:text-slate-400"}`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${lang === "ru" ? "bg-[#2563EB] text-white font-black" : "text-[#64748B] dark:text-slate-400"}`}
              >
                RU
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-violet-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] dark:text-white">
            {isRu ? "Мои Заказы" : "Mening Buyurtmalarim"}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            {isRu
              ? "Введите номер телефона, чтобы отследить статус и загрузить чек"
              : "Buyurtma holatini kuzatish va to'lov chekini yuklash uchun telefoningizni kiriting"}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] text-sm font-mono shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-violet-700/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isRu ? "Найти" : "Qidirish"}</span>
            </button>
          </div>
        </form>

        {/* Orders list */}
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] dark:text-slate-400">{isRu ? "Загрузка заказов..." : "Buyurtmalar yuklanmoqda..."}</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
              <span>{orders.length} {isRu ? "заказов найдено" : "ta buyurtma topildi"}</span>
              <button
                type="button"
                onClick={() => fetchOrdersByPhone(searchPhone)}
                className="flex items-center gap-1 text-[#2563EB] hover:underline cursor-pointer font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isRu ? "Обновить" : "Yangilash"}</span>
              </button>
            </div>

            {orders.map((order) => {
              // 4-stage Visual Timeline
              const stageIndex =
                order.status === "cancelled"
                  ? -1
                  : order.status === "delivered"
                  ? 3
                  : order.status === "confirmed"
                  ? 1
                  : 0;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl"
                >
                  {/* Order Top: ID, Date & Total */}
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#2563EB]">
                          #{order.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700">
                          {order.deliveryType === "delivery" ? (isRu ? "Доставка" : "Yetkazish") : (isRu ? "Самовывоз" : "Showroom")}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString("uz-UZ", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] dark:text-slate-400 block">{isRu ? "Итого:" : "Jami summa:"}</span>
                      <span className="font-mono font-black text-sm sm:text-base text-violet-700 dark:text-violet-400">
                        {formatUzbekCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Stage Visual Status Timeline */}
                  {order.status !== "cancelled" ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {[
                          { key: "new", labelUz: "Qabul qilindi", labelRu: "Принят" },
                          { key: "confirmed", labelUz: "Tasdiqlandi", labelRu: "Подтверждён" },
                          { key: "transit", labelUz: "Yo'lda", labelRu: "В пути" },
                          { key: "delivered", labelUz: "Yetkazildi", labelRu: "Доставлен" },
                        ].map((stage, idx) => {
                          const isDone = stageIndex >= idx;
                          const isCurrent = stageIndex === idx;
                          return (
                            <div key={stage.key} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  isDone
                                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                    : "bg-[#F1F5F9] dark:bg-[#1e293b]"
                                }`}
                              />
                              <span
                                className={`text-[9px] block leading-tight ${
                                  isCurrent
                                    ? "font-black text-[#2563EB]"
                                    : isDone
                                    ? "font-bold text-[#0F172A] dark:text-white"
                                    : "text-[#64748B] dark:text-slate-400"
                                }`}
                              >
                                {isRu ? stage.labelRu : stage.labelUz}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{isRu ? "Заказ был отменен" : "Buyurtma bekor qilingan"}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 pt-1">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {it.image && (
                            <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-white dark:bg-[#0f172a] shrink-0 border border-[#E2E8F0] dark:border-slate-700">
                              <Image src={it.image} alt={it.productName} fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-xs truncate block text-[#0F172A] dark:text-white">
                              {it.productName}
                            </span>
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                              {isRu ? "Размер:" : "O'lcham:"} {it.size || "M"} {it.color ? `• ${it.color}` : ""} • {it.quantity} dona
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs text-violet-700 dark:text-violet-400 shrink-0">
                          {formatUzbekCurrency(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Proof of Payment / Receipt Uploader (FAZA 1 & 6) */}
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
                    <ReceiptUploader
                      orderId={order.id}
                      lang={lang}
                      currentReceipt={order.paymentReceipt}
                      paymentStatus={order.paymentStatus}
                      rejectReason={order.paymentRejectReason}
                      onUploaded={() => fetchOrdersByPhone(searchPhone)}
                    />
                  </div>

                  {/* Actions: Re-order & Contact manager */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-violet-700/20"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isRu ? "Повторить заказ" : "Qayta xarid qilish"}</span>
                    </button>

                    <a
                      href="https://t.me/button_admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Menejer</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearched ? (
          <div className="py-12 text-center space-y-3 p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-sm dark:shadow-xl">
            <Package className="w-12 h-12 text-[#64748B] dark:text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
              {isRu ? "Заказов по данному номеру не найдено" : "Ushbu raqam bo'yicha buyurtmalar topilmadi"}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
              {isRu
                ? "Проверьте правильность введённого номера или оформите новый заказ в каталоге"
                : "Telefon raqamini to'g'ri kiritganingizni tekshiring yoki do'kondan yangi buyurtma bering"}
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-5 py-2.5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs shadow-md shadow-violet-700/20 transition-all active:scale-95"
            >
              {isRu ? "Перейти в каталог" : "Katalogga o'tish"}
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2 text-[#64748B] dark:text-slate-400 text-xs">
            <Package className="w-10 h-10 mx-auto text-[#94A3B8] opacity-40" />
            <p>{isRu ? "Введите номер телефона выше, чтобы увидеть ваши заказы" : "Buyurtmalaringizni ko'rish uchun yuqoriga telefon raqamingizni kiriting"}</p>
          </div>
        )}
      </main>

      <PwaInstallPrompt lang={lang} target="store" />
    </div>
  );
}
