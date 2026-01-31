export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Get query parameters from URL
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || 'sports';
  const country = url.searchParams.get('country') || 'in';
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers }
    );
  }

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${category}&country=${country}&max=3&lang=en&token=${apiKey}`
    );
    const data = await response.json();
    
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news' }),
      { status: 500, headers }
    );
  }
}
