import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Clock,
  Play,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Trash2,
  Filter,
  Check,
  Zap,
  Server,
  Calendar,
} from 'lucide-react';
import { ScheduledJobStatus, SystemLog, NewsroomConfig } from '../types';

interface SystemEngineViewProps {
  scheduledJobs: ScheduledJobStatus[];
  systemLogs: SystemLog[];
  newsroomConfig: NewsroomConfig;
  onRunJob: (jobId: string) => Promise<void>;
  onUpdateConfig: (config: Partial<NewsroomConfig>) => Promise<void>;
  onClearLogs: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
}

export const SystemEngineView: React.FC<SystemEngineViewProps> = ({
  scheduledJobs,
  systemLogs,
  newsroomConfig,
  onRunJob,
  onUpdateConfig,
  onClearLogs,
  onRefreshLogs,
}) => {
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('ALL');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Local config form state
  const [autoPublish, setAutoPublish] = useState<boolean>(newsroomConfig.autoPublish);
  const [minConfidence, setMinConfidence] = useState<number>(newsroomConfig.minimumConfidenceScore);
  const [ingestionMinutes, setIngestionMinutes] = useState<number>(newsroomConfig.ingestionIntervalMinutes);
  const [schedulerActive, setSchedulerActive] = useState<boolean>(newsroomConfig.schedulerActive);

  const handleTriggerJob = async (id: string) => {
    setRunningJobId(id);
    try {
      await onRunJob(id);
    } finally {
      setRunningJobId(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      await onUpdateConfig({
        autoPublish,
        minimumConfidenceScore: minConfidence,
        ingestionIntervalMinutes: ingestionMinutes,
        schedulerActive,
      });
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshLogs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLogs = systemLogs.filter((log) => {
    if (logCategoryFilter !== 'ALL' && log.category !== logCategoryFilter) return false;
    if (logLevelFilter !== 'ALL' && log.level !== logLevelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white p-5 rounded border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-400 font-bold uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Server-Side Continuous Orchestration Engine (Section 3)</span>
          </div>
          <h2 className="text-xl font-serif-editorial font-bold text-neutral-100">
            Autonomous Newsroom Daemon, Schedulers & Audit Logging
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            This background worker operates continuously on the server without relying on an open browser session. It executes periodic wire discovery, duplicate checks, Alex Morgan quality reviews, YouTube synchronizations, and strict 24-hour archival sweeps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-neutral-800 border border-neutral-700 p-3 rounded text-center min-w-[120px]">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase block">Engine Status</span>
            <span className="text-xs font-mono-code font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {newsroomConfig.schedulerActive ? 'ACTIVE DAEMON' : 'PAUSED'}
            </span>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 p-3 rounded text-center min-w-[120px]">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase block">Total System Logs</span>
            <span className="text-xl font-mono-code font-bold text-white">{systemLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Scheduled Jobs Table */}
      <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 className="text-base font-serif-editorial font-bold text-neutral-900 uppercase tracking-tight">
              Automated Newsroom Schedulers Roster
            </h3>
            <p className="text-xs text-neutral-500 font-sans-editorial">
              Recurring cron workers running autonomously in the backend container environment.
            </p>
          </div>
          <span className="text-xs font-mono-code text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded">
            Next Ingestion Sweep: In ~8 min
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduledJobs.map((job) => {
            const isJobRunning = runningJobId === job.id || job.status === 'RUNNING';
            return (
              <div
                key={job.id}
                className="border border-neutral-200 rounded p-4 bg-neutral-50 hover:bg-white hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded uppercase ${
                        job.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'RUNNING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[11px] font-mono-code text-neutral-500">{job.schedule}</span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 mb-1">{job.name}</h4>
                  <p className="text-[11px] text-neutral-600 font-sans-editorial line-clamp-2 mb-3">
                    {job.description}
                  </p>
                </div>

                <div className="border-t border-neutral-200 pt-2 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-500">
                    <span>Last Run: {new Date(job.lastRunTime).toLocaleTimeString()}</span>
                    <span>Processed: {job.itemsProcessedLastRun}</span>
                  </div>

                  <button
                    onClick={() => handleTriggerJob(job.id)}
                    disabled={isJobRunning}
                    className="w-full py-1.5 px-3 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <Play className={`w-3 h-3 ${isJobRunning ? 'animate-spin' : ''}`} />
                    <span>{isJobRunning ? 'Executing...' : 'Run Worker Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Configuration & Controls */}
      <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs space-y-4">
        <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-700" />
            <h3 className="text-base font-serif-editorial font-bold text-neutral-900 uppercase tracking-tight">
              Newsroom Operating Parameters
            </h3>
          </div>
          <span className="text-xs font-mono-code text-neutral-500">
            Super Administrator: {newsroomConfig.superAdminEmail}
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="border border-neutral-200 rounded p-3 bg-neutral-50 space-y-2">
            <label className="block font-mono-code font-bold text-neutral-800">Autonomous Daemon</label>
            <p className="text-[11px] text-neutral-500">Execute cron jobs automatically in background.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSchedulerActive(!schedulerActive)}
                className={`px-3 py-1 rounded font-mono-code font-bold text-xs transition-colors ${
                  schedulerActive ? 'bg-emerald-700 text-white' : 'bg-neutral-300 text-neutral-700'
                }`}
              >
                {schedulerActive ? 'DAEMON ENABLED' : 'DAEMON DISABLED'}
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded p-3 bg-neutral-50 space-y-2">
            <label className="block font-mono-code font-bold text-neutral-800">Auto-Publish Mode</label>
            <p className="text-[11px] text-neutral-500">Publish high-confidence dispatches immediately without manual signoff.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAutoPublish(!autoPublish)}
                className={`px-3 py-1 rounded font-mono-code font-bold text-xs transition-colors ${
                  autoPublish ? 'bg-red-700 text-white' : 'bg-neutral-300 text-neutral-700'
                }`}
              >
                {autoPublish ? 'AUTO-PUBLISH ON' : 'HOLD IN PENDING'}
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded p-3 bg-neutral-50 space-y-2">
            <label className="block font-mono-code font-bold text-neutral-800">
              Min Confidence Score: {minConfidence}%
            </label>
            <input
              type="range"
              min="75"
              max="99"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-neutral-500">Alex Morgan review threshold required for automatic approval.</p>
          </div>

          <div className="border border-neutral-200 rounded p-3 bg-neutral-50 space-y-2">
            <label className="block font-mono-code font-bold text-neutral-800">Ingestion Frequency</label>
            <select
              value={ingestionMinutes}
              onChange={(e) => setIngestionMinutes(parseInt(e.target.value))}
              className="w-full px-2 py-1.5 rounded border border-neutral-300 bg-white font-mono-code"
            >
              <option value="5">Every 5 minutes</option>
              <option value="10">Every 10 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
            </select>
            <div className="pt-1">
              <button
                type="submit"
                disabled={isUpdatingConfig}
                className="w-full py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-mono-code font-bold text-xs"
              >
                {isUpdatingConfig ? 'Saving...' : 'Save Parameters'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live System Logs Audit Log Stream */}
      <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
          <div>
            <h3 className="text-base font-serif-editorial font-bold text-neutral-900 uppercase tracking-tight">
              Real-Time System Audit Logs
            </h3>
            <p className="text-xs text-neutral-500 font-sans-editorial">
              In-memory circular telemetry log covering ingestion sweeps, quality verifications, and archival rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logCategoryFilter}
              onChange={(e) => setLogCategoryFilter(e.target.value)}
              className="text-xs font-mono-code border border-neutral-300 rounded px-2 py-1 bg-neutral-50"
            >
              <option value="ALL">All Categories</option>
              <option value="INGESTION">Ingestion</option>
              <option value="AI_PIPELINE">AI Pipeline</option>
              <option value="EDITORIAL">Editorial</option>
              <option value="ARCHIVE">Archive</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="SYSTEM">System</option>
            </select>

            <select
              value={logLevelFilter}
              onChange={(e) => setLogLevelFilter(e.target.value)}
              className="text-xs font-mono-code border border-neutral-300 rounded px-2 py-1 bg-neutral-50"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">Info</option>
              <option value="CRON">Cron</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
              title="Refresh logs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClearLogs}
              className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 rounded transition-colors"
              title="Clear log buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Viewer Console */}
        <div className="bg-neutral-950 text-neutral-200 font-mono-code text-xs rounded p-3 max-h-[380px] overflow-y-auto space-y-1.5 border border-neutral-800">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const levelColor =
                log.level === 'ERROR'
                  ? 'text-red-400 bg-red-950/60'
                  : log.level === 'WARN'
                  ? 'text-amber-400 bg-amber-950/40'
                  : log.level === 'CRON'
                  ? 'text-cyan-400 bg-cyan-950/30'
                  : 'text-emerald-400 bg-emerald-950/30';

              return (
                <div key={log.id} className="flex items-start gap-2 py-0.5 border-b border-neutral-900/60 hover:bg-neutral-900/50 px-1 rounded">
                  <span className="text-neutral-500 shrink-0 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 rounded shrink-0 ${levelColor}`}>
                    {log.level}
                  </span>
                  <span className="text-neutral-400 text-[10px] shrink-0">[{log.category}]</span>
                  <span className="text-neutral-200 break-all">{log.message}</span>
                </div>
              );
            })
          ) : (
            <div className="text-neutral-500 text-center py-6">No system logs matching current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};
