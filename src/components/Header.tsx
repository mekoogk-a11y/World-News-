import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  X,
  Radio,
  SlidersHorizontal,
  Archive,
  Tv,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Languages,
  HardHat,
  Activity,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { Article, YouTubeVideo, SupportedLanguage, User } from '../types';
import { LANGUAGES, TranslationDictionary } from '../i18n';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  breakingArticles: Article[];
  breakingVideos: YouTubeVideo[];
  onSelectArticle: (article: Article) => void;
  onSelectVideo?: (video: YouTubeVideo) => void;
  onOpenSearch: () => void;
  onOpenPipelineRun: () => void;
  isIngesting: boolean;
  activeLiveBroadcast?: YouTubeVideo | null;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onNavigateHome: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  systemStatus?: 'live' | 'delayed';
  currentUser?: User | null;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  breakingArticles,
  breakingVideos,
  onSelectArticle,
  onSelectVideo,
  onOpenSearch,
  onOpenPipelineRun,
  isIngesting,
  activeLiveBroadcast,
  currentLanguage,
  onLanguageChange,
  t,
  onNavigateBack,
  onNavigateForward,
  onNavigateHome,
  canGoBack = true,
  canGoForward = false,
  systemStatus = 'live',
  currentUser,
  onOpenLogin,
}) => {
  const [utcTime, setUtcTime] = useState('');
  const [localDate, setLocalDate] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Time & Date synchronization
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().replace('GMT', 'UTC')
      );
      setLocalDate(
        now.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [currentLanguage]);

  // Close language menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation shortcuts (Alt+Left for back, Alt+Right for forward)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigateBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigateForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateBack, onNavigateForward]);

  const navItems: { id: string; label: string; icon?: any; isLiveBadge?: boolean; isSubtle?: boolean; isSpecial?: boolean }[] = [
    { id: 'home', label: t.navHome },
    { id: 'world', label: t.navWorld },
    { id: 'middle-east', label: t.navMiddleEast || 'الشرق الأوسط' },
    { id: 'contracting', label: t.navContracting || 'المقاولات', icon: HardHat, isSpecial: true },
    { id: 'africa', label: t.navAfrica },
    { id: 'asia', label: t.navAsia },
    { id: 'europe', label: t.navEurope },
    { id: 'americas', label: t.navAmericas },
    { id: 'politics', label: t.navPolitics },
    { id: 'business', label: t.navBusiness },
    { id: 'technology', label: t.navTechnology },
    { id: 'sports', label: t.navSports },
    { id: 'video', label: t.navVideo, icon: Tv },
    { id: 'live', label: t.navLive, isLiveBadge: true },
    { id: 'archive', label: t.navArchive, icon: Archive },
    { id: 'system-health', label: t.navSystemHealth || 'صحة النظام', icon: Activity },
    { id: 'admin', label: t.navAdmin, isSubtle: true },
  ];

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[1];

  return (
    <header id="newsroom-main-header" className="border-b border-neutral-200 bg-white sticky top-0 z-40 select-none shadow-xs">
      {/* 1. TOP UTILITY STRIP */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6 py-1.5 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Dateline, Times & Live Wire Status */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Status indicator badge (Section 6) */}
            {systemStatus === 'live' ? (
              <div
                id="system-status-live"
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono-code font-bold tracking-wider"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>{t.liveNowBadge}</span>
              </div>
            ) : (
              <div
                id="system-status-delayed"
                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-mono-code font-bold tracking-wider"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>{t.updateDelayedBadge}</span>
              </div>
            )}

            <span className="text-neutral-300">|</span>

            {/* Date and Times */}
            <span className="font-serif-editorial text-neutral-700 hidden md:inline">
              {localDate}
            </span>

            <span className="text-neutral-300 hidden md:inline">|</span>

            <div className="flex items-center gap-1 font-mono-code text-neutral-500 text-[11px]">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{utcTime || 'UTC 00:00:00'}</span>
            </div>

            {/* Verification Guarantee */}
            <span className="text-neutral-300 hidden xl:inline">|</span>
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-neutral-600 font-sans-editorial">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>100% Corroborated Wire Service</span>
            </div>
          </div>

          {/* Right: History Navigation, Language Switcher, Search */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* History Back/Forward Controls (Section 7) */}
            <div className="flex items-center bg-white border border-neutral-300 rounded shadow-2xs divide-x divide-neutral-200">
              <button
                onClick={onNavigateBack}
                disabled={!canGoBack}
                title="Back (Alt+Left)"
                aria-label={t.back}
                className={`p-1.5 hover:bg-neutral-100 transition-colors ${!canGoBack ? 'opacity-40 cursor-not-allowed' : 'text-neutral-700 cursor-pointer'}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateHome}
                title={t.returnToFirstPage}
                aria-label={t.returnToFirstPage}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateForward}
                disabled={!canGoForward}
                title="Forward (Alt+Right)"
                aria-label={t.forward}
                className={`p-1.5 hover:bg-neutral-100 transition-colors ${!canGoForward ? 'opacity-40 cursor-not-allowed' : 'text-neutral-700 cursor-pointer'}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Selector (11 Languages - Section 20) */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="language-selector-button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 bg-white border border-neutral-300 px-2 py-1 rounded text-xs font-sans-editorial font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen}
              >
                <Languages className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-semibold">{currentLangObj.nativeName}</span>
                <span className="text-[10px] uppercase font-mono-code text-neutral-400">({currentLangObj.code})</span>
              </button>

              {isLangMenuOpen && (
                <div
                  id="language-dropdown"
                  className="absolute right-0 mt-1 w-48 bg-white border border-neutral-300 rounded shadow-lg py-1 z-50 divide-y divide-neutral-100 text-xs"
                >
                  <div className="px-3 py-1.5 text-[11px] font-mono-code text-neutral-400 uppercase tracking-wider">
                    Select Language / اللغة
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 transition-colors ${
                          currentLanguage === lang.code ? 'bg-neutral-100 font-bold text-red-700' : 'text-neutral-800'
                        }`}
                      >
                        <span className="font-medium">{lang.nativeName}</span>
                        <span className="text-[10px] font-mono-code text-neutral-400 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Super Admin Login / Profile Trigger */}
            <button
              onClick={onOpenLogin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                currentUser
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
              }`}
              title={currentUser ? `مسجل كمدير رئيسي: ${currentUser.email}` : 'تسجيل دخول الإدارة'}
            >
              <Shield className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-700' : 'text-neutral-500'}`} />
              <span className="hidden sm:inline">
                {currentUser ? 'المدير الرئيسي' : 'دخول الإدارة'}
              </span>
            </button>

            {/* Search Trigger */}
            <button
              id="header-search-button"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 px-2.5 py-1 rounded text-xs text-neutral-700 font-medium transition-colors"
              title="Search (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-600" />
              <span className="hidden sm:inline">{t.searchButton}</span>
              <kbd className="hidden lg:inline text-[10px] font-mono-code bg-white border border-neutral-300 px-1 rounded text-neutral-500">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-700 hover:bg-neutral-200 rounded"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL NEWSPAPER MASTHEAD */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Sub-brand / Bureau tag */}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-widest text-neutral-500">
              {currentLanguage === 'ar'
                ? 'صحيفة دولية مستقلة • تأسست 2026'
                : 'EST. 2026 • INDEPENDENT DIGITAL WIRE'}
            </span>
            <span className="text-xs text-neutral-600 font-serif-editorial italic">
              {currentLanguage === 'ar'
                ? 'الرياض • القاهرة • دبي • لندن • واشنطن • باريس'
                : 'Riyadh • Cairo • Dubai • London • Washington • Paris'}
            </span>
          </div>

          {/* Center Brand Name & Slogan */}
          <div className="text-center flex flex-col items-center">
            <button
              onClick={onNavigateHome}
              className="group focus:outline-hidden"
              aria-label={t.brandName}
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif-editorial font-black tracking-tight text-neutral-950 uppercase group-hover:text-red-800 transition-colors">
                {t.brandName}
              </h1>
            </button>
            <p className="text-xs sm:text-sm text-neutral-600 font-serif-editorial italic mt-1 max-w-xl">
              {t.tagline}
            </p>
          </div>

          {/* Right Live Broadcast Alert / Tube status */}
          <div className="hidden md:flex flex-col items-end text-right">
            {activeLiveBroadcast ? (
              <button
                onClick={() => setCurrentTab('live')}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              >
                <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="font-mono-code uppercase font-bold">{t.liveNowTitle}</span>
              </button>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono-code text-neutral-400 uppercase tracking-wide">
                  CORRESPONDENT DESKS ACTIVE
                </span>
                <span className="text-xs font-semibold text-neutral-700">
                  4 AI Journalists • 24/7 Multi-Wire Ingestion
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRIMARY HORIZONTAL EDITORIAL NAVIGATION BAR */}
      <nav
        id="primary-navigation-bar"
        className="hidden md:block border-b border-neutral-300 bg-white"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center space-x-1 lg:space-x-2 py-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`px-2.5 lg:px-3 py-2 text-xs font-sans-editorial font-bold tracking-wider uppercase transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                      isActive
                        ? 'border-neutral-900 text-neutral-950 bg-neutral-50'
                        : 'border-transparent text-neutral-700 hover:text-neutral-950 hover:border-neutral-400'
                    } ${
                      item.isSpecial
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        : ''
                    } ${item.isSubtle ? 'text-neutral-500 hover:text-neutral-800' : ''}`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{item.label}</span>
                    {item.isSpecial && (
                      <span className="rounded bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 font-bold">
                        تخصصي
                      </span>
                    )}
                    {item.isLiveBadge && (
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ingestion Pipeline Fast Action */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-neutral-200">
              <button
                onClick={onOpenPipelineRun}
                disabled={isIngesting}
                className="text-[11px] font-mono-code font-bold uppercase text-neutral-600 hover:text-red-700 flex items-center gap-1 py-1 px-2 border border-dashed border-neutral-300 rounded hover:border-neutral-400 transition-colors"
                title="Run Multi-Source Ingestion Engine"
              >
                <SlidersHorizontal className="w-3 h-3 text-neutral-500" />
                <span>{isIngesting ? 'Ingesting...' : 'Run Pipeline'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE SLIDEOUT DRAWER */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-white border-b border-neutral-300 shadow-xl py-3 px-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider ${
                  currentTab === item.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenPipelineRun();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-mono-code font-bold bg-neutral-800 text-white px-3 py-2 rounded"
            >
              {isIngesting ? 'Pipeline Running...' : 'Execute Wire Pipeline'}
            </button>
            <button
              onClick={() => {
                onOpenSearch();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-mono-code bg-neutral-200 text-neutral-800 px-3 py-2 rounded"
            >
              Advanced Search
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
