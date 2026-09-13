import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Activity,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Archive,
  Sliders,
  Shield,
} from 'lucide-react';
import { ScheduledJobStatus, SystemLog, NewsroomConfig } from '../types';

interface ContinuousEngineViewProps {
  onRefreshAll?: () => Promise<void>;
}

export const ContinuousEngineView: React.FC<ContinuousEngineViewProps> = ({ onRefreshAll }) => {
  const [jobs, setJobs] = useState<ScheduledJobStatus[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<NewsroomConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [logCategory, setLogCategory] = useState<string>('ALL');
  const [logLevel, setLogLevel] = useState<string>('ALL');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, logsRes, cfgRes] = await Promise.all([
        fetch('/api/system/jobs'),
        fetch('/api/system/logs?limit=50'),
        fetch('/api/system/config'),
      ]);

      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (cfgRes.ok) setConfig(await cfgRes.json());
    } catch (err) {
      console.error('Failed to load continuous engine status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunJob = async (jobId: string) => {
    setRunningJobId(jobId);
    try {
      const res = await fetch(`/api/system/jobs/${jobId}/run`, { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
        if (onRefreshAll) await onRefreshAll();
      }
    } catch (err) {
      console.error('Failed to trigger job:', err);
    } finally {
      setRunningJobId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (logCategory !== 'ALL' && l.category !== logCategory) return false;
    if (logLevel !== 'ALL' && l.level !== logLevel) return false;
    return true;
  });

  const cronSecret = config?.cronSecret || 'newsroom-cron-secure-key-2026';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-neutral-900 text-white rounded-xl p-6 border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                AUTONOMOUS SERVER ENGINE ACTIVE
              </span>
              <span className="text-xs text-neutral-400 font-mono-code">No Browser Required</span>
            </div>
            <h2 className="text-2xl font-serif-editorial font-bold text-white tracking-tight mt-1">
              Continuous Newsroom Orchestration
            </h2>
            <p className="text-xs text-neutral-300 max-w-2xl mt-0.5">
              The platform continuously executes discovery, deduplication, AI journalist drafting, Alex Morgan editorial review, and 24-hour archival sweeps entirely on the server backend.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-3.5 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Scheduled Jobs Grid */}
      <div>
        <div className="flex items-center justify-between border-b border-neutral-300 pb-2 mb-4">
          <h3 className="text-xs font-mono-code font-bold uppercase text-neutral-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-neutral-600" />
            <span>Continuous Scheduled Tasks ({jobs.length})</span>
          </h3>
          <span className="text-[11px] font-mono-code text-neutral-500">Autonomous Server Loop Intervals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const isRunning = runningJobId === job.id || job.status === 'RUNNING';

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {job.intervalHuman}
                    </span>
                    <span
                      className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                        job.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-800'
                          : job.status === 'RUNNING'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {job.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {job.status === 'RUNNING' && <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />}
                      <span>{job.status}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-sans-editorial text-neutral-900 mb-1">{job.name}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">{job.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-neutral-100 text-[11px] font-mono-code text-neutral-500">
                  <div className="flex justify-between">
                    <span>Last Execution:</span>
                    <span className="text-neutral-700 font-bold">
                      {job.lastRunTime ? new Date(job.lastRunTime).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Scheduled:</span>
                    <span className="text-neutral-700 font-bold">
                      {job.nextRunTime ? new Date(job.nextRunTime).toLocaleTimeString() : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed Last Run:</span>
                    <span className="text-neutral-700 font-bold">{job.itemsProcessedLastRun || 0} items</span>
                  </div>

                  <button
                    onClick={() => handleRunJob(job.id)}
                    disabled={isRunning}
                    className="w-full mt-2 py-1.5 px-3 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-white" />
                    <span>{isRunning ? 'Running Job...' : 'Execute Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* External CRON Webhook Endpoints */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-700" />
            <h3 className="text-xs font-mono-code font-bold uppercase text-neutral-900">
              External CRON Trigger Webhooks (Section 3)
            </h3>
          </div>
          <span className="text-[11px] font-mono-code text-neutral-500">Bearer or Query Auth Supported</span>
        </div>

        <p className="text-xs text-neutral-600">
          Can be called by Cloud Scheduler, external cron services (e.g. crontab, cron-job.org), or internal CI without opening the browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {[
            { path: '/api/cron/news-ingestion', desc: 'Scan active RSS wire feeds and evaluate health' },
            { path: '/api/cron/process-news', desc: 'Deduplicate, cluster stories, and assign journalists' },
            { path: '/api/cron/homepage-ranking', desc: 'Alex Morgan priority rank calculation & top story' },
            { path: '/api/cron/archive', desc: 'Sweep & permanently index dispatches older than 24h' },
            { path: '/api/cron/youtube-sync', desc: 'Sync official channel video pool & match articles' },
            { path: '/api/cron/live-check', desc: 'Verify active live broadcast transmission stream' },
          ].map((endpoint) => {
            const fullUrl = `${baseUrl}${endpoint.path}?secret=${cronSecret}`;
            const isCopied = copiedUrl === endpoint.path;

            return (
              <div key={endpoint.path} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-code font-bold text-neutral-900">{endpoint.path}</span>
                  <button
                    onClick={() => handleCopy(fullUrl, endpoint.path)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-neutral-200 text-neutral-700 font-mono-code text-[10px] flex items-center gap-1 border border-neutral-300"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy Webhook'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">{endpoint.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live System Logs Stream */}
      <div className="bg-neutral-950 text-neutral-100 rounded-xl p-5 border border-neutral-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider text-neutral-200">
              Real-Time Newsroom Audit Trail & System Logs ({filteredLogs.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-code">
            <select
              value={logCategory}
              onChange={(e) => setLogCategory(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-neutral-200 text-xs focus:outline-hidden"
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
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-neutral-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error</option>
              <option value="CRON">Cron</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto font-mono-code text-[11px] pr-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const levelColor =
                log.level === 'ERROR'
                  ? 'text-red-400 bg-red-950/40 border-red-900/50'
                  : log.level === 'WARN'
                  ? 'text-amber-300 bg-amber-950/30 border-amber-900/50'
                  : log.level === 'CRON'
                  ? 'text-sky-300 bg-sky-950/30 border-sky-900/50'
                  : 'text-emerald-300 bg-emerald-950/20 border-emerald-900/40';

              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded border flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 ${levelColor}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold shrink-0">[{log.level}]</span>
                    <span className="text-neutral-400 shrink-0">[{log.category}]</span>
                    <span className="text-neutral-200">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-neutral-600 text-xs">
              No system logs recorded for the selected filter parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
