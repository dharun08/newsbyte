import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { NewsArticle } from './types';
import { NewsCard } from './components/NewsCard';
import { TabNavigation } from './components/TabNavigation';
import { RegionToggle } from './components/RegionToggle';
import {
  SPORTS_KEYWORDS,
  BUSINESS_KEYWORDS,
  TECH_KEYWORDS,
  POLITICS_KEYWORDS,
  ENTERTAINMENT_KEYWORDS,
  HEALTH_KEYWORDS
} from "./keywordLibrary";

// ----------------------------
// CONFIG
// ----------------------------

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CachedNews {
  data: NewsArticle[];
  timestamp: number;
}

// ----------------------------
// UI PARTS
// ----------------------------

const Header: React.FC<{ region: 'in' | 'us'; onRegionChange: (region: 'in' | 'us') => void }> = ({
  region,
  onRegionChange
}) => (
  <div className="p-4 border-b border-bubble-border/30 flex items-center justify-between">
    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2BB0E6] to-[#1E8FB3]">
      🗞️ NewsByte
    </h1>
    <RegionToggle region={region} onRegionChange={onRegionChange} />
  </div>
);

const Footer: React.FC = () => (
  <div className="p-3 border-t border-bubble-border/30 text-center bg-brand-dark/50">
    <p className="text-xs text-text-secondary/80">
      Built by{' '}
      <a
        href="https://www.linkedin.com/in/dharunkumar08/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-cyan hover:text-accent-blue underline font-medium transition-colors"
      >
        Dharun Kumar
      </a>
      {' | Powered by GNews API'}
    </p>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2BB0E6]"></div>
  </div>
);

// ----------------------------
// INTELLIGENCE LAYER
// ----------------------------

function normalizeArticles(raw: any[]) {
  return raw.map(item => ({
    title: (item.title || "").trim(),
    description: (item.description || "").trim(),
    url: item.url,
    source: item.source?.name || "Unknown",
    image: item.image || item.urlToImage,
    publishedAt: new Date(item.publishedAt).getTime()
  }));
}

function basicQualityFilter(list: any[]) {
  const now = Date.now();
  const MAX_AGE = 48 * 60 * 60 * 1000; // 48 hours

  return list.filter(a => {
    if (!a.title) return false;
    if (!a.publishedAt) return false;
    if (now - a.publishedAt > MAX_AGE) return false;
    return true;
  });
}

function deduplicateArticles(list: any[]) {
  const seen = new Set<string>();

  return list.filter(a => {
    const key = a.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreArticles(list: any[], category: string) {
  const now = Date.now();

  let keywords: string[] = [];

  if (category === "sports") keywords = SPORTS_KEYWORDS;
  if (category === "business") keywords = BUSINESS_KEYWORDS;
  if (category === "technology") keywords = TECH_KEYWORDS;
  if (category === "politics") keywords = POLITICS_KEYWORDS;
  if (category === "entertainment") keywords = ENTERTAINMENT_KEYWORDS;
  if (category === "health") keywords = HEALTH_KEYWORDS;

  return list.map(a => {
    let score = 0;

    const hoursOld = (now - a.publishedAt) / 3600000;

    // Freshness
    if (hoursOld < 6) score += 6;
    else if (hoursOld < 12) score += 4;
    else if (hoursOld < 24) score += 2;

    // Title & description richness
    if (a.title.length > 60) score += 2;
    if (a.description.length > 80) score += 2;

    // Soft keyword relevance
    const text = (a.title + " " + a.description).toLowerCase();
    const hits = keywords.filter(k => text.includes(k)).length;
    score += Math.min(hits * 2, 8);

    return { ...a, score };
  });
}

// ----------------------------
// APP
// ----------------------------

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sports');
  const [region, setRegion] = useState<'in' | 'us'>('in');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cache, setCache] = useState<Record<string, CachedNews>>({});

  const getCacheKey = (category: string, country: string) =>
    `${category}-${country}`;

  const fetchNews = async (category: string, country: string) => {
    const cacheKey = getCacheKey(category, country);
    const cached = cache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setNews(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/news?category=${category}&country=${country}`
      );

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();

      const normalized = normalizeArticles(data.articles || []);
      const quality = basicQualityFilter(normalized);
      const deduped = deduplicateArticles(quality);
      const scored = scoreArticles(deduped, category);
      const ranked = scored.sort((a, b) => b.score - a.score);

      let articles: NewsArticle[] = ranked.slice(0, 3);

      // Safety padding
      if (articles.length < 3) {
        const extra = normalized.slice(0, 3 - articles.length);
        articles = [...articles, ...extra];
      }

      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: articles, timestamp: Date.now() }
      }));

      setNews(articles);
    } catch (error) {
      console.error("News fetch error:", error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeTab, region);
  }, [activeTab, region]);

  const regionLabel = region === "in" ? "INDIA" : "GLOBAL";

  return (
    <>
      <div className="flex flex-col h-screen font-sans bg-brand-darker">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-brand-dark/90 backdrop-blur-lg border border-bubble-border/30 shadow-2xl shadow-black/50 sm:rounded-xl my-0 sm:my-4 sm:h-[calc(100%-2rem)]">

          <Header region={region} onRegionChange={setRegion} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-grow p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              📰 LATEST {activeTab.toUpperCase()} NEWS ({regionLabel})
            </h2>

            {isLoading ? (
              <LoadingSpinner />
            ) : news.length > 0 ? (
              news.map((article, index) => (
                <NewsCard key={index} article={article} index={index} />
              ))
            ) : (
              <p className="text-center text-text-secondary py-10">
                No news available.
              </p>
            )}
          </div>

          <Footer />
        </div>
      </div>
      <Analytics />
    </>
  );
};

export default App;
