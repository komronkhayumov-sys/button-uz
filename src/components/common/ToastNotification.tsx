"use client";

import React, { useEffect } from "react";
import { CheckCircle2, ShoppingBag, Heart, Sparkles, X } from "lucide-react";

export type ToastType = "cart" | "wishlist" | "outfit" | "copy" | "success";

interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = "success",
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icon = {
    cart: <ShoppingBag className="w-4 h-4 text-[#E5A850]" />,
    wishlist: <Heart className="w-4 h-4 text-[#E5485D] fill-[#E5485D]" />,
    outfit: <Sparkles className="w-4 h-4 text-[#2878F0]" />,
    copy: <CheckCircle2 className="w-4 h-4 text-[#16A879]" />,
    success: <CheckCircle2 className="w-4 h-4 text-[#16A879]" />,
  }[type];

  return (
    <div className="fixed top-20 sm:top-6 right-4 sm:right-6 z-50 animate-slide-down">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-slate-800 shadow-2xl text-[#0F172A] dark:text-white text-xs font-bold">
        <div className="w-7 h-7 rounded-xl bg-[#F8FAFC] dark:bg-[#1e293b] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
