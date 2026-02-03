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

// ----------------------------
// INTELLIGENCE LAYER
// ----------------------------

const SPORTS_KEYWORDS = [
"cricket","football","soccer","tennis","badminton","hockey","kabaddi","basketball", "baseball","rugby","volleyball","handball","golf","boxing","wrestling","mma","ufc","formula 1","f1","motogp","rally","nascar","cycling","athletics","track",
"field","marathon","triathlon","swimming","diving","rowing","sailing", "archery","shooting","weightlifting","powerlifting","bodybuilding","gymnastics", "skating","skiing","snowboard","surfing","climbing","esports","e-sports",
"chess","carrom","table tennis","ping pong","snooker","billiards","pool", "match","matches","fixture","fixtures","schedule","result","results", "tournament","league","cup","series","championship","event","meet","contest",
"ipl","bbl","bpl","psl","cpl","sa20","hundred","world cup","t20 world cup", "asian cup","champions trophy","test match","odi","t20","friendly", "goal","goals","assist","assists","run","runs","wicket","wickets",
"boundary","six","four","century","half-century","hat-trick", "penalty","free kick","corner","offside","save","clean sheet", "bat","ball","bowler","batsman","fielder","keeper","goalkeeper",
"innings","over","powerplay","strike rate","economy rate", "coach","manager","head coach","assistant coach", "captain","vice-captain","skipper", "player","players","squad","team","line-up","selection","call-up",
"transfer","signing","contract","extension","release", "injury","injured","fit","fitness","recovery","rehab", "training","practice","camp","conditioning", "ranking","rankings","seed","seeded",
"points table","standings","leaderboard", "playoff","playoffs","knockout","qualifier","eliminator", "final","semi-final","quarter-final","round of 16", "stadium","arena","venue","home ground","away game",
"referee","umpire","official", "medal","gold","silver","bronze", "olympics","paralympics","asian games","commonwealth games", "record","world record","national record", "debut","retirement","comeback","milestone"
];

const BUSINESS_KEYWORDS = [
"business","industry","industries","corporate","company","companies","firm","firms", "market","markets","stock","stocks","share","shares","equity","equities", "sensex","nifty","dow","nasdaq","ftse","nikkei","hang seng",
"index","indices","benchmark", "trading","trade","trader","traders", "bull","bullish","bear","bearish","rally","selloff","crash","correction", "earnings","profit","profits","loss","losses","revenue","income",
"margin","margins","growth","decline","drop","rise","surge","jump","fall", "quarter","q1","q2","q3","q4","results","guidance","forecast","outlook", "ipo","listing","public issue","offer for sale","ofs",
"merger","mergers","acquisition","acquire","buyout","takeover", "deal","deals","partnership","joint venture","collaboration", "investment","invest","invests","investing","funding","fundraise","capital raise",
"venture capital","vc","private equity","pe","angel investor", "startup","start-up","unicorn","soonicorn", "valuation","valued","worth", "bank","banks","banking","lender","lenders","nbfc",
"rbi","central bank","interest rate","repo rate","reverse repo", "inflation","deflation","cpi","wpi", "economy","economic","gdp","growth rate","fiscal","monetary", "budget","union budget","tax","taxes","gst","customs","duty",
"exports","export","imports","import","trade deficit","current account", "manufacturing","factory","plant","production", "supply chain","logistics","warehouse","shipping", "retail","wholesale","ecommerce","e-commerce","online sales",
"consumer","consumption","demand","spending", "sales","orders","order book","backlog", "real estate","property","housing","mortgage", "auto","automobile","vehicle","ev","electric vehicle",
"energy","power","oil","gas","renewable","solar","wind", "telecom","aviation","airlines","railways","ports", "it services","software services","outsourcing", "layoff","layoffs","job cuts","hiring","recruitment",
"restructuring","turnaround","bankruptcy","insolvency", "shareholder","dividend","payout","buyback"
];

const TECH_KEYWORDS = [
"technology","tech","digital","innovation", "ai","artificial intelligence","machine learning","deep learning","neural network", "generative ai","chatbot","llm","large language model",
"data","big data","data science","analytics", "cloud","cloud computing","aws","azure","gcp", "software","hardware","firmware", "app","apps","application","platform","system","systems",
"saas","paas","iaas", "startup","start-up","founder","co-founder", "cybersecurity","security","hacking","breach","ransomware","malware", "blockchain","crypto","cryptocurrency","bitcoin","ethereum","web3",
"chip","chips","processor","cpu","gpu","semiconductor","foundry", "5g","6g","network","telecom","broadband", "robot","robotics","automation","industrial automation", "iot","internet of things","smart device","wearable",
"smartphone","mobile phone","tablet","laptop","pc", "operating system","android","ios","windows","linux", "browser","search engine", "social media","platform update","feature update",
"metaverse","ar","vr","xr", "gaming","video game","console", "quantum","quantum computing", "biotech","healthtech","medtech","fintech","edtech","agritech", "open source","github","developer","coding","programming",
"api","sdk","framework","library", "launch","unveil","release","rollout","beta", "upgrade","update","patch","version"
];

const INDIA_KEYWORDS = [

/* Country & Identity */
"india","indian","bharat","hindustan","republic of india",

/* Major Cities */
"delhi","new delhi","mumbai","bombay","chennai","madras", "bengaluru","bangalore","hyderabad","secunderabad", "kolkata","calcutta","pune","ahmedabad","surat","vadodara",
"rajkot","jaipur","jodhpur","udaipur", "kochi","cochin","trivandrum","thiruvananthapuram", "kozhikode","thrissur","kannur", "coimbatore","madurai","tiruchirappalli","salem","erode","vellore",
"tiruppur","hosur", "vijayawada","guntur","nellore","kurnool","tirupati","vizag","visakhapatnam", "warangal","karimnagar","nizamabad", "bhopal","indore","ujjain","gwalior","jabalpur",
"lucknow","kanpur","noida","greater noida","ghaziabad", "meerut","varanasi","prayagraj","allahabad","agra", "patna","gaya","muzaffarpur", "ranchi","jamshedpur","bokaro",
"raipur","bilaspur", "bhubaneswar","cuttack","puri","rourkela", "guwahati","dibrugarh","silchar", "shillong","imphal","aizawl","kohima","itanagar", "gangtok", "dehradun","haridwar","roorkee",
"shimla","manali","dharamshala", "amritsar","ludhiana","jalandhar","patiala", "chandigarh","panchkula","mohali", "srinagar","jammu","leh", "kargil", "panaji","margao","vasco da gama",
"port blair", "silvassa","daman","diu",

/* States & UTs */
"andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh", "goa","gujarat","haryana","himachal pradesh","jharkhand", "karnataka","kerala","madhya pradesh","maharashtra","manipur",
"meghalaya","mizoram","nagaland","odisha","orissa", "punjab","rajasthan","sikkim","tamil nadu","telangana", "tripura","uttar pradesh","uttarakhand","west bengal", "ladakh","jammu and kashmir","delhi ncr",

/* Government & Institutions */
"government of india","goi","central government", "prime minister","pm modi","narendra modi", "president of india","draupadi murmu", "home ministry","finance ministry","defence ministry",
"ministry of health","ministry of railways", "parliament","lok sabha","rajya sabha", "supreme court","high court", "niti aayog", "rbi","reserve bank of india","sebi","irda","pfrda",
"npcI","upi","aadhaar","uidai", "isro","drdo","csir","barc",

/* Major Indian Companies & Brands */
"tata","reliance","adani","birla","mahindra","l&t","infosys","wipro", "hcl","tcs","tech mahindra", "flipkart","myntra","paytm","phonepe","bharatpe", "ola","uber india","swiggy","zomato",
"byju's","unacademy", "air india","indigo","spicejet","vistara", "sbi","hdfc","icici","axis bank","kotak", "bharti airtel","jio","vi","vodafone idea", 
  
/* Sports India Context */
"bcci","ipl","indian premier league", "team india","indian cricket team", "aiff","isl","indian super league", "pkl","pro kabaddi league",

/* Geography & Cultural */
"ganges","yamuna","brahmaputra", "himalayas","deccan","thar desert", "south india","north india","east india","west india","northeast india",

/* Currency */
"inr","rupee","rupees","₹"
];


function normalizeArticles(raw: any[]) {
  return raw.map(item => ({
    title: (item.title || "").trim(),
    description: (item.description || "").trim(),
    url: item.url,
    source: item.source?.name || "Unknown",
    image: item.image || item.urlToImage,
    content: item.content || "",
    publishedAt: new Date(item.publishedAt).getTime()
  }));
}

function hardFilterArticles(
  articles: any[],
  category: string,
  region: string
) {
  const now = Date.now();
  const MAX_AGE = 48 * 60 * 60 * 1000; // 48 hours

  return articles.filter(a => {
    const text = (a.title + " " + a.description).toLowerCase();

    const fresh = a.publishedAt && (now - a.publishedAt < MAX_AGE);

    const matchesRegion =
      region === "in"
        ? INDIA_KEYWORDS.some(k => text.includes(k))
        : true;

    let matchesCategory = true;

    if (category === "sports") {
      matchesCategory = SPORTS_KEYWORDS.some(k => text.includes(k));
    }
    if (category === "business") {
      matchesCategory = BUSINESS_KEYWORDS.some(k => text.includes(k));
    }
    if (category === "technology") {
      matchesCategory = TECH_KEYWORDS.some(k => text.includes(k));
    }

    return fresh && matchesRegion && matchesCategory;
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

function scoreAndSortArticles(list: any[], category: string) {
  const now = Date.now();

  return list
    .map(a => {
      let score = 0;
      const hoursOld = (now - a.publishedAt) / 3600000;

      if (hoursOld < 6) score += 5;
      else if (hoursOld < 12) score += 4;
      else if (hoursOld < 24) score += 3;
      else score += 1;

      if (a.title.length > 60) score += 2;
      if (a.description.length > 80) score += 2;

      const text = (a.title + a.description).toLowerCase();

      let keywords = SPORTS_KEYWORDS;
      if (category === "business") keywords = BUSINESS_KEYWORDS;
      if (category === "technology") keywords = TECH_KEYWORDS;

      const hits = keywords.filter(k => text.includes(k)).length;
      score += Math.min(hits, 5);

      return { ...a, score };
    })
    .sort((a, b) => b.score - a.score);
}


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

      const normalized = normalizeArticles(data.articles || []);
const filtered = hardFilterArticles(normalized, category, country);
const deduped = deduplicateArticles(filtered);
const ranked = scoreAndSortArticles(deduped, category);

const articles: NewsArticle[] = ranked.slice(0, 3);

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
