import { NextRequest, NextResponse } from "next/server";
import { getSettings, getProducts } from "@/lib/storage";

export type AssistantRequest = {
  message?: string;
  type?: "chat" | "size_recommendation";
  height?: number; // cm
  weight?: number; // kg
  category?: string;
  lang?: "uz" | "ru";
  history?: Array<{ sender: "user" | "bot"; text: string }>;
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

  const hwMatch = clean.match(/(?:bo['`’]?y(?:im)?\s*[:=]?\s*(\d{2,3})|(\d{2,3})\s*(?:sm|см))\s*.*?(?:vazn(?:im)?\s*[:=]?\s*(\d{2,3})|(\d{2,3})\s*(?:kg|кг))/i);
  if (hwMatch) {
    height = Number(hwMatch[1] || hwMatch[2]);
    weight = Number(hwMatch[3] || hwMatch[4]);
  } else {
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

    // 3. Check for GEMINI API KEY (from environment variable or store settings)
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || settings.geminiApiKey?.trim();

    if (geminiKey) {
      try {
        const systemInstruction = `
Siz ${settings.storeName} (${settings.storeHandle}) erkaklar kiyimlari do'konining haqiqiy, aqlli, do'stona va tajribali professional AI stilist maslahatchisisiz.
Foydalanuvchi siz bilan erkin muloqot qiladi (salomlashish, hazil, kiyim tanlash, tadbirlar, o'lcham, narx, manzil va h.k.).
Har qanday savolga insondek, samimiy, xushmuomala, jonli va professional javob bering.

Qoidalaringiz:
1. Agar foydalanuvchi biror tadbirga (masalan do'stining tug'ilgan kuni, to'y, ofis, romantik kecha, shahar aylanish) nima kiyishni so'rasa, tadbirga mos mukammal obraz va ranglar uyg'unligini tuzib bering va iloji boricha BUTTON do'konidagi kiyimlarni (kardigan, bomber, jinsi, Oxford ko'ylak, zamsh lofer, krossovka, jiletka, chelsea etik) tavsiya qiling.
2. Agar foydalanuvchi "sen jonlimisan", "odammsanmi" yoki "kim bu" deb so'rasa, o'zingizni BUTTON Men's Wear do'koni uchun yaratilgan sun'iy intellekt (AI) stilisti ekanligingizni xushmuomala tushuntiring.
3. Agar foydalanuvchi salomlashsa ("salom", "assalomu alaykum", "qalaysan"), samimiy salomlashib, bugun qanday kiyim yoki maslahat kerakligini so'rang.
4. Agar foydalanuvchi bo'yi va vaznini aytsa, aniq o'lchamlarni hisoblab bering (S, M, L, XL, 2XL; shimlar 29-36).
5. Do'kon ma'lumotlari:
- Do'kon: ${settings.storeName} (${settings.storeHandle})
- Filiallar: ${branchesList}
- Ish vaqti: ${settings.workingHoursUz} (Har kuni 10:00 dan 22:00 gacha, dam olishsiz).
- Telefonlar: ${settings.phone1}, ${settings.phone2}. Telegram: @button_uzbekistan, Instagram: @button_uz.
- Yetkazib berish: Toshkent bo'ylab 1-3 soatda (Yandex/BTS), barcha viloyatlarga 1-2 kunda pochta orqali.
- To'lov: Click, Payme, Uzum, Uzcard, Humo, naqd pul.
- Almashtirish: O'lcham to'g'ri kelmasa 3 kun ichida filialda almashtirib beriladi.
- Mahsulotlar:
${catalogSummary}

Mijoz qaysi tilda yozsa (${isUz ? "o'zbek" : "rus"}), o'sha tilda javob bering. O'zbek tilida erkin, jonli, tabiiy va punktlar bilan chiroyli formatda javob bering.
`.trim();

        // Build multi-turn contents
        const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(body.history)) {
          for (const item of body.history) {
            if (item && item.text && typeof item.text === "string") {
              contents.push({
                role: item.sender === "user" ? "user" : "model",
                parts: [{ text: item.text }],
              });
            }
          }
        }

        contents.push({
          role: "user",
          parts: [{ text: userMessage }],
        });

        // Try gemini-1.5-flash with system_instruction
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents,
              generationConfig: {
                maxOutputTokens: 750,
                temperature: 0.75,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({
              success: true,
              reply: candidateText.trim(),
              provider: "gemini",
            });
          }
        } else {
          // Try gemini-2.0-flash fallback
          const gemini2Res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemInstruction }],
                },
                contents,
                generationConfig: {
                  maxOutputTokens: 750,
                  temperature: 0.75,
                },
              }),
            }
          );
          if (gemini2Res.ok) {
            const gemini2Data = await gemini2Res.json();
            const candidateText2 = gemini2Data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText2) {
              return NextResponse.json({
                success: true,
                reply: candidateText2.trim(),
                provider: "gemini-2",
              });
            }
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to local NLP engine:", geminiError);
      }
    }

    // 4. Intelligent Conversational NLP Engine (Contextual, No Substring Collisions)
    let reply = "";

    // A. SALOM / GREETINGS (Precise regex)
    if (/^(salom|assalom|assalomu alaykum|qalaysiz|qalesiz|qalesan|privet|hi|hello|hayrli kun)\b/i.test(lowerMsg)) {
      reply = isUz
        ? `Assalomu alaykum! Xush kelibsiz! Men **BUTTON Men's Wear** do'konining shaxsiy stilist maslahatchisiman 👔\n\n` +
          `Bugun sizga qanday maslahat yoki kiyim kerak? Masalan, biror tadbirga obraz tanlashimiz, o'lchamingizni hisoblab berishim yoki do'kondagi kiyimlar haqida ma'lumot berishim mumkin!`
        : `Здравствуйте! Добро пожаловать! Я персональный AI-стилист **BUTTON Men's Wear** 👔\n\n` +
          `Чем могу вам помочь? Могу подобрать стильный образ для любого события, рассчитать ваш размер или рассказать о наличии товаров в шоурумах!`;

    // B. JONLIMISAN / KIM BU / AI SAVOLLARI
    } else if (
      lowerMsg.includes("jonlimisan") ||
      lowerMsg.includes("tirikmisan") ||
      lowerMsg.includes("odammi") ||
      lowerMsg.includes("odammisan") ||
      lowerMsg.includes("sen kimsan") ||
      lowerMsg.includes("kimsan") ||
      lowerMsg.includes("botmisan") ||
      lowerMsg.includes("robot") ||
      lowerMsg.includes("живой") ||
      lowerMsg.includes("ты кто")
    ) {
      reply = isUz
        ? `Men **BUTTON Men's Wear** erkaklar kiyimlari do'koni uchun maxsus ishlab chiqilgan sun'iy intellekt (AI) stilist maslahatchisiman 🤖👔\n\n` +
          `Men tirik inson emasman, lekin erkaklar modasi, kiyimlar uyg'unligi, o'lcham tanlash va do'konimiz mahsulotlari bo'yicha professional maslahat bera olaman.\n\n` +
          `Sizga bugun qanday kiyim yoki obraz tanlashda yordam beray?`
        : `Я персональный искусственный интеллект (AI-стилист), созданный специально для магазина **BUTTON Men's Wear** 🤖👔\n\n` +
          `Я помогаю подобрать идеальный мужской гардероб, рассчитать размер по росту и весу, а также ответить на любые вопросы о покупках и доставке!`;

    // C. TUG'ILGAN KUN / BAYRAM / O'RTOG'IMNING TO'YI / ZIYOFAT
    } else if (
      lowerMsg.includes("tug'ilgan kun") ||
      lowerMsg.includes("tugilgan kun") ||
      lowerMsg.includes("tug'ilgan") ||
      lowerMsg.includes("tugilgan") ||
      lowerMsg.includes("birthday") ||
      lowerMsg.includes("yubiley") ||
      lowerMsg.includes("ziyofat") ||
      lowerMsg.includes("bayram") ||
      lowerMsg.includes("o'rtog'im") ||
      lowerMsg.includes("ortogim") ||
      lowerMsg.includes("do'stim") ||
      lowerMsg.includes("день рождения")
    ) {
      reply = isUz
        ? `🎉 **O'rtog'ingizning Tug'ilgan Kuni uchun Ajoyib Obraz:**\n\n` +
          `Tug'ilgan kun va bayram kechalarida ortiqcha rasmiy bo'lmagan, lekin juda didli va qimmat ko'rinadigan **Smart-Casual** uslub eng ma'qul tanlovdir:\n\n` +
          `• 👕 **Ustki qism:** Moviy yoki oq **Oxford Long Sleeve Shirt** (250,000 so'm) yoki nafis to'qilgan **Polo Collar Knitted Shirt** (220,000 so'm).\n` +
          `• 🧥 **Ikkinchi qatlam (salqin havoda):** Ustidan yengil **Lightweight Bomber Jacket** (420,000 so'm) yoki trikotaj **Classic Zip-Up Cardigan** (280,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki bej **Classic Chino Pants** (290,000 so'm) yoki to'g'ri bichimli qora **Classic Straight Fit Jeans** (320,000 so'm).\n` +
          `• 👞 **Poyabzal:** Zamsh **Loro Piana Style Loafers** (450,000 so'm) yoki toza oq charm **White Leather Casual Sneakers** (390,000 so'm).\n\n` +
          `Bu kombinatsiya do'stlar davrasida ham erkin, ham juda nufuzli ko'rinishingizni ta'minlaydi!`
        : `🎉 **Образ на день рождения друга:**\n\n` +
          `Для вечеринки и дня рождения лучше всего подходит стиль **Smart-Casual**:\n\n` +
          `• 👕 **Верх:** Рубашка **Oxford Long Sleeve** (250 000 сум) или стильное трикотажное поло (220 000 сум).\n` +
          `• 🧥 **Слой:** Легкий бомбер (420 000 сум) или кардиган на молнии (280 000 сум).\n` +
          `• 👖 **Низ:** Брюки **Classic Chino** (290 000 сум) или прямые джинсы (320 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы (450 000 сум) или белые кожаные кеды (390 000 сум).`;

    // D. TO'Y VA TANTANALAR
    } else if (
      lowerMsg.includes("to'y") ||
      lowerMsg.includes("toy") ||
      lowerMsg.includes("marosim") ||
      lowerMsg.includes("tantana") ||
      lowerMsg.includes("oqshom") ||
      lowerMsg.includes("свадьб") ||
      lowerMsg.includes("торжеств")
    ) {
      reply = isUz
        ? `🤵 **To'y va Tantanalar uchun Mukammal Obraz:**\n\n` +
          `To'y va rasmiy marosimlarda erkak kishi jiddiy, hashamatli va qat'iyatli ko'rinishi lozim:\n\n` +
          `• 👔 **Ustki qism:** Oq rangli **Oxford Long Sleeve Shirt** (250,000 so'm) va to'q ko'k yoki qora klassik kostyum.\n` +
          `• 👖 **Shim:** **Tailored Wool-Blend Trousers** (310,000 so'm) yoki **Classic Chino Pants** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** **Loro Piana Style Loafers** (zamsh, 450,000 so'm) yoki klassik charm tufli.\n` +
          `• 💼 **Aksessuar:** **Leather Belt & Minimalist Wallet Set** (180,000 so'm).\n\n` +
          `Barcha o'lchamlar filiallarimizda mavjud, bemalol kiyib ko'rishingiz mumkin!`
        : `🤵 **Образ для свадьбы и торжеств:**\n\n` +
          `• 👔 **Верх:** Белоснежная рубашка **Oxford Long Sleeve** (250 000 сум) под темно-синий костюм.\n` +
          `• 👖 **Брюки:** Классические **Tailored Wool-Blend** (310 000 сум) или **Classic Chino** (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы **Loro Piana Style** (450 000 сум).\n` +
          `• 💼 **Аксессуар:** Комплект кожаного ремня и портмоне (180 000 сум).`;

    // E. BIZNES, OFIS, ISH UCHRASHUVI (Word boundary check)
    } else if (
      /\b(biznes|ofis|delovoy|muzokara|suhbat|suhbati)\b/i.test(lowerMsg) ||
      lowerMsg.includes("ishga") ||
      lowerMsg.includes("ish joyi") ||
      lowerMsg.includes("ish kiyimi")
    ) {
      reply = isUz
        ? `💼 **Biznes va Ofis uchun Smart-Casual Obraz:**\n\n` +
          `• 👕 **Ichki qatlam:** **Polo Collar Knitted Shirt** (220,000 so'm) yoki moviy rangli **Oxford Shirt** (250,000 so'm).\n` +
          `• 🧶 **Ustki qatlam:** **Classic Zip-Up Cardigan** (triko, 280,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki qaymoqrang **Classic Chino Pants** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** **Loro Piana Style Loafers** (450,000 so'm) yoki toza oq **White Leather Casual Sneakers** (390,000 so'm).`
        : `💼 **Деловой офисный стиль (Smart Casual):**\n\n` +
          `• 👕 **Верх:** Поло **Polo Collar Knitted** (220 000 сум) или рубашка **Oxford** (250 000 сум).\n` +
          `• 🧶 **Слой:** Кардиган **Classic Zip-Up** (280 000 сум).\n` +
          `• 👖 **Низ:** Брюки **Classic Chino** (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы (450 000 сум) или белые кеды (390 000 сум).`;

    // F. ROMANTIK UCHRASHUV / KECHKI TAOM
    } else if (
      lowerMsg.includes("romantik") ||
      lowerMsg.includes("uchrashuv") ||
      lowerMsg.includes("qiz bilan") ||
      lowerMsg.includes("kechki") ||
      lowerMsg.includes("restoran") ||
      lowerMsg.includes("kafe") ||
      lowerMsg.includes("свидани")
    ) {
      reply = isUz
        ? `☕ **Romantik Uchrashuv Obrazi:**\n\n` +
          `• 👕 **Ustki qism:** **Basic Crewneck Sweater** (230,000 so'm) yoki **Polo Collar Knitted Shirt** (220,000 so'm).\n` +
          `• 🧥 **Tashqi qatlam:** **Lightweight Bomber Jacket** (420,000 so'm) yoki **Denim Jacket** (410,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki to'q ko'k **Classic Straight Fit Jeans** (320,000 so'm).\n` +
          `• 👟 **Poyabzal:** Oq rangli **White Leather Casual Sneakers** (390,000 so'm).`
        : `☕ **Образ для свидания и ужина:**\n\n` +
          `• 👕 **Верх:** Свитер **Basic Crewneck** (230 000 сум) или трикотажное поло (220 000 сум).\n` +
          `• 🧥 **Куртка:** Бомбер (420 000 сум) или джинсовая куртка (410 000 сум).\n` +
          `• 👖 **Джинсы:** Прямые джинсы **Straight Fit** (320 000 сум).\n` +
          `• 👟 **Обувь:** Белые кожаные кеды (390 000 сум).`;

    // G. FASLLAR: BAHOR / KUZ / YOZ / QISH
    } else if (
      lowerMsg.includes("bahor") ||
      lowerMsg.includes("kuz") ||
      lowerMsg.includes("mavsum") ||
      lowerMsg.includes("vesn") ||
      lowerMsg.includes("osen")
    ) {
      reply = isUz
        ? `🍂 **Bahor va Kuzgi Mavsum Kiyimlarimiz:**\n\n` +
          `1. 🧥 **Lightweight Bomber Jacket** — 420,000 so'm\n` +
          `2. 🧥 **Denim Jacket** (Klassik jinsi kurtka) — 410,000 so'm\n` +
          `3. 🦺 **Puffer Vest** (Yengsiz jiletka) — 350,000 so'm\n` +
          `4. 🧶 **Classic Zip-Up Cardigan** — 280,000 so'm\n` +
          `5. 🥾 **Suede Chelsea Boots** — 520,000 so'm (zamsh etiklar)`
        : `🍂 **Весенне-осенняя коллекция BUTTON:**\n\n` +
          `• 🧥 Бомбер **Lightweight Bomber** (420 000 сум)\n` +
          `• 🧥 Джинсовая куртка **Denim Jacket** (410 000 сум)\n` +
          `• 🦺 Жилетка **Puffer Vest** (350 000 сум)\n` +
          `• 🧶 Кардиган **Classic Zip-Up** (280 000 сум)\n` +
          `• 🥾 Замшевые челси **Suede Chelsea Boots** (520 000 сум).`;

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
      lowerMsg.includes("адрес") ||
      lowerMsg.includes("где") ||
      lowerMsg.includes("филиал")
    ) {
      const branchesTextUz = settings.branches
        .map((b, i) => `${i + 1}. 📍 **${b.name}:** ${b.address}\n   *(Mo'ljal: ${b.landmark}, Tel: ${b.phone})*`)
        .join("\n\n");
      reply = isUz
        ? `📍 **Toshkent shahridagi BUTTON filiallari:**\n\n${branchesTextUz}\n\n` +
          `⏰ **Ish tartibi:** ${settings.workingHoursUz} (dam olish kunlarisiz, har kuni soat 10:00 dan 22:00 gacha).`
        : `📍 **Наши филиалы в Ташкенте:**\n\n${branchesList}\n\n` +
          `⏰ **Режим работы:** ${settings.workingHoursRu} (без выходных, ежедневно с 10:00 до 22:00).`;

    // I. ISH VAQTI
    } else if (
      lowerMsg.includes("vaqt") ||
      lowerMsg.includes("ish vaqt") ||
      lowerMsg.includes("ochiq") ||
      lowerMsg.includes("yopiq") ||
      lowerMsg.includes("soat nechagacha") ||
      lowerMsg.includes("время") ||
      lowerMsg.includes("график")
    ) {
      reply = isUz
        ? `⏰ **BUTTON Do'konining Ish Vaqti:**\n\n` +
          `• Har kuni: **10:00 dan 22:00 gacha**\n` +
          `• Dam olish kunlarisiz uzluksiz ishlaydi (shanba va yakshanba kunlari ham ochiq)!`
        : `⏰ **График работы BUTTON:**\n\n` +
          `• Ежедневно: **с 10:00 до 22:00** (без выходных).`;

    // J. YETKAZIB BERISH (DOSTAVKA)
    } else if (
      lowerMsg.includes("yetkaz") ||
      lowerMsg.includes("dostavka") ||
      lowerMsg.includes("kuryer") ||
      lowerMsg.includes("viloyat") ||
      lowerMsg.includes("доставк")
    ) {
      reply = isUz
        ? `🚚 **Yetkazib Berish Xizmati (Dostavka):**\n\n` +
          `• 🏎️ **Toshkent shahri bo'ylab:** Yandex / BTS kuryerlik orqali **1-3 soat ichida** eshikkacha yetkazib beriladi.\n` +
          `• 📦 **O'zbekistonning barcha viloyatlariga:** Pochta / kuryerlik orqali **1-2 ish kunida** xavfsiz yetkaziladi.`
        : `🚚 **Условия доставки:**\n\n` +
          `• 🏎️ **По Ташкенту:** Доставка за **1–3 часа** до двери.\n` +
          `• 📦 **По регионам Узбекистана:** Почтовая доставка за **1–2 рабочих дня**.`;

    // K. TO'LOV VA KARTA
    } else if (
      lowerMsg.includes("to'lov") ||
      lowerMsg.includes("karta") ||
      lowerMsg.includes("click") ||
      lowerMsg.includes("payme") ||
      lowerMsg.includes("uzum") ||
      lowerMsg.includes("оплат")
    ) {
      reply = isUz
        ? `💳 **To'lov Usullari:**\n\n` +
          `• 🔵 **Click** (ilovaga 1-bosishda o'tish yoki karta orqali)\n` +
          `• 🟢 **Payme** (ilovaga 1-bosishda o'tish)\n` +
          `• 🟣 **Uzum Bank** (tezkor o'tkazma)\n` +
          `• 💳 **Uzcard, Humo, Visa, Mastercard**\n` +
          `• 💵 **Naqd pul** (kuryerga yoki filialda)\n\n` +
          `Karta raqamimiz: **${settings.cardNumber}** (${settings.cardHolder}).`
        : `💳 **Способы оплаты:**\n\n` +
          `• 🔵 **Click**, 🟢 **Payme**, 🟣 **Uzum Bank**, картами Uzcard/Humo/Visa или наличными при получении.`;

    // L. DEFAULT CONVERSATIONAL RESPONSE
    } else {
      reply = isUz
        ? `Sizning savolingizni tushundim. Menga qanday kiyim, obraz yoki qaysi tadbir uchun qidirayotganingizni batafsilroq aytsangiz, sizga eng mos kiyimlar va ranglar kombinatsiyasini tanlab beraman!\n\n` +
          `*Masalan:* "To'yga qanday kiyinsam bo'ladi?", "Bo'yim 180 sm, vaznim 78 kg", yoki "Toshkentdagi filiallar qayerda?"`
        : `Я понял ваш вопрос! Расскажите чуть подробнее, для какого случая или стиля вы ищете одежду, и я подберу для вас идеальный образ из нашего каталога!`;
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: "nlp-engine",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
