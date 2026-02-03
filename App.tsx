import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { NewsArticle } from './types';
import { NewsCard } from './components/NewsCard';
import { TabNavigation } from './components/TabNavigation';
import { RegionToggle } from './components/RegionToggle';

const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CachedNews {
  data: NewsArticle[];
  timestamp: number;
}

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
        className="text-accent-cyan hover:text-accent-blue underline font-medium transition-colors">
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
      console.log('Using cached data for', cacheKey);
      setNews(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/news?category=${category}&country=${country}`);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const articles: NewsArticle[] = (data.articles || [])
        .map((item: any) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          source: item.source?.name || 'Unknown',
          image: item.image || item.urlToImage,
          content: item.content,
        }))
        .filter(Boolean)
        .slice(0, 3); // Only take top 3

      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: articles,
          timestamp: Date.now(),
        },
      }));

      setNews(articles);
    } catch (error) {
      console.error('News fetch error:', error);
      // Show demo news on error
      setNews(getDemoNews(category));
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoNews = (category: string): NewsArticle[] => {
    const demoData: Record<string, NewsArticle[]> = {
      sports: [
        {
          title: '🏏 India vs England T20 Thriller',
          description: 'India wins by 5 wickets.',
          url: 'https://timesofindia.indiatimes.com/sports/cricket',
          source: 'Times of India',
          image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500',
        },
        {
          title: '⚽ ISL: Bengaluru FC Tops Table',
          description: 'Bengaluru beats Mumbai City 2-1.',
          url: 'https://www.goal.com/en-in/indian-super-league',
          source: 'Goal.com',
          image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
        },
        {
          title: '🏃‍♂️ Neeraj Chopra Golden Again',
          description: "India's javelin star wins gold.",
          url: 'https://indianexpress.com/section/sports/',
          source: 'Indian Express',
          image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500',
        },
      ],
      technology: [
        {
          title: '🚀 ISRO Chandrayaan-4 Approved',
          description: "India's next lunar mission.",
          url: 'https://www.isro.gov.in/',
          source: 'ISRO',
          image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500',
        },
        {
          title: '📱 Jio 5G Across 7,500 Cities',
          description: "Reliance Jio's 5G network live.",
          url: 'https://www.jio.com/',
          source: 'Jio',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        },
        {
          title: '💻 AI Boom Continues',
          description: 'Tech giants invest billions in AI.',
          url: 'https://techcrunch.com',
          source: 'TechCrunch',
          image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500',
        },
      ],
      business: [
        {
          title: '📈 Sensex Hits Record 82,000',
          description: 'Indian market surges to new highs.',
          url: 'https://economictimes.indiatimes.com/markets',
          source: 'Economic Times',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
        },
      ],
    };
    return demoData[category] || demoData.sports;
  };

  // Fetch news when tab or region changes
  useEffect(() => {
    fetchNews(activeTab, region);
  }, [activeTab, region]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleRegionChange = (newRegion: 'in' | 'us') => {
    setRegion(newRegion);
  };

  const regionLabel = region === 'in' ? 'INDIA' : 'GLOBAL';

  return (
    <>
      <div className="flex flex-col h-screen font-sans bg-brand-darker">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-brand-dark/90 backdrop-blur-lg border border-bubble-border/30 shadow-2xl shadow-black/50 sm:rounded-xl my-0 sm:my-4 sm:h-[calc(100%-2rem)]">
          <Header region={region} onRegionChange={handleRegionChange} />
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

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
                No news available. Try another category!
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
