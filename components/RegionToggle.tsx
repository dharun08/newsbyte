import React from 'react';

interface RegionToggleProps {
  region: 'in' | 'us';
  onRegionChange: (region: 'in' | 'us') => void;
}

export const RegionToggle: React.FC<RegionToggleProps> = ({ region, onRegionChange }) => {
  return (
    <div className="flex items-center gap-2 bg-bubble-bot border border-bubble-border rounded-full p-1">
      <button
        onClick={() => onRegionChange('in')}
        className={`
          px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${region === 'in'
            ? 'bg-accent-cyan text-white shadow-md'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        🇮🇳 India
      </button>
      <button
        onClick={() => onRegionChange('us')}
        className={`
          px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${region === 'us'
            ? 'bg-accent-cyan text-white shadow-md'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        🌍 Global
      </button>
    </div>
  );
};
