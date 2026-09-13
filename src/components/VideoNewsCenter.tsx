import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Clock,
  ExternalLink,
  Tv,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { YouTubeVideo, YouTubeChannelInfo, VideoCategory } from '../types';
import { TranslationDictionary } from '../i18n';

interface VideoNewsCenterProps {
  channelInfo: YouTubeChannelInfo | null;
  videos: YouTubeVideo[];
  onSelectVideo?: (video: YouTubeVideo) => void;
  onOpenArticleForVideo?: (articleId: string) => void;
  t: TranslationDictionary;
}

export const VideoNewsCenter: React.FC<VideoNewsCenterProps> = ({
  channelInfo,
  videos,
  onSelectVideo,
  onOpenArticleForVideo,
  t,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  const activeBroadcast = channelInfo?.active_broadcast;
  const upcomingBroadcast = channelInfo?.upcoming_broadcast;

  // Countdown timer for upcoming broadcast
  useEffect(() => {
    if (!upcomingBroadcast?.scheduled_start_time) return;

    const updateTimer = () => {
      const target = new Date(upcomingBroadcast.scheduled_start_time!).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown('Starting momentarily');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [upcomingBroadcast?.scheduled_start_time]);

  // Categories list
  const categories = [
    { id: 'ALL', label: t.viewAll },
    { id: 'BREAKING', label: t.breakingVideo },
    { id: 'REPORTS', label: t.newsReports },
    { id: 'INTERVIEWS', label: t.interviews },
    { id: 'EXPLAINERS', label: t.explainers },
    { id: 'SHORTS', label: t.shortVideos },
  ];

  // Filtered videos
  const filteredVideos = videos.filter((vid) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'BREAKING') return vid.is_breaking;
    if (selectedCategory === 'REPORTS') return vid.category === 'News Report' || vid.category === 'World' || vid.category === 'Americas' || vid.category === 'Europe' || vid.category === 'Africa' || vid.category === 'Asia';
    if (selectedCategory === 'INTERVIEWS') return vid.category === 'Interviews';
    if (selectedCategory === 'EXPLAINERS') return vid.category === 'Explainers';
    if (selectedCategory === 'SHORTS') return vid.category === 'Shorts';
    return true;
  });

  return (
    <section
      id="video-news-center"
      className="border-b border-neutral-300 pb-12 mb-12 bg-white"
      aria-label="Video News Center"
    >
      {/* 1. SECTION HEADER & YOUTUBE DESK BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-neutral-900 pb-3 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-700 text-white text-[10px] font-mono-code font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Tv className="w-3 h-3" />
              OFFICIAL YOUTUBE DESK
            </span>
            <span className="text-xs font-mono-code text-neutral-500">
              CHANNEL: {channelInfo?.channel_title || 'Global AI Newsroom Official Desk'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-neutral-950 uppercase tracking-tight">
            {t.videoNews}
          </h2>
        </div>

        {/* Channel Status / Auth Status Indicator (Section 33) */}
        <div className="flex items-center gap-3">
          {channelInfo?.status === 'requires_reauthorization' ? (
            <div
              id="youtube-reauth-warning"
              className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 rounded font-mono-code"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{t.reauthorizationRequired}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Subscribers: <strong className="text-neutral-900">{channelInfo?.subscriber_count || '245K'}</strong></span>
              <span className="text-neutral-300">|</span>
              <span>Videos: <strong className="text-neutral-900">{videos.length}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 2. LIVE BROADCAST BLOCK (Section 13) */}
      <div className="mb-8">
        {activeBroadcast ? (
          /* ACTIVE LIVE BROADCAST EXISTS */
          <div
            id="active-live-player"
            className="bg-neutral-950 text-white rounded-md border border-red-800 p-4 sm:p-6 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-mono-code font-bold text-xs uppercase px-2.5 py-1 rounded animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  {t.liveBadge} NOW
                </span>
                <h3 className="text-lg sm:text-xl font-serif-editorial font-bold text-white">
                  {activeBroadcast.title}
                </h3>
              </div>

              <a
                href={activeBroadcast.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white px-3 py-1.5 rounded text-xs font-mono-code font-bold transition-colors border border-neutral-700"
              >
                <span>{t.viewLiveOnYouTube}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded 16:9 Player (Section 14) */}
            <div className="relative aspect-16/9 rounded overflow-hidden bg-black border border-neutral-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeBroadcast.youtube_video_id}?autoplay=0&rel=0`}
                title={activeBroadcast.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-neutral-300 font-sans-editorial">
              {activeBroadcast.description}
            </p>
          </div>
        ) : (
          /* NO LIVE BROADCAST (Section 13: "do NOT show a fake live player") */
          <div
            id="no-live-broadcast-box"
            className="bg-neutral-50 border border-neutral-200 rounded p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-500">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif-editorial font-bold text-neutral-900">
                  {t.noLiveBroadcast}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-sans-editorial mt-0.5">
                  {t.noLiveBroadcastDesc}
                </p>
              </div>
            </div>

            {/* Upcoming Live Preview (Section 13) */}
            {upcomingBroadcast && (
              <div className="w-full md:w-auto bg-white border border-neutral-300 rounded p-4 flex flex-col gap-1 min-w-[280px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-code font-bold text-red-700 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t.upcomingLive}
                  </span>
                  <span className="font-mono-code text-[11px] bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                    {countdown}
                  </span>
                </div>
                <h4 className="text-xs font-serif-editorial font-bold text-neutral-900 line-clamp-2 mt-1">
                  {upcomingBroadcast.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-500 mt-1">
                  <span>{t.scheduledFor}: Today 18:00 UTC</span>
                  <a
                    href={upcomingBroadcast.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Set Alert</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. CATEGORY SELECTOR TABS (Section 9) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-neutral-200">
        <Filter className="w-4 h-4 text-neutral-500 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. VIDEO DISPATCHES GRID (Section 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="group flex flex-col bg-white border border-neutral-200 rounded overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Video Thumbnail with Duration & Badges */}
            <div
              onClick={() => setActiveModalVideo(video)}
              className="relative aspect-16/9 bg-neutral-950 overflow-hidden cursor-pointer"
            >
              <img
                src={video.thumbnail_url}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />

              {/* Play Overlay Icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-neutral-950/80 text-white text-[11px] font-mono-code font-semibold px-1.5 py-0.5 rounded">
                {video.duration}
              </div>

              {/* Category / Breaking Pill */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {video.is_breaking && (
                  <span className="bg-red-700 text-white text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase">
                    BREAKING
                  </span>
                )}
                <span className="bg-neutral-900/80 text-white text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded uppercase">
                  {video.category}
                </span>
              </div>
            </div>

            {/* Video Meta & Title */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400 mb-1.5">
                  <span>{new Date(video.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {video.match_status === 'matched' && video.article_id && (
                    <span className="text-blue-700 font-semibold inline-flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Attached Article
                    </span>
                  )}
                </div>

                <h4
                  onClick={() => setActiveModalVideo(video)}
                  className="text-sm font-serif-editorial font-bold text-neutral-900 group-hover:text-red-700 transition-colors cursor-pointer leading-snug line-clamp-2 mb-2"
                >
                  {video.title}
                </h4>

                <p className="text-xs text-neutral-600 font-sans-editorial line-clamp-2 mb-3">
                  {video.description}
                </p>
              </div>

              {/* Card Footer Links */}
              <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                <a
                  href={video.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-red-700 inline-flex items-center gap-1 font-mono-code text-[11px]"
                >
                  <span>{t.watchOnYouTube}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {video.article_id && onOpenArticleForVideo && (
                  <button
                    onClick={() => onOpenArticleForVideo(video.article_id!)}
                    className="font-bold text-neutral-800 hover:text-blue-700 inline-flex items-center gap-0.5 text-xs"
                  >
                    <span>Read Story</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. DEDICATED EMBEDDED VIDEO MODAL PLAYER */}
      {activeModalVideo && (
        <div
          id="video-player-modal"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-4xl w-full border border-neutral-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="bg-red-700 text-white text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase">
                  {activeModalVideo.category}
                </span>
                <span className="font-serif-editorial font-bold truncate text-sm sm:text-base">
                  {activeModalVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="text-neutral-400 hover:text-white p-1 rounded font-mono-code text-sm"
              >
                ✕
              </button>
            </div>

            {/* Embedded 16:9 YouTube Player */}
            <div className="aspect-16/9 bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeModalVideo.youtube_video_id}?autoplay=1&rel=0`}
                title={activeModalVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="text-neutral-600 font-sans-editorial">
                <span>Published: {new Date(activeModalVideo.published_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>Duration: {activeModalVideo.duration}</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={activeModalVideo.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-700 hover:bg-red-800 text-white font-mono-code font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span>{t.watchOnYouTube}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {activeModalVideo.article_id && onOpenArticleForVideo && (
                  <button
                    onClick={() => {
                      const id = activeModalVideo.article_id!;
                      setActiveModalVideo(null);
                      onOpenArticleForVideo(id);
                    }}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white font-mono-code font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                  >
                    <span>Read Full Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
