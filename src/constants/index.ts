import { Branch, Category, Product, StoreSettings } from "@/types";

export const STORE_NAME = "BUTTON Men's Wear (button_uz)";
export const STORE_HANDLE = "@button_uz";
export const STORE_INSTAGRAM = "https://www.instagram.com/button_uz/";
export const STORE_TELEGRAM = "https://t.me/button_uzbekistan";

export const CONTACT_PHONES = [
  { raw: "+998946135555", display: "+998 94 613 55 55", label: "Chilonzor & Sergeli" },
  { raw: "+998996135555", display: "+998 99 613 55 55", label: "Yunusobod (Mega Planet)" },
];

export const WORKING_HOURS = {
  startHour: 10,
  endHour: 22,
  displayUz: "Har kuni 10:00 – 22:00",
  displayRu: "Ежедневно 10:00 – 22:00",
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
    "id": "chilonzor",
    "name": "Chilonzor filiali",
    "nameRu": "Филиал Чиланзар",
    "address": "Toshkent sh., Chilonzor tumani, 16-mavze, Katta Qa'ni ko'chasi",
    "addressRu": "г. Ташкент, Чиланзарский р-н, 16-й квартал, ул. Катта Каъни",
    "landmark": "16-mavze savdo markazi yonida",
    "landmarkRu": "Рядом с ТЦ 16-го квартала",
    "phone": "+998 94 613 55 55",
    "workingHours": "10:00 – 22:00 (dam olishsiz)",
    "workingHoursRu": "10:00 – 22:00 (без выходных)",
    "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Chilonzor+16-mavze",
    "googleMap": "https://maps.google.com/?q=41.2715,69.1852",
    "coordinates": {
      "lat": 41.2715,
      "lng": 69.1852
    }
  },
  {
    "id": "yunusobod",
    "name": "Yunusobod filiali (Mega Planet yaqini)",
    "nameRu": "Филиал Юнусабад (около ТРЦ Mega Planet)",
    "address": "Toshkent sh., Yunusobod tumani, Ahmad Donish ko'chasi, Mega Planet yaqini",
    "addressRu": "г. Ташкент, Юнусабадский р-н, ул. Ахмада Дониша, около ТРЦ Mega Planet",
    "landmark": "Mega Planet savdo majmuasi yaqinida",
    "landmarkRu": "Ориентир: рядом с ТРЦ Mega Planet",
    "phone": "+998 99 613 55 55",
    "workingHours": "10:00 – 22:00 (dam olishsiz)",
    "workingHoursRu": "10:00 – 22:00 (без выходных)",
    "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Yunusobod+Mega+Planet",
    "googleMap": "https://maps.google.com/?q=41.3655,69.2882",
    "coordinates": {
      "lat": 41.3655,
      "lng": 69.2882
    }
  },
  {
    "id": "sergeli",
    "name": "Sergeli filiali",
    "nameRu": "Филиал Сергели",
    "address": "Toshkent sh., Sergeli tumani, Yangi Sergeli ko'chasi, Dehqon bozori hududi",
    "addressRu": "г. Ташкент, Сергелийский р-н, ул. Янги Сергели, район Дехканского рынка",
    "landmark": "Sergeli dehqon bozori va metro bekati yaqini",
    "landmarkRu": "Ориентир: рынок Сергели и станция метро",
    "phone": "+998 94 613 55 55",
    "workingHours": "10:00 – 22:00 (dam olishsiz)",
    "workingHoursRu": "10:00 – 22:00 (без выходных)",
    "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Sergeli+bozor",
    "googleMap": "https://maps.google.com/?q=41.2238,69.2185",
    "coordinates": {
      "lat": 41.2238,
      "lng": 69.2185
    }
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "btn-001",
    "name": "Classic Zip-Up Cardigan (Triko)",
    "nameRu": "Классический кардиган на молнии (Трикотаж)",
    "description": "Nafis trikotaj matoli zamonaviy zip-up kardigan. Kundalik kiyish va ofis uslubi uchun juda qulay.",
    "descriptionRu": "Элегантный трикотажный кардиган на молнии. Идеально подходит для повседневного и офисного стиля.",
    "price": 280000,
    "oldPrice": 350000,
    "category": "hoodies",
    "image": "/products/btn-001.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Xit",
    "createdAt": "2026-11-08T10:00:00Z"
  },
  {
    "id": "btn-002",
    "name": "Oversize Heavy Cotton T-Shirt",
    "nameRu": "Футболка оверсайз Heavy Cotton",
    "description": "Zich va yuqori sifatli 100% paxta matosidan tayyorlangan oversize futbolka. Shaklini yo'qotmaydi.",
    "descriptionRu": "Оверсайз футболка из плотного 100% премиум хлопка. Отлично держит форму после стирок.",
    "price": 160000,
    "oldPrice": 200000,
    "category": "polos",
    "image": "/products/btn-002.jpg",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Trend",
    "createdAt": "2026-11-08T10:05:00Z"
  },
  {
    "id": "btn-003",
    "name": "Classic Straight Fit Jeans (Ko'k/Qora)",
    "nameRu": "Классические джинсы Straight Fit (Синий/Черный)",
    "description": "To'g'ri bichimli (Straight Fit) qulay klassik jinsi shim. Yuqori sifatli denim mato, ko'k va qora ranglarda.",
    "descriptionRu": "Прямые классические джинсы из плотного денима. Идеальная посадка, базовые расцветки.",
    "price": 320000,
    "oldPrice": 390000,
    "category": "pants",
    "image": "/products/btn-003.jpg",
    "sizes": [
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "36"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Klassika",
    "createdAt": "2026-11-08T10:10:00Z"
  },
  {
    "id": "btn-004",
    "name": "Loro Piana Style Loafers (Zamsh)",
    "nameRu": "Лоферы в стиле Loro Piana (Замша)",
    "description": "Yumshoq tabiiy zamsh materialidan tayyorlangan premium loferlar. Qulay oq taglik, oyoqni charchatmaydi.",
    "descriptionRu": "Премиальные замшевые лоферы в стиле Loro Piana. Удобная белая подошва, максимальный комфорт.",
    "price": 450000,
    "oldPrice": 560000,
    "category": "shoes",
    "image": "/products/btn-004.jpg",
    "sizes": [
      "39",
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Premium",
    "createdAt": "2026-11-08T10:15:00Z"
  },
  {
    "id": "btn-005",
    "name": "Polo Collar Knitted Shirt",
    "nameRu": "Вязаная рубашка-поло",
    "description": "Trikotaj yoqali nafis polo ko'ylak. Yengil, nafas oluvchi va zamonaviy smart-casual bichim.",
    "descriptionRu": "Изысканная трикотажная рубашка-поло. Дышащая ткань, стильный крой smart-casual.",
    "price": 220000,
    "oldPrice": 280000,
    "category": "polos",
    "image": "/products/btn-005.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Yangi",
    "createdAt": "2026-11-08T10:20:00Z"
  },
  {
    "id": "btn-006",
    "name": "Lightweight Bomber Jacket (Bahor/Kuzgi)",
    "nameRu": "Легкий бомбер (Весна/Осень)",
    "description": "Shamol va yomg'irga chidamli yengil matodan bahor va kuz mavsumi uchun zamonaviy bomber kurtka.",
    "descriptionRu": "Стильная демисезонная куртка-бомбер из ветро- и водоотталкивающего материала.",
    "price": 420000,
    "oldPrice": 520000,
    "category": "jackets",
    "image": "/products/btn-006.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Xit",
    "createdAt": "2026-11-08T10:25:00Z"
  },
  {
    "id": "btn-007",
    "name": "Classic Chino Pants (Qora/Qaymoqrang)",
    "nameRu": "Брюки чинос (Черный/Кремовый)",
    "description": "Klassik va qulay chinos shimlari. Paxta va elastan aralashmasi qulay harakatlanishni ta'minlaydi.",
    "descriptionRu": "Классические удобные брюки чинос из хлопка с добавлением эластана.",
    "price": 290000,
    "oldPrice": 360000,
    "category": "pants",
    "image": "/products/btn-007.jpg",
    "sizes": [
      "30",
      "31",
      "32",
      "33",
      "34",
      "36"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Klassika",
    "createdAt": "2026-11-08T10:30:00Z"
  },
  {
    "id": "btn-008",
    "name": "Two-Piece Men's Tracksuit (Sportivka to'plam)",
    "nameRu": "Мужской спортивный костюм-двойка",
    "description": "Ikki qismli erkaklar sport-casual to'plami (kurtka va shim). Sayohat va kundalik kiyish uchun ideal.",
    "descriptionRu": "Удобный стильный костюм-двойка (куртка и штаны) для активного отдыха и прогулок.",
    "price": 480000,
    "oldPrice": 590000,
    "category": "suits",
    "image": "/products/btn-008.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Top Set",
    "createdAt": "2026-11-08T10:35:00Z"
  },
  {
    "id": "btn-009",
    "name": "Oxford Long Sleeve Shirt (Oq/Moviy)",
    "nameRu": "Рубашка Oxford с длинным рукавом (Белый/Голубой)",
    "description": "Klassik tugmali yoqaga ega Oksford ko'ylagi. 100% paxta, qulay bichim va dazmollash oson.",
    "descriptionRu": "Классическая хлопковая оксфордская рубашка. Идеальна для делового стиля и джинсов.",
    "price": 250000,
    "oldPrice": 310000,
    "category": "polos",
    "image": "/products/btn-009.jpg",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Biznes",
    "createdAt": "2026-11-08T10:40:00Z"
  },
  {
    "id": "btn-010",
    "name": "White Leather Casual Sneakers",
    "nameRu": "Белые кожаные кеды Casual",
    "description": "Oq charm krossovkalar — har qanday kiyim bilan mos tushuvchi minimalist universal poyabzal.",
    "descriptionRu": "Универсальные белые кожаные кеды в минималистичном дизайне. Базовый элемент гардероба.",
    "price": 390000,
    "oldPrice": 480000,
    "category": "shoes",
    "image": "/products/btn-010.jpg",
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Must Have",
    "createdAt": "2026-11-08T10:45:00Z"
  },
  {
    "id": "btn-011",
    "name": "Puffer Vest (Yengsiz Jiletka)",
    "nameRu": "Утепленный жилет Puffer Vest",
    "description": "Yengil va issiq ushlovchi jiletka. Bahor-kuz mavsumida xudi yoki sviter ustidan kiyish uchun zo'r tanlov.",
    "descriptionRu": "Легкий утепленный мужской жилет. Отлично смотрится поверх худи и свитеров.",
    "price": 350000,
    "oldPrice": 430000,
    "category": "jackets",
    "image": "/products/btn-011.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Trend",
    "createdAt": "2026-11-08T10:50:00Z"
  },
  {
    "id": "btn-012",
    "name": "Half-Zip Fleece Sweatshirt",
    "nameRu": "Флисовый свитшот на молнии Half-Zip",
    "description": "Yarim zamokli yumshoq flis svitshot. Iliq va juda qulay bichim, sovuq kunlar uchun mukammal.",
    "descriptionRu": "Теплый и мягкий флисовый свитшот на молнии. Превосходный комфорт для прохладных дней.",
    "price": 260000,
    "oldPrice": 320000,
    "category": "hoodies",
    "image": "/products/btn-012.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Qulay",
    "createdAt": "2026-11-08T10:55:00Z"
  },
  {
    "id": "btn-013",
    "name": "Summer Linen Set (Zig'ir matoli ko'ylak va shim)",
    "nameRu": "Льняной летний комплект (Рубашка и брюки)",
    "description": "Tabiiy zig'ir (linen) matosidan tayyorlangan nafis yozgi kostyum to'plami. Issiq havoda salqin tutadi.",
    "descriptionRu": "Легкий летний костюм из натурального льна. Дышащий материал, непревзойденная свежесть.",
    "price": 440000,
    "oldPrice": 550000,
    "category": "suits",
    "image": "/products/btn-013.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Yozgi Xit",
    "createdAt": "2026-11-08T11:00:00Z"
  },
  {
    "id": "btn-014",
    "name": "Cargo Jogger Pants",
    "nameRu": "Брюки-джоггеры карго",
    "description": "Yon cho'ntakli kargo jogger shimlari. Zamonaviy ko'cha uslubi va baquvvat mato.",
    "descriptionRu": "Стильные брюки карго с накладными карманами и манжетами. Прочная хлопковая ткань.",
    "price": 270000,
    "oldPrice": 340000,
    "category": "pants",
    "image": "/products/btn-014.jpg",
    "sizes": [
      "29",
      "30",
      "31",
      "32",
      "34"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Urban",
    "createdAt": "2026-11-08T11:05:00Z"
  },
  {
    "id": "btn-015",
    "name": "Basic Crewneck Sweater",
    "nameRu": "Базовый свитер с круглым вырезом",
    "description": "Dumaloq yoqali asosiy (baza) sviter. Klassik shimlar yoki jinsi bilan a'lo darajada uyg'unlashadi.",
    "descriptionRu": "Базовый свитер с классическим круглым воротом. Отлично сочетается с брюками и джинсами.",
    "price": 230000,
    "oldPrice": 290000,
    "category": "hoodies",
    "image": "/products/btn-015.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Baza",
    "createdAt": "2026-11-08T11:10:00Z"
  },
  {
    "id": "btn-016",
    "name": "Suede Chelsea Boots",
    "nameRu": "Замшевые ботинки челси",
    "description": "Tabiiy zamshdan ishlangan Chelsi etiklari. Premium ko'rinish va o'ta qulay qolip.",
    "descriptionRu": "Элегантные мужские ботинки челси из натуральной замши на прочной подошве.",
    "price": 520000,
    "oldPrice": 650000,
    "category": "shoes",
    "image": "/products/btn-016.jpg",
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Premium",
    "createdAt": "2026-11-08T11:15:00Z"
  },
  {
    "id": "btn-017",
    "name": "Denim Jacket (Klassik Jinsi Kurtka)",
    "nameRu": "Классическая джинсовая куртка",
    "description": "Klassik ko'k denim jinsi kurtka. Har qanday zamonda o'z dolzarbligini yo'qotmaydigan must-have kiyim.",
    "descriptionRu": "Классическая мужская джинсовая куртка. Нестареющая база гардероба на каждый день.",
    "price": 410000,
    "oldPrice": 510000,
    "category": "jackets",
    "image": "/products/btn-017.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Xit",
    "createdAt": "2026-11-08T11:20:00Z"
  },
  {
    "id": "btn-018",
    "name": "Striped Short-Sleeve Polo",
    "nameRu": "Поло в полоску с коротким рукавом",
    "description": "Chiziqli qisqa yengli polo ko'ylak. Nafas oluvchi paxta matosi va premium detallar.",
    "descriptionRu": "Стильная рубашка-поло в тонкую полоску. Дышащий хлопок и качественная фурнитура.",
    "price": 195000,
    "oldPrice": 240000,
    "category": "polos",
    "image": "/products/btn-018.jpg",
    "sizes": [
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "isAvailable": true,
    "isFeatured": false,
    "badge": "Yangi",
    "createdAt": "2026-11-08T11:25:00Z"
  },
  {
    "id": "btn-019",
    "name": "Tailored Wool-Blend Trousers (Klassik shim)",
    "nameRu": "Классические шерстяные брюки со стрелками",
    "description": "Yun aralashmali klassik shim (strelkali). To'g'ri o'tiruvchi bichim, ofis va tantanalar uchun mos.",
    "descriptionRu": "Элегантные классические брюки со стрелками из полушерстяной ткани. Превосходная посадка.",
    "price": 310000,
    "oldPrice": 380000,
    "category": "pants",
    "image": "/products/btn-019.jpg",
    "sizes": [
      "30",
      "31",
      "32",
      "33",
      "34",
      "36"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Klassika",
    "createdAt": "2026-11-08T11:30:00Z"
  },
  {
    "id": "btn-020",
    "name": "Leather Belt & Minimalist Wallet Set",
    "nameRu": "Подарочный набор: Кожаный ремень и кошелек",
    "description": "Tabiiy charm kamar va minimalist hamyon (kardxolder) to'plami. Sovg'a uchun ideal qadoqda.",
    "descriptionRu": "Стильный мужской набор из натуральной кожи: ремень и компактный картхолдер-кошелек.",
    "price": 180000,
    "oldPrice": 230000,
    "category": "accessories",
    "image": "/products/btn-020.jpg",
    "sizes": [
      "Standart"
    ],
    "isAvailable": true,
    "isFeatured": true,
    "badge": "Sovg'abop",
    "createdAt": "2026-11-08T11:35:00Z"
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  "adminPin": "1234",
  "adminName": "Admin",
  "adminEmail": "admin@button.uz",
  "storeName": "BUTTON Men's Wear (button_uz)",
  "storeHandle": "@button_uz",
  "storeBioUz": "Zamonaviy erkaklar kiyimlari, poyabzal va aksessuarlar. Toshkent bo'ylab va O'zbekiston viloyatlariga tezkor yetkazib berish.",
  "storeBioRu": "Стильная мужская одежда, обувь и аксессуары. Быстрая доставка по Ташкенту и всем регионам Узбекистана.",
  "storeAvatar": "/btn-logo.png",
  "storeHeroBanner": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  "instagramUrl": "https://www.instagram.com/button_uz/",
  "telegramUrl": "https://t.me/button_uzbekistan",
  "phone1": "+998 94 613 55 55",
  "phone2": "+998 99 613 55 55",
  "workingHoursUz": "Har kuni 10:00 – 22:00 (dam olishsiz)",
  "workingHoursRu": "Ежедневно 10:00 – 22:00 (без выходных)",
  "wifiSsid": "BUTTON_GUEST",
  "wifiPassword": "buttonmenswear",
  "cardNumber": "8600 1234 5678 9999",
  "cardHolder": "BUTTON MEN WEAR LLC",
  "cardBank": "Kapitalbank (Uzcard)",
  "card2Number": "9860 1201 3344 7788",
  "card2Holder": "BUTTON MEN WEAR LLC",
  "card2Bank": "TBC Bank (Humo / Visa)",
  "card2Enabled": true,
  "branches": [
    {
      "id": "chilonzor",
      "name": "Chilonzor filiali",
      "nameRu": "Филиал Чиланзар",
      "address": "Toshkent sh., Chilonzor tumani, 16-mavze, Katta Qa'ni ko'chasi",
      "addressRu": "г. Ташкент, Чиланзарский р-н, 16-й квартал, ул. Катта Каъни",
      "landmark": "16-mavze savdo markazi yonida",
      "landmarkRu": "Рядом с ТЦ 16-го квартала",
      "phone": "+998 94 613 55 55",
      "workingHours": "10:00 – 22:00 (dam olishsiz)",
      "workingHoursRu": "10:00 – 22:00 (без выходных)",
      "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Chilonzor+16-mavze",
      "googleMap": "https://maps.google.com/?q=41.2715,69.1852",
      "coordinates": {
        "lat": 41.2715,
        "lng": 69.1852
      }
    },
    {
      "id": "yunusobod",
      "name": "Yunusobod filiali (Mega Planet yaqini)",
      "nameRu": "Филиал Юнусабад (около ТРЦ Mega Planet)",
      "address": "Toshkent sh., Yunusobod tumani, Ahmad Donish ko'chasi, Mega Planet yaqini",
      "addressRu": "г. Ташкент, Юнусабадский р-н, ул. Ахмада Дониша, около ТРЦ Mega Planet",
      "landmark": "Mega Planet savdo majmuasi yaqinida",
      "landmarkRu": "Ориентир: рядом с ТРЦ Mega Planet",
      "phone": "+998 99 613 55 55",
      "workingHours": "10:00 – 22:00 (dam olishsiz)",
      "workingHoursRu": "10:00 – 22:00 (без выходных)",
      "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Yunusobod+Mega+Planet",
      "googleMap": "https://maps.google.com/?q=41.3655,69.2882",
      "coordinates": {
        "lat": 41.3655,
        "lng": 69.2882
      }
    },
    {
      "id": "sergeli",
      "name": "Sergeli filiali",
      "nameRu": "Филиал Сергели",
      "address": "Toshkent sh., Sergeli tumani, Yangi Sergeli ko'chasi, Dehqon bozori hududi",
      "addressRu": "г. Ташкент, Сергелийский р-н, ул. Янги Сергели, район Дехканского рынка",
      "landmark": "Sergeli dehqon bozori va metro bekati yaqini",
      "landmarkRu": "Ориентир: рынок Сергели и станция метро",
      "phone": "+998 94 613 55 55",
      "workingHours": "10:00 – 22:00 (dam olishsiz)",
      "workingHoursRu": "10:00 – 22:00 (без выходных)",
      "yandexMap": "https://yandex.uz/maps/?text=Toshkent+Sergeli+bozor",
      "googleMap": "https://maps.google.com/?q=41.2238,69.2185",
      "coordinates": {
        "lat": 41.2238,
        "lng": 69.2185
      }
    }
  ],
  "telegramBotToken": "9177942848:AAH0ipLIRHVJTv6swun6d6_wvJoM_Fr1WL0",
  "telegramChatId": "-5308553299",
  "deliveryPriceTashkent": 30000,
  "deliveryFreeThresholdTashkent": 500000,
  "deliveryPriceRegions": 40000,
  "deliveryFreeThresholdRegions": 1000000,
  "comboDiscountPercent": 10,
  "globalPromoDiscountPercent": 0
};