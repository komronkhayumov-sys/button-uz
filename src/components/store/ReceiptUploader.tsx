"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, CheckCircle2, Clock, AlertCircle, RefreshCw, Camera, Eye } from "lucide-react";
import { Language } from "@/types";

interface ReceiptUploaderProps {
  orderId: string;
  lang?: Language;
  currentReceipt?: string;
  paymentStatus?: "pending" | "verifying" | "paid" | "rejected";
  rejectReason?: string;
  onUploaded?: (url: string) => void;
}

export default function ReceiptUploader({
  orderId,
  lang = "uz",
  currentReceipt,
  paymentStatus = "pending",
  rejectReason,
  onUploaded,
}: ReceiptUploaderProps) {
  const [receiptUrl, setReceiptUrl] = useState<string>(currentReceipt || "");
  const [status, setStatus] = useState<"pending" | "verifying" | "paid" | "rejected">(paymentStatus);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRu = lang === "ru";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg(isRu ? "Пожалуйста, загрузите изображение (JPG, PNG)" : "Iltimos, faqat rasm faylini yuklang (JPG, PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(isRu ? "Размер файла не должен превышать 10 МБ" : "Fayl hajmi 10MB dan oshmasligi kerak");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "receipt");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-upload-type": "receipt",
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
        throw new Error(uploadData.error || (isRu ? "Ошибка загрузки фото" : "Rasm yuklashda xatolik yuz berdi"));
      }

      const uploadedUrl = uploadData.url;

      // Update order with receipt URL
      const orderRes = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          paymentReceipt: uploadedUrl,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || (isRu ? "Не удалось обновить заказ" : "Buyurtmani yangilab bo'lmadi"));
      }

      setReceiptUrl(uploadedUrl);
      setStatus("verifying");
      if (onUploaded) onUploaded(uploadedUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (status === "paid") {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs">
            {isRu ? "Оплата успешно подтверждена!" : "To'lov muvaffaqiyatli tasdiqlandi!"}
          </p>
          <p className="text-[11px] text-emerald-500/80">
            {isRu ? "Заказ передан на комплектацию" : "Buyurtma tayyorlashga o'tkazildi"}
          </p>
        </div>
        {receiptUrl && (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px]">{isRu ? "Чек" : "Chek"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status banner */}
      {status === "verifying" && (
        <div className="p-3.5 rounded-2xl bg-violet-600/10 border border-violet-600/30 text-violet-300 flex items-start gap-3">
          <Clock className="w-4 h-4 text-violet-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "3s" }} />
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-violet-300">
              {isRu ? "Чек загружен — на проверке" : "To'lov cheki yuklandi — tekshirilmoqda"}
            </p>
            <p className="text-[11px] text-violet-300/80 mt-0.5">
              {isRu
                ? "Администратор проверяет оплату. Обычно это занимает 5-15 минут."
                : "Menejer to'lovni tekshirmoqda. Odatda bu 5-15 daqiqa vaqt oladi."}
            </p>
          </div>
          {receiptUrl && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="text-[11px] font-bold text-violet-400 underline shrink-0 cursor-pointer"
            >
              {isRu ? "Смотреть" : "Ko'rish"}
            </button>
          )}
        </div>
      )}

      {status === "rejected" && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold">{isRu ? "Чек был отклонён!" : "To'lov cheki qabul qilinmadi!"}</p>
            {rejectReason && (
              <p className="text-[11px] text-rose-400/90 mt-0.5">
                <span className="font-semibold">{isRu ? "Причина:" : "Sabab:"}</span> {rejectReason}
              </p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">
              {isRu ? "Пожалуйста, загрузите правильный скриншот перевода." : "Iltimos, to'g'ri to'lov skrinshotini qaytadan yuklang."}
            </p>
          </div>
        </div>
      )}

      {/* Upload button / Dropzone */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id={`receipt-input-${orderId}`}
          disabled={isUploading}
        />

        <label
          htmlFor={`receipt-input-${orderId}`}
          className={`flex items-center justify-between p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isUploading
              ? "opacity-50 pointer-events-none"
              : status === "verifying"
              ? "border-violet-600/30 bg-violet-600/5 hover:border-violet-600/50"
              : status === "rejected"
              ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500"
              : "border-[#2878F0]/30 bg-[#2878F0]/5 hover:border-[#2878F0]/60 hover:bg-[#2878F0]/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              status === "verifying"
                ? "bg-violet-600/20 text-violet-400"
                : status === "rejected"
                ? "bg-rose-500/20 text-rose-400"
                : "bg-[#2878F0] text-white"
            }`}>
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isUploading
                  ? isRu ? "Загрузка чека..." : "Chek yuklanmoqda..."
                  : receiptUrl
                  ? isRu ? "Заменить чек / Загрузить заново" : "Chekni almashtirish / Qayta yuklash"
                  : isRu ? "Загрузить чек об оплате" : "To'lov chekini (skrinshotini) yuklash"}
              </p>
              <p className="text-[10px] text-zinc-400">
                {isRu ? "Скриншот из Click, Payme или Uzum" : "Click, Payme yoki Uzum ilovasidan skrinshot"}
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#2878F0] text-white text-[11px] font-bold shrink-0 hover:bg-blue-600 transition-colors">
            {isUploading ? "..." : <Upload className="w-3.5 h-3.5" />}
          </div>
        </label>
      </div>

      {errorMsg && (
        <p className="text-[11px] font-bold text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
          {errorMsg}
        </p>
      )}

      {/* Image Preview Modal */}
      {previewOpen && receiptUrl && (
        <div
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-sm w-full bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
              <span className="text-xs font-bold">{isRu ? "Загруженный чек" : "Yuklangan to'lov cheki"}</span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#F8FAFC] dark:bg-[#090D14]">
              <Image src={receiptUrl} alt="Chek" fill className="object-contain" unoptimized />
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isRu ? "Закрыть" : "Yopish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
