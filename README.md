# BUTTON Men's Wear — Smart Bio-Page & Mini-Catalog

Fast, mobile-first Instagram link-in-bio web application and self-service mini-catalog built for **BUTTON Men's Wear (`@button_uz`)** in Tashkent, Uzbekistan.

---

## 🌟 Key Features

1. **Store Bio & Branch Hub:**
   - Real-time opening status indicator (Tashkent 10:00 – 23:00 live calculation).
   - Direct 1-tap call buttons for store phones (`+998 94 613 55 55` & `+998 99 613 55 55`).
   - Interactive showroom Wi-Fi helper (SSID: `BUTTON_GUEST`, Password: `buttonmenswear`).
   - 4 Tashkent Branch Hub with direct **Yandex Xarita** and **Google Maps** navigation links:
     - **Chilonzor-16:** 16-mavze, Katta Qa'ni ko'chasi
     - **Beruniy:** Beruniy metro, Korzinka supermarketi, 2-qavat
     - **Risoviy:** Mirobod tumani, Farg'ona yo'li, Risoviy bozori hududi
     - **Shahriston:** Yunusobod tumani, Shahriston metro chorrahasi
   - Instant language switch (**UZ** - Uzbek default & **RU** - Russian).
   - High-contrast Dark & Light mode.

2. **Self-Service Owner Admin Panel (`/admin`):**
   - Protected by simple Owner PIN (`ADMIN_PIN`, default `1234`).
   - Add, edit, toggle in-stock availability, or delete items.
   - Set prices in UZS, discount old price, and select clothing/shoe sizes.
   - Upload product photos directly or paste image URLs.
   - Live incoming customer orders tracker with status management (`new`, `confirmed`, `delivered`, `cancelled`).

3. **1-Click Customer Order & Branch Reservation Flow:**
   - Customer picks a product, selects size and quantity.
   - Chooses **Tashkent Delivery** (2-3 hours) or **Branch Pickup/Reservation** (choose from 4 branches).
   - Submits in 10 seconds with `+998` phone number.
   - Automatically sends formatted order alerts to the store owner's Telegram via Bot API, with zero-crash simulated fallback mode if tokens are not yet configured.

4. **24/7 AI Sales & Size Assistant:**
   - Interactive **Height (cm) & Weight (kg) Size Calculator** recommending exact fits (`S, M, L, XL, XXL, 3XL` and suit sizes `46–56`).
   - AI Chat answering branch locations, hours, delivery terms, and store policies.
   - Powered by **Google Gemini API** (`GEMINI_API_KEY`) with intelligent local heuristic NLP fallback.

---

## 🚀 Getting Started

### 1. Installation & Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or emulator.

### 2. Production Build

```bash
npm run build
npm run start
```

---

## 🔐 Environment Variables (`.env`)

Create a `.env` file in the project root:

```env
# Admin PIN (Default: 1234)
ADMIN_PIN=1234

# Telegram Bot Order Notifications (Optional)
TELEGRAM_BOT_TOKEN=7123456789:AA...
TELEGRAM_CHAT_ID=123456789

# Google Gemini AI Assistant (Optional - smart local engine active by default)
GEMINI_API_KEY=AIzaSy...
```

---

## 📱 Routes Overview

| Route | Description | Access |
|---|---|---|
| `/` | Mobile-first storefront bio-page & catalog | Public |
| `/admin` | Owner CMS dashboard & order tracker | Protected (PIN: `1234`) |
| `/api/products` | Catalog CRUD API | Public GET / Admin POST, PUT, DELETE |
| `/api/orders` | Customer checkout & order management | Public POST / Admin GET, PATCH |
| `/api/upload` | Product image upload handler | Admin PIN |
| `/api/ai-assistant`| 24/7 AI Stylist & sizing advisor | Public |
