"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Store,
  CreditCard,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Phone,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Branch, CartItem, Language, PaymentMethod, StoreSettings, Order } from "@/types";
import { translations } from "@/lib/i18n";
import { BRANCHES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import ReceiptUploader from "./ReceiptUploader";

interface CartModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  lang: Language;
  settings?: StoreSettings | null;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderCreated?: (order: Order) => void;
  onNavigateToProducts?: () => void;
  onNavigateToOrders?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  cartItems,
  lang,
  settings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onNavigateToProducts,
  onNavigateToOrders,
}) => {
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const branches = settings?.branches && settings.branches.length > 0 ? settings.branches : BRANCHES;
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "beruniy");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("click");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");
  const [addressOrNote, setAddressOrNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  // Escape key accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 2-card payment states
  const [cardCopied, setCardCopied] = useState(false);
  const [card2Copied, setCard2Copied] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<"card1" | "card2">("card1");
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  // Countdown timer for scarcity (30 mins)
  const [timeLeft, setTimeLeft] = useState(28 * 60 + 45);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-fill customer info if available from localStorage or profile
  useEffect(() => {
    if (isOpen) {
      setOrderSuccessId(null);
      setErrorMessage("");
      setPaidConfirmed(false);
      try {
        const saved = localStorage.getItem("button_customer");
        if (saved) {
          const c = JSON.parse(saved);
          if (c.name) setCustomerName(c.name);
          if (c.phone) setCustomerPhone(c.phone);
          if (c.address) setAddressOrNote(c.address);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isUz = lang === "uz";
  const subtotalPrice = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  // Free delivery over 500,000 UZS or 30,000 UZS for courier
  const deliveryFee = deliveryType === "pickup" ? 0 : subtotalPrice >= 500000 ? 0 : 30000;
  const totalPrice = subtotalPrice + deliveryFee;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    setCustomerPhone(val);
  };

  // Card details from settings
  const card1Number = settings?.cardNumber || "8600 1234 5678 9999";
  const card1Holder = settings?.cardHolder || "BUTTON MEN WEAR LLC";
  const card1Bank = settings?.cardBank || "Kapitalbank (Uzcard)";
  const rawCard1 = card1Number.replace(/\s+/g, "");

  const card2Number = settings?.card2Number || "9860 1201 3344 7788";
  const card2Holder = settings?.card2Holder || "BUTTON MEN WEAR LLC";
  const card2Bank = settings?.card2Bank || "TBC Bank (Humo)";
  const card2Enabled = settings?.card2Enabled ?? false;
  const rawCard2 = card2Number.replace(/\s+/g, "");

  const handleCopyCard1 = () => {
    navigator.clipboard.writeText(rawCard1);
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2000);
  };

  const handleCopyCard2 = () => {
    navigator.clipboard.writeText(rawCard2);
    setCard2Copied(true);
    setTimeout(() => setCard2Copied(false), 2000);
  };

  // Target card for deep link payment
  const targetCardRaw = activeCardTab === "card2" && card2Enabled ? rawCard2 : rawCard1;
  const clickUrl = `https://my.click.uz/clickp2p/${targetCardRaw}?amount=${totalPrice}`;
  const paymeUrl = `https://payme.uz/fallback/pay/?card=${targetCardRaw}&amount=${totalPrice * 100}`;
  const uzumUrl = `https://uzumbank.uz/transfer`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const errors: { name?: string; phone?: string; address?: string } = {};

    if (cartItems.length === 0) {
      setErrorMessage(isUz ? "Savat bo'sh" : "Корзина пуста");
      return;
    }

    if (!customerName.trim()) {
      errors.name = isUz ? "Iltimos, ismingizni kiriting" : "Пожалуйста, введите ваше имя";
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      errors.phone = isUz
        ? "Telefon raqamini to'liq kiriting (+998 ...)"
        : "Введите полный номер телефона (+998 ...)";
    }

    if (deliveryType === "delivery" && !addressOrNote.trim()) {
      errors.address = isUz ? "Yetkazib berish manzilini kiriting" : "Введите адрес доставки";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(
        isUz
          ? "Iltimos, qizil bilan belgilangan maydonlarni to'g'ri to'ldiring"
          : "Пожалуйста, заполните выделенные поля корректно"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBranch = branches.find((b) => b.id === selectedBranchId);

      const itemsPayload = cartItems.map((it) => {
        const prodName = !isUz && it.product.nameRu ? it.product.nameRu : it.product.name;
        return {
          productId: it.productId,
          productName: it.color ? `${prodName} (${it.color})` : prodName,
          price: it.price,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          image: it.product.image,
        };
      });

      const orderPayload = {
        customerName,
        customerPhone,
        deliveryType,
        branchId: deliveryType === "pickup" ? selectedBranchId : undefined,
        branchName:
          deliveryType === "pickup"
            ? isUz
              ? selectedBranch?.name
              : selectedBranch?.nameRu || selectedBranch?.name
            : undefined,
        address: deliveryType === "delivery" ? addressOrNote : undefined,
        comment: addressOrNote,
        paymentMethod,
        paymentStatus: "pending" as const,
        items: itemsPayload,
        totalAmount: totalPrice,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccessId(data.order.id);
        onClearCart();

        if (onOrderCreated && data.order) {
          onOrderCreated(data.order);
        }

        // Direct resilient storage backup so orders are immediately preserved
        if (data.order) {
          try {
            const rawOrders = localStorage.getItem("button_customer_orders");
            const existingOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
            const nextOrders = [data.order, ...existingOrders.filter((o: Order) => o.id !== data.order.id)];
            localStorage.setItem("button_customer_orders", JSON.stringify(nextOrders));
          } catch (e) {}
        }

        // Save customer details in localStorage
        try {
          const existing = localStorage.getItem("button_customer");
          const custObj = existing ? JSON.parse(existing) : {};
          custObj.name = customerName;
          custObj.phone = customerPhone;
          if (deliveryType === "delivery" && addressOrNote) {
            custObj.address = addressOrNote;
          }
          localStorage.setItem("button_customer", JSON.stringify(custObj));
          localStorage.setItem("button_customer_phone", customerPhone);
        } catch (e) {}
      } else {
        setErrorMessage(data.error || "Xatolik yuz berdi");
      }
    } catch (err: unknown) {
      setErrorMessage(isUz ? "Aloqa uzildi, qaytadan urinib ko'ring" : "Ошибка связи, попробуйте снова");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-[#151B25] border border-[#293241] shadow-2xl text-[#F5F7FA] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#293241] flex items-center justify-between shrink-0 bg-[#121824]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A850]/15 text-[#E5A850] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-[#F5F7FA]">
                {isUz ? "Xaridlar savati" : "Корзина покупок"}
              </h2>
              <p className="text-xs text-[#9AA6B6]">
                {cartItems.length} {isUz ? "ta mahsulot" : "товаров"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C2430] border border-[#293241] text-[#9AA6B6] hover:text-[#F5F7FA] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {orderSuccessId ? (
            /* =================== SUCCESS SCREEN (Phase 5.3) =================== */
            <div className="py-2 space-y-4 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#16A879]/20 text-[#16A879] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-[#2878F0]/15 text-[#2878F0] border border-[#2878F0]/30">
                  Buyurtma #{orderSuccessId}
                </span>
                <h3 className="text-xl font-black mt-2 text-[#F5F7FA]">
                  {isUz ? "Buyurtmangiz qabul qilindi!" : "Заказ успешно принят!"}
                </h3>
                <p className="text-xs text-[#9AA6B6] mt-1 max-w-sm mx-auto">
                  {isUz
                    ? "BUTTON operatori 5 daqiqa ichida siz bilan bog'lanib buyurtmani tasdiqlaydi."
                    : "Менеджер BUTTON свяжется с вами в течение 5 минут для подтверждения."}
                </p>
              </div>

              {/* Bank Cards & Instant Payment Box */}
              <div className="p-4 rounded-2xl bg-[#090D14] border border-[#293241] text-left space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E5A850]">
                    <CreditCard className="w-4 h-4" />
                    <span>{isUz ? "To'lov uchun karta:" : "Карта для оплаты:"}</span>
                  </div>
                  {card2Enabled && (
                    <div className="flex p-0.5 rounded-lg bg-[#1C2430] text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveCardTab("card1")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          activeCardTab === "card1" ? "bg-[#2878F0] text-white" : "text-[#9AA6B6]"
                        }`}
                      >
                        1-Karta
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCardTab("card2")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          activeCardTab === "card2" ? "bg-[#16A879] text-white" : "text-[#9AA6B6]"
                        }`}
                      >
                        2-Karta
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#151B25] border border-[#293241]">
                  <div>
                    <span className="font-mono font-black text-sm tracking-widest text-[#E5A850] block">
                      {activeCardTab === "card2" && card2Enabled ? card2Number : card1Number}
                    </span>
                    <span className="text-[10px] text-[#9AA6B6] block mt-0.5">
                      {activeCardTab === "card2" && card2Enabled ? card2Holder : card1Holder} •{" "}
                      <span className="text-[#2878F0] font-bold">
                        {activeCardTab === "card2" && card2Enabled ? card2Bank : card1Bank}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={activeCardTab === "card2" && card2Enabled ? handleCopyCard2 : handleCopyCard1}
                    className="px-3 py-1.5 rounded-xl bg-[#E5A850] hover:bg-[#d69840] text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
                  >
                    {(activeCardTab === "card2" ? card2Copied : cardCopied) ? (
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

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#2878F0] hover:bg-blue-600 text-white text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Click</span>
                    <span className="text-[9px] opacity-80">{isUz ? "Ilovada to'lash" : "Оплата"}</span>
                  </a>
                  <a
                    href={paymeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#00CCCC]/20 hover:bg-[#00CCCC]/30 text-[#00CCCC] border border-[#00CCCC]/40 text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Payme</span>
                    <span className="text-[9px] opacity-80">{isUz ? "Ilovada to'lash" : "Оплата"}</span>
                  </a>
                  <a
                    href={uzumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#7000FF]/25 hover:bg-[#7000FF]/35 text-[#a855f7] border border-[#7000FF]/40 text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Uzum Bank</span>
                    <span className="text-[9px] opacity-80">{isUz ? "O'tkazma" : "Перевод"}</span>
                  </a>
                </div>

                {/* Paid confirmation & Receipt Upload (Phase 1: To'lov isboti) */}
                <div className="pt-2 border-t border-[#293241]">
                  <ReceiptUploader
                    orderId={orderSuccessId}
                    lang={lang}
                    onUploaded={() => setPaidConfirmed(true)}
                  />
                </div>
              </div>

              {/* Action Buttons: View Orders & Close */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToOrders) {
                      onNavigateToOrders();
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-[#E5A850] hover:bg-[#d69840] text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isUz ? "Buyurtmalarimni ko'rish" : "Мои заказы"}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-[#1C2430] hover:bg-[#252f3f] border border-[#293241] text-[#F5F7FA] font-bold text-xs transition-all cursor-pointer"
                >
                  {isUz ? "Yopish" : "Закрыть"}
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* =================== EMPTY CART (Phase 5.1) =================== */
            <div className="py-14 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#1C2430] border border-[#293241] flex items-center justify-center mx-auto text-[#9AA6B6]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-base sm:text-lg text-[#F5F7FA]">
                  {isUz ? "Savatingiz hozircha bo'sh" : "Ваша корзина пуста"}
                </h3>
                <p className="text-xs text-[#9AA6B6] max-w-xs mx-auto">
                  {isUz
                    ? "Hoziroq o'zingizga mos kiyimlarni toping."
                    : "Выберите подходящую одежду из каталога прямо сейчас."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToProducts) {
                    onNavigateToProducts();
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-[#E5A850] hover:bg-[#d69840] text-zinc-950 text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
              >
                {isUz ? "Katalogga o'tish" : "Перейти в каталог"}
              </button>
            </div>
          ) : (
            /* =================== ACTIVE CART & CHECKOUT FORM =================== */
            <div className="space-y-4 animate-fade-in">
              {/* Scarcity Countdown Banner */}
              <div className="p-3 rounded-2xl bg-[#E5A850]/10 border border-[#E5A850]/30 text-[#E5A850] text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isUz ? "Savatdagi kiyimlar siz uchun band qilindi:" : "Товары забронированы за вами:"}</span>
                </span>
                <span className="font-mono bg-[#E5A850]/20 px-2 py-0.5 rounded-lg text-[#E5A850] font-black tracking-wider">
                  {formatTimer(timeLeft)}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#9AA6B6] uppercase tracking-wider block">
                  {isUz ? "Tanlangan mahsulotlar:" : "Выбранные товары:"}
                </span>

                {cartItems.map((item) => {
                  const prodName = !isUz && item.product.nameRu ? item.product.nameRu : item.product.name;
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#1C2430] border border-[#293241] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-[#090D14] border border-[#293241]">
                          <Image src={item.product.image} alt={prodName} fill className="object-cover" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#F5F7FA] truncate">{prodName}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9AA6B6]">
                            <span>O'lcham: <b className="text-[#E5A850]">{item.size}</b></span>
                            {item.color && (
                              <span>• Rang: <b className="text-[#F5F7FA]">{item.color}</b></span>
                            )}
                          </div>
                          <span className="font-mono font-black text-[#F5F7FA] text-xs block mt-1">
                            {formatUzbekCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-[#151B25] rounded-xl border border-[#293241] p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-[#9AA6B6] hover:text-[#F5F7FA] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold font-mono text-xs px-2 text-[#F5F7FA]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-[#9AA6B6] hover:text-[#F5F7FA] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checkout Form (Phase 5.2) */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-[#293241]">
                <span className="text-xs font-bold text-[#9AA6B6] uppercase tracking-wider block">
                  {isUz ? "Yetkazib berish va qabul qiluvchi:" : "Данные для доставки:"}
                </span>

                {/* Delivery Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#1C2430] border border-[#293241]">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === "delivery"
                        ? "bg-[#2878F0] text-white shadow-sm font-black"
                        : "text-[#9AA6B6] hover:text-[#F5F7FA]"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isUz ? "Yetkazib berish" : "Доставка"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === "pickup"
                        ? "bg-[#2878F0] text-white shadow-sm font-black"
                        : "text-[#9AA6B6] hover:text-[#F5F7FA]"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{isUz ? "Filialdan olish" : "Самовывоз"}</span>
                  </button>
                </div>

                {/* Branch selector if pickup */}
                {deliveryType === "pickup" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#9AA6B6] block">
                      {isUz ? "Qaysi filialdan olib ketasiz?" : "Выберите филиал:"}
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#1C2430] border border-[#293241] text-[#F5F7FA] focus:outline-none focus:border-[#2878F0] font-bold"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id} className="bg-[#151B25]">
                          {isUz ? b.name : b.nameRu || b.name} ({b.landmark})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#9AA6B6] block mb-1">
                      {isUz ? "Ismingiz *:" : "Ваше имя *:"}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Jasur"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#1C2430] border text-[#F5F7FA] focus:outline-none transition-all font-semibold ${
                        fieldErrors.name
                          ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                          : "border-[#293241] focus:border-[#2878F0]"
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#9AA6B6] block mb-1">
                      {isUz ? "Telefon raqamingiz *:" : "Телефон *:"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => {
                        handlePhoneChange(e);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#1C2430] border text-[#F5F7FA] focus:outline-none transition-all ${
                        fieldErrors.phone
                          ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                          : "border-[#293241] focus:border-[#2878F0]"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {deliveryType === "delivery" && (
                  <div>
                    <label className="text-[11px] font-bold text-[#9AA6B6] block mb-1">
                      {isUz ? "Yetkazib berish manzili va mo'ljal:" : "Адрес доставки (район, улица, дом):"}
                    </label>
                    <input
                      type="text"
                      value={addressOrNote}
                      onChange={(e) => {
                        setAddressOrNote(e.target.value);
                        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      placeholder="Toshkent sh., Yunusobod 4-mavze, 12-uy..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#1C2430] border text-[#F5F7FA] focus:outline-none transition-all font-semibold ${
                        fieldErrors.address
                          ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                          : "border-[#293241] focus:border-[#2878F0]"
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.address}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Method Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#9AA6B6] block">
                    {isUz ? "To'lov turi:" : "Способ оплаты:"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "click", label: "Click" },
                      { id: "payme", label: "Payme" },
                      { id: "uzum", label: "Uzum" },
                      { id: "cash", label: isUz ? "Naqd" : "Наличные" },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          paymentMethod === pm.id
                            ? "bg-[#2878F0] text-white border-[#2878F0] shadow-sm"
                            : "bg-[#1C2430] text-[#9AA6B6] border-[#293241] hover:text-[#F5F7FA]"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center">
                    {errorMessage}
                  </p>
                )}

                {/* Price Breakdown */}
                <div className="p-3 rounded-2xl bg-[#1C2430] border border-[#293241] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#9AA6B6]">
                    <span>{isUz ? "Mahsulotlar summasi:" : "Сумма товаров:"}</span>
                    <span className="font-mono text-[#F5F7FA]">{formatUzbekCurrency(subtotalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#9AA6B6]">
                    <span>{isUz ? "Yetkazib berish:" : "Доставка:"}</span>
                    <span className="font-mono text-[#F5F7FA]">
                      {deliveryFee === 0
                        ? isUz ? "Bepul 🎉" : "Бесплатно 🎉"
                        : formatUzbekCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-[#293241] flex items-center justify-between text-sm font-black">
                    <span className="text-[#F5F7FA]">{isUz ? "Jami to'lov:" : "Итого:"}</span>
                    <span className="font-mono text-violet-400 font-bold">{formatUzbekCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Total & Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-700/20 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <span>{isSubmitting ? "..." : (isUz ? "Buyurtmani tasdiqlash" : "Оформить заказ")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
