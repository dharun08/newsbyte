import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // ⚠️ Replace with your real data sources later
    // For now using placeholder demo values

    const assets = [
      { label: "Gold", icon: "🪙", price: "₹62,350", change: "+0.4%" },
      { label: "Silver", icon: "🥈", price: "₹74,120", change: "-0.2%" },
      { label: "Sensex", icon: "📈", price: "72,110", change: "+0.6%" },
      { label: "Nasdaq", icon: "💻", price: "15,320", change: "-0.3%" }
    ];

    res.status(200).json({ assets });
  } catch (e) {
    res.status(500).json({ error: "Market fetch failed" });
  }
}
