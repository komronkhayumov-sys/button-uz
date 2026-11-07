"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  Store,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  Check,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { Branch, CartItem, Language, PaymentMethod, StoreSettings, Order } from "@/types";
import { DEFAULT_SETTINGS, BRANCHES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import ReceiptUploader from "@/components/store/ReceiptUploader";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";

export default function CartPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("uz");
  const isRu = lang === "ru";
  const [isDark, setIsDark] = useState<boolean>(false);

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Checkout Form State
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const branches = settings?.branches && settings.branches.length > 0 ? settings.branches : BRANCHES;
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "beruniy");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("click");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");
  const [addressOrNote, setAddressOrNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  // Payment card tabs & copy
  const [activeCardTab, setActiveCardTab] = useState<"card1" | "card2">("card1");

  // Load theme, cart, language, settings, and customer from localStorage / API
  useEffect(() => {
    // Theme sync
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

    // Language
    const savedLang = localStorage.getItem("button_lang");
    if (savedLang === "uz" || savedLang === "ru") {
      setLang(savedLang);
    }

    // Cart items
    try {
      const savedCart = localStorage.getItem("button_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
    }

    // Customer info
    try {
      const savedCustomer = localStorage.getItem("button_customer");
      if (savedCustomer) {
        const c = JSON.parse(savedCustomer);
        if (c.name) setCustomerName(c.name);
        if (c.phone) setCustomerPhone(c.phone);
        if (c.address) setAddressOrNote(c.address);
      }
    } catch (e) {}

    // Settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    try {
      localStorage.setItem("button_theme", nextTheme ? "dark" : "light");
      if (nextTheme) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
      }
    } catch (e) {}
  };

  // Save cart changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("button_cart", JSON.stringify(items));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((it) => {
        if (it.id === id) {
          const newQty = it.quantity + delta;
          return newQty > 0 ? { ...it, quantity: newQty } : null;
        }
        return it;
      })
      .filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((it) => it.id !== id);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    setCustomerPhone(val);
  };

  // Pricing calculations
  const subtotalPrice = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = deliveryType === "pickup" ? 0 : subtotalPrice >= 500000 ? 0 : 30000;
  const totalPrice = subtotalPrice + deliveryFee;
  const totalQuantity = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // Payment Cards configuration
  const card1Number = settings?.cardNumber || "8600 1234 5678 9999";
  const card2Number = settings?.card2Number || "9860 1201 3344 7788";
  const card2Enabled = settings?.card2Enabled ?? false;
  const rawCard1 = card1Number.replace(/\s+/g, "");
  const rawCard2 = card2Number.replace(/\s+/g, "");

  const targetCardRaw = activeCardTab === "card2" && card2Enabled ? rawCard2 : rawCard1;
  const clickUrl = `https://my.click.uz/clickp2p/${targetCardRaw}?amount=${totalPrice}`;
  const paymeUrl = `https://payme.uz/fallback/pay/?card=${targetCardRaw}&amount=${totalPrice * 100}`;

  // Submit Order to backend
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const errors: { name?: string; phone?: string; address?: string } = {};

    if (cartItems.length === 0) {
      setErrorMessage(isRu ? "Ваша корзина пуста" : "Savatingiz bo'sh");
      return;
    }

    if (!customerName.trim()) {
      errors.name = isRu ? "Пожалуйста, введите ваше имя" : "Iltimos, ismingizni kiriting";
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      errors.phone = isRu
        ? "Введите полный номер телефона (+998 ...)"
        : "Telefon raqamini to'liq kiriting (+998 ...)";
    }

    if (deliveryType === "delivery" && !addressOrNote.trim()) {
      errors.address = isRu ? "Введите адрес доставки" : "Yetkazib berish manzilini kiriting";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Save customer to localStorage
      try {
        localStorage.setItem(
          "button_customer",
          JSON.stringify({
            name: customerName.trim(),
            phone: customerPhone.trim(),
            address: addressOrNote.trim(),
          })
        );
        localStorage.setItem("button_customer_phone", customerPhone.trim());
      } catch (err) {}

      const branchName =
        deliveryType === "pickup"
          ? branches.find((b) => b.id === selectedBranchId)?.name || "Filial"
          : undefined;

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        address: deliveryType === "delivery" ? addressOrNote.trim() : undefined,
        branchId: deliveryType === "pickup" ? selectedBranchId : undefined,
        branchName,
        paymentMethod,
        items: cartItems.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          image: it.product.image,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          price: it.price,
        })),
        totalAmount: totalPrice,
        comment: addressOrNote.trim(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrderSuccess(data.order);
        // Save to customer orders list in localStorage
        try {
          const prevOrders = JSON.parse(localStorage.getItem("button_customer_orders") || "[]");
          localStorage.setItem("button_customer_orders", JSON.stringify([data.order, ...prevOrders]));
        } catch (e) {}
        // Clear cart
        saveCart([]);
      } else {
        setErrorMessage(data.error || (isRu ? "Ошибка оформления заказа" : "Buyurtma berishda xatolik yuz berdi"));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isRu ? "Ошибка сервера" : "Server bilan bog'lanishda xatolik"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1120] text-[#0F172A] dark:text-white pb-24 font-sans selection:bg-violet-700 selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">{isRu ? "Назад" : "Orqaga"}</span>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden relative border border-violet-500/40">
              <Image src="/btn-logo.png" alt="BUTTON" fill className="object-cover" unoptimized />
            </div>
            <span className="font-black text-sm tracking-widest text-[#0F172A] dark:text-white">
              BUTTON MEN
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Lang switcher */}
            <div className="flex p-0.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLang("uz");
                  localStorage.setItem("button_lang", "uz");
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  lang === "uz" ? "bg-violet-700 text-white shadow-xs font-black" : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang("ru");
                  localStorage.setItem("button_lang", "ru");
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  lang === "ru" ? "bg-violet-700 text-white shadow-xs font-black" : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                RU
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-violet-400" /> : <Moon className="w-4 h-4 text-violet-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-[#0F172A] dark:text-white">
                {isRu ? "Корзина и оформление" : "Savatcha va Buyurtma"}
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isRu
                  ? "Проверьте выбранные товары и подтвердите покупку"
                  : "Tanlangan kiyimlarni tekshiring va buyurtmani yakunlang"}
              </p>
            </div>
          </div>

          {cartItems.length > 0 && !orderSuccess && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-bold text-[#E5485D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isRu ? "Очистить" : "Tozalash"}</span>
            </button>
          )}
        </div>

        {/* 1. ORDER SUCCESS SCREEN */}
        {orderSuccess ? (
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0f172a] border border-emerald-500/40 text-center space-y-6 shadow-xl dark:shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-black text-xl sm:text-2xl text-[#0F172A] dark:text-white">
                {isRu ? "Заказ успешно принят!" : "Buyurtmangiz qabul qilindi!"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 max-w-md mx-auto">
                {isRu
                  ? `Номер заказа: #${orderSuccess.id}. Мы свяжемся с вами в течение 10 минут для подтверждения.`
                  : `Buyurtma raqami: #${orderSuccess.id}. Menejerlarimiz 10 daqiqa ichida siz bilan bog'lanishadi.`}
              </p>
            </div>

            {/* Total Paid Summary */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 max-w-md mx-auto flex items-center justify-between text-xs">
              <span className="font-bold text-[#64748B] dark:text-slate-400">
                {isRu ? "Сумма к оплате:" : "Jami summa:"}
              </span>
              <span className="font-mono font-black text-base text-violet-700 dark:text-violet-400">
                {formatUzbekCurrency(orderSuccess.totalAmount || totalPrice)}
              </span>
            </div>

            {/* Payment Deep Links if online */}
            {(orderSuccess.paymentMethod === "click" || orderSuccess.paymentMethod === "payme") && (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 max-w-md mx-auto space-y-3 text-left">
                <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {isRu ? "Оплата через карту/приложение:" : "To'lovni amalga oshirish:"}
                </p>
                <div className="flex gap-2">
                  <a
                    href={clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-[#0089D0] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 hover:brightness-110 shadow-sm"
                  >
                    <span>Click</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={paymeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-[#00CCCC] text-zinc-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 hover:brightness-110 shadow-sm"
                  >
                    <span>Payme</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Receipt Uploader */}
            <div className="max-w-md mx-auto">
              <ReceiptUploader
                orderId={orderSuccess.id}
                lang={lang}
                onUploaded={() => {}}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <Link
                href="/orders"
                className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs text-center transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                {isRu ? "Мои заказы" : "Buyurtmalarimga o'tish"}
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 px-4 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-xs text-center border border-[#E2E8F0] dark:border-slate-700 transition-all cursor-pointer"
              >
                {isRu ? "На главную" : "Katalogga qaytish"}
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* 2. EMPTY CART VIEW */
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-base text-[#0F172A] dark:text-white">
                {isRu ? "Ваша корзина пуста" : "Savatingiz hozircha bo'sh"}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
                {isRu
                  ? "Вы пока не добавили ни одного товара. Перейдите в каталог и выберите понравившиеся образы."
                  : "Siz hali birorta kiyim tanlamadingiz. Katalogdagi zamonaviy modellarni ko'rib chiqing."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-violet-700/25 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>{isRu ? "Перейти в каталог" : "Katalogga o'tish"}</span>
            </Link>
          </div>
        ) : (
          /* 3. CART REVIEW & CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Items list & Delivery options (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Items List Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3.5 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                  <h2 className="font-black text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                    <span>{isRu ? "Товары в заказе" : "Savatdagi kiyimlar"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold">
                      {totalQuantity}
                    </span>
                  </h2>
                  <span className="text-xs text-[#64748B] dark:text-slate-400">
                    {cartItems.length} {isRu ? "позиций" : "xil mahsulot"}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center gap-3 group">
                      {/* Product Thumbnail */}
                      <Link
                        href={`/product/${item.productId}`}
                        className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 shrink-0 cursor-pointer"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </Link>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white line-clamp-1 hover:text-violet-700 dark:hover:text-violet-400 transition-colors"
                        >
                          {isRu ? item.product.nameRu || item.product.name : item.product.name}
                        </Link>

                        {/* Options: Size & Color */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#64748B] dark:text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 font-mono text-[#0F172A] dark:text-white">
                            {item.size}
                          </span>
                          {item.color && (
                            <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700">
                              {item.color}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-1">
                          <p className="font-mono font-black text-xs sm:text-sm text-violet-700 dark:text-violet-400">
                            {formatUzbekCurrency(item.price * item.quantity)}
                          </p>

                          {/* Quantity stepper */}
                          <div className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 rounded-xl hover:bg-rose-500/10 text-[#94A3B8] hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title={isRu ? "Удалить" : "O'chirish"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery / Branch Pickup Selection Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>{isRu ? "Способ получения" : "Qabul qilish usuli"}</span>
                </h3>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryType === "delivery"
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                        : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>{isRu ? "Доставка курьером" : "Yetkazib berish"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryType === "pickup"
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                        : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{isRu ? "Самовывоз из шоурума" : "Filialdan olib ketish"}</span>
                  </button>
                </div>

                {/* Delivery details */}
                {deliveryType === "delivery" ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b]/70 border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <span>
                        {subtotalPrice >= 500000
                          ? isRu
                            ? "Бесплатная доставка по Ташкенту (при заказе от 500 000 сум)"
                            : "Toshkent bo'ylab bepul yetkazib berish (500 000 so'mdan yuqori)"
                          : isRu
                          ? "Доставка по Ташкенту: 30 000 сум (Бесплатно от 500 000 сум)"
                          : "Toshkent bo'ylab yetkazish: 30 000 so'm (500 000 so'mdan bepul)"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block">
                        {isRu ? "Адрес доставки (улица, дом, квартира, ориентир):" : "Yetkazish manzili (ko'cha, uy, mo'ljal):"}
                      </label>
                      <textarea
                        rows={2}
                        value={addressOrNote}
                        onChange={(e) => setAddressOrNote(e.target.value)}
                        placeholder={
                          isRu
                            ? "г. Ташкент, Чиланзар 7, дом 12, кв 34 (Ориентир: ТРЦ)"
                            : "Toshkent sh., Chilonzor 7, 12-uy (Mo'ljal: Savdo markazi)"
                        }
                        className={`w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border text-xs text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                          fieldErrors.address ? "border-rose-500" : "border-[#E2E8F0] dark:border-slate-700"
                        }`}
                      />
                      {fieldErrors.address && (
                        <p className="text-[11px] text-rose-500 font-bold">{fieldErrors.address}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Branch Selection */
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block">
                      {isRu ? "Выберите удобный шоурум:" : "Qulay filialni tanlang:"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {branches.map((b) => {
                        const isSelected = selectedBranchId === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBranchId(b.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? "bg-[#2563EB]/10 border-[#2563EB] text-[#0F172A] dark:text-white"
                                : "bg-[#F8FAFC] dark:bg-[#1e293b] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                            }`}
                          >
                            <Store className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#2563EB]" : "text-[#64748B] dark:text-slate-400"}`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-[#0F172A] dark:text-white truncate">{b.name}</p>
                              <p className="text-[11px] text-[#64748B] dark:text-slate-400 line-clamp-1">{b.address}</p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pt-0.5">{b.workingHours || "10:00 - 23:00"}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Customer details & Final Checkout Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              {/* Customer Contact Info Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3.5 shadow-sm dark:shadow-xl">
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>{isRu ? "Данные получателя" : "Qabul qiluvchi ma'lumotlari"}</span>
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block">
                      {isRu ? "Ваше имя:" : "Ismingiz:"}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isRu ? "Иван Иванов" : "Javohir Aliyev"}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border text-xs text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                        fieldErrors.name ? "border-rose-500" : "border-[#E2E8F0] dark:border-slate-700"
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-rose-500 font-bold">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64748B] dark:text-slate-400 block">
                      {isRu ? "Номер телефона:" : "Telefon raqamingiz:"}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="+998 90 123 45 67"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border text-xs font-mono text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                        fieldErrors.phone ? "border-rose-500" : "border-[#E2E8F0] dark:border-slate-700"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-rose-500 font-bold">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3 shadow-sm dark:shadow-xl">
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>{isRu ? "Способ оплаты" : "To'lov turi"}</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { id: "click", label: "Click", sub: "1-bosqichli to'lov" },
                    { id: "payme", label: "Payme", sub: "Ilova orqali" },
                    { id: "uzum", label: "Uzum Bank", sub: "Karta o'tkazma" },
                    { id: "cash", label: isRu ? "Наличные / Терминал" : "Naqd / Terminal", sub: isRu ? "При получении" : "Qabul qilinganda" },
                  ].map((pm) => {
                    const isChosen = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                          isChosen
                            ? "bg-[#2563EB]/10 border-[#2563EB] text-[#0F172A] dark:text-white shadow-xs"
                            : "bg-[#F8FAFC] dark:bg-[#1e293b] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                      >
                        <p className="text-xs font-bold text-[#0F172A] dark:text-white">{pm.label}</p>
                        <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-normal">{pm.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Summary Card & Submit Button */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-2xl">
                <h3 className="font-black text-sm text-[#0F172A] dark:text-white">
                  {isRu ? "Итог к оплате" : "Yakuniy hisob-kitob"}
                </h3>

                <div className="space-y-2 text-xs border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
                  <div className="flex justify-between text-[#64748B] dark:text-slate-400">
                    <span>{isRu ? "Товары:" : "Mahsulotlar:"}</span>
                    <span className="font-mono text-[#0F172A] dark:text-white">
                      {formatUzbekCurrency(subtotalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B] dark:text-slate-400">
                    <span>{isRu ? "Доставка:" : "Yetkazib berish:"}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {deliveryFee === 0
                        ? isRu
                          ? "Бесплатно"
                          : "Bepul"
                        : formatUzbekCurrency(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-black text-sm text-[#0F172A] dark:text-white">
                    {isRu ? "Всего к оплате:" : "Jami to'lov:"}
                  </span>
                  <span className="font-mono font-black text-xl text-violet-700 dark:text-violet-400">
                    {formatUzbekCurrency(totalPrice)}
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Confirm Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-4 rounded-2xl bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-violet-700/25 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isRu ? "Оформление..." : "Rasmiylashtirilmoqda..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isRu ? "Подтвердить заказ" : "Buyurtmani tasdiqlash"}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#64748B] dark:text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>
                    {isRu
                      ? "100% безопасная покупка и гарантия качества"
                      : "100% xavfsiz xarid va sifat kafolati"}
                  </span>
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* PWA Prompt */}
      <PwaInstallPrompt lang={lang} target="store" />
    </div>
  );
}
