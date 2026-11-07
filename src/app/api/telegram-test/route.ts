import { NextRequest, NextResponse } from "next/server";
import { getSettings, verifyPin } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const pin = req.headers.get("x-admin-pin") || "";
  if (!(await verifyPin(pin))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const settings = await getSettings();

    const botToken = (body.telegramBotToken || settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
    const chatId = (body.telegramChatId || settings.telegramChatId || process.env.TELEGRAM_CHAT_ID || "").trim();

    if (!botToken || !chatId) {
      return NextResponse.json({
        success: false,
        error: "Telegram Bot Token yoki Chat ID kiritilmagan. Iltimos, ikkala maydonni ham to'ldiring.",
      });
    }

    const testMessage = `
🤖 <b>BUTTON MEN'S WEAR — BOT SINOVI</b>
━━━━━━━━━━━━━━━━━━━━
✅ Telegram bot integratsiyasi muvaffaqiyatli ishlamoqda!
📅 Vaqt: ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
🔔 Endilikda saytdan kelgan har bir yangi buyurtma ushbu chatga darhol yuboriladi.
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: "HTML",
      }),
    });

    const resData = await res.json();
    if (!resData.ok) {
      return NextResponse.json({
        success: false,
        error: `Telegram xatosi: ${resData.description || "Noma'lum xatolik"}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Telegram orqali sinov xabari muvaffaqiyatli yuborildi!",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
