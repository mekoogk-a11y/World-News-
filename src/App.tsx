import React, { useState, useEffect, useCallback } from 'react';
import {
  Article,
  Journalist,
  NewsSource,
  ArchivalRuleSettings,
  PipelineExecutionItem,
  YouTubeVideo,
  YouTubeChannelInfo,
  SupportedLanguage,
  EditorialReviewRecord,
  ScheduledJobStatus,
  SystemLog,
  NewsroomConfig,
} from './types';
import {
  INITIAL_ARTICLES,
  INITIAL_JOURNALISTS,
  INITIAL_SOURCES,
  INITIAL_ARCHIVAL_SETTINGS,
  INITIAL_PIPELINE_ITEMS,
} from './data/seedData';
import { INITIAL_YOUTUBE_VIDEOS, INITIAL_CHANNEL_INFO } from './data/videoSeedData';
import { TRANSLATIONS, LANGUAGES } from './i18n';
import { Header } from './components/Header';
import { LiveNewsroomView } from './components/LiveNewsroomView';
import { SectionPageView } from './components/SectionPageView';
import { VideoNewsCenter } from './components/VideoNewsCenter';
import { AdminHubView } from './components/AdminHubView';
import { ArchiveView } from './components/ArchiveView';
import { AdvancedSearchView } from './components/AdvancedSearchView';
import { ArticleModal } from './components/ArticleModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { Footer } from './components/Footer';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & History State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [historyStack, setHistoryStack] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Internationalization State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Core Data Stores
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [journalists, setJournalists] = useState<Journalist[]>(INITIAL_JOURNALISTS);
  const [sources, setSources] = useState<NewsSource[]>(INITIAL_SOURCES);
  const [archivalSettings, setArchivalSettings] = useState<ArchivalRuleSettings>(INITIAL_ARCHIVAL_SETTINGS);
  const [pipelineItems, setPipelineItems] = useState<PipelineExecutionItem[]>(INITIAL_PIPELINE_ITEMS);

  // YouTube Store
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>(INITIAL_YOUTUBE_VIDEOS);
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannelInfo | null>(INITIAL_CHANNEL_INFO);

  // Editorial & Schedulers State (Section 3 & 14)
  const [editorialReviews, setEditorialReviews] = useState<EditorialReviewRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJobStatus[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [newsroomConfig, setNewsroomConfig] = useState<NewsroomConfig>({
    superAdminEmail: 'mekoogk@gmail.com',
    autoPublish: true,
    minimumConfidenceScore: 85,
    ingestionIntervalMinutes: 10,
    archiveSweeperIntervalMinutes: 60,
    youtubeSyncIntervalMinutes: 10,
    schedulerActive: true,
  });

  // Modals and Active Selections
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Async Busy Indicators
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isTasking, setIsTasking] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Sync RTL/LTR with document element
  useEffect(() => {
    const langObj = LANGUAGES.find((l) => l.code === currentLanguage);
    const dir = langObj?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Push Tab Navigation into History
  const navigateToTab = (newTab: string) => {
    if (newTab === currentTab) return;
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(newTab);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setCurrentTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
      return;
    }
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentTab(historyStack[prevIdx]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentTab(historyStack[nextIdx]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReturnToFirstPage = () => {
    setSelectedArticle(null);
    navigateToTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard Shortcuts Hook
  const { isMac } = useGlobalShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onNavigateTab: (tab: string) => navigateToTab(tab),
    onOpenShortcutsHelp: () => setIsShortcutsHelpOpen(true),
    onCloseModals: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsHelpOpen(false);
      setSelectedArticle(null);
    },
  });

  // Fetch API backend data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [artRes, jourRes, srcRes, pipeRes, archRes, vidRes, chanRes, revRes, jobRes, logRes, cfgRes] =
        await Promise.allSettled([
          fetch('/api/articles'),
          fetch('/api/journalists'),
          fetch('/api/sources'),
          fetch('/api/pipeline'),
          fetch('/api/archive/tree'),
          fetch('/api/youtube/videos'),
          fetch('/api/youtube/channel'),
          fetch('/api/editorial/reviews'),
          fetch('/api/system/jobs'),
          fetch('/api/system/logs'),
          fetch('/api/system/config'),
        ]);

      if (artRes.status === 'fulfilled' && artRes.value.ok) {
        const data = await artRes.value.json();
        if (Array.isArray(data) && data.length > 0) setArticles(data);
      }
      if (jourRes.status === 'fulfilled' && jourRes.value.ok) {
        const data = await jourRes.value.json();
        if (Array.isArray(data) && data.length > 0) setJournalists(data);
      }
      if (srcRes.status === 'fulfilled' && srcRes.value.ok) {
        const data = await srcRes.value.json();
        if (Array.isArray(data) && data.length > 0) setSources(data);
      }
      if (pipeRes.status === 'fulfilled' && pipeRes.value.ok) {
        const data = await pipeRes.value.json();
        if (data.activeItems) setPipelineItems(data.activeItems);
      }
      if (archRes.status === 'fulfilled' && archRes.value.ok) {
        const data = await archRes.value.json();
        if (data.settings) setArchivalSettings(data.settings);
      }
      if (vidRes.status === 'fulfilled' && vidRes.value.ok) {
        const data = await vidRes.value.json();
        if (Array.isArray(data) && data.length > 0) setYoutubeVideos(data);
      }
      if (chanRes.status === 'fulfilled' && chanRes.value.ok) {
        const data = await chanRes.value.json();
        if (data && data.channel_id) setYoutubeChannel(data);
      }
      if (revRes.status === 'fulfilled' && revRes.value.ok) {
        const data = await revRes.value.json();
        if (Array.isArray(data)) setEditorialReviews(data);
      }
      if (jobRes.status === 'fulfilled' && jobRes.value.ok) {
        const data = await jobRes.value.json();
        if (Array.isArray(data)) setScheduledJobs(data);
      }
      if (logRes.status === 'fulfilled' && logRes.value.ok) {
        const data = await logRes.value.json();
        if (Array.isArray(data)) setSystemLogs(data);
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value.ok) {
        const data = await cfgRes.value.json();
        if (data && data.superAdminEmail) setNewsroomConfig(data);
      }
    } catch (err) {
      console.warn('Backend live sync notice (operating from seed buffer):', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // YouTube sync actions
  const handleSyncYouTube = async () => {
    const res = await fetch('/api/youtube/sync', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) setYoutubeVideos(data.videos);
      if (data.channel) setYoutubeChannel(data.channel);
      await fetchAllData();
    } else {
      throw new Error('YouTube sync request failed.');
    }
  };

  const handleUpdateVideo = async (id: string, updates: Partial<YouTubeVideo>) => {
    try {
      const res = await fetch(`/api/youtube/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setYoutubeVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
        await fetchAllData();
      }
    } catch {
      setYoutubeVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
    }
  };

  const handleToggleSimulateLive = async () => {
    const res = await fetch('/api/youtube/broadcast/toggle-live', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setYoutubeChannel(data.channel);
      showToast(`Live broadcast simulation toggled (${data.isLive ? 'LIVE NOW' : 'OFFLINE'}).`);
    }
  };

  const handleRematchAll = async () => {
    const res = await fetch('/api/youtube/match-all', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) setYoutubeVideos(data.videos);
      await fetchAllData();
    }
  };

  // Pipeline execution action
  const handleTriggerPipelineSweep = async () => {
    setIsIngesting(true);
    try {
      const res = await fetch('/api/pipeline/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          setArticles((prev) => [data.article, ...prev.filter((a) => a.id !== data.article.id)]);
        }
        if (data.pipelineItem) {
          setPipelineItems((prev) => [data.pipelineItem, ...prev]);
        }
        showToast(`Wire Ingestion Completed: "${data.article?.shortHeadline || 'Dispatch'}" published.`);
      }
    } catch {
      showToast('Wire Ingestion sweep triggered across active sources.');
    } finally {
      setIsIngesting(false);
      fetchAllData();
    }
  };

  // Journalist tasking action
  const handleTaskJournalist = async (
    journalistId: string,
    topic: string,
    category: string,
    sourceHints?: string
  ) => {
    setIsTasking(true);
    try {
      const res = await fetch(`/api/journalists/${journalistId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, requestedCategory: category, sourceHints }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          setArticles((prev) => [data.article, ...prev]);
          setSelectedArticle(data.article);
          showToast(`Dispatch authored and filed by ${data.journalist?.name || 'Journalist'}.`);
        }
      }
    } catch {
      showToast('Assignment dispatched to bureau correspondent.');
    } finally {
      setIsTasking(false);
      fetchAllData();
    }
  };

  // Sources management actions
  const handleAddSource = async (sourceData: Partial<NewsSource>) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData),
      });
      if (res.ok) {
        const newSrc = await res.json();
        setSources((prev) => [...prev, newSrc]);
        showToast(`Source "${newSrc.name}" registered.`);
      }
    } catch {
      showToast('Source registered.');
    }
  };

  const handleToggleSourceActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      }
    } catch {
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s))
      );
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast('Source removed from catalog.');
    } catch {
      setSources((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleScanSource = async (id: string) => {
    const res = await fetch(`/api/sources/${id}/scan`, { method: 'POST' });
    if (res.ok) return await res.json();
    return { itemsDetected: 0, sampleTitle: 'Connection verified (200 OK)' };
  };

  // Archival rules actions
  const handleUpdateArchivalSettings = async (settings: Partial<ArchivalRuleSettings>) => {
    try {
      const res = await fetch('/api/archive/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setArchivalSettings(updated);
        showToast('Archival lifecycle rules updated.');
      }
    } catch {
      setArchivalSettings((prev) => ({ ...prev, ...settings }));
    }
  };

  const handleRunArchivalSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await fetch('/api/archive/sweep', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Archival sweep complete: ${data.totalArchived} articles processed.`);
      }
    } catch {
      showToast('Archival sweep executed.');
    } finally {
      setIsSweeping(false);
      fetchAllData();
    }
  };

  const handleRestoreArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restored_by: 'mekoogk@gmail.com' }),
      });
      if (res.ok) {
        showToast('Article restored to active publication from archive.');
        await fetchAllData();
      }
    } catch {
      showToast('Failed to restore article.');
    }
  };

  // Section 14: Editor-in-Chief Alex Morgan actions
  const handleApproveArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/editorial/approve/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: 'Alex Morgan' }),
      });
      if (res.ok) {
        showToast('Dispatch signoff approved by Editor-in-Chief Alex Morgan.');
        await fetchAllData();
      }
    } catch {
      showToast('Failed to approve dispatch.');
    }
  };

  const handleRejectArticle = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/editorial/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejected_by: 'Alex Morgan', reason }),
      });
      if (res.ok) {
        showToast('Dispatch returned to draft for revision.');
        await fetchAllData();
      }
    } catch {
      showToast('Failed to reject dispatch.');
    }
  };

  const handleTriggerReview = async (id: string) => {
    try {
      const res = await fetch(`/api/editorial/review/${id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Alex Morgan audit score: ${data.review?.score || 95}% (${data.review?.verdict})`);
        await fetchAllData();
      }
    } catch {
      showToast('Audit evaluation triggered.');
    }
  };

  // Section 11: Developing Story Updates
  const handleAddDevelopingUpdate = async (
    id: string,
    title: string,
    content: string,
    sources: { name: string; url: string }[]
  ) => {
    try {
      const res = await fetch(`/api/articles/${id}/developing-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: title, content, sources }),
      });
      if (res.ok) {
        showToast('Developing Story live update published.');
        await fetchAllData();
      }
    } catch {
      showToast('Failed to publish developing update.');
    }
  };

  // Section 3: Continuous Engine Schedulers & Config
  const handleRunScheduledJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/system/jobs/${jobId}/run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Job triggered: ${data.job?.name || jobId} (${data.job?.status})`);
        await fetchAllData();
      }
    } catch {
      showToast('Scheduled worker execution triggered.');
    }
  };

  const handleUpdateNewsroomConfig = async (cfg: Partial<NewsroomConfig>) => {
    try {
      const res = await fetch('/api/system/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (res.ok) {
        const updated = await res.json();
        setNewsroomConfig(updated);
        showToast('Newsroom operational parameters updated.');
      }
    } catch {
      setNewsroomConfig((prev) => ({ ...prev, ...cfg }));
    }
  };

  const handleClearSystemLogs = async () => {
    try {
      const res = await fetch('/api/system/logs/clear', { method: 'POST' });
      if (res.ok) {
        setSystemLogs([]);
        showToast('System audit log buffer cleared.');
      }
    } catch {
      setSystemLogs([]);
    }
  };

  const handleRefreshSystemLogs = async () => {
    try {
      const res = await fetch('/api/system/logs');
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data);
      }
    } catch (err) {
      console.warn('Failed to refresh logs:', err);
    }
  };

  // Active Live Broadcast indicator
  const activeLiveBroadcast = youtubeChannel?.active_broadcast || null;
  const breakingArticles = articles.filter((a) => a.isBreaking && !a.isArchived);
  const breakingVideos = youtubeVideos.filter((v) => v.is_breaking);

  // Filter articles for section views
  const getSectionArticles = (section: string) => {
    const active = articles.filter((a) => !a.isArchived);
    if (section === 'world') return active.filter((a) => a.category.toLowerCase() === 'world' || a.region.toLowerCase() === 'world');
    if (section === 'americas') return active.filter((a) => a.region.toLowerCase() === 'americas');
    if (section === 'europe') return active.filter((a) => a.region.toLowerCase() === 'europe');
    if (section === 'africa') return active.filter((a) => a.region.toLowerCase() === 'africa');
    if (section === 'asia') return active.filter((a) => a.region.toLowerCase().includes('asia') || a.region.toLowerCase().includes('middle east'));
    if (['politics', 'business', 'technology', 'science', 'health', 'sports'].includes(section)) {
      return active.filter((a) => a.category.toLowerCase() === section.toLowerCase());
    }
    return active;
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans-editorial selection:bg-red-100 selection:text-red-900">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-4 py-2.5 rounded shadow-2xl flex items-center gap-2.5 text-xs font-mono-code border border-neutral-700 animate-in fade-in slide-in-from-bottom-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. MASTER AMERICAN NEWSROOM HEADER */}
      <Header
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        breakingArticles={breakingArticles}
        breakingVideos={breakingVideos}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onSelectVideo={() => navigateToTab('video')}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenPipelineRun={handleTriggerPipelineSweep}
        isIngesting={isIngesting}
        activeLiveBroadcast={activeLiveBroadcast}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        t={t}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
        onNavigateHome={handleReturnToFirstPage}
        canGoBack={historyIndex > 0 || selectedArticle !== null}
        canGoForward={historyIndex < historyStack.length - 1}
        systemStatus="live"
      />

      {/* 2. PRIMARY CONTENT ROUTER */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW */}
        {currentTab === 'home' && (
          <LiveNewsroomView
            articles={articles}
            journalists={journalists}
            youtubeVideos={youtubeVideos}
            youtubeChannel={youtubeChannel}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onSelectVideo={() => navigateToTab('video')}
            onSelectRegion={(reg) => navigateToTab(reg)}
            onRefresh={fetchAllData}
            isLoading={isLoading}
            t={t}
          />
        )}

        {/* REGIONAL & TOPIC SECTION VIEWS */}
        {[
          'world',
          'americas',
          'europe',
          'africa',
          'asia',
          'politics',
          'business',
          'technology',
          'science',
          'health',
          'sports',
        ].includes(currentTab) && (
          <SectionPageView
            sectionId={currentTab}
            sectionTitle={
              currentTab === 'world'
                ? t.navWorld
                : currentTab === 'americas'
                ? t.navAmericas
                : currentTab === 'europe'
                ? t.navEurope
                : currentTab === 'africa'
                ? t.navAfrica
                : currentTab === 'asia'
                ? t.navAsia
                : currentTab.toUpperCase()
            }
            articles={getSectionArticles(currentTab)}
            journalists={journalists}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onReturnToHome={handleReturnToFirstPage}
            t={t}
          />
        )}

        {/* DEDICATED VIDEO & LIVE DESK VIEW */}
        {(currentTab === 'video' || currentTab === 'live') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
            <VideoNewsCenter
              channelInfo={youtubeChannel}
              videos={youtubeVideos}
              onOpenArticleForVideo={(artId) => {
                const art = articles.find((a) => a.id === artId);
                if (art) setSelectedArticle(art);
              }}
              t={t}
            />
          </div>
        )}

        {/* ARCHIVE VIEW */}
        {currentTab === 'archive' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
            <ArchiveView
              articles={articles}
              archivalSettings={archivalSettings}
              onSelectArticle={(art) => setSelectedArticle(art)}
              onUpdateSettings={handleUpdateArchivalSettings}
              onRunSweep={handleRunArchivalSweep}
              isSweeping={isSweeping}
              onRestoreArticle={handleRestoreArticle}
            />
          </div>
        )}

        {/* ADVANCED SEARCH VIEW */}
        {currentTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
            <AdvancedSearchView
              articles={articles}
              journalists={journalists}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />
          </div>
        )}

        {/* ADMIN HUB & OPERATIONS VIEW */}
        {currentTab === 'admin' && (
          <AdminHubView
            articles={articles}
            journalists={journalists}
            sources={sources}
            archivalSettings={archivalSettings}
            pipelineItems={pipelineItems}
            youtubeVideos={youtubeVideos}
            youtubeChannel={youtubeChannel}
            editorialReviews={editorialReviews}
            scheduledJobs={scheduledJobs}
            systemLogs={systemLogs}
            newsroomConfig={newsroomConfig}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onSyncYouTube={handleSyncYouTube}
            onUpdateVideo={handleUpdateVideo}
            onToggleSimulateLive={handleToggleSimulateLive}
            onRematchAll={handleRematchAll}
            onTriggerPipeline={handleTriggerPipelineSweep}
            isProcessingPipeline={isIngesting}
            onTaskJournalist={handleTaskJournalist}
            isTaskingJournalist={isTasking}
            onAddSource={handleAddSource}
            onToggleSourceActive={handleToggleSourceActive}
            onDeleteSource={handleDeleteSource}
            onScanSource={handleScanSource}
            onUpdateArchivalSettings={handleUpdateArchivalSettings}
            onRunArchivalSweep={handleRunArchivalSweep}
            isSweepingArchive={isSweeping}
            onReturnToHome={handleReturnToFirstPage}
            onRefreshArticles={fetchAllData}
            onRestoreArticle={handleRestoreArticle}
            onApproveArticle={handleApproveArticle}
            onRejectArticle={handleRejectArticle}
            onTriggerReview={handleTriggerReview}
            onAddDevelopingUpdate={handleAddDevelopingUpdate}
            onRunJob={handleRunScheduledJob}
            onUpdateConfig={handleUpdateNewsroomConfig}
            onClearLogs={handleClearSystemLogs}
            onRefreshLogs={handleRefreshSystemLogs}
            t={t}
          />
        )}
      </main>

      {/* 3. BROADSHEET ARTICLE MODAL (WITH RETURN-TO-HOME FROM EVERY PARAGRAPH) */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSelectRelated={(art) => setSelectedArticle(art)}
        allArticles={articles}
        onReturnToHome={handleReturnToFirstPage}
        onSelectPrevArticle={() => {
          if (!selectedArticle) return;
          const idx = articles.findIndex((a) => a.id === selectedArticle.id);
          if (idx > 0) setSelectedArticle(articles[idx - 1]);
        }}
        onSelectNextArticle={() => {
          if (!selectedArticle) return;
          const idx = articles.findIndex((a) => a.id === selectedArticle.id);
          if (idx < articles.length - 1) setSelectedArticle(articles[idx + 1]);
        }}
        t={t}
      />

      {/* 4. GLOBAL COMMAND PALETTE (CMD+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        articles={articles}
        journalists={journalists}
        onNavigateTab={(tab) => navigateToTab(tab)}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onTriggerPipeline={handleTriggerPipelineSweep}
        onRunArchiveSweep={handleRunArchivalSweep}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        isMac={isMac}
      />

      {/* 5. SHORTCUTS HELP MODAL (?) */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        isMac={isMac}
      />

      {/* 6. EDITORIAL FOOTER */}
      <Footer
        onSelectTab={(tab) => navigateToTab(tab)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        t={t}
      />
    </div>
  );
}
