
import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, MessageOption } from './types';
import { ChatMessage } from './components/ChatMessage';
import { GoogleGenAI } from "@google/genai";

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
  { text: 'india', value: 'India' },
  { text: 'global', value: 'Global' },
];

const WELCOME_MESSAGE_TEXT = `👋 Hi there! I’m your personal news assistant.
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
  headline: string;
  summary: string;
  url: string;
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
        setTotalUses(0); // Fallback on error
      }
    };

    fetchInitialCount();
    
    // Show initial welcome message
    setTimeout(() => {
      addBotMessage(WELCOME_MESSAGE_TEXT, CATEGORIES);
      setIsLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndSummarizeNews = async (category: string, region: string) => {
    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const prompt = `You are a world-class news summarization engine. Your task is to find the 3 latest, most important news headlines for the category '${category}' in '${region}'. The news must be from today or yesterday. For each article, you must provide: 1. A concise headline. 2. A crisp 2-3 line summary. 3. The direct URL to the article. Respond ONLY with a single valid JSON array of objects. Each object must have three keys: "headline", "summary", and "url". Your response must start with '[' and end with ']'. Do not include any introductory text, markdown formatting, or explanations.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      let responseText = response.text.trim();
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
          throw new Error("No JSON array found in response");
      }
      responseText = jsonMatch[0];

      const newsArticles: NewsArticle[] = JSON.parse(responseText);

      let formattedNews: string;

      if (newsArticles && newsArticles.length > 0) {
        // Increment global usage count
        fetch(`${COUNTER_API_URL}/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`)
          .then(res => res.json())
          .then(data => {
            if (data.value) {
              setTotalUses(data.value);
            }
          })
          .catch(error => {
            console.error("Failed to increment usage count:", error);
            // Fallback to local increment if API fails
            setTotalUses(prev => (prev !== null ? prev + 1 : 1));
          });

        formattedNews = newsArticles.map(article => {
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(article.headline)}`;
          const linkHtml = `<a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer" class="text-accent-cyan hover:underline">Read on Google →</a>`;
          
          return `<div class="p-4 bg-bubble-user/30 rounded-xl border border-bubble-border/80 hover:border-accent-cyan/50 transition-colors duration-300">
                    <p class="font-semibold text-text-primary text-base mb-1.5">📰 ${article.headline}</p>
                    <p class="text-text-secondary text-[15px] mb-2.5">💬 ${article.summary}</p>
                    <p class="text-sm">🔗 ${linkHtml}</p>
                  </div>`;

        }).join('');
        
      } else {
         formattedNews = "😕 Sorry, I couldn’t find recent news for that category. Please try another one.";
      }
      
      addBotMessage(formattedNews);

    } catch (error) {
      console.error("Error fetching or parsing news:", error);
      addBotMessage("🚧 I’m facing a small technical issue fetching news. Please try again later.");
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
        fetchAndSummarizeNews(selectedCategory, value);
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
