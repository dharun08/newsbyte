// components/MarketSnapshot.tsx (NEW - add this file)
'use client';
import { useState, useEffect } from 'react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketSnapshot {
  updatedAt: string;
  assets: MarketAsset[];
}

export default function MarketSnapshot() {
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/markets')
      .then(res => res.json())
      .then((json: MarketSnapshot) => {
        setData(json);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-3 border-b border-gray-200">
        <div className="text-center text-sm text-gray-500">Markets loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Graceful degradation - news still works
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-3 border-b border-gray-200">
      <div className="flex overflow-x-auto gap-4 text-xs pb-2">
        {data.assets.map(asset => (
          <div key={asset.symbol} className="min-w-[110px] text-center flex-shrink-0">
            <div className="font-mono font-bold text-xs mb-1">{asset.symbol}</div>
            <div className="text-gray-600 text-xs mb-1">{asset.name}</div>
            <div className="font-bold text-lg leading-tight">
              ${asset.price.toLocaleString()}
            </div>
            <div 
              className={`font-mono text-xs ${
                asset.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)} (
              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 text-center">
        Updated: {new Date(data.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
