'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
}

export function StockCard({ symbol, price, change }: StockCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 min-w-[140px]">
      <p className="text-sm text-gray-400 font-medium">{symbol}</p>
      <p className="text-xl font-bold text-white mt-1">${price.toFixed(2)}</p>
      <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  );
}

interface MarketIndexProps {
  name: string;
  value: number;
  change: number;
}

export function MarketIndex({ name, value, change }: MarketIndexProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 flex-1">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-400 font-medium">{name}</p>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value.toLocaleString()}</p>
      <p className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}{change.toFixed(1)}%
      </p>
    </div>
  );
}
