import React, { useState } from "react";

type Article = {
  title: string;
  description: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: number;
  category: string;
  region: string;
  score?: number;
};

const SPORTS_KEYWORDS = [
  "cricket","football","soccer","tennis","badminton","hockey","kabaddi",
  "match","matches","tournament","league","cup","series","championship",
  "ipl","bpl","psl","big bash","world cup","asian cup","test","odi","t20",
  "goal","run","runs","wicket","bat","ball","innings","strike","defence",
  "coach","manager","captain","player","squad","team","fixture","points table",
  "qualifier","final","semi-final","playoff","draft","transfer","injury",
  "medal","olympics","asian games","commonwealth","ranking","rankings"
];

const INDIA_KEYWORDS = [
  "india","indian","bharat","team india",
  "delhi","mumbai","chennai","bengaluru","bangalore","hyderabad",
  "kolkata","pune","ahmedabad","jaipur","kochi","trivandrum",
  "mohali","chandigarh","lucknow","kanpur","nagpur","indore",
  "guwahati","patna","bhubaneswar","ranchi","raipur","vizag",
  "thiruvananthapuram","trivandrum","kerala","tamil nadu",
  "karnataka","maharashtra","gujarat","rajasthan","telangana",
  "andhra pradesh","odisha","west bengal","punjab","haryana",
  "uttar pradesh","madhya pradesh","bihar","jharkhand","assam"
];

export default function App() {
  const [category, setCategory] = useState("sports");
  const [region, setRegion] = useState("india");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // MAIN FETCH FUNCTION
  // -------------------------
  async function fetchNews() {
    setLoading(true);

    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=50&apikey=${import.meta.env.VITE_GNEWS_KEY}`
    );

    const data = await res.json();

    const normalized = normalizeArticles(data.articles || []);
    const hardFiltered = hardFilterArticles(normalized);
    const deduped = deduplicateArticles(hardFiltered);
    const scored = scoreArticles(deduped);
    const sorted = scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    const top3 = sorted.slice(0, 3);

    setArticles(top3);
    setLoading(false);
  }

  // -------------------------
  // NORMALIZE
  // -------------------------
  function normalizeArticles(raw: any[]): Article[] {
    return raw.map((a) => ({
      title: cleanText(a.title),
      description: cleanText(a.description || ""),
      url: a.url,
      image: a.image,
      source: a.source?.name || "Unknown",
      publishedAt: new Date(a.publishedAt).getTime(),
      category,
      region
    }));
  }

  function cleanText(text: string) {
    return text.replace(/\s+/g, " ").trim();
  }

  // -------------------------
  // HARD FILTER
  // -------------------------
  function hardFilterArticles(list: Article[]) {
    const now = Date.now();
    const TWO_DAYS = 48 * 60 * 60 * 1000;

    return list.filter((a) => {
      const text = (a.title + " " + a.description).toLowerCase();

      const hasSport = SPORTS_KEYWORDS.some(k => text.includes(k));
      const hasIndia = INDIA_KEYWORDS.some(k => text.includes(k));
      const fresh = a.publishedAt >= now - TWO_DAYS;

      return hasSport && hasIndia && fresh;
    });
  }

  // -------------------------
  // DEDUPLICATE
  // -------------------------
  function deduplicateArticles(list: Article[]) {
    const seen = new Set<string>();
    return list.filter(a => {
      const key = a.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // -------------------------
  // SCORING
  // -------------------------
  function scoreArticles(list: Article[]) {
    const now = Date.now();

    return list.map(a => {
      let score = 0;

      // Recency
      const hoursOld = (now - a.publishedAt) / 3600000;
      if (hoursOld < 6) score += 5;
      else if (hoursOld < 12) score += 4;
      else if (hoursOld < 24) score += 3;
      else score += 1;

      // Headline richness
      if (a.title.length > 60) score += 2;

      // Description present
      if (a.description.length > 80) score += 2;

      // Keyword density
      const text = (a.title + " " + a.description).toLowerCase();
      const sportHits = SPORTS_KEYWORDS.filter(k => text.includes(k)).length;
      score += Math.min(sportHits, 5);

      return { ...a, score };
    });
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-xl font-bold mb-4">Daily 3 News</h1>

      <div className="flex gap-3 mb-6">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 p-2 rounded">
          <option value="sports">Sports</option>
          <option value="business">Business</option>
          <option value="technology">Technology</option>
        </select>

        <select value={region} onChange={e => setRegion(e.target.value)}
          className="bg-slate-800 p-2 rounded">
          <option value="india">India</option>
        </select>

        <button
          onClick={fetchNews}
          className="bg-cyan-600 px-4 rounded hover:bg-cyan-700"
        >
          Fetch
        </button>
      </div>

      {loading && <p>Fetching best articles...</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {articles.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
            className="bg-slate-800 p-4 rounded hover:bg-slate-700 transition">
            <h2 className="font-semibold mb-2">{a.title}</h2>
            <p className="text-sm opacity-80 mb-3">{a.description}</p>
            <p className="text-xs opacity-60">{a.source}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
