import { NextRequest, NextResponse } from "next/server";
import { getSettings, getProducts } from "@/lib/storage";

export type AssistantRequest = {
  message?: string;
  type?: "chat" | "size_recommendation";
  height?: number; // cm
  weight?: number; // kg
  category?: string;
  lang?: "uz" | "ru";
};

// Size calculation algorithm for men's apparel
function calculateMenSize(height: number, weight: number, category?: string): {
  apparelSize: string;
  suitSize: string;
  pantsSize: string;
  adviceUz: string;
  adviceRu: string;
} {
  let apparelSize = "L";
  let suitSize = "50";
  let pantsSize = "32";

  if (weight < 60) {
    apparelSize = "S";
    suitSize = "46";
    pantsSize = "29-30";
  } else if (weight < 72) {
    apparelSize = "M";
    suitSize = "48";
    pantsSize = "31-32";
  } else if (weight < 83) {
    apparelSize = "L";
    suitSize = "50";
    pantsSize = "32-33";
  } else if (weight < 95) {
    apparelSize = "XL";
    suitSize = "52";
    pantsSize = "34-36";
  } else if (weight < 108) {
    apparelSize = "2XL";
    suitSize = "54";
    pantsSize = "36";
  } else {
    apparelSize = "3XL";
    suitSize = "56";
    pantsSize = "38";
  }

  // Adjust for tall and slim or short and broad
  if (height > 185 && weight < 75) {
    apparelSize = "L (Slim Fit)";
    suitSize = "48-50 (uzun bo'y)";
  } else if (height < 170 && weight > 85) {
    apparelSize = "XL-2XL (Erkin bichim)";
    suitSize = "52-54";
  }

  const adviceUz = `Sizning bo'yingiz **${height} sm** va vazningiz **${weight} kg** ko'rsatkichlariga ko'ra tavsiya etiladigan o'lchamlar:\n\n` +
    `• 👕 **Futbolka, polo, xudi va kardiganlar:** **${apparelSize}**\n` +
    `• 🧥 **Kurtka, bomber va ustki kiyimlar:** **${apparelSize}**\n` +
    `• 👖 **Klassik shimlar va jinsilar:** **${pantsSize}** (kostyum uchun: **${suitSize}**)\n\n` +
    `💡 *Maslahat:* Agar kiyimni erkinroq (oversize) kiyishni yoqtirsangiz, bir o'lcham kattaroq olishingiz mumkin. Do'konimiz filiallarida bemalol kiyib ko'rish va o'lchash qulayliklari mavjud!`;

  const adviceRu = `Исходя из вашего роста **${height} см** и веса **${weight} кг** рекомендуемые размеры:\n\n` +
    `• 👕 **Футболки, поло, худи и кардиганы:** **${apparelSize}**\n` +
    `• 🧥 **Куртки, бомберы и верхняя одежда:** **${apparelSize}**\n` +
    `• 👖 **Брюки и джинсы:** **${pantsSize}** (для костюмов: **${suitSize}**)\n\n` +
    `💡 *Совет:* Если любите более свободную посадку (oversize), рекомендуем взять на размер больше. В наших шоурумах всегда можно комфортно примерить перед покупкой!`;

  return { apparelSize, suitSize, pantsSize, adviceUz, adviceRu };
}

// Extract height & weight from freeform user message if present
function extractHeightAndWeight(text: string): { height?: number; weight?: number } | null {
  const clean = text.toLowerCase();
  let height: number | undefined;
  let weight: number | undefined;

  // Patterns like "178 sm, 75 kg" or "bo'yim 180 vaznim 78" or "180/75"
  const hwMatch = clean.match(/(?:bo['`’]?y(?:im)?\s*[:=]?\s*(\d{2,3})|(\d{2,3})\s*(?:sm|см))\s*.*?(?:vazn(?:im)?\s*[:=]?\s*(\d{2,3})|(\d{2,3})\s*(?:kg|кг))/i);
  if (hwMatch) {
    height = Number(hwMatch[1] || hwMatch[2]);
    weight = Number(hwMatch[3] || hwMatch[4]);
  } else {
    // Check "180 / 75" or "180 75"
    const pairMatch = clean.match(/\b(1[5-9]\d|2[0-1]\d)\s*(?:sm|см)?\s*[\/,;|\s]\s*(\d{2,3})\s*(?:kg|кг)?\b/);
    if (pairMatch) {
      height = Number(pairMatch[1]);
      weight = Number(pairMatch[2]);
    }
  }

  if (height && weight && height >= 140 && height <= 220 && weight >= 40 && weight <= 180) {
    return { height, weight };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: AssistantRequest = await req.json();
    const lang = body.lang || "uz";
    const isUz = lang === "uz";
    const userMessage = body.message?.trim() || "";
    const lowerMsg = userMessage.toLowerCase();

    // 1. Direct Size Recommendation Flow
    if (body.type === "size_recommendation" && body.height && body.weight) {
      const calculation = calculateMenSize(body.height, body.weight, body.category);
      const text = isUz ? calculation.adviceUz : calculation.adviceRu;

      return NextResponse.json({
        success: true,
        reply: text,
        size: calculation.apparelSize,
        suitSize: calculation.suitSize,
      });
    }

    // Check if freeform text has height & weight
    const extractedHW = extractHeightAndWeight(lowerMsg);
    if (extractedHW && extractedHW.height && extractedHW.weight) {
      const calculation = calculateMenSize(extractedHW.height, extractedHW.weight);
      return NextResponse.json({
        success: true,
        reply: isUz ? calculation.adviceUz : calculation.adviceRu,
        size: calculation.apparelSize,
      });
    }

    // 2. Prepare Context for Chat with Live Settings & Active Products
    const settings = await getSettings();
    const products = await getProducts();
    const inStockProducts = products.filter((p) => p.isAvailable);

    const branchesList = settings.branches
      .map((b, i) => `${i + 1}. ${b.name}: ${b.address} (Mo'ljal: ${b.landmark}, Tel: ${b.phone})`)
      .join("\n");

    const catalogSummary = inStockProducts
      .slice(0, 20)
      .map((p) => `• ${p.name} — ${p.price.toLocaleString("uz-UZ")} so'm (O'lchamlar: ${p.sizes.join(", ")}, Kategoriya: ${p.category})`)
      .join("\n");

    const storeContext = `
Do'kon nomi: ${settings.storeName} (${settings.storeHandle}) — zamonaviy erkaklar kiyimlari, poyabzal va aksessuarlari brendi.
Ish vaqti: ${settings.workingHoursUz} (dam olish kunlarisiz, har kuni soat 10:00 dan 22:00 gacha).
Aloqa telefonlari: ${settings.phone1}, ${settings.phone2}.
Ijtimoiy tarmoqlar: Telegram (@button_uzbekistan), Instagram (@button_uz).
Filiallar (Toshkent shahrida):
${branchesList}

Yetkazib berish xizmati:
- Toshkent shahri bo'ylab: Yandex / BTS kuryer orqali 1-3 soatda eshikkacha tezkor yetkaziladi.
- O'zbekistonning barcha viloyatlariga: Pochta / BTS orqali 1-2 kunda yetkazib beriladi.

To'lov turlari:
- Click, Payme, Uzum Bank ilovalari orqali onlayn yoki karta raqamiga: ${settings.cardNumber} (${settings.cardHolder}, ${settings.cardBank}).
- Uzcard, Humo, Visa, Mastercard va naqd pul (kuryerga yoki filialda).

Almashtirish kafolati:
- Agar o'lcham (razmer) to'g'ri kelmasa, kiyilmagan va teglari saqlangan holatda 3 kun ichida istalgan filialimizda bepul almashtirib beriladi.

Hozirgi mavjud 20 ta mahsulot katalogi:
${catalogSummary}
`.trim();

    // 3. Check for GEMINI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (geminiKey) {
      try {
        const systemInstruction = `
Siz ${settings.storeName} (${settings.storeHandle}) erkaklar kiyimlari do'konining rasmiy, nihoyatda bilimdon va didli AI stilist maslahatchisisiz.
Siz mijozlarga quyidagi barcha sohalarda professional darajada yordam berasiz:
1. Erkaklar kiyinish uslubi, fasllar (bahor, yoz, kuz, qish), turli tadbirlar (to'y, tantana, ofis, biznes uchrashuv, romantik uchrashuv, kundalik casual, sport) uchun ideal obrazlar va ranglar uyg'unligi (color matching).
2. BUTTON do'konidagi mavjud 20 ta mahsulot narxi, o'lchamlari va ularni birlashtirib kiyish bo'yicha maslahatlar.
3. Bo'y va vaznga qarab o'lcham (razmer) aniqlash.
4. Do'kon ma'lumotlari: filiallar, ish vaqti, dostavka, to'lov usullari, almashtirish shartlari.
Mijoz qaysi tilda yozsa (${isUz ? "o'zbek" : "rus"}), o'sha tilda qisqa, tushunarli, didli va punktlar bilan chiroyli formatda javob bering.
`.trim();

        const prompt = `
Do'kon ma'lumotlari va katalog:
${storeContext}

Foydalanuvchi savoli:
"${userMessage}"

Javob ber:
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemInstruction },
                    { text: prompt },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.7,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({
              success: true,
              reply: candidateText.trim(),
              provider: "gemini",
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to smart local heuristic:", geminiError);
      }
    }

    // 4. Comprehensive Local Stylist & Store Knowledge Engine
    let reply = "";

    // A. TO'Y VA TANTANALAR / HASHAMATLI OBRAZ
    if (
      lowerMsg.includes("to'y") ||
      lowerMsg.includes("toy") ||
      lowerMsg.includes("marosim") ||
      lowerMsg.includes("tantana") ||
      lowerMsg.includes("oqshom") ||
      lowerMsg.includes("свадьб") ||
      lowerMsg.includes("торжеств") ||
      lowerMsg.includes("вечер")
    ) {
      reply = isUz
        ? `🤵 **To'y va Tantanalar uchun Mukammal Obraz:**\n\n` +
          `To'y va rasmiy marosimlarda erkak kishi jiddiy, hashamatli va qat'iyatli ko'rinishi lozim. Sizga quyidagi to'plamni tavsiya qilamiz:\n\n` +
          `• 👔 **Ustki qism:** Oq rangli **Oxford Long Sleeve Shirt** (250,000 so'm) va ustidan to'q ko'k yoki qora klassik kostyum.\n` +
          `• 👖 **Shim:** **Tailored Wool-Blend Trousers** (310,000 so'm) yoki to'q rangli **Classic Chino Pants** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** **Loro Piana Style Loafers** (zamsh, 450,000 so'm) yoki klassik charm tufli.\n` +
          `• 💼 **Aksessuar:** **Leather Belt & Minimalist Wallet Set** (180,000 so'm) — kamar rangi poyabzal bilan bir xil tusda bo'lishi didni ko'rsatadi!\n\n` +
          `Barcha o'lchamlar filiallarimizda mavjud, bemalol kiyib ko'rishingiz mumkin!`
        : `🤵 **Образ для свадьбы и торжественных событий:**\n\n` +
          `Для торжеств идеально подходит сдержанный, но благородный стиль:\n\n` +
          `• 👔 **Верх:** Белоснежная рубашка **Oxford Long Sleeve** (250 000 сум) под темно-синий или черный костюм.\n` +
          `• 👖 **Брюки:** Классические **Tailored Wool-Blend** (310 000 сум) или **Classic Chino** (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы в стиле **Loro Piana** (450 000 сум).\n` +
          `• 💼 **Аксессуар:** Комплект кожаного ремня и кошелька (180 000 сум).\n\n` +
          `Все модели есть в наличии в наших филиалах!`;

    // B. BIZNES, OFIS VA MUZOKARALAR
    } else if (
      lowerMsg.includes("biznes") ||
      lowerMsg.includes("ofis") ||
      lowerMsg.includes("ish") ||
      lowerMsg.includes("muzokara") ||
      lowerMsg.includes("suhbat") ||
      lowerMsg.includes("delov") ||
      lowerMsg.includes("офис") ||
      lowerMsg.includes("бизнес") ||
      lowerMsg.includes("переговор")
    ) {
      reply = isUz
        ? `💼 **Biznes va Ishchi Uchrashuvlar uchun Smart-Casual Obraz:**\n\n` +
          `Hamkorlar bilan muzokarada ishonchli va zamonaviy taassurot qoldirish uchun:\n\n` +
          `• 👕 **Ichki qatlam:** **Polo Collar Knitted Shirt** (220,000 so'm) yoki moviy rangli **Oxford Shirt** (250,000 so'm).\n` +
          `• 🧶 **Ustki qatlam:** **Classic Zip-Up Cardigan** (triko, 280,000 so'm) — ofisda qulay va nufuzli ko'rinish beradi.\n` +
          `• 👖 **Shim:** Qora yoki qaymoqrang **Classic Chino Pants** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** **Loro Piana Style Loafers** (450,000 so'm) yoki toza oq **White Leather Casual Sneakers** (390,000 so'm).\n\n` +
          `Bu kombinatsiya ham rasmiyatchilikni, ham kun davomida erkin harakatlanishni ta'minlaydi.`
        : `💼 **Деловой и офисный стиль (Smart Casual):**\n\n` +
          `• 👕 **Верх:** Трикотажное поло **Polo Collar Knitted** (220 000 сум) или голубая рубашка **Oxford** (250 000 сум).\n` +
          `• 🧶 **Слой:** Кардиган на молнии **Classic Zip-Up** (280 000 сум).\n` +
          `• 👖 **Низ:** Брюки **Classic Chino** черного или бежевого оттенка (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы (450 000 сум) или белые кожаные кеды (390 000 сум).`;

    // C. ROMANTIK UCHRASHUV / KECHKI TAOM
    } else if (
      lowerMsg.includes("romantik") ||
      lowerMsg.includes("uchrashuv") ||
      lowerMsg.includes("qiz bilan") ||
      lowerMsg.includes("kechki") ||
      lowerMsg.includes("restoran") ||
      lowerMsg.includes("kafe") ||
      lowerMsg.includes("свидани") ||
      lowerMsg.includes("ресторан")
    ) {
      reply = isUz
        ? `☕ **Romantik Uchrashuv va Kechki Taom Obrazi:**\n\n` +
          `Qiz bilan uchrashuvda qat'iy kostyum emas, balki didli va qulay ko'rinish eng to'g'ri tanlovdir:\n\n` +
          `• 👕 **Ustki qism:** **Basic Crewneck Sweater** (230,000 so'm) yoki **Polo Collar Knitted Shirt** (220,000 so'm).\n` +
          `• 🧥 **Tashqi qatlam:** Salqin havoda ustidan **Lightweight Bomber Jacket** (420,000 so'm) yoki **Denim Jacket** (410,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki to'q ko'k **Classic Straight Fit Jeans** (320,000 so'm).\n` +
          `• 👟 **Poyabzal:** Oq rangli **White Leather Casual Sneakers** (390,000 so'm) yoki zamsh loferlar.\n\n` +
          `Ushbu obraz yosh, zamonaviy va juda jozibador ko'rinish beradi!`
        : `☕ **Образ для свидания и вечернего ужина:**\n\n` +
          `• 👕 **Верх:** Вязаный свитер **Basic Crewneck** (230 000 сум) или трикотажное поло (220 000 сум).\n` +
          `• 🧥 **Верхняя одежда:** Легкий бомбер (420 000 сум) или джинсовая куртка (410 000 сум).\n` +
          `• 👖 **Джинсы:** Классические прямые джинсы **Straight Fit** (320 000 сум).\n` +
          `• 👟 **Обувь:** Белые кожаные кеды (390 000 сум).`;

    // D. KUNDALIK (CASUAL / STREETWEAR / ERKIN)
    } else if (
      lowerMsg.includes("kundalik") ||
      lowerMsg.includes("casual") ||
      lowerMsg.includes("streetwear") ||
      lowerMsg.includes("ko'cha") ||
      lowerMsg.includes("oddiy") ||
      lowerMsg.includes("qulay") ||
      lowerMsg.includes("povsednev") ||
      lowerMsg.includes("городск") ||
      lowerMsg.includes("кэжуал")
    ) {
      reply = isUz
        ? `🏙️ **Kundalik va Erkin (Urban Casual) Uslub:**\n\n` +
          `Har kuni kiyishga maksimal qulay va zamonaviy obraz:\n\n` +
          `• 👕 **Futbolka:** **Oversize Heavy Cotton T-Shirt** (160,000 so'm, zich paxta mato).\n` +
          `• 🧥 **Ustki kiyim:** **Puffer Vest** (yengsiz jiletka, 350,000 so'm) yoki **Half-Zip Fleece** (260,000 so'm).\n` +
          `• 👖 **Shim:** **Cargo Jogger Pants** (270,000 so'm) yoki **Classic Straight Fit Jeans** (320,000 so'm).\n` +
          `• 👟 **Poyabzal:** **White Leather Casual Sneakers** (390,000 so'm).\n\n` +
          `Har qanday ob-havoda o'zingizni erkin va zamonaviy his qilasiz!`
        : `🏙️ **Городской повседневный стиль (Casual / Streetwear):**\n\n` +
          `• 👕 **Футболка:** Плотный хлопок **Oversize Heavy Cotton** (160 000 сум).\n` +
          `• 🧥 **Жилетка:** Утепленный жилет **Puffer Vest** (350 000 сум) или флисовый свитшот (260 000 сум).\n` +
          `• 👖 **Брюки:** Джоггеры карго (270 000 сум) или прямые джинсы (320 000 сум).\n` +
          `• 👟 **Обувь:** Белые кожаные кеды (390 000 сум).`;

    // E. FASLLAR: BAHOR / KUZ / YOZ / QISH
    } else if (
      lowerMsg.includes("bahor") ||
      lowerMsg.includes("kuz") ||
      lowerMsg.includes("fasl") ||
      lowerMsg.includes("mavsum") ||
      lowerMsg.includes("vesn") ||
      lowerMsg.includes("osen") ||
      lowerMsg.includes("сезон")
    ) {
      reply = isUz
        ? `🍂 **Bahor va Kuzgi Mavsum uchun Eng Yaxshi Kiyimlarimiz:**\n\n` +
          `Havo o'zgaruvchan bo'lganda ko'p qavatli (layering) kiyinish tavsiya etiladi:\n\n` +
          `1. 🧥 **Lightweight Bomber Jacket** — 420,000 so'm (shamol va yomg'irdan himoya)\n` +
          `2. 🧥 **Denim Jacket** (Klassik jinsi kurtka) — 410,000 so'm\n` +
          `3. 🦺 **Puffer Vest** (Yengsiz jiletka) — 350,000 so'm (kardigan yoki xudi ustidan kiyishga a'lo)\n` +
          `4. 🧶 **Classic Zip-Up Cardigan** — 280,000 so'm (triko)\n` +
          `5. 🥾 **Suede Chelsea Boots** — 520,000 so'm (zamsh etiklar, suv o'tmas va juda issiq)\n\n` +
          `Katalogimizda barcha modellar mavjud, buyurtma bersangiz 1-3 soatda yetkazib beramiz!`
        : `🍂 **Весенне-осенняя коллекция BUTTON:**\n\n` +
          `• 🧥 Легкий бомбер **Lightweight Bomber** (420 000 сум)\n` +
          `• 🧥 Джинсовая куртка **Denim Jacket** (410 000 сум)\n` +
          `• 🦺 Утепленный жилет **Puffer Vest** (350 000 сум)\n` +
          `• 🧶 Трикотажный кардиган **Classic Zip-Up** (280 000 сум)\n` +
          `• 🥾 Замшевые челси **Suede Chelsea Boots** (520 000 сум).`;

    } else if (
      lowerMsg.includes("yoz") ||
      lowerMsg.includes("issiq") ||
      lowerMsg.includes("let") ||
      lowerMsg.includes("жар")
    ) {
      reply = isUz
        ? `☀️ **Yozgi Mavsum uchun Nafas Oluvchi Kiyimlar:**\n\n` +
          `Issiq kunlarda terlatmaydigan tabiiy matolardan kiyinish muhim:\n\n` +
          `• 🌿 **Summer Linen Set** (Zig'ir matoli ko'ylak va shim) — 440,000 so'm (engil va salqin saqlaydi)\n` +
          `• 👕 **Oversize Heavy Cotton T-Shirt** — 160,000 so'm (100% paxta)\n` +
          `• 👕 **Striped Short-Sleeve Polo** — 195,000 so'm\n` +
          `• 👞 **Loro Piana Style Loafers** — 450,000 so'm (yengil zamsh loferlar)\n\n` +
          `Barcha o'lchamlar filiallarimizda bor!`
        : `☀️ **Летняя дышащая коллекция BUTTON:**\n\n` +
          `• 🌿 Льняной комплект рубашка + брюки **Summer Linen Set** (440 000 сум)\n` +
          `• 👕 Футболка **Heavy Cotton** (160 000 сум, 100% хлопок)\n` +
          `• 👕 Поло в полоску **Striped Polo** (195 000 сум)\n` +
          `• 👞 Замшевые лоферы **Loro Piana Style** (450 000 сум).`;

    // F. RANGLAR UYG'UNLIGI
    } else if (
      lowerMsg.includes("rang") ||
      lowerMsg.includes("qora") ||
      lowerMsg.includes("oq") ||
      lowerMsg.includes("ko'k") ||
      lowerMsg.includes("mos keladimi") ||
      lowerMsg.includes("moslik") ||
      lowerMsg.includes("цвет") ||
      lowerMsg.includes("сочетан")
    ) {
      reply = isUz
        ? `🎨 **Kiyimlarda Ranglar Uyg'unligi (Color Harmony) Qoidalari:**\n\n` +
          `• 🖤 **Qora shim yoki jinsi bilan:** Oq futbolka, moviy ko'ylak, bej kardigan yoki kulrang sviter mukammal kontrast hosil qiladi.\n` +
          `• 🔵 **Moviy/Ko'k jinsi bilan:** Qaymoqrang, to'q yashil, oq yoki qora rangli kiyimlar eng chiroyli ko'rinadi.\n` +
          `• 🤎 **Bej / Chino shim bilan:** To'q ko'k polo, qora futbolka va jigarrang poyabzal ajoyib mos tushadi.\n` +
          `• 👞 **Oyoq kiyim va kamar qoidasi:** Kamar rangi poyabzal rangiga yaqin bo'lishi erkaklar uslubining asosiy qoidasidir!\n\n` +
          `Sizda aniq qaysi kiyim bor? Aytsangiz, unga eng mos narsani tanlab beraman!`
        : `🎨 **Правила цветовой гармонии:**\n\n` +
          `• 🖤 **К черным брюкам/джинсам:** Белый, бежевый, светло-серый и голубой верх.\n` +
          `• 🔵 **К синим джинсам:** Белый, оливковый, черный верх и белые кеды.\n` +
          `• 🤎 **К брюкам чинос (беж):** Темно-синее поло, черный верх и коричневая обувь.\n` +
          `• 👞 **Главное правило:** Цвет ремня должен гармонировать с цветом обуви!`;

    // G. O'LCHAM VA RAZMER
    } else if (
      lowerMsg.includes("razmer") ||
      lowerMsg.includes("o'lcham") ||
      lowerMsg.includes("razmeri") ||
      lowerMsg.includes("o'lchami") ||
      lowerMsg.includes("размер") ||
      lowerMsg.includes("рост") ||
      lowerMsg.includes("вес")
    ) {
      reply = isUz
        ? `📏 **To'g'ri O'lcham (Razmer)ni Tanlash:**\n\n` +
          `Sizga aniq razmeringizni aytib berishim uchun **bo'yingiz (sm)** va **vazningizni (kg)** yozing!\n\n` +
          `*Masalan:* "Bo'yim 178 sm, vaznim 75 kg" yoki "182/80".\n\n` +
          `**Umumiy o'lchamlarimiz:**\n` +
          `• Ustki kiyimlar va futbolkalar: **S, M, L, XL, 2XL**\n` +
          `• Shimlar: **29, 30, 31, 32, 33, 34, 36**\n` +
          `• Poyabzallar: **39, 40, 41, 42, 43, 44**\n\n` +
          `Agar o'lcham to'g'ri kelmasa, 3 kun ichida filiallarimizda bepul almashtirib beramiz!`
        : `📏 **Подбор правильного размера:**\n\n` +
          `Напишите ваш **рост (см)** и **вес (кг)**, например: *"178 см, 75 кг"* — и я мгновенно рассчитаю точный размер!\n\n` +
          `• Одежда: **S, M, L, XL, 2XL**\n` +
          `• Брюки и джинсы: **29–36**\n` +
          `• Обувь: **39–44**\n\n` +
          `Если размер не подойдет, у нас действует бесплатный обмен в течение 3 дней!`;

    // H. FILIALLAR VA LOKATSIYALAR
    } else if (
      lowerMsg.includes("filial") ||
      lowerMsg.includes("qayerda") ||
      lowerMsg.includes("adres") ||
      lowerMsg.includes("joylash") ||
      lowerMsg.includes("manzil") ||
      lowerMsg.includes("chilonzor") ||
      lowerMsg.includes("yunusobod") ||
      lowerMsg.includes("sergeli") ||
      lowerMsg.includes("mega planet") ||
      lowerMsg.includes("адрес") ||
      lowerMsg.includes("где") ||
      lowerMsg.includes("филиал")
    ) {
      const branchesTextUz = settings.branches
        .map((b, i) => `${i + 1}. 📍 **${b.name}:** ${b.address}\n   *(Mo'ljal: ${b.landmark}, Tel: ${b.phone})*`)
        .join("\n\n");
      const branchesTextRu = settings.branches
        .map((b, i) => `${i + 1}. 📍 **${b.nameRu || b.name}:** ${b.addressRu || b.address}\n   *(Ориентир: ${b.landmarkRu || b.landmark}, Тел: ${b.phone})*`)
        .join("\n\n");

      reply = isUz
        ? `📍 **Toshkent shahridagi BUTTON filiallari:**\n\n${branchesTextUz}\n\n` +
          `⏰ **Ish tartibi:** ${settings.workingHoursUz} (dam olish kunlarisiz, har kuni soat 10:00 dan 22:00 gacha).\n` +
          `Saytimizdagi "Filiallar" bo'limida Yandex va Google Xarita orqali 1-bosishda marshrut chizishingiz mumkin!`
        : `📍 **Наши филиалы в Ташкенте:**\n\n${branchesTextRu}\n\n` +
          `⏰ **Режим работы:** ${settings.workingHoursRu} (без выходных, ежедневно с 10:00 до 22:00).\n` +
          `В разделе "Филиалы" можно построить маршрут в Яндекс Картах!`;

    // I. ISH VAQTI
    } else if (
      lowerMsg.includes("vaqt") ||
      lowerMsg.includes("ish vaqt") ||
      lowerMsg.includes("ochiq") ||
      lowerMsg.includes("yopiq") ||
      lowerMsg.includes("soat nechagacha") ||
      lowerMsg.includes("график") ||
      lowerMsg.includes("время") ||
      lowerMsg.includes("работа") ||
      lowerMsg.includes("открыт")
    ) {
      reply = isUz
        ? `⏰ **BUTTON Do'konining Ish Vaqti:**\n\n` +
          `• Har kuni: **10:00 dan 22:00 gacha**\n` +
          `• Dam olish kunlarisiz uzluksiz ishlaydi (shanba va yakshanba kunlari ham ochiq)!\n\n` +
          `Saytimiz orqali esa 24/7 istalgan vaqtda onlayn buyurtma berishingiz mumkin.`
        : `⏰ **График работы BUTTON:**\n\n` +
          `• Ежедневно: **с 10:00 до 22:00**\n` +
          `• Без выходных (работаем в субботу и воскресенье)!\n\n` +
          `Онлайн-заказы на сайте принимаются круглосуточно 24/7.`;

    // J. YETKAZIB BERISH (DOSTAVKA)
    } else if (
      lowerMsg.includes("yetkaz") ||
      lowerMsg.includes("dostavka") ||
      lowerMsg.includes("dostav") ||
      lowerMsg.includes("kuryer") ||
      lowerMsg.includes("viloyat") ||
      lowerMsg.includes("pochta") ||
      lowerMsg.includes("доставк") ||
      lowerMsg.includes("привез")
    ) {
      reply = isUz
        ? `🚚 **Yetkazib Berish Xizmati (Dostavka):**\n\n` +
          `• 🏎️ **Toshkent shahri bo'ylab:** Yandex / BTS kuryerlik orqali **1-3 soat ichida** to'g'ridan-to'g'ri eshikkacha yetkazib beriladi.\n` +
          `• 📦 **O'zbekistonning barcha viloyatlariga:** Pochta / kuryerlik orqali **1-2 ish kunida** xavfsiz yetkaziladi.\n\n` +
          `Buyurtma berish uchun saytimizda xohlagan kiyimingizni tanlab, "Tezkor buyurtma" yoki "Savatga" tugmasini bosing!`
        : `🚚 **Условия доставки:**\n\n` +
          `• 🏎️ **По Ташкенту:** Экспресс-доставка через Яндекс / BTS за **1–3 часа** до двери.\n` +
          `• 📦 **По регионам Узбекистана:** Почтовая доставка за **1–2 рабочих дня**.\n\n` +
          `Для оформления просто выберите понравившуюся модель в каталоге и оформите заказ!`;

    // K. TO'LOV VA KARTA
    } else if (
      lowerMsg.includes("to'lov") ||
      lowerMsg.includes("karta") ||
      lowerMsg.includes("click") ||
      lowerMsg.includes("payme") ||
      lowerMsg.includes("uzum") ||
      lowerMsg.includes("naqd") ||
      lowerMsg.includes("оплат") ||
      lowerMsg.includes("карт")
    ) {
      reply = isUz
        ? `💳 **To'lov Usullari:**\n\n` +
          `Bizda barcha qulay to'lov turlari mavjud:\n\n` +
          `• 🔵 **Click** (ilovaga 1-bosishda o'tish yoki karta orqali)\n` +
          `• 🟢 **Payme** (ilovaga 1-bosishda o'tish)\n` +
          `• 🟣 **Uzum Bank** (tezkor o'tkazma)\n` +
          `• 💳 **Uzcard, Humo, Visa, Mastercard**\n` +
          `• 💵 **Naqd pul** (kuryerga qabul qilganda yoki filialda)\n\n` +
          `Karta raqamimiz: **${settings.cardNumber}** (${settings.cardHolder}, ${settings.cardBank}).`
        : `💳 **Способы оплаты:**\n\n` +
          `• 🔵 **Click** (переход в приложение в 1 клик)\n` +
          `• 🟢 **Payme** (переход в приложение в 1 клик)\n` +
          `• 🟣 **Uzum Bank** (быстрый перевод)\n` +
          `• 💳 **Uzcard, Humo, Visa, Mastercard**\n` +
          `• 💵 **Наличные** курьеру при получении или в филиале.\n\n` +
          `Номер карты: **${settings.cardNumber}** (${settings.cardHolder}).`;

    // L. ALMASHTIRISH VA KAFOLAT
    } else if (
      lowerMsg.includes("almashtir") ||
      lowerMsg.includes("qaytar") ||
      lowerMsg.includes("garantiya") ||
      lowerMsg.includes("kafolat") ||
      lowerMsg.includes("обмен") ||
      lowerMsg.includes("возврат")
    ) {
      reply = isUz
        ? `🔄 **Kafolat va Almashtirish Shartlari:**\n\n` +
          `Agar xarid qilgan kiyimingiz o'lchami yoki modeli to'g'ri kelmasa:\n` +
          `• Mahsulot kiyilmagan va teglari butun holatda bo'lsa, **3 kun ichida** istalgan filialimizda uni boshqa o'lchamga yoki boshqa kiyimga bepul almashtirib beramiz!\n\n` +
          `Biz uchun xaridorlarimizning mamnunligi birinchi o'rinda turadi.`
        : `🔄 **Гарантия и обмен:**\n\n` +
          `Если вещь не подошла по размеру:\n` +
          `• При сохранении товарного вида и бирок в течение **3 дней** вы можете бесплатно обменять товар на нужный размер в любом из наших филиалов!`;

    // M. ALOQA VA TELEFONLAR
    } else if (
      lowerMsg.includes("telefon") ||
      lowerMsg.includes("nomer") ||
      lowerMsg.includes("kontakt") ||
      lowerMsg.includes("aloqa") ||
      lowerMsg.includes("telegram") ||
      lowerMsg.includes("instagram") ||
      lowerMsg.includes("номер") ||
      lowerMsg.includes("телефон")
    ) {
      reply = isUz
        ? `📞 **Biz bilan Bog'lanish:**\n\n` +
          `• 📱 Telefonlar: **${settings.phone1}** / **${settings.phone2}**\n` +
          `• 💬 Telegram: **@button_uzbekistan**\n` +
          `• 📸 Instagram: **@button_uz**\n\n` +
          `Savollaringiz bo'lsa xodimlarimiz doimo javob berishga tayyor!`
        : `📞 **Контакты BUTTON:**\n\n` +
          `• 📱 Телефоны: **${settings.phone1}** / **${settings.phone2}**\n` +
          `• 💬 Telegram: **@button_uzbekistan**\n` +
          `• 📸 Instagram: **@button_uz**`;

    // N. MAHSULOTLAR VA NARXLAR / KATALOG
    } else if (
      lowerMsg.includes("mahsulot") ||
      lowerMsg.includes("katalog") ||
      lowerMsg.includes("nima bor") ||
      lowerMsg.includes("kurtka") ||
      lowerMsg.includes("futbolka") ||
      lowerMsg.includes("shim") ||
      lowerMsg.includes("jinsi") ||
      lowerMsg.includes("poyabzal") ||
      lowerMsg.includes("lofer") ||
      lowerMsg.includes("krossovka") ||
      lowerMsg.includes("jiletka") ||
      lowerMsg.includes("kardigan") ||
      lowerMsg.includes("tovar") ||
      lowerMsg.includes("каталог")
    ) {
      reply = isUz
        ? `🛍️ **BUTTON Do'konidagi Ommabop Mahsulotlar:**\n\n` +
          `• 🧥 **Lightweight Bomber Jacket** — 420,000 so'm (M, L, XL, 2XL)\n` +
          `• 🧶 **Classic Zip-Up Cardigan** — 280,000 so'm (Triko)\n` +
          `• 👖 **Classic Straight Fit Jeans** — 320,000 so'm (29-36)\n` +
          `• 👞 **Loro Piana Style Loafers** — 450,000 so'm (Zamsh, 39-44)\n` +
          `• 👟 **White Leather Casual Sneakers** — 390,000 so'm (40-44)\n` +
          `• 👕 **Oversize Heavy Cotton T-Shirt** — 160,000 so'm (S-XL)\n` +
          `• 🦺 **Puffer Vest** (Yengsiz Jiletka) — 350,000 so'm\n` +
          `• 🥾 **Suede Chelsea Boots** — 520,000 so'm\n\n` +
          `Barcha 20 ta mahsulotni saytimizdagi "Katalog" bo'limida ko'rishingiz va 1-bosishda buyurtma berishingiz mumkin!`
        : `🛍️ **Популярные товары в BUTTON:**\n\n` +
          `• 🧥 Бомбер **Lightweight Bomber** — 420 000 сум\n` +
          `• 🧶 Кардиган **Classic Zip-Up** — 280 000 сум\n` +
          `• 👖 Джинсы **Straight Fit** — 320 000 сум\n` +
          `• 👞 Лоферы **Loro Piana Style** — 450 000 сум\n` +
          `• 👟 Кеды **White Leather Casual** — 390 000 сум\n` +
          `• 👕 Футболка **Heavy Cotton** — 160 000 сум\n\n` +
          `Полный каталог доступен в разделе "Каталог" на нашем сайте!`;

    // O. DEFAULT / WELCOME ASSISTANT
    } else {
      reply = isUz
        ? `Assalomu alaykum! Men **${settings.storeName}** AI stilist va do'kon maslahatchisiman 👔\n\n` +
          `Sizga quyidagi masalalarda to'liq yordam bera olaman:\n` +
          `• 🤵 **Kiyinish maslahatlari:** To'y, ofis, romantik uchrashuv yoki kundalik obrazlar\n` +
          `• 🎨 **Ranglar uyg'unligi:** Qaysi kiyim bilan nima mos keladi\n` +
          `• 📏 **O'lcham hisoblash:** Bo'yingiz va vazningizni aytsangiz, aniq razmerni aytaman\n` +
          `• 📍 **Do'kon filiallari:** Toshkentdagi 3 ta filialimiz manzillari va ish vaqti\n` +
          `• 🚚 **Yetkazib berish va to'lov:** Toshkent va viloyatlarga dostavka shartlari\n\n` +
          `Savolingizni yozing, bajonidil yordam beraman!`
        : `Здравствуйте! Я персональный AI-стилист и консультант **${settings.storeName}** 👔\n\n` +
          `Чем могу вам помочь:\n` +
          `• 🤵 **Стиль и образы:** Подбор на свадьбу, в офис, на свидание или на каждый день\n` +
          `• 🎨 **Цветовые сочетания:** Что с чем гармонирует\n` +
          `• 📏 **Подбор размера:** Назовите рост и вес — я рассчитаю размер\n` +
          `• 📍 **Филиалы и график:** 3 филиала в Ташкенте и время работы\n` +
          `• 🚚 **Доставка и оплата:** Условия по Ташкенту и всему Узбекистану\n\n` +
          `Задайте интересующий вас вопрос!`;
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: "heuristic",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
