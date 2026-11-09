export type Language = 'uz' | 'ru';

export type PaymentMethod = 'click' | 'payme' | 'uzum' | 'cash';

export type Product = {
  id: string;
  name: string;
  nameRu?: string;
  description: string;
  descriptionRu?: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  images?: string[];
  sizes: string[];
  colors?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  badge?: 'Yangi' | 'Xit' | 'Chegirma' | 'Новинка' | 'Хит' | 'Скидка' | string;
  createdAt?: string;
};

export type Branch = {
  id: string;
  name: string;
  nameRu: string;
  address: string;
  addressRu: string;
  landmark: string;
  landmarkRu: string;
  phone: string;
  workingHours: string;
  workingHoursRu: string;
  yandexMap: string;
  googleMap: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'pickup';
  branchId?: string;
  branchName?: string;
  address?: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verifying' | 'paid' | 'rejected';
  paymentReceipt?: string;
  paymentReceiptTime?: string;
  paymentRejectReason?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'new' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  telegramSent?: boolean;
};

export type CustomerNavSection = 'katalog' | 'branches' | 'ai-mode' | 'orders' | 'profile' | 'home' | 'products';

export type CustomerMeasurements = {
  height?: number; // Bo'y (sm)
  weight?: number; // Vazn (kg)
  chest?: number; // Ko'krak aylanasi (sm)
  waist?: number; // Bel aylanasi (sm)
  hips?: number; // Son aylanasi (sm)
  standardSize?: string; // S, M, L, XL, XXL, 3XL
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  preferredSize?: string;
  measurements?: CustomerMeasurements;
  ordersCount: number;
  totalSpent: number;
  registeredAt: string;
  isBookmarked?: boolean;
};

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color?: string;
  quantity: number;
  price: number;
};

export type OutfitCombination = {
  id: string;
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  style: 'classic' | 'streetwear' | 'smart_casual';
  tag: string;
  items: Product[];
  totalPrice: number;
  comboPrice: number;
};

export type Category = {
  id: string;
  nameUz: string;
  nameRu: string;
  icon?: string;
};

export type StoreSettings = {
  adminPin: string;
  adminName?: string;
  adminEmail?: string;
  storeName: string;
  storeHandle: string;
  storeBioUz: string;
  storeBioRu: string;
  storeAvatar: string;
  storeHeroBanner?: string;
  instagramUrl: string;
  telegramUrl: string;
  phone1: string;
  phone2: string;
  workingHoursUz: string;
  workingHoursRu: string;
  wifiSsid: string;
  wifiPassword: string;
  cardNumber: string;
  cardHolder: string;
  cardBank: string;
  card2Number?: string;
  card2Holder?: string;
  card2Bank?: string;
  card2Enabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  geminiApiKey?: string;
  branches: Branch[];
  // Delivery & Tariffs (Adjustable by Admin)
  deliveryPriceTashkent?: number;
  deliveryFreeThresholdTashkent?: number;
  deliveryPriceRegions?: number;
  deliveryFreeThresholdRegions?: number;
  // Discounts & Promotions (Adjustable by Admin)
  comboDiscountPercent?: number;
  globalPromoDiscountPercent?: number;
};
