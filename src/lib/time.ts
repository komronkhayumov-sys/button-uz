/**
 * Utility functions for Store Working Hours dynamically calculated
 * based on Uzbekistan timezone (UTC+5 / Asia/Tashkent).
 */

export interface StoreTimeStatus {
  isOpen: boolean;
  statusTextUz: string;
  statusTextRu: string;
  badgeClass: string;
  currentTashkentTime: string;
}

/**
 * Returns current store status based on Tashkent time (UTC+5).
 * Working hours: 10:00 to 23:00 every day without days off.
 */
export function getStoreTimeStatus(lang: "uz" | "ru" = "uz"): StoreTimeStatus {
  const now = new Date();
  // Convert current UTC time to Tashkent (UTC+5)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const tashkentDate = new Date(utcMs + 5 * 3600000);

  const hours = tashkentDate.getHours();
  const minutes = tashkentDate.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;

  // 10:00 AM = 600 minutes
  // 23:00 PM = 1380 minutes (closes at 23:00:00, so 23:01 is closed)
  const isOpen = currentTotalMinutes >= 600 && currentTotalMinutes < 1380;

  const statusTextUz = isOpen
    ? "Hozir ochiq (10:00 – 23:00)"
    : "Hozir yopiq (Ertaga 10:00 da ochiladi)";

  const statusTextRu = isOpen
    ? "Сейчас открыто (10:00 – 23:00)"
    : "Сейчас закрыто (Откроется в 10:00)";

  const badgeClass = isOpen
    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40";

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return {
    isOpen,
    statusTextUz,
    statusTextRu,
    badgeClass,
    currentTashkentTime: timeString,
  };
}
