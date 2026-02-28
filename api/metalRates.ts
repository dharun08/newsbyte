export default async function handler(req: any, res: any) {
  try {
    const apiKey = process.env.GOLD_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const goldResponse = await fetch("https://www.goldapi.io/api/XAU/INR", {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json"
      }
    });

    const silverResponse = await fetch("https://www.goldapi.io/api/XAG/INR", {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error("GoldAPI request failed");
    }

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      assets: [
        {
          symbol: "XAU",
          name: "Gold",
          price: goldData.price,
          delta: goldData.ch,
          deltaPercent: goldData.chp
        },
        {
          symbol: "XAG",
          name: "Silver",
          price: silverData.price,
          delta: silverData.ch,
          deltaPercent: silverData.chp
        }
      ]
    });
  } catch (error) {
    console.error("Metal API error:", error);
    return res.status(500).json({ error: "Failed to fetch metal prices" });
  }
}
