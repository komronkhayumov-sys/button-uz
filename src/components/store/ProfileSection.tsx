"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  User,
  ShoppingBag,
  Ruler,
  Heart,
  Bookmark,
  MapPin,
  Settings,
  ChevronRight,
  ChevronLeft,
  Edit3,
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  Globe,
  Save,
  Sparkles,
  Truck,
  Plus,
  Trash2,
  ExternalLink,
  Phone,
  Info,
  Check,
  AlertCircle,
  LogOut,
  UserPlus,
  Smartphone,
  Download,
} from "lucide-react";
import { Customer, CustomerMeasurements, Language, Order, Product } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";
import ReceiptUploader from "@/components/store/ReceiptUploader";

interface ProfileSectionProps {
  customer: Customer | null;
  orders: Order[];
  products: Product[];
  wishlistIds: string[];
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSaveCustomer: (updated: Customer) => void;
  onLogoutCustomer?: () => void;
  onSelectProduct: (p: Product) => void;
  onViewCatalog: () => void;
  onAddToCart?: (product: Product, size?: string, color?: string) => void;
  initialSubView?: ProfileSubView;
}

export type ProfileSubView =
  | "overview"
  | "orders"
  | "measurements"
  | "wishlist"
  | "saved_looks"
  | "addresses"
  | "settings";

type OrderFilterStatus = "all" | "pending" | "shipping" | "completed";

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  customer,
  orders,
  products,
  wishlistIds,
  lang,
  onLanguageChange,
  onSaveCustomer,
  onLogoutCustomer,
  onSelectProduct,
  onViewCatalog,
  onAddToCart,
  initialSubView = "overview",
}) => {
  const isUz = lang === "uz";
  const [activeSubView, setActiveSubView] = useState<ProfileSubView>(initialSubView);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Sync initialSubView changes (e.g. redirected from CartModal / OrderModal)
  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  // Escape key accessibility (Phase 13)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedOrderDetails) {
          setSelectedOrderDetails(null);
        } else if (isEditingProfile) {
          setIsEditingProfile(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrderDetails, isEditingProfile]);

  // Order filter state matching Mockup Screen 6: Barchasi, Kutilmoqda, Yetkazilmoqda, Yakunlandi
  const [orderFilter, setOrderFilter] = useState<OrderFilterStatus>("all");

  // Edit form state & field validation (clean empty defaults for guest)
  const [editName, setEditName] = useState(customer?.name || "");
  const [editPhone, setEditPhone] = useState(customer?.phone || "+998 ");
  const [editAddress, setEditAddress] = useState(customer?.address || "");
  const [profileErrors, setProfileErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  // Measurements state
  const [height, setHeight] = useState<number>(customer?.measurements?.height || 0);
  const [weight, setWeight] = useState<number>(customer?.measurements?.weight || 0);
  const [chest, setChest] = useState<number>(customer?.measurements?.chest || 0);
  const [waist, setWaist] = useState<number>(customer?.measurements?.waist || 0);
  const [hips, setHips] = useState<number>(customer?.measurements?.hips || 0);
  const [standardSize, setStandardSize] = useState<string>(
    customer?.measurements?.standardSize || customer?.preferredSize || "L"
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Saved AI Looks
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);

  // Saved addresses list & validation
  const [savedAddresses, setSavedAddresses] = useState<string[]>(
    customer?.address ? [customer.address] : []
  );
  const [newAddressInput, setNewAddressInput] = useState("");
  const [newAddressError, setNewAddressError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Synchronize state when customer prop changes (login / logout / reload)
  useEffect(() => {
    setEditName(customer?.name || "");
    setEditPhone(customer?.phone || "+998 ");
    setEditAddress(customer?.address || "");
    if (customer?.measurements) {
      setHeight(customer.measurements.height || 0);
      setWeight(customer.measurements.weight || 0);
      setChest(customer.measurements.chest || 0);
      setWaist(customer.measurements.waist || 0);
      setHips(customer.measurements.hips || 0);
      setStandardSize(customer.measurements.standardSize || customer.preferredSize || "L");
    } else {
      setHeight(0);
      setWeight(0);
      setChest(0);
      setWaist(0);
      setHips(0);
      setStandardSize(customer?.preferredSize || "L");
    }
    if (customer?.address) {
      setSavedAddresses((prev) => (prev.includes(customer.address!) ? prev : [customer.address!, ...prev]));
    }
  }, [customer]);

  useEffect(() => {
    try {
      const looks = localStorage.getItem("button_saved_outfits");
      if (looks) {
        const parsed = JSON.parse(looks);
        if (Array.isArray(parsed)) {
          setSavedOutfits(parsed);
        }
      }
      const addrs = localStorage.getItem("button_saved_addresses");
      if (addrs) {
        const parsed = JSON.parse(addrs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string; address?: string } = {};

    if (!editName.trim()) {
      errors.name = isUz ? "Ismingizni kiriting" : "Введите ваше имя";
    }

    const digits = editPhone.replace(/\D/g, "");
    if (digits.length < 9) {
      errors.phone = isUz
        ? "Telefon raqamingizni to'liq kiriting (kamida 9 ta raqam)"
        : "Введите корректный номер телефона (не менее 9 цифр)";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    const updated: Customer = {
      id: customer?.id || `cust-${Date.now()}`,
      name: editName.trim() || "Mijoz",
      phone: editPhone.trim(),
      address: editAddress.trim(),
      preferredSize: standardSize,
      measurements: {
        height,
        weight,
        chest,
        waist,
        hips,
        standardSize,
      },
      ordersCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      registeredAt: customer?.registeredAt || new Date().toISOString(),
    };
    onSaveCustomer(updated);
    setIsEditingProfile(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleCalculateRecommendedSize = () => {
    // Smart estimation based on height & weight
    let rec = "L";
    if (weight < 65 || height < 170) rec = "S";
    else if (weight <= 75 && height <= 178) rec = "M";
    else if (weight <= 85 && height <= 184) rec = "L";
    else if (weight <= 95 && height <= 190) rec = "XL";
    else rec = "XXL";

    setStandardSize(rec);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleAddAddress = () => {
    const val = newAddressInput.trim();
    if (!val || val.length < 5) {
      setNewAddressError(
        isUz ? "Yetkazib berish manzilini batafsilroq kiriting" : "Укажите адрес доставки подробнее"
      );
      return;
    }
    setNewAddressError(null);
    const next = [...savedAddresses, val];
    setSavedAddresses(next);
    setNewAddressInput("");
    setIsAddingAddress(false);
    try {
      localStorage.setItem("button_saved_addresses", JSON.stringify(next));
    } catch (e) {}
  };

  const handleDeleteAddress = (idx: number) => {
    const next = savedAddresses.filter((_, i) => i !== idx);
    setSavedAddresses(next);
    try {
      localStorage.setItem("button_saved_addresses", JSON.stringify(next));
    } catch (e) {}
  };

  // Filtered orders list matching Mockup Screen 6
  const filteredOrders = useMemo(() => {
    if (orderFilter === "pending") {
      return orders.filter((o) => o.status === "new" || o.paymentStatus === "verifying");
    }
    if (orderFilter === "shipping") {
      return orders.filter((o) => o.status === "confirmed");
    }
    if (orderFilter === "completed") {
      return orders.filter((o) => o.status === "delivered");
    }
    return orders;
  }, [orders, orderFilter]);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  // If viewing order details modal/screen
  if (selectedOrderDetails) {
    const ord = selectedOrderDetails;
    return (
      <div className="space-y-4 animate-fade-in max-w-2xl mx-auto text-[#0F172A] dark:text-white">
        <button
          type="button"
          onClick={() => setSelectedOrderDetails(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isUz ? "Buyurtmalar ro'yxatiga qaytish" : "Назад к списку заказов"}</span>
        </button>

        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-6 shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-violet-700 dark:text-violet-400 font-bold">
                {isUz ? "Buyurtma raqami:" : "Номер заказа:"}
              </span>
              <h2 className="text-xl font-mono font-black text-[#0F172A] dark:text-white">#{ord.id}</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ""}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#2563EB]/15 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/30">
              {ord.status === "delivered"
                ? isUz ? "Yetkazildi" : "Доставлен"
                : ord.status === "confirmed"
                ? isUz ? "Yetkazilmoqda" : "В пути"
                : isUz ? "Qabul qilindi" : "Принят"}
            </span>
          </div>

          {/* 4-Stage Live Tracking Timeline */}
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
                  active: ord.status === "confirmed" || ord.status === "delivered",
                },
                {
                  stage: 3,
                  labelUz: "Yetkazilmoqda",
                  labelRu: "В пути",
                  active: ord.status === "confirmed" || ord.status === "delivered",
                },
                { stage: 4, labelUz: "Yetkazildi", labelRu: "Доставлен", active: ord.status === "delivered" },
              ].map((step) => (
                <div key={step.stage} className="space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-black transition-all ${
                      step.active
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700"
                    }`}
                  >
                    {step.active ? <Check className="w-4 h-4 stroke-[3]" /> : step.stage}
                  </div>
                  <span className={`text-[10px] font-bold block ${step.active ? "text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-slate-400"}`}>
                    {isUz ? step.labelUz : step.labelRu}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              {isUz ? "Xarid qilingan kiyimlar:" : "Купленные товары:"}
            </span>
            <div className="space-y-2">
              {ord.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white dark:bg-[#0f172a] shrink-0 border border-[#E2E8F0] dark:border-slate-700">
                      {it.image && (
                        <Image src={it.image} alt={it.productName} fill className="object-cover" unoptimized />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0F172A] dark:text-white">{it.productName}</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {isUz ? "O'lcham:" : "Размер:"} <b className="text-violet-700 dark:text-violet-400">{it.size}</b> • {it.quantity} dona
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs text-[#0F172A] dark:text-white">
                    {formatUzbekCurrency(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 text-xs">
            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
                {isUz ? "Yetkazib berish:" : "Доставка:"}
              </span>
              <p className="font-bold text-[#0F172A] dark:text-white">
                {ord.deliveryType === "pickup"
                  ? isUz ? `Showroomdan olib ketish (${ord.branchName || "Beruniy"})` : `Самовывоз (${ord.branchName})`
                  : ord.address || (isUz ? "Kuryer orqali yetkazish" : "Доставка курьером")}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
                {isUz ? "To'lov turi va holati:" : "Оплата:"}
              </span>
              <p className="font-bold text-[#0F172A] dark:text-white">
                {ord.paymentMethod?.toUpperCase()} •{" "}
                <span className="text-violet-700 dark:text-violet-400">
                  {ord.paymentStatus === "paid"
                    ? isUz ? "To'landi ✅" : "Оплачено ✅"
                    : ord.paymentStatus === "verifying"
                    ? isUz ? "Tekshirilmoqda ⏳" : "Проверяется ⏳"
                    : isUz ? "Kutilmoqda" : "Ожидает"}
                </span>
              </p>
            </div>
          </div>

          {/* Proof of Payment (ReceiptUploader) */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <ReceiptUploader
              orderId={ord.id}
              lang={lang}
              currentReceipt={ord.paymentReceipt}
              paymentStatus={ord.paymentStatus}
              rejectReason={ord.paymentRejectReason}
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-[#64748B] dark:text-slate-400">{isUz ? "Umumiy summa:" : "Итоговая сумма:"}</span>
            <span className="font-mono font-black text-lg text-violet-700 dark:text-violet-400">
              {formatUzbekCurrency(ord.totalAmount)}
            </span>
          </div>

          {/* Quick Support & Courier Contact (Flow E) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <a
              href="tel:+998946135555"
              className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" />
              <span>{isUz ? "Qo'llab-quvvatlash: +998 94 613 55 55" : "Служба заботы: +998 94 613 55 55"}</span>
            </a>
            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isUz ? "Ro'yxatga qaytish" : "К списку"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto text-[#0F172A] dark:text-white">
      {/* 1. Profile Header Card matching Mockup Screen 5 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar Circle */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg ${
              customer?.name
                ? "bg-gradient-to-tr from-[#2563EB] to-blue-400 text-white shadow-blue-500/20"
                : "bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-inner"
            }`}
          >
            {customer?.name ? (
              customer.name.slice(0, 2).toUpperCase()
            ) : (
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-500" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                {customer?.name || (isUz ? "Mehmon" : "Гость")}
              </h2>
              {!customer?.name && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                  {isUz ? "Yangi foydalanuvchi" : "Новый пользователь"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#64748B] dark:text-slate-400">
              {customer?.phone || (isUz ? "Telefon raqami kiritilmagan" : "Номер телефона не указан")}
            </p>
            {customer?.address ? (
              <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{customer.address}</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#94A3B8] dark:text-slate-500">
                {isUz ? "Buyurtmalarni boshqarish uchun profilingizni to'ldiring" : "Заполните данные для управления заказами"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              customer?.name
                ? "bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white"
                : "bg-[#2563EB] hover:bg-blue-600 text-white shadow-md shadow-blue-500/25"
            }`}
          >
            {customer?.name ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" />
                <span>{isUz ? "Profilni tahrirlash" : "Редактировать профиль"}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>{isUz ? "Profilni to'ldirish" : "Заполнить профиль"}</span>
              </>
            )}
          </button>

          {customer && onLogoutCustomer && (
            <button
              type="button"
              onClick={onLogoutCustomer}
              title={isUz ? "Chiqish" : "Выйти"}
              className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isUz ? "Ma'lumotlar muvaffaqiyatli saqlandi!" : "Данные успешно сохранены!"}</span>
        </div>
      )}

      {/* 2. Edit Profile Modal / Inline Form */}
      {isEditingProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#2563EB]/40 space-y-4 animate-slide-down shadow-xl"
        >
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#2563EB]" />
            <span>
              {customer?.name
                ? isUz ? "Shaxsiy ma'lumotlarni yangilash" : "Обновление личных данных"
                : isUz ? "Profil ma'lumotlarini kiritish" : "Заполнение данных профиля"}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Ismingiz:" : "Ваше имя:"}
              </label>
              <input
                type="text"
                value={editName}
                placeholder={isUz ? "Ism va familiyangizni kiriting" : "Введите имя и фамилию"}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border text-xs text-[#0F172A] dark:text-white focus:outline-none transition-colors ${
                  profileErrors.name
                    ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                    : "border-[#E2E8F0] dark:border-slate-700 focus:border-[#2563EB]"
                }`}
              />
              {profileErrors.name && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{profileErrors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Telefon raqamingiz:" : "Номер телефона:"}
              </label>
              <input
                type="tel"
                value={editPhone}
                placeholder="+998 90 123 45 67"
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith("+998") && val.trim().length > 0) val = "+998 " + val.replace(/^\+?/, "");
                  setEditPhone(val);
                  if (profileErrors.phone) setProfileErrors((p) => ({ ...p, phone: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border text-xs text-[#0F172A] dark:text-white font-mono focus:outline-none transition-colors ${
                  profileErrors.phone
                    ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                    : "border-[#E2E8F0] dark:border-slate-700 focus:border-[#2563EB]"
                }`}
              />
              {profileErrors.phone && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{profileErrors.phone}</span>
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Yetkazib berish manzili:" : "Адрес доставки:"}
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder={isUz ? "Toshkent sh., Yunusobod..." : "г. Ташкент..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              {isUz ? "Bekor qilish" : "Отмена"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-md"
            >
              {isUz ? "Saqlash" : "Сохранить"}
            </button>
          </div>
        </form>
      )}

      {/* 3. Subview Navigation Tabs (All matching Mockup Screen 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubView(activeSubView === "orders" ? "overview" : "orders")}
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            activeSubView === "orders"
              ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/25"
              : "bg-white dark:bg-[#0f172a] border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white hover:border-[#2563EB]/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>{isUz ? "Buyurtmalar" : "Заказы"}</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView(activeSubView === "measurements" ? "overview" : "measurements")}
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            activeSubView === "measurements"
              ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/25"
              : "bg-white dark:bg-[#0f172a] border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white hover:border-[#2563EB]/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <span>{isUz ? "O'lchamlar" : "Размеры"}</span>
          </div>
          <span className="text-[10px] font-mono text-violet-700 dark:text-violet-400">{standardSize}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView(activeSubView === "wishlist" ? "overview" : "wishlist")}
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            activeSubView === "wishlist"
              ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/25"
              : "bg-white dark:bg-[#0f172a] border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white hover:border-[#2563EB]/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{isUz ? "Sevimlilar" : "Избранное"}</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
            {wishlistIds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView(activeSubView === "saved_looks" ? "overview" : "saved_looks")}
          className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            activeSubView === "saved_looks"
              ? "bg-[#2563EB] border-[#2563EB] text-white shadow-md shadow-blue-500/25"
              : "bg-white dark:bg-[#0f172a] border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white hover:border-[#2563EB]/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-700 dark:text-violet-400" />
            <span>{isUz ? "Obrazlar" : "Образы"}</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/20">
            {savedOutfits.length}
          </span>
        </button>
      </div>

      {/* 4. Active Subview Panels */}

      {/* A. Mening buyurtmalarim matching Mockup Screen 6 */}
      {activeSubView === "orders" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2563EB]" />
              <span>{isUz ? "Mening buyurtmalarim" : "Мои заказы"}</span>
            </h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-mono">
              {filteredOrders.length} {isUz ? "ta ko'rsatilmoqda" : "показано"}
            </span>
          </div>

          {/* Filter tabs matching Mockup Screen 6: Barchasi, Kutilmoqda, Yetkazilmoqda, Yakunlandi */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", labelUz: "Barchasi", labelRu: "Все", count: orders.length },
              {
                id: "pending",
                labelUz: "Kutilmoqda",
                labelRu: "Ожидает",
                count: orders.filter((o) => o.status === "new" || o.paymentStatus === "verifying").length,
              },
              {
                id: "shipping",
                labelUz: "Yetkazilmoqda",
                labelRu: "В пути",
                count: orders.filter((o) => o.status === "confirmed").length,
              },
              {
                id: "completed",
                labelUz: "Yakunlandi",
                labelRu: "Завершено",
                count: orders.filter((o) => o.status === "delivered").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderFilter(tab.id as OrderFilterStatus)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderFilter === tab.id
                    ? "bg-[#2563EB] text-white shadow-sm font-black"
                    : "bg-white dark:bg-[#0f172a] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-800 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <span>{isUz ? tab.labelUz : tab.labelRu}</span>
                <span className="font-mono text-[10px] opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3 shadow-xs">
              <Package className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto opacity-40" />
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isUz
                  ? "Ushbu bo'limda buyurtmalar mavjud emas."
                  : "В этом разделе пока нет заказов."}
              </p>
              <button
                type="button"
                onClick={onViewCatalog}
                className="px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs cursor-pointer shadow-md shadow-violet-700/20"
              >
                {isUz ? "Katalogni ko'rish" : "Смотреть каталог"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => {
                const isDelivered = ord.status === "delivered";
                const isShipping = ord.status === "confirmed";

                return (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 hover:border-[#2563EB]/40 space-y-3.5 shadow-xs dark:shadow-md transition-all"
                  >
                    {/* Top Row: #BTN-XXXXX & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#0F172A] dark:text-white">
                          #{ord.id}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-slate-400">
                          {ord.createdAt
                            ? new Date(ord.createdAt).toLocaleDateString()
                            : "12.10.2025"}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                          isDelivered
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : isShipping
                            ? "bg-blue-50 dark:bg-blue-950/30 text-[#2563EB] dark:text-blue-400 border-blue-200 dark:border-blue-800/40"
                            : "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/40"
                        }`}
                      >
                        {isDelivered
                          ? isUz ? "Yakunlandi" : "Завершен"
                          : isShipping
                          ? isUz ? "Yetkazilmoqda" : "В пути"
                          : isUz ? "Kutilmoqda" : "Ожидает"}
                      </span>
                    </div>

                    {/* Order items thumbnails row matching Mockup Screen 6 */}
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
                      {ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 shrink-0"
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: Total & Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
                      <div className="text-xs">
                        <span className="text-[#64748B] dark:text-slate-400 mr-1.5">{isUz ? "Umumiy:" : "Итого:"}</span>
                        <span className="font-mono font-black text-sm text-[#0F172A] dark:text-white">
                          {formatUzbekCurrency(ord.totalAmount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(ord)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{isUz ? "Buyurtma tafsilotlari" : "Детали заказа"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* B. Kiyim o'lchamlarim (Body Measurements) */}
      {activeSubView === "measurements" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 animate-fade-in shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
          <div className="space-y-1">
            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-violet-700 dark:text-violet-400" />
              <span>{isUz ? "Kiyim o'lchamlarim" : "Мои параметры тела"}</span>
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {isUz
                ? "Bu o'lchamlar AI Stilistga sizga eng mos keladigan kiyimlarni tanlashga yordam beradi."
                : "Эти параметры помогут AI стилисту подбирать одежду с идеальной посадкой."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Bo'y (sm):" : "Рост (см):"}
              </label>
              <input
                type="number"
                value={height > 0 ? height : ""}
                placeholder="178"
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Vazn (kg):" : "Вес (кг):"}
              </label>
              <input
                type="number"
                value={weight > 0 ? weight : ""}
                placeholder="75"
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Standart razmer:" : "Обычно носите:"}
              </label>
              <select
                value={standardSize}
                onChange={(e) => setStandardSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                {["S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                  <option key={sz} value={sz} className="bg-white dark:bg-[#0f172a] text-[#0F172A] dark:text-white">
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Ko'krak aylanasi (sm):" : "Обхvat груди (см):"}
              </label>
              <input
                type="number"
                value={chest > 0 ? chest : ""}
                placeholder="102"
                onChange={(e) => setChest(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Bel aylanasi (sm):" : "Обхват талии (см):"}
              </label>
              <input
                type="number"
                value={waist > 0 ? waist : ""}
                placeholder="84"
                onChange={(e) => setWaist(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block mb-1">
                {isUz ? "Son aylanasi (sm):" : "Обхват бедер (см):"}
              </label>
              <input
                type="number"
                value={hips > 0 ? hips : ""}
                placeholder="98"
                onChange={(e) => setHips(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCalculateRecommendedSize}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUz ? "Razmerni avtomatik hisoblash" : "Рассчитать размер"}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUz ? "O'lchamlarni saqlash" : "Сохранить параметры"}</span>
            </button>
          </div>
        </div>
      )}

      {/* C. Sevimlilar (Wishlist) */}
      {activeSubView === "wishlist" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 animate-fade-in shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#EF4444]" />
              <span>{isUz ? "Sevimlilar" : "Избранное"}</span>
            </h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-mono">
              {wishlistedProducts.length} {isUz ? "ta mahsulot" : "товаров"}
            </span>
          </div>

          {wishlistedProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Heart className="w-10 h-10 mx-auto text-[#64748B] dark:text-slate-400 opacity-40" />
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isUz
                  ? "Hozircha sevimli mahsulotlaringiz yo'q. Katalogdan kiyimlarni saqlang."
                  : "У вас пока нет избранных товаров."}
              </p>
              <button
                type="button"
                onClick={onViewCatalog}
                className="px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs cursor-pointer shadow-md shadow-violet-700/20"
              >
                {isUz ? "Katalogni ko'rish" : "Смотреть каталог"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wishlistedProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB]/40 flex flex-col justify-between gap-2.5 group transition-all"
                >
                  <div
                    onClick={() => onSelectProduct(p)}
                    className="cursor-pointer space-y-2"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white dark:bg-[#0f172a]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-bold text-xs text-[#0F172A] dark:text-white truncate">
                      {isUz ? p.name : p.nameRu || p.name}
                    </h4>
                    <p className="font-mono font-black text-xs text-violet-700 dark:text-violet-400">
                      {formatUzbekCurrency(p.price)}
                    </p>
                  </div>

                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(p, p.sizes?.[0] || "M")}
                      className="w-full py-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isUz ? "Savatga" : "В корзину"}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* D. Saqlangan obrazlar (Saved AI Outfits) */}
      {activeSubView === "saved_looks" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 animate-fade-in shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-700 dark:text-violet-400" />
              <span>{isUz ? "Saqlangan obrazlar" : "Сохраненные образы"}</span>
            </h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400">
              {savedOutfits.length} {isUz ? "ta obraz" : "образов"}
            </span>
          </div>

          {savedOutfits.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-[#64748B] dark:text-slate-400 opacity-40" />
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isUz
                  ? "Hozircha saqlangan obrazlar yo'q. AI Mode orqali o'zingizga yoqqan obrazlarni saqlang."
                  : "Пока нет сохраненных образов. Создайте и сохраните их в разделе AI Mode."}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {savedOutfits.map((look: any, idx: number) => (
                <div
                  key={look.id || idx}
                  className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-3 hover:border-violet-600/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white">
                        {isUz ? look.titleUz : look.titleRu || look.titleUz}
                      </h4>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase tracking-wider font-mono">
                        {look.style}
                      </p>
                    </div>
                    <span className="font-mono font-black text-xs sm:text-sm text-violet-700 dark:text-violet-400">
                      {formatUzbekCurrency(look.discountedPrice || look.totalPrice)}
                    </span>
                  </div>

                  {/* Garments thumbnail row */}
                  <div className="grid grid-cols-3 gap-2">
                    {look.items?.map((item: any, iIdx: number) => (
                      <div
                        key={item.id + iIdx}
                        onClick={() => onSelectProduct(item)}
                        className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-700 cursor-pointer group"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* E. Yetkazib berish manzillari (Saved Addresses) */}
      {activeSubView === "addresses" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 animate-fade-in shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span>{isUz ? "Yetkazib berish manzillari" : "Адреса доставки"}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3 py-1 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUz ? "Yangi manzil" : "Добавить"}</span>
            </button>
          </div>

          {isAddingAddress && (
            <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-2">
              <input
                type="text"
                value={newAddressInput}
                onChange={(e) => {
                  setNewAddressInput(e.target.value);
                  if (newAddressError) setNewAddressError(null);
                }}
                placeholder={isUz ? "Toshkent sh., Mirzo Ulug'bek tumani, 5-uy..." : "Адрес..."}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0f172a] border text-xs text-[#0F172A] dark:text-white focus:outline-none transition-colors ${
                  newAddressError ? "border-rose-500 focus:border-rose-500" : "border-[#E2E8F0] dark:border-slate-700 focus:border-[#2563EB]"
                }`}
              />
              {newAddressError && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{newAddressError}</span>
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingAddress(false);
                    setNewAddressError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                >
                  {isUz ? "Bekor qilish" : "Отмена"}
                </button>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  {isUz ? "Qo'shish" : "Добавить"}
                </button>
              </div>
            </div>
          )}

          {savedAddresses.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-[#64748B] dark:text-slate-400 opacity-40" />
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isUz
                  ? "Hozircha saqlangan manzillar yo'q. \"Yangi manzil\" tugmasi orqali manzil qo'shing."
                  : "Пока нет сохраненных адресов. Добавьте адрес через кнопку \"Добавить\"."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span className="text-xs text-[#0F172A] dark:text-white truncate">{addr}</span>
                  </div>
                  {savedAddresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-1 text-[#64748B] dark:text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Menu List Links matching Mockup Screen 5 */}
      <div className="rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 divide-y divide-[#E2E8F0] dark:divide-slate-800 overflow-hidden shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-xl">
        {/* Mening buyurtmalarim */}
        <button
          type="button"
          onClick={() => setActiveSubView("orders")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1e293b] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#64748B] dark:text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Mening buyurtmalarim" : "Мои заказы"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Kiyim o'lchamlarim */}
        <button
          type="button"
          onClick={() => setActiveSubView("measurements")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1e293b] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-[#64748B] dark:text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Kiyim o'lchamlarim" : "Мои размеры"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Sevimlilar */}
        <button
          type="button"
          onClick={() => setActiveSubView("wishlist")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1e293b] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-[#64748B] dark:text-slate-400 group-hover:text-[#EF4444] transition-colors" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Sevimlilar" : "Избранное"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Saqlangan obrazlar */}
        <button
          type="button"
          onClick={() => setActiveSubView("saved_looks")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1e293b] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-[#64748B] dark:text-slate-400 group-hover:text-violet-600 transition-colors" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Saqlangan obrazlar" : "Сохраненные образы"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Manzillar */}
        <button
          type="button"
          onClick={() => setActiveSubView("addresses")}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1e293b] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#64748B] dark:text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Yetkazib berish manzillari" : "Адреса доставки"}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Do'kon ilovasini telefoningizga o'rnatish (PWA Install Action) */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-pwa-install"))}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group border-b border-[#E2E8F0] dark:border-slate-800"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white truncate">
                {isUz ? "BUTTON ilovasini telefoningizga o'rnatish" : "Установить приложение BUTTON на телефон"}
              </span>
              <span className="block text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                {isUz ? "Bosh ekranga qo'shish va 1 bosishda tezkor kirish (PWA)" : "Добавить на главный экран для быстрого входа"}
              </span>
            </div>
          </div>
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Sozlamalar: Til (UZ / RU) */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#64748B] dark:text-slate-400" />
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {isUz ? "Til (Язык интерфейса)" : "Язык интерфейса"}
            </span>
          </div>
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#1e293b] p-0.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => onLanguageChange("uz")}
              className={`px-3 py-1 rounded-lg transition-all ${
                lang === "uz" ? "bg-[#2563EB] text-white font-black shadow-xs" : "text-[#64748B] dark:text-slate-400"
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ru")}
              className={`px-3 py-1 rounded-lg transition-all ${
                lang === "ru" ? "bg-[#2563EB] text-white font-black shadow-xs" : "text-[#64748B] dark:text-slate-400"
              }`}
            >
              RU
            </button>
          </div>
        </div>

        {/* Profildan chiqish (agar profil to'ldirilgan bo'lsa) */}
        {customer && onLogoutCustomer && (
          <button
            type="button"
            onClick={onLogoutCustomer}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/70 dark:hover:bg-rose-950/25 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-rose-500 group-hover:text-rose-600 transition-colors" />
              <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                {isUz ? "Profildan chiqish" : "Выйти из профиля"}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
