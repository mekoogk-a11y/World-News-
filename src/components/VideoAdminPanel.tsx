import React, { useState } from 'react';
import {
  Tv,
  RefreshCw,
  Radio,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Link,
  Unlink,
  Star,
  Flame,
  Eye,
  EyeOff,
  Filter,
  Save,
  Calendar,
  Layers,
} from 'lucide-react';
import { YouTubeVideo, YouTubeChannelInfo, Article, VideoCategory } from '../types';
import { TranslationDictionary } from '../i18n';

interface VideoAdminPanelProps {
  channelInfo: YouTubeChannelInfo | null;
  videos: YouTubeVideo[];
  articles: Article[];
  onSyncYouTube: () => Promise<void>;
  onUpdateVideo: (id: string, updates: Partial<YouTubeVideo>) => Promise<void>;
  onToggleSimulateLive: () => Promise<void>;
  onRematchAll: () => Promise<void>;
  t: TranslationDictionary;
}

export const VideoAdminPanel: React.FC<VideoAdminPanelProps> = ({
  channelInfo,
  videos,
  articles,
  onSyncYouTube,
  onUpdateVideo,
  onToggleSimulateLive,
  onRematchAll,
  t,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNMATCHED' | 'MATCHED' | 'LIVE'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncYouTube();
      showToast(t.syncSuccess);
    } catch (e: any) {
      showToast('Sync error: ' + (e.message || 'Check network'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRematch = async () => {
    setIsMatching(true);
    try {
      await onRematchAll();
      showToast('Auto-matcher re-evaluated across all articles and videos.');
    } catch (e: any) {
      showToast('Error during auto-match');
    } finally {
      setIsMatching(false);
    }
  };

  const handleAttachArticle = async (videoId: string, articleId: string) => {
    await onUpdateVideo(videoId, {
      article_id: articleId || null,
      match_status: articleId ? 'matched' : 'unmatched',
      match_confidence: articleId ? 100 : undefined,
    });
    showToast(articleId ? 'Attached to article successfully.' : 'Detached from article.');
  };

  const handleToggleBreaking = async (video: YouTubeVideo) => {
    await onUpdateVideo(video.id, { is_breaking: !video.is_breaking });
  };

  const handleToggleFeatured = async (video: YouTubeVideo) => {
    await onUpdateVideo(video.id, { is_featured: !video.is_featured });
  };

  const handleCategoryChange = async (videoId: string, category: VideoCategory) => {
    await onUpdateVideo(videoId, { category });
  };

  const filteredVideos = videos.filter((v) => {
    if (filterTab === 'UNMATCHED') return v.match_status === 'unmatched';
    if (filterTab === 'MATCHED') return v.match_status === 'matched';
    if (filterTab === 'LIVE') return v.live_status === 'live' || v.live_status === 'upcoming';
    return true;
  });

  const categories: VideoCategory[] = [
    'Live',
    'Breaking News',
    'World',
    'Interviews',
    'Explainers',
    'Documentary',
    'Shorts',
    'Americas',
    'Europe',
    'Africa',
    'Asia',
    'Politics',
    'Business',
    'Technology',
    'Science',
    'Health',
    'Sports',
  ];

  return (
    <div id="video-admin-panel" className="bg-white border border-neutral-200 rounded-lg p-6 max-w-7xl mx-auto shadow-sm">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded shadow-xl text-xs font-mono-code flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CHANNEL CONNECTION STATUS CARD (Section 18 & 33) */}
      <div className="border-b border-neutral-200 pb-6 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-300 shrink-0">
              <img
                src={channelInfo?.channel_thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=160'}
                alt="Channel Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif-editorial font-bold text-neutral-900">
                  {channelInfo?.channel_title || 'Global AI Newsroom YouTube Channel'}
                </h3>
                {channelInfo?.status === 'requires_reauthorization' ? (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border border-amber-300">
                    REAUTH REQUIRED
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {t.connected}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-neutral-500 mt-1">
                <span>Account: <strong className="text-neutral-800">mekoogk@gmail.com</strong></span>
                <span>•</span>
                <span>Subscribers: <strong className="text-neutral-800">{channelInfo?.subscriber_count || '245K'}</strong></span>
                <span>•</span>
                <span>Total Videos: <strong className="text-neutral-800">{videos.length}</strong></span>
                <span>•</span>
                <span>Last Synced: <strong className="text-neutral-800">{new Date(channelInfo?.last_sync_time || Date.now()).toLocaleTimeString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-red-700 hover:bg-red-800 text-white font-mono-code font-bold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : t.syncYouTube}</span>
            </button>

            <button
              onClick={handleRematch}
              disabled={isMatching}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-mono-code font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 transition-colors"
              title="Intelligently correlate videos with news articles"
            >
              <Layers className="w-3.5 h-3.5 text-neutral-300" />
              <span>{isMatching ? 'Matching...' : 'Auto-Match All'}</span>
            </button>

            <button
              onClick={onToggleSimulateLive}
              className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-mono-code font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 transition-colors"
              title="Toggle simulated live broadcast to test LIVE NOW vs No Broadcast state"
            >
              <Radio className="w-3.5 h-3.5 text-red-600" />
              <span>Toggle Live Broadcast Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase ${
              filterTab === 'ALL' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Videos ({videos.length})
          </button>
          <button
            onClick={() => setFilterTab('UNMATCHED')}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase ${
              filterTab === 'UNMATCHED' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Unmatched ({videos.filter((v) => v.match_status === 'unmatched').length})
          </button>
          <button
            onClick={() => setFilterTab('MATCHED')}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase ${
              filterTab === 'MATCHED' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Matched Articles ({videos.filter((v) => v.match_status === 'matched').length})
          </button>
          <button
            onClick={() => setFilterTab('LIVE')}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase ${
              filterTab === 'LIVE' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Live & Upcoming
          </button>
        </div>
      </div>

      {/* 3. VIDEO INVENTORY LIST */}
      <div className="space-y-4">
        {filteredVideos.map((video) => {
          const matchedArticle = articles.find((a) => a.id === video.article_id);

          return (
            <div
              key={video.id}
              className="border border-neutral-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-neutral-50/50 hover:bg-white transition-colors"
            >
              {/* Thumbnail & Title Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative w-36 aspect-16/9 bg-neutral-950 rounded overflow-hidden shrink-0 border border-neutral-300">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono-code px-1 rounded">
                    {video.duration}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-neutral-200 text-neutral-800 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase">
                      {video.category}
                    </span>
                    {video.is_breaking && (
                      <span className="bg-red-600 text-white text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase">
                        BREAKING
                      </span>
                    )}
                    {video.is_featured && (
                      <span className="bg-amber-500 text-white text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        FEATURED
                      </span>
                    )}
                    <span className="text-[11px] font-mono-code text-neutral-400">
                      ID: {video.youtube_video_id}
                    </span>
                  </div>

                  <h4 className="text-sm font-serif-editorial font-bold text-neutral-900 line-clamp-1 mb-1">
                    {video.title}
                  </h4>

                  {/* Attached Article indicator or selector */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-mono-code text-neutral-500">Attach to Article:</span>
                    <select
                      value={video.article_id || ''}
                      onChange={(e) => handleAttachArticle(video.id, e.target.value)}
                      className="bg-white border border-neutral-300 rounded text-xs px-2 py-1 max-w-xs font-sans-editorial text-neutral-800"
                    >
                      <option value="">-- No Article Attached (Standalone) --</option>
                      {articles.map((art) => (
                        <option key={art.id} value={art.id}>
                          [{art.category}] {art.headline.slice(0, 50)}...
                        </option>
                      ))}
                    </select>

                    {video.match_status === 'matched' && (
                      <span className="text-emerald-700 text-xs font-mono-code font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {video.match_confidence ? `${video.match_confidence}% Match` : 'Matched'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200 w-full md:w-auto justify-end">
                {/* Category selector */}
                <select
                  value={video.category}
                  onChange={(e) => handleCategoryChange(video.id, e.target.value as VideoCategory)}
                  className="bg-white border border-neutral-300 rounded text-xs px-2 py-1 font-mono-code text-neutral-700"
                  title="Change Category"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Toggle Breaking */}
                <button
                  onClick={() => handleToggleBreaking(video)}
                  className={`p-1.5 rounded border text-xs font-mono-code transition-colors ${
                    video.is_breaking
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                  }`}
                  title="Toggle Breaking Tag"
                >
                  <Flame className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Featured */}
                <button
                  onClick={() => handleToggleFeatured(video)}
                  className={`p-1.5 rounded border text-xs font-mono-code transition-colors ${
                    video.is_featured
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                  }`}
                  title="Toggle Featured on Homepage"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>

                {/* View on YouTube */}
                <a
                  href={video.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded text-neutral-700 transition-colors"
                  title="Open on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
