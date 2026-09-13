import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Globe2,
  ShieldCheck,
  CheckCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Article, Journalist, Region, NewsCategory, VerificationStatus } from '../types';
import { ArticleCard } from './ArticleCard';

interface AdvancedSearchViewProps {
  articles: Article[];
  journalists: Journalist[];
  onSelectArticle: (article: Article) => void;
}

export const AdvancedSearchView: React.FC<AdvancedSearchViewProps> = ({
  articles,
  journalists,
  onSelectArticle,
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedJournalistId, setSelectedJournalistId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetFilters = () => {
    setKeyword('');
    setSelectedCountry('');
    setSelectedRegion('ALL');
    setSelectedJournalistId('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Keyword
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchesText =
          art.headline.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.fullArticle.toLowerCase().includes(q) ||
          art.keyFacts.some((f) => f.toLowerCase().includes(q)) ||
          art.sources.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Country
      if (selectedCountry.trim()) {
        if (!art.country.toLowerCase().includes(selectedCountry.toLowerCase().trim())) {
          return false;
        }
      }

      // Region
      if (selectedRegion !== 'ALL') {
        if (art.region.toLowerCase() !== selectedRegion.toLowerCase()) return false;
      }

      // Journalist
      if (selectedJournalistId !== 'ALL') {
        if (art.journalistId !== selectedJournalistId) return false;
      }

      // Category
      if (selectedCategory !== 'ALL') {
        if (art.category !== selectedCategory) return false;
      }

      // Verification Status
      if (selectedStatus !== 'ALL') {
        if (art.verificationStatus !== selectedStatus) return false;
      }

      // Date Range
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (new Date(art.published_at).getTime() < start) return false;
      }

      if (endDate) {
        // include entire end day
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        if (new Date(art.published_at).getTime() > end) return false;
      }

      return true;
    });
  }, [
    articles,
    keyword,
    selectedCountry,
    selectedRegion,
    selectedJournalistId,
    selectedCategory,
    selectedStatus,
    startDate,
    endDate,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Masthead */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>Structured Intelligence Search</span>
        </div>
        <h2 className="font-display-editorial text-2xl sm:text-3xl font-bold text-slate-100">
          Advanced Multi-Parameter News Search
        </h2>
        <p className="text-xs text-slate-400 font-serif-editorial italic mt-1 max-w-2xl">
          Query cross-referenced dispatches by keyword, sovereign jurisdiction, correspondent desk, verification tier, and historical date range.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search by topic, entity, quote, agency, or key fact..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full pl-12 pr-28 py-3 rounded-xl bg-[#0f141c] border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 text-sm shadow-inner"
        />
        <div className="absolute right-3.5 top-3 flex items-center gap-2">
          {keyword ? (
            <button
              onClick={() => setKeyword('')}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-code text-slate-500 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded">
              <kbd className="text-amber-400 font-bold">⌘K</kbd> Global Palette
            </span>
          )}
        </div>
      </div>

      {/* Multi-Parameter Filters Grid */}
      <div className="p-5 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono-code uppercase">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Search Parameters & Boolean Filters</span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-mono-code transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {/* Region */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              Geographic Region:
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Regions</option>
              <option value="Americas">Americas</option>
              <option value="Europe">Europe</option>
              <option value="Africa">Africa</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="Middle East">Middle East</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              Country or State:
            </label>
            <input
              type="text"
              placeholder="e.g. United States, Sudan, France"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              Subject Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="WORLD">World</option>
              <option value="POLITICS">Politics</option>
              <option value="BUSINESS">Business</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="SCIENCE">Science</option>
              <option value="HEALTH">Health</option>
              <option value="ENVIRONMENT">Environment</option>
              <option value="SPORTS">Sports</option>
            </select>
          </div>

          {/* AI Journalist */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              Correspondent Desk:
            </label>
            <select
              value={selectedJournalistId}
              onChange={(e) => setSelectedJournalistId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Correspondents</option>
              {(journalists || []).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              Verification Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED (Multi-corroborated)</option>
              <option value="DEVELOPING">DEVELOPING (Ongoing wire update)</option>
              <option value="ANALYSIS">ANALYSIS (Deep context)</option>
              <option value="UNCONFIRMED">UNCONFIRMED</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              From Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden font-mono-code"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-400 font-mono-code text-[11px] mb-1">
              To Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden font-mono-code"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-display-editorial text-sm font-bold tracking-wider text-slate-300 uppercase">
          Search Results ({filteredArticles.length} Dispatches Found)
        </h3>
        <span className="text-[11px] font-mono-code text-slate-500">
          Zero-hallucination verified index
        </span>
      </div>

      {/* Results Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
          <Search className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="font-bold text-base text-slate-200">No Dispatches Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No verified articles match the current combination of search parameters. Try expanding your keyword or resetting the date/region filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
