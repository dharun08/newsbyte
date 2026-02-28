import { useState, useEffect } from "react";

interface MetalData {
  updatedAt: string;
  gold: {
    perGram24K: number;
    perGram22K: number;
    delta: number;
    deltaPercent: number;
  };
  silver: {
    perGram: number;
    delta: number;
    deltaPercent: number;
  };
  note: string;
}

export default function MarketSnapshot() {
  const [data, setData] = useState<MetalData | null>(null);

  useEffect(() => {
    fetch("/api/metalRates")
      .then(res => res.json())
      .then((json: MetalData) => setData(json))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="border-b border-bubble-border/30 bg-brand-dark/60 backdrop-blur px-4 py-2">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-primary">

        {/* GOLD */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-yellow-400">Gold 22K</span>
          <span>₹ {data.gold.perGram22K.toLocaleString()}</span>
          <span
            className={`text-xs ${
              data.gold.delta >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {data.gold.delta >= 0 ? "▲" : "▼"} ₹ {Math.abs(data.gold.delta)}
          </span>
        </div>

        {/* SILVER */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-300">Silver</span>
          <span>₹ {data.silver.perGram.toLocaleString()}</span>
          <span
            className={`text-xs ${
              data.silver.delta >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ₹ {Math.abs(data.silver.delta)}
          </span>
        </div>

        {/* Updated Time */}
        <div className="text-xs text-text-secondary">
          {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
      </div>

      {/* Subtle Note */}
      <div className="text-[10px] text-text-secondary/60 text-center mt-1">
        Spot price converted from international market (per troy ounce). 22K = 91.6% purity. Excludes GST & making charges.
      </div>
    </div>
  );
}
