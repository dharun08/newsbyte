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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metalRates")
      .then(res => res.json())
      .then((json: MetalData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-3 border-b text-center text-sm">
        Metals loading...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 border-b bg-gray-50 text-sm">
      <div className="flex flex-wrap gap-8 justify-center">

        {/* GOLD */}
        <div className="text-center">
          <div className="font-bold text-base mb-1">Gold (per gram)</div>
          <div>24K: ₹ {data.gold.perGram24K.toLocaleString()}</div>
          <div>22K: ₹ {data.gold.perGram22K.toLocaleString()}</div>
          <div
            className={`text-xs mt-1 ${
              data.gold.delta >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.gold.delta >= 0 ? "▲" : "▼"}{" "}
            {data.gold.deltaPercent.toFixed(2)}%
          </div>
        </div>

        {/* SILVER */}
        <div className="text-center">
          <div className="font-bold text-base mb-1">Silver (per gram)</div>
          <div>₹ {data.silver.perGram.toLocaleString()}</div>
          <div
            className={`text-xs mt-1 ${
              data.silver.delta >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.silver.delta >= 0 ? "▲" : "▼"}{" "}
            {data.silver.deltaPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-3 text-center">
        Updated: {new Date(data.updatedAt).toLocaleString()}
      </div>

      <div className="text-[11px] text-gray-500 mt-2 text-center max-w-3xl mx-auto">
        {data.note}
      </div>
    </div>
  );
}
