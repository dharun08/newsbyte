import React, { useState, useEffect } from 'react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketData {
  updatedAt: string;
  assets: MarketAsset[];
}

export const MarketSnapshot: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets');
        
        if (!response.ok) {
          throw new Error('Market fetch failed');
        }
        
        const data = await response.json();
        setMarketData(data);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load markets:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  // If error or loading, don't show anything (graceful degradation)
  if (hasError || isLoading || !marketData?.assets?.length) {
    return null;
  }

  return (
    <div className="border-b border-bubble-border/30 bg-gray-900/50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 px-4 py-3 min-w-max">
          {marketData.assets.map((asset) => {
            const isPositive = asset.change >= 0;
            
            return (
              <div key={asset.symbol} className="flex items-center gap-2 min-w-fit">
                <span className="text-xs font-medium text-gray-400">
                  {asset.name}
                </span>
                <span className="text-sm font-semibold text-white">
                  {asset.price.toLocaleString()}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {isPositive ? '▲' : '▼'} {Math.abs(asset.changePercent).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
