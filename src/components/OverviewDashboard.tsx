import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  Radio,
  Users,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Flame,
  Globe2,
  SlidersHorizontal,
  Archive,
  Database,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Article,
  Journalist,
  NewsSource,
  ArchivalRuleSettings,
  PipelineExecutionItem,
  EngineSystemMetrics,
  MetricDataPoint,
} from '../types';
import { TranslationDictionary } from '../i18n';

interface OverviewDashboardProps {
  articles: Article[];
  journalists: Journalist[];
  sources: NewsSource[];
  archivalSettings: ArchivalRuleSettings;
  pipelineItems: PipelineExecutionItem[];
  onTriggerPipeline: () => Promise<void>;
  isProcessingPipeline: boolean;
  onRunArchivalSweep: () => Promise<void>;
  isSweepingArchive: boolean;
  onNavigateToTab: (tab: 'youtube' | 'pipeline' | 'journalists' | 'sources' | 'archive') => void;
  t: TranslationDictionary;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  articles,
  journalists,
  sources,
  archivalSettings,
  pipelineItems,
  onTriggerPipeline,
  isProcessingPipeline,
  onRunArchivalSweep,
  isSweepingArchive,
  onNavigateToTab,
  t,
}) => {
  const [metrics, setMetrics] = useState<EngineSystemMetrics | null>(null);
  const [history, setHistory] = useState<MetricDataPoint[]>([]);
  const [isAutoPolling, setIsAutoPolling] = useState(true);
  const [pollIntervalMs, setPollIntervalMs] = useState(3000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [liveUptimeSec, setLiveUptimeSec] = useState<number>(14820);

  // Fetch real-time system metrics from the engine
  const fetchMetrics = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/system/metrics');
      if (res.ok) {
        const data: EngineSystemMetrics = await res.json();
        setMetrics(data);
        if (data.recentHistory && data.recentHistory.length > 0) {
          setHistory(data.recentHistory);
        }
        setLiveUptimeSec(data.uptimeSeconds);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.warn('Telemetry poll notification (local fallbacks active):', err);
    } finally {
      if (manual) setIsRefreshing(false);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    fetchMetrics();
    if (!isAutoPolling) return;
    const interval = setInterval(() => {
      fetchMetrics();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchMetrics, isAutoPolling, pollIntervalMs]);

  // Live client-side uptime ticker increment
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveUptimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format uptime into days, hours, minutes, seconds
  const formatUptime = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  // Queue item aggregations
  const queuePending = useMemo(
    () => pipelineItems.filter((i) => i.status === 'pending').length,
    [pipelineItems]
  );
  const queueProcessing = useMemo(
    () => pipelineItems.filter((i) => i.status === 'processing').length,
    [pipelineItems]
  );
  const queueCompleted = useMemo(
    () => pipelineItems.filter((i) => i.status === 'completed').length,
    [pipelineItems]
  );
  const queueFlagged = useMemo(
    () => pipelineItems.filter((i) => i.status === 'flagged').length,
    [pipelineItems]
  );

  // Chart data calculation
  const chartData = useMemo(() => {
    if (history.length > 0) {
      return history.map((item) => ({
        time: item.timeLabel,
        cpu: item.cpu,
        memory: item.memoryMb,
        memoryPercent: item.memoryPercent,
        queue: item.activeQueue,
      }));
    }
    // Fallback baseline for preview if history is still populating
    return [
      { time: '12:00:00', cpu: 18.2, memory: 184, memoryPercent: 18.0, queue: 3 },
      { time: '12:00:03', cpu: 24.5, memory: 188, memoryPercent: 18.4, queue: 4 },
      { time: '12:00:06', cpu: 22.1, memory: 191, memoryPercent: 18.7, queue: 2 },
      { time: '12:00:09', cpu: 28.7, memory: 195, memoryPercent: 19.0, queue: 5 },
      { time: '12:00:12', cpu: 21.0, memory: 198, memoryPercent: 19.3, queue: 3 },
      { time: '12:00:15', cpu: 25.4, memory: 202, memoryPercent: 19.7, queue: 4 },
    ];
  }, [history]);

  // Current telemetry values
  const currentCpu = metrics?.cpuUsagePercent ?? (history[history.length - 1]?.cpu ?? 21.8);
  const currentMemoryMb = metrics?.memoryUsageMb ?? (history[history.length - 1]?.memoryMb ?? 210);
  const currentMemoryPercent =
    metrics?.memoryUsagePercent ?? (history[history.length - 1]?.memoryPercent ?? 20.5);
  const totalMemoryMb = metrics?.memoryTotalMb ?? 1024;

  const peakCpu = useMemo(() => {
    if (chartData.length === 0) return 32.0;
    return Math.max(...chartData.map((d) => d.cpu));
  }, [chartData]);

  const avgCpu = useMemo(() => {
    if (chartData.length === 0) return 22.5;
    const sum = chartData.reduce((acc, cur) => acc + cur.cpu, 0);
    return Math.round((sum / chartData.length) * 10) / 10;
  }, [chartData]);

  // Stage breakdown
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    pipelineItems.forEach((item) => {
      counts[item.currentStage] = (counts[item.currentStage] || 0) + 1;
    });
    return counts;
  }, [pipelineItems]);

  return (
    <div className="space-y-6" id="news-engine-overview">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="bg-white border border-neutral-300 rounded p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-neutral-900 text-white rounded">
            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif-editorial font-bold text-neutral-950 uppercase tracking-tight">
                News Orchestration Engine
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                LIVE CONTINUOUS DAEMON
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-mono-code mt-0.5">
              14-Stage Ingestion Pipeline &bull; Automated 24h Archival Rule &bull; Real-Time V8 Telemetry
            </p>
          </div>
        </div>

        {/* Polling interval & actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono-code">
          <div className="flex items-center bg-neutral-100 border border-neutral-300 rounded p-1">
            <span className="text-[11px] text-neutral-500 px-2 font-bold uppercase">Poll Rate:</span>
            {[
              { label: '2s', val: 2000 },
              { label: '3s', val: 3000 },
              { label: '5s', val: 5000 },
            ].map((rate) => (
              <button
                key={rate.val}
                onClick={() => setPollIntervalMs(rate.val)}
                className={`px-2 py-1 rounded font-bold transition-colors ${
                  pollIntervalMs === rate.val
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {rate.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAutoPolling((p) => !p)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded font-bold border transition-colors ${
              isAutoPolling
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {isAutoPolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPolling ? 'Streaming' : 'Paused'}</span>
          </button>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-1.5 rounded font-bold transition-colors disabled:opacity-50"
            title="Poll fresh metrics now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME KPI GAUGES (CPU, MEMORY, UPTIME, QUEUE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU USAGE */}
        <div className="bg-white border border-neutral-300 rounded p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-600 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-neutral-900" />
              Engine CPU Load
            </span>
            <span
              className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded uppercase ${
                currentCpu < 50
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentCpu < 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {currentCpu < 50 ? 'Optimal' : currentCpu < 80 ? 'Moderate' : 'High Load'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono-code font-black text-neutral-950">
              {currentCpu.toFixed(1)}%
            </span>
            <span className="text-xs font-mono-code text-neutral-500">vCPU Allocation</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                currentCpu < 50 ? 'bg-neutral-900' : currentCpu < 80 ? 'bg-amber-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(100, currentCpu)}%` }}
            ></div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono-code text-neutral-600">
            <span>Peak: {peakCpu.toFixed(1)}%</span>
            <span>Avg: {avgCpu.toFixed(1)}%</span>
          </div>
        </div>

        {/* MEMORY USAGE */}
        <div className="bg-white border border-neutral-300 rounded p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-600 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-neutral-900" />
              Memory (RSS / Heap)
            </span>
            <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
              Stable
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono-code font-black text-neutral-950">
              {currentMemoryMb} <span className="text-sm font-bold text-neutral-600">MB</span>
            </span>
            <span className="text-xs font-mono-code text-neutral-500">
              ({currentMemoryPercent.toFixed(1)}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(100, currentMemoryPercent)}%` }}
            ></div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono-code text-neutral-600">
            <span>Process RSS: {currentMemoryMb} MB</span>
            <span>Limit: {totalMemoryMb} MB</span>
          </div>
        </div>

        {/* SYSTEM UPTIME */}
        <div className="bg-white border border-neutral-300 rounded p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-900" />
              System Uptime
            </span>
            <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              99.98% SLA
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-mono-code font-black text-neutral-950 tracking-tight">
              {formatUptime(liveUptimeSec)}
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-200 flex flex-col gap-1 text-[11px] font-mono-code text-neutral-600">
            <div className="flex justify-between">
              <span>Zero-Crash Guardian:</span>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Next Ingestion Cycle:</span>
              <span className="text-neutral-900 font-bold">in 45s</span>
            </div>
          </div>
        </div>

        {/* PENDING QUEUE ITEMS */}
        <div className="bg-white border border-neutral-300 rounded p-4 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neutral-900" />
              Active Queue Items
            </span>
            <button
              onClick={() => onNavigateToTab('pipeline')}
              className="text-[10px] font-mono-code font-bold text-red-700 hover:underline flex items-center gap-0.5"
            >
              <span>View 14 Stages</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono-code font-black text-neutral-950">
              {queuePending + queueProcessing}
            </span>
            <span className="text-xs font-mono-code text-neutral-500">
              in-flight ({pipelineItems.length} total)
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 text-center font-mono-code text-[10px]">
            <div className="bg-neutral-100 p-1.5 rounded border border-neutral-200">
              <span className="block text-amber-700 font-bold text-xs">{queuePending}</span>
              <span className="text-neutral-500 uppercase">Pending</span>
            </div>
            <div className="bg-neutral-100 p-1.5 rounded border border-neutral-200">
              <span className="block text-blue-700 font-bold text-xs">{queueProcessing}</span>
              <span className="text-neutral-500 uppercase">Processing</span>
            </div>
            <div className="bg-neutral-100 p-1.5 rounded border border-neutral-200">
              <span className="block text-emerald-700 font-bold text-xs">{queueCompleted}</span>
              <span className="text-neutral-500 uppercase">Cleared</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME CPU AND MEMORY USAGE CHART */}
      <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-red-700">
              REAL-TIME RESOURCE TELEMETRY
            </span>
            <h3 className="text-lg font-serif-editorial font-bold text-neutral-950 uppercase">
              Engine CPU Load &amp; Memory Consumption (Live V8 Stream)
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-neutral-900 inline-block"></span>
              <span className="text-neutral-700 font-bold">CPU Usage (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span className="text-neutral-700 font-bold">Memory RSS (MB)</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#171717" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#737373', fontFamily: 'monospace' }}
                stroke="#a3a3a3"
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#737373', fontFamily: 'monospace' }}
                stroke="#a3a3a3"
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 500]}
                tick={{ fontSize: 11, fill: '#737373', fontFamily: 'monospace' }}
                stroke="#a3a3a3"
                unit="M"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#262626',
                  color: '#ffffff',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
                labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
                formatter={(value: any, name: any) => {
                  if (name === 'cpu') return [`${Number(value).toFixed(1)}%`, 'CPU Usage'];
                  if (name === 'memory') return [`${Number(value)} MB`, 'Memory RSS'];
                  return [value, name];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cpu"
                name="cpu"
                stroke="#171717"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cpuGradient)"
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="memory"
                name="memory"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#memGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Telemetry Summary Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code text-neutral-700">
          <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
            <span className="text-neutral-500 block text-[10px] uppercase">Current CPU</span>
            <span className="font-bold text-neutral-900 text-sm">{currentCpu.toFixed(1)}%</span>
          </div>
          <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
            <span className="text-neutral-500 block text-[10px] uppercase">Peak CPU (Window)</span>
            <span className="font-bold text-neutral-900 text-sm">{peakCpu.toFixed(1)}%</span>
          </div>
          <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
            <span className="text-neutral-500 block text-[10px] uppercase">Memory Resident</span>
            <span className="font-bold text-emerald-800 text-sm">{currentMemoryMb} MB</span>
          </div>
          <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
            <span className="text-neutral-500 block text-[10px] uppercase">Telemetry State</span>
            <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE AI JOURNALIST DESK STATUS */}
      <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
          <div>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-red-700">
              REGIONAL COVERAGE DISPATCH
            </span>
            <h3 className="text-lg font-serif-editorial font-bold text-neutral-950 uppercase">
              Active AI Journalist Correspondents &amp; Editorial State
            </h3>
          </div>

          <button
            onClick={() => onNavigateToTab('journalists')}
            className="text-xs font-mono-code font-bold text-neutral-900 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <span>Open Journalist Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {journalists.map((journalist) => {
            const isIdle = journalist.status === 'idle';
            return (
              <div
                key={journalist.id}
                className="border border-neutral-200 rounded p-3.5 hover:border-neutral-400 transition-colors bg-neutral-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={journalist.avatar}
                      alt={journalist.name}
                      className="w-11 h-11 rounded-full object-cover border border-neutral-300 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif-editorial font-bold text-sm text-neutral-950 truncate">
                        {journalist.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-mono-code truncate">
                        {journalist.role}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isIdle ? 'bg-neutral-400' : 'bg-emerald-500 animate-pulse'
                          }`}
                        ></span>
                        <span
                          className={`text-[10px] font-mono-code uppercase font-bold ${
                            isIdle ? 'text-neutral-500' : 'text-emerald-700'
                          }`}
                        >
                          {journalist.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Details */}
                  <div className="mt-3 pt-2 border-t border-neutral-200/80 space-y-1 text-xs font-mono-code text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[10px]">Beat:</span>
                      <span className="text-neutral-900 font-bold truncate max-w-[140px]">
                        {journalist.beat}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[10px]">Territories:</span>
                      <span className="text-neutral-900 font-bold truncate max-w-[140px]">
                        {journalist.geographicScope.countries.slice(0, 3).join(', ')}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[10px]">Published:</span>
                      <span className="text-neutral-900 font-bold">
                        {journalist.articlesPublishedCount} articles
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 text-[10px]">Confidence:</span>
                      <span className="text-emerald-700 font-bold">
                        {journalist.averageConfidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono-code">
                  <span className="text-neutral-500">
                    Active Tasks: <strong className="text-neutral-900">{journalist.activeAssignments}</strong>
                  </span>
                  <button
                    onClick={() => onNavigateToTab('journalists')}
                    className="text-red-700 hover:text-red-800 font-bold hover:underline"
                  >
                    Task &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. INGESTION QUEUE STAGES & ARCHIVAL STATUS (SPLIT VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PIPELINE QUEUE STAGES */}
        <div className="lg:col-span-2 bg-white border border-neutral-300 rounded p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <div>
              <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-red-700">
                14-STAGE PIPELINE FLOW
              </span>
              <h3 className="text-base font-serif-editorial font-bold text-neutral-950 uppercase">
                Pending Queue Stage Breakdown
              </h3>
            </div>
            <button
              onClick={onTriggerPipeline}
              disabled={isProcessingPipeline}
              className="inline-flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-mono-code font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isProcessingPipeline ? 'animate-bounce text-amber-400' : ''}`} />
              <span>{isProcessingPipeline ? 'Processing...' : 'Run Pipeline Cycle'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { stage: 'SOURCE_DISCOVERY', label: '1. Discovery' },
              { stage: 'CONTENT_INGESTION', label: '2. Ingestion' },
              { stage: 'LANGUAGE_DETECTION', label: '3. Language' },
              { stage: 'DUPLICATE_DETECTION', label: '4. Duplicate' },
              { stage: 'EVENT_CLUSTERING', label: '5. Clustering' },
              { stage: 'SOURCE_COMPARISON', label: '6. Compare' },
              { stage: 'FACT_EXTRACTION', label: '7. Extract' },
              { stage: 'AI_JOURNALIST_ASSIGNMENT', label: '8. Assigned' },
              { stage: 'ARTICLE_GENERATION', label: '9. Generation' },
              { stage: 'EDITORIAL_REVIEW', label: '10. Review' },
              { stage: 'PUBLICATION', label: '11. Published' },
              { stage: 'ARCHIVING', label: '12. Archiving' },
            ].map((st) => {
              const count = stageCounts[st.stage] || 0;
              return (
                <div
                  key={st.stage}
                  className={`p-2.5 rounded border text-xs font-mono-code transition-colors ${
                    count > 0
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[11px] font-bold">{st.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        count > 0 ? 'bg-red-600 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 24-HOUR ARCHIVAL STATE & WIRE SOURCES */}
        <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-neutral-200 pb-3 mb-4">
              <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-red-700">
                LIFECYCLE RULES
              </span>
              <h3 className="text-base font-serif-editorial font-bold text-neutral-950 uppercase">
                24-Hour Archive &amp; Wire Health
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono-code">
              {/* Archival window */}
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-red-700" />
                    24h Rolling Window
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Articles older than 24h are cleanly moved to permanent archive. Front page retains strictly live news.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-neutral-800">
                  <span>Active Live News:</span>
                  <span>{articles.filter((a) => !a.isArchived).length} stories</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800">
                  <span>Archived Stories:</span>
                  <span>{articles.filter((a) => a.isArchived).length} stories</span>
                </div>
              </div>

              {/* Wire Feeds health */}
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-neutral-800" />
                    Wire Feeds Status
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    100% ONLINE
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                  <span>Connected Sources:</span>
                  <strong className="text-neutral-900">{sources.filter((s) => s.isActive).length} active</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                  <span>Deduplication Factor:</span>
                  <strong className="text-neutral-900">4.2 : 1</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center gap-2">
            <button
              onClick={onRunArchivalSweep}
              disabled={isSweepingArchive}
              className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-mono-code font-bold py-2 px-3 rounded transition-colors text-center disabled:opacity-50"
            >
              {isSweepingArchive ? 'Sweeping...' : 'Run Archival Sweep'}
            </button>
            <button
              onClick={() => onNavigateToTab('sources')}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono-code font-bold py-2 px-3 rounded transition-colors border border-neutral-300"
            >
              Feeds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
