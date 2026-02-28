import { useState, useEffect } from 'react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  delta: number;
  deltaPercent: number;
}

interface MarketSnapshotData {
  assets: MarketAsset[];
}

export default function MarketSnapshot() {
  const [data, setData] = useState<MarketSnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/metalRates')
      .then(res => res.json())
      .then((json: MarketSnapshotData) => {
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
      <div className="p-3 border-b border-gray-200 text-center text-sm">
        Markets loading...
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex gap-6 justify-center text-sm">
        {data.assets.map(asset => (
          <div key={asset.symbol} className="text-center">
            <div className="font-bold">{asset.name}</div>
            <div>₹ {asset.price.toLocaleString()}</div>
            <div className={asset.delta >= 0 ? 'text-green-600' : 'text-red-600'}>
              {asset.delta >= 0 ? '▲' : '▼'} {asset.delta.toFixed(2)} (
              {asset.deltaPercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
