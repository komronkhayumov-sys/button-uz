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
  adviceUz: string;
  adviceRu: string;
} {
  let apparelSize = "L";
  let suitSize = "50";

  if (weight < 60) {
    apparelSize = "S";
    suitSize = "46";
  } else if (weight < 72) {
    apparelSize = "M";
    suitSize = "48";
  } else if (weight < 83) {
    apparelSize = "L";
    suitSize = "50";
  } else if (weight < 95) {
    apparelSize = "XL";
    suitSize = "52";
  } else if (weight < 108) {
    apparelSize = "XXL";
    suitSize = "54";
  } else {
    apparelSize = "3XL";
    suitSize = "56";
  }

  // Adjust for tall and slim or short and broad
  if (height > 185 && weight < 75) {
    apparelSize = "L (Slim Fit)";
    suitSize = "48-50 (uzun bo'y)";
  } else if (height < 170 && weight > 85) {
    apparelSize = "XL-XXL (Erkin bichim)";
    suitSize = "52-54";
  }

  const adviceUz = `Sizning bo'yingiz ${height} sm va vazningiz ${weight} kg ko'rsatkichlariga ko'ra:\n\n` +
    `• Futbolka, polo, xudi va kurtkalar uchun: **${apparelSize}**\n` +
    `• Klassik kostyum va shimlar uchun: **${suitSize}** razmer tavsiya etiladi.\n\n` +
    `Agar erkin (oversize) uslubni yoqtirsangiz, bir o'lcham kattaroq olishingiz mumkin. Bizning filiallarimizda kiyib ko'rish uchun barcha qulayliklar mavjud!`;

  const adviceRu = `Исходя из вашего роста ${height} см и веса ${weight} кг:\n\n` +
    `• Для футболок, поло, худи и курток: **${apparelSize}**\n` +
    `• Для классических костюмов и брюк: размер **${suitSize}**.\n\n` +
    `Если предпочитаете более свободную посадку (oversize), рекомендуем взять на размер больше. В наших филиалах вы всегда можете примерить понравившуюся вещь!`;

  return { apparelSize, suitSize, adviceUz, adviceRu };
}

export async function POST(req: NextRequest) {
  try {
    const body: AssistantRequest = await req.json();
    const lang = body.lang || "uz";
    const userMessage = body.message?.trim().toLowerCase() || "";

    // 1. Direct Size Recommendation Flow
    if (body.type === "size_recommendation" && body.height && body.weight) {
      const calculation = calculateMenSize(body.height, body.weight, body.category);
      const text = lang === "ru" ? calculation.adviceRu : calculation.adviceUz;

      return NextResponse.json({
        success: true,
        reply: text,
        size: calculation.apparelSize,
        suitSize: calculation.suitSize,
      });
    }

    // 2. Prepare Context for Chat with Live Settings
    const settings = await getSettings();
    const products = await getProducts();
    const inStockCount = products.filter((p) => p.isAvailable).length;

    const branchesList = settings.branches
      .map((b, i) => `${i + 1}. ${b.name} (${b.address}, Mo'ljal: ${b.landmark}, Tel: ${b.phone})`)
      .join("\n");

    const storeContext = `
Do'kon: ${settings.storeName} (${settings.storeHandle})
Soha: Erkaklar kiyimlari, poyabzal va aksessuarlar.
Ish vaqti: ${settings.workingHoursUz} (Dam olish kunlarisiz).
Aloqa telefonlari: ${settings.phone1}, ${settings.phone2}.
Filiallar:
${branchesList}

To'lov turlari: Click, Payme, Uzum Bank va naqd pul.
Admin karta raqami: ${settings.cardNumber} (${settings.cardHolder}, ${settings.cardBank}).
Yetkazib berish: Toshkent shahri bo'ylab kuryer yoki Yandex orqali 2-3 soatda yetkaziladi.
Almashtirish: Razmer to'g'ri kelmasa, kiyilmagan holatda 3 kun ichida filialda almashtirib beriladi.
Hozirda sotuvda: ${inStockCount} xil erkaklar kiyimlari.
`.trim();

    // 3. Check for GEMINI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    if (geminiKey) {
      try {
        const systemInstruction = `
Siz ${settings.storeName} (${settings.storeHandle}) erkaklar kiyimlari do'konining xushmuomala, aqlli va tajribali AI stilist maslahatchisisiz.
Siz mijozlarga faqat do'kon ma'lumotlari, to'lov turlari va erkaklar kiyimi razmerlari bo'yicha yordam berasiz.
Mijoz qaysi tilda yozsa (o'zbek yoki rus), o'sha tilda qisqa, aniq va do'stona javob bering.
Filiallar, to'lov, ish vaqti, yetkazib berish yoki razmer bo'yicha savollarga aniq javob bering.
Matnni chiroyli formatda (punktlar bilan) yozing.
`.trim();

        const prompt = `
Do'kon ma'lumotlari:
${storeContext}

Foydalanuvchi savoli:
"${body.message}"

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
                maxOutputTokens: 500,
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

    // 4. Smart Local Heuristic Fallback
    let reply = "";
    const isUz = lang === "uz";

    if (
      userMessage.includes("to'lov") ||
      userMessage.includes("karta") ||
      userMessage.includes("click") ||
      userMessage.includes("payme") ||
      userMessage.includes("uzum") ||
      userMessage.includes("оплат") ||
      userMessage.includes("карт")
    ) {
      reply = isUz
        ? `Bizda to'lov qilish juda oson! Siz quyidagi usullardan foydalanishingiz mumkin:\n\n` +
          `• 🔵 **Click** (ilovaga 1-bosishda o'tish yoki karta raqamiga)\n` +
          `• 🟢 **Payme** (ilovaga 1-bosishda o'tish yoki karta raqamiga)\n` +
          `• 🟣 **Uzum Bank** (tezkor o'tkazma)\n` +
          `• 💵 **Naqd pul yoki terminal** (yetkazib berilganda yoki filialda)\n\n` +
          `Karta raqamimiz: **${settings.cardNumber}** (${settings.cardHolder})\n` +
          `Buyurtma rasmiylashtirayotganingizda to'lov usulini tanlab, to'lov ilovasiga to'g'ridan-to'g'ri o'tishingiz mumkin!`
        : `У нас доступны самые удобные способы оплаты:\n\n` +
          `• 🔵 **Click** (переход в приложение в 1 клик или по номеру карты)\n` +
          `• 🟢 **Payme** (переход в приложение в 1 клик или по номеру карты)\n` +
          `• 🟣 **Uzum Bank** (быстрый перевод)\n` +
          `• 💵 **Наличные или терминал** (при получении курьеру или в филиале)\n\n` +
          `Номер карты: **${settings.cardNumber}** (${settings.cardHolder})\n` +
          `При оформлении заказа вы можете выбрать удобное приложение и оплатить за секунды!`;
    } else if (
      userMessage.includes("filial") ||
      userMessage.includes("qayerda") ||
      userMessage.includes("adres") ||
      userMessage.includes("joylash") ||
      userMessage.includes("адрес") ||
      userMessage.includes("где") ||
      userMessage.includes("филиал")
    ) {
      const branchesTextUz = settings.branches
        .map((b, i) => `${i + 1}. 📍 **${b.name}:** ${b.address} (Mo'ljal: ${b.landmark})`)
        .join("\n");
      const branchesTextRu = settings.branches
        .map((b, i) => `${i + 1}. 📍 **${b.nameRu || b.name}:** ${b.addressRu || b.address} (Ориентир: ${b.landmarkRu || b.landmark})`)
        .join("\n");

      reply = isUz
        ? `Toshkent shahrida bizning filiallarimiz:\n\n${branchesTextUz}\n\n` +
          `Ish vaqti: ${settings.workingHoursUz}. "Filiallar" bo'limida Yandex va Google Xaritalar orqali yo'nalish olishingiz mumkin!`
        : `Наши филиалы в Ташкенте:\n\n${branchesTextRu}\n\n` +
          `Время работы: ${settings.workingHoursRu}. В разделе "Филиалы" вы можете открыть маршрут в Яндекс Картах!`;
    } else if (
      userMessage.includes("vaqt") ||
      userMessage.includes("ish vaqt") ||
      userMessage.includes("ochiq") ||
      userMessage.includes("yopiq") ||
      userMessage.includes("время") ||
      userMessage.includes("работа") ||
      userMessage.includes("открыт")
    ) {
      reply = isUz
        ? `${settings.storeName} **${settings.workingHoursUz}** dam olish kunlarisiz xizmatingizda! Sizni filiallarimizda kutib qolamiz.`
        : `${settings.storeName} работает **${settings.workingHoursRu}** без выходных! Ждем вас в наших филиалах.`;
    } else if (
      userMessage.includes("yetkaz") ||
      userMessage.includes("dostavka") ||
      userMessage.includes("dostav") ||
      userMessage.includes("доставк") ||
      userMessage.includes("привез")
    ) {
      reply = isUz
        ? `Toshkent shahri bo'ylab kuryer yoki Yandex orqali **2-3 soat ichida** tezkor yetkazib beramiz! Buyurtma berish uchun mahsulotni tanlab, "Tezkor buyurtma" tugmasini bosing.`
        : `По городу Ташкент доставляем курьером за **2-3 часа**! Для оформления заказа выберите товар и нажмите кнопку "Быстрый заказ".`;
    } else if (
      userMessage.includes("narx") ||
      userMessage.includes("necha pul") ||
      userMessage.includes("qancha") ||
      userMessage.includes("цена") ||
      userMessage.includes("сколько")
    ) {
      reply = isUz
        ? `Bizning barcha mahsulotlarimizning aniq narxlari sahifamizdagi katalogda ko'rsatilgan. Tanlagan kiyimingiz ustiga bosib, mavjud o'lchamlarni va 1-bosqichda buyurtma berishni ko'rishingiz mumkin.`
        : `Все актуальные цены указаны в нашем каталоге выше. Вы можете выбрать любую модель, увидеть размеры и оформить быстрый заказ.`;
    } else if (
      userMessage.includes("razmer") ||
      userMessage.includes("o'lcham") ||
      userMessage.includes("razmeri") ||
      userMessage.includes("размер") ||
      userMessage.includes("рост") ||
      userMessage.includes("вес")
    ) {
      reply = isUz
        ? `O'lcham tanlashda yordam berishim uchun bo'yingiz (sm) va vazningizni (kg) ayting. Masalan: "178 sm, 75 kg". Men sizga eng mos razmerni hisoblab beraman!`
        : `Чтобы подобрать идеальный размер, напишите ваш рост (см) и вес (кг). Например: "180 см, 78 кг". Я сразу рассчитаю подходящий размер!`;
    } else if (
      userMessage.includes("telefon") ||
      userMessage.includes("nomer") ||
      userMessage.includes("kontakt") ||
      userMessage.includes("aloqa") ||
      userMessage.includes("номер") ||
      userMessage.includes("телефон")
    ) {
      reply = isUz
        ? `Biz bilan bog'lanish uchun telefon raqamlarimiz:\n\n📞 ${settings.phone1}\n📞 ${settings.phone2}\n\nInstagram: ${settings.storeHandle}`
        : `Наши контактные телефоны:\n\n📞 ${settings.phone1}\n📞 ${settings.phone2}\n\nInstagram: ${settings.storeHandle}`;
    } else {
      reply = isUz
        ? `Assalomu alaykum! Men ${settings.storeName} sun'iy intellekt yordamchisiman. Sizga qanday yordam bera olaman?\n\n` +
          `• O'lcham tanlash (bo'y va vazn bo'yicha)\n` +
          `• To'lov usullari (Click, Payme, Uzum, Naqd)\n` +
          `• Filiallar manzillari va xaritalari\n` +
          `• Toshkent bo'ylab yetkazib berish\n` +
          `• Do'kon ish vaqtlari (${settings.workingHoursUz})`
        : `Здравствуйте! Я AI-консультант ${settings.storeName}. Чем я могу вам помочь?\n\n` +
          `• Подобрать размер одежды по росту и весу\n` +
          `• Способы оплаты (Click, Payme, Uzum, Наличные)\n` +
          `• Адреса и локации филиалов в Ташкенте\n` +
          `• Доставка по городу за 2-3 часа\n` +
          `• Время работы (${settings.workingHoursRu})`;
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
