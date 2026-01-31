import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, MessageOption } from './types';
import { ChatMessage } from './components/ChatMessage';

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

const COUNTER_NAMESPACE = 'newsbyte';
const COUNTER_KEY = 'ai-chatbot-global-usage';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: string;
}

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
    } catch {}
  };

  const fetchNews = async (category: string, country: string) => {
  try {
    setIsLoading(true);
    console.log('Fetching news:', category, country);
    
    // Call our Vercel serverless function instead of GNews directly
    const response = await fetch(
      `/api/news?category=${category}&country=${country}`
    );
    
    if (!response.ok) {
      console.error('API response not OK:', response.status);
      showDemoNews(category);
      return;
    }

    const data = await response.json();
    
    // GNews format fix
    const articles: NewsArticle[] = (data.articles || []).map((item: any) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      source: item.source?.name || 'Unknown'
    })).filter(Boolean);

    if (articles.length === 0) {
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
        { title: "🏏 India vs England T20 Thriller", description: "India wins by 5 wickets.", url: "https://timesofindia.indiatimes.com/sports/cricket", source: "Times of India" },
        { title: "⚽ ISL: Bengaluru FC Tops Table", description: "Bengaluru beats Mumbai City 2-1.", url: "https://www.goal.com/en-in/indian-super-league", source: "Goal.com" },
        { title: "🏃‍♂️ Neeraj Chopra Golden Again", description: "India's javelin star wins gold.", url: "https://indianexpress.com/section/sports/", source: "Indian Express" }
      ],
      technology: [
        { title: "🚀 ISRO Chandrayaan-4 Approved", description: "India's next lunar mission.", url: "https://www.isro.gov.in/", source: "ISRO" },
        { title: "📱 Jio 5G Across 7,500 Cities", description: "Reliance Jio's 5G network live.", url: "https://www.jio.com/", source: "Jio" }
      ],
      business: [
        { title: "📈 Sensex Hits Record 82,000", description: "Indian market surges to new highs.", url: "https://economictimes.indiatimes.com/markets", source: "Economic Times" }
      ]
    };
    return demoData[category as keyof typeof demoData] || demoData.sports!;
  };

  const formatAndShowNews = (articles: NewsArticle[]) => {
    let newsText = "📰 **LATEST NEWS:**\n\n";
    articles.forEach((article, index) => {
      newsText += `${index + 1}. **${article.title}**\n`;
      newsText += `${article.description}\n`;
      newsText += `📍 *${article.source}*\n`;
      newsText += `🔗 [Read more](${article.url})\n\n`;
    });
    addBotMessage(newsText);
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
