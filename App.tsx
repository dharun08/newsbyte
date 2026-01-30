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

const COUNTER_API_URL = 'https://api.countapi.xyz';
const COUNTER_NAMESPACE = 'newsbyte';
const COUNTER_KEY = 'ai-chatbot-global-usage';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
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

  useEffect(() => {
    // Fetch initial global usage count
    const fetchInitialCount = async () => {
      try {
        const response = await fetch(`${COUNTER_API_URL}/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
        if (!response.ok) throw new Error('API response not OK');
        const data = await response.json();
        setTotalUses(data.value ?? 0);
      } catch (error) {
        console.error("Failed to fetch usage count:", error);
        setTotalUses(0);
      }
    };

    fetchInitialCount();
    
    // Show initial welcome message
    setTimeout(() => {
      addBotMessage(WELCOME_MESSAGE_TEXT, CATEGORIES);
      setIsLoading(false);
    }, 1000);
  }, []);

  const fetchNews = async (category: string, country: string) => {
    try {
      console.log('Fetching news:', category, country);
      
      const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
      if (!apiKey) {
        throw new Error('NewsAPI key missing');
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=3&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();
      const articles: NewsArticle[] = data.articles || [];

      if (articles.length === 0) {
        addBotMessage("😕 No recent news found for that category. Try another!");
        return;
      }

      // Increment usage counter
      fetch(`${COUNTER_API_URL}/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`)
        .then(res => res.json())
        .then(data => setTotalUses(data.value))
        .catch(() => setTotalUses(prev => (prev ?? 0) + 1));

      // Format news for your UI
      const formattedNews = articles.map(article => {
        const image = article.urlToImage ? `<img src="${article.urlToImage}" alt="News" class="w-full h-32 object-cover rounded-lg mb-2" />` : '';
        const source = article.source?.name || 'News Source';
        
        return `
          <div class="p-4 bg-bubble-user/30 rounded-xl border border-bubble-border/80 hover:border-accent-cyan/50 transition-colors">
            ${image}
            <p class="font-semibold text-text-primary text-base mb-1.5 line-clamp-2">${article.title}</p>
            <p class="text-text-secondary text-[15px] mb-2.5 line-clamp-3">${article.description}</p>
            <div class="flex gap-2 text-xs text-text-secondary mb-2">
              <span>📰 ${source}</span>
            </div>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-accent-cyan hover:underline text-sm">Read full story →</a>
          </div>
        `;
      }).join('');

      addBotMessage(formattedNews);

    } catch (error) {
      console.error("News fetch error:", error);
      addBotMessage("🚧 Sorry, couldn't fetch news right now. Please try again later!");
    } finally {
      setSelectedCategory(null);
      setTimeout(() => {
        addBotMessage(SUBSEQUENT_SEARCH_MESSAGE_TEXT, CATEGORIES);
        setIsLoading(false);
      }, 1500);
    }
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
