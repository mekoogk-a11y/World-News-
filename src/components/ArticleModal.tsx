import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  FileCheck2,
  Share2,
  Bookmark,
  CheckCircle2,
  Layers,
  MapPin,
  Calendar,
  Home,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Tv,
  Radio,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Article, YouTubeVideo } from '../types';
import { TranslationDictionary } from '../i18n';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectRelated: (article: Article) => void;
  allArticles: Article[];
  onReturnToHome?: () => void;
  onSelectPrevArticle?: () => void;
  onSelectNextArticle?: () => void;
  t: TranslationDictionary;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectRelated,
  allArticles,
  onReturnToHome,
  onSelectPrevArticle,
  onSelectNextArticle,
  t,
}) => {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [copied, setCopied] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPlayingSpeech) window.speechSynthesis?.cancel();
        onClose();
      }
    };
    if (article) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, isPlayingSpeech, onClose]);

  if (!article) return null;

  const pubDate = new Date(article.published_at);
  const updatedDate = new Date(article.updated_at);

  const formattedPubDate = pubDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPubTime = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedUpdateTime = updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const relatedStories = allArticles
    .filter((a) => a.id !== article.id && (a.category === article.category || a.region === article.region))
    .slice(0, 3);

  // Web Speech API Voice Reader
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${article.headline || ''}. ${article.summary || ''}. ${(article.fullArticle || '').slice(0, 800)}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingSpeech(false);
      utterance.onerror = () => setIsPlayingSpeech(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBackToFirstPage = () => {
    if (isPlayingSpeech) window.speechSynthesis?.cancel();
    if (onReturnToHome) {
      onReturnToHome();
    } else {
      onClose();
    }
  };

  const attachedVideo: YouTubeVideo | undefined = article.video;

  return (
    <div
      id="article-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <article
        id="article-detail-modal"
        className="bg-white text-neutral-900 w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden border border-neutral-300 my-auto relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={article.headline}
      >
        {/* ========================================================= */}
        {/* 1. TOP EDITORIAL NAVIGATION & BREADCRUMB BAR */}
        {/* ========================================================= */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-500 truncate">
            <button
              onClick={handleBackToFirstPage}
              className="hover:text-red-700 flex items-center gap-1 font-bold text-neutral-800 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.breadcrumbHome}</span>
            </button>
            <span>/</span>
            <span className="uppercase text-neutral-600">{article.region}</span>
            <span>/</span>
            <span className="uppercase font-bold text-red-700">{article.category}</span>
          </div>

          {/* Quick Action Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Return to First Page Button (User Request) */}
            <button
              id="top-return-first-page-btn"
              onClick={handleBackToFirstPage}
              className="inline-flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold px-2.5 py-1 rounded transition-colors"
              title={t.returnToFirstPage}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.returnToFirstPage}</span>
            </button>

            {onSelectPrevArticle && (
              <button
                onClick={onSelectPrevArticle}
                className="p-1 hover:bg-neutral-100 border border-neutral-300 rounded text-neutral-700"
                title={t.previousStory}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {onSelectNextArticle && (
              <button
                onClick={onSelectNextArticle}
                className="p-1 hover:bg-neutral-100 border border-neutral-300 rounded text-neutral-700"
                title={t.nextStory}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              id="article-close-button"
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ARTICLE CONTENT CONTAINER */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-8 lg:p-10 max-w-3xl mx-auto">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-mono-code text-neutral-500">
            <span className="bg-red-700 text-white font-bold px-2 py-0.5 rounded uppercase text-[10px]">
              {article.category}
            </span>
            <span>•</span>
            <span className="font-bold text-neutral-700">{article.country} BUREAU</span>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.confidenceScore}: {article.confidenceScore}%</span>
            </div>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial font-bold text-neutral-950 leading-tight mb-4">
            {article.headline}
          </h1>

          {/* Dek / Subheadline */}
          <p className="text-base sm:text-xl text-neutral-700 font-serif-editorial leading-relaxed mb-6 border-b border-neutral-200 pb-4">
            {article.summary}
          </p>

          {/* Journalist Byline & Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 mb-6 border-b border-neutral-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                <img
                  src={
                    article.journalistId === 'michael-carter'
                      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
                      : article.journalistId === 'daniel-wilson'
                      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
                      : article.journalistId === 'david-okoro'
                      ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80'
                  }
                  alt={article.journalistName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-neutral-900 text-sm">{article.journalistName}</div>
                <div className="text-neutral-500 font-sans-editorial">
                  Correspondent • {article.region} Beat
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono-code text-[11px] text-neutral-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>{formattedPubDate}</span>
              </div>
              <span>•</span>
              <div>{formattedPubTime} EST</div>
            </div>
          </div>

          {/* Audio Listen & Social Share Tools */}
          <div className="flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-200 rounded p-2.5 mb-6 text-xs">
            <button
              onClick={toggleSpeech}
              className="flex items-center gap-2 text-neutral-800 hover:text-red-700 font-bold transition-colors"
            >
              {isPlayingSpeech ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-600" />
                  <span>{t.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-red-600" />
                  <span>{t.listenArticle}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-300 px-2.5 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Lead Photo with Caption & License */}
          {article.imageUrl && (
            <div className="mb-6 rounded overflow-hidden border border-neutral-200 bg-neutral-100">
              <img
                src={article.imageUrl}
                alt={article.headline}
                referrerPolicy="no-referrer"
                className="w-full max-h-[440px] object-cover"
              />
              <div className="p-2.5 bg-neutral-50 text-[11px] text-neutral-500 font-sans-editorial flex items-center justify-between border-t border-neutral-200">
                <span>{article.country} Field Wire Documentation</span>
                <span className="font-mono-code">Bureau Wire Service</span>
              </div>
            </div>
          )}

          {/* Archive Status / Restored Badge */}
          {article.is_restored && (
            <div className="mb-4 p-2.5 rounded bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-mono-code flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Restored from Permanent Archive to Live Newspaper Edition by Newsroom Operations</span>
            </div>
          )}

          {/* Alex Morgan Editorial Verification Seal */}
          {article.editorialReview && (
            <div className="mb-6 p-3.5 rounded bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold uppercase tracking-wider text-red-400 text-[11px]">
                      VERIFIED BY EDITOR-IN-CHIEF
                    </span>
                    <span className="bg-emerald-800 text-emerald-100 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded">
                      SCORE: {article.editorialReview.score}/100
                    </span>
                  </div>
                  <p className="text-neutral-300 font-sans-editorial text-xs mt-0.5">
                    {article.editorialReview.notes || 'Audited for factual corroboration and cross-wire accuracy.'}
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono-code text-neutral-400 text-right shrink-0">
                <span>Desk: Alex Morgan</span>
                <br />
                <span>Sourcing: {article.editorialReview.sourcingQuality}</span>
              </div>
            </div>
          )}

          {/* Key Facts Box */}
          {article.keyFacts && article.keyFacts.length > 0 && (
            <div className="mb-8 p-4 rounded bg-neutral-50 border border-neutral-300">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs font-mono-code uppercase tracking-wider mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.keyFacts}</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-800 font-sans-editorial">
                {article.keyFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-700 font-bold mt-0.5">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ========================================================= */}
          {/* YOUTUBE VIDEO REPORT INTEGRATION (Requirement 14 & 16) */}
          {/* ========================================================= */}
          {attachedVideo && (
            <div className="my-8 bg-neutral-950 text-white rounded-md p-4 border border-neutral-800">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-mono-code font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {t.videoReport}
                  </span>
                  <h3 className="text-sm sm:text-base font-serif-editorial font-bold text-neutral-100 truncate">
                    {attachedVideo.title}
                  </h3>
                </div>
                <a
                  href={attachedVideo.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono-code text-neutral-400 hover:text-white inline-flex items-center gap-1 shrink-0"
                >
                  <span>{t.watchOnYouTube}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Official 16:9 Embedded YouTube Player */}
              <div className="relative aspect-16/9 rounded overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${attachedVideo.youtube_video_id}?autoplay=0&rel=0`}
                  title={attachedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              </div>

              <div className="mt-2 text-[11px] font-mono-code text-neutral-400 flex items-center justify-between">
                <span>Duration: {attachedVideo.duration}</span>
                <span>Official Global AI Newsroom Desk Stream</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FULL ARTICLE BODY WITH RETURN BUTTON FROM EVERY PARAGRAPH */}
          {/* (Fulfills: اعمل زر رجوع من كل فقرة والرجوع الي الصفحة الأولى) */}
          {/* ========================================================= */}
          <div className="font-serif-editorial text-base sm:text-lg text-neutral-900 leading-relaxed space-y-6 my-8">
            {(article.fullArticle || article.summary || '').split('\n\n').filter(Boolean).map((paragraph, idx) => (
              <div key={idx} className="group relative pb-2 border-b border-neutral-100">
                <p className="first:text-lg sm:first:text-xl first:font-medium text-neutral-900 leading-relaxed">
                  {paragraph}
                </p>

                {/* Return button from EVERY paragraph */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-1">
                  <button
                    id={`paragraph-back-btn-${idx}`}
                    onClick={handleBackToFirstPage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-700 border border-neutral-200 hover:border-red-300 text-xs font-sans-editorial transition-colors shadow-2xs"
                    title={t.returnToFirstPage}
                  >
                    <ArrowLeft className="w-3 h-3 text-red-700" />
                    <span>{t.returnToFirstPage}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Developing Story Updates Timeline (Section 11) */}
          {article.developingUpdates && article.developingUpdates.length > 0 && (
            <div className="my-8 p-5 rounded bg-red-50/50 border border-red-200">
              <div className="flex items-center justify-between gap-2 mb-4 border-b border-red-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-red-700 tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span>DEVELOPING STORY • LIVE UPDATES TIMELINE</span>
                </div>
                <span className="text-[11px] font-mono-code text-red-600 font-bold">
                  {article.developingUpdates.length} Verified Bulletins
                </span>
              </div>

              <div className="space-y-4">
                {article.developingUpdates.map((upd) => (
                  <div key={upd.id} className="p-3.5 rounded bg-white border border-red-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-500">
                      <span className="font-bold text-red-700">UPDATE #{upd.updateNumber}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{new Date(upd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {upd.headline && (
                      <h4 className="text-sm font-serif-editorial font-bold text-neutral-900">
                        {upd.headline}
                      </h4>
                    )}

                    <p className="text-xs sm:text-sm font-sans-editorial text-neutral-800 leading-relaxed">
                      {upd.content}
                    </p>

                    {upd.sources && upd.sources.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-[10px] font-mono-code text-neutral-500">
                        <span className="font-bold">Sourced:</span>
                        {upd.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-700 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>{s.name}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources and Evidentiary Verification Table */}
          <div className="my-8 p-4 rounded bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono-code font-bold uppercase text-neutral-800 tracking-wider">
              <FileCheck2 className="w-4 h-4 text-blue-700" />
              <span>{t.sourcesVerification}</span>
            </div>
            <div className="divide-y divide-neutral-200 text-xs">
              {(article.sources || []).map((src, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{src.name}</span>
                  <span className="font-mono-code text-neutral-500">{src.credibilityScore || src.reliability || 95}% Reliability Score</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] font-mono-code text-neutral-500 pt-2 border-t border-neutral-200">
              {t.zeroHallucinationNotice}
            </div>
          </div>

          {/* Related Stories */}
          {(relatedStories || []).length > 0 && (
            <div className="mt-10 pt-6 border-t-2 border-neutral-900">
              <h3 className="text-lg font-serif-editorial font-bold text-neutral-900 uppercase tracking-tight mb-4">
                {t.relatedStories}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(relatedStories || []).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 border border-neutral-200 rounded hover:border-neutral-400 cursor-pointer transition-colors flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-mono-code text-red-700 font-bold uppercase mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-serif-editorial font-bold text-neutral-900 line-clamp-3 mb-2">
                      {rel.headline}
                    </h4>
                    <span className="text-[10px] font-mono-code text-neutral-400">
                      {new Date(rel.published_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Return To First Page Banner */}
          <div className="mt-10 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleBackToFirstPage}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{t.returnToFirstPage}</span>
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-mono-code text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
