let cache: any = null;
let lastFetch = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

export default async function handler(req: any, res: any) {
  if (cache && Date.now() - lastFetch < CACHE_DURATION) {
    return res.status(200).json(cache);
  }

  try {
    const url =
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F,SI=F,^BSESN,^NSEI,^IXIC";

    const response = await fetch(url);
    const data = await response.json();

    const mapped = data.quoteResponse.result.map((item: any) => ({
      symbol: item.symbol,
      name: item.shortName,
      price: item.regularMarketPrice,
      change: item.regularMarketChange,
      changePercent: item.regularMarketChangePercent
    }));

    cache = {
      updatedAt: new Date().toISOString(),
      assets: mapped
    };

    lastFetch = Date.now();

    res.status(200).json(cache);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Market fetch failed" });
  }
}
