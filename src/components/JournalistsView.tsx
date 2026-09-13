import React, { useState } from 'react';
import {
  Users,
  Shield,
  Send,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  FileText,
  Activity,
  Sliders,
} from 'lucide-react';
import { Journalist, Article, NewsSource } from '../types';
import { formatRelativeTime, VerificationBadge } from './ArticleCard';

interface JournalistsViewProps {
  journalists: Journalist[];
  articles: Article[];
  sources: NewsSource[];
  onSelectArticle: (article: Article) => void;
  onTaskJournalist: (
    journalistId: string,
    topic: string,
    category: string,
    sourceHints?: string
  ) => Promise<void>;
  isTasking: boolean;
}

export const JournalistsView: React.FC<JournalistsViewProps> = ({
  journalists,
  articles,
  sources,
  onSelectArticle,
  onTaskJournalist,
  isTasking,
}) => {
  const [selectedJournalistId, setSelectedJournalistId] = useState<string>(journalists[0]?.id || 'michael-carter');
  const [investigationTopic, setInvestigationTopic] = useState('');
  const [investigationCategory, setInvestigationCategory] = useState('WORLD');
  const [investigationHints, setInvestigationHints] = useState('');
  const [taskSuccessMessage, setTaskSuccessMessage] = useState('');

  const currentJournalist = journalists.find((j) => j.id === selectedJournalistId) || journalists[0];
  const journalistArticles = articles.filter((a) => a.journalistId === currentJournalist.id);
  const journalistSources = sources.filter((s) => s.assignedJournalistId === currentJournalist.id);

  const handleCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigationTopic.trim()) return;

    try {
      await onTaskJournalist(
        currentJournalist.id,
        investigationTopic.trim(),
        investigationCategory,
        investigationHints.trim()
      );
      setTaskSuccessMessage(`Investigation dispatched to ${currentJournalist.name}. Story verified and published.`);
      setInvestigationTopic('');
      setInvestigationHints('');
      setTimeout(() => setTaskSuccessMessage(''), 6000);
    } catch {
      setTaskSuccessMessage('Task processing encountered an issue.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Overview Masthead */}
      <div>
        <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Specialized AI Editorial Corps</span>
        </div>
        <h2 className="font-display-editorial text-2xl sm:text-3xl font-bold text-slate-100">
          Four Autonomous International Correspondents
        </h2>
        <p className="text-sm text-slate-400 font-serif-editorial italic mt-1 max-w-2xl">
          Each correspondent oversees an autonomous regional desk with strict geographic scope, dedicated wire feeds, automated fact-checking models, and continuous source verification.
        </p>
      </div>

      {/* 4 Journalists Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(journalists || []).map((j) => {
          const isSelected = j.id === currentJournalist.id;
          const pubCount = articles.filter((a) => a.journalistId === j.id).length;

          return (
            <div
              key={j.id}
              onClick={() => setSelectedJournalistId(j.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/50'
                  : 'bg-[#0f141c] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 shrink-0">
                  <img src={j.avatar} alt={j.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    <span>{j.name}</span>
                  </h3>
                  <div className="text-[11px] font-semibold text-amber-400">{j.role}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono-code text-[11px]">
                  <span>Status:</span>
                  <span
                    className={`font-semibold uppercase ${
                      j.status === 'synthesizing'
                        ? 'text-amber-400'
                        : j.status === 'fact_checking'
                        ? 'text-cyan-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    ● {j.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400 font-mono-code text-[11px]">
                  <span>Published Dispatches:</span>
                  <span className="text-slate-200 font-bold">{pubCount}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400 font-mono-code text-[11px]">
                  <span>Reliability Avg:</span>
                  <span className="text-emerald-400 font-bold">{j.averageConfidence}%</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 line-clamp-1">
                <span className="font-semibold text-slate-300">Beat: </span>
                {j.beat}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Journalist Desk Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identity, Geographic Scope, Sources, & Commission Tool */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Card */}
          <div className="p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500/40 shrink-0">
                <img src={currentJournalist.avatar} alt={currentJournalist.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display-editorial text-xl font-bold text-slate-100">
                    {currentJournalist.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ACCREDITED AI
                  </span>
                </div>
                <div className="text-xs font-semibold text-amber-400">{currentJournalist.role}</div>
                <div className="text-xs text-slate-400 mt-1">{currentJournalist.beat}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-serif-editorial leading-relaxed border-t border-slate-800 pt-3">
              {currentJournalist.bio}
            </p>

            {/* Geographic Scope */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Geographic Mandate & Coverage Area</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(currentJournalist?.geographicScope?.countries || []).map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Assigned Sources */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned Wire Ingestion Sources ({(journalistSources || []).length})</span>
                </div>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {(journalistSources || []).map((s) => (
                  <div
                    key={s.id}
                    className="p-2 rounded bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-200 truncate mr-2">{s.name}</span>
                    <span className="font-mono-code text-emerald-400 shrink-0">{s.reliabilityRating}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commission Investigative Dispatch Form */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0f141c] to-[#121926] border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-100 font-sans-editorial">
                Commission Regional Investigation
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Task {currentJournalist.name} to run an end-to-end editorial workflow (fact extraction, multi-source corroboration, and synthesized article generation) for a topic in their beat.
            </p>

            {taskSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{taskSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleCommission} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Investigation Subject / Event Angle
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g., Cross-border trade agreement, energy initiative in ${currentJournalist.geographicScope.countries[0]}`}
                  value={investigationTopic}
                  onChange={(e) => setInvestigationTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category Desk
                  </label>
                  <select
                    value={investigationCategory}
                    onChange={(e) => setInvestigationCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="WORLD">World</option>
                    <option value="POLITICS">Politics</option>
                    <option value="BUSINESS">Business</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="ENVIRONMENT">Environment</option>
                    <option value="HEALTH">Health</option>
                    <option value="SCIENCE">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Verification Mode
                  </label>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-xs text-emerald-400 font-mono-code">
                    100% Corroborated
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Source Guidelines / Official Links (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official government communiqué, UN press briefing, wire feed"
                  value={investigationHints}
                  onChange={(e) => setInvestigationHints(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isTasking || !investigationTopic.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                {isTasking ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Executing 14-Stage Verification Workflow...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Task to {currentJournalist.name}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time Activity Log & Published Articles by this Correspondent */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Activity Log */}
          <div className="p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100 font-sans-editorial">
                  Real-Time Activity Log & Ingestion Stream
                </h4>
              </div>
              <span className="text-[11px] font-mono-code text-slate-500">
                Audited Pipeline Logs
              </span>
            </div>

            <div className="space-y-3">
              {(currentJournalist?.recentActivity || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{log.action}</span>
                      <span className="text-[10px] font-mono-code bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded">
                        {log.stage}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono-code text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(log.timestamp)}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans-editorial leading-relaxed">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Published Articles by this Correspondent */}
          <div className="p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-slate-100 font-sans-editorial">
                  Dispatches Authored by {currentJournalist.name} ({journalistArticles.length})
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              {(journalistArticles || []).map((art) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-amber-400">
                        {art.category}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{art.country}</span>
                      <VerificationBadge status={art.verificationStatus} score={art.confidenceScore} />
                    </div>
                    <h5 className="font-serif-editorial text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {art.headline}
                    </h5>
                    <p className="text-xs text-slate-400 line-clamp-1">{art.summary}</p>
                  </div>

                  <div className="shrink-0 text-right font-mono-code text-[11px] text-slate-500 flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <span>{formatRelativeTime(art.published_at)}</span>
                    <span className="text-slate-400">{art.sources.length} sources cited</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
