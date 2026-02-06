// api/markets.ts (Vercel serverless - your current is perfect, just minor polish)
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours (your choice ✅)

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketSnapshot {
  updatedAt: string;
  assets: MarketAsset[];
}

let cachedData: MarketSnapshot | null = null;
let cacheTimestamp = 0;

const TRACKED_SYMBOLS = [
  { symbol: '^BSESN', name: 'Sensex' },      // India - Bombay Stock Exchange
  { symbol: '^NSEI', name: 'Nifty 50' },     // India - National Stock Exchange  
  { symbol: '^DJI', name: 'Dow Jones' },     // US
  { symbol: 'GC=F', name: 'Gold' },          // Commodities
  { symbol: 'BTC-USD', name: 'Bitcoin' }     // Crypto
];

async function fetchYahooFinance(symbol: string): Promise<MarketAsset | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const quote = data?.chart?.result?.[0]?.meta;
    if (!quote) return null;

    // Robust price extraction (handles Yahoo path variations)
    const regularPrice = quote.regularMarketPrice || quote.currentPrice || quote.regularMarketPreviousClose;
    const price = parseFloat(regularPrice?.toFixed(2)) || 0;
    const previousClose = parseFloat(quote.previousClose?.toFixed(2)) || price;
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const tracked = TRACKED_SYMBOLS.find(s => s.symbol === symbol);
    return {
      symbol,
      name: tracked?.name || symbol,
      price,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const results = await Promise.all(TRACKED_SYMBOLS.map(s => fetchYahooFinance(s.symbol)));
  const assets = results.filter((a): a is MarketAsset => a !== null);
  
  return {
    updatedAt: new Date().toISOString(),
    assets
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
      console.log('Returning cached market data');
      res.status(200).json(cachedData);
      return;
    }

    // Fetch fresh
    console.log('Fetching fresh market data');
    const snapshot = await getMarketSnapshot();
    
    // Update cache
    cachedData = snapshot;
    cacheTimestamp = now;
    
    res.status(200).json(snapshot);
  } catch (error) {
    console.error('Market API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
