# ROADMAP: @button_uz Smart Bio-Page & Mini-Catalog

## 1. Technical Stack & Architecture
- **Framework:** Next.js 16 (App Router with Turbopack & React 19)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4 (Modern, Mobile-First, Dark & Light Mode)
- **Icons:** Lucide React
- **Data & CMS Storage:** Local atomic JSON persistence (`data/products.json` & `data/orders.json`), pre-seeded with authentic men's wear inventory.
- **Image Management:** Direct Image URLs or local upload handler (`/api/upload` -> `public/uploads`).
- **Real-Time Notification Pipeline:** Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/sendMessage`) with Markdown v2/HTML formatting and graceful local fallback logging.
- **AI Sales & Size Stylist:** Google Gemini API (`gemini-1.5-flash` / Interactions) with built-in heuristic fallback engine strictly grounded in `@button_uz` store policies and sizing charts.
- **Internationalization:** Seamless bi-lingual toggle (Uzbek `UZ` - default, and Russian `RU`).

## 2. Store Profile & Verified Real Data
- **Brand:** BUTTON Men's Wear (`@button_uz`)
- **Instagram:** https://www.instagram.com/button_uz/
- **Working Hours:** Every day, 10:00 – 23:00 (Tashkent time UTC+5)
- **Contact Numbers:** `+998 94 613 55 55` & `+998 99 613 55 55`
- **4 Tashkent Branches:**
  1. **Chilonzor-16:** Chilonzor 16-mavze, Katta Qa'ni ko'chasi
  2. **Beruniy:** Beruniy metro bekati, Korzinka supermarketi, 2-qavat
  3. **Risoviy:** Mirobod tumani, Farg'ona yo'li, Risoviy bozori hududi
  4. **Shahriston:** Yunusobod tumani, Shahriston metro chorrahasi

## 3. Milestones & Implementation Progress

### Phase 1: Core Foundation & Storefront Architecture (Done)
- [x] Configure TypeScript models (`Product`, `Branch`, `Order`, `OrderItem`).
- [x] Store profile constants with verified branches, phones, Wi-Fi credentials, and seed catalog.
- [x] Storage manager (`src/lib/storage.ts`) with auto-seeding.

### Phase 2: Mobile-First Bio-Page Storefront (In Progress)
- [x] Brand identity header with live working status (Tashkent 10:00 - 23:00 real-time check).
- [x] Quick Action Buttons (Call, Instagram, Telegram, Showroom Wi-Fi / QR).
- [x] 4 Tashkent Branch Hub with Yandex Maps & Google Maps navigation links.
- [x] Responsive product catalog with category filter pills, search bar, and size badges.
- [x] Uzbek & Russian language switcher + Dark/Light mode support.

### Phase 3: 1-Click Fast Checkout & Telegram Integration
- [x] 1-Click order modal: Size selection, quantity counter, delivery vs. branch pickup selector.
- [x] Customer phone number formatting (`+998 XX XXX XX XX`).
- [x] Telegram Bot API notification engine formatting order details, total price, customer phone link.
- [x] Fallback order persistence so orders are never lost even if bot token is not configured.

### Phase 4: Self-Service Owner Admin Panel (`/admin`)
- [x] PIN-based authentication (`ADMIN_PIN`, default `1234`).
- [x] Catalog manager: Add, edit, toggle visibility, and delete products.
- [x] Image URL paste + local file upload helper.
- [x] Orders viewer: View incoming customer leads and update order statuses.
- [x] Quick metrics: Total products, active orders, revenue preview.

### Phase 5: 24/7 AI Sales & Size Assistant
- [x] Assistant widget grounded strictly on `@button_uz` knowledge base.
- [x] Interactive Height (cm) & Weight (kg) body sizing algorithm.
- [x] Gemini API integration with automatic fallback if key is omitted.

### Phase 6: Production Verification
- [x] Complete build check with zero TypeScript/lint errors.
- [x] Documentation & handover instructions.

## 4. Environment Variables Configuration (`.env.example`)
```env
# Admin Panel Security PIN (defaults to 1234 if empty)
ADMIN_PIN=1234

# Telegram Order Notifications (Optional - leaves demo log if unset)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# AI Stylist & Sales Assistant (Optional - uses smart rule engine if unset)
GEMINI_API_KEY=
```
