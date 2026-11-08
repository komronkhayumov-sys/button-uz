import { Order } from "@/types";
import { getSettings } from "./storage";
import { formatUzbekCurrency } from "./format";

export { formatUzbekCurrency };

export async function sendTelegramOrderNotification(order: Order): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const settings = await getSettings();

  const botToken = settings.telegramBotToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = settings.telegramChatId?.trim() || process.env.TELEGRAM_CHAT_ID?.trim();

  const isConfigured = Boolean(botToken && chatId);

  const deliveryText =
    order.deliveryType === "delivery"
      ? `🚚 <b>Yetkazib berish (Toshkent bo'ylab)</b>\n📍 Manzil: ${order.address || "Ko'rsatilmadi"}`
      : `🏬 <b>Filialdan olib ketish / Bron</b>\n🏢 Filial: <b>${order.branchName || order.branchId || "Tanlanmagan"}</b>`;

  const paymentText =
    order.paymentMethod === "click"
      ? "🔵 Click orqali to'lov"
      : order.paymentMethod === "payme"
      ? "🟢 Payme orqali to'lov"
      : order.paymentMethod === "uzum"
      ? "🟣 Uzum Bank orqali to'lov"
      : "💵 Qabul qilinganda naqd pul / terminal";

  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.productName}</b>\n   • O'lcham: <code>${item.size || "Standart"}</code>\n   • Soni: ${item.quantity} dona\n   • Narxi: ${formatUzbekCurrency(item.price)}`
    )
    .join("\n\n");

  const message = `
🛍️ <b>YANGI BUYURTMA — BUTTON.UZ</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma ID:</b> <code>#${order.id}</code>
📅 <b>Vaqt:</b> ${new Date(order.createdAt).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}

👤 <b>Mijoz:</b> <b>${order.customerName}</b>
📞 <b>Telefon:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>

📦 <b>Yetkazish turi:</b>
${deliveryText}

💳 <b>To'lov turi:</b>
${paymentText} (${order.paymentStatus === "paid" ? "✅ To'langan" : "⏳ Kutilmoqda"})

${order.comment ? `💬 <b>Izoh:</b> <i>${order.comment}</i>\n` : ""}
📋 <b>Mahsulotlar:</b>
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 <b>JAMI SUMMA:</b> <b>${formatUzbekCurrency(order.totalAmount)}</b>
━━━━━━━━━━━━━━━━━━━━
<i>BUTTON Men's Wear Smart Mini-Catalog</i>
`.trim();

  if (!isConfigured) {
    console.log("ℹ️ [Telegram Bot - Demo/Fallback Mode] No TELEGRAM_BOT_TOKEN/CHAT_ID set. Message that would be sent:\n", message);
    return { success: true, simulated: true };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error("Telegram API Error:", data);
      return { success: false, error: data.description || "Failed to send Telegram message" };
    }

    return { success: true, simulated: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Telegram network error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function sendTelegramReceiptNotification(
  orderId: string,
  receiptUrl: string
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  try {
    const settings = await getSettings();
    const botToken = settings.telegramBotToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = settings.telegramChatId?.trim() || process.env.TELEGRAM_CHAT_ID?.trim();

    if (!botToken || !chatId) {
      return { success: true, simulated: true };
    }

    const caption = `
📸 <b>YANGI TO'LOV CHEKI / SKRINSHOT KELDI!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma ID:</b> <code>#${orderId}</code>
📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
⚡ <i>Xaridor to'lovni tasdiqlash uchun chek skrinshotini yukladi. Admin paneldan tekshirishingiz mumkin!</i>
━━━━━━━━━━━━━━━━━━━━
`.trim();

    // If receiptUrl is a remote URL, send as photo
    if (receiptUrl.startsWith("http://") || receiptUrl.startsWith("https://")) {
      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: receiptUrl,
          caption,
          parse_mode: "HTML",
        }),
      });
      return { success: res.ok };
    }

    // Otherwise send text notification
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: caption,
        parse_mode: "HTML",
      }),
    });
    return { success: res.ok };
  } catch (err) {
    return { success: false };
  }
}
