import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Flame,
  Globe,
  Clock,
  Filter,
  CheckCircle2,
  Radio,
  RefreshCw,
  Tv,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { Article, Journalist, YouTubeVideo, YouTubeChannelInfo } from '../types';
import { ArticleCard } from './ArticleCard';
import { BreakingNewsTicker } from './BreakingNewsTicker';
import { HeroSection } from './HeroSection';
import { VideoNewsCenter } from './VideoNewsCenter';
import { RegionalNewsSection } from './RegionalNewsSection';
import { TranslationDictionary } from '../i18n';

interface LiveNewsroomViewProps {
  articles: Article[];
  journalists: Journalist[];
  youtubeVideos: YouTubeVideo[];
  youtubeChannel: YouTubeChannelInfo | null;
  onSelectArticle: (article: Article) => void;
  onSelectVideo?: (video: YouTubeVideo) => void;
  onSelectRegion: (region: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  t: TranslationDictionary;
}

export const LiveNewsroomView: React.FC<LiveNewsroomViewProps> = ({
  articles,
  journalists,
  youtubeVideos,
  youtubeChannel,
  onSelectArticle,
  onSelectVideo,
  onSelectRegion,
  onRefresh,
  isLoading,
  t,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  // Filter unarchived articles
  const activeArticles = articles.filter((a) => !a.isArchived);

  // Breaking stories for the ticker
  const breakingArticles = activeArticles.filter((a) => a.isBreaking);
  const breakingVideos = youtubeVideos.filter((v) => v.is_breaking);

  // Top Lead Story
  const topStory = activeArticles.find((a) => a.isTopStory) || activeArticles[0] || null;

  // Secondary stories (2-3 items)
  const secondaryStories = activeArticles.filter((a) => a.id !== topStory?.id).slice(0, 3);

  // Latest wire stories
  const latestWireStories = activeArticles.slice(3, 10);

  // Topic sections (Politics, Business, Technology, Science, Health, Sports)
  const topics = [
    { id: 'ALL', label: t.viewAll },
    { id: 'Politics', label: t.navPolitics },
    { id: 'Business', label: t.navBusiness },
    { id: 'Technology', label: t.navTechnology },
    { id: 'Science', label: t.navScience },
    { id: 'Health', label: t.navHealth },
    { id: 'Sports', label: t.navSports },
  ];

  const filteredTopicArticles = activeArticles.filter((a) => {
    if (selectedTopic === 'ALL') return true;
    return a.category.toLowerCase() === selectedTopic.toLowerCase();
  });

  return (
    <div className="bg-white min-h-screen text-neutral-900 pb-16">
      {/* 1. BREAKING NEWS TICKER (Directly beneath main header) */}
      <BreakingNewsTicker
        breakingArticles={breakingArticles}
        breakingVideos={breakingVideos}
        articles={breakingArticles}
        videos={breakingVideos}
        onSelectArticle={onSelectArticle}
        onSelectVideo={onSelectVideo}
        t={t}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* 2. AMERICAN EDITORIAL HERO SECTION */}
        <HeroSection
          topStory={topStory}
          secondaryStories={secondaryStories}
          latestWireStories={latestWireStories}
          onSelectArticle={onSelectArticle}
          onSelectVideo={onSelectVideo}
          t={t}
        />

        {/* 3. VIDEO NEWS CENTER (YouTube Delivery Engine & Live Section) */}
        <VideoNewsCenter
          channelInfo={youtubeChannel}
          videos={youtubeVideos}
          onSelectVideo={onSelectVideo}
          onOpenArticleForVideo={(artId) => {
            const art = articles.find((a) => a.id === artId);
            if (art) onSelectArticle(art);
          }}
          t={t}
        />

        {/* 4. REGIONAL INTERNATIONAL NEWS BLOCKS (Americas, Europe, Africa, Asia) */}
        <RegionalNewsSection
          articles={activeArticles}
          journalists={journalists}
          onSelectArticle={onSelectArticle}
          onSelectRegion={onSelectRegion}
          t={t}
        />

        {/* 5. TOPIC FEEDS & COMPACT NEWS CARDS */}
        <section
          id="topic-feeds-section"
          className="border-b border-neutral-300 pb-12 mb-12"
          aria-label="Topic Feeds"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-neutral-900 pb-3 mb-6 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-neutral-950 uppercase tracking-tight">
                {t.latestNews} & Special Reports
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {topics.map((top) => (
                <button
                  key={top.id}
                  onClick={() => setSelectedTopic(top.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-code font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    selectedTopic === top.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {top.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTopicArticles.slice(0, 12).map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                onSelect={onSelectArticle}
              />
            ))}
          </div>
        </section>

        {/* 6. CORRESPONDENT BUREAU ROSTER */}
        <section
          id="correspondent-bureau-roster"
          className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 mb-12 shadow-2xs"
          aria-label="Bureau Correspondents"
        >
          <div className="border-b border-neutral-200 pb-3 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-red-700">
                FIELD BUREAU REPORTERS
              </span>
              <h3 className="text-xl font-serif-editorial font-bold text-neutral-900">
                Four Dedicated Autonomous Desks
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono-code text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Independent Corroboration Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journalists.map((jour) => (
              <div
                key={jour.id}
                className="bg-white border border-neutral-200 rounded p-4 flex flex-col items-center text-center shadow-2xs hover:border-neutral-400 transition-colors"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-neutral-300">
                  <img
                    src={jour.avatar}
                    alt={jour.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-serif-editorial font-bold text-base text-neutral-900">{jour.name}</h4>
                <div className="text-xs font-mono-code text-red-700 font-bold uppercase mt-0.5">{jour.beat} Beat</div>
                <p className="text-xs text-neutral-500 font-sans-editorial line-clamp-2 mt-2">
                  {jour.bio}
                </p>
                <div className="mt-3 pt-2 border-t border-neutral-100 w-full text-[11px] font-mono-code text-neutral-400 flex items-center justify-between">
                  <span>Articles: {jour.articlesCount}</span>
                  <span className="text-emerald-700 font-bold">{jour.accuracyRate}% Corroborated</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
