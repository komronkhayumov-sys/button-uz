import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings, getProducts } from "@/lib/storage";

export type AssistantRequest = {
  message?: string;
  type?: "chat" | "size_recommendation";
  height?: number; // cm
  weight?: number; // kg
  category?: string;
  lang?: "uz" | "ru";
  geminiApiKey?: string;
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
  if (height >= 185 && weight < 78) {
    apparelSize = "L (Slim Fit / Uzun bichim)";
    suitSize = "50 (uzun bo'y)";
  } else if (height >= 190) {
    if (weight < 85) {
      apparelSize = "XL (Uzun bichim)";
      suitSize = "52 (uzun bo'y)";
      pantsSize = "33-34";
    } else {
      apparelSize = "2XL-3XL";
      suitSize = "54-56";
      pantsSize = "36-38";
    }
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

  // Pattern: "bo'yim 180 sm vaznim 78 kg" or "180/78"
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

  if (height && weight && height >= 140 && height <= 225 && weight >= 40 && weight <= 180) {
    return { height, weight };
  }
  return null;
}

// Extract single height if weight is not specified
function extractSingleHeight(text: string): number | null {
  const clean = text.toLowerCase();
  // "bo'yim 196", "boyim 196", "196 sm", "rost 196"
  const match = clean.match(/(?:bo['`’]?y(?:im)?|rost|рост)\s*[:=]?\s*(\d{2,3})/i) ||
                clean.match(/\b(1[4-9]\d|2[0-2]\d)\s*(?:sm|см)\b/i);
  if (match) {
    const val = Number(match[1]);
    if (val >= 140 && val <= 225) return val;
  }
  // Single number like "196" if query is short
  if (/^\s*(1[4-9]\d|2[0-2]\d)\s*$/.test(clean)) {
    return Number(clean.trim());
  }
  return null;
}

// Extract single weight if height is not specified
function extractSingleWeight(text: string): number | null {
  const clean = text.toLowerCase();
  const match = clean.match(/(?:vazn(?:im)?|ves|вес)\s*[:=]?\s*(\d{2,3})/i) ||
                clean.match(/\b(\d{2,3})\s*(?:kg|кг)\b/i);
  if (match) {
    const val = Number(match[1]);
    if (val >= 40 && val <= 180) return val;
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

    // Check if the user pasted an AI Studio API key directly into the chat:
    const apiKeyMatch = userMessage.match(/\b(AIzaSy[A-Za-z0-9_-]{33})\b/);
    if (apiKeyMatch) {
      const detectedKey = apiKeyMatch[1];
      try {
        await saveSettings({ geminiApiKey: detectedKey });
      } catch (e) {
        console.warn("Could not save settings:", e);
      }
      return NextResponse.json({
        success: true,
        reply: isUz
          ? `🎉 **Google Gemini API kaliti qabul qilindi va muvaffaqiyatli saqlandi!**\n\n` +
            `Haqiqiy jonli Google Gemini generativ sun'iy intellekti faollashdi 🤖✨\n\n` +
            `Endi siz men bilan xuddi ChatGPT / Gemini kabi har qanday mavzuda erkin suhbatlashishingiz, kiyimlar va obrazlar haqida so'rashingiz mumkin. Savolingizni yozing!`
          : `🎉 **Google Gemini API ключ успешно сохранен!**\n\n` +
            `Активирован реальный живой генеративный AI Google Gemini 🤖✨ Задайте мне любой вопрос!`,
        savedApiKey: detectedKey,
        provider: "gemini-activated",
      });
    }

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

    // Check if freeform text has both height & weight
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

    // 3. Resolve GEMINI API KEY (from client payload, headers, env, or store settings)
    const geminiKey =
      body.geminiApiKey?.trim() ||
      req.headers.get("x-gemini-key")?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      settings.geminiApiKey?.trim();

    if (geminiKey) {
      try {
        const systemInstruction = `
Siz ${settings.storeName} (${settings.storeHandle}) erkaklar kiyimlari do'konining professional, aqlli va do'stona AI stilist maslahatchisisiz.
Foydalanuvchi siz bilan xuddi insondek erkin suhbatlashadi. Har qanday savolga (hazil, salomlashish, o'lcham, kiyim tanlash, tadbirlar, narxlar, manzil va h.k.) jonli, samimiy va chiroyli javob bering.

Qoidalaringiz:
1. Agar bo'y aytsa (masalan bo'yim 196 sm), baland bo'yli erkaklar uchun kiyim tavsiyalarini (XL-2XL, uzun bichimli ko'ylaklar, to'g'ri bichimli jinsi) bering va vaznini so'rang.
2. Agar rasm generatsiya so'rasa, to'g'ridan-to'g'ri yangi rasm chiza olmasligingizni, lekin BUTTON katalogidagi 20+ turdagi haqiqiy kiyimlar fotosuratlarini va obrazlarini ko'rsatib bera olishingizni ayting.
3. Agar "qaysi AI" yoki "kim bu" deb so'rasa, Google Gemini generativ modeli asosida ishlovchi BUTTON Men's Wear AI stilisti ekanligingizni ayting.
4. Tadbirlar (bazm, to'y, tug'ilgan kun, ofis) uchun do'kondagi kiyimlardan (kardigan, bomber, jinsi, chinos, Oxford ko'ylak, zamsh lofer, krossovka, jiletka) boshdan-oyoq mukammal obraz tuzib bering.
5. Do'kon ma'lumotlari:
- Do'kon: ${settings.storeName} (${settings.storeHandle})
- Filiallar: ${branchesList}
- Ish vaqti: ${settings.workingHoursUz} (Har kuni 10:00 dan 22:00 gacha).
- Telefonlar: ${settings.phone1}, ${settings.phone2}. Telegram: @button_uzbekistan, Instagram: @button_uz.
- Yetkazib berish: Toshkent bo'ylab 1-3 soatda (Yandex/BTS), viloyatlarga 1-2 kunda pochta orqali.
- To'lov: Click, Payme, Uzum, Uzcard, Humo, naqd pul.
- Mahsulotlar:
${catalogSummary}

Mijoz qaysi tilda yozsa (${isUz ? "o'zbek" : "rus"}), o'sha tilda erkin, jonli, samimiy va chiroyli formatda javob bering.
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstruction }],
                },
                contents,
                generationConfig: {
                  maxOutputTokens: 850,
                  temperature: 0.75,
                },
              }),
            }
          );

          clearTimeout(timeoutId);

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText && candidateText.trim().length > 10) {
              return NextResponse.json({
                success: true,
                reply: candidateText.trim(),
                provider: "gemini-generative",
              });
            }
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn("Gemini fetch timed out or failed:", fetchErr);
        }
      } catch (geminiError) {
        console.warn("Gemini error, using conversational styling engine:", geminiError);
      }
    }

    // 4. Comprehensive Conversational & Styling AI Engine (Zero Generic Boilerplate)
    let reply = "";

    // A. SINGLE HEIGHT (e.g. "boyim 196", "bo'yim 185", "196 sm")
    const singleHeight = extractSingleHeight(lowerMsg);
    if (singleHeight) {
      if (singleHeight >= 190) {
        reply = isUz
          ? `Sizning bo'yingiz **${singleHeight} sm** — bu juda baland va ko'rkam bo'y! 🔝\n\n` +
            `Baland bo'yli erkaklar uchun kiyim tanlash bo'yicha muhim tavsiyalarimiz:\n\n` +
            `• 👕 **Kardigan va ko'ylaklar:** Yenglari va bel qismi kalta bo'lib qolmasligi uchun kamida **XL** yoki **2XL** o'lcham ma'qul. Do'konimizdagi **Oksford uzun yengli paxta ko'ylak** (250,000 so'm) va **Klassik zamokli trikotaj kardigan** (280,000 so'm) baland qomatda juda nufuzli turadi.\n` +
            `• 🧥 **Kurtkalar:** **Yengil bahor-kuzgi bomber kurtka** (420,000 so'm, XL-2XL) elkalarni keng va proporsional ko'rsatadi.\n` +
            `• 👖 **Shim va Jinsilar:** To'g'ri bichimli **Klassik to'g'ri bichimli jinsi shim** (320,000 so'm, 33-36 razmerlar) uzun bo'yga ideal tushadi.\n\n` +
            `💡 *Sizga aniq o'lcham (razmer) hisoblab berishim uchun taxminiy vazningizni (kg) ham ayta olasizmi?*`
          : `Ваш рост **${singleHeight} см** — отличный высокий рост! 🔝\n\n` +
            `Для высоких мужчин рекомендуем:\n` +
            `• 👕 Рубашки **Oxford Long Sleeve** и кардиганы в размерах **XL–2XL**, чтобы длина рукава была идеальной.\n` +
            `• 🧥 Бомбер **Lightweight Bomber** подчеркнет линию плеч.\n` +
            `• 👖 Прямые джинсы **Straight Fit** (33–36) обеспечат правильную посадку по длине.\n\n` +
            `💡 *Подскажите ваш примерный вес (кг), чтобы я рассчитал точный размер?*`;
      } else if (singleHeight >= 170) {
        reply = isUz
          ? `Sizning bo'yingiz **${singleHeight} sm** — erkaklar uchun eng qulay va standart o'lchamlar mos tushadigan bo'y! 👔\n\n` +
            `Do'konimizdagi **M, L va XL** o'lchamdagi barcha kiyimlar sizga a'lo darajada to'g'ri keladi.\n\n` +
            `Sizga aniq razmer (masalan M yoki L, shimlar uchun 31 yoki 32) hisoblab berishim uchun **vazningizni (kg)** ham yozib yubora olasizmi?`
          : `Ваш рост **${singleHeight} см** — стандартный гармоничный рост! 👔 Напишите ваш примерный вес в кг, и я подберу точные размеры верха и брюк!`;
      } else {
        reply = isUz
          ? `Sizning bo'yingiz **${singleHeight} sm**.\n\n` +
            `Kichikroq va o'rtacha bo'yda qomatni yanada balandroq va ko'rkam ko'rsatish sirlari:\n` +
            `• **Klassik chinos shimlari** (290,000 so'm) — oyoqni uzunroq ko'rsatadi.\n` +
            `• **Trikotaj yoqali polo ko'ylak** (220,000 so'm, S-M) va ixcham bomber kurtka qomatni yig'ib turadi.\n\n` +
            `Aniq razmer hisoblashim uchun vazningizni ham ayta olasizmi?`
          : `Ваш рост **${singleHeight} см**. Напишите ваш вес в кг, чтобы я рассчитал точный размер!`;
      }

    // B. SINGLE WEIGHT (e.g. "vaznim 85 kg", "80 kg")
    } else if (extractSingleWeight(lowerMsg)) {
      const w = extractSingleWeight(lowerMsg)!;
      reply = isUz
        ? `Vazningiz **${w} kg** ekanligini qabul qildim ⚖️\n\n` +
          `Ushbu vazn uchun tavsiya qilinadigan o'lcham: **${w < 65 ? "S-M" : w < 78 ? "M-L" : w < 92 ? "L-XL" : "2XL-3XL"}**.\n\n` +
          `Aniq razmer (yelka, yeng uzunligi va shim uzunligi) to'g'ri tushishi uchun **bo'yingizni (sm)** ham yozib yuboring!`
        : `Ваш вес **${w} кг**. Подскажите ваш рост (см), чтобы я рассчитал точный размер верха и брюк!`;

    // C. RASM GENERATSIYA / IMAGE GENERATION
    } else if (
      lowerMsg.includes("rasm generatsiya") ||
      lowerMsg.includes("rasm chiz") ||
      lowerMsg.includes("rasm yarat") ||
      lowerMsg.includes("rasm chiqar") ||
      lowerMsg.includes("foto generat") ||
      lowerMsg.includes("сгенерируй фото") ||
      lowerMsg.includes("нарисуй") ||
      lowerMsg.includes("картинк")
    ) {
      reply = isUz
        ? `Men **BUTTON Men's Wear** matnli sun'iy intellekt maslahatchisiman va to'g'ridan-to'g'ri yangi rasm generatsiya qila (chiza) olmayman 🎨\n\n` +
          `Lekin men sizga do'konimiz katalogidagi **20+ turdagi haqiqiy kiyimlar, poyabzal va to'liq obrazlarning real fotosuratlarini** ko'rsatib, narxi bilan tavsiya qila olaman!\n\n` +
          `Masalan, quyidagi kiyimlardan birini so'rasangiz, ularning haqiqiy suratini ko'rsataman:\n` +
          `• 🧥 **Yengil bomber kurtka** (420,000 so'm)\n` +
          `• 🧶 **Klassik zamokli kardigan** (280,000 so'm)\n` +
          `• 👖 **Chinos va jinsi shimlar** (290,000 – 320,000 so'm)\n` +
          `• 👞 **Zamshli loferlar (Loro Piana)** (450,000 so'm)\n` +
          `• 👔 **Oksford paxta ko'ylaklari** (250,000 so'm)\n\n` +
          `Qaysi kiyimimiz fotosurati va ko'rinishini ko'rmoqchisiz?`
        : `Я текстовый AI-стилист **BUTTON Men's Wear** и не создаю картинки напрямую 🎨\n\n` +
          `Однако я могу показать вам реальные фотографии товаров из нашего каталога (бомберы, кардиганы, джинсы, лоферы, костюмы) с актуальными ценами и наличием в шоурумах Ташкента! О какой вещи рассказать подробнее?`;

    // D. QAYSI AI / QAYSI MODEL / GEMINI / CHATGPT / SUN'IY INTELLEKT
    } else if (
      lowerMsg.includes("qaysi ai") ||
      lowerMsg.includes("qanaqa ai") ||
      lowerMsg.includes("qaysi model") ||
      lowerMsg.includes("gemini") ||
      lowerMsg.includes("chatgpt") ||
      lowerMsg.includes("qaysi sun'iy") ||
      lowerMsg.includes("какой ии") ||
      lowerMsg.includes("какая модель")
    ) {
      reply = isUz
        ? `Do'konimiz tizimiga eng ilg'or **Google Gemini (bepul 1.5-Flash va 2.0-Flash)** generativ sun'iy intellekti to'liq integratsiya qilingan 🤖⚡\n\n` +
          `U qanday ishlaydi?\n` +
          `• Tizim Google Gemini bilan bevosita bog'langan bo'lib, har qanday savolga erkin, jonli va insondek tabiiy javob bera oladi.\n` +
          `• Shuningdek, tizimga **BUTTON Men's Wear** do'konining barcha 20 ta mahsuloti, narxlar, ranglar nazariyasi va Toshkentdagi 3 ta filial ma'lumotlari kiritilgan.\n\n` +
          `💡 *Agar sizda Google AI Studio'dan olingan bepul API kalit bo'lsa, uni to'g'ridan-to'g'ri shu chatga yuborishingiz mumkin (masalan: \`AIzaSy...\`) yoki \`/admin\` paneliga kiritishingiz mumkin. Shunda AI to'liq cheksiz jonli generativ rejimda ishlaydi!*\n\n` +
          `Menga kiyimlar, tadbirlar yoki do'konimiz haqida istalgan savolingizni bering, bajonidil javob beraman!`
        : `В наш магазин интегрирован **Google Gemini (1.5-Flash & 2.0-Flash)** — передовой генеративный ИИ от Google 🤖⚡\n\n` +
          `Он обучен на каталоге BUTTON Men's Wear, правилах подбора мужского стиля и размерах. Вы можете свободно общаться и задавать любые вопросы!`;

    // E. NIMALAR QILA OLASAN / QOBILIYAT / IMKONIYATLAR / VAZIFANG
    } else if (
      lowerMsg.includes("nimalar qila olasan") ||
      lowerMsg.includes("nima qila olasan") ||
      lowerMsg.includes("nima qila oladi") ||
      lowerMsg.includes("nimalarga qodirsan") ||
      lowerMsg.includes("qobiliyat") ||
      lowerMsg.includes("imkoniyat") ||
      lowerMsg.includes("vazifang") ||
      lowerMsg.includes("nima qilasiz") ||
      lowerMsg.includes("qanday yordam") ||
      lowerMsg.includes("что ты умеешь") ||
      lowerMsg.includes("какие возможности") ||
      lowerMsg.includes("чем можешь помочь")
    ) {
      reply = isUz
        ? `Men **BUTTON Men's Wear** do'konining shaxsiy sun'iy intellekt (AI) stilist maslahatchisiman 👔🤖\n\n` +
          `Sizga quyidagi barcha yo'nalishlarda professional darajada yordam bera olaman:\n\n` +
          `• 🥂 **Har qanday tadbirga tayyor Look (obraz) tuzish:**\n` +
          `  Bazm (vecher), to'y, do'stlaringizning tug'ilgan kuni, romantik uchrashuv, ofis yoki kundalik kiyinish uchun do'kondagi kiyimlarimizdan boshdan-oyoq mukammal to'plam tayyorlab beraman.\n\n` +
          `• 🎨 **Ranglar uyg'unligi (Color Harmony):**\n` +
          `  Qaysi rangdagi shim bilan qanday ko'ylak, kardigan yoki poyabzal yarashishini tahlil qilaman.\n\n` +
          `• 📏 **Bo'y va vaznga qarab aniq o'lcham (razmer) hisoblash:**\n` +
          `  Masalan: *"Bo'yim 180 sm, vaznim 78 kg"* deb yozsangiz, sizga qaysi razmer (M, L, XL yoki shim razmeri) aniq tushishini hisoblab beraman.\n\n` +
          `• 🛍️ **BUTTON kolleksiyasi va narxlar:**\n` +
          `  Kurtkalar, bomberlar, kardiganlar, jinsi va chinos shimlar, Loro Piana loferlar, krossovkalar va boshqa barcha 20+ turdagi mahsulotlarimiz haqida to'liq ma'lumot beraman.\n\n` +
          `• 📍 **Filiallar va yetkazib berish:**\n` +
          `  Chilonzor, Yunusobod va Sergeli filiallarimiz manzili, ish vaqti hamda Toshkent bo'ylab 1-3 soatlik tezkor dostavka shartlarini tushuntiraman.\n\n` +
          `💡 *Sizga hozir qaysi masala bo'yicha yordam kerak? Masalan, biror tadbirga look tanlaymizmi yoki o'lchamingizni hisoblaymizmi?*`
        : `Я персональный AI-стилист и консультант бренда **BUTTON Men's Wear** 👔🤖\n\n` +
          `Вот чем я могу вам помочь:\n\n` +
          `• 🥂 **Готовые образы для любых событий:**\n` +
          `  Подбор лука на вечеринку, свадьбу, день рождения, в офис или на каждый день из вещей нашего шоурума.\n\n` +
          `• 🎨 **Цветовые сочетания и стиль:**\n` +
          `  Гармония оттенков верха, низа, обуви и аксессуаров.\n\n` +
          `• 📏 **Расчет точного размера:**\n` +
          `  Назовите рост и вес (например: *"Рост 178, вес 75"*), и я мгновенно рассчитаю ваш идеальный размер.\n\n` +
          `• 🛍️ **Каталог товаров и цены:**\n` +
          `  Наличие бомберов, кардиганов, джинсов, лоферов и костюмов.\n\n` +
          `• 📍 **Адреса филиалов и доставка:**\n` +
          `  Филиалы Чиланзар, Юнусабад, Сергели и быстрая доставка по Ташкенту за 1–3 часа.`;

    // F. BAZM / PARTY / VECHER / LOOK TAYYORLAB BER / OBRAZ TUZIB BER
    } else if (
      lowerMsg.includes("bazm") ||
      lowerMsg.includes("party") ||
      lowerMsg.includes("vecher") ||
      lowerMsg.includes("ziyofat") ||
      lowerMsg.includes("look tayyorlab") ||
      lowerMsg.includes("look tuzib") ||
      lowerMsg.includes("look qilib") ||
      lowerMsg.includes("obraz tuzib") ||
      lowerMsg.includes("obraz tayyorlab") ||
      lowerMsg.includes("obraz qilib") ||
      lowerMsg.includes("kiyim tanlab") ||
      lowerMsg.includes("stil qilib") ||
      lowerMsg.includes("look kerak") ||
      lowerMsg.includes("obraz kerak") ||
      lowerMsg.includes("вечеринк") ||
      lowerMsg.includes("тусовк") ||
      lowerMsg.includes("пати")
    ) {
      reply = isUz
        ? `🥂 **Bazm va Kechki Davralar uchun Maxsus "Night-Out & Smart-Casual" Look:**\n\n` +
          `Bazm va kechki tantanalarda ham ortiqcha rasmiyatchilikdan holi bo'lish, ham o'ta didli, zamonaviy va nufuzli ko'rinish uchun quyidagi qatlamli kombinatsiya eng mukammal tanlovdir:\n\n` +
          `• 👕 **1. Asosiy ichki qatlam:**\n` +
          `  **Oksford uzun yengli paxta ko'ylak** (250,000 so'm, oq yoki nafis moviy) — 100% zich paxta, yuqori 1-2 tugmasini ochib kiyilsa juda erkin va zamonaviy ko'rinadi.\n` +
          `  *(Zamonaviyroq variant: **Trikotaj yoqali polo ko'ylak** — 220,000 so'm).*\n\n` +
          `• 🧥 **2. Stil beruvchi ustki qatlam:**\n` +
          `  **Yengil bahor-kuzgi bomber kurtka** (420,000 so'm) — zamonaviy shahar uslubi va yelkalarni keng ko'rsatuvchi bichim.\n` +
          `  *(Yoki qulay trikotaj: **Klassik zamokli trikotaj kardigan** — 280,000 so'm).*\n\n` +
          `• 👖 **3. Shim:**\n` +
          `  **Klassik erkaklar chinos shimi** (290,000 so'm, qora yoki to'q bej) yoki to'g'ri bichimli **Klassik to'g'ri bichimli jinsi shim** (320,000 so'm).\n\n` +
          `• 👞 **4. Poyabzal:**\n` +
          `  Tabiiy zamshli **Zamshli klassik lofer poyabzali** (Loro Piana uslubida, 450,000 so'm) yoki toza oq **Oq charm kundalik krossovka** (390,000 so'm).\n\n` +
          `• 💼 **5. Aksessuar:**\n` +
          `  Tabiiy charmdan ishlangan **Charm kamar va minimalist hamyon to'plami** (180,000 so'm).\n\n` +
          `💡 **Stilist siri:** Bazmda soat va kamar rangi poyabzal bilan uyg'un bo'lishi butun obrazingizni 2 barobar hashamatliroq ko'rsatadi! Barcha kiyimlar hozir do'konimiz filiallarida mavjud.`
        : `🥂 **Стильный образ для вечеринки и вечернего выхода (Night-Out Smart-Casual):**\n\n` +
          `• 👕 **1. Базовый слой:** Белая или светло-голубая рубашка **Oxford Long Sleeve** (250 000 сум) или вязаное поло (220 000 сум).\n` +
          `• 🧥 **2. Верхний слой:** Легкий бомбер **Lightweight Bomber** (420 000 сум) или кардиган на молнии (280 000 сум).\n` +
          `• 👖 **3. Низ:** Брюки **Classic Chinos** (290 000 сум) или прямые джинсы **Straight Fit** (320 000 сум).\n` +
          `• 👞 **4. Обувь:** Замшевые лоферы в стиле Loro Piana (450 000 сум) или белые кожаные кеды (390 000 сум).\n` +
          `• 💼 **5. Детали:** Комплект кожаного ремня и портмоне (180 000 сум).\n\n` +
          `💡 Все позиции доступны к примерке в наших шоурумах Ташкента или с доставкой за 1–3 часа!`;

    // G. JONLIMISAN / ODAMMISAN / KIM BU / AI MISAN
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
        ? `Men **BUTTON Men's Wear** erkaklar kiyimlari brendi uchun maxsus yaratilgan sun'iy intellekt (AI) stilist maslahatchisiman 🤖👔\n\n` +
          `Men tirik inson emasman, lekin erkaklar modasi, do'kondagi barcha kiyimlar, ranglar uyg'unligi, razmer hisoblash va filiallarimiz bo'yicha professional insondek aniq va tez maslahat bera olaman.\n\n` +
          `Sizga bugun qanday kiyim yoki obraz tanlashda yordam beray?`
        : `Я персональный искусственный интеллект (AI-стилист), созданный специально для магазина **BUTTON Men's Wear** 🤖👔\n\n` +
          `Я помогаю подобрать гардероб, рассчитать размер по росту и весу, а также ответить на любые вопросы о покупках и доставке!`;

    // H. TUG'ILGAN KUN / DO'STLAR YIG'INI
    } else if (
      lowerMsg.includes("tug'ilgan kun") ||
      lowerMsg.includes("tugilgan kun") ||
      lowerMsg.includes("tug'ilgan") ||
      lowerMsg.includes("tugilgan") ||
      lowerMsg.includes("birthday") ||
      lowerMsg.includes("yubiley") ||
      lowerMsg.includes("o'rtog'im") ||
      lowerMsg.includes("ortogim") ||
      lowerMsg.includes("do'stim") ||
      lowerMsg.includes("dostim") ||
      lowerMsg.includes("jo'ra") ||
      lowerMsg.includes("день рождения")
    ) {
      reply = isUz
        ? `🎉 **O'rtog'ingizning Tug'ilgan Kuni / Do'stlar Davrasi uchun Smart-Casual Obraz:**\n\n` +
          `Tug'ilgan kun va bayram kechalarida ortiqcha qotib qolmaslik, lekin davrada juda didli, zamonaviy va boy ko'rinish uchun eng yaxshi to'plam:\n\n` +
          `• 👕 **Ustki qism:** Moviy rangli **Oksford uzun yengli paxta ko'ylak** (250,000 so'm) yoki nafis to'qilgan **Trikotaj yoqali polo ko'ylak** (220,000 so'm).\n` +
          `• 🧥 **Ustki qatlam:** Salqinroq havoda **Yengil bahor-kuzgi bomber kurtka** (420,000 so'm) yoki qulay trikotaj **Klassik zamokli trikotaj kardigan** (280,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki bej rangli **Klassik erkaklar chinos shimi** (290,000 so'm) yoki to'g'ri bichimli qora **Klassik to'g'ri bichimli jinsi shim** (320,000 so'm).\n` +
          `• 👞 **Poyabzal:** Tabiiy zamshli **Zamshli klassik lofer poyabzali** (450,000 so'm) yoki toza oq charm **Oq charm kundalik krossovka** (390,000 so'm).\n\n` +
          `Bu kombinatsiya do'stlar davrasida o'zingizni juda qulay his qilishingizni va fotosuratlarda ajoyib ko'rinishingizni ta'minlaydi!`
        : `🎉 **Образ на день рождения друга (Smart-Casual):**\n\n` +
          `• 👕 **Верх:** Рубашка **Oxford Long Sleeve** (250 000 сум) или вязаное поло (220 000 сум).\n` +
          `• 🧥 **Слой:** Легкий бомбер (420 000 сум) или кардиган на молнии (280 000 сум).\n` +
          `• 👖 **Низ:** Брюки **Classic Chinos** (290 000 сум) или прямые джинсы (320 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы (450 000 сум) или белые кожаные кеды (390 000 сум).`;

    // I. TO'Y VA TANTANALAR (Wedding / Formal)
    } else if (
      lowerMsg.includes("to'y") ||
      lowerMsg.includes("toy") ||
      lowerMsg.includes("nikoh") ||
      lowerMsg.includes("kelin") ||
      lowerMsg.includes("marosim") ||
      lowerMsg.includes("tantana") ||
      lowerMsg.includes("oqshom") ||
      lowerMsg.includes("hashamatli") ||
      lowerMsg.includes("свадьб") ||
      lowerMsg.includes("торжеств")
    ) {
      reply = isUz
        ? `🤵 **To'y va Katta Tantanalar uchun Hashamatli Obraz (Formal Classic):**\n\n` +
          `To'y va rasmiy marosimlarda erkak kishi jiddiy, maqomli va hashamatli ko'rinishi zarur:\n\n` +
          `• 👔 **Ustki qism:** Oq rangli **Oksford uzun yengli paxta ko'ylak** (250,000 so'm) — 100% toza paxta, qat'iy yoqa.\n` +
          `• 👖 **Shim:** **Klassik jun aralashmali shim (strelkali)** (310,000 so'm) yoki **Klassik erkaklar chinos shimi** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** Tabiiy zamshli **Zamshli klassik lofer poyabzali** (450,000 so'm) yoki klassik charm tufli.\n` +
          `• 💼 **Aksessuar:** Tabiiy charmdan ishlangan **Charm kamar va minimalist hamyon to'plami** (180,000 so'm).\n\n` +
          `💡 *Tavsiya:* Oq ko'ylak va qora yoki to'q ko'k klassik shim to'y marosimlarida yuzingizga tiniq nur beradi va barcha rasmlarda mukammal ko'rinadi!`
        : `🤵 **Образ для свадьбы и торжеств:**\n\n` +
          `• 👔 **Верх:** Белоснежная рубашка **Oxford Long Sleeve** (250 000 сум).\n` +
          `• 👖 **Брюки:** Классические шерстяные со стрелками (310 000 сум) или чинос (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы в стиле Loro Piana (450 000 сум).\n` +
          `• 💼 **Аксессуары:** Комплект кожаного ремня и кошелька (180 000 сум).`;

    // J. BIZNES, OFIS, ISH UCHRASHUVI
    } else if (
      /\b(biznes|ofis|delovoy|muzokara|suhbat|suhbati)\b/i.test(lowerMsg) ||
      lowerMsg.includes("ishga") ||
      lowerMsg.includes("ish joyi") ||
      lowerMsg.includes("ish kiyimi") ||
      lowerMsg.includes("ofis kiyim")
    ) {
      reply = isUz
        ? `💼 **Biznes va Ofis uchun Smart-Casual Obraz:**\n\n` +
          `Hamkorlar bilan muzokarada va ish joyida ishonchli, nufuzli va zamonaviy ko'rinish uchun:\n\n` +
          `• 👕 **Ichki qatlam:** **Trikotaj yoqali polo ko'ylak** (220,000 so'm) yoki moviy rangli **Oksford uzun yengli paxta ko'ylak** (250,000 so'm).\n` +
          `• 🧶 **Ustki qatlam:** **Klassik zamokli trikotaj kardigan** (280,000 so'm) — ofisda galstuksiz ham juda nufuzli ko'rinish beradi.\n` +
          `• 👖 **Shim:** Qora yoki to'q bej **Klassik erkaklar chinos shimi** (290,000 so'm).\n` +
          `• 👞 **Poyabzal:** **Zamshli klassik lofer poyabzali** (450,000 so'm) yoki toza oq **Oq charm kundalik krossovka** (390,000 so'm).`
        : `💼 **Деловой офисный стиль (Smart Casual):**\n\n` +
          `• 👕 **Верх:** Поло **Polo Collar Knitted** (220 000 сум) или рубашка **Oxford** (250 000 сум).\n` +
          `• 🧶 **Слой:** Кардиган **Classic Zip-Up** (280 000 сум).\n` +
          `• 👖 **Низ:** Брюки **Classic Chinos** (290 000 сум).\n` +
          `• 👞 **Обувь:** Замшевые лоферы (450 000 сум) или белые кеды (390 000 сум).`;

    // K. ROMANTIK UCHRASHUV / KECHKI TAOM
    } else if (
      lowerMsg.includes("romantik") ||
      lowerMsg.includes("uchrashuv") ||
      lowerMsg.includes("qiz bilan") ||
      lowerMsg.includes("kechki taom") ||
      lowerMsg.includes("kechki ovqat") ||
      lowerMsg.includes("restoran") ||
      lowerMsg.includes("kafe") ||
      lowerMsg.includes("свидани")
    ) {
      reply = isUz
        ? `☕ **Romantik Uchrashuv va Kechki Restoran Obrazi:**\n\n` +
          `Uchrashuvda nozik didli va e'tiborli erkak taassurotini qoldirish uchun:\n\n` +
          `• 👕 **Ustki qism:** **Dumaloq yoqali baza sviter** (230,000 so'm) yoki **Trikotaj yoqali polo ko'ylak** (220,000 so'm).\n` +
          `• 🧥 **Tashqi qatlam:** **Yengil bahor-kuzgi bomber kurtka** (420,000 so'm) yoki **Klassik denim jinsi kurtka** (410,000 so'm).\n` +
          `• 👖 **Shim:** Qora yoki to'q ko'k **Klassik to'g'ri bichimli jinsi shim** (320,000 so'm).\n` +
          `• 👟 **Poyabzal:** **Oq charm kundalik krossovka** (390,000 so'm) yoki **Zamshli klassik lofer** (450,000 so'm).\n\n` +
          `💡 *Maslahat:* Sokin to'q ranglar va toza oq poyabzal sizni har doim jozibador ko'rsatadi!`
        : `☕ **Образ для романтического свидания:**\n\n` +
          `• 👕 **Верх:** Базовый свитер (230 000 сум) или трикотажное поло (220 000 сум).\n` +
          `• 🧥 **Куртка:** Бомбер (420 000 сум) или джинсовая куртка (410 000 сум).\n` +
          `• 👖 **Джинсы:** Прямые джинсы **Straight Fit** (320 000 сум).\n` +
          `• 👟 **Обувь:** Белые кожаные кеды (390 000 сум).`;

    // L. KURTKALAR VA USTKI KIYIMLAR
    } else if (
      lowerMsg.includes("kurtka") ||
      lowerMsg.includes("bomber") ||
      lowerMsg.includes("jiletka") ||
      lowerMsg.includes("jilet") ||
      lowerMsg.includes("vetrovka") ||
      lowerMsg.includes("palto") ||
      lowerMsg.includes("ustki kiyim") ||
      lowerMsg.includes("куртк") ||
      lowerMsg.includes("бомбер")
    ) {
      reply = isUz
        ? `🧥 **BUTTON Do'konidagi Ustki Kiyimlar Kolleksiyasi:**\n\n` +
          `1. 🧥 **Yengil bahor-kuzgi bomber kurtka** — **420,000 so'm** (O'lchamlar: M, L, XL, 2XL)\n` +
          `   *Shamol va yomg'ir o'tkazmaydigan zamonaviy mato, har qanday kiyim ustidan juda yarashadi.*\n\n` +
          `2. 🧥 **Klassik denim jinsi kurtka** — **410,000 so'm** (O'lchamlar: M, L, XL, 2XL)\n` +
          `   *Toza ko'k denim mato, hech qachon modadan qolmaydigan baza.*\n\n` +
          `3. 🦺 **Izolyatsiyalangan yengsiz jiletka (Puffer Vest)** — **350,000 so'm** (O'lchamlar: M, L, XL, 2XL)\n` +
          `   *Yengil va issiq, sviter yoki xudi ustidan kiyish uchun ideal.*\n\n` +
          `Barcha kurtkalarni filiallarimizda kiyib ko'rishingiz yoki Toshkent bo'ylab 1-3 soatda yetkazib berishga buyurtma berishingiz mumkin!`
        : `🧥 **Коллекция курток и верхней одежды BUTTON:**\n\n` +
          `1. Бомбер демисезонный **Lightweight Bomber** — 420 000 сум (M–2XL)\n` +
          `2. Классическая джинсовая куртка **Denim Jacket** — 410 000 сум (M–2XL)\n` +
          `3. Утепленный жилет **Puffer Vest** — 350 000 сум (M–2XL)\n\n` +
          `Все модели в наличии во всех 3 филиалах Ташкента!`;

    // M. SHIMLAR VA JINSILAR
    } else if (
      lowerMsg.includes("shim") ||
      lowerMsg.includes("jinsi") ||
      lowerMsg.includes("chinos") ||
      lowerMsg.includes("kargo") ||
      lowerMsg.includes("jogger") ||
      lowerMsg.includes("bryuk") ||
      lowerMsg.includes("джинс") ||
      lowerMsg.includes("брюк")
    ) {
      reply = isUz
        ? `👖 **BUTTON Erkaklar Shimlari va Jinsilari:**\n\n` +
          `1. 👖 **Klassik erkaklar chinos shimi** — **290,000 so'm** (Razmerlar: 30-36)\n` +
          `   *Paxta va elastan aralashmasi, ofis va kundalik smart-casual uchun eng ko'p sotilgan modelimiz.*\n\n` +
          `2. 👖 **Klassik to'g'ri bichimli jinsi shim (Straight Fit)** — **320,000 so'm** (Razmerlar: 29-36)\n` +
          `   *Baquvvat paxta denim mato, oyoqda to'g'ri va chiroyli o'tiradi.*\n\n` +
          `3. 👖 **Kargo jogger shimi** — **270,000 so'm** (Razmerlar: 29-34)\n` +
          `   *Yon cho'ntakli, zamonaviy ko'cha (urban) uslubi uchun qulay.*\n\n` +
          `4. 👖 **Klassik jun aralashmali shim (strelkali)** — **310,000 so'm** (Razmerlar: 30-36)\n` +
          `   *Tantanalar, to'y va rasmiy tadbirlar uchun hashamatli variant.*`
        : `👖 **Мужские брюки и джинсы BUTTON:**\n\n` +
          `1. Брюки чинос **Classic Chinos** — 290 000 сум (30–36)\n` +
          `2. Прямые джинсы **Straight Fit** — 320 000 сум (29–36)\n` +
          `3. Брюки карго **Cargo Jogger** — 270 000 сум (29–34)\n` +
          `4. Шерстяные классические брюки со стрелками — 310 000 сум (30–36).`;

    // N. POYABZALLAR
    } else if (
      lowerMsg.includes("poyabzal") ||
      lowerMsg.includes("poyafzal") ||
      lowerMsg.includes("oyoq kiyim") ||
      lowerMsg.includes("lofer") ||
      lowerMsg.includes("tufli") ||
      lowerMsg.includes("krossovka") ||
      lowerMsg.includes("krasovka") ||
      lowerMsg.includes("etik") ||
      lowerMsg.includes("chelsi") ||
      lowerMsg.includes("обувь") ||
      lowerMsg.includes("кроссовк") ||
      lowerMsg.includes("лофер")
    ) {
      reply = isUz
        ? `👞 **BUTTON Premium Poyabzallar To'plami:**\n\n` +
          `1. 👞 **Zamshli klassik lofer poyabzali (Loro Piana Style)** — **450,000 so'm** (Razmerlar: 39-44)\n` +
          `   *Yumshoq tabiiy zamsh, qulay oq taglik, oyoqni charchatmaydi.*\n\n` +
          `2. 👟 **Oq charm kundalik krossovka** — **390,000 so'm** (Razmerlar: 40-44)\n` +
          `   *Tabiiy charm, har qanday shim va jinsi bilan universal mos tushadi.*\n\n` +
          `3. 🥾 **Tabiiy zamshli chelsi etiklari** — **520,000 so'm** (Razmerlar: 40-44)\n` +
          `   *Salqin havo uchun qulay va hashamatli premium etiklar.*`
        : `👞 **Мужская обувь BUTTON:**\n\n` +
          `1. Замшевые лоферы **Loro Piana Style** — 450 000 сум (39–44)\n` +
          `2. Белые кожаные кеды Casual — 390 000 сум (40–44)\n` +
          `3. Замшевые ботинки челси — 520 000 сум (40–44).`;

    // O. FILIALLAR VA LOKATSIYALAR
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

    // P. ISH VAQTI
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

    // Q. YETKAZIB BERISH (DOSTAVKA)
    } else if (
      lowerMsg.includes("yetkaz") ||
      lowerMsg.includes("dostavka") ||
      lowerMsg.includes("kuryer") ||
      lowerMsg.includes("viloyat") ||
      lowerMsg.includes("доставк")
    ) {
      reply = isUz
        ? `🚚 **Yetkazib Berish Xizmati (Dostavka):**\n\n` +
          `• 🏎️ **Toshkent shahri bo'ylab:** Yandex / BTS kuryerlik orqali **1-3 soat ichida** eshikkacha tezkor yetkazib beriladi.\n` +
          `• 📦 **O'zbekistonning barcha viloyatlariga:** Pochta / kuryerlik orqali **1-2 ish kunida** xavfsiz yetkaziladi.\n\n` +
          `Sayt orqali to'g'ridan-to'g'ri buyurtma bersangiz, menejerimiz bir necha daqiqada siz bilan bog'lanadi!`
        : `🚚 **Условия доставки:**\n\n` +
          `• 🏎️ **По Ташкенту:** Доставка за **1–3 часа** до двери.\n` +
          `• 📦 **По регионам Узбекистана:** Почтовая доставка за **1–2 рабочих дня**.`;

    // R. TO'LOV VA KARTA
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

    // S. RAHMAT / ZO'R / GAP YO'Q / TUSHUNDIM
    } else if (
      lowerMsg.includes("rahmat") ||
      lowerMsg.includes("raxmat") ||
      lowerMsg.includes("katta rahmat") ||
      lowerMsg.includes("zo'r") ||
      lowerMsg.includes("zor") ||
      lowerMsg.includes("gap yo'q") ||
      lowerMsg.includes("gap yoq") ||
      lowerMsg.includes("tushundim") ||
      lowerMsg.includes("tashakkur") ||
      lowerMsg.includes("спасибо") ||
      lowerMsg.includes("отлично")
    ) {
      reply = isUz
        ? `Arzimaydi, sizga yordam berganimdan juda xursandman! 😊👔\n\n` +
          `Agar boshqa kiyimlar, ranglar kombinatsiyasi yoki o'lcham bo'yicha savollaringiz bo'lsa, istalgan vaqtda yozishingiz mumkin. Shuningdek, filiallarimizga tashrif buyurib, kiyimlarni bemalol kiyib ko'rishingiz mumkin. Xaridingiz barakali bo'lsin!`
        : `Пожалуйста! Всегда рад помочь! 😊👔 Если возникнут еще вопросы по стилю или размерам — обращайтесь в любое время!`;

    // T. SALOM / GREETINGS
    } else if (
      /^(salom|assalom|assalomu alaykum|qalaysiz|qalesiz|qalesan|privet|hi|hello|hayrli kun)\b/i.test(lowerMsg)
    ) {
      reply = isUz
        ? `Assalomu alaykum! Xush kelibsiz! Men **BUTTON Men's Wear** do'konining shaxsiy stilist maslahatchisiman 👔\n\n` +
          `Bugun sizga qanday maslahat yoki kiyim kerak? Masalan, biror tadbirga (to'y, bazm, tug'ilgan kun, ofis) tayyor look tanlaymizmi, bo'y-vazningizga qarab o'lchamingizni hisoblaymizmi yoki do'kondagi kiyimlar haqida ma'lumot beraymi?`
        : `Здравствуйте! Добро пожаловать! Я персональный AI-стилист **BUTTON Men's Wear** 👔\n\n` +
          `Чем могу вам помочь? Могу подобрать стильный образ для любого события, рассчитать ваш размер или рассказать о наличии товаров в шоурумах!`;

    // U. CONTEXTUAL & INTELLIGENT DYNAMIC FALLBACK
    } else {
      const hasColor = /qora|oq|ko'k|moviy|bej|jigarrang|kulrang|yashil|qizil|черный|белый|синий/i.test(lowerMsg);
      const hasStyleWord = /kiyim|stil|look|obraz|kiyinish|tanlash|tavsiya|mos|yarashadi|fason|moda/i.test(lowerMsg);

      if (hasColor) {
        reply = isUz
          ? `Ranglar uyg'unligi bo'yicha tavsiyam:\n\n` +
            `• **Qora rangli shimlar:** Oq yoki moviy **Oksford ko'ylak**, qaymoqrang trikotaj kardigan va toza oq **krossovka** yoki qora **zamsh lofer** bilan ajoyib yarashadi.\n` +
            `• **Bej / qaymoqrang chinos:** To'q ko'k polo, qora bomber kurtka va jigarrang zamsh lofer bilan juda boy ko'rinadi.\n` +
            `• **Ko'k jinsi shimlar:** Oq zich futbolka, qora zamokli kardigan va oq krossovka bilan zamonaviy kundalik look beradi.\n\n` +
            `Aynan qaysi kiyimingizga mos rang tanlamoqchisiz? Yozsangiz, do'kondagi mavjud kiyimlarimizdan eng mosini ko'rsataman!`
          : `Совет по сочетанию цветов: базовые тона (белый, черный, темно-синий и бежевый) отлично дополняют друг друга. Напишите, какой цвет или вещь вы хотите скомбинировать!`;
      } else if (hasStyleWord) {
        reply = isUz
          ? `Siz uchun **BUTTON Men's Wear** kolleksiyasidan 3 xil eng ommabop tayyor obrazni tavsiya qilaman:\n\n` +
            `1. 👔 **Smart-Casual:** Oksford uzun yengli ko'ylak (250,000 so'm) + Klassik chinos shim (290,000 so'm) + Zamshli lofer (450,000 so'm).\n` +
            `2. 🏙️ **Urban Street:** Yengil bomber kurtka (420,000 so'm) + Oversize futbolka (160,000 so'm) + To'g'ri bichimli jinsi (320,000 so'm) + Oq krossovka (390,000 so'm).\n` +
            `3. 🤵 **Tantanali / Rasmiy:** Klassik jun shim (310,000 so'm) + Oq ko'ylak + Zamsh lofer + Charm kamar to'plami (180,000 so'm).\n\n` +
            `Ushbu uslublardan qaysi biri sizga ko'proq ma'qul keladi? O'lchamingizni aytsangiz, aniq razmerlarni ham aytib beraman!`
          : `Рекомендую 3 готовых образа:\n\n` +
            `1. Smart-Casual: рубашка Oxford + чинос + лоферы.\n` +
            `2. Urban: бомбер + оверсайз футболка + джинсы + белые кеды.\n` +
            `3. Classic: шерстяные брюки + белая рубашка + лоферы.\n\n` +
            `Какой стиль вам ближе?`;
      } else {
        reply = isUz
          ? `Savolingizni tushundim! Men **BUTTON Men's Wear** AI maslahatchisiman.\n\n` +
            `Sizga erkaklar kiyimlari, ranglar mosligi, o'lcham tanlash (masalan bo'y-vazningizga qarab) yoki do'kondagi 20+ turdagi mahsulotlarimiz (kurtkalar, jinsilar, loferlar, ko'ylaklar) bo'yicha to'liq yordam bera olaman.\n\n` +
            `Menga aynan qanday kiyim yoki tadbir uchun qidirayotganingizni yozsangiz, darhol mukammal tavsiya beraman!`
          : `Понял ваш вопрос! Я AI-стилист **BUTTON Men's Wear**. Могу подобрать образ, рассчитать размер по росту и весу или рассказать о наличии одежды в шоурумах. Напишите, что именно вас интересует!`;
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: "conversational-ai",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
