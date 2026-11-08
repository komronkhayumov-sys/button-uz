"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Layers,
  Heart,
  Palette,
  ShieldCheck,
  Store,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Search,
  CheckCircle2,
  Share2,
  Info,
} from "lucide-react";
import { Language, Product, CustomerMeasurements } from "@/types";
import { formatUzbekCurrency } from "@/lib/format";

interface AiModeSectionProps {
  products: Product[];
  lang: Language;
  onAddToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onOrderOutfit: (comboItems: Product[], totalAmount: number, comboTitle: string) => void;
  onNavigateToProfile?: () => void;
  onNavigateToProducts?: () => void;
}

type ScenarioKey = "wedding" | "business" | "date" | "casual" | "winter";

interface ScenarioConfig {
  id: ScenarioKey;
  emoji: string;
  titleUz: string;
  titleRu: string;
  subtitleUz: string;
  subtitleRu: string;
  tagsUz: string[];
  tagsRu: string[];
  baseMatch: number;
  palette: Array<{ nameUz: string; nameRu: string; hex: string; roleUz: string; roleRu: string }>;
  stylistNoteUz: string;
  stylistNoteRu: string;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "wedding",
    emoji: "🤵",
    titleUz: "To'y & Hashamatli Oqshom",
    titleRu: "Свадьба & Торжественный Вечер",
    subtitleUz: "Italiya bichimidagi nafis klassika, oq ko'ylak va premium charm tufli",
    subtitleRu: "Итальянский крой, утонченная классика и премиальные кожаные туфли",
    tagsUz: ["#To'y", "#Klassika", "#Premium", "#Nufuz"],
    tagsRu: ["#Свадьба", "#Классика", "#Премиум", "#Статус"],
    baseMatch: 99,
    palette: [
      { nameUz: "Qirollik To'q Ko'k", nameRu: "Королевский Синий", hex: "#1e3a8a", roleUz: "Asosiy Kostyum", roleRu: "База костюма" },
      { nameUz: "Qordek Oq", nameRu: "Белоснежный", hex: "#f8fafc", roleUz: "Ko'ylak kontrasti", roleRu: "Контраст верха" },
      { nameUz: "Oksford Qora Charm", nameRu: "Оксфорд Черный", hex: "#0f172a", roleUz: "Poyabzal aksenti", roleRu: "Обувной акцент" },
    ],
    stylistNoteUz:
      "Ushbu to'q ko'k klassik kostyum qora poyabzal bilan to'y va tantanalarda qat'iyatli, jiddiy va juda hashamatli ko'rinish beradi. Oq rang yuzingizga tiniq nur bag'ishlaydi.",
    stylistNoteRu:
      "Темно-синий итальянский костюм в дуэте с черными туфлями подчеркивает высокий статус на торжествах. Белый акцент освежает образ.",
  },
  {
    id: "business",
    emoji: "💼",
    titleUz: "Biznes & Rasmiy Muzokara",
    titleRu: "Деловой Стиль & Переговоры",
    subtitleUz: "Hamkorlar va investorlar bilan uchrashuv uchun ideal nufuzli uslub",
    subtitleRu: "Безупречный образ для важных встреч, совещаний и инвесторов",
    tagsUz: ["#Biznes", "#Ofis", "#Muzokara", "#SlimFit"],
    tagsRu: ["#Бизнес", "#Офис", "#Переговоры", "#SlimFit"],
    baseMatch: 98,
    palette: [
      { nameUz: "Grafit Slate", nameRu: "Графитовый Слейт", hex: "#334155", roleUz: "Asosiy qatlam", roleRu: "Основной слой" },
      { nameUz: "Okean Ko'k", nameRu: "Океанский Синий", hex: "#0284c7", roleUz: "Ishonch aksenti", roleRu: "Акцент доверия" },
      { nameUz: "Neytral Oq", nameRu: "Нейтральный Белый", hex: "#ffffff", roleUz: "Yengillik", roleRu: "Легкость" },
    ],
    stylistNoteUz:
      "Slim-Fit qora yoki to'q kulrang kostyum qat'iyatli biznesmen aurasini shakllantiradi. Chino yoki klassik shim bilan qulaylik va rasmiyatchilik mukammal muvozanatda.",
    stylistNoteRu:
      "Костюм силуэта Slim-Fit формирует образ уверенного лидера. Сочетание с брюками Chino создает баланс комфорта и строгости.",
  },
  {
    id: "date",
    emoji: "☕",
    titleUz: "Romantik Uchrashuv & Kechki Taom",
    titleRu: "Романтический Вечер & Свидание",
    subtitleUz: "Nafis, qimmatbaho va maftunkor Smart-Casual look",
    subtitleRu: "Привлекательный, непринужденный образ Smart-Casual",
    tagsUz: ["#Uchrashuv", "#SmartCasual", "#Maftunkor", "#Did"],
    tagsRu: ["#Свидание", "#SmartCasual", "#Шарм", "#Вкус"],
    baseMatch: 97,
    palette: [
      { nameUz: "Qora Charm", nameRu: "Черная Кожа", hex: "#090d14", roleUz: "Jasoratli fon", roleRu: "Мужественный фон" },
      { nameUz: "To'q Binafsha / Indigo", nameRu: "Глубокий Индиго", hex: "#4c1d95", roleUz: "Maftunkor aksent", roleRu: "Шарм акцент" },
      { nameUz: "Issiq Bej", nameRu: "Теплый Беж", hex: "#e2e8f0", roleUz: "Yumshoq o'tish", roleRu: "Мягкий переход" },
    ],
    stylistNoteUz:
      "Charm kurtka yoki nafis polo kiygan erkak doimo ayollarning e'tiborini tortadi. Toza poyabzal va mos shim bilan tashqi ko'rinishingiz didli va qimmatbaho tuyiladi.",
    stylistNoteRu:
      "Кожаная куртка в паре с премиальным поло создает притягательный образ. Чистые линии подчеркивают тонкий мужской вкус.",
  },
  {
    id: "casual",
    emoji: "🏙️",
    titleUz: "Urban Streetwear & Weekend",
    titleRu: "Urban Casual & Выходной День",
    subtitleUz: "Kundalik erkinlik, harakat qulayligi va zamonaviy shahar ritmi",
    subtitleRu: "Свобода движений, комфорт и современный уличный стиль",
    tagsUz: ["#Urban", "#Bomber", "#Kundalik", "#Qulaylik"],
    tagsRu: ["#Urban", "#Бомбер", "#Повседневный", "#Комфорт"],
    baseMatch: 96,
    palette: [
      { nameUz: "Obsidian Qora", nameRu: "Обсидиан Черный", hex: "#090d14", roleUz: "Asosiy baza", roleRu: "Базовая основа" },
      { nameUz: "Shahar Kulrangi", nameRu: "Городской Серый", hex: "#64748b", roleUz: "O'tish qatlami", roleRu: "Переходный слой" },
      { nameUz: "100% Paxta Oq", nameRu: "Хлопковый Белый", hex: "#ffffff", roleUz: "Yorug'lik", roleRu: "Светлый акцент" },
    ],
    stylistNoteUz:
      "Qora bomber va zich futer xudining birikmasi sovuqda ham, harakatda ham eng qulay tanlov. Shahar bo'ylab sayr va do'stlar davrasi uchun ayni muddao.",
    stylistNoteRu:
      "Бомбер и плотное хлопковое худи обеспечивают максимальный комфорт во время прогулок по городу и встреч с друзьями.",
  },
  {
    id: "winter",
    emoji: "❄️",
    titleUz: "Kuz-Qish Qatlamli Uslub (Layering)",
    titleRu: "Осенне-Зимний Многослойный Стиль",
    subtitleUz: "Sovuq havoda iliq, shamoldan himoyalangan va zamonaviy ko'rinish",
    subtitleRu: "Теплый, ветрозащитный и солидный образ для холодной погоды",
    tagsUz: ["#KuzQish", "#Issiq", "#Layering", "#Zamonaviy"],
    tagsRu: ["#ОсеньЗима", "#Тепло", "#Многослойность", "#Стиль"],
    baseMatch: 98,
    palette: [
      { nameUz: "To'q Zich Grafit", nameRu: "Плотный Графит", hex: "#1e293b", roleUz: "Issiq qobiq", roleRu: "Теплая защита" },
      { nameUz: "To'q Binafsha Elegance", nameRu: "Темно-Фиолетовый", hex: "#6d28d9", roleUz: "Brend aksenti", roleRu: "Брендовый акцент" },
      { nameUz: "Tabiiy Jun", nameRu: "Натуральная Шерсть", hex: "#475569", roleUz: "Ichki qatlam", roleRu: "Внутренний слой" },
    ],
    stylistNoteUz:
      "Kurtka ostidan zich xudi yoki polo kiyish zamonaviy ko'p qatlamli (layering) siluetni hosil qiladi. Tana issiqligi saqlanadi va qomatingiz vizual baquvvat ko'rinadi.",
    stylistNoteRu:
      "Многослойный образ согревает в прохладную погоду и визуально подчеркивает мужественные плечи и силуэт.",
  },
];

export const AiModeSection: React.FC<AiModeSectionProps> = ({
  products,
  lang,
  onAddToCart,
  onSelectProduct,
  onOrderOutfit,
  onNavigateToProfile,
  onNavigateToProducts,
}) => {
  const isUz = lang === "uz";

  // Scenario & mode state
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("wedding");
  const [activeMode, setActiveMode] = useState<"scenario" | "prompt">("scenario");
  const [viewStyle, setViewStyle] = useState<"stack" | "grid">("stack");

  // Custom prompt input
  const [customPrompt, setCustomPrompt] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // Layer indices for the 4 distinct categories (Outerwear, Top, Bottom, Shoes/Accessories)
  const [outerIndex, setOuterIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);

  // Feedback toast states
  const [isSaved, setIsSaved] = useState(false);
  const [savedLooksCount, setSavedLooksCount] = useState(0);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);
  const [reservedSuccess, setReservedSuccess] = useState(false);

  // Customer measurements from localStorage
  const [measurements, setMeasurements] = useState<CustomerMeasurements | null>(null);

  useEffect(() => {
    try {
      const savedCust = localStorage.getItem("button_customer");
      if (savedCust) {
        const parsed = JSON.parse(savedCust);
        if (parsed.measurements) {
          setMeasurements(parsed.measurements);
        }
      }
      const looks = localStorage.getItem("button_saved_outfits");
      if (looks) {
        const arr = JSON.parse(looks);
        setSavedLooksCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch (e) {}
  }, []);

  const preferredSize = measurements?.standardSize || "L";

  // Category Pools strictly filtered from real admin products
  const suits = useMemo(() => products.filter((p) => p.category === "suits" && p.isAvailable !== false), [products]);
  const jackets = useMemo(() => products.filter((p) => p.category === "jackets" && p.isAvailable !== false), [products]);
  const polos = useMemo(() => products.filter((p) => p.category === "polos" && p.isAvailable !== false), [products]);
  const hoodies = useMemo(() => products.filter((p) => p.category === "hoodies" && p.isAvailable !== false), [products]);
  const pants = useMemo(() => products.filter((p) => p.category === "pants" && p.isAvailable !== false), [products]);
  const shoes = useMemo(() => products.filter((p) => p.category === "shoes" && p.isAvailable !== false), [products]);
  const accessories = useMemo(() => products.filter((p) => p.category === "accessories" && p.isAvailable !== false), [products]);

  // Dynamic Pools tailored to each Scenario
  const currentPools = useMemo(() => {
    let outer: Product[] = [];
    let top: Product[] = [];
    let bottom: Product[] = pants.length > 0 ? pants : products;
    let footwear: Product[] = shoes.length > 0 ? shoes : accessories.length > 0 ? accessories : products;

    if (selectedScenario === "wedding") {
      outer = suits.length > 0 ? suits : products;
      top = polos.length > 0 ? polos : hoodies;
      bottom = pants.length > 0 ? pants : products;
      footwear = shoes.length > 0 ? shoes : accessories;
    } else if (selectedScenario === "business") {
      outer = suits.length > 0 ? suits : jackets;
      top = polos.length > 0 ? polos : hoodies;
      bottom = pants.length > 0 ? pants : products;
      footwear = shoes.length > 0 ? shoes : products;
    } else if (selectedScenario === "date") {
      outer = jackets.length > 0 ? jackets : suits;
      top = polos.length > 0 ? polos : hoodies;
      bottom = pants.length > 0 ? pants : products;
      footwear = shoes.length > 0 ? shoes : accessories;
    } else if (selectedScenario === "casual") {
      outer = jackets.length > 0 ? jackets : hoodies;
      top = hoodies.length > 0 ? hoodies : polos;
      bottom = pants.length > 0 ? pants : products;
      footwear = shoes.length > 0 ? shoes : products;
    } else if (selectedScenario === "winter") {
      outer = jackets.length > 0 ? jackets : suits;
      top = hoodies.length > 0 ? hoodies : polos;
      bottom = pants.length > 0 ? pants : products;
      footwear = shoes.length > 0 ? shoes : accessories;
    }

    // Fallbacks if some categories are empty
    if (outer.length === 0) outer = products;
    if (top.length === 0) top = products;
    if (bottom.length === 0) bottom = products;
    if (footwear.length === 0) footwear = products;

    return { outer, top, bottom, footwear };
  }, [selectedScenario, suits, jackets, polos, hoodies, pants, shoes, accessories, products]);

  // Currently selected items for the 4 layers
  const outerItem = currentPools.outer.length > 0 ? currentPools.outer[outerIndex % currentPools.outer.length] : products[0];
  const topItem = currentPools.top.length > 0 ? currentPools.top[topIndex % currentPools.top.length] : products[1];
  const bottomItem = currentPools.bottom.length > 0 ? currentPools.bottom[bottomIndex % currentPools.bottom.length] : products[2];
  const shoesItem = currentPools.footwear.length > 0 ? currentPools.footwear[shoesIndex % currentPools.footwear.length] : products[3];

  const selectedItems = useMemo(() => {
    // Collect unique non-null items
    const list = [outerItem, topItem, bottomItem, shoesItem].filter(Boolean);
    const seen = new Set<string>();
    return list.filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    });
  }, [outerItem, topItem, bottomItem, shoesItem]);

  // Strict Admin Price Calculation
  const totalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [selectedItems]);

  // 10% outfit bundle incentive
  const discountedPrice = useMemo(() => {
    return Math.round(totalPrice * 0.9);
  }, [totalPrice]);

  const savedAmount = totalPrice - discountedPrice;

  // Active scenario config
  const scenarioConfig = useMemo(() => {
    return SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];
  }, [selectedScenario]);

  // Dynamic Match Score calculation based on layer swaps
  const matchScore = useMemo(() => {
    const variance = ((outerIndex + topIndex + bottomIndex + shoesIndex) % 4);
    return Math.min(99, scenarioConfig.baseMatch - variance);
  }, [outerIndex, topIndex, bottomIndex, shoesIndex, scenarioConfig.baseMatch]);

  // Custom prompt search submit
  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsScanning(true);
    setScanStepIndex(0);

    const stepTimer1 = setTimeout(() => setScanStepIndex(1), 400);
    const stepTimer2 = setTimeout(() => setScanStepIndex(2), 850);
    const stepTimer3 = setTimeout(() => {
      const q = customPrompt.toLowerCase();
      if (q.includes("to'y") || q.includes("toy") || q.includes("свадьб") || q.includes("klassik")) {
        setSelectedScenario("wedding");
      } else if (q.includes("biznes") || q.includes("ofis") || q.includes("delov") || q.includes("ish")) {
        setSelectedScenario("business");
      } else if (q.includes("uchrashuv") || q.includes("qiz") || q.includes("svidan") || q.includes("romant")) {
        setSelectedScenario("date");
      } else if (q.includes("qish") || q.includes("sovuq") || q.includes("kurtka") || q.includes("palto")) {
        setSelectedScenario("winter");
      } else {
        setSelectedScenario("casual");
      }

      setOuterIndex((prev) => prev + 1);
      setTopIndex((prev) => prev + 1);
      setBottomIndex((prev) => prev + 1);
      setShoesIndex((prev) => prev + 1);
      setIsScanning(false);
    }, 1300);

    return () => {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
    };
  };

  // Full regeneration
  const handleRandomizeAll = () => {
    setIsScanning(true);
    setTimeout(() => {
      setOuterIndex((prev) => prev + 1);
      setTopIndex((prev) => prev + 1);
      setBottomIndex((prev) => prev + 1);
      setShoesIndex((prev) => prev + 1);
      setIsScanning(false);
    }, 450);
  };

  // Save outfit to customer profile
  const handleSaveOutfit = () => {
    try {
      const savedLook = {
        id: `look-${selectedScenario}-${Date.now()}`,
        style: selectedScenario,
        titleUz: scenarioConfig.titleUz,
        titleRu: scenarioConfig.titleRu,
        items: selectedItems,
        totalPrice,
        discountedPrice,
        savedAt: new Date().toISOString(),
      };
      const existing = localStorage.getItem("button_saved_outfits");
      const list = existing ? JSON.parse(existing) : [];
      const updated = [savedLook, ...list.filter((l: any) => l.id !== savedLook.id)];
      localStorage.setItem("button_saved_outfits", JSON.stringify(updated));
      setSavedLooksCount(updated.length);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {}
  };

  // Add all 4 items directly to cart
  const handleAddAllToCart = () => {
    selectedItems.forEach((item) => {
      const chosenSize = item.sizes?.includes(preferredSize) ? preferredSize : item.sizes?.[0] || "M";
      const chosenColor = item.colors?.[0] || "";
      onAddToCart(item, chosenSize, chosenColor, 1);
    });
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 3000);
  };

  // Reserve outfit in branch for 2 hours
  const handleReserveInBranch = () => {
    setReservedSuccess(true);
    setTimeout(() => setReservedSuccess(false), 3500);
  };

  const scanSteps = [
    isUz ? "1. Mijoz so'rovi va ranglar gammasi tahlil qilinmoqda..." : "1. Анализ цветовой гаммы и ключевых запросов...",
    isUz ? "2. Admin katalogidagi 28 ta kiyimdan mos kombinatsiya saralanmoqda..." : "2. Подбор из 28 реальных позиций каталога...",
    isUz ? "3. Razmer va bichim balansi tekshirilmoqda..." : "3. Проверка посадки по фигуре и расчет гармонии...",
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* ========================================================
          1. HEADER & AI BADGE
          ======================================================== */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <button
          type="button"
          onClick={onNavigateToProducts}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
            <span>BUTTON AI STYLIST 2.0</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {isUz ? "Shaxsiy Stilist & Obraz Studiyasi" : "Персональный AI Стилист & Студия Образов"}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            {isUz
              ? "Do'kondagi haqiqiy kiyimlardan sizga mos mukammal to'plam"
              : "Готовые гармоничные образы из реального каталога BUTTON"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveOutfit}
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shadow-xs relative"
          title={isUz ? "Obrazni saqlash" : "Сохранить образ"}
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          {savedLooksCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-700 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {savedLooksCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          2. MODE SWITCHER: Senariylar vs Erkin AI So'rov
          ======================================================== */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveMode("scenario")}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeMode === "scenario"
              ? "bg-violet-700 text-white shadow-sm font-black"
              : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span>🎯</span>
          <span>{isUz ? "Voqea & Tadbirlar" : "По случаю"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("prompt")}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeMode === "prompt"
              ? "bg-violet-700 text-white shadow-sm font-black"
              : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span>💬</span>
          <span>{isUz ? "Erkin AI So'rov" : "Свободный запрос"}</span>
        </button>
      </div>

      {/* Mode A: SCENARIOS QUICK CARDS */}
      {activeMode === "scenario" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {SCENARIOS.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setSelectedScenario(sc.id);
                    setOuterIndex(0);
                    setTopIndex(0);
                    setBottomIndex(0);
                    setShoesIndex(0);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2.5 shadow-xs ${
                    isSelected
                      ? "bg-violet-700 text-white border-violet-700 shadow-md shadow-violet-700/25 scale-[1.02]"
                      : "bg-white dark:bg-[#0f172a] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-slate-800 hover:border-violet-600/40"
                  }`}
                >
                  <span className="text-lg">{sc.emoji}</span>
                  <div>
                    <h3 className="text-xs font-black block">
                      {isUz ? sc.titleUz : sc.titleRu}
                    </h3>
                    <span
                      className={`text-[10px] font-mono block ${
                        isSelected ? "text-violet-200" : "text-[#64748B] dark:text-slate-400"
                      }`}
                    >
                      {sc.baseMatch}% moslik
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode B: FREEFORM AI PROMPT BOX */}
      {activeMode === "prompt" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-sm space-y-3">
          <form onSubmit={handlePromptSubmit} className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  isUz
                    ? "Masalan: Do'stimning to'yiga nima kiysam bo'ladi? Yoki: Qora kurtka va qulay shim..."
                    : "Например: Что надеть на свадьбу друга? Или: Черная куртка и удобные брюки..."
                }
                className="w-full pl-10 pr-24 py-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700 text-xs sm:text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-600"
              />
              <button
                type="submit"
                disabled={isScanning || !customPrompt.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isUz ? "Tahlil" : "Анализ"}</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold mr-1">
                {isUz ? "Namunalar:" : "Примеры:"}
              </span>
              {[
                { uz: "🤵 To'y uchun hashamatli look", ru: "🤵 Образ на свадьбу" },
                { uz: "💼 Ofis uchun Slim-Fit kostyum", ru: "💼 Деловой костюм Slim-Fit" },
                { uz: "☕ Romantik uchrashuvga", ru: "☕ На свидание" },
                { uz: "🏙️ Shaharda yurishga qulay", ru: "🏙️ Удобный городской" },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomPrompt(isUz ? sample.uz.slice(2) : sample.ru.slice(2));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-[11px] text-[#64748B] dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-500/30 transition-colors cursor-pointer"
                >
                  {isUz ? sample.uz : sample.ru}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* AI NEURAL SCANNING OVERLAY */}
      {isScanning && (
        <div className="p-6 rounded-3xl bg-violet-950/20 border border-violet-500/30 text-center space-y-3 animate-fade-in backdrop-blur-xs">
          <div className="w-12 h-12 rounded-2xl bg-violet-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-700/30 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: "4s" }} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-[#0F172A] dark:text-white">
              {isUz ? "AI Stilist tahlil qilmoqda..." : "AI Стилист анализирует гардероб..."}
            </h4>
            <p className="text-xs text-violet-700 dark:text-violet-400 font-mono animate-pulse">
              {scanSteps[scanStepIndex]}
            </p>
          </div>
          <div className="w-48 h-1.5 bg-violet-200 dark:bg-violet-950 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-300"
              style={{ width: `${(scanStepIndex + 1) * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================
          3. AI INSIGHT HEADER: MATCH SCORE + COLOR PALETTE + STYLIST NOTE
          ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-[0_4px_25px_rgba(109,40,217,0.06)] dark:shadow-xl space-y-4">
        {/* Top bar: Scenario Title + Match Score badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scenarioConfig.emoji}</span>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">
                {isUz ? scenarioConfig.titleUz : scenarioConfig.titleRu}
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {isUz ? scenarioConfig.subtitleUz : scenarioConfig.subtitleRu}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Match Score Badge */}
            <div className="px-3 py-1.5 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-400 font-mono font-black text-sm flex items-center gap-1.5 shadow-xs">
              <Flame className="w-4 h-4 text-violet-600 fill-violet-600" />
              <span>{matchScore}% Moslik</span>
            </div>

            {/* Randomize outfit button */}
            <button
              type="button"
              onClick={handleRandomizeAll}
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-violet-700 dark:hover:text-violet-400 transition-colors cursor-pointer"
              title={isUz ? "Obrazni qayta saralash" : "Случайный подбор"}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Palette Harmonizer */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>{isUz ? "Ranglar Uyg'unligi Nazariyasi (Color Harmony):" : "Цветовая гармония:"}</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {scenarioConfig.palette.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] border border-[#E2E8F0] dark:border-slate-700"
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 shadow-xs border border-white/20"
                  style={{ backgroundColor: p.hex }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white block truncate">
                    {isUz ? p.nameUz : p.nameRu}
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-slate-400 block font-medium">
                    {isUz ? p.roleUz : p.roleRu}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stylist's Editorial Note */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-violet-700 dark:text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUz ? "BUTTON Bosh Stilisti Xulosasi:" : "Экспертное заключение стилиста:"}</span>
          </div>
          <p className="text-xs text-[#0F172A] dark:text-slate-300 leading-relaxed">
            {isUz ? scenarioConfig.stylistNoteUz : scenarioConfig.stylistNoteRu}
          </p>
        </div>

        {/* Customer Size Match Banner */}
        {measurements?.standardSize && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isUz
                  ? `Sizning razmeringiz (${preferredSize}) bo'yicha Beruniy filialida barcha buyumlar mavjud!`
                  : `Все позиции доступны в вашем размере (${preferredSize}) в филиале Беруни!`}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              100% Fit
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          4. LOOK STUDIO: 4 INTERACTIVE GARMENT LAYERS
          ======================================================== */}
      {products.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 space-y-3 shadow-sm dark:shadow-xl">
          <Sparkles className="w-10 h-10 text-violet-600 mx-auto opacity-50 animate-pulse" />
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
            {isUz ? "Hozircha mahsulotlar mavjud emas" : "Товары пока не добавлены"}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
            {isUz
              ? "Katalogga yangi kiyimlar joylanishi bilan AI Stilist sizga tayyor obrazlarni tanlab beradi."
              : "После добавления товаров в каталог AI Стилист подберет готовые образы."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-700 dark:text-violet-400" />
                <span>{isUz ? "Look Studio: Boshdan-Oyoq 4 Qavat" : "Студия образов: 4 слоя гардероба"}</span>
              </h3>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewStyle("stack")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewStyle === "stack" ? "bg-violet-700 text-white" : "text-[#64748B] dark:text-slate-400"
              }`}
            >
              {isUz ? "Qatlamlar" : "Слои"}
            </button>
            <button
              type="button"
              onClick={() => setViewStyle("grid")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewStyle === "grid" ? "bg-violet-700 text-white" : "text-[#64748B] dark:text-slate-400"
              }`}
            >
              {isUz ? "Katalog" : "Сетка"}
            </button>
          </div>
        </div>

        {/* 4 Garments List / Mannequin Stack */}
        <div
          className={
            viewStyle === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
              : "space-y-3"
          }
        >
          {[
            {
              layerNameUz: "1. Ustki Kiyim",
              layerNameRu: "1. Верхняя Одежда",
              badgeUz: "Kostyum / Kurtka",
              badgeRu: "Костюм / Куртка",
              item: outerItem,
              index: outerIndex,
              setIndex: setOuterIndex,
              pool: currentPools.outer,
            },
            {
              layerNameUz: "2. Ichki Qatlam",
              layerNameRu: "2. Внутренний Слой",
              badgeUz: "Polo / Xudi / Ko'ylak",
              badgeRu: "Поло / Худи / Рубашка",
              item: topItem,
              index: topIndex,
              setIndex: setTopIndex,
              pool: currentPools.top,
            },
            {
              layerNameUz: "3. Pastki Kiyim",
              layerNameRu: "3. Брюки & Низ",
              badgeUz: "Klassik shim / Chino",
              badgeRu: "Классика / Чинос",
              item: bottomItem,
              index: bottomIndex,
              setIndex: setBottomIndex,
              pool: currentPools.bottom,
            },
            {
              layerNameUz: "4. Poyabzal & Aksessuar",
              layerNameRu: "4. Обувь & Аксессуары",
              badgeUz: "Lofer / Tufli / Kamar",
              badgeRu: "Лоферы / Туфли",
              item: shoesItem,
              index: shoesIndex,
              setIndex: setShoesIndex,
              pool: currentPools.footwear,
            },
          ].map((layer, idx) => {
            const currentItem = layer.item;

            return (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 hover:border-violet-600/40 transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-slate-800 text-xs">
                  <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                    <span>{isUz ? layer.layerNameUz : layer.layerNameRu}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 font-semibold">
                    {layer.index % layer.pool.length + 1} / {layer.pool.length}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Product Thumbnail */}
                  <div
                    onClick={() => onSelectProduct(currentItem)}
                    className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] overflow-hidden border border-[#E2E8F0] dark:border-slate-700 shrink-0 cursor-pointer group-hover:scale-102 transition-transform"
                  >
                    <Image
                      src={currentItem.image}
                      alt={currentItem.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {currentItem.badge && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-violet-700 text-white font-black text-[9px] uppercase tracking-wider">
                        {currentItem.badge}
                      </span>
                    )}
                  </div>

                  {/* Details & Swapping Controls */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div
                      onClick={() => onSelectProduct(currentItem)}
                      className="cursor-pointer"
                    >
                      <h4 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                        {isUz ? currentItem.name : currentItem.nameRu || currentItem.name}
                      </h4>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 line-clamp-1">
                        {isUz ? layer.badgeUz : layer.badgeRu}
                      </p>
                    </div>

                    {/* Admin Price Display */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-black text-sm sm:text-base text-violet-700 dark:text-violet-400">
                        {formatUzbekCurrency(currentItem.price)}
                      </span>
                      {currentItem.oldPrice && (
                        <span className="text-[11px] text-[#94A3B8] line-through font-mono">
                          {formatUzbekCurrency(currentItem.oldPrice)}
                        </span>
                      )}
                    </div>

                    {/* ◀ Boshqasi ▶ Swapper Controls */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => layer.setIndex((prev) => (prev - 1 + layer.pool.length) % layer.pool.length)}
                        className="p-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-300 transition-colors cursor-pointer"
                        title={isUz ? "Oldingisi" : "Предыдущий"}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => layer.setIndex((prev) => (prev + 1) % layer.pool.length)}
                        className="flex-1 py-1 px-2 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                        <span>{isUz ? "Boshqasiga almashtirish" : "Заменить вещь"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => layer.setIndex((prev) => (prev + 1) % layer.pool.length)}
                        className="p-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1e293b] hover:bg-[#E2E8F0] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-300 transition-colors cursor-pointer"
                        title={isUz ? "Keyingisi" : "Следующий"}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          5. TRANSPARENT PRICE SUMMARY & ACTION BUTTONS
          ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 shadow-xl space-y-4">
        {/* Transparent Admin Price Breakdown */}
        <div className="space-y-2 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>{isUz ? "Kiyimlar narxi (Admin belgilagan summa):" : "Цена по каталогу (сумма товаров):"}</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-white">
              {formatUzbekCurrency(totalPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <span>🎉</span>
              <span>{isUz ? "To'liq obraz maxsus chegirmasi (-10%):" : "Скидка на полный образ (-10%):"}</span>
            </span>
            <span className="font-mono">- {formatUzbekCurrency(savedAmount)}</span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-[#64748B] dark:text-slate-400 block font-semibold">
                {isUz ? "Yakuniy to'plam narxi:" : "Итого за весь образ:"}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isUz ? `Tejamkorligingiz: ${formatUzbekCurrency(savedAmount)}` : `Вы экономите: ${formatUzbekCurrency(savedAmount)}`}
              </span>
            </div>
            <span className="font-mono font-black text-xl sm:text-2xl text-violet-700 dark:text-violet-400">
              {formatUzbekCurrency(discountedPrice)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Add All to Cart & Branch Reserve */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <button
            type="button"
            onClick={handleAddAllToCart}
            disabled={addedAllSuccess}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
              addedAllSuccess
                ? "bg-emerald-600 text-white shadow-emerald-600/25"
                : "bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/25"
            }`}
          >
            {addedAllSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{isUz ? "4 ta kiyim savatga qo'shildi!" : "4 вещи добавлены в корзину!"}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>{isUz ? "⚡ Butun Obrazni Savatga Olish (-10%)" : "Купить весь образ со скидкой"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReserveInBranch}
            className="py-3.5 px-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e293b] hover:bg-[#F1F5F9] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Store className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>
              {reservedSuccess
                ? isUz ? "✅ 2 soatga band qilindi!" : "✅ Забронировано на 2 часа!"
                : isUz ? "Filialda bepul kiyib ko'rish" : "Примерить в шоуруме"}
            </span>
          </button>
        </div>

        {/* Reassurance Features */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-slate-800 text-[10px] text-center text-[#64748B] dark:text-slate-400">
          <div className="space-y-0.5">
            <span className="block font-bold text-[#0F172A] dark:text-white">🛡️ Kafolat</span>
            <span>{isUz ? "Razmer 3 kunda almashtiriladi" : "Обмен 3 дня"}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block font-bold text-[#0F172A] dark:text-white">📍 4 ta Filial</span>
            <span>{isUz ? "Bugun kelib kiyib ko'ring" : "Примерка сегодня"}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block font-bold text-[#0F172A] dark:text-white">🚀 2-3 soatda</span>
            <span>{isUz ? "Toshkent bo'ylab yetkazish" : "Доставка по Ташкенту"}</span>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};