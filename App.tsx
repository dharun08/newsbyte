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
      <span className="h-2
