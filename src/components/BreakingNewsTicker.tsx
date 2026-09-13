import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Flame, Radio } from 'lucide-react';
import { Article, YouTubeVideo } from '../types';
import { TranslationDictionary } from '../i18n';

interface BreakingNewsTickerProps {
  breakingArticles?: Article[];
  breakingVideos?: YouTubeVideo[];
  articles?: Article[];
  videos?: YouTubeVideo[];
  onSelectArticle: (article: Article) => void;
  onSelectVideo?: (video: YouTubeVideo) => void;
  t: TranslationDictionary;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  breakingArticles,
  breakingVideos,
  articles,
  videos,
  onSelectArticle,
  onSelectVideo,
  t,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Combine breaking items safely with fallback support
  const articlesList = breakingArticles || articles || [];
  const videosList = breakingVideos || videos || [];

  const items: Array<{ type: 'article'; data: Article } | { type: 'video'; data: YouTubeVideo }> = [
    ...articlesList.map((art) => ({ type: 'article' as const, data: art })),
    ...videosList.map((vid) => ({ type: 'video' as const, data: vid })),
  ];

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleClick = () => {
    if (currentItem.type === 'article') {
      onSelectArticle(currentItem.data);
    } else if (onSelectVideo) {
      onSelectVideo(currentItem.data);
    }
  };

  return (
    <div
      id="breaking-news-ticker"
      className="bg-neutral-900 text-white border-b border-neutral-800 text-sm overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label={t.breakingNews}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-stretch min-h-[44px]">
        {/* Urgent Label Badge */}
        <div className="bg-red-700 text-white font-bold px-3.5 flex items-center gap-1.5 shrink-0 text-xs uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="font-mono-code font-bold">{t.breakingNews}</span>
        </div>

        {/* Content Item */}
        <div className="flex-1 flex items-center px-4 overflow-hidden">
          <button
            onClick={handleClick}
            className="text-left w-full truncate hover:text-red-300 transition-colors flex items-center gap-2.5 py-1"
          >
            {currentItem.type === 'video' ? (
              <span className="inline-flex items-center gap-1 bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase">
                <Radio className="w-3 h-3 text-red-400" />
                VIDEO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-neutral-800 text-neutral-300 text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded uppercase">
                {currentItem.data.category}
              </span>
            )}

            <span className="font-serif-editorial text-sm sm:text-base font-medium text-neutral-100 truncate">
              {currentItem.type === 'article' ? currentItem.data.headline : currentItem.data.title}
            </span>

            <span className="hidden md:inline text-xs text-neutral-400 font-mono-code shrink-0">
              — {currentItem.type === 'article' ? `${currentItem.data.country} Bureau` : 'YouTube Desk'}
            </span>
          </button>
        </div>

        {/* Ticker Controls */}
        <div className="flex items-center gap-1 border-l border-neutral-800 px-2 shrink-0">
          <span className="hidden sm:inline text-[11px] font-mono-code text-neutral-400 mr-2">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={handlePrev}
            aria-label="Previous Breaking Item"
            className="p-1 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume Ticker' : 'Pause Ticker'}
            className="p-1 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Breaking Item"
            className="p-1 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
