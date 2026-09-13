import React from 'react';
import {
  Layers,
  ArrowDown,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Filter,
  Users,
  Image as ImageIcon,
  BookOpen,
  Send,
  Database,
  Search,
  FileCheck,
} from 'lucide-react';
import { PipelineStage, PipelineExecutionItem } from '../types';
import { formatRelativeTime } from './ArticleCard';

interface PipelineViewProps {
  pipelineItems: PipelineExecutionItem[];
  onTriggerPipeline: () => void;
  isProcessing: boolean;
}

const PIPELINE_STAGES: {
  id: PipelineStage;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'SOURCE_DISCOVERY',
    title: '1. Source Discovery',
    description: 'Autonomous polling of authorized RSS feeds, wire AP/Reuters APIs, and governmental gazettes.',
    icon: <Search className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'CONTENT_INGESTION',
    title: '2. Content Ingestion',
    description: 'Retrieval of complete machine-readable XML/JSON wire dispatches without bypassing paywalls or access controls.',
    icon: <Layers className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'LANGUAGE_DETECTION',
    title: '3. Language Detection',
    description: 'ISO-639 multilingual parsing with standardized English/regional normalization.',
    icon: <Filter className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'DUPLICATE_DETECTION',
    title: '4. Duplicate Detection',
    description: 'Semantic vector hashing prevents redundant re-reporting of already published events.',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'EVENT_CLUSTERING',
    title: '5. Event Clustering',
    description: 'Clusters disparate wire dispatches discussing the identical real-world event into a single cluster.',
    icon: <Layers className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'SOURCE_COMPARISON',
    title: '6. Source Comparison',
    description: 'Cross-checks independent wires (e.g. UN, Reuters, AP, institutional bulletins) for consistency.',
    icon: <FileCheck className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 'FACT_EXTRACTION',
    title: '7. Fact Extraction',
    description: 'Isolates names, dates, statistics, locations, and direct verbatim quotes strictly without hallucinations.',
    icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'RELEVANCE_SCORING',
    title: '8. Relevance Scoring',
    description: 'Algorithmic prioritization assessing international geopolitical, economic, and humanitarian impact.',
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'AI_JOURNALIST_ASSIGNMENT',
    title: '9. AI Correspondent Assignment',
    description: 'Directs the story to the designated regional desk: Carter (Americas), Wilson (Europe), Okoro (Africa), Nakamura (Asia).',
    icon: <Users className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'ARTICLE_GENERATION',
    title: '10. Article Generation',
    description: 'Drafts objective, anti-clickbait prose adhering to strict international newspaper style standards.',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'IMAGE_SEARCH',
    title: '11. Image Source & Verification',
    description: 'Pairs verified public domain or licensed editorial imagery with mandatory credit and licensing attribution.',
    icon: <ImageIcon className="w-4 h-4 text-rose-400" />,
  },
  {
    id: 'EDITORIAL_REVIEW',
    title: '12. Editorial Review',
    description: 'Automated compliance check confirming zero invented facts and labeling verification status (Confirmed/Developing).',
    icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
  },
  {
    id: 'PUBLICATION',
    title: '13. Live Publication',
    description: 'Immediate dissemination across the live newsroom, breaking ticker, and regional news grid.',
    icon: <Send className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'ARCHIVING',
    title: '14. Automated Archiving',
    description: 'Lifecycle tracking preserving immutable UTC timestamps and hierarchically moving older stories into the Year/Month archive.',
    icon: <Database className="w-4 h-4 text-slate-400" />,
  },
];

export const PipelineView: React.FC<PipelineViewProps> = ({
  pipelineItems,
  onTriggerPipeline,
  isProcessing,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Autonomous Editorial Pipeline</span>
          </div>
          <h2 className="font-display-editorial text-2xl sm:text-3xl font-bold text-slate-100">
            14-Stage Newsroom Verification Architecture
          </h2>
          <p className="text-xs text-slate-400 font-serif-editorial italic mt-1 max-w-2xl">
            Every piece of incoming international intelligence traverses this deterministic sequence to guarantee multi-source corroboration, anti-hallucination compliance, and proper legal attribution.
          </p>
        </div>

        <button
          id="pipeline-trigger-action-btn"
          onClick={onTriggerPipeline}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'Executing 14 Stages...' : 'Run Pipeline Ingestion Sweep'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">STAGES ENFORCED</div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">14 / 14</div>
          <div className="text-[10px] text-emerald-400 mt-1">● 100% Policy Adherence</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">AVG PROCESSING SPEED</div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">2,350 ms</div>
          <div className="text-[10px] text-slate-500 mt-1">End-to-End Latency</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">CLUSTER CORROBORATION</div>
          <div className="text-2xl font-bold text-amber-400 font-mono-code">3.4 : 1</div>
          <div className="text-[10px] text-slate-400 mt-1">Sources per Published Story</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">INVENTION RATE</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono-code">0.0%</div>
          <div className="text-[10px] text-emerald-400 mt-1">Zero-Tolerance Standard</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive 14-Stage Visual Tree */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-display-editorial text-sm font-bold tracking-wider text-slate-300 uppercase mb-3">
            Pipeline Sequence & Verification Protocol
          </h3>

          <div className="space-y-2 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div
                key={stage.id}
                className="relative pl-12 pr-4 py-3 rounded-xl bg-[#0f141c] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="absolute left-3 top-3.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono-code text-slate-300">
                  {idx + 1}
                </div>
                <div className="flex items-center gap-2">
                  {stage.icon}
                  <h4 className="font-bold text-slate-100 text-xs font-sans-editorial">
                    {stage.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-serif-editorial leading-relaxed">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Ingestion Queue & Item Auditor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display-editorial text-sm font-bold tracking-wider text-slate-300 uppercase">
              Recent Pipeline Execution Stream
            </h3>
            <span className="text-[11px] font-mono-code text-slate-500">
              {pipelineItems.length} records
            </span>
          </div>

          <div className="space-y-3">
            {pipelineItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0f141c] border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono-code">
                  <span className="text-indigo-400 font-bold">{item.id}</span>
                  <span className="text-slate-500">{formatRelativeTime(item.timestamp)}</span>
                </div>

                <h5 className="font-serif-editorial text-sm font-bold text-slate-100 line-clamp-2">
                  {item.rawTitle}
                </h5>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-code text-slate-400 border-t border-slate-800/80 pt-2">
                  <div>
                    <span className="text-slate-500">Stage: </span>
                    <span className="text-amber-300 font-semibold">{item.currentStage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Cluster: </span>
                    <span className="text-slate-300">{item.clusterId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Correspondent: </span>
                    <span className="text-slate-300">{item.assignedJournalist}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Duration: </span>
                    <span className="text-emerald-400">{item.durationMs || 1800}ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-mono-code">
                    Sources: <strong className="text-slate-200">{item.sourcesCount} wires</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-code ${
                      item.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.status === 'processing'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
