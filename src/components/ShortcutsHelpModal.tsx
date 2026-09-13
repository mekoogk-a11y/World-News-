import React, { useEffect } from 'react';
import { X, Keyboard, Command, Sparkles, ArrowRight } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMac: boolean;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
  isMac,
}) => {
  const modKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Global Navigation',
      description: 'Switch newsroom operational views instantly from anywhere in the app',
      shortcuts: [
        { keys: [modKey, 'K'], description: 'Open Command Palette & Global Search', highlight: true },
        { keys: [modKey, 'J'], description: 'Switch to AI Journalists Bureau', highlight: true },
        { keys: [modKey, 'A'], description: 'Switch to Newsroom Archive Tree', highlight: true },
        { keys: [modKey, '1'], description: 'Switch to Live Newsroom' },
        { keys: [modKey, 'P'], description: 'Switch to 14-Stage Pipeline' },
        { keys: [modKey, 'S'], description: 'Switch to News Sources Engine' },
      ],
    },
    {
      title: 'Command Palette & Quick Search',
      description: 'Interact with the Spotlight-style command palette',
      shortcuts: [
        { keys: ['↑', '↓'], description: 'Navigate through commands and article results' },
        { keys: ['↵ Enter'], description: 'Execute selected command or open article' },
        { keys: ['Esc'], description: 'Dismiss palette, modal, or active preview' },
      ],
    },
    {
      title: 'General & Assistance',
      description: 'Utility and cheatsheet controls',
      shortcuts: [
        { keys: ['?'], description: 'Toggle this keyboard shortcuts cheatsheet' },
        { keys: [modKey, '/'], description: 'Toggle keyboard shortcuts cheatsheet' },
        { keys: ['Esc'], description: 'Close any active popup or broadsheet view' },
      ],
    },
  ];

  return (
    <div
      id="shortcuts-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        id="shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f141c] border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display-editorial font-bold text-base text-slate-100">
                  Global Keyboard Shortcuts
                </h3>
                <span className="text-[10px] font-mono-code bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  Power User Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans-editorial">
                High-efficiency navigation hotkeys optimized for editorial desks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto divide-y divide-slate-800/60">
          {shortcutGroups.map((group, gIdx) => (
            <div key={group.title} className={gIdx > 0 ? 'pt-5' : ''}>
              <div className="mb-3">
                <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-amber-400">
                  {group.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-serif-editorial italic">
                  {group.description}
                </p>
              </div>

              <div className="space-y-2">
                {group.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      sc.highlight
                        ? 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-200 font-sans">
                        {sc.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sc.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-1 min-w-[24px] text-center text-xs font-mono-code font-bold rounded-md bg-slate-800 border border-slate-700 text-slate-200 shadow-xs">
                            {k}
                          </kbd>
                          {kIdx < sc.keys.length - 1 && (
                            <span className="text-slate-500 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px] font-mono-code">
            <span>Operating System:</span>
            <span className="text-slate-200 font-bold">{isMac ? 'macOS (Cmd ⌘)' : 'Windows/Linux (Ctrl)'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
