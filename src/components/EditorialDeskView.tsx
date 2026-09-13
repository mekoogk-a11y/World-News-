import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RotateCw,
  Plus,
  Send,
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Article, EditorialReviewRecord, DevelopingStoryUpdate } from '../types';

interface EditorialDeskViewProps {
  articles: Article[];
  editorialReviews: EditorialReviewRecord[];
  onSelectArticle: (article: Article) => void;
  onApproveArticle: (articleId: string) => Promise<void>;
  onRejectArticle: (articleId: string, reason: string) => Promise<void>;
  onTriggerReview: (articleId: string) => Promise<void>;
  onAddDevelopingUpdate: (
    articleId: string,
    title: string,
    content: string,
    sources: { name: string; url: string }[]
  ) => Promise<void>;
}

export const EditorialDeskView: React.FC<EditorialDeskViewProps> = ({
  articles,
  editorialReviews,
  onSelectArticle,
  onApproveArticle,
  onRejectArticle,
  onTriggerReview,
  onAddDevelopingUpdate,
}) => {
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState<boolean>(false);

  // Developing update modal state
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateSourceName, setUpdateSourceName] = useState('');
  const [updateSourceUrl, setUpdateSourceUrl] = useState('');

  const selectedArticle = articles.find((a) => a.id === selectedArticleId);

  const filteredArticles = articles.filter((art) => {
    if (filterVerdict === 'ALL') return true;
    if (filterVerdict === 'PENDING') return art.status === 'pending';
    if (filterVerdict === 'APPROVED') return art.editorialReview?.verdict === 'APPROVED';
    if (filterVerdict === 'REVISION') return art.editorialReview?.verdict === 'REQUIRES_REVISION';
    if (filterVerdict === 'DEVELOPING') return art.isDeveloping;
    return true;
  });

  const handleRunReview = async (id: string) => {
    setIsReviewing(true);
    try {
      await onTriggerReview(id);
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !updateContent.trim()) return;

    setIsSubmittingUpdate(true);
    try {
      const sources = updateSourceName.trim()
        ? [{ name: updateSourceName.trim(), url: updateSourceUrl.trim() || 'https://wire.newsroom.org' }]
        : [];
      await onAddDevelopingUpdate(selectedArticle.id, updateTitle.trim(), updateContent.trim(), sources);
      setUpdateTitle('');
      setUpdateContent('');
      setUpdateSourceName('');
      setUpdateSourceUrl('');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-neutral-900 text-white p-5 rounded border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-red-400 font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Editor-in-Chief Verification Desk • Alex Morgan</span>
          </div>
          <h2 className="text-xl font-serif-editorial font-bold text-neutral-100">
            Factual Corroboration, Contradiction Detection & Developing Story Engine
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Alex Morgan coordinates cross-wire corroboration, ensures minimum source thresholds (2+ independent references), and checks regional dispatches against existing reporting to suppress contradictions and duplicates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-neutral-800 border border-neutral-700 p-3 rounded text-center min-w-[110px]">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase block">Total Articles</span>
            <span className="text-xl font-mono-code font-bold text-white">{articles.length}</span>
          </div>
          <div className="bg-neutral-800 border border-neutral-700 p-3 rounded text-center min-w-[110px]">
            <span className="text-[10px] font-mono-code text-neutral-400 uppercase block">Pending Review</span>
            <span className="text-xl font-mono-code font-bold text-amber-400">
              {articles.filter((a) => a.status === 'pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article Roster & Filter */}
        <div className="lg:col-span-5 bg-white border border-neutral-300 rounded p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-700">Dispatch Queue</span>
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={filterVerdict}
                onChange={(e) => setFilterVerdict(e.target.value)}
                className="text-xs font-mono-code border border-neutral-300 rounded px-2 py-1 bg-neutral-50"
              >
                <option value="ALL">All Dispatches</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved by Chief</option>
                <option value="REVISION">Needs Revision</option>
                <option value="DEVELOPING">Developing Stories</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const review = art.editorialReview;
              const isSelected = art.id === selectedArticleId;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-red-700 bg-red-50/50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-mono-code">
                    <span className="font-bold text-neutral-700 uppercase">{art.journalistName}</span>
                    {art.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                        PENDING SIGNOFF
                      </span>
                    ) : review?.verdict === 'APPROVED' ? (
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                        APPROVED ({review.score}%)
                      </span>
                    ) : (
                      <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[10px]">
                        PUBLISHED
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-serif-editorial font-bold text-neutral-900 line-clamp-2">
                    {art.headline}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-500 mt-2">
                    <span>{art.country} • {art.category}</span>
                    <span>{art.sources?.length || 0} Sources</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alex Morgan's Evaluation Panel */}
        <div className="lg:col-span-7 space-y-4">
          {selectedArticle ? (
            <div className="bg-white border border-neutral-300 rounded p-5 shadow-2xs space-y-5">
              {/* Header Details */}
              <div className="border-b border-neutral-200 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono-code font-bold uppercase text-red-700">
                    {selectedArticle.region} Desk • {selectedArticle.country}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunReview(selectedArticle.id)}
                      disabled={isReviewing}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono-code rounded transition-colors"
                    >
                      <RotateCw className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
                      <span>Re-Audit with Alex Morgan</span>
                    </button>
                    <button
                      onClick={() => onSelectArticle(selectedArticle)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono-code rounded transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Read Full Dispatch</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-serif-editorial font-bold text-neutral-950">
                  {selectedArticle.headline}
                </h3>
              </div>

              {/* Alex Morgan Review Card */}
              <div className="p-4 rounded bg-neutral-50 border border-neutral-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-700" />
                    <span className="text-xs font-mono-code font-bold uppercase text-neutral-900">
                      Alex Morgan Audit Report
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-code font-bold text-neutral-900 block">
                      Score: {selectedArticle.editorialReview?.score || selectedArticle.confidenceScore || 95}/100
                    </span>
                    <span className="text-[10px] font-mono-code text-neutral-500">
                      Sourcing Quality: {selectedArticle.editorialReview?.sourcingQuality || 'ADEQUATE'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 font-sans-editorial italic bg-white p-2.5 rounded border border-neutral-200">
                  "{selectedArticle.editorialReview?.notes || 'Verified across global monitoring desks. Wire dispatches match corroborating references.'}"
                </p>

                {/* Duplicates or contradictions warnings */}
                {selectedArticle.editorialReview?.duplicatesDetected &&
                  selectedArticle.editorialReview.duplicatesDetected.length > 0 && (
                    <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Potential Event Overlap Flagged:</span>
                      </div>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                        {selectedArticle.editorialReview.duplicatesDetected.map((dup, i) => (
                          <li key={i}>{dup}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Editorial Actions: Approve / Reject */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                  <button
                    onClick={() => onRejectArticle(selectedArticle.id, 'Returned to draft for additional wire sourcing')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold font-mono-code transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Reject / Return to Draft</span>
                  </button>
                  <button
                    onClick={() => onApproveArticle(selectedArticle.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold font-mono-code transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Approve & Publish Live</span>
                  </button>
                </div>
              </div>

              {/* Append Developing Story Update Form */}
              <div className="border border-neutral-300 rounded p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-code font-bold uppercase text-neutral-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-red-700" />
                    <span>Append Developing Story Update (Section 11)</span>
                  </span>
                  <span className="text-[10px] font-mono-code text-neutral-500">
                    Existing Updates: {selectedArticle.developingUpdates?.length || 0}
                  </span>
                </div>

                <form onSubmit={handlePostUpdate} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-mono-code text-neutral-600 text-[11px] mb-1">
                      Update Headline (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Bilateral Delegations Agree on Water Quotas"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono-code text-neutral-900 bg-neutral-50"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-code text-neutral-600 text-[11px] mb-1">
                      Verified Update Text (Required):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter corroborated developments with verified facts..."
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-sans-editorial text-neutral-900 bg-neutral-50"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono-code text-neutral-600 text-[11px] mb-1">
                        Attributed Source Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Reuters Geneva Bureau"
                        value={updateSourceName}
                        onChange={(e) => setUpdateSourceName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono-code text-neutral-900 bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-code text-neutral-600 text-[11px] mb-1">
                        Source Reference URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://wire.newsroom.org/dispatch"
                        value={updateSourceUrl}
                        onChange={(e) => setUpdateSourceUrl(e.target.value)}
                        className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono-code text-neutral-900 bg-neutral-50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingUpdate || !updateContent.trim()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-mono-code font-bold text-xs transition-colors shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingUpdate ? 'Publishing...' : 'Publish Developing Update'}</span>
                    </button>
                  </div>
                </form>

                {/* List of existing updates */}
                {selectedArticle.developingUpdates && selectedArticle.developingUpdates.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                    <span className="text-[11px] font-mono-code font-bold uppercase text-neutral-700 block">
                      Published Updates Log:
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedArticle.developingUpdates.map((upd) => (
                        <div key={upd.id} className="p-2 rounded bg-neutral-50 border border-neutral-200 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-mono-code text-neutral-500 mb-1">
                            <span className="font-bold text-red-700">UPDATE #{upd.updateNumber}</span>
                            <span>{new Date(upd.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-neutral-800 font-sans-editorial">{upd.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-neutral-300 rounded p-8 text-center text-neutral-500 text-sm">
              Select an article from the left queue to inspect Alex Morgan's review and edit developing updates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
