import React, { useEffect, useState } from "react";

type Asset = {
  label: string;
  icon: string;
  price: string;
  change: string;
};

const MarketSnapshot: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    fetchSnapshot();
  }, []);

  async function fetchSnapshot() {
    try {
      const res = await fetch("/api/markets");
      const data = await res.json();

      setAssets(data.assets);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Market snapshot fetch failed", err);
    }
  }

  return (
    <div className="px-4 py-2 border-b border-bubble-border/30">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {assets.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-2 min-w-max bg-brand-dark/60 px-3 py-2 rounded-lg"
          >
            <span className="text-lg">{a.icon}</span>

            <div>
              <p className="text-xs text-text-secondary">{a.label}</p>
              <p className="text-sm font-semibold text-text-primary">
                {a.price}{" "}
                <span
                  className={
                    a.change.startsWith("-")
                      ? "text-red-400"
                      : "text-green-400"
                  }
                >
                  {a.change}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-text-secondary mt-1">
        Updated {updatedAt}
      </p>
    </div>
  );
};

export default MarketSnapshot;
