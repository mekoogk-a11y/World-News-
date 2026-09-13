import React from 'react';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, Bookmark, ExternalLink, Radio } from 'lucide-react';
import { Article, VerificationStatus } from '../types';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  featured?: boolean;
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export const VerificationBadge: React.FC<{ status: VerificationStatus; score?: number }> = ({
  status,
  score,
}) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          <span>CONFIRMED</span>
          {score ? <span>{score}%</span> : null}
        </span>
      );
    case 'DEVELOPING':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-2.5 h-2.5 text-amber-600 animate-spin" />
          <span>DEVELOPING</span>
        </span>
      );
    case 'UNCONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
          <AlertCircle className="w-2.5 h-2.5 text-neutral-500" />
          <span>UNCONFIRMED</span>
        </span>
      );
    case 'ANALYSIS':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-50 text-blue-800 border border-blue-300">
          <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
          <span>ANALYSIS</span>
        </span>
      );
    default:
      return null;
  }
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect, featured = false }) => {
  const relPubTime = formatRelativeTime(article.published_at);
  const imageUrl = article.imageUrl || article.image?.url;

  if (featured) {
    return (
      <article
        id={`article-card-${article.id}`}
        onClick={() => onSelect(article)}
        className="group relative bg-white border border-neutral-300 rounded overflow-hidden hover:border-neutral-500 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        <div className="lg:col-span-7 relative h-64 sm:h-72 lg:h-full overflow-hidden bg-neutral-100">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={article.headline}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          )}
          {article.isBreaking && (
            <div className="absolute top-3 left-3 bg-red-700 text-white font-mono-code font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              BREAKING
            </div>
          )}
          {article.video && (
            <div className="absolute bottom-3 left-3 bg-neutral-900/90 text-white font-mono-code text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-500" />
              <span>VIDEO REPORT</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono-code">
              <span className="font-bold uppercase tracking-wider text-red-700">
                {article.category}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500 uppercase">
                {article.region}
              </span>
              <span className="text-neutral-300">•</span>
              <VerificationBadge status={article.verificationStatus} score={article.confidenceScore} />
            </div>

            <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-neutral-950 group-hover:text-red-700 transition-colors leading-tight mb-2.5">
              {article.headline}
            </h2>

            <p className="text-sm text-neutral-600 font-serif-editorial line-clamp-3 leading-relaxed mb-4">
              {article.summary}
            </p>
          </div>

          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between text-xs font-mono-code text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="font-sans-editorial font-bold text-neutral-800">
                {article.journalistName}
              </span>
              <span>•</span>
              <span>{relPubTime}</span>
            </div>

            <div className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
              {article.sources.length} Wires
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`article-card-${article.id}`}
      onClick={() => onSelect(article)}
      className="group bg-white border border-neutral-200 rounded overflow-hidden hover:border-neutral-400 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {imageUrl && (
          <div className="relative aspect-16/9 w-full overflow-hidden bg-neutral-100">
            <img
              src={imageUrl}
              alt={article.headline}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider bg-white/95 text-red-700 px-2 py-0.5 rounded border border-neutral-300">
                {article.category}
              </span>
            </div>
            {article.video && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono-code px-1.5 py-0.5 rounded flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-red-500" />
                <span>VIDEO</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="text-[11px] font-mono-code text-neutral-500 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-800 uppercase">{article.country}</span>
              <span>•</span>
              <span>{relPubTime}</span>
            </div>
            <VerificationBadge status={article.verificationStatus} score={article.confidenceScore} />
          </div>

          <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug mb-2">
            {article.headline}
          </h3>

          <p className="text-xs text-neutral-600 font-sans-editorial line-clamp-2 leading-relaxed mb-3">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-neutral-100 mt-auto flex items-center justify-between text-xs text-neutral-500">
        <span className="font-sans-editorial font-medium text-neutral-700 truncate max-w-[130px]">
          By {article.journalistName.split(' ')[0]}
        </span>
        <span className="text-[10px] font-mono-code text-neutral-400">
          {article.sources[0]?.name || 'WIRE'}
        </span>
      </div>
    </article>
  );
};
