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

    // GOLD
    const gold24KPerGram = gold.price / OUNCE_TO_GRAM;
    const gold22KPerGram = gold24KPerGram * 0.916;

    // SILVER (usually 99.9%)
    const silverPerGram = silver.price / OUNCE_TO_GRAM;

    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      gold: {
        perGram24K: Number(gold24KPerGram.toFixed(2)),
        perGram22K: Number(gold22KPerGram.toFixed(2)),
        delta: gold.ch,
        deltaPercent: gold.chp
      },
      silver: {
        perGram: Number(silverPerGram.toFixed(2)),
        delta: silver.ch,
        deltaPercent: silver.chp
      },
      note: "Converted from international spot price (XAU/XAG per troy ounce in INR). 22K calculated at 91.6% purity. Excludes GST, import duty, and making charges."
    });
  } catch (error) {
    console.error("Metal API error:", error);
    return res.status(500).json({ error: "Failed to fetch metal prices" });
  }
}
