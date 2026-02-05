import React, { useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  value: string;
  change: string;
  icon: string;
};

const MarketSnapshot: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    // TEMP static values (V1)
    setAssets([
      { id: "gold", name: "Gold", value: "₹62,450", change: "+0.6%", icon: "🥇" },
      { id: "silver", name: "Silver", value: "₹73,200", change: "-0.3%", icon: "🥈" },
      { id: "sensex", name: "Sensex", value: "72,110", change: "+0.4%", icon: "🇮🇳" },
      { id: "nasdaq", name: "Nasdaq", value: "15,420", change: "+0.5%", icon: "🌎" },
    ]);

    const now = new Date();
    setUpdatedAt(
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, []);

  return (
    <div className="px-4 py-2 border-b border-bubble-border/30 bg-brand-dark/40">
      <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
        <span>Market Snapshot</span>
        <span>Updated {updatedAt}</span>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {assets.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span>{a.icon}</span>
            <span className="text-text-primary font-medium">{a.name}</span>
            <span>{a.value}</span>
            <span
              className={
                a.change.startsWith("-")
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              {a.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSnapshot;
