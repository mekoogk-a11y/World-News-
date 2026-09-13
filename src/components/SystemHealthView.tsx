import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Globe2,
  Database,
  Archive,
  Bot,
  Play,
  Clock,
  Radio,
  Sliders,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { SystemHealthData, AgentStatusInfo, MetricDataPoint, User } from '../types';
import { TranslationDictionary } from '../i18n';

interface SystemHealthViewProps {
  currentUser: User | null;
  t: TranslationDictionary;
  onOpenLogin: () => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  currentUser,
  t,
  onOpenLogin,
}) => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [agents, setAgents] = useState<AgentStatusInfo[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<MetricDataPoint[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch health data
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
  };

  // Fetch AI agents
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  // Fetch metrics telemetry
  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/system/metrics');
      if (res.ok) {
        const data = await res.json();
        setCurrentMetrics(data);
        if (data.history && Array.isArray(data.history)) {
          setMetricsHistory(data.history);
        }
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchHealth(), fetchAgents(), fetchMetrics()]);
      setIsLoading(false);
    };
    init();

    // Telemetry polling interval (every 4 seconds)
    const timer = setInterval(() => {
      fetchMetrics();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleRunAgent = async (agentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setRunningAgentId(agentId);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`/api/agents/${agentId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`تم تشغيل المراسل الذكي بنجاح ومعالجة ${data.itemsProcessed || 0} خبراً.`);
        await Promise.all([fetchAgents(), fetchHealth()]);
      } else {
        setToastMessage(data.message || 'فشل تشغيل المراسل الذكي.');
      }
    } catch (err: any) {
      setToastMessage(err.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setRunningAgentId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans-editorial text-neutral-900" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 text-red-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  <Activity className="h-3.5 w-3.5 text-red-700 animate-pulse" />
                  مراقبة حية للبنية التحتية
                </span>
                {healthData && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
                      healthData.mode === 'LIVE'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    الوضع: {healthData.mode === 'LIVE' ? 'مباشر (LIVE MODE)' : 'تجريبي محاكى (DEMO MODE)'}
                  </span>
                )}
              </div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                {t.navSystemHealth || 'صحة النظام وغرفة العمليات المركزية'}
              </h1>
              <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
                مراقبة فورية لأداء محركات الذكاء الاصطناعي، قواعد البيانات، جداول الأرشفة التلقائية، ووكالات الأنباء العالمية.
              </p>
            </div>

            <button
              onClick={() => {
                fetchHealth();
                fetchAgents();
                fetchMetrics();
              }}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
              تحديث البيانات الآن
            </button>
          </div>

          {/* Demo Mode Notice Box */}
          {healthData?.demoNotice && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-0.5">تنبيه وضع المحاكاة (Demo Mode):</strong>
                <p className="leading-relaxed">{healthData.demoNotice}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. REAL-TIME CPU & MEMORY TELEMETRY CHART */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-red-100 p-2 text-red-800">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif-editorial text-lg font-bold text-neutral-950">
                  مؤشرات استهلاك الموارد المباشرة (Hardware Telemetry)
                </h2>
                <p className="text-xs text-neutral-500">
                  رصد مباشر لاستهلاك وحدة المعالجة المركزية (CPU) والذاكرة العشوائية (RAM) في الوقت الفعلي
                </p>
              </div>
            </div>

            {currentMetrics && (
              <div className="flex items-center gap-4 text-xs font-mono-code bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-neutral-500">CPU: </span>
                  <strong className="text-neutral-900 font-bold">{currentMetrics.cpuUsagePercent}%</strong>
                </div>
                <div className="text-neutral-300">|</div>
                <div>
                  <span className="text-neutral-500">RAM: </span>
                  <strong className="text-neutral-900 font-bold">{currentMetrics.memoryUsageMb} MB</strong>
                </div>
                <div className="text-neutral-300">|</div>
                <div>
                  <span className="text-neutral-500">Uptime: </span>
                  <strong className="text-neutral-900 font-bold">{Math.round(currentMetrics.uptimeSeconds / 60)} دقيقة</strong>
                </div>
              </div>
            )}
          </div>

          {/* SVG Real-time Area Chart */}
          <div className="h-44 w-full relative bg-neutral-950 rounded-xl overflow-hidden p-4 text-white">
            <div className="absolute top-3 right-4 flex items-center gap-4 text-[11px] font-mono-code">
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                استهلاك CPU (%)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                استهلاك الذاكرة (%)
              </span>
            </div>

            {metricsHistory.length > 1 ? (
              <svg className="w-full h-full pt-6" viewBox="0 0 500 100" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="25" x2="500" y2="25" stroke="#333" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#333" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#333" strokeDasharray="3 3" />

                {/* CPU Line */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  points={metricsHistory
                    .slice(-20)
                    .map((pt, idx, arr) => {
                      const x = (idx / Math.max(arr.length - 1, 1)) * 500;
                      const y = 100 - (pt.cpu || 10);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Memory Line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  points={metricsHistory
                    .slice(-20)
                    .map((pt, idx, arr) => {
                      const x = (idx / Math.max(arr.length - 1, 1)) * 500;
                      const y = 100 - (pt.memoryPercent || 25);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-mono-code">
                جاري تجميع نقاط التتبع الحية...
              </div>
            )}
          </div>
        </section>

        {/* 2. CORE SUBSYSTEMS STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gemini AI Engine */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-sm text-neutral-900">محرك Google Gemini</h3>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                  healthData?.geminiApi.status === 'ONLINE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {healthData?.geminiApi.status || 'فحص...'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.geminiApi.message}
            </p>
            <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span>Google GenAI SDK</span>
              <span>Gemini 2.5 Pro / Flash</span>
            </div>
          </div>

          {/* News APIs & Feeds */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-sm text-neutral-900">وكالات الأنباء و RSS</h3>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                متصل ونشط
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.newsApis.message}
            </p>
            <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span>تغطية متعددة اللغات</span>
              <span>Reuters, AP, BBC, Al Jazeera</span>
            </div>
          </div>

          {/* Production Database */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-neutral-900">قاعدة بيانات الإنتاج</h3>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.database.message}
            </p>
            {healthData?.database.details && (
              <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-1 text-center">
                <div className="rounded bg-neutral-50 py-1">
                  <strong>{healthData.database.details.totalArticles}</strong> مقال
                </div>
                <div className="rounded bg-neutral-50 py-1">
                  <strong>{healthData.database.details.contractingArticles}</strong> مقاولات
                </div>
                <div className="rounded bg-neutral-50 py-1">
                  <strong>{healthData.database.details.logs}</strong> سجل
                </div>
              </div>
            )}
          </div>

          {/* 24-Hour Archive Worker */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-sm text-neutral-900">محرك الأرشفة 24 ساعة</h3>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                نشط تلقائياً
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.archiveWorker.message}
            </p>
            <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span>النافذة الزمنية: 24 ساعة</span>
              <span>أرشفة كاملة بدون فقد بيانات</span>
            </div>
          </div>

          {/* Background Scheduler */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-600" />
                <h3 className="font-bold text-sm text-neutral-900">المجدول الدوري للخلفية</h3>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                يعمل باستمرار
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.scheduler.message}
            </p>
            <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span>مستقل عن المتصفح</span>
              <span>Backend Scheduled Sweepers</span>
            </div>
          </div>

          {/* YouTube Video API */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-sm text-neutral-900">تكامل الفيديو والبث</h3>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                جاهز
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              {healthData?.youtubeApi.message}
            </p>
            <div className="text-[11px] font-mono-code text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span>البث الحي والفيديوهات</span>
              <span>ربط تلقائي بالأخبار التحريرية</span>
            </div>
          </div>
        </div>

        {/* 3. AUTONOMOUS AI JOURNALISTS SECTION */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-800">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif-editorial text-lg font-bold text-neutral-950">
                  فريق المراسلين والمحررين بالذكاء الاصطناعي (Autonomous AI Journalists)
                </h2>
                <p className="text-xs text-neutral-500">
                  مراقبة مستمرة للمراسلين الخمسة المتخصصين، مع إمكانية التشغيل الفوري يدوياً
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-neutral-950">{agent.name}</h3>
                    <p className="text-xs font-semibold text-red-900">{agent.role}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      agent.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : agent.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mb-4 flex-1">{agent.description}</p>

                <div className="space-y-1.5 text-xs text-neutral-500 font-mono-code mb-4">
                  <div className="flex justify-between">
                    <span>التغطية الجغرافية:</span>
                    <strong className="text-neutral-800">{agent.focusRegion}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>القصص المعالجة:</span>
                    <strong className="text-neutral-800">{agent.storiesProcessed} قصة</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>آخر عملية:</span>
                    <strong className="text-neutral-800">
                      {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString('ar-EG') : 'قيد الانتظار'}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => handleRunAgent(agent.id)}
                  disabled={runningAgentId === agent.id}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {runningAgentId === agent.id ? 'جاري التشغيل والمعالجة...' : 'تشغيل المراسل الآن'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
