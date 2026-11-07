"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Package,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  Store,
  CreditCard,
  MessageCircle,
  Check,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Language, Order, Product } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";
import ReceiptUploader from "@/components/store/ReceiptUploader";

interface OrdersSectionProps {
  orders: Order[];
  products: Product[];
  lang: Language;
  onSelectProduct?: (product: Product) => void;
  onViewCatalog?: () => void;
  onAddToCart?: (product: Product, size?: string, color?: string) => void;
  onRefresh?: () => void;
}

type OrderFilterStatus = "all" | "pending" | "shipping" | "completed";

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  products,
  lang,
  onSelectProduct,
  onViewCatalog,
  onAddToCart,
  onRefresh,
}) => {
  const isUz = lang === "uz";
  const [filter, setFilter] = useState<OrderFilterStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reorderedToast, setReorderedToast] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (filter === "pending") {
      return orders.filter((o) => o.status === "new" || o.paymentStatus === "verifying");
    }
    if (filter === "shipping") {
      return orders.filter((o) => o.status === "confirmed");
    }
    if (filter === "completed") {
      return orders.filter((o) => o.status === "delivered");
    }
    return orders;
  }, [orders, filter]);

  const pendingCount = orders.filter((o) => o.status === "new" || o.paymentStatus === "verifying").length;
  const shippingCount = orders.filter((o) => o.status === "confirmed").length;
  const completedCount = orders.filter((o) => o.status === "delivered").length;

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleReorderAll = (ord: Order) => {
    if (onAddToCart) {
      ord.items.forEach((it) => {
        const found = products.find((p) => p.id === it.productId);
        if (found) {
          onAddToCart(found, it.size, it.color);
        } else {
          // Fallback if product not in list
          onAddToCart(
            {
              id: it.productId,
              name: it.productName,
              price: it.price,
              image: it.image || "/btn-logo.png",
              description: "",
              category: "suits",
              sizes: [it.size || "M"],
              isAvailable: true,
            },
            it.size,
            it.color
          );
        }
      });
      setReorderedToast(true);
      setTimeout(() => setReorderedToast(false), 2500);
    }
  };

  // If user clicked on an order to view its full details
  if (selectedOrder) {
    const ord = selectedOrder;
    const isDelivered = ord.status === "delivered";
    const isConfirmed = ord.status === "confirmed" || isDelivered;
    const clickUrl = `https://my.click.uz/clickp2p/8600123456789999?amount=${ord.totalAmount}`;
    const paymeUrl = `https://payme.uz/fallback/pay/?card=8600123456789999&amount=${ord.totalAmount * 100}`;

    return (
      <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setSelectedOrder(null)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isUz ? "Barcha buyurtmalarga qaytish" : "Назад ко всем заказам"}</span>
        </button>

        {/* Reordered feedback toast */}
        {reorderedToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isUz ? "Barcha kiyimlar savatchangizga qayta qo'shildi! 🛒" : "Все товары добавлены в корзину! 🛒"}</span>
          </div>
        )}

        {/* Order Details Main Container */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-6 shadow-sm dark:shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold tracking-wider">
                {isUz ? "Buyurtma raqami" : "Номер заказа"}
              </span>
              <h2 className="text-xl sm:text-2xl font-mono font-black text-[#0F172A] dark:text-white">
                #{ord.id}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {ord.createdAt
                    ? new Date(ord.createdAt).toLocaleString(isUz ? "uz-UZ" : "ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "12-oktabr, 2025"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isDelivered
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : isConfirmed
                    ? "bg-blue-500/15 text-blue-600 dark:text-[#3B82F6] border-blue-500/30"
                    : "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
                }`}
              >
                {isDelivered
                  ? isUz ? "Yetkazildi" : "Доставлен"
                  : isConfirmed
                  ? isUz ? "Yetkazilmoqda" : "В пути"
                  : isUz ? "Kutilmoqda" : "Ожидает"}
              </span>
            </div>
          </div>

          {/* 4-Stage Visual Timeline */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              {isUz ? "Buyurtma bosqichlari:" : "Этапы выполнения заказа:"}
            </span>
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {[
                { stage: 1, labelUz: "Qabul qilindi", labelRu: "Принят", active: true },
                {
                  stage: 2,
                  labelUz: "Tasdiqlandi",
                  labelRu: "Подтвержден",
                  active: isConfirmed,
                },
                {
                  stage: 3,
                  labelUz: "Yetkazilmoqda",
                  labelRu: "В пути",
                  active: isConfirmed,
                },
                { stage: 4, labelUz: "Yetkazildi", labelRu: "Доставлен", active: isDelivered },
              ].map((step) => (
                <div key={step.stage} className="space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-black transition-all ${
                      step.active
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-800"
                    }`}
                  >
                    {step.active ? <Check className="w-4 h-4 stroke-[3]" /> : step.stage}
                  </div>
                  <span
                    className={`text-[10px] font-bold block ${
                      step.active
                        ? "text-[#0F172A] dark:text-white"
                        : "text-[#64748B] dark:text-slate-400"
                    }`}
                  >
                    {isUz ? step.labelUz : step.labelRu}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items Breakdown */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                {isUz ? "Xarid qilingan kiyimlar:" : "Купленные товары:"}
              </span>
              <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400">
                {ord.items.length} {isUz ? "xil" : "шт"}
              </span>
            </div>

            <div className="space-y-2.5">
              {ord.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b]/70 border border-[#E2E8F0] dark:border-slate-700/60 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-white dark:bg-[#0f172a] shrink-0 border border-[#E2E8F0] dark:border-slate-700">
                      {it.image ? (
                        <Image src={it.image} alt={it.productName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate">
                        {it.productName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400">
                        {it.size && (
                          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-700 font-mono text-[#0F172A] dark:text-white font-bold">
                            {it.size}
                          </span>
                        )}
                        {it.color && (
                          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-700">
                            {it.color}
                          </span>
                        )}
                        <span>• {it.quantity} dona</span>
                      </div>
                      <p className="font-mono font-bold text-xs text-violet-700 dark:text-violet-400">
                        {formatUzbekCurrency(it.price * it.quantity)}
                      </p>
                    </div>
                  </div>

                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => {
                        const found = products.find((p) => p.id === it.productId);
                        if (found) {
                          onAddToCart(found, it.size, it.color);
                        } else {
                          onAddToCart(
                            {
                              id: it.productId,
                              name: it.productName,
                              price: it.price,
                              image: it.image || "/btn-logo.png",
                              description: "",
                              category: "suits",
                              sizes: [it.size || "M"],
                              isAvailable: true,
                            },
                            it.size,
                            it.color
                          );
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-[#2563EB] hover:text-white border border-[#E2E8F0] dark:border-slate-700 text-[11px] font-bold text-[#64748B] dark:text-slate-400 transition-colors cursor-pointer shrink-0"
                      title={isUz ? "Savatga qo'shish" : "В корзину"}
                    >
                      + {isUz ? "Savatga" : "В корзину"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            {/* Delivery type */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b]/70 border border-[#E2E8F0] dark:border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>{isUz ? "Yetkazib berish usuli" : "Способ доставки"}</span>
              </span>
              <p className="font-bold text-xs text-[#0F172A] dark:text-white">
                {ord.deliveryType === "pickup"
                  ? isUz ? "Filialdan olib ketish (Showroom)" : "Самовывоз из шоурума"
                  : isUz ? "Kuryer orqali yetkazish" : "Доставка курьером"}
              </p>
              {ord.branchName && (
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                  {isUz ? "Filial:" : "Филиал:"} <b className="text-[#0F172A] dark:text-white">{ord.branchName}</b>
                </p>
              )}
              {ord.address && (
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#E5485D]" />
                  <span>{ord.address}</span>
                </p>
              )}
            </div>

            {/* Recipient info */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b]/70 border border-[#E2E8F0] dark:border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{isUz ? "Qabul qiluvchi" : "Получатель"}</span>
              </span>
              <p className="font-bold text-xs text-[#0F172A] dark:text-white">
                {ord.customerName}
              </p>
              <p className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">
                {ord.customerPhone}
              </p>
              {ord.comment && (
                <p className="text-[10px] text-[#64748B] dark:text-slate-400 italic">
                  &ldquo;{ord.comment}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Payment & Total Amount */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white to-[#F8FAFC] dark:from-[#1e293b] dark:to-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B] dark:text-slate-400">
                {isUz ? "To'lov turi:" : "Способ оплаты:"}
              </span>
              <span className="font-bold uppercase text-[#0F172A] dark:text-white">
                {ord.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B] dark:text-slate-400">
                {isUz ? "To'lov holati:" : "Статус оплаты:"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  ord.paymentStatus === "paid"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                }`}
              >
                {ord.paymentStatus === "paid"
                  ? isUz ? "To'langan" : "Оплачено"
                  : isUz ? "To'lov kutilmoqda" : "Ожидает оплаты"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
              <span className="font-black text-sm text-[#0F172A] dark:text-white">
                {isUz ? "Jami summa:" : "Всего:"}
              </span>
              <span className="font-mono font-black text-lg text-violet-700 dark:text-violet-400">
                {formatUzbekCurrency(ord.totalAmount)}
              </span>
            </div>

            {/* Quick Online Payment if unpaid */}
            {ord.paymentStatus !== "paid" && (ord.paymentMethod === "click" || ord.paymentMethod === "payme") && (
              <div className="pt-2 flex gap-2">
                <a
                  href={clickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-[#0089D0] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 hover:brightness-110 shadow-sm"
                >
                  <span>Click orqali to&apos;lash</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={paymeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-[#00CCCC] text-zinc-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 hover:brightness-110 shadow-sm"
                >
                  <span>Payme orqali to&apos;lash</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Receipt Uploader */}
            <div className="pt-2">
              <ReceiptUploader
                orderId={ord.id}
                lang={lang}
                currentReceipt={ord.paymentReceipt}
                paymentStatus={ord.paymentStatus}
                rejectReason={ord.paymentRejectReason}
                onUploaded={() => {}}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleReorderAll(ord)}
              className="flex-1 py-3 px-4 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-700/25 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>{isUz ? "Buyurtmani takrorlash" : "Повторить заказ"}</span>
            </button>

            <a
              href="https://t.me/button_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-800 text-[#0F172A] dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#E2E8F0] dark:border-slate-800 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-[#2563EB]" />
              <span>{isUz ? "Yordam (Telegram)" : "Поддержка в Telegram"}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* 1. Header: ONLY Orders Title & Subtext (NO Profile Card) */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              {isUz ? "Mening buyurtmalarim" : "Мои заказы"}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {isUz
                ? "Barcha xaridlaringiz ro'yxati va holati"
                : "История всех ваших покупок и их статус"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshClick}
            className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
            title={isUz ? "Yangilash" : "Обновить"}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#2563EB]" : ""}`} />
          </button>
          <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400 px-2.5 py-1 rounded-xl bg-violet-500/10 border border-violet-500/20">
            {orders.length} {isUz ? "ta" : "зак."}
          </span>
        </div>
      </div>

      {/* 2. Filter Tabs: Barchasi, Kutilmoqda, Yetkazilmoqda, Yakunlandi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", labelUz: "Barchasi", labelRu: "Все", count: orders.length },
          { id: "pending", labelUz: "Kutilmoqda", labelRu: "Ожидает", count: pendingCount },
          { id: "shipping", labelUz: "Yetkazilmoqda", labelRu: "В пути", count: shippingCount },
          { id: "completed", labelUz: "Yakunlandi", labelRu: "Завершено", count: completedCount },
        ].map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as OrderFilterStatus)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-xs ${
                isSelected
                  ? "bg-[#2563EB] text-white shadow-blue-500/25"
                  : "bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              <span>{isUz ? tab.labelUz : tab.labelRu}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#F1F3F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#F1F3F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
              {isUz ? "Ushbu bo'limda buyurtmalar mavjud emas" : "В этом разделе нет заказов"}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
              {isUz
                ? "Katalogdagi zamonaviy erkaklar kiyimlarini ko'rib chiqing va buyurtma bering."
                : "Ознакомьтесь с коллекцией в каталоге и оформите первый заказ."}
            </p>
          </div>
          {onViewCatalog && (
            <button
              type="button"
              onClick={onViewCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-violet-700/20 cursor-pointer active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>{isUz ? "Katalogga o'tish" : "Перейти в каталог"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((ord) => {
            const isDelivered = ord.status === "delivered";
            const isShipping = ord.status === "confirmed";

            return (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-[#2563EB] hover:shadow-md dark:hover:shadow-2xl space-y-3.5 transition-all cursor-pointer group shadow-xs"
              >
                {/* Top Row: #BTN-XXXXX & Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#0F172A] dark:text-white group-hover:text-[#2563EB] transition-colors">
                      #{ord.id}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-slate-400">
                      {ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString(isUz ? "uz-UZ" : "ru-RU", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "12-okt, 2025"}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                      isDelivered
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : isShipping
                        ? "bg-blue-500/15 text-blue-600 dark:text-[#2563EB] border-blue-500/30"
                        : "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
                    }`}
                  >
                    {isDelivered
                      ? isUz ? "Yakunlandi" : "Завершен"
                      : isShipping
                      ? isUz ? "Yetkazilmoqda" : "В пути"
                      : isUz ? "Kutilmoqda" : "Ожидает"}
                  </span>
                </div>

                {/* Items Thumbnails Row */}
                <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-18 rounded-xl overflow-hidden bg-[#F1F3F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-800 shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      {item.size && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                          {item.size}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="flex-1 min-w-[120px] text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 pl-1">
                    {ord.items.map((i) => i.productName).join(", ")}
                  </div>
                </div>

                {/* Bottom Row: Total & "Batafsil ma'lumot" button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-slate-800">
                  <div className="text-xs">
                    <span className="text-[#64748B] dark:text-slate-400 mr-1.5">
                      {isUz ? "Umumiy summa:" : "Итого:"}
                    </span>
                    <span className="font-mono font-black text-sm text-violet-700 dark:text-violet-400">
                      {formatUzbekCurrency(ord.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] group-hover:translate-x-1 transition-transform">
                    <span>{isUz ? "Batafsil ma'lumot" : "Подробнее"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
