import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { NewsArticle } from './types';
import { NewsCard } from './components/NewsCard';
import { TabNavigation } from './components/TabNavigation';
import { RegionToggle } from './components/RegionToggle';
import { MarketSnapshot} from "./components/MarketSnapshot";
import {
  SPORTS_KEYWORDS,
  BUSINESS_KEYWORDS,
  TECH_KEYWORDS,
  POLITICS_KEYWORDS,
  ENTERTAINMENT_KEYWORDS,
  HEALTH_KEYWORDS,
  INDIA_KEYWORDS,
  US_KEYWORDS,
  GLOBAL_KEYWORDS,
  PREMIUM_SOURCES
} from './keywordLibrary';

// ----------------------------
// CONFIG
// ----------------------------

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CachedNews {
  data: NewsArticle[];
  timestamp: number;
}

// ----------------------------
// UI COMPONENTS
// ----------------------------

const Header: React.FC<{
  region: 'in' | 'us';
  onRegionChange: (region: 'in' | 'us') => void;
}> = ({ region, onRegionChange }) => (
  <div className="p-4 border-b border-bubble-border/30 flex items-center justify-between">
    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-600">
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
        className="text-cyan-400 hover:text-cyan-300 underline font-medium transition-colors"
      >
        Dharun Kumar
      </a>
      <span> | Powered by GNews API | v2.0</span>
    </p>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
  </div>
);

// ----------------------------
// HELPER FUNCTIONS
// ----------------------------

function getCategoryKeywords(category: string): string[] {
  const map: Record<string, string[]> = {
    sports: SPORTS_KEYWORDS,
    business: BUSINESS_KEYWORDS,
    technology: TECH_KEYWORDS,
    politics: POLITICS_KEYWORDS,
    entertainment: ENTERTAINMENT_KEYWORDS,
    health: HEALTH_KEYWORDS,
  };
  return map[category] || [];
}

function getRegionKeywords(region: 'in' | 'us'): string[] {
  if (region === 'in') return INDIA_KEYWORDS;
  return [...US_KEYWORDS, ...GLOBAL_KEYWORDS];
}

function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matches = 0;

  for (const keyword of keywords) {
    // Escape special regex characters
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundary for better matching
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText)) {
      matches++;
    }
  }

  return matches;
}

// ----------------------------
// DATA PROCESSING PIPELINE
// ----------------------------

function normalizeArticles(raw: any[]) {
  return raw.map((item) => ({
    title: (item.title || '').trim(),
    description: (item.description || '').trim(),
    url: item.url,
    source: item.source?.name || 'Unknown',
    image: item.image || item.urlToImage,
    content: item.content,
    publishedAt: item.publishedAt ? new Date(item.publishedAt).getTime() : Date.now(),
  }));
}

function basicQualityFilter(list: any[]) {
  const now = Date.now();
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  return list.filter((a) => {
    // Must have title (min 20 chars)
    if (!a.title || a.title.length < 20) return false;

    // Must have description (min 30 chars)
    if (!a.description || a.description.length < 30) return false;

    // Must have publish date
    if (!a.publishedAt) return false;

    // Not too old
    if (now - a.publishedAt > MAX_AGE) return false;

    // Must have valid URL
    if (!a.url || !a.url.startsWith('http')) return false;

    return true;
  });
}

function hardRegionFilter(list: any[], region: 'in' | 'us') {
  // For global/US, accept all articles
  if (region === 'us') return list;

  // For India, require at least 1 India keyword
  const regionKeywords = INDIA_KEYWORDS;

  return list.filter((a) => {
    const text = (a.title + ' ' + a.description).toLowerCase();
    const matches = countKeywordMatches(text, regionKeywords);
    return matches > 0;
  });
}

function deduplicateArticles(list: any[]) {
  const seen = new Set<string>();

  return list.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreArticles(list: any[], category: string, region: 'in' | 'us') {
  const now = Date.now();
  const categoryKeywords = getCategoryKeywords(category);
  const regionKeywords = getRegionKeywords(region);
  const premiumSources = PREMIUM_SOURCES[category as keyof typeof PREMIUM_SOURCES] || [];

  return list.map((a) => {
    let score = 0;
    const text = (a.title + ' ' + a.description).toLowerCase();
    const hoursOld = (now - a.publishedAt) / 3600000;

    // 1. Freshness (max 8 points)
    if (hoursOld < 2) score += 8;
    else if (hoursOld < 6) score += 6;
    else if (hoursOld < 12) score += 4;
    else if (hoursOld < 24) score += 2;

    // 2. Content quality (max 4 points)
    if (a.title.length > 50) score += 1;
    if (a.title.length > 80) score += 1;
    if (a.description && a.description.length > 100) score += 2;

    // 3. Category relevance (max 12 points)
    const categoryHits = countKeywordMatches(text, categoryKeywords);
    score += Math.min(categoryHits * 3, 12);

    // 4. Region relevance (max 20 points) - HIGHEST PRIORITY
    const regionHits = countKeywordMatches(text, regionKeywords);
    score += Math.min(regionHits * 4, 20);

    // 5. Premium source bonus (8 points)
    const isPremium = premiumSources.some((source) =>
      a.source.toLowerCase().includes(source.toLowerCase())
    );
    if (isPremium) score += 8;

    // 6. Has image bonus (3 points)
    if (a.image) score += 3;

    // 7. Title clarity bonus (2 points)
    if (a.title.length >= 40 && a.title.length <= 120) score += 2;

    return { ...a, score };
  });
}

// ----------------------------
// MAIN APP
// ----------------------------

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sports');
  const [region, setRegion] = useState<'in' | 'us'>('in');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cache, setCache] = useState<Record<string, CachedNews>>({});

  const getCacheKey = (category: string, country: string) => `${category}-${country}`;

  const fetchNews = async (category: string, country: string) => {
    const cacheKey = getCacheKey(category, country);
    const cached = cache[cacheKey];

    // Check cache first
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached data for', cacheKey);
      setNews(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Fetching fresh news for', cacheKey);
      const response = await fetch(`/api/news?category=${category}&country=${country}`);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // PROCESSING PIPELINE
      const normalized = normalizeArticles(data.articles || []);
      console.log('📊 Normalized:', normalized.length, 'articles');

      const qualityFiltered = basicQualityFilter(normalized);
      console.log('✔️ Quality filtered:', qualityFiltered.length, 'articles');

      const regionFiltered = hardRegionFilter(qualityFiltered, country as 'in' | 'us');
      console.log('🌍 Region filtered:', regionFiltered.length, 'articles');

      const deduped = deduplicateArticles(regionFiltered);
      console.log('🔍 Deduplicated:', deduped.length, 'articles');

      const scored = scoreArticles(deduped, category, country as 'in' | 'us');
      const ranked = scored.sort((a, b) => b.score - a.score);

      console.log('🏆 Top 3 scores:', ranked.slice(0, 3).map(a => ({
        title: a.title.substring(0, 50),
        score: a.score
      })));

      let articles: NewsArticle[] = ranked.slice(0, 3);

      // Safety fallback: if less than 3, pad with normalized articles
      if (articles.length < 3 && normalized.length > 0) {
        console.log('⚠️ Padding with extra articles');
        const extra = normalized.slice(0, 3 - articles.length);
        articles = [...articles, ...extra];
      }

      // Update cache
      setCache((prev) => ({
        ...prev,
        [cacheKey]: {
          data: articles,
          timestamp: Date.now(),
        },
      }));

      setNews(articles);
    } catch (error) {
      console.error('❌ News fetch error:', error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch news when tab or region changes
  useEffect(() => {
    fetchNews(activeTab, region);
  }, [activeTab, region]);

  const regionLabel = region === 'in' ? 'INDIA' : 'GLOBAL';

  return (
    <>
      <div className="flex flex-col h-screen font-sans bg-brand-darker">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-brand-dark/90 backdrop-blur-lg border border-bubble-border/30 shadow-2xl shadow-black/50 sm:rounded-xl my-0 sm:my-4 sm:h-[calc(100%-2rem)]">
         <Header region={region} onRegionChange={setRegion} />
         <MarketSnapshot />  
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-grow p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              📰 LATEST {activeTab.toUpperCase()} NEWS ({regionLabel})
            </h2>

            {isLoading ? (
              <LoadingSpinner />
            ) : news.length > 0 ? (
              news.map((article, index) => <NewsCard key={index} article={article} index={index} />)
            ) : (
              <p className="text-center text-text-secondary py-10">
                No news available. Try another category or region!
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
