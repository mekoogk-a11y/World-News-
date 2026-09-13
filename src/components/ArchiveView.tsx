import React, { useState } from 'react';
import {
  Database,
  Folder,
  FolderOpen,
  Calendar,
  Clock,
  Archive,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sliders,
  Filter,
} from 'lucide-react';
import { Article, ArchivalRuleSettings } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArchiveViewProps {
  articles: Article[];
  archivalSettings: ArchivalRuleSettings;
  onSelectArticle: (article: Article) => void;
  onUpdateSettings: (settings: Partial<ArchivalRuleSettings>) => Promise<void>;
  onRunSweep: () => Promise<void>;
  isSweeping: boolean;
  onRestoreArticle?: (id: string) => Promise<void>;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  articles,
  archivalSettings,
  onSelectArticle,
  onUpdateSettings,
  onRunSweep,
  isSweeping,
  onRestoreArticle,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('September');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sweepMessage, setSweepMessage] = useState<string>('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (e: React.MouseEvent, artId: string) => {
    e.stopPropagation();
    if (!onRestoreArticle) return;
    setRestoringId(artId);
    try {
      await onRestoreArticle(artId);
    } finally {
      setRestoringId(null);
    }
  };

  // Editable settings state
  const [latestHours, setLatestHours] = useState(archivalSettings.latestWindowHours);
  const [recentHours, setRecentHours] = useState(archivalSettings.recentWindowHours);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Build the hierarchical tree dynamically from articles
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const tree: Record<string, Record<string, Record<string, Article[]>>> = {};

  (articles || []).forEach((art) => {
    if (!art || !art.published_at) return;
    const d = new Date(art.published_at);
    const y = String(d.getUTCFullYear());
    const m = monthNames[d.getUTCMonth()];
    const day = String(d.getUTCDate()).padStart(2, '0');

    if (!tree[y]) tree[y] = {};
    if (!tree[y][m]) tree[y][m] = {};
    if (!tree[y][m][day]) tree[y][m][day] = [];
    tree[y][m][day].push(art);
  });

  const availableYears = Object.keys(tree).sort((a, b) => Number(b) - Number(a));
  const availableMonths = selectedYear && tree[selectedYear] ? Object.keys(tree[selectedYear]) : [];
  const availableDays =
    selectedYear && selectedMonth && tree[selectedYear]?.[selectedMonth]
      ? Object.keys(tree[selectedYear][selectedMonth]).sort((a, b) => Number(b) - Number(a))
      : [];

  // Filter archived articles according to tree selection
  let currentArticles: Article[] = [];
  if (selectedYear && tree[selectedYear]) {
    if (selectedMonth && tree[selectedYear][selectedMonth]) {
      if (selectedDay !== 'All' && tree[selectedYear][selectedMonth][selectedDay]) {
        currentArticles = tree[selectedYear][selectedMonth][selectedDay];
      } else {
        // All days in this month
        Object.values(tree[selectedYear][selectedMonth]).forEach((dayArticles) => {
          currentArticles.push(...dayArticles);
        });
      }
    }
  }

  if (categoryFilter !== 'ALL') {
    currentArticles = currentArticles.filter((a) => a.category === categoryFilter);
  }

  const now = new Date().getTime();
  const latestThreshold = archivalSettings.latestWindowHours * 60 * 60 * 1000;
  const recentThreshold = archivalSettings.recentWindowHours * 60 * 60 * 1000;

  const countLatest = articles.filter((a) => !a.isArchived && now - new Date(a.published_at).getTime() <= latestThreshold).length;
  const countRecent = articles.filter((a) => {
    const diff = now - new Date(a.published_at).getTime();
    return !a.isArchived && diff > latestThreshold && diff <= recentThreshold;
  }).length;
  const countArchived = articles.filter((a) => a.isArchived || now - new Date(a.published_at).getTime() > recentThreshold).length;

  const handleSweepClick = async () => {
    try {
      await onRunSweep();
      setSweepMessage('Archival lifecycle sweep completed. Older dispatches cataloged.');
      setTimeout(() => setSweepMessage(''), 5000);
    } catch {
      setSweepMessage('Sweep encountered an issue.');
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await onUpdateSettings({
        latestWindowHours: Number(latestHours),
        recentWindowHours: Number(recentHours),
      });
      setSweepMessage('Archival time boundaries updated.');
      setTimeout(() => setSweepMessage(''), 4000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Time-Indexed News Repository</span>
          </div>
          <h2 className="font-display-editorial text-2xl sm:text-3xl font-bold text-slate-100">
            Hierarchical News Archive Engine
          </h2>
          <p className="text-xs text-slate-400 font-serif-editorial italic mt-1 max-w-2xl">
            Automated temporal progression: Dispatches transition from Latest (0-24h) to Recent (24-72h) to the permanent Year/Month/Day hierarchical record.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="run-archive-sweep-btn"
            onClick={handleSweepClick}
            disabled={isSweeping}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-colors border border-slate-700 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Sweeping Records...' : 'Execute Archival Sweep'}</span>
          </button>
        </div>
      </div>

      {sweepMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{sweepMessage}</span>
        </div>
      )}

      {/* Lifecycle Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono-code text-slate-400">HOMEPAGE LATEST</div>
            <div className="text-xs text-amber-400 font-medium">0 — {archivalSettings.latestWindowHours} Hours</div>
            <div className="text-2xl font-bold text-slate-100 font-mono-code mt-1">{countLatest}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono-code text-slate-400">RECENT DISPATCHES</div>
            <div className="text-xs text-sky-400 font-medium">
              {archivalSettings.latestWindowHours} — {archivalSettings.recentWindowHours} Hours
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono-code mt-1">{countRecent}</div>
          </div>
          <Archive className="w-8 h-8 text-sky-500/40" />
        </div>

        <div className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono-code text-slate-400">PERMANENT ARCHIVE</div>
            <div className="text-xs text-indigo-400 font-medium">After {archivalSettings.recentWindowHours} Hours</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono-code mt-1">{countArchived}</div>
          </div>
          <Database className="w-8 h-8 text-indigo-500/40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Year / Month / Day Tree Browser & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tree Navigation Box */}
          <div className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <h3 className="font-display-editorial text-xs font-bold tracking-wider text-slate-200 uppercase">
                Hierarchical Date Tree
              </h3>
            </div>

            {/* Year Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono-code text-slate-400">1. SELECT YEAR:</label>
              <div className="flex gap-2">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setSelectedDay('All');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-colors ${
                      selectedYear === y
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Selector */}
            {availableMonths.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-mono-code text-slate-400">2. SELECT MONTH:</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableMonths.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setSelectedDay('All');
                      }}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        selectedMonth === m
                          ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Day Selector */}
            {availableDays.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-mono-code text-slate-400">3. SELECT DAY:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedDay('All')}
                    className={`px-2 py-0.5 rounded text-xs font-mono-code transition-colors ${
                      selectedDay === 'All'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    All Days
                  </button>
                  {availableDays.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`px-2 py-0.5 rounded text-xs font-mono-code transition-colors ${
                        selectedDay === d
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Path Breadcrumbs Indicator */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono-code text-slate-400 flex items-center gap-1.5">
              <span>Archive</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300">{selectedYear}</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300">{selectedMonth}</span>
              {selectedDay !== 'All' && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-400 font-bold">Day {selectedDay}</span>
                </>
              )}
            </div>
          </div>

          {/* Configurable Archiving Thresholds */}
          <div className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h4 className="font-bold text-slate-200 font-sans-editorial">
                Archival Progression Rules
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
                  Homepage Latest Window (Hours):
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={latestHours}
                  onChange={(e) => setLatestHours(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono-code"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
                  Recent News Window (Hours):
                </label>
                <input
                  type="number"
                  min="24"
                  max="168"
                  value={recentHours}
                  onChange={(e) => setRecentHours(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono-code"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                {isSavingSettings ? 'Saving...' : 'Apply Archival Boundaries'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Archived Dispatches Results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display-editorial text-base font-bold text-slate-100">
                Archived Dispatches for {selectedMonth} {selectedDay !== 'All' ? `${selectedDay}, ` : ''}{selectedYear}
              </h3>
              <p className="text-xs text-slate-400">
                Showing {currentArticles.length} permanently indexed dispatches with complete audit trails.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="WORLD">World</option>
                <option value="POLITICS">Politics</option>
                <option value="BUSINESS">Business</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="SCIENCE">Science</option>
                <option value="HEALTH">Health</option>
                <option value="ENVIRONMENT">Environment</option>
              </select>
            </div>
          </div>

          {/* 24-Hour Archive Rule Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block font-mono-code">
                  AUTOMATED 24-HOUR ARCHIVE REGIME ACTIVE
                </span>
                <span className="text-slate-400 text-[11px]">
                  Stories older than {archivalSettings.latestWindowHours}h transition automatically to this immutable year/month/day repository.
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono-code text-slate-500">
              Super Admin: mekoogk@gmail.com
            </div>
          </div>

          {currentArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentArticles.map((art) => (
                <div key={art.id} className="relative group">
                  <ArticleCard article={art} onSelect={onSelectArticle} />
                  {onRestoreArticle && (
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => handleRestore(e, art.id)}
                        disabled={restoringId === art.id}
                        className="px-2.5 py-1 rounded bg-neutral-900/90 hover:bg-red-700 text-white border border-neutral-700 text-[10px] font-mono-code font-bold transition-colors shadow-xs"
                        title="Restore this archived article back to active live newspaper"
                      >
                        {restoringId === art.id ? 'Restoring...' : 'Restore to Live'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No dispatches indexed for this specific date node.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
