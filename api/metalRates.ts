let cache: any = null;
let lastFetch = 0;

const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

export default async function handler(req: any, res: any) {
  if (cache && Date.now() - lastFetch < CACHE_DURATION) {
    return res.status(200).json(cache);
  }

  try {
    const goldRes = await fetch("https://www.goldapi.io/api/XAU/INR", {
      headers: {
        "x-access-token": process.env.GOLDAPI_KEY as string
      }
    });

    const silverRes = await fetch("https://www.goldapi.io/api/XAG/INR", {
      headers: {
        "x-access-token": process.env.GOLDAPI_KEY as string
      }
    });

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();

    const gold22kPerGram =
      (goldData.price_gram_22k || 0);

    const silverPerGram =
      (silverData.price / 31.1035) || 0; 
    // silver price returned per ounce → convert to gram

    const assets = [
      {
        symbol: "XAU",
        name: "Gold (22K)",
        price: gold22kPerGram,
        delta: goldData.ch || 0,
        deltaPercent: goldData.chp || 0
      },
      {
        symbol: "XAG",
        name: "Silver",
        price: silverPerGram,
        delta: silverData.ch || 0,
        deltaPercent: silverData.chp || 0
      }
    ];

    cache = {
      updatedAt: new Date().toISOString(),
      assets
    };

    lastFetch = Date.now();

    res.status(200).json(cache);
  } catch (error) {
    console.error("Metal API error:", error);
    res.status(500).json({ error: "Failed to fetch metal rates" });
  }
}
