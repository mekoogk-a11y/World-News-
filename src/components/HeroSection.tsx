import React from 'react';
import {
  Clock,
  Radio,
  Play,
  Volume2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Article, YouTubeVideo } from '../types';
import { TranslationDictionary } from '../i18n';

interface HeroSectionProps {
  topStory: Article | null;
  secondaryStories: Article[];
  latestWireStories: Article[];
  onSelectArticle: (article: Article) => void;
  onSelectVideo?: (video: YouTubeVideo) => void;
  onPlayAudioArticle?: (article: Article) => void;
  t: TranslationDictionary;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  topStory,
  secondaryStories,
  latestWireStories,
  onSelectArticle,
  onSelectVideo,
  onPlayAudioArticle,
  t,
}) => {
  if (!topStory) return null;

  return (
    <section
      id="homepage-hero-section"
      className="border-b border-neutral-300 pb-8 mb-8 bg-white"
      aria-label="Lead Stories"
    >
      {/* Top Section Header with Date Stamp & Confidence Index */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-6 text-xs text-neutral-500 font-mono-code">
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-700 uppercase tracking-widest flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            {t.topStory}
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-700 font-sans-editorial uppercase">{topStory.region} BUREAU</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-neutral-600">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Corroboration Confidence: <strong className="text-neutral-900 font-mono-code">98.4%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* COL 1 & 2: PRIMARY LEAD STORY (7 COLS ON DESKTOP) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-6 lg:pb-0">
          <div>
            {/* Category kicker */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-red-700">
                {topStory.category}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-mono-code text-neutral-500 uppercase">
                {topStory.country}
              </span>
              {topStory.video && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ml-auto">
                  <Radio className="w-3 h-3 text-red-600" />
                  {t.videoReport}
                </span>
              )}
            </div>

            {/* Lead Headline */}
            <h2
              onClick={() => onSelectArticle(topStory)}
              className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-neutral-950 leading-tight hover:text-red-800 transition-colors cursor-pointer mb-3"
            >
              {topStory.headline}
            </h2>

            {/* Dek / Subheadline */}
            <p className="text-base sm:text-lg text-neutral-700 font-serif-editorial leading-relaxed mb-4">
              {topStory.summary}
            </p>

            {/* Primary Large Photography */}
            <div
              onClick={() => onSelectArticle(topStory)}
              className="relative aspect-16/9 overflow-hidden rounded bg-neutral-100 cursor-pointer group mb-4 border border-neutral-200"
            >
              <img
                src={topStory.imageUrl}
                alt={topStory.headline}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent p-3 text-white flex items-center justify-between text-xs font-mono-code">
                <span>{topStory.country} Bureau Archive</span>
                <span>{topStory.category.toUpperCase()} DISPATCH</span>
              </div>
            </div>

            {/* Key Facts Callout Box */}
            {topStory.keyFacts && topStory.keyFacts.length > 0 && (
              <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded mb-4">
                <div className="text-xs font-mono-code font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-700" />
                  <span>{t.keyFacts}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-700 font-sans-editorial">
                  {topStory.keyFacts.slice(0, 3).map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-700 font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Byline, Dateline, and Action Controls */}
          <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-sans-editorial font-bold text-neutral-900">
                By {topStory.journalistName}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500 font-mono-code">
                {new Date(topStory.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} EST
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onPlayAudioArticle && (
                <button
                  onClick={() => onPlayAudioArticle(topStory)}
                  className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-red-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 px-2.5 py-1 rounded transition-colors text-xs font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5 text-red-700" />
                  <span>{t.listenArticle}</span>
                </button>
              )}

              <button
                onClick={() => onSelectArticle(topStory)}
                className="inline-flex items-center gap-1 font-bold text-neutral-900 hover:text-red-700 transition-colors"
              >
                <span>{t.readFullStory}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COL 3: DEVELOPING STORIES (3 COLS ON DESKTOP) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col divide-y divide-neutral-200 pr-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-6 lg:pb-0">
          <div className="pb-2 mb-2">
            <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-700" />
              {t.developingStory}
            </span>
          </div>

          {(secondaryStories || []).slice(0, 3).map((art) => (
            <article key={art.id} className="py-4 first:pt-0 last:pb-0 group">
              <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono-code text-neutral-500">
                <span className="font-bold text-red-700 uppercase">{art.category}</span>
                <span>•</span>
                <span>{art.region}</span>
              </div>

              {art.imageUrl && (
                <div
                  onClick={() => onSelectArticle(art)}
                  className="aspect-16/9 rounded overflow-hidden mb-2.5 bg-neutral-100 cursor-pointer border border-neutral-200"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.headline}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
              )}

              <h3
                onClick={() => onSelectArticle(art)}
                className="text-base sm:text-lg font-serif-editorial font-bold text-neutral-900 group-hover:text-red-800 transition-colors cursor-pointer leading-snug mb-1.5"
              >
                {art.headline}
              </h3>

              <p className="text-xs text-neutral-600 font-serif-editorial line-clamp-2 mb-2">
                {art.summary}
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400">
                <span>By {art.journalistName.split(' ')[0]}</span>
                <span>{new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </article>
          ))}
        </div>

        {/* ========================================================= */}
        {/* COL 4: LATEST WIRE TICKER (2 COLS ON DESKTOP) */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="pb-2 mb-2 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-neutral-900">
              {t.latestNews}
            </span>
            <span className="text-[10px] font-mono-code text-red-700 font-bold animate-pulse">WIRE ON</span>
          </div>

          <div className="divide-y divide-neutral-100 flex-1">
            {(latestWireStories || []).slice(0, 6).map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="py-2.5 group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-neutral-400 mb-0.5">
                  <Clock className="w-2.5 h-2.5 text-neutral-400" />
                  <span>
                    {new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span className="text-neutral-600 font-semibold uppercase">{art.sources?.[0]?.name || 'WIRE'}</span>
                </div>
                <h4 className="text-xs font-serif-editorial font-semibold text-neutral-900 group-hover:text-red-700 transition-colors leading-snug">
                  {art.shortHeadline || art.headline}
                </h4>
              </div>
            ))}
          </div>

          {/* Wire attribution disclaimer */}
          <div className="mt-4 pt-3 border-t border-neutral-200 text-[10px] font-mono-code text-neutral-400">
            Automated Cross-Wire Ingestion • Real-Time AI Fact Checking
          </div>
        </div>
      </div>
    </section>
  );
};
