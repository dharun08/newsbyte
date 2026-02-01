import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory counter (resets on cold starts, but we'll improve this)
let globalCounter = 0;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return current count
    res.status(200).json({ count: globalCounter });
  } else if (req.method === 'POST') {
    // Increment counter
    globalCounter++;
    res.status(200).json({ count: globalCounter });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
