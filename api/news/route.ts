// api/news/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'in';
    const category = searchParams.get('category') || 'general';
    
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key missing' }, { status: 500 });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=3&apiKey=${apiKey}`
    );

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
