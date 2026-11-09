/**
 * Utility functions for Store Working Hours dynamically calculated
 * strictly based on Uzbekistan timezone (UTC+5 / Asia/Tashkent).
 */

export interface StoreTimeStatus {
  isOpen: boolean;
  isBeforeOpen: boolean; // 00:00 - 09:59 (before opening)
  isAfterClose: boolean; // 22:00 - 23:59 (after closing)
  statusTextUz: string;
  statusTextRu: string;
  badgeClass: string;
  currentTashkentTime: string;
  hours: number;
  minutes: number;
}

/**
 * Returns the exact current hour and minute in Uzbekistan (Asia/Tashkent, UTC+5)
 * regardless of host server or client device timezone.
 */
export function getTashkentTime(): { hours: number; minutes: number; timeString: string } {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tashkent",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    let hours = 0;
    let minutes = 0;
    for (const p of parts) {
      if (p.type === "hour") hours = parseInt(p.value, 10);
      if (p.type === "minute") minutes = parseInt(p.value, 10);
    }
    // Normalize edge case where some Intl engines return 24 for midnight
    if (hours === 24) hours = 0;
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return { hours, minutes, timeString };
  } catch (err) {
    // Resilient fallback using explicit UTC+5 calculation
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const tashkentDate = new Date(utcMs + 5 * 3600000);
    const hours = tashkentDate.getHours();
    const minutes = tashkentDate.getMinutes();
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return { hours, minutes, timeString };
  }
}

/**
 * Returns current store status based strictly on Tashkent time (UTC+5).
 * Working hours: 10:00 to 22:00 every day without days off.
 *
 * Rules:
 * - Before 10:00 AM (< 600 min): "Hozir yopiq (Bugun 10:00 da ochiladi)" / "Сейчас закрыто (Откроется сегодня в 10:00)"
 * - 10:00 to 22:00 (600 to 1319 min): "Hozir ochiq (10:00 – 22:00)" / "Сейчас открыто (10:00 – 22:00)"
 * - After 22:00 (>= 1320 min): "Hozir yopiq (Ertaga 10:00 da ochiladi)" / "Сейчас закрыто (Откроется завтра в 10:00)"
 */
export function getStoreTimeStatus(lang: "uz" | "ru" = "uz"): StoreTimeStatus {
  const { hours, minutes, timeString } = getTashkentTime();
  const currentTotalMinutes = hours * 60 + minutes;

  // 10:00 AM = 600 minutes
  // 22:00 PM = 1320 minutes (closes at 22:00:00, so 22:01 is closed)
  const OPEN_MINUTES = 600;  // 10:00 AM
  const CLOSE_MINUTES = 1320; // 22:00 PM

  const isBeforeOpen = currentTotalMinutes < OPEN_MINUTES;
  const isAfterClose = currentTotalMinutes >= CLOSE_MINUTES;
  const isOpen = currentTotalMinutes >= OPEN_MINUTES && currentTotalMinutes < CLOSE_MINUTES;

  let statusTextUz = "";
  let statusTextRu = "";

  if (isOpen) {
    statusTextUz = "Hozir ochiq (10:00 – 22:00)";
    statusTextRu = "Сейчас открыто (10:00 – 22:00)";
  } else if (isBeforeOpen) {
    statusTextUz = "Hozir yopiq (Bugun 10:00 da ochiladi)";
    statusTextRu = "Сейчас закрыто (Откроется сегодня в 10:00)";
  } else {
    statusTextUz = "Hozir yopiq (Ertaga 10:00 da ochiladi)";
    statusTextRu = "Сейчас закрыто (Откроется завтра в 10:00)";
  }

  const badgeClass = isOpen
    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40";

  return {
    isOpen,
    isBeforeOpen,
    isAfterClose,
    statusTextUz,
    statusTextRu,
    badgeClass,
    currentTashkentTime: timeString,
    hours,
    minutes,
  };
}
