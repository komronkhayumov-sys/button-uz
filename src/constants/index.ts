import { Branch, Category, Product, StoreSettings } from "@/types";

export const STORE_NAME = "BUTTON Men's Wear";
export const STORE_HANDLE = "@button_uz";
export const STORE_INSTAGRAM = "https://www.instagram.com/button_uz/";
export const STORE_TELEGRAM = "https://t.me/button_uz";

export const CONTACT_PHONES = [
  { raw: "+998946135555", display: "+998 94 613 55 55", label: "Chilonzor & Risoviy" },
  { raw: "+998996135555", display: "+998 99 613 55 55", label: "Beruniy & Shahriston" },
];

export const WORKING_HOURS = {
  startHour: 10,
  endHour: 23,
  displayUz: "Har kuni 10:00 – 23:00",
  displayRu: "Ежедневно 10:00 – 23:00",
};

export const SHOWROOM_WIFI = {
  ssid: "BUTTON_GUEST",
  password: "buttonmenswear",
};

export const CATEGORIES: Category[] = [
  { id: "all", nameUz: "Barchasi", nameRu: "Все" },
  { id: "suits", nameUz: "Kostyum & Shim", nameRu: "Костюмы & Пиджаки" },
  { id: "jackets", nameUz: "Kurtka & Palto", nameRu: "Куртки & Пальто" },
  { id: "hoodies", nameUz: "Xudi & Sviter", nameRu: "Худи & Свитшоты" },
  { id: "polos", nameUz: "Polo & Futbolka", nameRu: "Поло & Футболки" },
  { id: "pants", nameUz: "Shim & Jinsi", nameRu: "Брюки & Джинсы" },
  { id: "shoes", nameUz: "Poyabzal", nameRu: "Обувь" },
  { id: "accessories", nameUz: "Aksessuarlar", nameRu: "Аксессуары" },
];

export const BRANCHES: Branch[] = [
  {
    id: "chilonzor-16",
    name: "Chilonzor-16 filiali",
    nameRu: "Филиал Чиланзар-16",
    address: "Toshkent sh., Chilonzor tumani, 16-mavze, Katta Qa'ni ko'chasi",
    addressRu: "г. Ташкент, Чиланзарский р-н, 16-й квартал, ул. Катта Каъни",
    landmark: "16-mavze savdo markazi yonida",
    landmarkRu: "Рядом с ТЦ 16-го квартала",
    phone: "+998 94 613 55 55",
    workingHours: "10:00 – 23:00 (dam olishsiz)",
    workingHoursRu: "10:00 – 23:00 (без выходных)",
    yandexMap: "https://yandex.uz/maps/?text=Toshkent+Chilonzor+16-mavze",
    googleMap: "https://maps.google.com/?q=41.2715,69.1852",
    coordinates: { lat: 41.2715, lng: 69.1852 },
  },
  {
    id: "beruniy",
    name: "Beruniy filiali (Korzinka)",
    nameRu: "Филиал Беруни (Korzinka)",
    address: "Toshkent sh., Beruniy metro bekati, Korzinka supermarketi, 2-qavat",
    addressRu: "г. Ташкент, станция метро Беруни, супермаркет Korzinka, 2-й этаж",
    landmark: "Korzinka Beruniy 2-qavati",
    landmarkRu: "Супермаркет Корзинка Беруни, 2 этаж",
    phone: "+998 99 613 55 55",
    workingHours: "10:00 – 23:00 (dam olishsiz)",
    workingHoursRu: "10:00 – 23:00 (без выходных)",
    yandexMap: "https://yandex.uz/maps/?text=Toshkent+metro+Beruniy+Korzinka",
    googleMap: "https://maps.google.com/?q=41.3444,69.2057",
    coordinates: { lat: 41.3444, lng: 69.2057 },
  },
  {
    id: "risoviy",
    name: "Risoviy filiali",
    nameRu: "Филиал Рисовый",
    address: "Toshkent sh., Mirobod tumani, Farg'ona yo'li ko'chasi, Risoviy bozori hududi",
    addressRu: "г. Ташкент, Мирабадский р-н, ул. Фергана йули, район Рисового рынка",
    landmark: "Risoviy ko'prigi va chorrahasi yaqinida",
    landmarkRu: "Ориентир: мост и перекресток Рисовый",
    phone: "+998 94 613 55 55",
    workingHours: "10:00 – 23:00 (dam olishsiz)",
    workingHoursRu: "10:00 – 23:00 (без выходных)",
    yandexMap: "https://yandex.uz/maps/?text=Toshkent+Risoviy+bozor",
    googleMap: "https://maps.google.com/?q=41.2847,69.3142",
    coordinates: { lat: 41.2847, lng: 69.3142 },
  },
  {
    id: "shahriston",
    name: "Shahriston filiali",
    nameRu: "Филиал Шахристан",
    address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi, Shahriston metro chorrahasi",
    addressRu: "г. Ташкент, Юнусабадский р-н, ул. Амира Темура, перекресток метро Шахристан",
    landmark: "Shahriston metro bekati chiqishi",
    landmarkRu: "Выход со станции метро Шахристан",
    phone: "+998 99 613 55 55",
    workingHours: "10:00 – 23:00 (dam olishsiz)",
    workingHoursRu: "10:00 – 23:00 (без выходных)",
    yandexMap: "https://yandex.uz/maps/?text=Toshkent+metro+Shahriston",
    googleMap: "https://maps.google.com/?q=41.3533,69.2891",
    coordinates: { lat: 41.3533, lng: 69.2891 },
  },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const DEFAULT_SETTINGS: StoreSettings = {
  adminPin: "1234",
  adminName: "Admin",
  adminEmail: "admin@button.uz",
  storeName: "𝗕𝘂𝘁𝘁𝗼𝗻 𝗘𝗿𝗸𝗮𝗸𝗹𝗮𝗿 𝗞𝗶𝘆𝗶𝗺 𝗗𝗼‘𝗸𝗼𝗻𝗶",
  storeHandle: "@button_uz",
  storeBioUz: "Zamonaviy erkaklar kiyimlari, poyabzal va aksessuarlar. Toshkentda 4 ta filial.",
  storeBioRu: "Стильная мужская одежда, обувь и аксессуары. 4 филиала в Ташкенте.",
  storeAvatar: "/btn-logo.png",
  storeHeroBanner: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  instagramUrl: "https://www.instagram.com/button_uz/",
  telegramUrl: "https://t.me/button_uz",
  phone1: "+998 94 613 55 55",
  phone2: "+998 99 613 55 55",
  workingHoursUz: "Har kuni 10:00 – 23:00",
  workingHoursRu: "Ежедневно 10:00 – 23:00",
  wifiSsid: "BUTTON_GUEST",
  wifiPassword: "buttonmenswear",
  cardNumber: "8600 5304 8812 4433",
  cardHolder: "BUTTON MEN'S WEAR",
  cardBank: "Kapitalbank (Uzcard)",
  card2Number: "9860 1201 3344 7788",
  card2Holder: "BUTTON MEN'S WEAR",
  card2Bank: "TBC Bank (Humo / Visa)",
  card2Enabled: true,
  branches: BRANCHES,
};
