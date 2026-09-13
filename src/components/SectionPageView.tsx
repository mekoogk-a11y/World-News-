import React from 'react';
import {
  ArrowLeft,
  Home,
  ShieldCheck,
  ChevronRight,
  Tv,
  Radio,
  MapPin,
  Filter,
} from 'lucide-react';
import { Article, Journalist, YouTubeVideo } from '../types';
import { ArticleCard } from './ArticleCard';
import { TranslationDictionary } from '../i18n';

interface SectionPageViewProps {
  sectionId: string;
  sectionTitle: string;
  articles: Article[];
  journalists: Journalist[];
  onSelectArticle: (article: Article) => void;
  onReturnToHome: () => void;
  t: TranslationDictionary;
}

export const SectionPageView: React.FC<SectionPageViewProps> = ({
  sectionId,
  sectionTitle,
  articles,
  journalists,
  onSelectArticle,
  onReturnToHome,
  t,
}) => {
  // Find lead journalist for this section if applicable
  const assignedJournalist = (journalists || []).find(
    (j) =>
      (j.beat && j.beat.toLowerCase().includes(sectionId.toLowerCase())) ||
      (j.geographicScope?.regions?.some((r) => r.toLowerCase().includes(sectionId.toLowerCase())))
  );

  const safeArticles = articles || [];
  const leadStory = safeArticles[0];
  const secondaryStories = safeArticles.slice(1, 3);
  const remainingStories = safeArticles.slice(3);

  return (
    <div className="bg-white min-h-screen text-neutral-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-500">
            <button
              onClick={onReturnToHome}
              className="hover:text-red-700 flex items-center gap-1 font-bold text-neutral-800 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.breadcrumbHome}</span>
            </button>
            <span>/</span>
            <span className="uppercase font-bold text-red-700">{sectionTitle}</span>
          </div>

          <button
            onClick={onReturnToHome}
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-red-700" />
            <span>{t.returnToFirstPage}</span>
          </button>
        </div>

        {/* Section Masthead */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-red-700">
              EDITORIAL DESK DISPATCHES
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-editorial font-black uppercase text-neutral-950 tracking-tight mt-1">
              {sectionTitle}
            </h1>
          </div>

          {assignedJournalist && (
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 p-2.5 rounded">
              <img
                src={assignedJournalist.avatar}
                alt={assignedJournalist.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-300"
              />
              <div className="text-xs">
                <div className="font-bold text-neutral-900">{assignedJournalist.name}</div>
                <div className="text-neutral-500 font-mono-code text-[11px]">
                  Desk Lead • {assignedJournalist.role}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lead Story if available */}
        {leadStory ? (
          <div className="mb-10">
            <ArticleCard article={leadStory} onSelect={onSelectArticle} featured={true} />
          </div>
        ) : (
          <div className="p-12 text-center border border-neutral-200 rounded bg-neutral-50 text-neutral-500 font-serif-editorial">
            No active dispatches currently filed under this desk.
          </div>
        )}

        {/* Remaining Stories Grid */}
        {remainingStories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {remainingStories.map((art) => (
              <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} />
            ))}
          </div>
        )}

        {/* Bottom Return to First Page Banner */}
        <div className="pt-8 border-t border-neutral-300 flex items-center justify-between">
          <button
            onClick={onReturnToHome}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t.returnToFirstPage}</span>
          </button>

          <span className="text-xs font-mono-code text-neutral-400">
            {articles.length} Verified Dispatches in {sectionTitle}
          </span>
        </div>
      </div>
    </div>
  );
};
