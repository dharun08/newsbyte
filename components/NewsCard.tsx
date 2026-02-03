import React, { useState } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  content?: string;
}

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => {
  const [showSummary, setShowSummary] = useState(false);
  const shareUrl = encodeURIComponent(article.url);
  const shareText = encodeURIComponent(article.title);

  return (
    <div className="bg-bubble-bot border border-bubble-border rounded-xl p-5 mb-4 shadow-md">
      {/* Image */}
      {article.image && (
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full max-w-full rounded-lg mb-4"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-accent-cyan mb-2">
        {index + 1}. {article.title}
      </h3>

      {/* Description */}
      <p className="text-text-primary text-sm mb-3">
        {article.description}
      </p>

      {/* Summary Section (Expandable) */}
      {article.content && showSummary && (
        <div className="bg-accent-blue/10 border-l-4 border-accent-blue rounded p-3 mb-3">
          <p className="text-xs font-semibold text-accent-cyan mb-2">📖 Full Summary:</p>
          <p className="text-text-primary text-sm">{article.content}</p>
        </div>
      )}

      {/* Source */}
      <p className="text-text-secondary text-xs mb-3">
        📍 <em>{article.source}</em>
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Summary Toggle */}
        {article.content && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="text-xs px-3 py-1.5 bg-accent-blue text-white rounded-md hover:bg-accent-cyan transition-colors"
          >
            {showSummary ? 'Hide Summary ▲' : 'Read Summary ▼'}
          </button>
        )}

        {/* Read More */}
        
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 bg-transparent border border-accent-blue text-accent-blue rounded-md hover:bg-accent-blue hover:text-white transition-colors"
        >
          🔗 Read Full Article
        </a>

        {/* Share on X */}
        
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Share on 𝕏
        </a>

        {/* Share on WhatsApp */}
        
          href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
};
