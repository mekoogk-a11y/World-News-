import { useEffect, useState } from 'react';

interface GlobalShortcutsHandlers {
  onOpenCommandPalette: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenShortcutsHelp: () => void;
  onCloseModals: () => void;
}

export function useGlobalShortcuts({
  onOpenCommandPalette,
  onNavigateTab,
  onOpenShortcutsHelp,
  onCloseModals,
}: GlobalShortcutsHandlers) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect macOS
    if (typeof window !== 'undefined') {
      const platform = window.navigator?.userAgent || window.navigator?.platform || '';
      setIsMac(/Mac|iPhone|iPod|iPad/i.test(platform));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing inside an input, textarea, or contentEditable element
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      const isModifierActive = isMac ? e.metaKey : e.ctrlKey;

      // 1. ESC key: always closes any open modal / palette
      if (e.key === 'Escape') {
        onCloseModals();
        return;
      }

      // 2. Cmd+K or Ctrl+K: Open Command Palette / Global Search (even when typing, for instant jump)
      if (isModifierActive && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        onOpenCommandPalette();
        return;
      }

      // 3. Shortcuts Cheatsheet: '?' (Shift + /) or Cmd+/ when not typing
      if (!isTyping && e.key === '?') {
        e.preventDefault();
        onOpenShortcutsHelp();
        return;
      }

      if (isModifierActive && e.key === '/') {
        e.preventDefault();
        onOpenShortcutsHelp();
        return;
      }

      // 4. Cmd+J or Ctrl+J: Switch to AI Journalists Dashboard
      if (isModifierActive && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        onNavigateTab('journalists');
        return;
      }

      // 5. Cmd+A or Ctrl+A: Switch to Archive Tree
      // IMPORTANT: Only hijack Cmd+A if the user is NOT actively typing in an input/textarea!
      if (isModifierActive && (e.key === 'a' || e.key === 'A')) {
        if (!isTyping) {
          e.preventDefault();
          e.stopPropagation();
          onNavigateTab('archive');
          return;
        }
      }

      // 6. Cmd+P or Ctrl+P: Switch to 14-Stage Verification Pipeline
      if (isModifierActive && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        onNavigateTab('pipeline');
        return;
      }

      // 7. Cmd+S or Ctrl+S: Switch to News Sources Engine (prevents browser Save Page dialog)
      if (isModifierActive && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        onNavigateTab('sources');
        return;
      }

      // 8. Cmd+1 or Ctrl+1: Switch to Live Newsroom
      if (isModifierActive && e.key === '1') {
        e.preventDefault();
        e.stopPropagation();
        onNavigateTab('newsroom');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac, onOpenCommandPalette, onNavigateTab, onOpenShortcutsHelp, onCloseModals]);

  return { isMac };
}
