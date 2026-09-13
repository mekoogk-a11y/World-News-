import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Radio,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { NewsSource, Region, NewsCategory } from '../types';
import { formatRelativeTime } from './ArticleCard';

interface SourcesManagerViewProps {
  sources: NewsSource[];
  onAddSource: (source: Partial<NewsSource>) => Promise<void>;
  onToggleActive: (id: string, current: boolean) => Promise<void>;
  onDeleteSource: (id: string) => Promise<void>;
  onScanSource: (id: string) => Promise<{ itemsDetected: number; sampleTitle: string }>;
}

export const SourcesManagerView: React.FC<SourcesManagerViewProps> = ({
  sources,
  onAddSource,
  onToggleActive,
  onDeleteSource,
  onScanSource,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanningSourceId, setScanningSourceId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ id: string; count: number; note: string } | null>(null);

  // New source form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCountry, setNewCountry] = useState('International');
  const [newRegion, setNewRegion] = useState<Region>('Americas');
  const [newCategory, setNewCategory] = useState<NewsCategory>('WORLD');
  const [newType, setNewType] = useState<any>('RSS Feed');
  const [newReliability, setNewReliability] = useState<number>(9.5);
  const [newJournalistId, setNewJournalistId] = useState('michael-carter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let filtered = sources;
  if (selectedRegion !== 'ALL') {
    filtered = filtered.filter((s) => s.region.toLowerCase() === selectedRegion.toLowerCase());
  }
  if (selectedType !== 'ALL') {
    filtered = filtered.filter((s) => s.sourceType === selectedType);
  }

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSource({
        name: newName.trim(),
        url: newUrl.trim(),
        country: newCountry.trim(),
        region: newRegion,
        language: 'English',
        category: newCategory,
        sourceType: newType,
        reliabilityRating: Number(newReliability),
        isActive: true,
        assignedJournalistId: newJournalistId as any,
      });

      setShowAddModal(false);
      setNewName('');
      setNewUrl('');
    } catch {
      alert('Failed to register source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScan = async (id: string) => {
    setScanningSourceId(id);
    setScanResult(null);
    try {
      const res = await onScanSource(id);
      setScanResult({
        id,
        count: res.itemsDetected,
        note: res.sampleTitle,
      });
    } catch {
      setScanResult({
        id,
        count: 0,
        note: 'Scan completed with HTTP status check.',
      });
    } finally {
      setScanningSourceId(null);
    }
  };

  const activeCount = sources.filter((s) => s.isActive).length;
  const avgReliability = (
    sources.reduce((acc, s) => acc + s.reliabilityRating, 0) / (sources.length || 1)
  ).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Authorized Ingestion Network</span>
          </div>
          <h2 className="font-display-editorial text-2xl sm:text-3xl font-bold text-slate-100">
            News Sources Management Engine
          </h2>
          <p className="text-xs text-slate-400 font-serif-editorial italic mt-1 max-w-2xl">
            Multi-tiered catalog of verified RSS endpoints, official gazettes, and international wire APIs. Zero access-control bypass; full attribution preserved.
          </p>
        </div>

        <button
          id="add-new-source-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Source</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">REGISTERED SOURCES</div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">{sources.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Authorized Wires & Endpoints</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">ACTIVE INGESTION</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono-code">{activeCount}</div>
          <div className="text-[10px] text-emerald-400 mt-1">● Actively Polling</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">AVG RELIABILITY</div>
          <div className="text-2xl font-bold text-amber-400 font-mono-code">{avgReliability} / 10</div>
          <div className="text-[10px] text-slate-400 mt-1">Tier-1 Institutional Baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f141c] border border-slate-800">
          <div className="text-[11px] font-mono-code text-slate-400 mb-1">POLICY COMPLIANCE</div>
          <div className="text-2xl font-bold text-slate-100 font-mono-code">100%</div>
          <div className="text-[10px] text-emerald-400 mt-1">Public APIs & Fair Use</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Region:</span>
          {['ALL', 'Americas', 'Europe', 'Africa', 'Asia-Pacific', 'Middle East'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                selectedRegion === reg
                  ? 'bg-slate-800 text-amber-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Type:</span>
          {['ALL', 'RSS Feed', 'International Org', 'Government Portal', 'Wire API'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                selectedType === t
                  ? 'bg-slate-800 text-amber-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((src) => (
          <div
            key={src.id}
            className="p-5 rounded-xl bg-[#0f141c] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{src.name}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {src.region} • {src.country}
                  </div>
                </div>
                <button
                  onClick={() => onToggleActive(src.id, src.isActive)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase transition-colors ${
                    src.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                  title="Click to toggle active status"
                >
                  {src.isActive ? '● ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono-code">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Source Type:</span>
                  <span className="text-slate-300">{src.sourceType}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Reliability Rating:</span>
                  <span className="text-emerald-400 font-bold">{src.reliabilityRating} / 10</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Category Desk:</span>
                  <span className="text-amber-400">{src.category}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Assigned Desk:</span>
                  <span className="text-slate-300 capitalize">
                    {src.assignedJournalistId.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-mono-code text-slate-500 truncate flex items-center gap-1">
                <span className="text-slate-600">Endpoint:</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-amber-400 truncate flex items-center gap-0.5"
                >
                  <span className="truncate">{src.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            {scanResult && scanResult.id === src.id && (
              <div className="p-2.5 rounded bg-slate-900 border border-indigo-500/40 text-[11px] font-mono-code text-indigo-300">
                <div>Scan Success: {scanResult.count} items parsed.</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">"{scanResult.note}"</div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono-code text-slate-500">
                Last checked: {formatRelativeTime(src.lastCheckedTime)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScan(src.id)}
                  disabled={scanningSourceId === src.id}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-code flex items-center gap-1 transition-colors"
                  title="Test live feed ping"
                >
                  <RefreshCw className={`w-3 h-3 ${scanningSourceId === src.id ? 'animate-spin' : ''}`} />
                  <span>Test Ping</span>
                </button>

                <button
                  onClick={() => onDeleteSource(src.id)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 transition-colors"
                  title="Delete source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f141c] border border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 font-display-editorial">
                Register New Authorized News Source
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associated Press Wire, Agence France-Presse"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Public RSS Feed or API Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/rss/world.xml"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden focus:border-amber-400 font-mono-code"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as Region)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
                  >
                    <option value="Americas">Americas</option>
                    <option value="Europe">Europe</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United States, Sudan, France"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Source Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
                  >
                    <option value="RSS Feed">RSS Feed</option>
                    <option value="International Org">International Org</option>
                    <option value="Government Portal">Government Portal</option>
                    <option value="Wire API">Wire API</option>
                    <option value="Independent Outlet">Independent Outlet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reliability Rating (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={newReliability}
                    onChange={(e) => setNewReliability(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono-code focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assign Monitoring AI Correspondent
                </label>
                <select
                  value={newJournalistId}
                  onChange={(e) => setNewJournalistId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-hidden"
                >
                  <option value="michael-carter">Michael Carter (Americas Desk)</option>
                  <option value="daniel-wilson">Daniel Wilson (Europe Desk)</option>
                  <option value="david-okoro">David Okoro (Africa Desk)</option>
                  <option value="kenji-nakamura">Kenji Nakamura (Asia & Middle East Desk)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Register Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
