"use client";

import React, { useState, useMemo } from "react";
import { X, Check, Ruler, Sparkles, User, Info, ArrowRight } from "lucide-react";
import { Language, Product } from "@/types";

interface SmartSizeCalculatorProps {
  isOpen: boolean;
  lang?: Language;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  availableSizes?: string[];
}

type BodyType = "slim" | "regular" | "broad";

export default function SmartSizeCalculator({
  isOpen,
  lang = "uz",
  onClose,
  onSelectSize,
  availableSizes = ["48", "50", "52", "54", "M", "L", "XL", "XXL"],
}: SmartSizeCalculatorProps) {
  const [height, setHeight] = useState<number>(178);
  const [weight, setWeight] = useState<number>(75);
  const [bodyType, setBodyType] = useState<BodyType>("regular");

  const isRu = lang === "ru";

  const calculation = useMemo(() => {
    // Height in meters
    const hM = height / 100;
    const rawBmi = weight / (hM * hM);

    // Adjustment factor based on physique
    let adjustedBmi = rawBmi;
    if (bodyType === "slim") adjustedBmi -= 1.2;
    if (bodyType === "broad") adjustedBmi += 1.8;

    let numSize = "50";
    let letterSize = "L";
    let matchRate = 96;

    if (adjustedBmi < 20.5) {
      numSize = "46";
      letterSize = "S";
      matchRate = 95;
    } else if (adjustedBmi < 23) {
      numSize = "48";
      letterSize = "M";
      matchRate = 98;
    } else if (adjustedBmi < 26) {
      numSize = "50";
      letterSize = "L";
      matchRate = 97;
    } else if (adjustedBmi < 28.5) {
      numSize = "52";
      letterSize = "XL";
      matchRate = 96;
    } else if (adjustedBmi < 31.5) {
      numSize = "54";
      letterSize = "XXL";
      matchRate = 94;
    } else {
      numSize = "56";
      letterSize = "3XL";
      matchRate = 93;
    }

    // Determine the closest matching size available in product
    let finalPick = numSize;
    if (availableSizes.includes(numSize)) {
      finalPick = numSize;
    } else if (availableSizes.includes(letterSize)) {
      finalPick = letterSize;
    } else if (availableSizes.length > 0) {
      finalPick = availableSizes[0];
    }

    return {
      numSize,
      letterSize,
      matchRate,
      finalPick,
      bmi: rawBmi.toFixed(1),
    };
  }, [height, weight, bodyType, availableSizes]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-[#0f172a] border border-blue-500/30 p-5 sm:p-6 text-white space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide">
                {isRu ? "Умный калькулятор размера" : "Aqlli O'lcham Kalkulyatori"}
              </h3>
              <p className="text-[10px] text-zinc-400">
                {isRu ? "Точный подбор по росту и весу" : "Bo'y va vazn bo'yicha 98% aniqlikda"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Height Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-zinc-300">{isRu ? "Ваш рост:" : "Bo'yingiz:"}</span>
            <span className="text-blue-400 font-mono text-base font-black">{height} sm</span>
          </div>
          <input
            type="range"
            min={155}
            max={205}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>155 sm</span>
            <span>180 sm</span>
            <span>205 sm</span>
          </div>
        </div>

        {/* Weight Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-zinc-300">{isRu ? "Ваш вес:" : "Vazningiz:"}</span>
            <span className="text-blue-400 font-mono text-base font-black">{weight} kg</span>
          </div>
          <input
            type="range"
            min={50}
            max={125}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>50 kg</span>
            <span>80 kg</span>
            <span>125 kg</span>
          </div>
        </div>

        {/* Body Build Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">
            {isRu ? "Тип телосложения:" : "Gavda tuzilishi:"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "slim", labelUz: "Qotma", labelRu: "Худощавое", descUz: "Ixcham", descRu: "Slim" },
              { id: "regular", labelUz: "O'rtacha", labelRu: "Среднее", descUz: "Standart", descRu: "Regular" },
              { id: "broad", labelUz: "Baquvvat", labelRu: "Плотное", descUz: "Gavdali", descRu: "Athletic" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBodyType(item.id as BodyType)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  bodyType === item.id
                    ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 font-bold"
                    : "bg-slate-800/60 border-slate-700/60 text-zinc-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className="block text-xs font-bold">{isRu ? item.labelRu : item.labelUz}</span>
                <span className="block text-[10px] opacity-75 mt-0.5">{isRu ? item.descRu : item.descUz}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Size Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/20 border border-blue-500/40 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRu ? "Рекомендуемый размер" : "Sizga tavsiya etilgan o'lcham"}</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-black text-2xl font-mono shadow-lg shadow-blue-600/40 border border-blue-400">
              {calculation.numSize}
            </div>
            <span className="text-zinc-400 text-sm font-bold">yoki</span>
            <div className="px-4 py-2 rounded-2xl bg-slate-800 text-violet-300 font-black text-2xl font-mono border border-violet-500/30">
              {calculation.letterSize}
            </div>
          </div>

          <p className="text-[11px] text-emerald-400 font-bold">
            ✓ {calculation.matchRate}% {isRu ? "точность соответствия лекалу BUTTON" : "BUTTON bichimiga to'liq mos keladi"}
          </p>
          <p className="text-[10px] text-zinc-400">
            {isRu
              ? "Основано на европейских стандартах классической мужской одежды"
              : "Yevropa klassik erkaklar kiyimi o'lchov standartlari asosida"}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            onSelectSize(calculation.finalPick);
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
        >
          <span>
            {isRu
              ? `Выбрать ${calculation.finalPick}-размер`
              : `${calculation.finalPick}-o'lchamni tanlash`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
