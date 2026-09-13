import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Newspaper,
  Users,
  Layers,
  SlidersHorizontal,
  Database,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  RotateCcw,
  CheckCircle2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Article, Journalist } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  journalists: Journalist[];
  onNavigateTab: (tab: string) => void;
  onSelectArticle: (article: Article) => void;
  onTriggerPipeline: () => void;
  onRunArchiveSweep: () => void;
  onOpenShortcutsHelp: () => void;
  isMac: boolean;
}

interface PaletteItem {
  id: string;
  type: 'tab' | 'journalist' | 'article' | 'action';
  title: string;
  subtitle?: string;
  badge?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  articles,
  journalists,
  onNavigateTab,
  onSelectArticle,
  onTriggerPipeline,
  onRunArchiveSweep,
  onOpenShortcutsHelp,
  isMac,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const modKey = isMac ? '⌘' : 'Ctrl';

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Base list of items
  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result: PaletteItem[] = [];

    // 1. Navigation items
    const navItems: PaletteItem[] = [
      {
        id: 'nav-newsroom',
        type: 'tab',
        title: 'Live Newsroom',
        subtitle: 'Global wire feeds, breaking dispatches, and regional filters',
        shortcut: `${modKey}+1`,
        icon: <Newspaper className="w-4 h-4 text-amber-400" />,
        action: () => {
          onNavigateTab('newsroom');
          onClose();
        },
      },
      {
        id: 'nav-journalists',
        type: 'tab',
        title: 'AI Journalists Bureau',
        subtitle: 'Four specialized correspondents, assigned feeds, and tasking controls',
        shortcut: `${modKey}+J`,
        icon: <Users className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onNavigateTab('journalists');
          onClose();
        },
      },
      {
        id: 'nav-archive',
        type: 'tab',
        title: 'Archive Tree',
        subtitle: 'Hierarchical Year / Month / Day organization and lifecycle policies',
        shortcut: `${modKey}+A`,
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigateTab('archive');
          onClose();
        },
      },
      {
        id: 'nav-pipeline',
        type: 'tab',
        title: '14-Stage Verification Pipeline',
        subtitle: 'Real-time telemetry, stage audit logs, and automated ingestion sweep',
        shortcut: `${modKey}+P`,
        icon: <Layers className="w-4 h-4 text-sky-400" />,
        action: () => {
          onNavigateTab('pipeline');
          onClose();
        },
      },
      {
        id: 'nav-sources',
        type: 'tab',
        title: 'News Sources Engine',
        subtitle: 'Public RSS feeds, wire verification, and health scanners',
        shortcut: `${modKey}+S`,
        icon: <SlidersHorizontal className="w-4 h-4 text-rose-400" />,
        action: () => {
          onNavigateTab('sources');
          onClose();
        },
      },
      {
        id: 'nav-search',
        type: 'tab',
        title: 'Advanced Multi-Parameter Search',
        subtitle: 'Boolean queries across correspondents, jurisdictions, and dates',
        shortcut: `${modKey}+K`,
        icon: <Search className="w-4 h-4 text-amber-400" />,
        action: () => {
          onNavigateTab('search');
          onClose();
        },
      },
    ];

    // Filter nav items
    const filteredNav = q
      ? navItems.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.subtitle?.toLowerCase().includes(q)
        )
      : navItems;
    result.push(...filteredNav);

    // 2. Action commands
    const actionItems: PaletteItem[] = [
      {
        id: 'act-pipeline-sweep',
        type: 'action',
        title: 'Trigger Ingestion Sweep',
        subtitle: 'Poll all active RSS and wire endpoints across 14 verification stages',
        icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
        action: () => {
          onTriggerPipeline();
          onClose();
        },
      },
      {
        id: 'act-archive-sweep',
        type: 'action',
        title: 'Run Archival Lifecycle Sweep',
        subtitle: 'Catalog articles older than lifecycle threshold into historical tree',
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onRunArchiveSweep();
          onClose();
        },
      },
      {
        id: 'act-shortcuts-help',
        type: 'action',
        title: 'Keyboard Shortcuts Cheatsheet',
        subtitle: 'View all global navigation and editorial hotkeys',
        shortcut: '?',
        icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
        action: () => {
          onClose();
          onOpenShortcutsHelp();
        },
      },
    ];

    const filteredActions = q
      ? actionItems.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.subtitle?.toLowerCase().includes(q)
        )
      : actionItems;
    result.push(...filteredActions);

    // 3. Journalists items
    const jourItems: PaletteItem[] = (journalists || []).map((j) => {
      const beatsDisplay = Array.isArray(j.geographicScope?.regions)
        ? j.geographicScope.regions.slice(0, 3).join(', ')
        : (j.beat ? [j.beat] : []).slice(0, 3).join(', ');

      return {
        id: `jour-${j.id}`,
        type: 'journalist',
        title: `${j.name} (${j.role})`,
        subtitle: `Beat: ${j.geographicScope?.regions?.[0] || 'Global'} • ${beatsDisplay || j.beat || ''}`,
        badge: `${j.articlesPublishedCount || 0} dispatches`,
        icon: <Users className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onNavigateTab('journalists');
          onClose();
        },
      };
    });

    const filteredJour = q
      ? jourItems.filter(
          (j) =>
            j.title.toLowerCase().includes(q) ||
            j.subtitle?.toLowerCase().includes(q)
        )
      : jourItems;
    result.push(...filteredJour);

    // 4. Articles matching query
    if (q) {
      const matchedArticles = (articles || [])
        .filter(
          (art) =>
            (art.headline || '').toLowerCase().includes(q) ||
            (art.summary || '').toLowerCase().includes(q) ||
            (Array.isArray(art.keyFacts) && art.keyFacts.some((f) => (f || '').toLowerCase().includes(q))) ||
            (art.country || '').toLowerCase().includes(q) ||
            (art.journalistName || '').toLowerCase().includes(q)
        )
        .slice(0, 8);

      matchedArticles.forEach((art) => {
        result.push({
          id: `art-${art.id}`,
          type: 'article',
          title: art.headline,
          subtitle: `${art.journalistName || ''} • ${art.region || ''} • ${art.country || ''} • ${art.category || ''}`,
          badge: art.verificationStatus,
          icon: <FileText className="w-4 h-4 text-amber-400" />,
          action: () => {
            onSelectArticle(art);
            onClose();
          },
        });
      });
    }

    return result;
  }, [
    query,
    modKey,
    articles,
    journalists,
    onNavigateTab,
    onClose,
    onTriggerPipeline,
    onRunArchiveSweep,
    onOpenShortcutsHelp,
    onSelectArticle,
  ]);

  // Adjust selection when items list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length, query]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (items.length || 1)) % (items.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto-scroll selected item into view
  useEffect(() => {
    const el = document.getElementById(`palette-item-${selectedIndex}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fadeIn"
    >
      <div
        id="command-palette-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c1017] border border-amber-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col transition-all"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 bg-[#0f141c] flex items-center px-4 py-3.5">
          <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search dispatches, AI correspondents, or jump with ${modKey}+J, ${modKey}+A...`}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-hidden font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono-code text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/40 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {items.length > 0 ? (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    id={`palette-item-${idx}`}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-100'
                        : 'hover:bg-slate-800/50 text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? 'text-amber-200' : 'text-slate-100'
                            }`}
                          >
                            {item.title}
                          </span>

                          {item.badge && (
                            <span
                              className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded border shrink-0 ${
                                item.badge === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : item.badge === 'DEVELOPING'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.subtitle && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd className="px-2 py-0.5 text-[11px] font-mono-code font-bold rounded bg-slate-800/90 border border-slate-700 text-slate-300 shadow-xs">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs text-slate-300 font-semibold">
                No matching dispatches or commands found
              </p>
              <p className="text-[11px] text-slate-500">
                Try searching for correspondents, countries, or press{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono-code">
                  ESC
                </kbd>{' '}
                to exit
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="bg-[#090d14] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↵</kbd> to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">esc</kbd> to close
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-amber-400">
            <span>Global AI Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
