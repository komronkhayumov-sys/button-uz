"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerNavbar } from "@/components/layout/CustomerNavbar";
import { CustomerBottomNav } from "@/components/layout/CustomerBottomNav";
import { HomeSection } from "@/components/store/HomeSection";
import { AiModeSection } from "@/components/store/AiModeSection";
import { ProfileSection, ProfileSubView } from "@/components/store/ProfileSection";
import { OrdersSection } from "@/components/store/OrdersSection";
import { OrderModal } from "@/components/store/OrderModal";
import { WifiModal } from "@/components/store/WifiModal";
import { PhoneModal } from "@/components/store/PhoneModal";
import { BranchHub } from "@/components/store/BranchHub";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";
import OfflineBanner from "@/components/common/OfflineBanner";
import ToastNotification, { ToastType } from "@/components/common/ToastNotification";
import {
  CartItem,
  Customer,
  CustomerNavSection,
  Language,
  Order,
  Product,
  StoreSettings,
} from "@/types";
import { DEFAULT_SETTINGS, INITIAL_PRODUCTS } from "@/constants";
import { formatUzbekCurrency } from "@/lib/format";
import { getStoreTimeStatus } from "@/lib/time";
import { X, MapPin, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<Language>("uz");
  const [isDark, setIsDark] = useState<boolean>(false); // Default to clean modern palette matching user mockup
  const [activeSection, setActiveSection] = useState<CustomerNavSection>("katalog");
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Products and Settings from API
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings | null>(DEFAULT_SETTINGS);

  // Customer state & storage
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [profileInitialSubView, setProfileInitialSubView] = useState<ProfileSubView>("overview");
  const router = useRouter();

  // Wishlist state & storage
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  // Cart state & storage
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderModalMode, setOrderModalMode] = useState<"detail" | "checkout">("detail");
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Loading & Toast Notification states (Phase 10: UI States)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ isVisible: true, message, type });
  };

  // Load products, settings, wishlist, cart, customer on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingProducts(true);
      try {
        const [prodRes, settRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/settings"),
        ]);
        const prodData = await prodRes.json();
        const settData = await settRes.json();

        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          setProducts(prodData.products);
        }
        if (settData.success && settData.settings) {
          setSettings(settData.settings);
        }
      } catch (e) {
        console.error("Could not fetch remote data, using local defaults:", e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadData();

    // Load language preference
    const savedLang = localStorage.getItem("button_lang");
    if (savedLang === "uz" || savedLang === "ru") {
      setLang(savedLang);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("button_theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
    } else if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
    } else {
      const isDarkActive = document.documentElement.classList.contains("dark");
      setIsDark(isDarkActive);
    }

    // Load customer session
    const savedCustomer = localStorage.getItem("button_customer");
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {}
    }

    // Load wishlist
    const savedWishlist = localStorage.getItem("button_wishlist");
    if (savedWishlist) {
      try {
        setWishlistIds(JSON.parse(savedWishlist));
      } catch (e) {}
    }

    // Load cart
    const savedCart = localStorage.getItem("button_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {}
    }

    // Load recently viewed products (Phase 2 & P2)
    const savedViewed = localStorage.getItem("button_recently_viewed");
    if (savedViewed) {
      try {
        setRecentlyViewedIds(JSON.parse(savedViewed));
      } catch (e) {}
    }

    // Load orders & sync live status from server (Resilient local + server merge)
    let localCustomerOrders: Order[] = [];
    const savedOrdersRaw = localStorage.getItem("button_customer_orders");
    if (savedOrdersRaw) {
      try {
        const parsed = JSON.parse(savedOrdersRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localCustomerOrders = parsed;
          setCustomerOrders(parsed);
        }
      } catch (e) {}
    }

    const savedPhone =
      localStorage.getItem("button_customer_phone") ||
      (savedCustomer ? (() => { try { return JSON.parse(savedCustomer)?.phone || null; } catch { return null; } })() : null) ||
      (localCustomerOrders[0]?.customerPhone || null);

    if (savedPhone) {
      try {
        localStorage.setItem("button_customer_phone", savedPhone);
      } catch {}
      fetch(`/api/orders?phone=${encodeURIComponent(savedPhone)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            const serverOrders: Order[] = data.orders;
            const orderMap = new Map<string, Order>();
            localCustomerOrders.forEach((o) => orderMap.set(o.id, o));
            serverOrders.forEach((o) => orderMap.set(o.id, o));
            const merged = Array.from(orderMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setCustomerOrders(merged);
            localStorage.setItem("button_customer_orders", JSON.stringify(merged));

            // Auto-heal server storage if cold start lost orders
            const missingOnServer = localCustomerOrders.filter((lo) => !serverOrders.some((so) => so.id === lo.id));
            if (missingOnServer.length > 0) {
              fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ syncOrders: missingOnServer }),
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Wishlist toggle handler
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("button_wishlist", JSON.stringify(next));
      } catch (e) {}
      showToast(
        exists
          ? lang === "uz" ? "Sevimlilardan o'chirildi" : "Удалено из избранного"
          : lang === "uz" ? "Sevimlilarga saqlandi! ❤️" : "Добавлено в избранное! ❤️",
        "wishlist"
      );
      return next;
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const chosenSize = size || product.sizes?.[0] || "M";
    const chosenColor = color || (product.colors && product.colors[0]) || "";
    const itemId = `${product.id}-${chosenSize}-${chosenColor}`;

    showToast(
      lang === "uz" ? "Savatga muvaffaqiyatli qo'shildi! 🛍️" : "Успешно добавлено в корзину! 🛍️",
      "cart"
    );

    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === itemId);
      let next: CartItem[];
      if (existing) {
        next = prev.map((it) =>
          it.id === itemId ? { ...it, quantity: it.quantity + quantity } : it
        );
      } else {
        next = [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            size: chosenSize,
            color: chosenColor,
            quantity,
            price: product.price,
          },
        ];
      }
      try {
        localStorage.setItem("button_cart", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev
        .map((it) => (it.id === id ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0);
      try {
        localStorage.setItem("button_cart", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      try {
        localStorage.setItem("button_cart", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("button_cart");
    } catch (e) {}
  };

  const handleOrderCreated = (newOrder: Order) => {
    if (newOrder.customerPhone) {
      try {
        localStorage.setItem("button_customer_phone", newOrder.customerPhone);
      } catch (e) {}
    }
    setCustomerOrders((prev) => {
      const next = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      try {
        localStorage.setItem("button_customer_orders", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleSaveCustomer = async (newCustomer: Customer) => {
    setCustomer(newCustomer);
    try {
      localStorage.setItem("button_customer", JSON.stringify(newCustomer));
      fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      }).catch(() => {});
    } catch (e) {}
  };

  const handleLogoutCustomer = () => {
    setCustomer(null);
    setCustomerOrders([]);
    try {
      localStorage.removeItem("button_customer");
      localStorage.removeItem("button_customer_phone");
      localStorage.removeItem("button_customer_orders");
    } catch (e) {}
    showToast(
      lang === "uz" ? "Profildan chiqildi" : "Вы вышли из профиля",
      "success"
    );
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("button_lang", newLang);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
      try {
        localStorage.setItem("button_theme", "dark");
      } catch (e) {}
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
      try {
        localStorage.setItem("button_theme", "light");
      } catch (e) {}
    }
  };

  // Nav actions
  const handleViewCatalog = (category?: string) => {
    if (category) {
      setSelectedCatalogCategory(category);
    }
    setActiveSection("katalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderOutfit = (comboItems: Product[], totalAmount: number, comboTitle: string) => {
    const comboProduct: Product = {
      id: `combo-${Date.now().toString(36)}`,
      name: comboTitle,
      nameRu: comboTitle,
      description: `To'plamdagi kiyimlar: ${comboItems.map((c) => c.name).join(", ")}`,
      price: totalAmount,
      category: "suits",
      image: comboItems[0]?.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
      sizes: ["Standart To'plam (M/L)", "To'plam (XL/XXL)"],
      isAvailable: true,
      badge: "Chegirma",
    };
    setSelectedProduct(comboProduct);
  };

  const handleOpenProduct = (p: Product, mode: "detail" | "checkout" = "detail") => {
    setRecentlyViewedIds((prev) => {
      const next = [p.id, ...prev.filter((id) => id !== p.id)].slice(0, 8);
      try {
        localStorage.setItem("button_recently_viewed", JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (mode === "checkout") {
      setSelectedProduct(p);
      setOrderModalMode("checkout");
    } else {
      router.push(`/product/${p.id}`);
    }
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-[#F8FAFC] dark:bg-[#0b1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200 selection:bg-[#2563EB] selection:text-white pb-24 md:pb-12">
      {/* 1. Global Desktop Header (Phase 2.2) */}
      <CustomerNavbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        onSectionChange={(sec) => {
          if (sec === "profile") setProfileInitialSubView("overview");
          if (sec === "orders") setProfileInitialSubView("orders");
          setActiveSection(sec);
        }}
        settings={settings}
        customer={customer}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => router.push("/cart")}
        onOpenWishlist={() => {
          setProfileInitialSubView("wishlist");
          setActiveSection("profile");
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim().length > 0 && activeSection !== "katalog" && activeSection !== "home" && activeSection !== "products") {
            setActiveSection("katalog");
          }
        }}
        onSearchSubmit={() => {
          setActiveSection("katalog");
        }}
      />

      {/* 2. Primary Content Container (Phase 1: 5 Core Sections) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Section 1: KATALOG / HOME STOREFRONT (Matching user mockup) */}
        {(activeSection === "katalog" || activeSection === "home" || activeSection === "products") && (
          <HomeSection
            lang={lang}
            settings={settings}
            customer={customer}
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onViewCatalog={handleViewCatalog}
            onOpenAiMode={() => setActiveSection("ai-mode")}
            onOpenBranches={() => setActiveSection("branches")}
            onOpenWifiModal={() => setIsWifiOpen(true)}
            onOpenPhoneModal={() => setIsPhoneOpen(true)}
            recentlyViewedProducts={products.filter((p) => recentlyViewedIds.includes(p.id))}
          />
        )}

        {/* Section 2: FILIALLAR (Branches Showroom View) */}
        {activeSection === "branches" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection("katalog")}
                  className="w-9 h-9 rounded-full bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
                  title="Orqaga"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                    {lang === "uz" ? "Toshkentdagi filiallarimiz" : "Шоурумы в Ташкенте"}
                  </h1>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {lang === "uz"
                      ? "O'zingizga eng yaqin filialni tanlang va kiyib ko'ring"
                      : "Выберите ближайший филиал и посетите нас"}
                  </p>
                </div>
              </div>
              {(() => {
                const timeStatus = getStoreTimeStatus(lang);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    timeStatus.isOpen
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${timeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    <span>{lang === "uz" ? timeStatus.statusTextUz : timeStatus.statusTextRu}</span>
                  </span>
                );
              })()}
            </div>

            <BranchHub lang={lang} branches={settings?.branches} />
          </div>
        )}

        {/* Section 3: AI STYLIST */}
        {activeSection === "ai-mode" && (
          <AiModeSection
            products={products}
            lang={lang}
            settings={settings}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleOpenProduct}
            onOrderOutfit={handleOrderOutfit}
            onNavigateToProfile={() => setActiveSection("profile")}
            onNavigateToProducts={() => setActiveSection("katalog")}
          />
        )}

        {/* Section 4: BUYURTMALARIM (Dedicated Orders View) */}
        {activeSection === "orders" && (
          <OrdersSection
            orders={customerOrders}
            products={products}
            lang={lang}
            onSelectProduct={handleOpenProduct}
            onViewCatalog={() => handleViewCatalog()}
            onAddToCart={handleAddToCart}
            onRefresh={() => {
              let localOrders: Order[] = [];
              const savedOrders = localStorage.getItem("button_customer_orders");
              if (savedOrders) {
                try {
                  const parsed = JSON.parse(savedOrders);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    localOrders = parsed;
                    setCustomerOrders(parsed);
                  }
                } catch (e) {}
              }
              const savedCustomer = localStorage.getItem("button_customer");
              const savedPhone =
                localStorage.getItem("button_customer_phone") ||
                (savedCustomer ? (() => { try { return JSON.parse(savedCustomer)?.phone || null; } catch { return null; } })() : null) ||
                (localOrders[0]?.customerPhone || null);
              if (savedPhone) {
                fetch(`/api/orders?phone=${encodeURIComponent(savedPhone)}`)
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.success && Array.isArray(data.orders)) {
                      const serverOrders: Order[] = data.orders;
                      const orderMap = new Map<string, Order>();
                      localOrders.forEach((o) => orderMap.set(o.id, o));
                      serverOrders.forEach((o) => orderMap.set(o.id, o));
                      const merged = Array.from(orderMap.values()).sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      );
                      setCustomerOrders(merged);
                      localStorage.setItem("button_customer_orders", JSON.stringify(merged));

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
                  })
                  .catch(() => {});
              }
            }}
          />
        )}

        {/* Section 5: PROFIL */}
        {activeSection === "profile" && (
          <ProfileSection
            customer={customer}
            orders={customerOrders}
            products={products}
            wishlistIds={wishlistIds}
            lang={lang}
            initialSubView={profileInitialSubView}
            onLanguageChange={handleLanguageChange}
            onSaveCustomer={handleSaveCustomer}
            onLogoutCustomer={handleLogoutCustomer}
            onSelectProduct={handleOpenProduct}
            onViewCatalog={() => handleViewCatalog()}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* 3. Persistent Floating Cart Icon (Temu / Alibaba / AliExpress style) */}
      <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 md:right-8 z-40 animate-fade-in">
        <Link
          href="/cart"
          aria-label={lang === "uz" ? `Savat (${totalCartCount})` : `Корзина (${totalCartCount})`}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-2 border-violet-600 shadow-[0_10px_25px_rgba(109,40,217,0.35)] flex items-center justify-center text-violet-700 dark:text-violet-400 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        >
          <ShoppingBag className="w-6 h-6 stroke-[2.5] group-hover:rotate-6 transition-transform" />
          
          {/* Cart Items Badge */}
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full font-mono text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[#0f172a] shadow-md transition-all ${
              totalCartCount > 0
                ? "bg-[#E5485D] text-white animate-pulse"
                : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {totalCartCount}
          </span>

          {/* Ripple ring effect when items exist */}
          {totalCartCount > 0 && (
            <span className="absolute inset-0 rounded-full border-2 border-violet-600 opacity-40 animate-ping pointer-events-none" />
          )}
        </Link>
      </div>

      {/* 4. Global Mobile Bottom Navigation (Phase 2.1: Exactly 4 Items) */}
      <CustomerBottomNav
        activeSection={activeSection}
        onSectionChange={(sec) => {
          if (sec === "profile") setProfileInitialSubView("overview");
          setActiveSection(sec);
        }}
        lang={lang}
        cartBadgeCount={totalCartCount}
        isHidden={Boolean(selectedProduct) || isBranchModalOpen}
      />

      {/* 5. Modals & Drawers */}

      {/* 1-Click Order & Product Details Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          initialMode={orderModalMode}
          lang={lang}
          settings={settings}
          allProducts={products}
          onSelectRelatedProduct={(rel) => handleOpenProduct(rel, "detail")}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOrderCreated={handleOrderCreated}
          onNavigateToOrders={() => {
            setSelectedProduct(null);
            setProfileInitialSubView("orders");
            setActiveSection("orders");
          }}
        />
      )}

      {/* Wi-Fi & QR Modal */}
      <WifiModal
        isOpen={isWifiOpen}
        lang={lang}
        settings={settings}
        onClose={() => setIsWifiOpen(false)}
      />

      {/* Phone Hotline Modal */}
      <PhoneModal
        isOpen={isPhoneOpen}
        settings={settings}
        onClose={() => setIsPhoneOpen(false)}
      />

      {/* Showroom / Branches Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 p-5 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white">
                  {lang === "ru" ? "Шоурумы BUTTON Men" : "BUTTON Men Showroomlari"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <BranchHub lang={lang} branches={settings?.branches} />
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PwaInstallPrompt lang={lang} target="store" />

      {/* Offline Status Banner (Phase 10: Offline State) */}
      <OfflineBanner lang={lang} />

      {/* Instant Action Feedback Toast (Phase 10: Success State) */}
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
