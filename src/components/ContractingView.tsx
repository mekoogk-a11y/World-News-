import React, { useState, useEffect } from 'react';
import {
  Building2,
  HardHat,
  MapPin,
  Calendar,
  User as UserIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Share2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Briefcase,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { ContractingArticle, User } from '../types';
import { TranslationDictionary } from '../i18n';

interface ContractingViewProps {
  currentUser: User | null;
  t: TranslationDictionary;
  onOpenLogin: () => void;
}

export const ContractingView: React.FC<ContractingViewProps> = ({
  currentUser,
  t,
  onOpenLogin,
}) => {
  const [articles, setArticles] = useState<ContractingArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ContractingArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    introduction: '',
    content: '',
    author: 'المدير التحريري للمقاولات',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    contractingType: 'بنية تحتية',
    company: '',
    keywords: '',
    status: 'Published' as 'Published' | 'Draft',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch contracting articles from API
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contracting?status=all');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch contracting articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
      introduction: '',
      content: '',
      author: currentUser?.name || 'المدير التحريري للمقاولات',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      contractingType: 'بنية تحتية',
      company: '',
      keywords: 'مقاولات, بنية تحتية, مشاريع',
      status: 'Published',
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (article: ContractingArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      imageUrl: article.imageUrl,
      introduction: article.introduction,
      content: article.content,
      author: article.author,
      country: article.country,
      city: article.city,
      contractingType: article.contractingType,
      company: article.company || '',
      keywords: article.keywords.join(', '),
      status: article.status,
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.introduction || !formData.content) {
      setFormError('يرجى ملء كافة الحقول الأساسية: العنوان والمقدمة والمحتوى.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const token = localStorage.getItem('admin_token');

    const payload = {
      ...formData,
      keywords: formData.keywords.split(/[,،]+/).map((k) => k.trim()).filter(Boolean),
    };

    try {
      const url = editingId ? `/api/contracting/${editingId}` : '/api/contracting';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'فشل حفظ مقال المقاولات.');
      }

      setIsEditorOpen(false);
      await fetchArticles();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً من قاعدة البيانات؟')) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/contracting/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (selectedArticle?.id === id) setSelectedArticle(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Types list
  const contractingTypes = [
    { id: 'ALL', label: 'كافة التخصصات' },
    { id: 'بنية تحتية', label: 'بنية تحتية' },
    { id: 'طرق وجسور', label: 'طرق ونقل' },
    { id: 'طاقة ومرافق', label: 'طاقة وكهرباء' },
    { id: 'مياه وصرف صحي', label: 'مياه وبيئة' },
    { id: 'موانئ ومطارات', label: 'موانئ ومطارات' },
    { id: 'عقارات وأبراج', label: 'أبراج وإنشاءات' },
    { id: 'مدن ذكية', label: 'مدن ذكية' },
  ];

  // Filtering
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      !searchQuery ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.introduction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.company && art.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === 'ALL' || art.contractingType.toLowerCase().includes(selectedType.toLowerCase());

    const matchesCountry =
      selectedCountry === 'ALL' || art.country.toLowerCase().includes(selectedCountry.toLowerCase());

    return matchesSearch && matchesType && matchesCountry;
  });

  const countries = Array.from(new Set(articles.map((a) => a.country))).filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 font-sans-editorial text-neutral-900" dir="rtl">
      {/* Editorial Header & Masthead for Contracting */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  <HardHat className="h-3.5 w-3.5 text-amber-700" />
                  قسم تخصصي مستقل
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  تحرير بشري يدوي 100% • خالٍ تماماً من الذكاء الاصطناعي
                </span>
              </div>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
                {t.contractingTitle || 'قسم المقاولات والمشاريع الكبرى'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
                {t.contractingSubtitle ||
                  'تغطية صحفية متخصصة ومستقلة لعقود البنية التحتية، الإنشاءات المدنية، الطاقة المتجددة، المدن الذكية ومشاريع التطوير الاستراتيجية.'}
              </p>
            </div>

            {/* Actions for Admin */}
            <div className="flex items-center gap-3 shrink-0">
              {currentUser ? (
                <button
                  onClick={openNewModal}
                  className="flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-900 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  إضافة مقال مقاولات
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
                >
                  <Briefcase className="h-4 w-4 text-neutral-500" />
                  تسجيل دخول المشرف التحريري
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Strip */}
          <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-t border-neutral-200 pt-5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في العقود، الشركات، المشاريع، أو المدن..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pr-10 pl-4 text-sm text-neutral-900 focus:border-red-800 focus:bg-white focus:outline-hidden"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">الدولة:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 focus:border-red-800 focus:outline-hidden"
              >
                <option value="ALL">كافة الدول</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {contractingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="py-20 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-red-800 border-t-transparent mb-3" />
            <p className="text-sm font-semibold">جاري تحميل تقارير المقاولات الموثقة...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">لا توجد مقالات مقاولات مطابقة</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              لم يتم العثور على مقالات تطابق خيارات البحث الحالية. يمكنك تعديل كلمات البحث أو تصفير الفلاتر.
            </p>
            {currentUser && (
              <button
                onClick={openNewModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900"
              >
                <Plus className="h-4 w-4" />
                إضافة مقال جديد الآن
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                    <span className="rounded bg-neutral-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                      {article.contractingType}
                    </span>
                  </div>
                  {article.company && (
                    <div className="absolute bottom-3 right-3 left-3 flex items-center gap-1.5 rounded bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-800 shadow-xs backdrop-blur-xs">
                      <Briefcase className="h-3 w-3 text-red-800" />
                      <span className="truncate">{article.company}</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-red-900">
                      <MapPin className="h-3 w-3" />
                      {article.city}، {article.country}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="font-serif-editorial text-lg font-bold text-neutral-950 group-hover:text-red-800 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h2>

                  <p className="mt-2 text-xs text-neutral-600 line-clamp-3 leading-relaxed flex-1">
                    {article.introduction}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <UserIcon className="h-3 w-3 text-neutral-400" />
                      {article.author}
                    </span>

                    {/* Admin action buttons */}
                    {currentUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(article);
                          }}
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          title="تعديل المقال"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteArticle(article.id, e)}
                          className="rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-700"
                          title="حذف المقال"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-neutral-900 shadow-2xl"
            dir="rtl"
          >
            {/* Header image banner */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-100">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 left-4 rounded-full bg-neutral-900/80 p-2 text-white hover:bg-neutral-950 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
                <span className="rounded bg-red-800 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {selectedArticle.contractingType}
                </span>
                {selectedArticle.company && (
                  <span className="rounded bg-white/90 px-3 py-1 text-xs font-bold text-neutral-900 shadow-sm backdrop-blur-xs">
                    {selectedArticle.company}
                  </span>
                )}
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-4 pb-4 border-b border-neutral-100">
                <span className="font-bold text-red-800 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedArticle.city}، {selectedArticle.country}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3.5 w-3.5" />
                  المحرر: {selectedArticle.author}
                </span>
                {selectedArticle.viewsCount !== undefined && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono-code">
                      <Eye className="h-3.5 w-3.5" />
                      {selectedArticle.viewsCount} مشاهدة
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif-editorial text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 leading-tight">
                {selectedArticle.title}
              </h1>

              {/* Lead Introduction Box */}
              <div className="mt-6 rounded-xl border-r-4 border-red-800 bg-neutral-50 p-5 text-base sm:text-lg text-neutral-800 font-medium leading-relaxed">
                {selectedArticle.introduction}
              </div>

              {/* Body Content */}
              <div className="mt-8 space-y-5 text-base sm:text-lg text-neutral-800 leading-loose">
                {selectedArticle.content.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Keywords */}
              {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                <div className="mt-10 pt-6 border-t border-neutral-200">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">الكلمات الدلالية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Notice */}
              <div className="mt-8 rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0" />
                <p>
                  هذا التقرير تم إعداده وتوثيقه بواسطة هيئة تحرير قسم المقاولات في "الصحيفة الإلكترونية لأخبار العالم"، معتمد على وثائق وبيانات المناقصات الرسمية.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Article Editor Modal for Super Admin */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-neutral-900 shadow-2xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-amber-600" />
                <h3 className="font-serif-editorial text-lg font-bold">
                  {editingId ? 'تعديل مقال مقاولات' : 'إضافة مقال مقاولات جديد (تحرير يدوي حصري)'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  عنوان المقال *:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: توقيع عقد تنفيذ المرحلة الثانية لقطار الرياض السريع..."
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    نوع المقاولات *:
                  </label>
                  <select
                    value={formData.contractingType}
                    onChange={(e) => setFormData({ ...formData, contractingType: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                  >
                    <option value="بنية تحتية">بنية تحتية</option>
                    <option value="طرق وجسور">طرق وجسور</option>
                    <option value="طاقة ومرافق">طاقة ومرافق</option>
                    <option value="مياه وصرف صحي">مياه وصرف صحي</option>
                    <option value="موانئ ومطارات">موانئ ومطارات</option>
                    <option value="عقارات وأبراج">عقارات وأبراج</option>
                    <option value="مدن ذكية">مدن ذكية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الشركة / الجهة المنفذة:
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مثال: تحالف شركة بن لادن وشركة سيمنز..."
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">الدولة *:</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="المملكة العربية السعودية"
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">المدينة *:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="الرياض"
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">المحرر / الكاتب *:</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">رابط صورة المقال:</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden font-mono-code"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">مقدمة المقال (Lead) *:</label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  rows={3}
                  placeholder="موجز صحفي مركّز حول المشروع والقيمة الاستثمارية وتفاصيل الإنجاز..."
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  المحتوى التفصيلي للمقال * (افصل بين الفقرات بسطر فارغ):
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="اكتب التغطية الصحفية الكاملة لعقد المقاولات، الجدول الزمني، المواصفات الهندسية، والشركات الموردة..."
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  الكلمات الدلالية (مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="مقاولات, بنية تحتية, الرياض, استثمار"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold hover:bg-neutral-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-red-800 px-5 py-2 text-xs font-bold text-white hover:bg-red-900 disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ والتوثيق...' : 'نشر المقال فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
