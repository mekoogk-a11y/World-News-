import React from 'react';
import {
  Globe,
  MapPin,
  Clock,
  ArrowRight,
  Radio,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Article, Journalist, YouTubeVideo } from '../types';
import { TranslationDictionary } from '../i18n';

interface RegionalNewsSectionProps {
  articles: Article[];
  journalists: Journalist[];
  onSelectArticle: (article: Article) => void;
  onSelectRegion: (region: string) => void;
  t: TranslationDictionary;
}

export const RegionalNewsSection: React.FC<RegionalNewsSectionProps> = ({
  articles,
  journalists,
  onSelectArticle,
  onSelectRegion,
  t,
}) => {
  const regions = [
    {
      id: 'americas',
      title: t.navAmericas,
      leadJournalistId: 'michael-carter',
      bureau: 'Washington DC & New York',
      flagCode: 'US',
      viewAllText: t.viewAllAmericas,
    },
    {
      id: 'europe',
      title: t.navEurope,
      leadJournalistId: 'daniel-wilson',
      bureau: 'London, Paris & Berlin',
      flagCode: 'EU',
      viewAllText: t.viewAllEurope,
    },
    {
      id: 'africa',
      title: t.navAfrica,
      leadJournalistId: 'david-okoro',
      bureau: 'Nairobi, Lagos & Johannesburg',
      flagCode: 'AF',
      viewAllText: t.viewAllAfrica,
    },
    {
      id: 'asia',
      title: t.navAsia,
      leadJournalistId: 'kenji-nakamura',
      bureau: 'Tokyo, Singapore & Seoul',
      flagCode: 'AS',
      viewAllText: t.viewAllAsia,
    },
  ];

  return (
    <section
      id="regional-news-blocks"
      className="border-b border-neutral-300 pb-12 mb-12 bg-white"
      aria-label="Regional Desks"
    >
      <div className="border-b-2 border-neutral-900 pb-2 mb-8 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-neutral-950 uppercase tracking-tight">
          International Regional Desks
        </h2>
        <span className="text-xs font-mono-code text-neutral-500 uppercase hidden sm:inline">
          4 Dedicated Field Correspondents • Cross-Corroborated Wires
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {regions.map((reg) => {
          const regionalArticles = articles.filter(
            (a) => a.region.toLowerCase() === reg.id.toLowerCase()
          );
          const journalist = journalists.find((j) => j.id === reg.leadJournalistId);
          const leadStory = regionalArticles[0];
          const secondaryStories = regionalArticles.slice(1, 4);

          return (
            <div
              key={reg.id}
              className="border border-neutral-200 rounded p-5 flex flex-col justify-between bg-white shadow-2xs"
            >
              <div>
                {/* Regional Block Header with Correspondent */}
                <div className="border-b border-neutral-200 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-serif-editorial font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-700 rounded-xs"></span>
                      {reg.title}
                    </h3>
                    <div className="text-[11px] font-mono-code text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span>{reg.bureau}</span>
                    </div>
                  </div>

                  {journalist && (
                    <div className="flex items-center gap-2 text-right">
                      <div className="hidden sm:block">
                        <div className="text-xs font-bold text-neutral-800">{journalist.name}</div>
                        <div className="text-[10px] font-mono-code text-neutral-500">{journalist.role}</div>
                      </div>
                      <img
                        src={journalist.avatar}
                        alt={journalist.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-neutral-300"
                      />
                    </div>
                  )}
                </div>

                {/* Lead Regional Story */}
                {leadStory && (
                  <div className="mb-5 pb-5 border-b border-neutral-100">
                    {leadStory.imageUrl && (
                      <div
                        onClick={() => onSelectArticle(leadStory)}
                        className="aspect-16/9 rounded overflow-hidden mb-3 bg-neutral-100 cursor-pointer border border-neutral-200 group"
                      >
                        <img
                          src={leadStory.imageUrl}
                          alt={leadStory.headline}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono-code">
                      <span className="text-red-700 font-bold uppercase">{leadStory.category}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-500">{leadStory.country}</span>
                      {leadStory.video && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] px-1 rounded ml-auto">
                          <Radio className="w-2.5 h-2.5" />
                          VIDEO
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => onSelectArticle(leadStory)}
                      className="text-lg font-serif-editorial font-bold text-neutral-900 hover:text-red-700 transition-colors cursor-pointer leading-snug mb-1.5"
                    >
                      {leadStory.headline}
                    </h4>

                    <p className="text-xs text-neutral-600 font-serif-editorial line-clamp-2">
                      {leadStory.summary}
                    </p>
                  </div>
                )}

                {/* Secondary Regional Stories */}
                <div className="divide-y divide-neutral-100 mb-4">
                  {secondaryStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => onSelectArticle(story)}
                      className="py-2.5 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono-code text-neutral-400 mb-0.5">
                        <span className="text-neutral-700 font-semibold uppercase">{story.category}</span>
                        <span>•</span>
                        <span>{new Date(story.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h5 className="text-xs font-serif-editorial font-bold text-neutral-900 group-hover:text-red-700 transition-colors leading-snug">
                        {story.shortHeadline || story.headline}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>

              {/* View All Regional Button */}
              <div className="pt-3 border-t border-neutral-200 text-right">
                <button
                  onClick={() => onSelectRegion(reg.id)}
                  className="inline-flex items-center gap-1 text-xs font-mono-code font-bold text-neutral-800 hover:text-red-700 transition-colors uppercase"
                >
                  <span>{reg.viewAllText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
