import React from 'react';

interface RegionToggleProps {
  region: 'in' | 'us';
  onRegionChange: (region: 'in' | 'us') => void;
}

export const RegionToggle: React.FC<RegionToggleProps> = ({
  region,
  onRegionChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-bubble-bot border border-bubble-border rounded-full p-1">

      {/* India */}
      <button
        onClick={() => onRegionChange('in')}
        className={`
          px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
          ${
            region === 'in'
              ? 'bg-[#2BB0E6]/15 text-[#2BB0E6] border border-[#2BB0E6]/40'
              : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        🇮🇳 India
      </button>

      {/* Global */}
      <button
        onClick={() => onRegionChange('us')}
        className={`
          px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors
          ${
            region === 'us'
              ? 'bg-[#2BB0E6]/15 text-[#2BB0E6] border border-[#2BB0E6]/40'
              : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        🌍 Global
      </button>

    </div>
  );
};
