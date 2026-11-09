"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Truck,
  Store,
  Phone,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldCheck,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Eye,
  Ruler,
  MapPin,
} from "lucide-react";
import { Branch, Language, PaymentMethod, Product, StoreSettings, Order } from "@/types";
import { translations } from "@/lib/i18n";
import { BRANCHES } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import { getStoreTimeStatus } from "@/lib/time";
import ReceiptUploader from "./ReceiptUploader";
import SmartSizeCalculator from "./SmartSizeCalculator";

interface OrderModalProps {
  product: Product | null;
  lang: Language;
  settings?: StoreSettings | null;
  initialMode?: "detail" | "checkout";
  initialSize?: string;
  initialColor?: string;
  initialQuantity?: number;
  onClose: () => void;
  onAddToCart?: (product: Product, size: string, color?: string, quantity?: number) => void;
  onOrderCreated?: (order: Order) => void;
  onNavigateToOrders?: () => void;
  allProducts?: Product[];
  onSelectRelatedProduct?: (product: Product) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  lang,
  settings,
  initialMode = "detail",
  initialSize,
  initialColor,
  initialQuantity = 1,
  onClose,
  onAddToCart,
  onOrderCreated,
  onNavigateToOrders,
  allProducts,
  onSelectRelatedProduct,
}) => {
  // Modal flow state: "detail" (view product & 10 photos) or "checkout" (order form)
  const [modalMode, setModalMode] = useState<"detail" | "checkout">(initialMode);

  // Gallery state for up to 10 images
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Configuration state
  const [selectedSize, setSelectedSize] = useState<string>(initialSize || "");
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || "");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [addedToCartAnim, setAddedToCartAnim] = useState(false);
  const [isSizeCalcOpen, setIsSizeCalcOpen] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [addedRelId, setAddedRelId] = useState<string | null>(null);

  // Checkout form state
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryRegion, setDeliveryRegion] = useState<"tashkent" | "regions">("tashkent");
  const branches = settings?.branches && settings.branches.length > 0 ? settings.branches : BRANCHES;
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || "beruniy");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("click");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");
  const [addressOrNote, setAddressOrNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [showShowrooms, setShowShowrooms] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    size?: string;
  }>({});

  // Escape key accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (product) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  // Card copy states
  const [cardCopied, setCardCopied] = useState(false);
  const [card2Copied, setCard2Copied] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<"card1" | "card2">("card1");
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  // Auto-initialize options when product changes
  useEffect(() => {
    if (product) {
      setModalMode(initialMode || "detail");
      setActiveImageIndex(0);
      setQuantity(initialQuantity || 1);
      setSelectedSize(initialSize || product.sizes?.[0] || "M");
      setSelectedColor(initialColor || product.colors?.[0] || "");
      setOrderSuccessId(null);
      setErrorMessage("");
      setPaidConfirmed(false);

      // Pre-fill customer from localStorage if available
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
  }, [product, initialMode, initialSize, initialColor, initialQuantity]);

  if (!product) return null;

  const t = translations[lang];
  const isUz = lang === "uz";
  const productName = lang === "ru" && product.nameRu ? product.nameRu : product.name;
  const productDesc = lang === "ru" && product.descriptionRu ? product.descriptionRu : product.description;
  const subtotalPrice = product.price * quantity;

  // Delivery Pricing (Adjustable by Admin)
  const deliveryPriceTashkent = settings?.deliveryPriceTashkent ?? 30000;
  const deliveryFreeThresholdTashkent = settings?.deliveryFreeThresholdTashkent ?? 500000;
  const deliveryPriceRegions = settings?.deliveryPriceRegions ?? 40000;
  const deliveryFreeThresholdRegions = settings?.deliveryFreeThresholdRegions ?? 1000000;

  const deliveryFee =
    deliveryType === "pickup"
      ? 0
      : deliveryRegion === "tashkent"
      ? subtotalPrice >= deliveryFreeThresholdTashkent
        ? 0
        : deliveryPriceTashkent
      : subtotalPrice >= deliveryFreeThresholdRegions
      ? 0
      : deliveryPriceRegions;
  const totalPrice = subtotalPrice + deliveryFee;

  // Compile up to 10 gallery photos
  const galleryImages: string[] = Array.from(
    new Set([product.image, ...(product.images || [])].filter(Boolean))
  ).slice(0, 10);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleAddToCartClick = () => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      return;
    }
    setSizeWarning(false);
    if (onAddToCart) {
      onAddToCart(product, selectedSize || product.sizes[0] || "M", selectedColor, quantity);
      setAddedToCartAnim(true);
      setTimeout(() => setAddedToCartAnim(false), 2000);
    }
  };

  const handleProceedToCheckout = () => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      return;
    }
    setSizeWarning(false);
    setModalMode("checkout");
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

  // Deep payment links
  const targetCardRaw = activeCardTab === "card2" && card2Enabled ? rawCard2 : rawCard1;
  const clickUrl = `https://my.click.uz/clickp2p/${targetCardRaw}?amount=${totalPrice}`;
  const paymeUrl = `https://payme.uz/fallback/pay/?card=${targetCardRaw}&amount=${totalPrice * 100}`;
  const uzumUrl = `https://uzumbank.uz/transfer`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    setCustomerPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const errors: { name?: string; phone?: string; address?: string; size?: string } = {};

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

      const orderPayload = {
        customerName,
        customerPhone,
        deliveryType,
        deliveryRegion: deliveryType === "delivery" ? deliveryRegion : undefined,
        branchId: deliveryType === "pickup" ? selectedBranchId : undefined,
        branchName:
          deliveryType === "pickup"
            ? isUz
              ? selectedBranch?.name
              : selectedBranch?.nameRu || selectedBranch?.name
            : undefined,
        address:
          deliveryType === "delivery"
            ? `${deliveryRegion === "regions" ? "[Viloyatga yetkazish] " : "[Toshkent shahri] "}${addressOrNote}`
            : undefined,
        comment: addressOrNote,
        paymentMethod,
        paymentStatus: "pending" as const,
        items: [
          {
            productId: product.id,
            productName,
            price: product.price,
            size: selectedSize || "M",
            color: selectedColor || (product.colors && product.colors[0]) || "Standart",
            quantity,
            image: product.image,
          },
        ],
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

        // Notify parent about order creation to sync "Mening Buyurtmalarim"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1222] rounded-3xl border border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {modalMode === "checkout" && !orderSuccessId && (
              <button
                type="button"
                onClick={() => setModalMode("detail")}
                className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer mr-1"
                title="Orqaga"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {orderSuccessId
                ? t.orderSuccessTitle
                : modalMode === "checkout"
                ? isUz
                  ? "Buyurtmani rasmiylashtirish"
                  : "Оформление заказа"
                : isUz
                ? "Mahsulot tafsilotlari"
                : "Детали товара"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {orderSuccessId ? (
            /* =================== ORDER SUCCESS SCREEN =================== */
            <div className="py-2 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t.orderSuccessTitle}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  {t.orderSuccessDesc}
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-zinc-50 dark:bg-slate-900/70 rounded-2xl border border-zinc-200/80 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">{t.orderIdLabel}</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                    #{orderSuccessId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Mahsulot:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                    {productName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                  <span>Variant:</span>
                  <span>
                    O'lcham: {selectedSize} {selectedColor ? `• Rang: ${selectedColor}` : ""} • {quantity} dona
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200 dark:border-slate-800 pt-2 font-bold">
                  <span>Jami to'lov:</span>
                  <span className="text-emerald-500 text-base font-black font-mono">
                    {formatUzbekCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Bank Cards & Instant Payment Box */}
              <div className="p-4 bg-[#0a0f1d] text-white rounded-2xl border border-blue-500/30 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                    <CreditCard className="w-4 h-4" />
                    <span>To'lov kartalari (Humo / Uzcard)</span>
                  </div>
                  {card2Enabled && (
                    <div className="flex p-0.5 rounded-lg bg-white/10 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveCardTab("card1")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          activeCardTab === "card1" ? "bg-blue-600 text-white" : "text-zinc-400"
                        }`}
                      >
                        1-Karta
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCardTab("card2")}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          activeCardTab === "card2" ? "bg-emerald-600 text-white" : "text-zinc-400"
                        }`}
                      >
                        2-Karta
                      </button>
                    </div>
                  )}
                </div>

                {/* Card details */}
                <div className="bg-black/60 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm tracking-widest text-violet-300 block">
                      {activeCardTab === "card2" && card2Enabled ? card2Number : card1Number}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span>{activeCardTab === "card2" && card2Enabled ? card2Holder : card1Holder}</span>
                      <span>•</span>
                      <span className="text-blue-400 font-bold">
                        {activeCardTab === "card2" && card2Enabled ? card2Bank : card1Bank}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={activeCardTab === "card2" && card2Enabled ? handleCopyCard2 : handleCopyCard1}
                    className="px-3 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-violet-700/20 shrink-0"
                  >
                    {(activeCardTab === "card2" ? card2Copied : cardCopied) ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Nusxalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Karta nusxasi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instant Deep App Payment Links */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Click</span>
                    <span className="text-[9px] opacity-80">Ilovada to'lash</span>
                  </a>
                  <a
                    href={paymeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Payme</span>
                    <span className="text-[9px] opacity-80">Ilovada to'lash</span>
                  </a>
                  <a
                    href={uzumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-center flex flex-col items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <span className="font-black text-xs">Uzum Bank</span>
                    <span className="text-[9px] opacity-80">O'tkazma</span>
                  </a>
                </div>

                {/* Paid confirmation & Receipt Upload (FAZA 1: To'lov isboti) */}
                <div className="pt-2 border-t border-white/10">
                  <ReceiptUploader
                    orderId={orderSuccessId}
                    lang={lang}
                    onUploaded={() => setPaidConfirmed(true)}
                  />
                </div>
              </div>

              {/* Action Buttons: View Orders & Close (Flow A fulfillment) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToOrders) {
                      onNavigateToOrders();
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-[#E5A850] hover:bg-[#d69840] text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isUz ? "Buyurtmalarimni ko'rish" : "Мои заказы"}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] hover:bg-[#F1F5F9] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>
          ) : modalMode === "detail" ? (
            /* =================== 1. FULL PRODUCT DETAIL & 10 PHOTOS VIEW =================== */
            <div className="space-y-4">
              {/* Main Photo with Swipe / Arrows & Badge */}
              <div className="relative aspect-[4/4.2] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-slate-900 border border-zinc-200/80 dark:border-slate-800 group shadow-sm">
                <Image
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={productName}
                  fill
                  className="object-cover transition-transform duration-500"
                  priority
                  unoptimized
                />

                {/* Badge top-left */}
                {product.badge && (
                  <span
                    className={`absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md ${
                      product.badge === "Xit" || product.badge === "Хит"
                        ? "bg-violet-700 text-white"
                        : product.badge === "Yangi" || product.badge === "Новинка"
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}

                {/* Image counter top-right */}
                {galleryImages.length > 1 && (
                  <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                )}

                {/* Left / Right Nav Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* 10 Thumbnails Gallery Row */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-blue-600 scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}

              {/* Title, Rating, Pricing & In-stock matching Mockup Screen 2 */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
                    {productName}
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    Sotuvda mavjud
                  </span>
                </div>

                {/* Rating ★ 4.8 (124 sharh) & Showroom Stock */}
                <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviews(!showReviews);
                      if (!showReviews) setShowShowrooms(false);
                    }}
                    className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer"
                  >
                    <span>★ 4.8</span>
                    <span className="text-zinc-500 dark:text-[#64748B] font-normal underline decoration-dotted">
                      (124 {isUz ? "sharh" : "отзыва"})
                    </span>
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShowrooms(!showShowrooms);
                      if (!showShowrooms) setShowReviews(false);
                    }}
                    className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <span>{isUz ? "4 ta showroomda bor" : "В 4 шоурумах"}</span>
                  </button>
                </div>

                {/* Customer Reviews Dropdown (Phase 2 & P3 Prioritet) */}
                {showReviews && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3 animate-fade-in text-xs shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A] dark:text-white">
                          {isUz ? "Mijozlarimiz sharhlari (4.8 / 5.0)" : "Отзывы клиентов (4.8 / 5.0)"}
                        </span>
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">★★★★★</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowReviews(false)}
                        className="text-[11px] text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer font-bold"
                      >
                        {isUz ? "Yopish ✕" : "Закрыть ✕"}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {[
                        {
                          name: "Jasur Komilov",
                          date: "3 kun oldin",
                          textUz: "Kiyim sifati kutilganidan ham a'lo chiqdi! Matosi juda mayin, bichimi gavdaga aynan quyilgandek o'tirdi. Chilonzor showroomidan olgandim.",
                          textRu: "Качество превзошло ожидания! Ткань очень приятная, покрой сидит идеально. Забирал из шоурума Чиланзар.",
                        },
                        {
                          name: "Sardor Rahimov",
                          date: "1 hafta oldin",
                          textUz: "Tezkor yetkazib berish xizmati uchun alohida rahmat. O'lchami bo'y-vazn kalkulyatori aytganidek L o'lcham to'liq mos keldi.",
                          textRu: "Спасибо за оперативную доставку курьером. Размер L подошел в точности по калькулятору.",
                        },
                        {
                          name: "Alisher Vohidov",
                          date: "2 hafta oldin",
                          textUz: "Klassik kostyum va ko'ylak kombinatsiyasini to'y marosimi uchun xarid qildim. Hamma qayerdan olganimni so'radi. Rahmat BUTTON jamoasi!",
                          textRu: "Брал классический комплект на свадьбу. Все спрашивали, где купил. Рекомендую BUTTON!",
                        },
                      ].map((rev, rIdx) => (
                        <div key={rIdx} className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0F172A] dark:text-white">{rev.name}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                {isUz ? "Xaridor ✓" : "Покупатель ✓"}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400">{rev.date}</span>
                          </div>
                          <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
                            {isUz ? rev.textUz : rev.textRu}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showShowrooms && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-2.5 animate-fade-in text-xs shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        {isUz ? "Toshkent filiallarida mavjud:" : "Наличие в шоурумах Ташкента:"}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${getStoreTimeStatus(lang).isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStoreTimeStatus(lang).isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span>{isUz ? getStoreTimeStatus(lang).statusTextUz : getStoreTimeStatus(lang).statusTextRu}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {branches.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-[#0F172A] dark:text-white truncate">{isUz ? b.name : b.nameRu || b.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                                {isUz ? "Mavjud ✓" : "В наличии ✓"}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#64748B] dark:text-slate-400 line-clamp-1 mt-0.5">{isUz ? b.address : b.addressRu || b.address}</p>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0] dark:border-slate-800">
                            <a
                              href={b.yandexMap || b.googleMap || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#2563EB] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                            >
                              <MapPin className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                              <span>{isUz ? "Xaritada" : "На карте"}</span>
                            </a>
                            <span className="text-zinc-300 dark:text-slate-700">|</span>
                            <a
                              href={`https://3.redirect.appmetrica.yandex.com/route?end-lat=${b.coordinates?.lat || 41.3}&end-lon=${b.coordinates?.lng || 69.2}&appmetrica_tracking_id=1178268795219780156`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                            >
                              <span>🚕 {isUz ? "Yandex Go" : "Такси"}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing & Discount */}
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono font-black text-xl sm:text-2xl text-zinc-950 dark:text-white">
                    {formatUzbekCurrency(product.price)}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <>
                      <span className="font-mono text-xs text-zinc-400 line-through">
                        {formatUzbekCurrency(product.oldPrice)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E5A850] text-zinc-950">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Colors Selection - Circular Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {isUz ? "Rangni tanlang:" : "Выберите цвет:"}{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-black">{selectedColor || product.colors[0]}</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((color) => {
                      const isChosen = (selectedColor || product.colors?.[0]) === color;
                      const colorMap: Record<string, string> = {
                        "Qora": "#18181B",
                        "To'q ko'k": "#1E3A8A",
                        "Kulrang": "#52525B",
                        "Oq": "#F4F4F5",
                        "Jigarrang": "#78350F",
                        "Ko'k": "#2563EB",
                      };
                      const bgHex = colorMap[color] || "#27272A";

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isChosen
                              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110 shadow-md"
                              : "opacity-75 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: bgHex }}
                          title={color}
                        >
                          {isChosen && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Selection */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {t.selectSize}:{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-black">{selectedSize || "Tanlanmagan"}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeCalcOpen(true)}
                    className="text-[11px] font-bold text-[#E5A850] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{lang === "ru" ? "Таблица размеров" : "O'lchamlar jadvali"}</span>
                  </button>
                </div>

                {sizeWarning && (
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1.5 animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{isUz ? "Iltimos, avval kiyim razmerini tanlang!" : "Пожалуйста, выберите размер!"}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isChosen = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeWarning(false);
                        }}
                        className={`min-w-[46px] h-10 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          isChosen
                            ? "bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 shadow-md scale-105 border border-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {isUz ? "Xarid miqdori:" : "Количество:"}
                </span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-zinc-200 dark:border-slate-700 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-black px-2 min-w-[20px] text-center font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Description & Premium Fabric Details */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-800 text-xs">
                <h4 className="font-black text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUz ? "Mahsulot haqida" : "О товаре"}</span>
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {productDesc || "BUTTON Men's Wear premium erkaklar kiyimi. Yuqori sifatli mato va qulay bichim."}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700">
                    ✓ 100% Asl Sifat
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700">
                    ✓ Bepul o'lchab ko'rish
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700">
                    ✓ Tezkor kuryer
                  </span>
                </div>
              </div>

              {/* Cross-sell & Related Products (Enhanced: Rich Recommendations to Maximize Sales) */}
              {allProducts && allProducts.length > 1 && (
                <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span>{isUz ? "Ushbu kiyimga mos tavsiyalar:" : "С этим товаром отлично сочетается:"}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">
                      {isUz ? "Ko'proq tanlov" : "Больше вариантов"}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Recommendations List */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
                    {allProducts
                      .filter((p) => p.id !== product.id && p.isAvailable !== false)
                      .slice(0, 10)
                      .map((rel) => {
                        const isRelAdded = addedRelId === rel.id;
                        return (
                          <div
                            key={rel.id}
                            className="w-36 shrink-0 p-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 hover:border-violet-600/50 transition-all flex flex-col justify-between group shadow-xs"
                          >
                            <div
                              onClick={() => {
                                if (onSelectRelatedProduct) {
                                  onSelectRelatedProduct(rel);
                                }
                              }}
                              className="cursor-pointer space-y-1.5"
                            >
                              <div className="relative aspect-[3/4] w-full rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] overflow-hidden border border-[#E2E8F0] dark:border-slate-700">
                                <Image
                                  src={rel.image}
                                  alt={rel.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  unoptimized
                                />
                                {rel.badge && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-violet-700 text-white">
                                    {rel.badge}
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-[11px] text-[#0F172A] dark:text-white line-clamp-1 group-hover:text-violet-600 transition-colors">
                                {isUz ? rel.name : rel.nameRu || rel.name}
                              </h5>
                              <p className="font-mono font-black text-xs text-violet-700 dark:text-violet-400" suppressHydrationWarning>
                                {formatUzbekCurrency(rel.price)}
                              </p>
                            </div>

                            {/* Direct "+ Savatga" action button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAddToCart) {
                                  onAddToCart(rel, rel.sizes?.[0] || "M", rel.colors?.[0] || "", 1);
                                  setAddedRelId(rel.id);
                                  setTimeout(() => setAddedRelId(null), 1500);
                                }
                              }}
                              className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                                isRelAdded
                                  ? "bg-[#10B981] text-white"
                                  : "bg-violet-700 hover:bg-violet-800 text-white shadow-xs shadow-violet-700/20"
                              }`}
                            >
                              {isRelAdded ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>{isUz ? "Qo'shildi!" : "Добавлено!"}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
                                  <span>{isUz ? "+ Savatga" : "+ В корзину"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================== 2. CHECKOUT FORM VIEW =================== */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product recap pill */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
                <div className="relative w-12 h-14 rounded-xl bg-zinc-200 dark:bg-slate-800 overflow-hidden shrink-0">
                  <Image src={product.image} alt={productName} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {productName}
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    {selectedSize} {selectedColor ? `• ${selectedColor}` : ""} • {quantity} dona
                  </p>
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                    {formatUzbekCurrency(totalPrice)}
                  </p>
                </div>
              </div>

              {/* Delivery method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.deliveryTypeLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryType === "delivery"
                        ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-800/40 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>{isUz ? "Yetkazib berish" : "Доставка курьером"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryType === "pickup"
                        ? "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-800/40 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{isUz ? "Filialdan olib ketish" : "Самовывоз"}</span>
                  </button>
                </div>

                {/* Destination Selector: Toshkent vs Viloyatlar */}
                {deliveryType === "delivery" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryRegion("tashkent")}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        deliveryRegion === "tashkent"
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-600 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30"
                          : "border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <div>{isUz ? "Toshkent shahri" : "Ташкент"}</div>
                      <div className="text-[10px] font-normal opacity-75">
                        {subtotalPrice >= deliveryFreeThresholdTashkent ? (isUz ? "Bepul" : "Бесплатно") : formatUzbekCurrency(deliveryPriceTashkent)}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryRegion("regions")}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        deliveryRegion === "regions"
                          ? "bg-violet-50 dark:bg-violet-950/40 border-violet-600 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/30"
                          : "border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <div>{isUz ? "Viloyatlar bo'ylab" : "По регионам"}</div>
                      <div className="text-[10px] font-normal opacity-75">
                        {subtotalPrice >= deliveryFreeThresholdRegions ? (isUz ? "Bepul" : "Бесплатно") : formatUzbekCurrency(deliveryPriceRegions)}
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* If pickup: Choose branch */}
              {deliveryType === "pickup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {t.selectBranchPlaceholder}:
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {isUz ? b.name : b.nameRu || b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  To'lov usuli:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["click", "payme", "uzum", "cash"] as PaymentMethod[]).map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`p-2 rounded-xl border text-xs font-black uppercase text-center transition-all cursor-pointer ${
                        paymentMethod === pm
                          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.customerName}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t.customerNamePlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none transition-all ${
                    fieldErrors.name
                      ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                      : "border-zinc-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/30"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.customerPhone}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    handlePhoneChange(e);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="+998 90 123 45 67"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs font-mono font-black text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all ${
                    fieldErrors.phone
                      ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                      : "border-zinc-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/30"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Address / Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t.addressOrNote}
                </label>
                <input
                  type="text"
                  value={addressOrNote}
                  onChange={(e) => {
                    setAddressOrNote(e.target.value);
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder={t.addressPlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none transition-all ${
                    fieldErrors.address
                      ? "border-[#E5485D] ring-1 ring-[#E5485D]/40"
                      : "border-zinc-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/30"
                  }`}
                />
                {fieldErrors.address && (
                  <p className="text-[11px] text-[#E5485D] font-bold flex items-center gap-1 mt-0.5 animate-slide-down">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                )}
              </div>

              {/* Error box */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <span>{t.submitting}</span>
                ) : (
                  <>
                    <span>{t.confirmOrder}</span>
                    <span className="opacity-90 font-mono font-normal">({formatUzbekCurrency(totalPrice)})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Bottom Sticky Actions (Only in "detail" mode) */}
        {modalMode === "detail" && (
          <div className="p-3 sm:p-4 border-t border-zinc-100 dark:border-slate-800 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-md flex items-center gap-2.5 shrink-0">
            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`flex-1 py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                addedToCartAnim
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30"
                  : "bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-slate-700"
              }`}
            >
              {addedToCartAnim ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Savatga qo'shildi!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Savatga</span>
                </>
              )}
            </button>

            {/* Instant Buy Button */}
            <button
              type="button"
              onClick={() => setModalMode("checkout")}
              className="flex-[1.4] py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              <span>Hoziroq Xarid Qilish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Smart Size Calculator Modal */}
        <SmartSizeCalculator
          isOpen={isSizeCalcOpen}
          lang={lang}
          onClose={() => setIsSizeCalcOpen(false)}
          onSelectSize={(sz) => setSelectedSize(sz)}
          availableSizes={product.sizes}
        />
      </div>
    </div>
  );
};
