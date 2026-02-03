import React from 'react';

interface Tab {
  id: string;
  label: string;
  emoji: string;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TABS: Tab[] = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'technology', label: 'Tech', emoji: '💻' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'health', label: 'Health', emoji: '🏥' },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-bubble-border/30 bg-brand-dark/50">
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/30'
                : 'bg-bubble-bot text-text-secondary hover:bg-bubble-border hover:text-text-primary border border-bubble-border'
              }
            `}
          >
            <span className="mr-1">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
