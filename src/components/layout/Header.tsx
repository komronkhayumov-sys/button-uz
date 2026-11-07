import React from 'react';
import { STORE_NAME } from '@/constants';

export const Header: React.FC = () => {
  const isOpen = true; // For now, we'll assume it's open

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <h1 className="text-xl font-bold text-gray-900">{STORE_NAME}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {isOpen ? 'Ochiq' : 'Yopiq'}
          </span>
        </div>
      </div>
    </header>
  );
};
