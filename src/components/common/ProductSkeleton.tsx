"use client";

import React from "react";

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl bg-white dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800 p-3 space-y-3 animate-pulse shadow-xs"
        >
          {/* Image skeleton */}
          <div className="relative aspect-[3/4] rounded-2xl bg-[#F1F5F9] dark:bg-[#1e293b] w-full" />

          {/* Details skeleton */}
          <div className="space-y-2">
            <div className="h-3.5 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-md w-3/4" />
            <div className="h-3 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-md w-1/2" />
            <div className="flex items-center gap-1.5 pt-1">
              <div className="h-4 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-md w-8" />
              <div className="h-4 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-md w-8" />
              <div className="h-4 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-md w-8" />
            </div>
            <div className="h-8 bg-[#F1F5F9] dark:bg-[#1e293b] rounded-xl w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
