import { useEffect, useState } from "react";

type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export default function MarketSnapshot() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/markets")
      .then(res => res.json())
      .then(data => {
        setAssets(data.assets);
        setUpdatedAt(data.updatedAt);
      });
  }, []);

  return (
    <div className="px-4 py-2 border-b border-bubble-border/30 text-sm">
      <div className="flex gap-4 overflow-x-auto">
        {assets.map(asset => (
          <div key={asset.symbol} className="flex gap-1 whitespace-nowrap">
            <span className="font-medium">{asset.name}</span>
            <span>{asset.price.toFixed(2)}</span>
            <span
              className={
                asset.change >= 0 ? "text-green-500" : "text-red-500"
              }
            >
              {asset.change >= 0 ? "+" : ""}
              {asset.change.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {updatedAt && (
        <div className="text-xs opacity-50 mt-1">
          Updated: {new Date(updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
