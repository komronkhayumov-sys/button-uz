"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  Package,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Upload,
  ArrowLeft,
  RefreshCw,
  Clock,
  Phone,
  Truck,
  Store,
  KeyRound,
  ShieldCheck,
  Bot,
  ExternalLink,
  CreditCard,
  Building2,
  User,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Save,
  Check,
  Search,
  LayoutGrid,
  List,
  Shirt,
  Layers,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  ChevronDown,
  Home,
  BarChart2,
  MapPin,
  Send,
  Calendar,
  Copy,
  X,
  Menu,
  Star,
  Palette,
  Smartphone,
  Download,
  Sparkles,
  Tag,
} from "lucide-react";
import { Branch, Customer, Language, Order, PaymentMethod, Product, StoreSettings } from "@/types";
import { CATEGORIES, DEFAULT_SETTINGS } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import { adminI18n } from "@/lib/i18n";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [lang, setLang] = useState<Language>("uz");
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Image 1 is Dark, Image 3 is Light
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "products" | "orders" | "customers" | "payment" | "tariffs" | "branches" | "security" | "profile"
  >("dashboard");
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState("all");

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | Order["status"]>("all");
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(".status-dropdown-wrapper")) {
        setOpenStatusDropdownId(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Branch Edit Modal
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Forms
  const [profileForm, setProfileForm] = useState<Partial<StoreSettings>>({});
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState("");

  // Telegram test state
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sound notifications for new orders
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersCountRef = useRef<number>(0);

  // Mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Login PIN eye toggle
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Product colors custom input
  const [customColorInput, setCustomColorInput] = useState("");
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedCard2, setCopiedCard2] = useState(false);

  // Modals for deep inspection & detail views
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<Customer | null>(null);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const [quickInspectProduct, setQuickInspectProduct] = useState<Product | null>(null);

  // Gallery up to 10 images inputs
  const [newImageUrlInput, setNewImageUrlInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [activePaymentCardTab, setActivePaymentCardTab] = useState<"card1" | "card2">("card1");

  // Tariffs & Discounts State (Adjustable by Admin)
  const [deliveryPriceTashkentInput, setDeliveryPriceTashkentInput] = useState<number>(30000);
  const [deliveryFreeTashkentInput, setDeliveryFreeTashkentInput] = useState<number>(500000);
  const [deliveryPriceRegionsInput, setDeliveryPriceRegionsInput] = useState<number>(40000);
  const [deliveryFreeRegionsInput, setDeliveryFreeRegionsInput] = useState<number>(1000000);
  const [comboDiscountInput, setComboDiscountInput] = useState<number>(10);
  const [globalPromoDiscountInput, setGlobalPromoDiscountInput] = useState<number>(0);

  useEffect(() => {
    if (settings) {
      setDeliveryPriceTashkentInput(settings.deliveryPriceTashkent ?? 30000);
      setDeliveryFreeTashkentInput(settings.deliveryFreeThresholdTashkent ?? 500000);
      setDeliveryPriceRegionsInput(settings.deliveryPriceRegions ?? 40000);
      setDeliveryFreeRegionsInput(settings.deliveryFreeThresholdRegions ?? 1000000);
      setComboDiscountInput(settings.comboDiscountPercent ?? 10);
      setGlobalPromoDiscountInput(settings.globalPromoDiscountPercent ?? 0);
    }
  }, [settings]);

  const handleSaveTariffsAndDiscounts = async () => {
    await handleSaveSettings({
      deliveryPriceTashkent: Number(deliveryPriceTashkentInput) || 0,
      deliveryFreeThresholdTashkent: Number(deliveryFreeTashkentInput) || 0,
      deliveryPriceRegions: Number(deliveryPriceRegionsInput) || 0,
      deliveryFreeThresholdRegions: Number(deliveryFreeRegionsInput) || 0,
      comboDiscountPercent: Math.min(100, Math.max(0, Number(comboDiscountInput) || 0)),
      globalPromoDiscountPercent: Math.min(100, Math.max(0, Number(globalPromoDiscountInput) || 0)),
    });
  };

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyCard = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ""));
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyCard2 = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ""));
    setCopiedCard2(true);
    setTimeout(() => setCopiedCard2(false), 2000);
  };

  const currentDateFormatted = useMemo(() => {
    const d = new Date();
    const monthsUz = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    const monthsRu = [
      "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
      "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
    ];
    const month = lang === "ru" ? monthsRu[d.getMonth()] : monthsUz[d.getMonth()];
    const prefix = lang === "ru" ? "Bugun:" : "Bugun:";
    return `${prefix} ${d.getDate()} ${month}, ${d.getFullYear()}`;
  }, [lang]);

  // Customer filter (all vs saved/VIP)
  const [customerFilter, setCustomerFilter] = useState<"all" | "saved">("all");

  const COLOR_PRESETS = [
    "Qora",
    "Oq",
    "To'q ko'k",
    "Grafit",
    "Kulrang",
    "Bej",
    "Jigarrang",
    "Zaytun",
    "Bordo"
  ];

  const t = adminI18n[lang];

  // Play audio chime
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  };

  const sizePresets = ["S", "M", "L", "XL", "XXL", "3XL", "46", "48", "50", "52", "54", "39", "40", "41", "42", "43", "44"];

  // Authenticate PIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/settings", {
        headers: { "x-admin-pin": pin },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("button_admin_pin", pin);
        loadData(pin);
      } else {
        setAuthError(lang === "ru" ? "Неверный PIN-код! (По умолчанию: 1234)" : "Noto'g'ri PIN kod! (Standart: 1234)");
      }
    } catch (err) {
      setAuthError(lang === "ru" ? "Ошибка сети" : "Tarmoq xatosi");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("button_admin_pin");
    setPin("");
  };

  // Restore session & language
  useEffect(() => {
    const savedLang = localStorage.getItem("button_admin_lang") as Language;
    if (savedLang === "uz" || savedLang === "ru") {
      setLang(savedLang);
    }

    const savedPin = sessionStorage.getItem("button_admin_pin");
    if (savedPin) {
      setPin(savedPin);
      // Pre-load cached orders instantly
      const cachedRaw = localStorage.getItem("button_admin_orders_cache");
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
          }
        } catch {}
      }

      fetch("/api/settings", {
        headers: { "x-admin-pin": savedPin },
      }).then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          loadData(savedPin);
        }
      });
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("button_admin_lang", newLang);
  };

  const loadData = async (currentPin: string) => {
    setLoading(true);
    try {
      const [prodRes, orderRes, settRes, custRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders", { headers: { "x-admin-pin": currentPin } }),
        fetch("/api/settings", { headers: { "x-admin-pin": currentPin } }),
        fetch("/api/customers", { headers: { "x-admin-pin": currentPin } }),
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const settData = await settRes.json();
      const custData = await custRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (orderData.success) {
        const serverOrders: Order[] = Array.isArray(orderData.orders) ? orderData.orders : [];

        // Resilient order caching: Merge server orders with local storage cache so orders NEVER vanish on refresh or cold start
        let cachedOrders: Order[] = [];
        try {
          const raw = localStorage.getItem("button_admin_orders_cache");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) cachedOrders = parsed;
          }
        } catch {}

        const mergedMap = new Map<string, Order>();
        cachedOrders.forEach((o) => mergedMap.set(o.id, o));
        serverOrders.forEach((o) => mergedMap.set(o.id, o));
        const mergedOrders = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (prevOrdersCountRef.current > 0 && mergedOrders.length > prevOrdersCountRef.current) {
          playNotificationSound();
        }
        prevOrdersCountRef.current = mergedOrders.length;
        setOrders(mergedOrders);
        localStorage.setItem("button_admin_orders_cache", JSON.stringify(mergedOrders));

        // Auto-heal: If server was cold-started or missing cached orders, sync back to server via PUT
        const missingOnServer = mergedOrders.filter((m) => !serverOrders.some((s) => s.id === m.id));
        if (missingOnServer.length > 0) {
          fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin-pin": currentPin },
            body: JSON.stringify({ syncOrders: missingOnServer }),
          }).catch(() => {});
        }
      }
      if (settData.success && settData.settings) {
        setSettings(settData.settings);
        setProfileForm(settData.settings);
      }
      if (custData.success && Array.isArray(custData.customers)) {
        setCustomers(custData.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-poll orders for notifications
  useEffect(() => {
    if (!isAuthenticated || !pin) return;
    const interval = setInterval(() => {
      fetch("/api/orders", { headers: { "x-admin-pin": pin } })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            const serverOrders: Order[] = data.orders;
            let cachedOrders: Order[] = [];
            try {
              const raw = localStorage.getItem("button_admin_orders_cache");
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) cachedOrders = parsed;
              }
            } catch {}

            const mergedMap = new Map<string, Order>();
            cachedOrders.forEach((o) => mergedMap.set(o.id, o));
            serverOrders.forEach((o) => mergedMap.set(o.id, o));
            const mergedOrders = Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            if (mergedOrders.length > prevOrdersCountRef.current) {
              playNotificationSound();
            }
            prevOrdersCountRef.current = mergedOrders.length;
            setOrders(mergedOrders);
            localStorage.setItem("button_admin_orders_cache", JSON.stringify(mergedOrders));

            const missingOnServer = mergedOrders.filter((m) => !serverOrders.some((s) => s.id === m.id));
            if (missingOnServer.length > 0) {
              fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-admin-pin": pin },
                body: JSON.stringify({ syncOrders: missingOnServer }),
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pin, soundEnabled]);

  // Card number auto-spacing (4 digits per group)
  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  // Image upload handler
  const handleUploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-pin": pin },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) return data.url;
      alert(data.error || (lang === "ru" ? "Ошибка при загрузке фото" : "Rasm yuklashda xatolik"));
      return null;
    } catch (err) {
      alert(lang === "ru" ? "Ошибка сети" : "Tarmoq xatosi");
      return null;
    }
  };

  // Brand Logo upload handler
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const uploadedUrl = await handleUploadImage(file);
      if (uploadedUrl) {
        setProfileForm((prev) => ({ ...prev, storeAvatar: uploadedUrl }));
      }
    } catch (err) {
      alert(lang === "ru" ? "Ошибка при загрузке логотипа" : "Logo yuklashda xatolik yuz berdi");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleResetLogo = () => {
    setProfileForm((prev) => ({ ...prev, storeAvatar: "/btn-logo.png" }));
  };

  // Multi-image upload handler (up to 10 images)
  const handleUploadMultipleImages = async (files: FileList | File[]) => {
    if (!editingProduct) return;
    const currentList = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
      ? [...editingProduct.images]
      : (editingProduct.image ? [editingProduct.image] : []);
    
    const availableSlots = 10 - currentList.length;
    if (availableSlots <= 0) {
      alert(lang === "ru" ? "Максимум 10 фотографий на товар" : "Bitta mahsulotga ko'pi bilan 10 ta rasm yuklash mumkin");
      return;
    }

    setIsUploading(true);
    const toUpload = Array.from(files).slice(0, availableSlots);
    const newUrls: string[] = [];
    for (const file of toUpload) {
      const url = await handleUploadImage(file);
      if (url && !currentList.includes(url) && !newUrls.includes(url)) {
        newUrls.push(url);
      }
    }
    const combined = [...currentList, ...newUrls].slice(0, 10);
    setEditingProduct((prev) => ({
      ...(prev || {}),
      images: combined,
      image: prev?.image || combined[0] || "",
    }));
    setIsUploading(false);
  };

  const handleAddImageUrl = () => {
    if (!editingProduct || !newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    const currentList = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
      ? [...editingProduct.images]
      : (editingProduct.image ? [editingProduct.image] : []);
    if (currentList.length >= 10) {
      alert(lang === "ru" ? "Максимум 10 фотографий" : "Maksimal 10 ta rasm qo'shish mumkin");
      return;
    }
    if (currentList.includes(url)) {
      alert("Bu rasm allaqachon mavjud");
      return;
    }
    const combined = [...currentList, url].slice(0, 10);
    setEditingProduct({
      ...editingProduct,
      images: combined,
      image: editingProduct.image || combined[0] || "",
    });
    setNewImageUrlInput("");
  };

  const handleRemoveImageFromGallery = (targetUrl: string) => {
    if (!editingProduct) return;
    const currentList = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
      ? [...editingProduct.images]
      : (editingProduct.image ? [editingProduct.image] : []);
    const updated = currentList.filter((u) => u !== targetUrl);
    const newMain = editingProduct.image === targetUrl ? (updated[0] || "") : editingProduct.image;
    setEditingProduct({
      ...editingProduct,
      images: updated,
      image: newMain,
    });
  };

  const handleSetPrimaryImage = (targetUrl: string) => {
    if (!editingProduct) return;
    const currentList = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
      ? [...editingProduct.images]
      : (editingProduct.image ? [editingProduct.image] : []);
    const withoutTarget = currentList.filter((u) => u !== targetUrl);
    const reordered = [targetUrl, ...withoutTarget];
    setEditingProduct({
      ...editingProduct,
      images: reordered,
      image: targetUrl,
    });
  };

  const handleAddCustomSize = () => {
    if (!editingProduct || !customSizeInput.trim()) return;
    const sz = customSizeInput.trim().toUpperCase();
    const currentSizes = editingProduct.sizes || [];
    if (!currentSizes.includes(sz)) {
      setEditingProduct({ ...editingProduct, sizes: [...currentSizes, sz] });
    }
    setCustomSizeInput("");
  };

  // Save Settings
  const handleSaveSettings = async (updates: Partial<StoreSettings>) => {
    setLoading(true);
    setSaveSuccessMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setProfileForm(data.settings);
        setSaveSuccessMsg(lang === "ru" ? "Успешно сохранено!" : "Muvaffaqiyatli saqlandi!");
        setTimeout(() => setSaveSuccessMsg(""), 3500);
      } else {
        alert(data.error || "Xatolik");
      }
    } catch (err) {
      alert("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  // Test Telegram Bot
  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch("/api/telegram-test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({
          telegramBotToken: profileForm.telegramBotToken,
          telegramChatId: profileForm.telegramChatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestResult({
          success: true,
          message: lang === "ru" ? "Тестовое сообщение успешно отправлено в ваш Telegram!" : "Sinov xabari Telegramingizga muvaffaqiyatli yuborildi!",
        });
      } else {
        setTelegramTestResult({
          success: false,
          message: data.error || (lang === "ru" ? "Ошибка отправки в Telegram" : "Telegram xatosi"),
        });
      }
    } catch (err) {
      setTelegramTestResult({
        success: false,
        message: lang === "ru" ? "Ошибка подключения к серверу" : "Server bilan bog'lanishda xatolik",
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError("");
    setPinChangeSuccess("");

    if (!newPin || newPin.length < 4) {
      setPinChangeError(lang === "ru" ? "PIN-код должен быть не менее 4 символов" : "PIN-kod kamida 4 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeError(lang === "ru" ? "Новые PIN-коды не совпадают!" : "Yangi PIN-kodlar bir-biriga mos kelmadi!");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ adminPin: newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setPinChangeSuccess(lang === "ru" ? "PIN-код успешно изменен!" : "PIN-kod muvaffaqiyatli yangilandi!");
        setPin(newPin);
        sessionStorage.setItem("button_admin_pin", newPin);
        setNewPin("");
        setConfirmPin("");
      } else {
        setPinChangeError(data.error || "Xatolik");
      }
    } catch (err) {
      setPinChangeError("Tarmoq xatosi");
    }
  };

  // Toggle Customer Bookmark / VIP
  const handleToggleCustomerBookmark = async (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !c.isBookmarked;
    setCustomers((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, isBookmarked: nextState } : item))
    );
    setSelectedCustomerForView((prev) => (prev && prev.id === c.id ? { ...prev, isBookmarked: nextState } : prev));
    try {
      await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ id: c.id, isBookmarked: nextState }),
      });
    } catch (err) {
      console.error("Bookmark save error:", err);
    }
  };

  const toggleColor = (clr: string) => {
    if (!editingProduct) return;
    const currentColors = editingProduct.colors || [];
    const nextColors = currentColors.includes(clr)
      ? currentColors.filter((c) => c !== clr)
      : [...currentColors, clr];
    setEditingProduct({ ...editingProduct, colors: nextColors });
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customColorInput.trim();
    if (!val || !editingProduct) return;
    const currentColors = editingProduct.colors || [];
    if (!currentColors.includes(val)) {
      setEditingProduct({ ...editingProduct, colors: [...currentColors, val] });
    }
    setCustomColorInput("");
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProduct(true);

    try {
      const method = editingProduct.id ? "PUT" : "POST";
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadData(pin);
      } else {
        alert(data.error || "Xatolik");
      }
    } catch (err) {
      alert("Tarmoq xatosi");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(lang === "ru" ? "Вы уверены, что хотите удалить этот товар?" : "Ushbu mahsulotni o'chirishga ishonchingiz komilmi?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) loadData(pin);
    } catch (err) {
      alert("Tarmoq xatosi");
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ id: product.id, isAvailable: !product.isAvailable }),
      });
      const data = await res.json();
      if (data.success) loadData(pin);
    } catch (err) {}
  };

  const toggleSize = (sz: string) => {
    if (!editingProduct) return;
    const currentSizes = editingProduct.sizes || [];
    const nextSizes = currentSizes.includes(sz)
      ? currentSizes.filter((s) => s !== sz)
      : [...currentSizes, sz];
    setEditingProduct({ ...editingProduct, sizes: nextSizes });
  };

  // Order status
  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ id: orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => {
          const next = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
          try {
            localStorage.setItem("button_admin_orders_cache", JSON.stringify(next));
          } catch {}
          return next;
        });
        loadData(pin);
        setSelectedOrderForView((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
      }
    } catch (err) {}
  };

  // Payment status update & receipt verification (FAZA 1)
  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'rejected', reason?: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({
          id: orderId,
          paymentStatus,
          paymentRejectReason: reason || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => {
          const next = prev.map((o) =>
            o.id === orderId
              ? { ...o, paymentStatus, paymentRejectReason: reason || o.paymentRejectReason }
              : o
          );
          try {
            localStorage.setItem("button_admin_orders_cache", JSON.stringify(next));
          } catch {}
          return next;
        });
        loadData(pin);
        setSelectedOrderForView((prev) =>
          prev && prev.id === orderId
            ? { ...prev, paymentStatus, paymentRejectReason: reason }
            : prev
        );
      }
    } catch (err) {
      console.error("Payment status update error:", err);
    }
  };

  // Branch edit save
  const handleSaveBranch = () => {
    if (!editingBranch) return;
    const currentBranches = profileForm.branches || settings.branches || [];
    const updatedBranches = currentBranches.map((b) => (b.id === editingBranch.id ? editingBranch : b));
    setProfileForm({ ...profileForm, branches: updatedBranches });
    handleSaveSettings({ branches: updatedBranches });
    setIsBranchModalOpen(false);
    setEditingBranch(null);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedProductCategory === "all" || p.category === selectedProductCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameRu && p.nameRu.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, selectedProductCategory, searchQuery]);

  // Filtered orders (Crash-proof search)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q)) ||
        (o.paymentMethod && String(o.paymentMethod).toLowerCase().includes(q)) ||
        (o.items && o.items.some((it) => it.productName && it.productName.toLowerCase().includes(q)));
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  // Filtered customers with Saved / VIP filter
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = customers;
    if (customerFilter === "saved") {
      list = list.filter((c) => c.isBookmarked);
    }
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery, customerFilter]);

  // Calculations
  const availableCount = products.filter((p) => p.isAvailable).length;
  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Sales Analytics for interactive charts
  const salesAnalytics = useMemo(() => {
    const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const dayNamesUz = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
    const dayNamesRu = ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб"];
    const days: { dayName: string; amount: number; count: number }[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateTashkent = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
      const dayIdx = new Date(dateTashkent + "T12:00:00").getDay();
      const dayLabel = lang === "ru" ? dayNamesRu[dayIdx] : dayNamesUz[dayIdx];

      const dayOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        try {
          const orderDateTashkent = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date(o.createdAt));
          return orderDateTashkent === dateTashkent;
        } catch {
          return o.createdAt.startsWith(dateTashkent);
        }
      });
      const dayAmount = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      days.push({
        dayName: dayLabel,
        amount: dayAmount,
        count: dayOrders.length,
      });
    }

    const maxDayAmount = Math.max(...days.map((d) => d.amount), 0);

    const categoryCounts: Record<string, number> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const catKey = prod ? prod.category : "suits";
        categoryCounts[catKey] = (categoryCounts[catKey] || 0) + item.quantity;
      });
    });

    const categoryGradients: Record<string, string> = {
      suits: "from-purple-600 to-indigo-500",
      jackets: "from-pink-600 to-rose-500",
      hoodies: "from-amber-500 to-orange-500",
      shirts: "from-emerald-500 to-teal-500",
      pants: "from-blue-500 to-cyan-500",
      shoes: "from-violet-500 to-purple-600",
      accessories: "from-fuchsia-500 to-pink-500",
    };

    const totalItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    const topCategories = CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
      const count = categoryCounts[cat.id] || 0;
      const percentage = Math.round((count / totalItems) * 100);
      return {
        key: cat.id,
        label: lang === "ru" ? cat.nameRu : cat.nameUz,
        count,
        percentage,
        color: categoryGradients[cat.id] || "from-purple-600 to-indigo-500",
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalOrdersAmount,
      maxDayAmount,
      days,
      topCategories,
    };
  }, [orders, products, lang]);

  // Dynamic Theme Colors matching Mockups 1:1
  const isDark = isDarkTheme;
  const mainBgClass = isDark ? "bg-[#0b1120] text-slate-100" : "bg-[#F8FAFC] text-[#172554]";
  const sidebarBgClass = isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-[#E2E8F0] shadow-sm";
  const cardBgClass = isDark
    ? "bg-[#0f172a]/95 border border-slate-800/80 text-white shadow-xl shadow-black/25"
    : "bg-white border border-[#E2E8F0] text-[#172554] shadow-[0_4px_20px_rgba(37,99,235,0.06)]";
  const itemCardBg = isDark ? "bg-[#1e293b]/70 border-slate-700/60 text-white" : "bg-[#F8FAFC] border-[#E2E8F0] text-[#172554]";
  const subTextClass = isDark ? "text-slate-400" : "text-[#64748B]";
  const headingTextClass = isDark ? "text-white" : "text-[#172554]";
  const inputBgClass = isDark
    ? "bg-[#1e293b] border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 shadow-xs"
    : "bg-white border border-[#E2E8F0] text-[#172554] placeholder:text-[#64748B] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs";

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${isDark ? "bg-[#0b0813]" : "bg-[#f4f2f9]"}`}>
        <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 space-y-6 border shadow-2xl ${isDark ? "bg-[#150f28] border-purple-900/40 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-xl shadow-purple-600/30 mx-auto shrink-0 border border-purple-400/30">
              <Image src="/btn-logo.png" alt="BUTTON" width={64} height={64} className="w-full h-full object-cover" priority />
            </div>
            <h1 className="text-xl font-black tracking-wider uppercase">BUTTON MEN</h1>
            <p className={`text-xs ${subTextClass}`}>
              {lang === "ru" ? "Панель управления магазином" : "Do'kon boshqaruv paneli"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${subTextClass}`}>
                {lang === "ru" ? "Введите PIN-код:" : "PIN kodni kiriting:"}
              </label>
              <div className="relative">
                <input
                  type={showLoginPin ? "text" : "password"}
                  required
                  autoFocus
                  maxLength={12}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={showLoginPin ? "1234" : "••••"}
                  className={`w-full px-10 py-3 text-center tracking-[0.3em] font-mono text-xl rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBgClass}`}
                />
                <Lock className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 text-center">
                {lang === "ru" ? "Стандартный PIN: 1234" : "Standart PIN: 1234"}
              </p>
            </div>

            {authError && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95"
            >
              {lang === "ru" ? "Войти в систему" : "Tizimga kirish"}
            </button>
          </form>

          {/* Lang and Theme controls on login screen */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-purple-900/20 text-xs">
            <div className="flex bg-blue-500/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleLanguageChange("uz")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${lang === "uz" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("ru")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${lang === "ru" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
              >
                RU
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-1.5 rounded-xl bg-blue-500/10 text-purple-400 hover:bg-blue-500/20"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-pwa-install"))}
              className="w-full py-2.5 px-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>{lang === "ru" ? "Установить Admin App" : "Admin ilovasini o'rnatish"}</span>
            </button>

            <div className="text-center">
              <Link href="/" className="text-xs text-purple-400 hover:underline inline-flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === "ru" ? "Вернуться на сайт магазина" : "Do'kon sahifasiga qaytish"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* PWA Admin Install Prompt on Login Screen */}
        <PwaInstallPrompt lang={lang} target="admin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row font-sans transition-colors duration-200 ${mainBgClass}`}>
      {/* ------------------- MOBILE TOP APP BAR MATCHING MOCKUP 2 & 4 ------------------- */}
      <div className={`md:hidden relative border-b z-30 transition-colors ${sidebarBgClass}`}>
        {/* Row 1: Logo + Controls */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 relative z-10">
          <div className="flex items-center gap-2">
            {/* Hamburger Button to open Full Navigation Drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                mobileMenuOpen
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25"
                  : isDark
                  ? "bg-[#18122B] border-purple-900/40 text-purple-200 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-800 shadow-xs hover:bg-slate-50"
              }`}
              title={mobileMenuOpen ? "Menyuni yopish" : "Barcha bo'limlar menyusi"}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="w-8 h-8 rounded-xl overflow-hidden relative border border-blue-500/30 shrink-0">
              <Image
                src={profileForm.storeAvatar || settings.storeAvatar || "/btn-logo.png"}
                alt="BUTTON"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h1 className={`font-black text-xs tracking-wider uppercase ${headingTextClass}`}>BUTTON</h1>
              <p className="text-[9px] text-zinc-400 font-medium tracking-wide">Men's Wear</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Lang toggle pill */}
            <div className={`flex p-0.5 rounded-xl border ${isDark ? "bg-[#1a1033] border-purple-900/40" : "bg-purple-50 border-purple-200"}`}>
              <button
                onClick={() => handleLanguageChange("uz")}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${lang === "uz" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
              >
                UZ
              </button>
              <button
                onClick={() => handleLanguageChange("ru")}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${lang === "ru" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
              >
                RU
              </button>
            </div>

            {/* PWA Admin App Install Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("open-pwa-install"));
              }}
              className="p-2 rounded-xl border cursor-pointer bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/25 transition-all shadow-xs"
              title={lang === "ru" ? "Установить Admin App" : "Admin ilovasini o'rnatish"}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveMenu("orders")}
              className={`relative p-2 rounded-xl border cursor-pointer ${isDark ? "bg-[#1a1033] border-purple-900/40 text-purple-300" : "bg-white border-purple-100 text-purple-700 shadow-xs"}`}
            >
              <Bell className="w-4 h-4" />
              {newOrdersCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-1 ring-2 ring-white dark:ring-[#1a1033]" />}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`p-2 rounded-xl border cursor-pointer ${isDark ? "bg-[#1a1033] border-purple-900/40 text-amber-400" : "bg-white border-purple-100 text-blue-600 shadow-xs"}`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Row 2: Search Bar (Mobile Only) */}
        <div className="px-3 pb-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.topBar.searchPlaceholder}
              className={`w-full pl-8 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-all ${inputBgClass}`}
            />
          </div>
        </div>
      </div>

      {/* ------------------- DEDICATED MOBILE NAVIGATION DRAWER ------------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div
            className={`relative w-[85%] max-w-xs h-[100dvh] flex flex-col justify-between p-4 shadow-2xl z-10 overflow-y-auto overscroll-contain animate-slide-left ${
              isDark ? "bg-[#0c1222] border-r border-slate-800 text-white" : "bg-white border-r border-slate-200 text-slate-900"
            }`}
          >
            {/* Top: Logo & Close Button */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md border border-blue-500/30 relative bg-zinc-900">
                    <Image
                      src={profileForm.storeAvatar || settings.storeAvatar || "/btn-logo.png"}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h2 className={`font-black text-xs uppercase tracking-wider ${headingTextClass}`}>
                      {settings.storeName ? settings.storeName.split(" ")[0] : "BUTTON"}
                    </h2>
                    <p className="text-[9px] text-zinc-400 font-medium">Boshqaruv menyusi</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDark ? "bg-slate-800 text-slate-300 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* All Navigation Sections on Mobile */}
              <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar py-1">
                {/* 1. Dashboard */}
                <button
                  onClick={() => { setActiveMenu("dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "dashboard"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>{t.menu.dashboard}</span>
                </button>

                {/* 2. Mahsulotlar */}
                <button
                  onClick={() => { setActiveMenu("products"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "products"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{t.menu.products}</span>
                </button>

                {/* 3. Buyurtmalar */}
                <button
                  onClick={() => { setActiveMenu("orders"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "orders"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.menu.orders}</span>
                  </div>
                  {newOrdersCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {newOrdersCount}
                    </span>
                  )}
                </button>

                {/* 4. Mijozlar va Statistika */}
                <button
                  onClick={() => { setActiveMenu("customers"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "customers"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{lang === "ru" ? "Клиенты и Статистика" : "Mijozlar va Statistika"}</span>
                </button>

                {/* 5. Karta & To'lov */}
                <button
                  onClick={() => { setActiveMenu("payment"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "payment"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.menu.payment}</span>
                </button>

                {/* 6. Dastavka & Chegirmalar */}
                <button
                  onClick={() => { setActiveMenu("tariffs"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "tariffs"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{lang === "ru" ? "Доставка & Скидки" : "Dastavka & Chegirmalar"}</span>
                </button>

                {/* 6. Filiallar */}
                <button
                  onClick={() => { setActiveMenu("branches"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    activeMenu === "branches"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                      : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t.menu.branches}</span>
                </button>
              </nav>
            </div>

            {/* Mobile Bottom: Security, Profile, Logout */}
            <div className={`space-y-2 pt-3 border-t mt-3 shrink-0 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              {/* Admin App Install Recommendation Card */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("open-pwa-install"));
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 hover:text-white transition-all text-left flex items-center justify-between gap-2 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold leading-tight truncate">
                      {lang === "ru" ? "Установить Admin App" : "Admin ilovasini o'rnatish"}
                    </span>
                    <span className="block text-[10px] text-zinc-400 leading-tight truncate">
                      {lang === "ru" ? "Быстрый доступ на телефоне" : "Bosh ekranga ilova sifatida qo'shish"}
                    </span>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </button>

              {/* PIN Kod */}
              <button
                onClick={() => { setActiveMenu("security"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMenu === "security"
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
                    : isDark ? "bg-[#131b2e] text-slate-300 border border-slate-800" : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>{t.menu.security}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Admin Profile */}
              <button
                onClick={() => { setActiveMenu("profile"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-left ${
                  activeMenu === "profile"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 font-bold"
                    : isDark ? "bg-[#131b2e] text-slate-200 border border-slate-800" : "bg-slate-100 text-slate-800 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {(settings.adminName || "A").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold leading-tight truncate">
                      {settings.adminName || "Admin"}
                    </span>
                    <span className="block text-[10px] text-zinc-400 leading-tight truncate">
                      {settings.adminEmail || "admin@button.uz"}
                    </span>
                  </div>
                </div>
                <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </button>

              {/* Chiqish */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.menu.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- DESKTOP SIDEBAR (FIXED, NEVER MOVES) ------------------- */}
      <aside
        className={`hidden md:flex md:fixed md:top-0 md:bottom-0 md:left-0 md:w-64 md:h-screen ${sidebarBgClass} border-r p-4 flex-col justify-between z-30`}
      >
        {/* Subtle flowing wave pattern in sidebar */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <svg viewBox="0 0 256 900" fill="none" className="w-full h-full opacity-40">
            <path d="M0,0 Q180,300 120,600 T256,900 L0,900 Z" fill={isDark ? "url(#sidebarWaveDark)" : "url(#sidebarWaveLight)"} />
            <defs>
              <linearGradient id="sidebarWaveLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="sidebarWaveDark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#172554" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top: Logo & Navigation Links (flex-1 expands to push bottom container to the bottom-left corner) */}
        <div className="flex-1 flex flex-col min-h-0 space-y-6 relative z-10">
          {/* Logo & Close on mobile */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-md border border-purple-400/20 bg-zinc-900 relative">
                <Image
                  src={profileForm.storeAvatar || settings.storeAvatar || "/btn-logo.png"}
                  alt="Logo"
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
              <div>
                <h1 className={`font-black text-sm tracking-widest uppercase ${headingTextClass}`}>
                  {settings.storeName ? settings.storeName.split(" ")[0] : "BUTTON"}
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wider">
                  {settings.storeName ? settings.storeName.split(" ").slice(1).join(" ") || "Men's Wear" : "Men's Wear"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links (flex-1 fills available space) */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setActiveMenu("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "dashboard"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{t.menu.dashboard}</span>
            </button>

            {/* 2. Mahsulotlar (Badge removed) */}
            <button
              onClick={() => {
                setActiveMenu("products");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "products"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>{t.menu.products}</span>
            </button>

            {/* 3. Buyurtmalar */}
            <button
              onClick={() => {
                setActiveMenu("orders");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "orders"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>{t.menu.orders}</span>
              </div>
              {newOrdersCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  {newOrdersCount}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400">{orders.length}</span>
              )}
            </button>

            {/* 4. Mijozlar va Statistika */}
            <button
              onClick={() => {
                setActiveMenu("customers");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "customers"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === "ru" ? "Клиенты и Статистика" : "Mijozlar va Statistika"}</span>
            </button>

            {/* 5. Karta & To'lov */}
            <button
              onClick={() => {
                setActiveMenu("payment");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "payment"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t.menu.payment}</span>
            </button>

            {/* 6. Dastavka & Chegirmalar */}
            <button
              onClick={() => {
                setActiveMenu("tariffs");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "tariffs"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{lang === "ru" ? "Доставка & Скидки" : "Dastavka & Chegirmalar"}</span>
            </button>

            {/* 6. Filiallar */}
            <button
              onClick={() => {
                setActiveMenu("branches");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeMenu === "branches"
                  ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25")
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/70"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.menu.branches}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: PIN, Profile, Logout - Anchored at the bottom-left corner */}
        <div className={`space-y-2 pt-3 pb-3 mt-auto border-t relative z-20 shrink-0 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          {/* Admin App Install Recommendation Card */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent("open-pwa-install"));
            }}
            className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600/25 transition-all text-left flex items-center justify-between gap-2 cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold leading-tight truncate">
                  {lang === "ru" ? "Установить Admin App" : "Admin ilovasini o'rnatish"}
                </span>
                <span className="block text-[10px] text-zinc-400 leading-tight truncate">
                  {lang === "ru" ? "Быстрый доступ на телефоне" : "Telefon ekraniga o'rnatish"}
                </span>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* PIN Kod */}
          <button
            onClick={() => {
              setActiveMenu("security");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeMenu === "security"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
                : isDark
                ? "bg-[#131b2e] hover:bg-[#1a243d] text-slate-300 border border-slate-800"
                : "bg-blue-50/60 hover:bg-blue-100/60 text-slate-700 border border-blue-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>{t.menu.security}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Admin Profile Capsule - Clicking opens Profile & Settings! */}
          <button
            onClick={() => {
              setActiveMenu("profile");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-left ${
              activeMenu === "profile"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 font-bold"
                : isDark
                ? "bg-[#131b2e] hover:bg-[#1a243d] text-slate-200 border border-slate-800"
                : "bg-blue-50/60 hover:bg-blue-100/60 text-slate-800 border border-blue-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {(settings.adminName || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold leading-tight truncate">
                  {settings.adminName || "Admin"}
                </span>
                <span className="block text-[10px] text-zinc-400 leading-tight truncate">
                  {settings.adminEmail || "admin@button.uz"}
                </span>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          {/* Chiqish */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.menu.logout}</span>
          </button>
        </div>
      </aside>

      {/* Fixed layout spacing placeholder for desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* ------------------- MAIN CONTENT CONTAINER ------------------- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 md:h-screen overflow-y-auto relative pb-24 md:pb-8">
        {/* Top Header Bar - Desktop Only */}
        <div className="hidden md:flex items-center justify-between gap-3 relative z-10">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.topBar.searchPlaceholder}
              className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs focus:outline-none transition-all ${inputBgClass}`}
            />
          </div>

          {/* Right Header Controls - Desktop Only */}
          <div className="flex items-center gap-2">
            {/* Language Switcher UZ / RU */}
            <div className={`flex p-1 rounded-2xl border ${
              isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-[#E2E8F0] shadow-xs"
            }`}>
              <button
                onClick={() => handleLanguageChange("uz")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  lang === "uz" ? "bg-blue-600 text-white shadow-xs" : isDark ? "text-slate-400 hover:text-white" : "text-[#64748B] hover:text-[#172554]"
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => handleLanguageChange("ru")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  lang === "ru" ? "bg-blue-600 text-white shadow-xs" : isDark ? "text-slate-400 hover:text-white" : "text-[#64748B] hover:text-[#172554]"
                }`}
              >
                RU
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveMenu("orders")}
              className={`relative p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                isDark ? "bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white" : "bg-white border-[#E2E8F0] text-[#64748B] shadow-xs hover:text-[#172554]"
              }`}
              title="Buyurtmalar"
            >
              <Bell className="w-4 h-4" />
              {newOrdersCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            </button>

            {/* Theme Toggle (Dark & Light Mode Switcher) */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                isDark ? "bg-[#0f172a] border-slate-800 text-amber-400" : "bg-white border-[#E2E8F0] text-amber-500 shadow-xs hover:bg-slate-50"
              }`}
              title={isDark ? t.topBar.switchThemeLight : t.topBar.switchThemeDark}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>
        {/* Elegant Flowing Abstract Waves in Upper Header Background (No harsh wire lines) */}
        <div className="absolute top-0 right-0 w-[560px] max-w-[50vw] h-[200px] pointer-events-none select-none overflow-hidden z-0">
          {isDark ? (
            /* Dark Mode Abstract Waves - Soft atmospheric glow fills */
            <svg viewBox="0 0 560 200" fill="none" className="w-full h-full">
              <path
                d="M 0,0 C 160,35 280,85 420,60 C 480,48 520,20 560,0 L 560,0 Z"
                fill="url(#darkBlueWaveGrad1)"
                opacity="0.45"
              />
              <path
                d="M 100,0 C 220,50 340,90 460,65 C 500,55 535,25 560,10 L 560,0 Z"
                fill="url(#darkBlueWaveGrad2)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="darkBlueWaveGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0b0f19" stopOpacity="0" />
                  <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.35" />
                  <stop offset="75%" stopColor="#1e293b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="darkBlueWaveGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0b0f19" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            /* Light Mode Abstract Waves - Soft silk fills, NO harsh stroke lines cutting through buttons */
            <svg viewBox="0 0 560 200" fill="none" className="w-full h-full">
              <path
                d="M 0,0 C 160,35 280,85 420,60 C 480,48 520,20 560,0 L 560,0 Z"
                fill="url(#blueWaveGrad1)"
                opacity="0.75"
              />
              <path
                d="M 90,0 C 210,50 330,90 450,65 C 495,55 530,25 560,10 L 560,0 Z"
                fill="url(#blueWaveGrad2)"
                opacity="0.45"
              />
              <defs>
                <linearGradient id="blueWaveGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0" />
                  <stop offset="35%" stopColor="#DBEAFE" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#BFDBFE" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#CFFAFE" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="blueWaveGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Ambient Purple Curved Ribbon / Sweep Glow matching Mockup 1 & 3 */}
        <div className="fixed -bottom-24 -left-20 w-[600px] h-[380px] pointer-events-none select-none overflow-hidden z-0 opacity-40">
          <svg viewBox="0 0 600 380" fill="none" className="w-full h-full">
            <path
              d="M-40,340 C140,310 240,160 460,210 C540,225 580,270 610,300"
              stroke="url(#bottomBlueCyanGlow)"
              strokeWidth="50"
              strokeLinecap="round"
              filter="blur(35px)"
            />
            <defs>
              <linearGradient id="purpleGlowDark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="purpleGlowLight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Global Save feedback alert */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: DASHBOARD (TRUE EXECUTIVE DASHBOARD)
           ========================================================================= */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome banner + Date Badge on right matching Mockups 1 & 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-3 sm:pb-5 relative z-10">
              <div className="space-y-1 max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  <span className={headingTextClass}>{t.dashboard.welcomeTitle} </span>
                  <span className={isDark ? "text-sky-400 font-black" : "text-blue-600 font-black"}>
                    {settings.adminName || "Admin"}!
                  </span>
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${subTextClass}`}>{t.dashboard.welcomeSubtitle}</p>
              </div>

              {/* Bugun Date Badge matching Mockup */}
              <div className={`self-start sm:self-auto hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold cursor-pointer ${
                isDark
                  ? "bg-[#110722]/85 border-blue-500/25 text-zinc-300 hover:border-blue-500/40 shadow-sm"
                  : "bg-white border border-[#E2E8F0] text-[#172554] shadow-xs"
              } backdrop-blur-md transition-all`}>
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentDateFormatted}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </div>
            </div>

            {/* 4 Stat Cards with Refined, Sleek Glowing Waves */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 relative z-10">
              {/* Stat 1: Jami Mahsulot */}
              <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl ${cardBgClass} relative overflow-hidden flex flex-col justify-between min-h-[124px] sm:h-[155px] group hover:border-blue-500/40 transition-all duration-300`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <span className={`text-[10px] sm:text-xs font-semibold block ${subTextClass}`}>{t.dashboard.totalProducts}</span>
                    <div className="flex items-baseline justify-end gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                      <span className={`text-base sm:text-2xl font-black ${headingTextClass}`}>{products.length}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-500">↑ 100%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1">
                  <svg className="w-full h-7 sm:h-9 overflow-visible" viewBox="0 0 140 32" fill="none">
                    <defs>
                      <linearGradient id="statCurveGrad1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="60%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient id="statAreaGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={isDark ? "0.22" : "0.14"} />
                        <stop offset="60%" stopColor="#6366F1" stopOpacity={isDark ? "0.08" : "0.04"} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Delicate dashed reference axis */}
                    <line x1="2" y1="28" x2="138" y2="28" stroke={isDark ? "#3B82F6" : "#64748B"} strokeOpacity="0.12" strokeDasharray="3 3" strokeWidth="0.75" />
                    {/* Soft Translucent Area Gradient */}
                    <path
                      d="M 2 24 C 28 24, 48 18, 72 20 C 96 22, 116 10, 138 7 L 138 32 L 2 32 Z"
                      fill="url(#statAreaGrad1)"
                    />
                    {/* Ultra-Delicate Hairline Spline */}
                    <path
                      d="M 2 24 C 28 24, 48 18, 72 20 C 96 22, 116 10, 138 7"
                      stroke="url(#statCurveGrad1)"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    {/* Refined Endpoint Pulse Halo & Dot */}
                    <circle cx="138" cy="7" r="4.5" fill="#8B5CF6" fillOpacity={isDark ? "0.25" : "0.18"} />
                    <circle cx="138" cy="7" r="2" fill="#8B5CF6" />
                  </svg>
                </div>
              </div>

              {/* Stat 2: Sotuvda */}
              <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl ${cardBgClass} relative overflow-hidden flex flex-col justify-between min-h-[124px] sm:h-[155px] group hover:border-cyan-500/40 transition-all duration-300`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25 shrink-0">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <span className={`text-[10px] sm:text-xs font-semibold block ${subTextClass}`}>{t.dashboard.inStockProducts}</span>
                    <div className="flex items-baseline justify-end gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                      <span className={`text-base sm:text-2xl font-black ${headingTextClass}`}>{availableCount}</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-cyan-500">↑ Faol</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1">
                  <svg className="w-full h-7 sm:h-9 overflow-visible" viewBox="0 0 140 32" fill="none">
                    <defs>
                      <linearGradient id="statCurveGrad2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="60%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="statAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={isDark ? "0.22" : "0.14"} />
                        <stop offset="60%" stopColor="#10B981" stopOpacity={isDark ? "0.08" : "0.04"} />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Delicate dashed reference axis */}
                    <line x1="2" y1="28" x2="138" y2="28" stroke={isDark ? "#06B6D4" : "#64748B"} strokeOpacity="0.12" strokeDasharray="3 3" strokeWidth="0.75" />
                    {/* Soft Translucent Area Gradient */}
                    <path
                      d="M 2 25 C 28 25, 50 17, 75 19 C 100 21, 118 10, 138 7 L 138 32 L 2 32 Z"
                      fill="url(#statAreaGrad2)"
                    />
                    {/* Ultra-Delicate Hairline Spline */}
                    <path
                      d="M 2 25 C 28 25, 50 17, 75 19 C 100 21, 118 10, 138 7"
                      stroke="url(#statCurveGrad2)"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    {/* Refined Endpoint Pulse Halo & Dot */}
                    <circle cx="138" cy="7" r="4.5" fill="#10B981" fillOpacity={isDark ? "0.25" : "0.18"} />
                    <circle cx="138" cy="7" r="2" fill="#10B981" />
                  </svg>
                </div>
              </div>

              {/* Stat 3: Yangi Buyurtma */}
              <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl ${cardBgClass} relative overflow-hidden flex flex-col justify-between min-h-[124px] sm:h-[155px] group hover:border-amber-500/40 transition-all duration-300`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                    <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <span className={`text-[10px] sm:text-xs font-semibold block ${subTextClass}`}>{t.dashboard.newOrders}</span>
                    <div className="flex items-center justify-end gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                      <span className={`text-base sm:text-2xl font-black ${headingTextClass}`}>{newOrdersCount}</span>
                      {newOrdersCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Yangi
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400">0 ta</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1">
                  <svg className="w-full h-7 sm:h-9 overflow-visible" viewBox="0 0 140 32" fill="none">
                    <defs>
                      <linearGradient id="statCurveGrad3" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="60%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#EA580C" />
                      </linearGradient>
                      <linearGradient id="statAreaGrad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={isDark ? "0.22" : "0.14"} />
                        <stop offset="60%" stopColor="#F97316" stopOpacity={isDark ? "0.08" : "0.04"} />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Delicate dashed reference axis */}
                    <line x1="2" y1="28" x2="138" y2="28" stroke={isDark ? "#F59E0B" : "#64748B"} strokeOpacity="0.12" strokeDasharray="3 3" strokeWidth="0.75" />
                    {/* Soft Translucent Area Gradient */}
                    <path
                      d="M 2 26 C 28 26, 48 21, 74 22 C 98 23, 116 11, 138 8 L 138 32 L 2 32 Z"
                      fill="url(#statAreaGrad3)"
                    />
                    {/* Ultra-Delicate Hairline Spline */}
                    <path
                      d="M 2 26 C 28 26, 48 21, 74 22 C 98 23, 116 11, 138 8"
                      stroke="url(#statCurveGrad3)"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    {/* Refined Endpoint Pulse Halo & Dot */}
                    <circle cx="138" cy="8" r="4.5" fill="#EA580C" fillOpacity={isDark ? "0.25" : "0.18"} />
                    <circle cx="138" cy="8" r="2" fill="#EA580C" />
                  </svg>
                </div>
              </div>

              {/* Stat 4: Jami Savdo */}
              <div className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl ${cardBgClass} relative overflow-hidden flex flex-col justify-between min-h-[124px] sm:h-[155px] group hover:border-indigo-500/40 transition-all duration-300`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <span className={`text-[10px] sm:text-xs font-semibold block ${subTextClass}`}>{t.dashboard.totalRevenue}</span>
                    <div className="flex items-baseline justify-end gap-1 mt-0.5 sm:mt-1">
                      <span className={`text-sm sm:text-xl lg:text-2xl font-black ${headingTextClass} tracking-tight`}>
                        {new Intl.NumberFormat("uz-UZ").format(totalRevenue)}
                      </span>
                      <span className="text-[9px] sm:text-xs font-bold text-zinc-400 shrink-0">
                        so'm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1">
                  <svg className="w-full h-7 sm:h-9 overflow-visible" viewBox="0 0 140 32" fill="none">
                    <defs>
                      <linearGradient id="statCurveGrad4" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="60%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                      <linearGradient id="statAreaGrad4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={isDark ? "0.22" : "0.14"} />
                        <stop offset="60%" stopColor="#6366F1" stopOpacity={isDark ? "0.08" : "0.04"} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Delicate dashed reference axis */}
                    <line x1="2" y1="28" x2="138" y2="28" stroke={isDark ? "#8B5CF6" : "#64748B"} strokeOpacity="0.12" strokeDasharray="3 3" strokeWidth="0.75" />
                    {/* Soft Translucent Area Gradient */}
                    <path
                      d="M 2 26 C 30 26, 52 18, 78 18 C 102 18, 118 8, 138 6 L 138 32 L 2 32 Z"
                      fill="url(#statAreaGrad4)"
                    />
                    {/* Ultra-Delicate Hairline Spline */}
                    <path
                      d="M 2 26 C 30 26, 52 18, 78 18 C 102 18, 118 8, 138 6"
                      stroke="url(#statCurveGrad4)"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    {/* Refined Endpoint Pulse Halo & Dot */}
                    <circle cx="138" cy="6" r="4.5" fill="#2563EB" fillOpacity={isDark ? "0.25" : "0.18"} />
                    <circle cx="138" cy="6" r="2" fill="#2563EB" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 3 Main Dashboard Cards: Compact, Balanced & Gap-Free */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 items-stretch">
              {/* Left Card: Do'kon holati (lg:col-span-4) */}
              <div className={`p-4 sm:p-5 rounded-2xl ${cardBgClass} border flex flex-col justify-between space-y-3 lg:col-span-4 shadow-xs`}>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-purple-900/10 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </div>
                      <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>{t.dashboard.storeStatus}</h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {/* Ish vaqti */}
                    <div className={`py-1.5 px-2.5 rounded-xl ${itemCardBg} border flex items-center justify-between gap-2`}>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${subTextClass} block leading-tight`}>ISH VAQTI:</span>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[11px] leading-tight">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{lang === "ru" ? settings.workingHoursRu : settings.workingHoursUz}</span>
                        </div>
                      </div>
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </div>

                    {/* To'lov kartasi with 1-click copy */}
                    <div
                      onClick={() => handleCopyCard(settings.cardNumber || "8600 1234 5678 9999")}
                      className={`py-1.5 px-2.5 rounded-xl ${itemCardBg} border flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400/50 transition-all group`}
                      title="Karta raqamini nusxalash"
                    >
                      <div className="min-w-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${subTextClass} block leading-tight`}>TO'LOV KARTASI:</span>
                        <div className={`flex items-center gap-1.5 font-mono font-bold text-[11px] leading-tight ${
                          isDark ? "text-zinc-100" : "text-slate-900"
                        }`}>
                          <CreditCard className={`w-3 h-3 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                          <span className="truncate">{settings.cardNumber || "8600 1234 5678 9999"}</span>
                        </div>
                      </div>
                      <span className={isDark ? "text-zinc-400 group-hover:text-blue-400 transition-colors" : "text-slate-500 group-hover:text-blue-600 transition-colors"}>
                        {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </div>

                    {/* Telegram Bot */}
                    <div className={`py-1.5 px-2.5 rounded-xl ${itemCardBg} border flex items-center justify-between gap-2`}>
                      <div className="min-w-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${subTextClass} block leading-tight`}>TELEGRAM BOT:</span>
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-500 leading-tight">
                          <Send className="w-3 h-3 shrink-0" />
                          <span className="truncate">Faol sozlangan</span>
                        </div>
                      </div>
                      <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-zinc-400" : "text-slate-400"}`} />
                    </div>

                    {/* Wi-Fi */}
                    <div className={`py-1.5 px-2.5 rounded-xl ${itemCardBg} border flex items-center justify-between text-xs`}>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <span className="text-blue-500 text-xs">📶</span>
                        <span className={`text-[10px] ${subTextClass}`}>Showroom Wi-Fi:</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] ${
                        isDark ? "text-zinc-100" : "text-slate-900"
                      }`}>{settings.wifiSsid || "BUTTON_GUEST"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-right">
                  <button
                    onClick={() => setActiveMenu("profile")}
                    className={`py-1 px-2.5 rounded-xl border text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "border-blue-400/40 text-blue-400 hover:bg-blue-500/10"
                        : "border-blue-200 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <span>{lang === "ru" ? "Редактировать профиль" : "Profilni tahrirlash"}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Center Card: Statistika & Savdo Dinamikasi (lg:col-span-4) */}
              <div className={`p-4 sm:p-5 rounded-2xl ${cardBgClass} border flex flex-col justify-between space-y-3 lg:col-span-4 shadow-xs`}>
                <div className="space-y-2.5">
                  {/* Header with Title and Dropdown */}
                  <div className="flex items-center justify-between gap-2 border-b border-purple-900/10 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                          {lang === "ru" ? "Статистика и Динамика" : "Statistika & Savdo Dinamikasi"}
                        </h3>
                        <p className={`text-[9px] ${subTextClass}`}>
                          {lang === "ru" ? "Активная статистика по заказам" : "Haqiqiy buyurtmalar asosidagi faol statistika"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border shrink-0 cursor-pointer ${
                      isDark ? "bg-[#180e32] border-purple-900/40 text-zinc-300" : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      Oxirgi 7 kun ⌵
                    </span>
                  </div>

                  {/* 7-Day Trend Subheader */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className={`text-xs font-bold ${subTextClass}`}>7 kunlik savdo trendi</span>
                    <span className="text-xs font-mono font-black text-sky-400">
                      {formatUzbekCurrency(salesAnalytics.totalOrdersAmount)} ↑
                    </span>
                  </div>

                  {/* 7-Day Bar Chart: Truthful, Proportional & Baseline Empty Days */}
                  <div className="h-28 flex items-end justify-between gap-1.5 pt-1 px-0.5">
                    {salesAnalytics.days.map((d, idx) => {
                      const maxAmount = salesAnalytics.maxDayAmount;
                      const hasSales = d.amount > 0;
                      const isPeak = hasSales && d.amount === maxAmount;
                      // True scale: if 0 sales, flat minimal 6px baseline pill. If sales, scale dynamically!
                      const heightPx = hasSales
                        ? (maxAmount > 0 ? Math.max(Math.round((d.amount / maxAmount) * 60) + 16, 18) : 20)
                        : 6;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          {/* Hover tooltip */}
                          <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-white text-[9px] font-mono px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap z-30 shadow-lg border border-blue-500/40">
                            {formatUzbekCurrency(d.amount)} ({d.count} ta)
                          </div>

                          <div className="w-full flex items-end justify-center h-20">
                            <div
                              style={{ height: `${heightPx}px` }}
                              className={`w-full max-w-[24px] transition-all duration-300 group-hover:brightness-125 ${
                                isPeak
                                  ? "rounded-xl bg-gradient-to-t from-cyan-400 via-blue-500 to-blue-600 shadow-md shadow-blue-500/40 border border-cyan-300/40"
                                  : hasSales
                                  ? "rounded-xl bg-gradient-to-t from-blue-700 to-blue-500 border border-blue-400/30"
                                  : isDark
                                  ? "rounded-full bg-slate-800/90 border border-slate-700/50"
                                  : "rounded-full bg-slate-200 border border-slate-300"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-[10px] truncate ${
                              isPeak
                                ? "font-black text-cyan-400"
                                : hasSales
                                ? "font-bold text-blue-400"
                                : subTextClass
                            }`}
                          >
                            {d.dayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-purple-900/10 dark:border-slate-800 text-xs font-medium text-zinc-400">
                  <span>Jami buyurtmalar: <b className={`${headingTextClass} font-bold`}>{orders.length} ta</b></span>
                </div>
              </div>

              {/* Right Card: Kategoriyalar ulushi (lg:col-span-4) */}
              <div className={`p-4 sm:p-5 rounded-2xl ${cardBgClass} border flex flex-col justify-between space-y-3 lg:col-span-4 shadow-xs`}>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-purple-900/10 dark:border-slate-800 pb-1.5">
                    <h4 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                      {lang === "ru" ? "Доля категорий" : "Kategoriyalar ulushi"}
                    </h4>
                    <span className="text-[10px] font-semibold text-purple-400">
                      {salesAnalytics.topCategories.length} taifa
                    </span>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    {salesAnalytics.topCategories.slice(0, 4).map((cat) => (
                      <div key={cat.key} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-medium truncate ${headingTextClass}`}>{cat.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-zinc-400">{cat.count} ta</span>
                            <span className="font-bold text-blue-500 font-mono">· {cat.percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800/30 dark:bg-zinc-800/60 overflow-hidden">
                          <div
                            style={{ width: `${cat.percentage}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${cat.color || "from-blue-600 to-cyan-500"} transition-all duration-500`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-purple-900/10 dark:border-slate-800 text-right text-xs font-medium">
                  <span className="text-zinc-400">O'rtacha chek: </span>
                  <b className="text-amber-500 font-bold font-mono">{formatUzbekCurrency(orders.length ? Math.round(salesAnalytics.totalOrdersAmount / orders.length) : 0)}</b>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>{t.dashboard.recentOrders}</h3>
                  <p className={`text-xs ${subTextClass}`}>{orders.length} ta buyurtma qayd etilgan</p>
                </div>
                <button
                  onClick={() => setActiveMenu("orders")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.dashboard.viewAllOrders}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  <p className="text-xs">{t.orders.noOrders}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderForView(order)}
                      className={`p-3.5 rounded-2xl ${itemCardBg} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:border-blue-500/60 hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          #{order.id.slice(-4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-xs ${headingTextClass}`}>{order.customerName}</h4>
                            <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Batafsil →
                            </span>
                          </div>
                          <span className={`text-[11px] ${subTextClass}`}>
                            {order.customerPhone} • {order.items.length} ta kiyim • {order.paymentMethod?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="font-mono font-bold text-emerald-500 text-xs">
                          {formatUzbekCurrency(order.totalAmount)}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                            order.status === "new"
                              ? isDark
                                ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                              : order.status === "confirmed"
                              ? isDark
                                ? "bg-sky-950/90 text-sky-300 border-sky-500/50"
                                : "bg-sky-100 text-sky-800 border-sky-300"
                              : order.status === "delivered"
                              ? isDark
                                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : isDark
                              ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                              : "bg-zinc-100 text-zinc-700 border-zinc-300"
                          }`}
                        >
                          {order.status === "new"
                            ? t.orders.statusNew
                            : order.status === "confirmed"
                            ? t.orders.statusConfirmed
                            : order.status === "delivered"
                            ? t.orders.statusDelivered
                            : t.orders.statusCancelled}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2: PRODUCTS MANAGEMENT (STUDIO CATALOG)
           ========================================================================= */}
        {activeMenu === "products" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-5 relative z-10`}>
            {/* Header & New Product Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-purple-400 flex items-center justify-center">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>{t.products.title}</h2>
                  <p className={`text-xs ${subTextClass}`}>{t.products.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      nameRu: "",
                      description: "",
                      descriptionRu: "",
                      price: 290000,
                      category: "suits",
                      sizes: ["M", "L", "XL"],
                      isAvailable: true,
                      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
                      badge: "Yangi",
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.products.addProduct}</span>
                </button>

                {/* Grid / List switch */}
                <div className={`flex p-1 rounded-xl border ${isDark ? "bg-[#1f1733] border-purple-900/30" : "bg-zinc-100 border-zinc-200"}`}>
                  <button
                    onClick={() => setViewLayout("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewLayout === "grid" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewLayout("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewLayout === "list" ? "bg-blue-600 text-white" : "text-zinc-400"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedProductCategory === cat.id;
                const label = lang === "ru" ? cat.nameRu : cat.nameUz;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedProductCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "bg-[#1f1738] text-zinc-400 hover:text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Products Grid (2-Columns Matching Image 1 & 3) */}
            <div className={`grid ${viewLayout === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-3.5`}>
              {filteredProducts.map((p) => {
                const productName = lang === "ru" && p.nameRu ? p.nameRu : p.name;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setEditingProduct({
                        ...p,
                        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
                      });
                      setIsProductModalOpen(true);
                    }}
                    className={`p-3.5 rounded-2xl ${itemCardBg} border flex items-center justify-between gap-3 transition-all shadow-xs cursor-pointer hover:border-blue-500/60 hover:shadow-md group`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-16 h-18 rounded-2xl overflow-hidden shrink-0 bg-zinc-800">
                        <Image src={p.image} alt={productName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        {p.images && p.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 text-[9px] font-mono font-bold text-white backdrop-blur-xs">
                            +{p.images.length}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-xs truncate max-w-[190px] ${headingTextClass}`}>
                            {productName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              p.badge === "Xit" || p.badge === "Хит"
                                ? "bg-blue-500/20 text-purple-400 border border-blue-500/30"
                                : p.badge === "Yangi" || p.badge === "Новинка"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : p.badge === "Chegirma" || p.badge === "Скидка"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {p.badge || (lang === "ru" ? "Faol" : "Faol")}
                          </span>
                        </div>

                        <p className={`text-xs font-black font-mono ${isDark ? "text-amber-400" : "text-purple-700"}`}>
                          {formatUzbekCurrency(p.price)}
                        </p>

                        <p className={`text-[10px] truncate ${subTextClass}`}>
                          {t.products.sizes} {p.sizes.join(", ")}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Toggle, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAvailability(p);
                        }}
                        title={p.isAvailable ? t.products.show : t.products.hide}
                        className="p-1.5 rounded-xl bg-blue-500/10 text-purple-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                      >
                        {p.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct({
                            ...p,
                            images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
                          });
                          setIsProductModalOpen(true);
                        }}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          isDark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                        }`}
                        title={t.products.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(p.id);
                        }}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title={t.products.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer pagination count */}
            <div className={`flex items-center justify-between pt-3 border-t text-xs ${isDark ? "border-purple-900/30" : "border-zinc-200"} ${subTextClass}`}>
              <span>{t.products.totalItems} <b>{filteredProducts.length}</b></span>
              <div className="flex gap-1">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: ORDERS MANAGEMENT
           ========================================================================= */}
        {activeMenu === "orders" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-4 relative z-10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>{t.orders.title}</h2>
                <p className={`text-xs ${subTextClass}`}>{orders.length} ta onlayn buyurtmalar</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData(pin)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.orders.refresh}</span>
                </button>
              </div>
            </div>

            {/* 1. Mobile View: Sleek, Compact Horizontal Scrollable Status Chips (sm:hidden) */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-1 px-1">
                {[
                  {
                    id: "all" as const,
                    labelUz: "Barchasi",
                    labelRu: "Все",
                    icon: Layers,
                    activeClasses: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-600/30 font-black",
                    inactiveDark: "bg-[#121c35] text-blue-100 border-blue-500/30",
                    inactiveLight: "bg-blue-50 text-blue-900 border-blue-200",
                    badgeDark: "bg-blue-500/25 text-blue-200",
                    badgeLight: "bg-blue-100 text-blue-800",
                  },
                  {
                    id: "new" as const,
                    labelUz: "Yangi (Kutilmoqda)",
                    labelRu: "Новые",
                    icon: Clock,
                    activeClasses: "bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/30 font-black",
                    inactiveDark: "bg-[#251b12] text-amber-200 border-amber-500/40",
                    inactiveLight: "bg-amber-50 text-amber-950 border-amber-200",
                    badgeDark: "bg-amber-500/30 text-amber-200",
                    badgeLight: "bg-amber-100 text-amber-900",
                  },
                  {
                    id: "confirmed" as const,
                    labelUz: "Tasdiqlangan",
                    labelRu: "Подтверждено",
                    icon: CheckCircle2,
                    activeClasses: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-sky-300 shadow-md shadow-sky-500/30 font-black",
                    inactiveDark: "bg-[#0f2132] text-sky-200 border-sky-500/40",
                    inactiveLight: "bg-sky-50 text-sky-950 border-sky-200",
                    badgeDark: "bg-sky-500/30 text-sky-200",
                    badgeLight: "bg-sky-100 text-sky-900",
                  },
                  {
                    id: "delivered" as const,
                    labelUz: "Yetkazib berildi",
                    labelRu: "Доставлено",
                    icon: Truck,
                    activeClasses: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 font-black",
                    inactiveDark: "bg-[#0c261a] text-emerald-200 border-emerald-500/40",
                    inactiveLight: "bg-emerald-50 text-emerald-950 border-emerald-200",
                    badgeDark: "bg-emerald-500/30 text-emerald-200",
                    badgeLight: "bg-emerald-100 text-emerald-900",
                  },
                  {
                    id: "cancelled" as const,
                    labelUz: "Bekor qilindi",
                    labelRu: "Отменено",
                    icon: XCircle,
                    activeClasses: "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-600/30 font-black",
                    inactiveDark: "bg-[#28131b] text-rose-200 border-rose-500/40",
                    inactiveLight: "bg-rose-50 text-rose-950 border-rose-200",
                    badgeDark: "bg-rose-500/30 text-rose-200",
                    badgeLight: "bg-rose-100 text-rose-900",
                  },
                ].map((st) => {
                  const count = st.id === "all" ? orders.length : orders.filter((o) => o.status === st.id).length;
                  const isSelected = orderStatusFilter === st.id;
                  const IconComp = st.icon;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? st.activeClasses
                          : isDark
                          ? st.inactiveDark
                          : st.inactiveLight
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{lang === "ru" ? st.labelRu : st.labelUz}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                          isSelected
                            ? "bg-white/30 text-white"
                            : isDark
                            ? st.badgeDark
                            : st.badgeLight
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Selected Category Turnover */}
              <div className={`px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between ${itemCardBg}`}>
                <span className={`text-[10px] font-bold ${subTextClass}`}>
                  {lang === "ru" ? "Сумма по выбранному статусу:" : "Tanlangan toifa buyurtmalari summasi:"}
                </span>
                <span className={`font-mono font-black text-xs ${isDark ? "text-amber-400" : "text-blue-600"}`}>
                  {formatUzbekCurrency(
                    orders
                      .filter((o) => (orderStatusFilter === "all" ? true : o.status === orderStatusFilter))
                      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                  )}
                </span>
              </div>
            </div>

            {/* 2. Desktop View: Unchanged Rich 5-Column Grid Cards (hidden sm:grid) */}
            <div className="hidden sm:grid sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {[
                {
                  id: "all" as const,
                  labelUz: "Barchasi",
                  labelRu: "Все заказы",
                  icon: Layers,
                  color: "blue",
                  activeClasses: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50",
                  inactiveDark: "bg-[#121c35] text-blue-100 border-blue-500/40 hover:border-blue-400 hover:bg-[#182547]",
                  inactiveLight: "bg-blue-50/90 text-blue-950 border-blue-200 hover:bg-blue-100/80",
                  iconDark: "bg-blue-500/25 text-blue-300",
                  iconLight: "bg-blue-200 text-blue-700",
                  badgeDark: "bg-blue-500/25 text-blue-200 border-blue-400/40",
                  badgeLight: "bg-blue-100 text-blue-800 border-blue-200",
                },
                {
                  id: "new" as const,
                  labelUz: "Yangi (Kutilmoqda)",
                  labelRu: "Новые (Ожидание)",
                  icon: Clock,
                  color: "amber",
                  activeClasses: "bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 border-amber-300 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/60 font-black",
                  inactiveDark: "bg-[#251b12] text-amber-100 border-amber-500/50 hover:border-amber-400 hover:bg-[#322316]",
                  inactiveLight: "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100",
                  iconDark: "bg-amber-500/25 text-amber-300",
                  iconLight: "bg-amber-200 text-amber-800",
                  badgeDark: "bg-amber-500/30 text-amber-200 border-amber-400/50",
                  badgeLight: "bg-amber-200 text-amber-900 border-amber-300",
                },
                {
                  id: "confirmed" as const,
                  labelUz: "Tasdiqlangan",
                  labelRu: "Подтвержденные",
                  icon: CheckCircle2,
                  color: "sky",
                  activeClasses: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-sky-300 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400/50",
                  inactiveDark: "bg-[#0f2132] text-sky-100 border-sky-500/50 hover:border-sky-400 hover:bg-[#152e46]",
                  inactiveLight: "bg-sky-50 text-sky-950 border-sky-300 hover:bg-sky-100",
                  iconDark: "bg-sky-500/25 text-sky-300",
                  iconLight: "bg-sky-200 text-sky-700",
                  badgeDark: "bg-sky-500/30 text-sky-200 border-sky-400/50",
                  badgeLight: "bg-sky-200 text-sky-900 border-sky-300",
                },
                {
                  id: "delivered" as const,
                  labelUz: "Yetkazib berildi",
                  labelRu: "Доставленные",
                  icon: Truck,
                  color: "emerald",
                  activeClasses: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50",
                  inactiveDark: "bg-[#0c261a] text-emerald-100 border-emerald-500/50 hover:border-emerald-400 hover:bg-[#123625]",
                  inactiveLight: "bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100",
                  iconDark: "bg-emerald-500/25 text-emerald-300",
                  iconLight: "bg-emerald-200 text-emerald-700",
                  badgeDark: "bg-emerald-500/30 text-emerald-200 border-emerald-400/50",
                  badgeLight: "bg-emerald-200 text-emerald-900 border-emerald-300",
                },
                {
                  id: "cancelled" as const,
                  labelUz: "Bekor qilindi",
                  labelRu: "Отмененные",
                  icon: XCircle,
                  color: "rose",
                  activeClasses: "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/50",
                  inactiveDark: "bg-[#28131b] text-rose-100 border-rose-500/50 hover:border-rose-400 hover:bg-[#381925]",
                  inactiveLight: "bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100",
                  iconDark: "bg-rose-500/25 text-rose-300",
                  iconLight: "bg-rose-200 text-rose-700",
                  badgeDark: "bg-rose-500/30 text-rose-200 border-rose-400/50",
                  badgeLight: "bg-rose-200 text-rose-900 border-rose-300",
                },
              ].map((st) => {
                const count = st.id === "all" ? orders.length : orders.filter((o) => o.status === st.id).length;
                const totalAmount = orders
                  .filter((o) => (st.id === "all" ? true : o.status === st.id))
                  .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const isSelected = orderStatusFilter === st.id;
                const IconComponent = st.icon;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                      isSelected
                        ? st.activeClasses
                        : isDark
                        ? st.inactiveDark
                        : st.inactiveLight
                    }`}
                  >
                    {/* Top Row: Icon + Status Name + Count Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : isDark
                              ? st.iconDark
                              : st.iconLight
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-xs tracking-tight truncate">
                          {lang === "ru" ? st.labelRu : st.labelUz}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {st.id === "new" && count > 0 && !isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-black border ${
                            isSelected
                              ? "bg-white/25 text-white border-white/40"
                              : isDark
                              ? st.badgeDark
                              : st.badgeLight
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Total monetary amount in this category */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-current/15">
                      <span className="text-[10px] opacity-80 font-medium">
                        {lang === "ru" ? "Сумма:" : "Summa:"}
                      </span>
                      <span className="font-mono font-bold text-[11px]">
                        {formatUzbekCurrency(totalAmount)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{t.orders.noOrders}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderForView(o)}
                    className={`p-4 rounded-2xl ${itemCardBg} border space-y-3 cursor-pointer hover:border-blue-500/60 hover:shadow-md transition-all group ${
                      o.status === "new" ? "border-rose-500/50 shadow-md shadow-rose-600/10" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-400 group-hover:text-blue-500 transition-colors">#{o.id}</span>
                        <span className={`text-[11px] flex items-center gap-1 ${subTextClass}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(o.createdAt).toLocaleString("uz-UZ", {
                            timeZone: "Asia/Tashkent",
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          Batafsil ko'rish →
                        </span>
                      </div>

                      {/* Crisp, High-Contrast Custom Status Selector */}
                      <div
                        className="relative status-dropdown-wrapper"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenStatusDropdownId(openStatusDropdownId === o.id ? null : o.id)}
                          className={`text-xs font-black tracking-wide px-3.5 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                            o.status === "new"
                              ? isDark
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/25"
                                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                              : o.status === "confirmed"
                              ? isDark
                                ? "bg-sky-500/15 text-sky-300 border-sky-500/50 hover:bg-sky-500/25"
                                : "bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100"
                              : o.status === "delivered"
                              ? isDark
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/25"
                                : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                              : isDark
                              ? "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750"
                              : "bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              o.status === "new"
                                ? "bg-amber-400 animate-pulse"
                                : o.status === "confirmed"
                                ? "bg-sky-400"
                                : o.status === "delivered"
                                ? "bg-emerald-400"
                                : "bg-zinc-400"
                            }`}
                          />
                          <span className="font-bold">
                            {o.status === "new"
                              ? t.orders.statusNew
                              : o.status === "confirmed"
                              ? t.orders.statusConfirmed
                              : o.status === "delivered"
                              ? t.orders.statusDelivered
                              : t.orders.statusCancelled}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openStatusDropdownId === o.id ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu with absolute clarity & no native browser blur */}
                        {openStatusDropdownId === o.id && (
                          <div
                            className={`absolute right-0 top-full mt-1.5 w-56 rounded-2xl p-1.5 z-50 shadow-2xl border ${
                              isDark
                                ? "bg-[#0f172a] border-slate-700 text-white"
                                : "bg-white border-slate-200 text-slate-900 shadow-slate-300/40"
                            }`}
                          >
                            {(["new", "confirmed", "delivered", "cancelled"] as const).map((st) => {
                              const isCurrent = o.status === st;
                              const label =
                                st === "new"
                                  ? t.orders.statusNew
                                  : st === "confirmed"
                                  ? t.orders.statusConfirmed
                                  : st === "delivered"
                                  ? t.orders.statusDelivered
                                  : t.orders.statusCancelled;

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateOrderStatus(o.id, st);
                                    setOpenStatusDropdownId(null);
                                  }}
                                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    isCurrent
                                      ? isDark
                                        ? "bg-blue-600/25 text-white"
                                        : "bg-blue-50 text-blue-700 font-black"
                                      : isDark
                                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                        st === "new"
                                          ? "bg-amber-400"
                                          : st === "confirmed"
                                          ? "bg-sky-400"
                                          : st === "delivered"
                                          ? "bg-emerald-400"
                                          : "bg-zinc-400"
                                      }`}
                                    />
                                    <span>{label}</span>
                                  </div>
                                  {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Row */}
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2 ${isDark ? "bg-black/30" : "bg-white border border-purple-100"}`}>
                      <div>
                        <span className={`text-[10px] block ${subTextClass}`}>{t.orders.customer}</span>
                        <span className={`font-bold text-sm ${headingTextClass}`}>{o.customerName}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${subTextClass}`}>{t.orders.phone}</span>
                        <a
                          href={`tel:${o.customerPhone}`}
                          className="font-bold font-mono text-emerald-500 hover:underline flex items-center gap-1 text-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{o.customerPhone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Delivery & Payment details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl flex items-center gap-2 ${isDark ? "bg-black/20" : "bg-white"}`}>
                        <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">
                          {o.deliveryType === "delivery" ? o.address || "Toshkent" : `Filial: ${o.branchName || "Olib ketish"}`}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl flex items-center justify-between ${isDark ? "bg-black/20" : "bg-white"}`}>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="uppercase font-bold text-blue-600">{o.paymentMethod || "Click"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {o.paymentReceipt && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 flex items-center gap-1">
                              📸 Chek
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            o.paymentStatus === "paid"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : o.paymentStatus === "verifying"
                              ? "bg-amber-500/25 text-amber-400 animate-pulse border border-amber-500/30"
                              : o.paymentStatus === "rejected"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-500"
                          }`}>
                            {o.paymentStatus === "paid"
                              ? "To'langan"
                              : o.paymentStatus === "verifying"
                              ? "Tekshirilmoqda"
                              : o.paymentStatus === "rejected"
                              ? "Rad etilgan"
                              : "Kutilmoqda"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className={`border-t pt-2 space-y-1.5 text-xs ${isDark ? "border-purple-900/30" : "border-zinc-200"}`}>
                      {o.items.map((it, idx) => {
                        const matchedProduct = products.find(
                          (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
                        );
                        const itColor = it.color || (matchedProduct?.colors && matchedProduct.colors[0]) || "To'q ko'k";
                        return (
                          <div key={idx} className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`truncate font-medium ${headingTextClass}`}>
                                {it.productName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-400 font-bold shrink-0">
                                {it.size || "M"}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold shrink-0">
                                {itColor}
                              </span>
                              <span className="text-[10px] text-zinc-400 shrink-0">
                                × {it.quantity} dona
                              </span>
                            </div>
                            <span className={`font-mono shrink-0 ${subTextClass}`}>
                              {formatUzbekCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Amount */}
                    <div className={`flex justify-between items-center pt-2 border-t font-bold ${isDark ? "border-purple-900/30" : "border-zinc-200"}`}>
                      <span className={`text-xs ${subTextClass}`}>{t.orders.total}</span>
                      <span className="text-base text-emerald-500 font-mono">
                        {formatUzbekCurrency(o.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 4: CUSTOMERS CRM DATABASE & AUDIENCE INSIGHTS
           ========================================================================= */}
        {activeMenu === "customers" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-6 relative z-10`}>
            {/* ------------------- $100 AI RETAIL AUDIT & AUDIENCE INTELLIGENCE (RESTORED) ------------------- */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/40 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bizning Maxsus Taklif: AI Retail & Auditoriya Audit Xizmati ($100)</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    BUTTON VIP Retail Intelligence — Auditoriya Tahlili & Zaxira Boshqaruvi
                  </h3>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    Mijozlar qaysi o'lchamdagi kiyimlarni ko'proq xarid qilmoqda, Instagram reklama uchun eng daromadli auditoriya va xaridorlarni qayta xaridga (LTV) qaytarish strategiyasi.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="px-6 py-3.5 rounded-2xl bg-zinc-800/90 border border-zinc-700/80 text-zinc-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed opacity-75 shrink-0 select-none shadow-none"
                  title={lang === "ru" ? "Временно недоступно" : "Hozircha bu taklif mavjud emas"}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <span>{lang === "ru" ? "Активировать & Просмотр ($100)" : "Faollashtirish & Ko'rish ($100)"}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-700/90 text-zinc-300 normal-case font-medium border border-zinc-600/50">
                      {lang === "ru" ? "недоступно" : "hozircha mavjud emas"}
                    </span>
                  </span>
                </button>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-purple-200 relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
                  <span className="font-bold text-white block">👕 Qaysi kiyim zaxirasini oshirish?</span>
                  <span className="text-[11px] opacity-80 block">Kuz-qish talabi va eng xaridorgir o'lchamlar prognozi</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
                  <span className="font-bold text-white block">🎯 Instagram Reklama Tavsiyasi</span>
                  <span className="text-[11px] opacity-80 block">Aynan qaysi auditoriya va mahsulotga budjet sarflash kerak</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
                  <span className="font-bold text-white block">🔁 Qayta Xarid (LTV) Strategiyasi</span>
                  <span className="text-[11px] opacity-80 block">Eski xaridorlarni yana buyurtma berishga undovchi maxsus takliflar</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>
                  {lang === "ru" ? "Клиенты и Статистика" : "Mijozlar va Statistika"}
                </h2>
                <p className={`text-xs ${subTextClass}`}>{t.customers.subtitle}</p>
              </div>

              {/* Filter Tabs: Barchasi vs Saqlanganlar / VIP */}
              <div className="flex items-center gap-2">
                <div className={`flex p-1 rounded-2xl border ${isDark ? "bg-[#1f1738] border-purple-900/30" : "bg-purple-50 border-purple-200"}`}>
                  <button
                    onClick={() => setCustomerFilter("all")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerFilter === "all"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {lang === "ru" ? "Все" : "Barchasi"} ({customers.length})
                  </button>
                  <button
                    onClick={() => setCustomerFilter("saved")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      customerFilter === "saved"
                        ? "bg-amber-500 text-black shadow-xs font-black"
                        : "text-zinc-400 hover:text-amber-400"
                    }`}
                  >
                    <span>⭐ {lang === "ru" ? "VIP / Избранные" : "Saqlanganlar / VIP"}</span>
                    <span>({customers.filter((c) => c.isBookmarked).length})</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{t.customers.noCustomers}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerForView(c)}
                    className={`p-4 rounded-2xl ${itemCardBg} border flex flex-col justify-between gap-3 shadow-xs cursor-pointer hover:border-blue-500/60 hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                        {c.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm truncate ${headingTextClass}`}>{c.name}</h4>
                            <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Batafsil →
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleToggleCustomerBookmark(c, e)}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              c.isBookmarked
                                ? "bg-amber-500/20 text-amber-400"
                                : "text-zinc-500 hover:text-amber-400 hover:bg-white/5"
                            }`}
                            title={c.isBookmarked ? "Saqlangandan o'chirish" : "VIP / Saqlanganlarga qo'shish"}
                          >
                            <Star className={`w-4 h-4 ${c.isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                        </div>
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-mono text-emerald-500 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                        </a>
                        <p className={`text-[11px] mt-1 truncate ${subTextClass}`}>
                          📍 {c.address || (lang === "ru" ? "Адрес не указан" : "Manzil kiritilmagan")}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t text-xs ${isDark ? "border-purple-900/30" : "border-zinc-200"}`}>
                      <div>
                        <span className={`text-[10px] block ${subTextClass}`}>{t.customers.ordersCount}</span>
                        <span className="font-bold text-blue-600">{c.ordersCount || 0} ta</span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${subTextClass}`}>{t.customers.preferredSize}</span>
                        <span className={`font-bold ${headingTextClass}`}>{c.preferredSize || "L"}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] block ${subTextClass}`}>{t.customers.totalSpent}</span>
                        <span className="font-mono font-bold text-emerald-500">
                          {formatUzbekCurrency(c.totalSpent || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 5: PAYMENT & CARDS (DUAL BANK CARDS MANAGEMENT)
           ========================================================================= */}
        {activeMenu === "payment" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-6 relative z-10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/10 dark:border-slate-800">
              <div>
                <h2 className={`font-bold text-base sm:text-lg ${headingTextClass} flex items-center gap-2`}>
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span>{lang === "ru" ? "Управление банковскими картами (2 карты)" : "To'lov kartalari boshqaruvi (2 ta karta)"}</span>
                </h2>
                <p className={`text-xs ${subTextClass} mt-0.5`}>
                  {lang === "ru"
                    ? "Настройте основную и дополнительную карты. Обе карты редактируются наглядно и без лишних переключений."
                    : "Asosiy va qo'shimcha to'lov kartalarini oson va tushunarli sozlang. Har bir karta o'z maydonida to'liq tahrirlanadi."}
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* 2 DISTINCT CARDS: SIDE-BY-SIDE ON DESKTOP, STACKED ON MOBILE */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* ---------------- CARD 1: ASOSIY TO'LOV KARTASI ---------------- */}
              <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? "bg-[#18122B]/70 border-purple-900/40" : "bg-blue-50/40 border-blue-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      1
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase text-blue-500 tracking-wider">
                        1-Karta: Asosiy To'lov Kartasi
                      </h3>
                      <span className="text-[10px] text-zinc-400">Uzcard / Humo (Har doim faol)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Asosiy Karta</span>
                  </span>
                </div>

                {/* Live Visual Card 1 Preview */}
                <div className="relative w-full aspect-[1.75/1] max-w-sm mx-auto rounded-2xl bg-gradient-to-tr from-purple-950 via-indigo-900 to-zinc-950 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-blue-500/40">
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <span className="font-black text-xs tracking-widest block">BUTTON MEN</span>
                      <span className="text-[9px] font-bold text-amber-400 tracking-wider">1-KARTA (ASOSIY)</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-200 font-bold uppercase truncate max-w-[130px]">
                      {profileForm.cardBank || "Kapitalbank"}
                    </span>
                  </div>

                  {/* Chip */}
                  <div className="w-9 h-6 rounded-md bg-amber-400/90 border border-amber-300 relative z-10 flex items-center justify-center shadow-xs">
                    <span className="w-5 h-2.5 border-b border-t border-amber-600/50 block" />
                  </div>

                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm sm:text-base tracking-widest text-amber-300 block">
                        {profileForm.cardNumber || "8600 •••• •••• 9999"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCard(profileForm.cardNumber || "")}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono transition-colors cursor-pointer"
                      >
                        {copiedCard ? "Nusxalandi!" : "Nusxa"}
                      </button>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                      <span className="truncate max-w-[170px]">{profileForm.cardHolder || "BUTTON MEN WEAR LLC"}</span>
                      <span className="font-bold text-blue-300">UZCARD</span>
                    </div>
                  </div>
                </div>

                {/* Inputs for Card 1 */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Номер карты (16 цифр):" : "1-Karta raqami (16 ta raqam):"}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={profileForm.cardNumber || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, cardNumber: formatCardNumberInput(e.target.value) })}
                      placeholder="8600 1234 5678 9999"
                      className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-amber-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBgClass}`}
                    />
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Raqamlar avtomatik har 4 tadan bo'linadi</span>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Имя владельца карты:" : "Karta egasi to'liq ismi:"}
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.cardHolder || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, cardHolder: e.target.value.toUpperCase() })}
                      placeholder="BUTTON MEN WEAR LLC"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBgClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Название банка / тип:" : "Bank nomi va turi:"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.cardBank || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, cardBank: e.target.value })}
                      placeholder="Kapitalbank (Uzcard)"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* ---------------- CARD 2: QO'SHIMCHA / ZAXIRA KARTA ---------------- */}
              <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? "bg-[#18122B]/70 border-emerald-900/40" : "bg-emerald-50/40 border-emerald-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      2
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase text-emerald-500 tracking-wider">
                        2-Karta: Qo'shimcha / Zaxira
                      </h3>
                      <span className="text-[10px] text-zinc-400">Humo / Visa / Mastercard</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-black/25 px-3 py-1.5 rounded-full border border-emerald-500/30 hover:border-emerald-500/60 transition-all">
                    <span className={`text-[11px] font-bold ${profileForm.card2Enabled ? "text-emerald-400" : "text-zinc-400"}`}>
                      {profileForm.card2Enabled ? "Mijozlarga ko'rinsin" : "O'chirilgan"}
                    </span>
                    <input
                      type="checkbox"
                      checked={profileForm.card2Enabled ?? true}
                      onChange={(e) => setProfileForm({ ...profileForm, card2Enabled: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Live Visual Card 2 Preview */}
                <div className={`relative w-full aspect-[1.75/1] max-w-sm mx-auto rounded-2xl bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-950 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-emerald-500/40 transition-opacity ${profileForm.card2Enabled ? "opacity-100" : "opacity-60"}`}>
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

                  {!profileForm.card2Enabled && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-xs font-bold text-amber-300">⚠️ Ushbu karta o'chirilgan</span>
                      <span className="text-[10px] text-zinc-300 mt-0.5">Mijozlar to'lov oynasida faqat 1-karta ko'rinadi</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <span className="font-black text-xs tracking-widest block">BUTTON MEN</span>
                      <span className="text-[9px] font-bold text-emerald-400 tracking-wider">2-KARTA (ZAXIRA)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-200 font-bold uppercase truncate max-w-[130px]">
                      {profileForm.card2Bank || "TBC Bank"}
                    </span>
                  </div>

                  {/* Chip */}
                  <div className="w-9 h-6 rounded-md bg-slate-300/90 border border-slate-200 relative z-10 flex items-center justify-center shadow-xs">
                    <span className="w-5 h-2.5 border-b border-t border-slate-500/50 block" />
                  </div>

                  <div className="relative z-10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm sm:text-base tracking-widest text-emerald-300 block">
                        {profileForm.card2Number || "9860 •••• •••• 7788"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCard2(profileForm.card2Number || "")}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono transition-colors cursor-pointer"
                      >
                        {copiedCard2 ? "Nusxalandi!" : "Nusxa"}
                      </button>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                      <span className="truncate max-w-[170px]">{profileForm.card2Holder || "BUTTON MEN WEAR LLC"}</span>
                      <span className="font-bold text-emerald-300">HUMO / VISA</span>
                    </div>
                  </div>
                </div>

                {/* Inputs for Card 2 */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Номер 2-й карты (16 цифр):" : "2-Karta raqami (16 ta raqam):"}
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={profileForm.card2Number || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, card2Number: formatCardNumberInput(e.target.value) })}
                      placeholder="9860 1201 3344 7788"
                      className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputBgClass}`}
                    />
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Raqamlar avtomatik har 4 tadan bo'linadi</span>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Имя владельца 2-й карты:" : "2-Karta egasi to'liq ismi:"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.card2Holder || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, card2Holder: e.target.value.toUpperCase() })}
                      placeholder="BUTTON MEN WEAR LLC"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputBgClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Название банка / тип:" : "2-Karta bank nomi va turi:"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.card2Bank || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, card2Bank: e.target.value })}
                      placeholder="TBC Bank (Humo / Visa)"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Big Save Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSaveSettings(profileForm)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/25 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saqlanmoqda..." : "💾 Barcha karta ma'lumotlarini saqlash"}</span>
              </button>
            </div>

            {/* Supported Apps Note */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${itemCardBg}`}>
              <span className={`font-bold block ${headingTextClass}`}>{t.payment.supportedAppsTitle}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-zinc-400">
                <div>• <b>Click:</b> {t.payment.clickNote}</div>
                <div>• <b>Payme:</b> {t.payment.paymeNote}</div>
                <div>• <b>Uzum Bank:</b> {t.payment.uzumNote}</div>
                <div>• <b>Naqd:</b> {t.payment.cashNote}</div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 5B: TARIFFS & DISCOUNTS (ADJUSTABLE BY ADMIN)
           ========================================================================= */}
        {activeMenu === "tariffs" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-6 relative z-10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`font-bold text-base sm:text-lg flex items-center gap-2 ${headingTextClass}`}>
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span>{lang === "ru" ? "Управление тарифами доставки и скидками" : "Dastavka narxlari va chegirmalar boshqaruvi"}</span>
                </h2>
                <p className={`text-xs ${subTextClass} mt-0.5`}>
                  {lang === "ru"
                    ? "Укажите стоимость доставки для Ташкента и регионов, порог бесплатной доставки и процент скидок"
                    : "Toshkent shahri va viloyatlar uchun yetkazib berish narxlari, bepul dastavka chegarasi hamda chegirmalarni belgilang"}
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveTariffsAndDiscounts}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? (lang === "ru" ? "Сохранение..." : "Saqlanmoqda...") : (lang === "ru" ? "Сохранить изменения" : "O'zgarishlarni saqlash")}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Toshkent shahri bo'ylab yetkazib berish */}
              <div className={`p-5 rounded-2xl ${itemCardBg} border space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                      🏢
                    </span>
                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                        {lang === "ru" ? "Доставка по Ташкенту" : "Toshkent shahri bo'ylab"}
                      </h3>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {lang === "ru" ? "Тариф курьерской доставки по столице" : "Toshkent shahar ichida yetkazib berish shartlari"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                    Toshkent
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Стоимость доставки (сум)" : "Yetkazib berish narxi (so'm)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={deliveryPriceTashkentInput}
                      onChange={(e) => setDeliveryPriceTashkentInput(Number(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                      placeholder="30000"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {lang === "ru" ? "Стандартная плата: " : "Amaldagi standart narx: "}
                      <b className="text-blue-500 font-mono">{formatUzbekCurrency(deliveryPriceTashkentInput)}</b>
                    </p>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Порог бесплатной доставки (сум)" : "Bepul yetkazib berish chegarasi (so'm)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={deliveryFreeTashkentInput}
                      onChange={(e) => setDeliveryFreeTashkentInput(Number(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                      placeholder="500000"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {lang === "ru"
                        ? `Заказ от ${formatUzbekCurrency(deliveryFreeTashkentInput)} доставляется бесплатно`
                        : `Buyurtma summasi ${formatUzbekCurrency(deliveryFreeTashkentInput)} dan oshganda dastavka bepul bo'ladi`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Viloyatlar bo'ylab yetkazib berish */}
              <div className={`p-5 rounded-2xl ${itemCardBg} border space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                      🚚
                    </span>
                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                        {lang === "ru" ? "Доставка по регионам Узбекистана" : "O'zbekiston viloyatlari bo'ylab"}
                      </h3>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {lang === "ru" ? "Почтовая или курьерская доставка в регионы" : "Barcha viloyatlar va Qoraqalpog'iston Respublikasiga"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                    Viloyatlar
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Стоимость доставки в регионы (сум)" : "Viloyatlarga yetkazib berish narxi (so'm)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={deliveryPriceRegionsInput}
                      onChange={(e) => setDeliveryPriceRegionsInput(Number(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
                      placeholder="40000"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {lang === "ru" ? "Стандартная плата: " : "Amaldagi viloyat narxi: "}
                      <b className="text-purple-500 font-mono">{formatUzbekCurrency(deliveryPriceRegionsInput)}</b>
                    </p>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Порог бесплатной доставки в регионы (сум)" : "Viloyatlarga bepul yetkazish chegarasi (so'm)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={deliveryFreeRegionsInput}
                      onChange={(e) => setDeliveryFreeRegionsInput(Number(e.target.value) || 0)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
                      placeholder="1000000"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {lang === "ru"
                        ? `Заказ от ${formatUzbekCurrency(deliveryFreeRegionsInput)} доставляется бесплатно`
                        : `Buyurtma summasi ${formatUzbekCurrency(deliveryFreeRegionsInput)} dan oshganda viloyatga ham bepul`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Combo / Lookbook chegirmasi */}
              <div className={`p-5 rounded-2xl ${itemCardBg} border space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      ✨
                    </span>
                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                        {lang === "ru" ? "Скидка на комбо-образы (Lookbook / AI)" : "Combo to'plam chegirmasi (AI & Lookbook)"}
                      </h3>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {lang === "ru" ? "Автоматическая скидка при покупке полного комплекта" : "To'liq kiyim to'plamini (obraz) birgalikda olgandagi chegirma"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    Combo %
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Процент скидки (%)" : "Chegirma foizi (%)"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={comboDiscountInput}
                        onChange={(e) => setComboDiscountInput(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                        className={`w-32 px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-emerald-500/40`}
                        placeholder="10"
                      />
                      <span className="font-bold text-base font-mono text-emerald-500">
                        {comboDiscountInput}% OFF
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {lang === "ru"
                        ? "Клиент видит эту скидку в разделе 'AI Stylist / Lookbook' при оформлении сета"
                        : "Xaridor 'AI Stylist / Lookbook' bo'limida tayyor kiyim to'plamiga aynan shu foizda chegirma oladi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Umumiy do'kon aksiyasi / Promokod */}
              <div className={`p-5 rounded-2xl ${itemCardBg} border space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                      🏷️
                    </span>
                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm ${headingTextClass}`}>
                        {lang === "ru" ? "Общая скидка акции магазина (%)" : "Umumiy aksiya chegirmasi (%)"}
                      </h3>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {lang === "ru" ? "Глобальная скидка на весь ассортимент (0 = отключено)" : "Butun do'konga qo'shimcha umumiy aksiya (0 = chegirmasiz)"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    Aksiya %
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>
                      {lang === "ru" ? "Глобальный процент скидки (%)" : "Umumiy do'kon chegirmasi (%)"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={globalPromoDiscountInput}
                        onChange={(e) => setGlobalPromoDiscountInput(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                        className={`w-32 px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-amber-500/40`}
                        placeholder="0"
                      />
                      <span className="font-bold text-base font-mono text-amber-500">
                        {globalPromoDiscountInput}%
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {globalPromoDiscountInput > 0
                        ? (lang === "ru" ? `Включена скидка ${globalPromoDiscountInput}% на сайте` : `Hozir saytda ${globalPromoDiscountInput}% umumiy aksiya faol`)
                        : (lang === "ru" ? "Глобальная скидка выключена (0%)" : "Umumiy aksiya o'chirilgan (0%)")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Summary Preview Box */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${itemCardBg}`}>
              <span className={`font-bold block ${headingTextClass}`}>
                📋 {lang === "ru" ? "Предварительный просмотр тарифов для покупателя:" : "Mijoz savatchasida ko'rinadigan amaldagi shartlar:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-zinc-400">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5">
                  <span className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">🏢 Toshkent shahri:</span>
                  <div>Yetkazish: <b className="text-blue-500 font-mono">{formatUzbekCurrency(deliveryPriceTashkentInput)}</b></div>
                  <div>Bepul chegarasi: <b className="text-emerald-500 font-mono">{formatUzbekCurrency(deliveryFreeTashkentInput)}</b></div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5">
                  <span className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">🚚 Viloyatlar:</span>
                  <div>Yetkazish: <b className="text-purple-500 font-mono">{formatUzbekCurrency(deliveryPriceRegionsInput)}</b></div>
                  <div>Bepul chegarasi: <b className="text-emerald-500 font-mono">{formatUzbekCurrency(deliveryFreeRegionsInput)}</b></div>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5">
                  <span className="block font-bold text-slate-800 dark:text-zinc-200 mb-1">✨ Chegirmalar:</span>
                  <div>Combo to'plam: <b className="text-emerald-500 font-mono">{comboDiscountInput}%</b></div>
                  <div>Umumiy aksiya: <b className="text-amber-500 font-mono">{globalPromoDiscountInput}%</b></div>
                </div>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveTariffsAndDiscounts}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/25 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>
                  {loading
                    ? (lang === "ru" ? "Сохранение..." : "Saqlanmoqda...")
                    : (lang === "ru" ? "💾 Сохранить тарифы и проценты скидок" : "💾 Barcha tariflar va chegirma foizlarini saqlash")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 6: BRANCHES (4 LOCATIONS IN TASHKENT)
           ========================================================================= */}
        {activeMenu === "branches" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-4 relative z-10`}>
            <div>
              <h2 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>{t.branches.title}</h2>
              <p className={`text-xs ${subTextClass}`}>{t.branches.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(profileForm.branches || settings.branches || []).map((branch, index) => (
                <div key={branch.id || index} className={`p-5 rounded-2xl ${itemCardBg} border space-y-3 shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-blue-600 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-purple-400 flex items-center justify-center text-xs font-mono">
                        {index + 1}
                      </span>
                      <span>{lang === "ru" && branch.nameRu ? branch.nameRu : branch.name}</span>
                    </span>
                    <button
                      onClick={() => {
                        setEditingBranch(branch);
                        setIsBranchModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-purple-400 text-xs font-bold cursor-pointer"
                    >
                      {t.products.edit}
                    </button>
                  </div>

                  <p className={`text-xs leading-relaxed ${headingTextClass}`}>
                    📍 {lang === "ru" && branch.addressRu ? branch.addressRu : branch.address}
                  </p>

                  <p className="text-[11px] text-amber-500">
                    🎯 {t.branches.landmark} {lang === "ru" && branch.landmarkRu ? branch.landmarkRu : branch.landmark}
                  </p>

                  <div className={`flex items-center justify-between text-xs pt-2 border-t ${isDark ? "border-purple-900/30" : "border-zinc-200"}`}>
                    <span className={subTextClass}>{branch.phone}</span>
                    <div className="flex gap-2">
                      <a href={branch.yandexMap} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">
                        Yandex
                      </a>
                      <a href={branch.googleMap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Google
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 7: SECURITY & PIN CODE
           ========================================================================= */}
        {activeMenu === "security" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-4 max-w-lg relative z-10`}>
            <div>
              <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${headingTextClass}`}>
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>{t.security.title}</span>
              </h2>
              <p className={`text-xs ${subTextClass}`}>{t.security.subtitle}</p>
            </div>

            <form onSubmit={handleChangePin} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                  {t.security.newPin}
                </label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono tracking-widest focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${subTextClass}`}>
                  {t.security.confirmPin}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono tracking-widest focus:outline-none ${inputBgClass}`}
                />
              </div>

              {pinChangeError && (
                <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-bold">
                  {pinChangeError}
                </p>
              )}
              {pinChangeSuccess && (
                <p className="text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-bold">
                  {pinChangeSuccess}
                </p>
              )}

              <p className={`text-[11px] leading-relaxed ${subTextClass}`}>
                {t.security.securityAdvice}
              </p>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 cursor-pointer active:scale-95"
              >
                {t.security.savePinBtn}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            SECTION 8: ADMIN PROFILE & STORE BRAND SETTINGS
           ========================================================================= */}
        {activeMenu === "profile" && (
          <div className={`p-5 sm:p-6 rounded-3xl ${cardBgClass} border space-y-6 relative z-10`}>
            <div>
              <h2 className={`font-bold text-sm sm:text-base ${headingTextClass}`}>{t.profile.title}</h2>
              <p className={`text-xs ${subTextClass}`}>{t.profile.subtitle}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings(profileForm);
              }}
              className="space-y-6"
            >
              {/* Group 0: Store Brand Logo (Do'kon Logotipi) */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-900/10 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{lang === "ru" ? "Логотип бренда (Do'kon Logotipi)" : "Do'kon Logotipi (Brand Logo)"}</span>
                    </h3>
                    <p className={`text-[11px] ${subTextClass} mt-0.5`}>
                      {lang === "ru"
                        ? "Загрузите свой собственный логотип. Он сразу отобразится на всём сайте (шапка сайта, bio-страница, панель управления)."
                        : "O'zingiz xohlagan logotipni yuklang. U butun saytda (bosh sahifa, mobil bio, admin panel) aks etadi."}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 self-start sm:self-auto">
                    {lang === "ru" ? "Активный логотип" : "Amaldagi logotip"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Dual Preview Box: Dark & Light view */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Dark view */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-blue-500/40 p-2 flex items-center justify-center relative overflow-hidden shadow-lg">
                        <Image
                          src={profileForm.storeAvatar || settings.storeAvatar || "/btn-logo.png"}
                          alt="Brand Logo Dark Preview"
                          fill
                          className="object-contain p-1.5"
                          unoptimized
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400">Dark ko'rinish</span>
                    </div>

                    {/* Light view */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-blue-200 p-2 flex items-center justify-center relative overflow-hidden shadow-md">
                        <Image
                          src={profileForm.storeAvatar || settings.storeAvatar || "/btn-logo.png"}
                          alt="Brand Logo Light Preview"
                          fill
                          className="object-contain p-1.5"
                          unoptimized
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500">Light ko'rinish</span>
                    </div>
                  </div>

                  {/* Actions: File upload & URL input */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                      <button
                        type="button"
                        disabled={isUploadingLogo}
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {isUploadingLogo ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === "ru" ? "Загрузка..." : "Yuklanmoqda..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{lang === "ru" ? "📁 Загрузить новый логотип" : "📁 Yangi logo yuklash (rasm tanlash)"}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isDark ? "border-purple-900/30 hover:bg-white/5 text-zinc-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{lang === "ru" ? "Сбросить на стандартный" : "Standart logoga qaytarish"}</span>
                      </button>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>
                        {lang === "ru" ? "Или укажите прямую ссылку на изображение логотипа (URL):" : "Yoki to'g'ridan-to'g'ri logo rasm havolasini kiriting (URL):"}
                      </label>
                      <input
                        type="text"
                        value={profileForm.storeAvatar || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, storeAvatar: e.target.value })}
                        placeholder="https://... yoki /btn-logo.png"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBgClass}`}
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        💡 Tavsiya: Kvadrat (1:1) shaklda, shaffof (PNG) yoki yuqori aniqlikdagi rasm tanlash maqsadga muvofiqdir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 1: Admin Personal Info */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-3`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5`}>
                  <User className="w-4 h-4" />
                  <span>{t.profile.adminInfoGroup}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.adminName}</label>
                    <input
                      type="text"
                      value={profileForm.adminName || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, adminName: e.target.value })}
                      placeholder="Admin"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.adminEmail}</label>
                    <input
                      type="email"
                      value={profileForm.adminEmail || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, adminEmail: e.target.value })}
                      placeholder="admin@button.uz"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Store Brand & Contact Info */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-3`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5`}>
                  <Store className="w-4 h-4" />
                  <span>{t.profile.storeInfoGroup}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.storeName}</label>
                    <input
                      type="text"
                      value={profileForm.storeName || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                      placeholder="BUTTON Men's Wear"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.storeHandle}</label>
                    <input
                      type="text"
                      value={profileForm.storeHandle || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, storeHandle: e.target.value })}
                      placeholder="@button_uz"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.instagramUrl}</label>
                    <input
                      type="url"
                      value={profileForm.instagramUrl || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/button_uz/"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.telegramUrl}</label>
                    <input
                      type="url"
                      value={profileForm.telegramUrl || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, telegramUrl: e.target.value })}
                      placeholder="https://t.me/button_uz"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.phone1}</label>
                    <input
                      type="text"
                      value={profileForm.phone1 || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, phone1: e.target.value })}
                      placeholder="+998 94 613 55 55"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.phone2}</label>
                    <input
                      type="text"
                      value={profileForm.phone2 || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, phone2: e.target.value })}
                      placeholder="+998 99 613 55 55"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.workingHoursUz}</label>
                    <input
                      type="text"
                      value={profileForm.workingHoursUz || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, workingHoursUz: e.target.value })}
                      placeholder="Har kuni 10:00 – 23:00"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.workingHoursRu}</label>
                    <input
                      type="text"
                      value={profileForm.workingHoursRu || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, workingHoursRu: e.target.value })}
                      placeholder="Ежедневно 10:00 – 23:00"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Showroom Wi-Fi */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-3`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider text-blue-600`}>
                  {t.profile.wifiGroup}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.wifiSsid}</label>
                    <input
                      type="text"
                      value={profileForm.wifiSsid || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, wifiSsid: e.target.value })}
                      placeholder="BUTTON_GUEST"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.wifiPassword}</label>
                    <input
                      type="text"
                      value={profileForm.wifiPassword || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, wifiPassword: e.target.value })}
                      placeholder="buttonmenswear"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Telegram Bot Notifications */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-3`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1.5`}>
                  <Bot className="w-4 h-4" />
                  <span>{t.profile.telegramGroup}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.telegramBotToken}</label>
                    <input
                      type="text"
                      value={profileForm.telegramBotToken || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, telegramBotToken: e.target.value })}
                      placeholder="123456789:ABCdefGHI..."
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>{t.profile.telegramChatId}</label>
                    <input
                      type="text"
                      value={profileForm.telegramChatId || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, telegramChatId: e.target.value })}
                      placeholder="987654321"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram || !profileForm.telegramBotToken || !profileForm.telegramChatId}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingTelegram ? "..." : t.profile.testTelegramBtn}</span>
                  </button>

                  {telegramTestResult && (
                    <span className={`text-xs font-bold ${telegramTestResult.success ? "text-emerald-500" : "text-rose-500"}`}>
                      {telegramTestResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Group 5: Google Gemini AI (Haqiqiy Jonli Sun'iy Intellekt) */}
              <div className={`p-4 sm:p-5 rounded-2xl ${itemCardBg} border space-y-3`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-purple-900/10 dark:border-slate-800">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-500 animate-spin" style={{ animationDuration: "6s" }} />
                    <span>{lang === "ru" ? "Google Gemini AI (Реальный искусственный интеллект)" : "Google Gemini AI (Haqiqiy Jonli Sun'iy Intellekt)"}</span>
                  </h3>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>{lang === "ru" ? "Получить бесплатный ключ (Google AI Studio) ↗" : "Bepul API kalit olish (Google AI Studio) ↗"}</span>
                  </a>
                </div>

                <p className={`text-[11px] ${subTextClass} leading-relaxed`}>
                  {lang === "ru"
                    ? "Вставьте сюда ваш ключ API из Google AI Studio. После сохранения AI-стилист на сайте мгновенно переключится на полноценную живую модель Gemini и сможет свободно общаться на узбекском и русском языках."
                    : "Google AI Studio'dan olingan API kalitini shu yerga kiriting. Saqlaganingizdan so'ng, saytdagi AI maslahatchi darhol haqiqiy jonli Gemini sun'iy intellektiga ulanadi va mijozlar bilan erkin, jonli suhbatlasha oladi."}
                </p>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${subTextClass}`}>
                    {lang === "ru" ? "Ключ Google Gemini API (GEMINI_API_KEY):" : "Google Gemini API Kaliti (GEMINI_API_KEY):"}
                  </label>
                  <input
                    type="password"
                    value={profileForm.geminiApiKey || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, geminiApiKey: e.target.value.trim() })}
                    placeholder="AIzaSy..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
                  />
                  {profileForm.geminiApiKey && profileForm.geminiApiKey.startsWith("AIzaSy") && (
                    <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                      <span>✓</span>
                      <span>{lang === "ru" ? "API ключ введен корректно" : "API kalit to'g'ri kiritilgan"}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Submit all profile changes */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95"
              >
                {loading ? "..." : t.profile.saveAllBtn}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ------------------- PRODUCT ADD / EDIT & DETAILED VIEW MODAL (UP TO 10 PHOTOS) ------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-5 ${isDark ? "bg-[#141226] border-purple-900/50 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <div>
                <h3 className={`font-bold text-base ${headingTextClass}`}>
                  {editingProduct.id ? (lang === "ru" ? "Детальная информация о товаре" : "Mahsulotning batafsil ma'lumotlari") : t.products.modalAddTitle}
                </h3>
                <p className={`text-xs ${subTextClass}`}>
                  {lang === "ru" ? "Управляйте всеми параметрами товара и загружайте до 10 фотографий" : "Mahsulotning barcha parametrlarini boshqaring va 10 tagacha rasm yuklang"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* ----------------- 1. PHOTO GALLERY (UP TO 10 IMAGES) ----------------- */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? "bg-black/25 border-purple-900/40" : "bg-purple-50/40 border-purple-100"}`}>
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-bold ${headingTextClass}`}>
                    📸 {lang === "ru" ? "Галерея товара (до 10 фото):" : "Mahsulot rasmlari galereyasi (10 tagacha rasm):"}
                  </label>
                  {(() => {
                    const gallery = (Array.isArray(editingProduct.images) && editingProduct.images.length > 0 ? editingProduct.images : (editingProduct.image ? [editingProduct.image] : [])).filter(Boolean);
                    return (
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${gallery.length >= 10 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-600/20 text-blue-400 border border-blue-500/30"}`}>
                        {gallery.length} / 10 ta rasm
                      </span>
                    );
                  })()}
                </div>

                {/* Thumbnails Grid */}
                {(() => {
                  const gallery = (Array.isArray(editingProduct.images) && editingProduct.images.length > 0 ? editingProduct.images : (editingProduct.image ? [editingProduct.image] : [])).filter(Boolean);
                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {gallery.map((imgUrl, index) => {
                        const isMain = editingProduct.image === imgUrl || (!editingProduct.image && index === 0);
                        return (
                          <div
                            key={index}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 group transition-all ${
                              isMain ? "border-amber-400 shadow-md shadow-amber-500/20" : "border-purple-900/30 hover:border-blue-500/60"
                            }`}
                          >
                            <Image src={imgUrl} alt={`Mahsulot ${index + 1}`} fill className="object-cover" unoptimized />

                            {/* Main badge */}
                            {isMain ? (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-[9px] uppercase tracking-wider z-10 shadow-xs">
                                Asosiy
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 hover:bg-amber-500 hover:text-black text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Asosiy muqova qilish"
                              >
                                Asosiy qilish
                              </button>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageFromGallery(imgUrl)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-700 cursor-pointer"
                              title="O'chirish"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}

                      {/* Add Slot if less than 10 */}
                      {gallery.length < 10 && (
                        <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          isDark ? "border-purple-800/40 hover:border-blue-500 bg-purple-950/20" : "border-purple-300 hover:border-blue-500 bg-purple-50/50"
                        }`}>
                          <Upload className="w-5 h-5 text-blue-500" />
                          <span className="text-[10px] font-bold text-center px-1 text-zinc-400">
                            {isUploading ? "Yuklanmoqda..." : "+ Rasm yuklash"}
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) handleUploadMultipleImages(e.target.files);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })()}

                {/* Direct URL input for photo */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="https://... rasm havolasini kiritib + tugmasini bosing"
                    className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* ----------------- 2. NAMES & CATEGORY ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.nameUz}:</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Premium Slim-Fit Klassik Kostyum"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.nameRu}:</label>
                  <input
                    type="text"
                    value={editingProduct.nameRu || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameRu: e.target.value })}
                    placeholder="Премиальный костюм Slim-Fit"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>
              </div>

              {/* ----------------- 3. CATEGORY & BADGE ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.category}:</label>
                  <select
                    value={editingProduct.category || "suits"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer ${inputBgClass}`}
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {lang === "ru" ? cat.nameRu : cat.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.badge}:</label>
                  <select
                    value={editingProduct.badge || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        badge: (e.target.value as any) || undefined,
                      })
                    }
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer ${inputBgClass}`}
                  >
                    <option value="">Hech qanday nishonsiz</option>
                    <option value="Yangi">Yangi (Новинка)</option>
                    <option value="Xit">Xit (Хит)</option>
                    <option value="Chegirma">Chegirma (Скидка)</option>
                  </select>
                </div>
              </div>

              {/* ----------------- 4. PRICING & STOCK TOGGLES ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.price} (so'm):</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-amber-500 focus:outline-none ${inputBgClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.oldPrice} (so'm):</label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        oldPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Chegirma bo'lsa (ixtiyoriy)"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>
              </div>

              {/* In Stock & Featured Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${isDark ? "bg-black/20 border-purple-900/30" : "bg-purple-50/30 border-purple-100"}`}>
                  <span className="text-xs font-bold">Sotuvda mavjud (Faol)</span>
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${isDark ? "bg-black/20 border-purple-900/30" : "bg-purple-50/30 border-purple-100"}`}>
                  <span className="text-xs font-bold">Bosh sahifada ko'rsatish (Tavsiya)</span>
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* ----------------- 5. SIZES & CUSTOM SIZE ----------------- */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subTextClass}`}>{t.products.sizes}:</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {sizePresets.map((sz) => {
                    const isSelected = (editingProduct.sizes || []).includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : isDark
                            ? "bg-[#201732] text-zinc-400 border border-purple-900/30 hover:text-white"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:text-zinc-950"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="Boshqa o'lcham (masalan, 56 yoki 125cm)..."
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-purple-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    + O'lcham qo'shish
                  </button>
                </div>
              </div>

              {/* ----------------- 6. COLORS & CUSTOM COLOR ----------------- */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${subTextClass}`}>
                  {lang === "ru" ? "Доступные цвета:" : "Mavjud ranglar:"}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLOR_PRESETS.map((clr) => {
                    const isSelected = (editingProduct.colors || []).includes(clr);
                    return (
                      <button
                        type="button"
                        key={clr}
                        onClick={() => toggleColor(clr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : isDark
                            ? "bg-[#201732] text-zinc-400 border border-purple-900/30 hover:text-white"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:text-zinc-950"
                        }`}
                      >
                        {clr}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder={lang === "ru" ? "Другой цвет (напр. Бордовый)..." : "Boshqa rang (masalan, To'q jigar)..."}
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-purple-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    + {lang === "ru" ? "Добавить" : "Rang qo'shish"}
                  </button>
                </div>

                {editingProduct.colors && editingProduct.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editingProduct.colors.map((c) => (
                      <span
                        key={c}
                        onClick={() => toggleColor(c)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-600/20 text-purple-300 border border-blue-500/30 cursor-pointer hover:bg-rose-500/20 hover:text-rose-300"
                        title="O'chirish uchun bosing"
                      >
                        {c} ✕
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ----------------- 7. DESCRIPTIONS (UZ & RU) ----------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>{t.products.description} (UZ):</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Mato tarkibi, tikilishi va kiyish qulayligi haqida ma'lumot..."
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Описание товара (RU):</label>
                  <textarea
                    rows={3}
                    value={editingProduct.descriptionRu || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, descriptionRu: e.target.value })}
                    placeholder="Состав ткани, посадка и детали одежды..."
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className={`flex items-center gap-2 pt-3 border-t ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer ${isDark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}`}
                >
                  {t.products.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProduct ? "Saqlanmoqda..." : (editingProduct.id ? "O'zgarishlarni saqlash" : t.products.save)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- ORDER DETAILS MODAL (DETAILED INSPECTION) ------------------- */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-5 ${isDark ? "bg-[#141226] border-purple-900/50 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-base sm:text-lg ${headingTextClass}`}>
                    Buyurtma #{selectedOrderForView.id}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrderForView.id);
                      alert("Buyurtma ID nusxalandi!");
                    }}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors"
                    title="IDdan nusxa olish"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={`text-xs ${subTextClass} flex items-center gap-1.5 mt-0.5`}>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {new Date(selectedOrderForView.createdAt).toLocaleString("uz-UZ", {
                      timeZone: "Asia/Tashkent",
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className="w-8 h-8 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Buttons Bar */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${subTextClass}`}>Buyurtma holati:</span>
                <span className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${
                  selectedOrderForView.status === "new"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : selectedOrderForView.status === "confirmed"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : selectedOrderForView.status === "delivered"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {selectedOrderForView.status === "new"
                    ? t.orders.statusNew
                    : selectedOrderForView.status === "confirmed"
                    ? t.orders.statusConfirmed
                    : selectedOrderForView.status === "delivered"
                    ? t.orders.statusDelivered
                    : t.orders.statusCancelled}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {(["new", "confirmed", "delivered", "cancelled"] as const).map((st) => {
                  const isCurrent = selectedOrderForView.status === st;
                  const label =
                    st === "new"
                      ? "🟡 Yangi"
                      : st === "confirmed"
                      ? "🔵 Tasdiqlandi"
                      : st === "delivered"
                      ? "🟢 Yetkazildi"
                      : "⚪ Bekor";

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrderForView.id, st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black scale-[1.02]"
                          : isDark
                          ? "bg-[#1c162e] text-zinc-400 hover:text-white border border-purple-900/20"
                          : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Information Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? "bg-black/20 border-purple-900/30" : "bg-purple-50/20 border-purple-100"}`}>
              <span className={`text-[11px] font-black uppercase text-blue-500 tracking-wider block`}>
                Mijoz Ma'lumotlari
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className={`text-[10px] block ${subTextClass}`}>Xaridor:</span>
                  <span className={`font-bold text-sm ${headingTextClass}`}>{selectedOrderForView.customerName}</span>
                </div>

                <div>
                  <span className={`text-[10px] block ${subTextClass}`}>Telefon raqami:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedOrderForView.customerPhone}`}
                      className="font-mono font-bold text-emerald-500 hover:underline flex items-center gap-1 text-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedOrderForView.customerPhone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrderForView.customerPhone);
                        alert("Telefon raqam nusxalandi!");
                      }}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white"
                      title="Nusxa olish"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className={`text-[10px] block ${subTextClass}`}>Yetkazib berish usuli va manzili:</span>
                  <p className={`font-semibold text-xs mt-0.5 flex items-start gap-1.5 ${headingTextClass}`}>
                    <Truck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      {selectedOrderForView.deliveryType === "delivery"
                        ? `Kuryer orqali yetkazish: ${selectedOrderForView.address || "Manzil ko'rsatilmagan"}`
                        : `Showroomdan olib ketish: ${selectedOrderForView.branchName || "Asosiy filial"}`}
                    </span>
                  </p>
                </div>

                {selectedOrderForView.comment && (
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    <b>Mijoz izohi:</b> {selectedOrderForView.comment}
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items List (Batafsil Mahsulotlar) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider text-blue-500`}>
                  Buyurtma qilingan mahsulotlar ({selectedOrderForView.items.length} ta)
                </span>
                <span className="text-[11px] text-zinc-400">Ustiga bosib kiyimni ko'rish</span>
              </div>

              <div className="space-y-2">
                {selectedOrderForView.items.map((it, idx) => {
                  const matchedProduct = products.find(
                    (p) => p.id === it.productId || p.name.toLowerCase() === it.productName.toLowerCase()
                  );
                  const resolvedImage = it.image || matchedProduct?.image || (matchedProduct?.images && matchedProduct.images[0]);
                  const resolvedColor = it.color || (matchedProduct?.colors && matchedProduct.colors[0]) || "To'q ko'k";

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        const prodToInspect: Product = matchedProduct || {
                          id: it.productId,
                          name: it.productName,
                          price: it.price,
                          image: resolvedImage || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
                          description: "BUTTON Men's Wear kolleksiyasiga mansub premium klassik va zamonaviy erkaklar kiyimi.",
                          sizes: [it.size || "M", "48", "50", "52"],
                          colors: [resolvedColor, "Qora", "To'q ko'k"],
                          category: "suits",
                          isAvailable: true,
                        };
                        setQuickInspectProduct(prodToInspect);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer hover:border-blue-500/60 hover:bg-blue-600/5 transition-all group ${
                        isDark ? "bg-black/30 border-purple-900/30" : "bg-white border-purple-100 shadow-xs"
                      }`}
                      title="Kiyim haqida batafsil ma'lumotni ko'rish uchun bosing"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-800 border border-purple-900/30 group-hover:scale-105 transition-transform">
                          {resolvedImage ? (
                            <Image src={resolvedImage} alt={it.productName} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                              <Shirt className="w-6 h-6" />
                            </div>
                          )}
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold text-xs truncate max-w-[200px] sm:max-w-xs group-hover:text-blue-500 transition-colors ${headingTextClass}`}>
                              {it.productName}
                            </h4>
                            <span className="text-[10px] text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                              👁️ Ko'rish
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30">
                              Razmer: {it.size || "M"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-600/25 text-purple-300 font-bold border border-purple-500/40 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                              <span>Rang: {resolvedColor}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-700/20 text-zinc-300 font-mono font-bold">
                              {it.quantity} dona
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {formatUzbekCurrency(it.price)} × {it.quantity}
                        </span>
                        <span className="font-mono font-black text-emerald-500 text-xs sm:text-sm">
                          {formatUzbekCurrency(it.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Grand Total (FAZA 1: Enhanced Receipt & Verification) */}
            <div className={`p-4 rounded-2xl border space-y-3.5 ${isDark ? "bg-black/30 border-purple-900/40" : "bg-purple-50/40 border-purple-100"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-[10px] block ${subTextClass}`}>To'lov usuli va holati:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-xs uppercase text-blue-500">{selectedOrderForView.paymentMethod}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        selectedOrderForView.paymentStatus === "paid"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : selectedOrderForView.paymentStatus === "verifying"
                          ? "bg-amber-500/25 text-amber-400 animate-pulse border border-amber-500/30"
                          : selectedOrderForView.paymentStatus === "rejected"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-500"
                      }`}>
                        {selectedOrderForView.paymentStatus === "paid"
                          ? "To'langan"
                          : selectedOrderForView.paymentStatus === "verifying"
                          ? "Tekshirilmoqda"
                          : selectedOrderForView.paymentStatus === "rejected"
                          ? "Rad etilgan"
                          : "Kutilmoqda"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] block ${subTextClass}`}>Jami to'lov summasi:</span>
                  <span className="font-mono font-black text-lg sm:text-xl text-emerald-500">
                    {formatUzbekCurrency(selectedOrderForView.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Receipt Image & Verification Actions */}
              {selectedOrderForView.paymentReceipt ? (
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      📸 Mijoz yuklagan to'lov cheki
                    </span>
                    {selectedOrderForView.paymentReceiptTime && (
                      <span className="text-[10px] text-zinc-400">
                        {new Date(selectedOrderForView.paymentReceiptTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    <Image
                      src={selectedOrderForView.paymentReceipt}
                      alt="To'lov cheki"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <a
                      href={selectedOrderForView.paymentReceipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Kattalashtirish</span>
                    </a>
                  </div>

                  {selectedOrderForView.paymentRejectReason && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                      <b>Rad etish sababi:</b> {selectedOrderForView.paymentRejectReason}
                    </p>
                  )}

                  {/* Verification action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus(selectedOrderForView.id, "paid")}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedOrderForView.paymentStatus === "paid"
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedOrderForView.paymentStatus === "paid" ? "To'lov tasdiqlangan" : "To'lovni tasdiqlash"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt("Rad etish sababini kiriting (mijozga ko'rinadi):", "To'lov summasi to'liq kelmadi yoki chek noaniq");
                        if (reason !== null) {
                          handleUpdatePaymentStatus(selectedOrderForView.id, "rejected", reason);
                        }
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/30 transition-all cursor-pointer active:scale-95"
                    >
                      <span>Rad etish</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400/90 text-xs flex items-center justify-between">
                  <span>📸 To'lov cheki hali yuklanmagan</span>
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus(selectedOrderForView.id, "paid")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Qo'lda to'langan deb belgilash
                  </button>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className={`flex flex-col sm:flex-row items-center gap-2 pt-3 border-t ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <a
                href={`tel:${selectedOrderForView.customerPhone}`}
                className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Phone className="w-4 h-4" />
                <span>Mijozga qo'ng'iroq qilish</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isDark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- QUICK PRODUCT PREVIEW MODAL ------------------- */}
      {quickInspectProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-4 ${
            isDark ? "bg-[#141226] border-purple-900/60 text-white" : "bg-white border-purple-200 text-zinc-900"
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className={`font-black text-sm sm:text-base ${headingTextClass}`}>
                    Buyurtma qilingan kiyim ma'lumotlari
                  </h3>
                  <span className={`text-[11px] ${subTextClass}`}>BUTTON Men's Wear katalogi</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickInspectProduct(null)}
                className="w-7 h-7 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Product Image & Badges */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-zinc-900 border border-purple-900/30">
              <Image
                src={quickInspectProduct.image || (quickInspectProduct.images && quickInspectProduct.images[0]) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"}
                alt={quickInspectProduct.name}
                fill
                className="object-cover"
                unoptimized
              />
              {quickInspectProduct.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg">
                  {quickInspectProduct.badge}
                </span>
              )}
              <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md font-mono font-black text-base text-amber-400 border border-amber-400/30">
                {formatUzbekCurrency(quickInspectProduct.price)}
              </span>
            </div>

            {/* Gallery mini previews if available */}
            {quickInspectProduct.images && quickInspectProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickInspectProduct.images.map((gImg, gIdx) => (
                  <div
                    key={gIdx}
                    onClick={() => setQuickInspectProduct({ ...quickInspectProduct, image: gImg })}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                      quickInspectProduct.image === gImg ? "border-amber-400 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={gImg} alt="" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}

            {/* Info details */}
            <div className="space-y-3">
              <div>
                <h4 className={`text-base font-black ${headingTextClass}`}>
                  {quickInspectProduct.name}
                </h4>
                {quickInspectProduct.nameRu && (
                  <p className={`text-xs text-zinc-400 mt-0.5`}>{quickInspectProduct.nameRu}</p>
                )}
              </div>

              {/* Sizes & Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
                  <span className={`text-[10px] block ${subTextClass} font-bold`}>Mavjud o'lchamlar:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {quickInspectProduct.sizes && quickInspectProduct.sizes.length > 0 ? (
                      quickInspectProduct.sizes.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-bold font-mono text-[11px]">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400">Standart</span>
                    )}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
                  <span className={`text-[10px] block ${subTextClass} font-bold`}>Mavjud ranglar:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {quickInspectProduct.colors && quickInspectProduct.colors.length > 0 ? (
                      quickInspectProduct.colors.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-purple-600/20 text-purple-300 font-bold text-[11px]">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400">Standart</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description / Composition */}
              {quickInspectProduct.description && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isDark ? "bg-black/20 border-purple-900/20 text-zinc-300" : "bg-purple-50/20 border-purple-100 text-zinc-700"}`}>
                  <span className="font-bold text-blue-500 block mb-0.5">Mato tarkibi va tavsifi:</span>
                  {quickInspectProduct.description}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 pt-3 border-t ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <button
                type="button"
                onClick={() => {
                  const prod = products.find((p) => p.id === quickInspectProduct.id || p.name === quickInspectProduct.name) || quickInspectProduct;
                  setEditingProduct({
                    ...prod,
                    images: prod.images && prod.images.length > 0 ? prod.images : (prod.image ? [prod.image] : []),
                  });
                  setIsProductModalOpen(true);
                  setQuickInspectProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Katalogda to'liq tahrirlash</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickInspectProduct(null)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isDark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- CUSTOMER PROFILE & ORDERS HISTORY MODAL ------------------- */}
      {selectedCustomerForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-5 ${isDark ? "bg-[#141226] border-purple-900/50 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-purple-600/30">
                  {selectedCustomerForView.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-base sm:text-lg ${headingTextClass}`}>
                      {selectedCustomerForView.name}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleToggleCustomerBookmark(selectedCustomerForView, e)}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        selectedCustomerForView.isBookmarked
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-zinc-500 hover:text-amber-400"
                      }`}
                      title="VIP belgilash"
                    >
                      <Star className={`w-4 h-4 ${selectedCustomerForView.isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>
                  <span className={`text-xs ${subTextClass}`}>
                    Ro'yxatdan o'tgan: {new Date(selectedCustomerForView.registeredAt).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomerForView(null)}
                className="w-8 h-8 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
                <span className={`text-[10px] block ${subTextClass}`}>Buyurtmalar</span>
                <span className="font-mono font-black text-base text-blue-500">{selectedCustomerForView.ordersCount || 0} ta</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
                <span className={`text-[10px] block ${subTextClass}`}>Jami Xarid (LTV)</span>
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-500">
                  {formatUzbekCurrency(selectedCustomerForView.totalSpent || 0)}
                </span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
                <span className={`text-[10px] block ${subTextClass}`}>Sevimli o'lchami</span>
                <span className="font-black text-base text-amber-400">{selectedCustomerForView.preferredSize || "L"}</span>
              </div>
            </div>

            {/* Contact & Address */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? "bg-black/20 border-purple-900/30" : "bg-purple-50/20 border-purple-100"}`}>
              <div className="flex items-center justify-between">
                <span className={subTextClass}>Telefon:</span>
                <div className="flex items-center gap-2">
                  <a href={`tel:${selectedCustomerForView.phone}`} className="font-mono font-bold text-emerald-500 hover:underline">
                    {selectedCustomerForView.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCustomerForView.phone);
                      alert("Nusxalandi!");
                    }}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1 border-t border-purple-900/20">
                <span className={subTextClass}>Manzil:</span>
                <span className={`font-semibold text-right ${headingTextClass}`}>
                  📍 {selectedCustomerForView.address || "Manzil ko'rsatilmagan"}
                </span>
              </div>
            </div>

            {/* Customer Purchase History (Buyurtmalar tarixi) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider text-blue-500`}>
                  Mijozning buyurtmalar tarixi
                </span>
                <span className="text-[11px] text-zinc-400">
                  {orders.filter((o) => o.customerPhone === selectedCustomerForView.phone || o.customerName.toLowerCase() === selectedCustomerForView.name.toLowerCase()).length} ta buyurtma
                </span>
              </div>

              {(() => {
                const customerOrders = orders.filter(
                  (o) => o.customerPhone === selectedCustomerForView.phone || o.customerName.toLowerCase() === selectedCustomerForView.name.toLowerCase()
                );

                if (customerOrders.length === 0) {
                  return (
                    <div className="p-6 text-center text-zinc-500 text-xs border border-dashed rounded-2xl">
                      Hali buyurtmalar qayd etilmagan
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {customerOrders.map((co) => (
                      <div
                        key={co.id}
                        onClick={() => {
                          setSelectedOrderForView(co);
                          setSelectedCustomerForView(null);
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer hover:border-blue-500/60 hover:shadow-md transition-all group ${
                          isDark ? "bg-black/30 border-purple-900/30" : "bg-white border-purple-100 shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-blue-500 group-hover:underline">#{co.id}</span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(co.createdAt).toLocaleDateString("uz-UZ")}
                            </span>
                          </div>
                          <span className={`text-[11px] ${subTextClass}`}>
                            {co.items.length} ta mahsulot: {co.items.map((i) => i.productName).join(", ")}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-emerald-500 text-xs block">
                            {formatUzbekCurrency(co.totalAmount)}
                          </span>
                          <span className="text-[9px] font-black uppercase text-zinc-400">
                            {co.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center gap-2 pt-3 border-t ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <a
                href={`tel:${selectedCustomerForView.phone}`}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Phone className="w-4 h-4" />
                <span>Qo'ng'iroq qilish</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedCustomerForView(null)}
                className={`px-6 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isDark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- $100 AI RETAIL AUDIT INTELLIGENCE MODAL ------------------- */}
      {isAiReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-5 ${isDark ? "bg-[#141226] border-purple-900/50 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
            <div className={`flex items-center justify-between border-b pb-3.5 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-base sm:text-lg ${headingTextClass}`}>
                    BUTTON VIP Retail Intelligence ($100 Servis)
                  </h3>
                  <p className={`text-xs ${subTextClass}`}>
                    AI tahliliy hisoboti: auditoriya talabi, optimal zaxira va daromadni oshirish
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Pillar 1: Demographic Intelligence */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <span>👤</span>
                <span>Auditoriya Demografiyasi & Eng Faol Segment</span>
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Asosiy xaridorlar <b>22 – 38 yoshli erkaklar</b> (tadbirkorlar, ofis xodimlari va premium kiyinishni xush ko'ruvchilar). 68% xaridlar Toshkent shahri ichida, 32% esa viloyatlarga kuryerlik yetkazib berish orqali amalga oshirilmoqda.
              </p>
            </div>

            {/* Pillar 2: Size & Stock Demand */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
              <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <span>👕</span>
                <span>Talabi Yuqori O'lchamlar & Zaxira Tavsiyasi</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Klassik Kostyumlar:</span>
                  <span className="font-bold text-white">48, 50 va 52 o'lchamlar (74% sotuv)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block">Kurtka va Bomberlar:</span>
                  <span className="font-bold text-white">L va XL o'lchamlar eng tez tugamoqda</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✅ Tavsiya: Kuzgi mavsum uchun 48-52 o'lchamdagi klassik kostyumlarni zaxirasini 40% ga ko'paytirish tavsiya etiladi.
              </p>
            </div>

            {/* Pillar 3: LTV & Retention */}
            <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-black/30 border-purple-900/30" : "bg-purple-50/40 border-purple-100"}`}>
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                <span>🔁</span>
                <span>Qayta Xarid (LTV) va Marketing Triggarlari</span>
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Har bir mijoz birinchi xarididan <b>21–30 kun o'tgach</b> yangi to'plam yoki aksessuarlar sotib olish ehtimoli 3.4 barobar yuqori. Telegram bot orqali avtomatik keshbek va yangi mavsum takliflari yuborilishi takroriy buyurtmalarni 28% ga oshiradi.
              </p>
            </div>

            {/* Close */}
            <div className={`pt-3 border-t text-right ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <button
                type="button"
                onClick={() => setIsAiReportModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Tushunarli, yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- BRANCH EDIT MODAL ------------------- */}
      {isBranchModalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-5 overflow-y-auto max-h-[90vh] space-y-4 ${isDark ? "bg-[#161023] border-purple-900/40 text-white" : "bg-white border-purple-200 text-zinc-900"}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
              <h3 className={`font-bold text-sm ${headingTextClass}`}>Filial ma'lumotlarini tahrirlash</h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-700/20 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Filial Nomi:</label>
                <input
                  type="text"
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Manzili (O'zbekcha):</label>
                <input
                  type="text"
                  value={editingBranch.address}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Mo'ljal:</label>
                <input
                  type="text"
                  value={editingBranch.landmark}
                  onChange={(e) => setEditingBranch({ ...editingBranch, landmark: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Telefon raqami:</label>
                <input
                  type="text"
                  value={editingBranch.phone}
                  onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${subTextClass}`}>Yandex Xarita havolasi:</label>
                <input
                  type="url"
                  value={editingBranch.yandexMap}
                  onChange={(e) => setEditingBranch({ ...editingBranch, yandexMap: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              <div className={`flex items-center gap-2 pt-2 border-t ${isDark ? "border-purple-950/60" : "border-zinc-200"}`}>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-700"}`}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSaveBranch}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- FIXED MOBILE BOTTOM NAVIGATION BAR (MOCKUP 2 & 4) ------------------- */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl pb-safe transition-colors ${
        isDark ? "bg-[#0f0920]/95 border-purple-900/30" : "bg-white/95 border-purple-100 shadow-lg"
      }`}>
        <div className="grid grid-cols-5 items-center justify-around py-2 px-1">
          {/* 1. Bosh sahifa */}
          <button
            onClick={() => {
              setActiveMenu("dashboard");
              setMobileMenuOpen(false);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 relative group cursor-pointer"
          >
            <Home className={`w-5 h-5 transition-colors ${activeMenu === "dashboard" ? "text-blue-600" : "text-zinc-400"}`} />
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight ${activeMenu === "dashboard" ? "text-blue-600" : "text-zinc-400"}`}>
              Bosh sahifa
            </span>
            {activeMenu === "dashboard" && (
              <span className="w-5 h-0.5 rounded-full bg-blue-500 absolute -bottom-1" />
            )}
          </button>

          {/* 2. Mahsulotlar */}
          <button
            onClick={() => {
              setActiveMenu("products");
              setMobileMenuOpen(false);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 relative group cursor-pointer"
          >
            <Package className={`w-5 h-5 transition-colors ${activeMenu === "products" ? "text-blue-600" : "text-zinc-400"}`} />
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight ${activeMenu === "products" ? "text-blue-600" : "text-zinc-400"}`}>
              Mahsulot
            </span>
            {activeMenu === "products" && (
              <span className="w-5 h-0.5 rounded-full bg-blue-500 absolute -bottom-1" />
            )}
          </button>

          {/* 3. Buyurtmalar */}
          <button
            onClick={() => {
              setActiveMenu("orders");
              setMobileMenuOpen(false);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 relative group cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 transition-colors ${activeMenu === "orders" ? "text-blue-600" : "text-zinc-400"}`} />
              {newOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              )}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight ${activeMenu === "orders" ? "text-blue-600" : "text-zinc-400"}`}>
              Buyurtma
            </span>
            {activeMenu === "orders" && (
              <span className="w-5 h-0.5 rounded-full bg-blue-500 absolute -bottom-1" />
            )}
          </button>

          {/* 4. Mijozlar */}
          <button
            onClick={() => {
              setActiveMenu("customers");
              setMobileMenuOpen(false);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 relative group cursor-pointer"
          >
            <Users className={`w-5 h-5 transition-colors ${activeMenu === "customers" ? "text-blue-600" : "text-zinc-400"}`} />
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight ${activeMenu === "customers" ? "text-blue-600" : "text-zinc-400"}`}>
              Mijozlar
            </span>
            {activeMenu === "customers" && (
              <span className="w-5 h-0.5 rounded-full bg-blue-500 absolute -bottom-1" />
            )}
          </button>

          {/* 5. Menyu (Barcha bo'limlar: Karta, Filiallar, PIN, Profil, Chiqish) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center justify-center gap-1 py-1 relative group cursor-pointer"
          >
            <div className="relative">
              <Menu className={`w-5 h-5 transition-colors ${
                mobileMenuOpen || ["payment", "tariffs", "branches", "security", "profile"].includes(activeMenu)
                  ? "text-blue-600"
                  : "text-zinc-400"
              }`} />
              {(mobileMenuOpen || ["payment", "tariffs", "branches", "security", "profile"].includes(activeMenu)) && (
                <span className="w-2 h-2 rounded-full bg-blue-500 absolute -top-0.5 -right-0.5" />
              )}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight ${
              mobileMenuOpen || ["payment", "tariffs", "branches", "security", "profile"].includes(activeMenu)
                ? "text-blue-600"
                : "text-zinc-400"
            }`}>
              Menyu
            </span>
            {(mobileMenuOpen || ["payment", "tariffs", "branches", "security", "profile"].includes(activeMenu)) && (
              <span className="w-5 h-0.5 rounded-full bg-blue-500 absolute -bottom-1" />
            )}
          </button>
        </div>
      </div>

      {/* PWA Admin Install Prompt */}
      <PwaInstallPrompt lang={lang} target="admin" />
    </div>
  );
}

// Icon helper for bookmark
function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}


function HangerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a2.5 2.5 0 0 0-2.5 2.5c0 .7.3 1.3.8 1.8L2.4 14.2A1.8 1.8 0 0 0 3.7 17h16.6a1.8 1.8 0 0 0 1.3-2.8L13.7 7.3a2.5 2.5 0 0 0 .8-1.8A2.5 2.5 0 0 0 12 3z" />
    </svg>
  );
}