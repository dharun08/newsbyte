let cache: any = null;
let lastFetch = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Serve cache if valid
  if (cache && Date.now() - lastFetch < CACHE_DURATION) {
    return res.status(200).json(cache);
  }

  const url =
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F,SI=F,^BSESN,^NSEI,^IXIC";

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (
      !data ||
      !data.quoteResponse ||
      !Array.isArray(data.quoteResponse.result)
    ) {
      throw new Error("Invalid Yahoo response");
    }

    const mapped = data.quoteResponse.result.map((item: any) => ({
      symbol: item.symbol || "",
      name: item.shortName || item.symbol,
      price: Number(item.regularMarketPrice || 0),
      change: Number(item.regularMarketChange || 0),
      changePercent: Number(item.regularMarketChangePercent || 0)
    }));

    cache = {
      updatedAt: new Date().toISOString(),
      assets: mapped
    };

    lastFetch = Date.now();

    return res.status(200).json(cache);
  } catch (err) {
    console.error("Market API error:", err);

    // Return old cache if exists
    if (cache) {
      return res.status(200).json(cache);
    }

    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      assets: []
    });
  }
}
