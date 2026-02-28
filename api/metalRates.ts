export default async function handler(req: any, res: any) {
  return res.status(200).json({
    assets: [
      {
        symbol: "XAU",
        name: "Gold",
        price: 6200,
        delta: 12,
        deltaPercent: 0.19
      },
      {
        symbol: "XAG",
        name: "Silver",
        price: 75,
        delta: -0.4,
        deltaPercent: -0.53
      }
    ]
  });
}
