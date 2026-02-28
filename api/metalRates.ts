export default async function handler(req: any, res: any) {
  try {
    const apiKey = process.env.GOLD_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const [goldRes, silverRes] = await Promise.all([
      fetch("https://www.goldapi.io/api/XAU/INR", {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json"
        }
      }),
      fetch("https://www.goldapi.io/api/XAG/INR", {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json"
        }
      })
    ]);

    if (!goldRes.ok || !silverRes.ok) {
      throw new Error("GoldAPI request failed");
    }

    const gold = await goldRes.json();
    const silver = await silverRes.json();

    const OUNCE_TO_GRAM = 31.1035;

   const goldDeltaPerGram = gold.ch / OUNCE_TO_GRAM;
   const goldDelta22KPerGram = goldDeltaPerGram * 0.916;

   const silverDeltaPerGram = silver.ch / OUNCE_TO_GRAM;

    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      gold: {
  perGram24K: Number(gold24KPerGram.toFixed(2)),
  perGram22K: Number(gold22KPerGram.toFixed(2)),
  delta: Number(goldDelta22KPerGram.toFixed(2)),
  deltaPercent: gold.chp
},
silver: {
  perGram: Number(silverPerGram.toFixed(2)),
  delta: Number(silverDeltaPerGram.toFixed(2)),
  deltaPercent: silver.chp
},
      note: "Converted from international spot price (XAU/XAG per troy ounce in INR). 22K calculated at 91.6% purity. Excludes GST, import duty, and making charges."
    });
  } catch (error) {
    console.error("Metal API error:", error);
    return res.status(500).json({ error: "Failed to fetch metal prices" });
  }
}
