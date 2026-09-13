import React, { useState } from 'react';
import {
  Activity,
  Tv,
  SlidersHorizontal,
  Database,
  Users,
  Archive,
  ArrowLeft,
  Home,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Server,
} from 'lucide-react';
import {
  Article,
  Journalist,
  NewsSource,
  ArchivalRuleSettings,
  PipelineExecutionItem,
  YouTubeVideo,
  YouTubeChannelInfo,
  EditorialReviewRecord,
  ScheduledJobStatus,
  SystemLog,
  NewsroomConfig,
} from '../types';
import { OverviewDashboard } from './OverviewDashboard';
import { VideoAdminPanel } from './VideoAdminPanel';
import { PipelineView } from './PipelineView';
import { SourcesManagerView } from './SourcesManagerView';
import { ArchiveView } from './ArchiveView';
import { JournalistsView } from './JournalistsView';
import { EditorialDeskView } from './EditorialDeskView';
import { ContinuousEngineView } from './ContinuousEngineView';
import { TranslationDictionary } from '../i18n';

interface AdminHubViewProps {
  articles: Article[];
  journalists: Journalist[];
  sources: NewsSource[];
  archivalSettings: ArchivalRuleSettings;
  pipelineItems: PipelineExecutionItem[];
  youtubeVideos: YouTubeVideo[];
  youtubeChannel: YouTubeChannelInfo | null;
  editorialReviews: EditorialReviewRecord[];
  scheduledJobs: ScheduledJobStatus[];
  systemLogs: SystemLog[];
  newsroomConfig: NewsroomConfig;
  onSelectArticle: (article: Article) => void;
  onSyncYouTube: () => Promise<void>;
  onUpdateVideo: (id: string, updates: Partial<YouTubeVideo>) => Promise<void>;
  onToggleSimulateLive: () => Promise<void>;
  onRematchAll: () => Promise<void>;
  onTriggerPipeline: () => Promise<void>;
  isProcessingPipeline: boolean;
  onTaskJournalist: (id: string, topic: string, category: string, hints?: string) => Promise<void>;
  isTaskingJournalist: boolean;
  onAddSource: (src: Partial<NewsSource>) => Promise<void>;
  onToggleSourceActive: (id: string, cur: boolean) => Promise<void>;
  onDeleteSource: (id: string) => Promise<void>;
  onScanSource: (id: string) => Promise<{ itemsDetected: number; sampleTitle: string }>;
  onUpdateArchivalSettings: (settings: Partial<ArchivalRuleSettings>) => Promise<void>;
  onRunArchivalSweep: () => Promise<void>;
  isSweepingArchive: boolean;
  onReturnToHome: () => void;
  onRefreshArticles?: () => Promise<void>;
  onRestoreArticle?: (id: string) => Promise<void>;
  onApproveArticle: (id: string) => Promise<void>;
  onRejectArticle: (id: string, reason: string) => Promise<void>;
  onTriggerReview: (id: string) => Promise<void>;
  onAddDevelopingUpdate: (
    id: string,
    title: string,
    content: string,
    sources: { name: string; url: string }[]
  ) => Promise<void>;
  onRunJob: (id: string) => Promise<void>;
  onUpdateConfig: (config: Partial<NewsroomConfig>) => Promise<void>;
  onClearLogs: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
  t: TranslationDictionary;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({
  articles,
  journalists,
  sources,
  archivalSettings,
  pipelineItems,
  youtubeVideos,
  youtubeChannel,
  editorialReviews,
  scheduledJobs,
  systemLogs,
  newsroomConfig,
  onSelectArticle,
  onSyncYouTube,
  onUpdateVideo,
  onToggleSimulateLive,
  onRematchAll,
  onTriggerPipeline,
  isProcessingPipeline,
  onTaskJournalist,
  isTaskingJournalist,
  onAddSource,
  onToggleSourceActive,
  onDeleteSource,
  onScanSource,
  onUpdateArchivalSettings,
  onRunArchivalSweep,
  isSweepingArchive,
  onReturnToHome,
  onRefreshArticles,
  onRestoreArticle,
  onApproveArticle,
  onRejectArticle,
  onTriggerReview,
  onAddDevelopingUpdate,
  onRunJob,
  onUpdateConfig,
  onClearLogs,
  onRefreshLogs,
  t,
}) => {
  const [adminTab, setAdminTab] = useState<
    'overview' | 'editorial' | 'scheduler' | 'youtube' | 'pipeline' | 'journalists' | 'sources' | 'archive'
  >('overview');

  return (
    <div className="bg-neutral-100 min-h-screen text-neutral-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-neutral-300 pb-3 mb-6 bg-white p-3 rounded shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-600">
            <button
              onClick={onReturnToHome}
              className="hover:text-red-700 flex items-center gap-1 font-bold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.breadcrumbHome}</span>
            </button>
            <span>/</span>
            <span className="uppercase font-bold text-red-700">NEWSROOM ADMINISTRATION & OPERATIONS</span>
          </div>

          <button
            onClick={onReturnToHome}
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
            <span>{t.returnToFirstPage}</span>
          </button>
        </div>

        {/* Administration Header */}
        <div className="border-b-2 border-neutral-900 pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-red-700">
              OPERATIONS DESK
            </span>
            <h1 className="text-3xl font-serif-editorial font-black uppercase text-neutral-950 tracking-tight">
              Newsroom Management Suite
            </h1>
          </div>

          {/* Sub-tab selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-1 rounded border border-neutral-300 shadow-2xs">
            <button
              onClick={() => setAdminTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'overview'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Engine Overview</span>
            </button>

            <button
              onClick={() => setAdminTab('editorial')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'editorial'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Alex Morgan (Editor-in-Chief)</span>
            </button>

            <button
              onClick={() => setAdminTab('scheduler')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'scheduler'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Autonomous Schedulers & CRON</span>
            </button>

            <button
              onClick={() => setAdminTab('youtube')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'youtube'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>YouTube Video Desk</span>
            </button>

            <button
              onClick={() => setAdminTab('pipeline')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'pipeline'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>14-Stage Ingestion</span>
            </button>

            <button
              onClick={() => setAdminTab('journalists')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'journalists'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>AI Journalists Desk</span>
            </button>

            <button
              onClick={() => setAdminTab('sources')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'sources'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Wire Feeds</span>
            </button>

            <button
              onClick={() => setAdminTab('archive')}
              className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                adminTab === 'archive'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archival Rules</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div>
          {adminTab === 'overview' && (
            <OverviewDashboard
              articles={articles}
              journalists={journalists}
              sources={sources}
              archivalSettings={archivalSettings}
              pipelineItems={pipelineItems}
              onTriggerPipeline={onTriggerPipeline}
              isProcessingPipeline={isProcessingPipeline}
              onRunArchivalSweep={onRunArchivalSweep}
              isSweepingArchive={isSweepingArchive}
              onNavigateToTab={(tab) => setAdminTab(tab as any)}
              t={t}
            />
          )}

          {adminTab === 'editorial' && (
            <EditorialDeskView
              articles={articles}
              onSelectArticle={onSelectArticle}
              onRefreshArticles={onRefreshArticles || (async () => {})}
            />
          )}

          {adminTab === 'scheduler' && (
            <ContinuousEngineView onRefreshAll={onRefreshArticles} />
          )}

          {adminTab === 'youtube' && (
            <VideoAdminPanel
              channelInfo={youtubeChannel}
              videos={youtubeVideos}
              articles={articles}
              onSyncYouTube={onSyncYouTube}
              onUpdateVideo={onUpdateVideo}
              onToggleSimulateLive={onToggleSimulateLive}
              onRematchAll={onRematchAll}
              t={t}
            />
          )}

          {adminTab === 'pipeline' && (
            <PipelineView
              pipelineItems={pipelineItems}
              onTriggerPipeline={onTriggerPipeline}
              isProcessing={isProcessingPipeline}
            />
          )}

          {adminTab === 'journalists' && (
            <JournalistsView
              journalists={journalists}
              articles={articles}
              sources={sources}
              onSelectArticle={onSelectArticle}
              onTaskJournalist={onTaskJournalist}
              isTasking={isTaskingJournalist}
            />
          )}

          {adminTab === 'sources' && (
            <SourcesManagerView
              sources={sources}
              onAddSource={onAddSource}
              onToggleActive={onToggleSourceActive}
              onDeleteSource={onDeleteSource}
              onScanSource={onScanSource}
            />
          )}

          {adminTab === 'archive' && (
            <ArchiveView
              articles={articles}
              archivalSettings={archivalSettings}
              onSelectArticle={onSelectArticle}
              onUpdateSettings={onUpdateArchivalSettings}
              onRunSweep={onRunArchivalSweep}
              isSweeping={isSweepingArchive}
              onRestoreArticle={onRestoreArticle}
            />
          )}
        </div>
      </div>
    </div>
  );
};
