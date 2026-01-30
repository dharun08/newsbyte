import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, MessageOption } from './types';
import { ChatMessage } from './components/ChatMessage';

// --- Constants ---
const CATEGORIES: MessageOption[] = [
  { text: 'business', value: 'business' },
  { text: 'sports', value: 'sports' },
  { text: 'technology', value: 'technology' },
  { text: 'politics', value: 'politics' },
  { text: 'entertainment', value: 'entertainment' },
  { text: 'health', value: 'health' },
];

const REGIONS: MessageOption[] = [
  { text: 'india', value: 'in' },
  { text: 'global', value: 'us' },
];

const WELCOME_MESSAGE_TEXT = `👋 Hi there! I'm your personal news assistant.
What do you want to read today?
Please choose a category:`;

const REGION_MESSAGE_TEXT = `Great choice!
Do you want news from India or across the globe?`;

const SUBSEQUENT_SEARCH_MESSAGE_TEXT = `Would you like to search for news in another category?
Please choose one:`;

// Demo usage counter (no external API)
const COUNTER_NAMESPACE = 'newsbyte';
const COUNTER_KEY = 'ai-chatbot-global-usage';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: string;
}

// --- Components ---
const ChatHeader: React.FC<{ totalUses: number | null }> = ({ totalUses }) => (
  <div className="p-4 border-b border-bubble-border/30 flex items-center justify-between">
    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
      🗞️ NewsByte
    </h1>
    <div className="flex items-center gap-4">
      <span className="text-xs text-text-secondary/80">
        Global bot usage: <span className="font-semibold text-text-secondary">{totalUses ?? '--'}</span>
      </span>
    </div>
  </div>
);

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start animate-fade-in">
    <div className="max-w-md md:max-w-lg rounded-xl px-4 py-4 shadow-md bg-bubble-bot border border-bubble-border self-start flex items-center space-x-2">
      <span className="h-2 w-2 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-2 w-2 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-2 w-2 bg-accent-cyan rounded-full animate-bounce"></span>
    </div>
  </div>
);

// --- Main App Component ---
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalUses, setTotalUses] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const addBotMessage = (text: string, options?: MessageOption[]) => {
    const botMessage: Message = { 
      id: Date.now() + Math.random(), 
      text, 
      sender: Sender.BOT,
      options 
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  // Local storage counter (no external API dependency)
  useEffect(() => {
    const loadUsageCount = () => {
      try {
        const saved = localStorage.getItem(`${COUNTER_NAMESPACE}-${COUNTER_KEY}`);
        setTotalUses(saved ? parseInt(saved) : 0);
      } catch {
        setTotalUses(0);
      }
    };

    loadUsageCount();
    
    // Show initial welcome message
    const timer = setTimeout(() => {
      addBotMessage(WELCOME_MESSAGE_TEXT, CATEGORIES);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const incrementUsage = () => {
    try {
      const current = totalUses ?? 0;
      const newCount = current + 1;
      setTotalUses(newCount);
      localStorage.setItem(`${COUNTER_NAMESPACE}-${COUNTER_KEY}`, newCount.toString());
    } catch {
      // Ignore localStorage errors
    }
  };

  // Server-side proxy + NewsAPI + Demo fallback
  // Replace ONLY this function in your App.tsx:
const fetchNews = async (category: string, country: string) => {
  try {
    setIsLoading(true);
    console.log('Fetching news via GNews API:', category, country);
    
    // GNews API - Works in browser + free CORS
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${category}&country=${country}&max=3&lang=en&token=your-gnews-token-here`
    );
    
    if (!response.ok


      const data = await response.json();
      const articles: NewsArticle[] = data.articles || [];

      if (articles.length === 0) {
        console.log('No articles from API, showing demo');
        showDemoNews(category);
        return;
      }

      incrementUsage();
      formatAndShowNews(articles);

    } catch (error) {
      console.error("News fetch error:", error);
      showDemoNews(category);
    } finally {
      setSelectedCategory(null);
      setTimeout(() => {
        addBotMessage(SUBSEQUENT_SEARCH_MESSAGE_TEXT, CATEGORIES);
        setIsLoading(false);
      }, 1500);
    }
  };

  const showDemoNews = (category: string) => {
    const demoArticles: NewsArticle[] = getDemoNews(category);
    incrementUsage();
    formatAndShowNews(demoArticles);
  };

  const getDemoNews = (category: string): NewsArticle[] => {
    const demoData: Record<string, NewsArticle[]> = {
      sports: [
        {
          title: "🏏 India vs England T20 Thriller",
          description: "India wins by 5 wickets in last over drama. Kohli unbeaten 82* guides chase.",
          url: "https://timesofindia.indiatimes.com/sports/cricket",
          source: "Times of India"
        },
        {
          title: "⚽ ISL: Bengaluru FC Tops Table",
          description: "Bengaluru beats Mumbai City 2-1 to lead Indian Super League standings.",
          url: "https://www.goal.com/en-in/indian-super-league",
          source: "Goal.com"
        },
        {
          title: "🏃‍♂️ Neeraj Chopra Golden Again",
          description: "India's javelin star wins gold at Asian Games with 88.88m throw.",
          url: "https://indianexpress.com/section/sports/",
          source: "Indian Express"
        }
      ],
      technology: [
        {
          title: "🚀 ISRO Chandrayaan-4 Mission Approved",
          description: "India's next lunar mission with sample return capability gets green light.",
          url: "https://www.isro.gov.in/",
          source: "ISRO"
        },
        {
          title: "📱 Jio Launches 5G Across 7,500 Cities",
          description: "Reliance Jio's 5G network now covers entire India with unlimited data plans.",
          url: "https://www.jio.com/",
          source: "Jio"
        },
        {
          title: "💻 India Overtakes Japan in Tech Exports",
          description: "India becomes 3rd largest tech exporter surpassing Japan.",
          url: "https://www.thehindu.com/business/",
          source: "The Hindu"
        }
      ],
      business: [
        {
          title: "📈 Sensex Hits Record 82,000",
          description: "Indian stock market surges to new highs led by IT and banking sectors.",
          url: "https://economictimes.indiatimes.com/markets",
          source: "Economic Times"
        },
        {
          title: "💰 Adani Group Acquires Major Stake",
          description: "Adani Enterprises makes strategic acquisition in renewable energy sector.",
          url: "https://www.business-standard.com/",
          source: "Business Standard"
        },
        {
          title: "🏦 RBI Cuts Repo Rate by 25bps",
          description: "Reserve Bank signals more rate cuts to boost economic growth.",
          url: "https://www.rbi.org.in/",
          source: "RBI"
        }
      ],
      politics: [
        {
          title: "🏛️ PM Modi Addresses Nation",
          description: "Prime Minister announces major infrastructure development plan.",
          url: "https://www.pmindia.gov.in/",
          source: "PMO India"
        }
      ],
      entertainment: [
        {
          title: "🎬 Ranbir Kapoor's Next Blockbuster",
          description: "Animal sequel confirmed with major star cast announced.",
          url: "https://timesofindia.indiatimes.com/entertainment",
          source: "Times of India"
        }
      ],
      health: [
        {
          title: "🩺 Ayushman Bharat Reaches 50 Cr",
          description: "India's health insurance scheme achieves major milestone.",
          url: "https://www.mohfw.gov.in/",
          source: "Health Ministry"
        }
      ]
    };

    return demoData[category as keyof typeof demoData] || demoData.sports!;
  };

  const formatAndShowNews = (articles: NewsArticle[]) => {
    const formattedNews = articles.map(article => `
      <div class="p-4 bg-bubble-user/30 rounded-xl border border-bubble-border/80 hover:border-accent-cyan/50 transition-colors duration-300">
        <p class="font-semibold text-text-primary text-base mb-1.5 line-clamp-2">${article.title}</p>
        <p class="text-text-secondary text-[15px] mb-2.5 line-clamp-3">${article.description}</p>
        <div class="flex gap-2 text-xs text-text-secondary mb-2">
          <span>📰 ${article.source}</span>
        </div>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-accent-cyan hover:underline text-sm">Read full story →</a>
      </div>
    `).join('');

    addBotMessage(formattedNews);
  };

  const handleOptionSelect = (value: string, text: string) => {
    const userMessage: Message = { id: Date.now(), text, sender: Sender.USER };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      if (!selectedCategory) {
        setSelectedCategory(value);
        addBotMessage(REGION_MESSAGE_TEXT, REGIONS);
        setIsLoading(false);
      } else {
        fetchNews(selectedCategory, value);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-brand-darker">
      <div className="w-full max-w-2xl mx-auto h-full flex flex-col bg-brand-dark/90 backdrop-blur-lg border border-bubble-border/30 shadow-2xl shadow-black/50 sm:rounded-xl my-0 sm:my-4 sm:h-[calc(100%-2rem)]">
        <ChatHeader totalUses={totalUses} />
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id} 
              message={msg}
              onOptionSelect={handleOptionSelect}
              isLastMessage={index === messages.length - 1}
              disabled={isLoading}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
