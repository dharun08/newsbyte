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
          className="w-full rounded-lg mb-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#2BB0E6] mb-2">
        {index + 1}. {article.title}
      </h3>

      {/* Description */}
      <p className="text-text-primary text-sm mb-3 leading-relaxed">
        {article.description}
      </p>

      {/* Summary */}
      {article.content && showSummary && (
        <div className="bg-white/5 border-l-4 border-[#2BB0E6] rounded p-3 mb-3">
          <p className="text-xs font-medium text-[#2BB0E6] mb-2">
            Full Summary
          </p>
          <p className="text-text-primary text-sm leading-relaxed">
            {article.content}
          </p>
        </div>
      )}

      {/* Source */}
      <p className="text-text-secondary text-xs mb-4">
        Source: <em>{article.source}</em>
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">

        {/* Summary Toggle */}
        {article.content && (
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="text-xs px-3 py-1.5 rounded-md
              bg-[#2BB0E6]/10 text-[#2BB0E6]
              hover:bg-[#2BB0E6]/20 transition-colors"
          >
            {showSummary ? 'Hide Summary' : 'Read Summary'}
          </button>
        )}

        {/* Read More */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md
            border border-[#2BB0E6]/40 text-[#2BB0E6]
            hover:bg-[#2BB0E6]/10 transition-colors"
        >
          Read Full Article
        </a>

        {/* Share X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md
            bg-white/10 text-text-primary
            hover:bg-white/20 transition-colors"
        >
          Share on X
        </a>

        {/* Share WhatsApp */}
        <a
          href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md
            bg-white/10 text-text-primary
            hover:bg-white/20 transition-colors"
        >
          Share on WhatsApp
        </a>

      </div>
    </div>
  );
};
