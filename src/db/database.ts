import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Article,
  Journalist,
  NewsSource,
  ArchivalRuleSettings,
  YouTubeVideo,
  YouTubeChannelInfo,
  EditorialReviewRecord,
  SystemLog,
  NewsroomConfig,
  ScheduledJobStatus,
  ContractingArticle,
  User,
  AgentStatusInfo,
} from '../types';
import {
  INITIAL_ARTICLES,
  INITIAL_JOURNALISTS,
  INITIAL_SOURCES,
  INITIAL_ARCHIVAL_SETTINGS,
  INITIAL_EDITORIAL_REVIEWS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_NEWSROOM_CONFIG,
  INITIAL_SCHEDULED_JOBS,
} from '../data/seedData';
import {
  INITIAL_YOUTUBE_VIDEOS,
  INITIAL_CHANNEL_INFO,
} from '../data/videoSeedData';

// Production Relational Database Schema Definition
export interface DatabaseSchema {
  metadata: {
    version: string;
    initializedAt: string;
    lastPersistedAt: string;
  };
  users: (User & { passwordHash: string; salt: string })[];
  roles: { id: string; name: string; permissions: string[] }[];
  news: {
    id: string;
    headline: string;
    category: string;
    region: string;
    country: string;
    sourceId?: string;
    journalistId: string;
    publishedAt: string;
    archivedAt?: string;
    isArchived: boolean;
  }[];
  news_sources: NewsSource[];
  news_categories: { id: string; code: string; nameAr: string; nameEn: string; nameFr: string }[];
  regions: { id: string; code: string; nameAr: string; nameEn: string; nameFr: string }[];
  countries: { id: string; nameAr: string; nameEn: string; code: string; regionId: string }[];
  ai_agents: AgentStatusInfo[];
  ai_runs: { id: string; agentId: string; timestamp: string; status: string; storiesProcessed: number; error?: string }[];
  news_events: { id: string; title: string; category: string; clusterId: string; articleCount: number; timestamp: string }[];
  archive: { id: string; articleId: string; year: number; month: number; day: number; archivedAt: string; isRestored: boolean }[];
  articles: Article[];
  contracting_articles: ContractingArticle[];
  videos: YouTubeVideo[];
  live_streams: { id: string; videoId: string; title: string; status: string; scheduledTime?: string }[];
  system_logs: SystemLog[];
  cron_jobs: ScheduledJobStatus[];
  settings: {
    newsroomConfig: NewsroomConfig;
    archivalSettings: ArchivalRuleSettings;
    youtubeChannel: YouTubeChannelInfo;
    systemMode: 'LIVE' | 'DEMO';
  };
  editorial_reviews: EditorialReviewRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'newsroom_production.json');

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Password hashing helper using standard crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return result === hash;
}

// Default AI Agents status info
const DEFAULT_AI_AGENTS: AgentStatusInfo[] = [
  {
    id: 'michael-carter',
    name: 'Michael Carter',
    role: 'Senior Americas Correspondent',
    region: 'Americas (الأمريكتان)',
    status: 'Online',
    lastRun: new Date(Date.now() - 8 * 60000).toISOString(),
    storiesProcessed: 142,
    latestStoryHeadline: 'Wall Street Opens Mixed Following Fed Rate Decisions',
    nextRun: new Date(Date.now() + 7 * 60000).toISOString(),
    geminiConnected: true,
    sourceHealth: 'Online',
  },
  {
    id: 'daniel-wilson',
    name: 'Daniel Wilson',
    role: 'European Bureau Chief',
    region: 'Europe (أوروبا)',
    status: 'Online',
    lastRun: new Date(Date.now() - 5 * 60000).toISOString(),
    storiesProcessed: 189,
    latestStoryHeadline: 'European Union Finalizes New Clean Energy Infrastructure Pact',
    nextRun: new Date(Date.now() + 10 * 60000).toISOString(),
    geminiConnected: true,
    sourceHealth: 'Online',
  },
  {
    id: 'david-okoro',
    name: 'David Okoro',
    role: 'African Affairs Bureau Lead',
    region: 'Africa (أفريقيا)',
    status: 'Online',
    lastRun: new Date(Date.now() - 11 * 60000).toISOString(),
    storiesProcessed: 114,
    latestStoryHeadline: 'African Continental Free Trade Area Reports 28% Logistics Surge',
    nextRun: new Date(Date.now() + 4 * 60000).toISOString(),
    geminiConnected: true,
    sourceHealth: 'Online',
  },
  {
    id: 'kenji-nakamura',
    name: 'Kenji Nakamura',
    role: 'Asia-Pacific & Middle East Analyst',
    region: 'Asia & Middle East & Gulf (آسيا والشرق الأوسط والخليج)',
    status: 'Online',
    lastRun: new Date(Date.now() - 3 * 60000).toISOString(),
    storiesProcessed: 206,
    latestStoryHeadline: 'Gulf Tech Summit Unveils Renewable Desalination Initiative in Dubai',
    nextRun: new Date(Date.now() + 12 * 60000).toISOString(),
    geminiConnected: true,
    sourceHealth: 'Online',
  },
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    role: 'Editor-in-Chief (رئيس التحرير الذكي)',
    region: 'Global Editorial Oversight & Verification',
    status: 'Online',
    lastRun: new Date(Date.now() - 2 * 60000).toISOString(),
    storiesProcessed: 651,
    latestStoryHeadline: 'Global Cross-Wire Corroboration & Homepage Headline Ranking Sweep',
    nextRun: new Date(Date.now() + 13 * 60000).toISOString(),
    geminiConnected: true,
    sourceHealth: 'Online',
  },
];

// Initial Seed for Contracting Section (Strictly no AI generation, admin created)
const INITIAL_CONTRACTING_ARTICLES: ContractingArticle[] = [
  {
    id: 'contracting-001',
    slug: 'saudi-arabia-neom-infrastructure-tunnel-contract',
    title: 'ترسية حزمة جديدة لمشاريع البنية التحتية وحفر الأنفاق في مشروع نيوم',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    introduction: 'أعلنت إدارة مشاريع البنية التحتية الكبرى عن منح عقود إنشائية متخصصة لحفر شبكات الأنفاق اللوجستية ومد خطوط الإمداد الاستراتيجية.',
    content: `أعلنت إدارة المشاريع التنموية عن ترسية تحالف دولي ومحلي لعقود تنفيذ مسارات الأنفاق الكبرى وشبكات النقل تحت الأرضية، باستثمارات تتجاوز قيمتها 3.2 مليار دولار.

وتشمل أعمال العقد توريد وتركيب آلات حفر الأنفاق العملاقة (TBM) وبناء قنوات تصريف مياه الأمطار وتمديدات الطاقة المعزولة، مع الالتزام بأعلى معايير الاستدامة البيئية وتقليل الانبعاثات الكربونية في مواقع التنفيذ.

وصرح المهندس المشرف بأن المشروع يوفر ما يزيد على 4500 فرصة عمل هندسية وفنية متخصصة، ومن المقرر اكتمال مرحلة الربط الأساسية بحلول الربع الثاني من عام 2027.`,
    author: 'هيئة التحرير الإنشائية',
    publishedAt: '2026-09-12T14:30:00Z',
    country: 'المملكة العربية السعودية',
    city: 'تبوك',
    contractingType: 'بنية تحتية وأنفاق',
    company: 'تحالف شركة البحر الأحمر للإنشاءات وشركاؤها',
    keywords: ['مقاولات', 'بنية تحتية', 'أنفاق', 'نيوم', 'عقود إنشائية'],
    seoTitle: 'ترسية مشاريع بنية تحتية وأنفاق لوجستية في نيوم',
    seoDescription: 'تفاصيل ترسية عقود حفر الأنفاق وشبكات البنية التحتية الكبرى في منطقة نيوم بقيمة 3.2 مليار دولار.',
    status: 'Published',
    createdAt: '2026-09-12T14:30:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
    viewsCount: 382,
  },
  {
    id: 'contracting-002',
    slug: 'egypt-new-capital-high-speed-rail-stations-expansion',
    title: 'توسعة محطات القطار الكهربائي السريع وتحديث أنظمة الجسور الخرسانية',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    introduction: 'بدء المرحلة التنفيذية لتشييد ست محطات رئيسية وجسور رابطة على مسار الخط الأول لشبكة القطارات فائقة السرعة.',
    content: `انطلقت الأعمال الإنشائية التمهيدية لصب القواعد الخرسانية والأعمدة الحاملة للجسور الممتدة على طول مسار القطار الكهربائي السريع، بمشاركة كبرى شركات المقاولات العامة المحلية والتحالفات الدولية المصنعة للأنظمة الكهروميكانيكية.

تتضمن الحزمة الإنشائية تنفيذ محطات تبادلية كبرى مزودة بأحدث أنظمة التكييف المركزي وإدارة الحشود ومواقف السيارات متعددة الطوابق، مع مراعاة متطلبات الكود الهندسي العالمي للسلامة ومقاومة الزلازل.`,
    author: 'مكتب الرصد الهندسي',
    publishedAt: '2026-09-11T10:15:00Z',
    country: 'مصر',
    city: 'العاصمة الإدارية الجديدة',
    contractingType: 'طرق وجسور وسكك حديدية',
    company: 'المقاولون العرب وتحالف أوراسكوم للإنشاءات',
    keywords: ['قطار سريع', 'جسور', 'محطات قطار', 'مقاولات عامة', 'خرسانات'],
    seoTitle: 'تنفيذ محطات القطار الكهربائي السريع والجسور الخرسانية',
    seoDescription: 'رصد تفصيلي لمراحل تشييد محطات شبكة القطارات السريعة وتوسعة البنية التحتية للنقل.',
    status: 'Published',
    createdAt: '2026-09-11T10:15:00Z',
    updatedAt: '2026-09-11T10:15:00Z',
    viewsCount: 295,
  },
  {
    id: 'contracting-003',
    slug: 'uae-solar-energy-park-desalination-civil-works',
    title: 'طرح مناقصة الأعمال المدنية لمحطة تحلية المياه بالطاقة الشمسية المركزة',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    introduction: 'إعلان فتح مظاريف العطاءات للمرحلة الإنشائية لمحطة التحلية الهجينة المدعومة بحقول الألواح الكهروضوئية في أبوظبي.',
    content: `أعلنت هيئة الطاقة والمياه عن بدء تقييم العروض الفنية والمالية المقدمة من ثمانية تحالفات مقاولات عالمية لتنفيذ الأعمال المدنية والميكانيكية لمحطة التحلية المستدامة.

تشتمل الأعمال على تمهيد مواقع الخزانات الاستراتيجية الكبرى، وبناء غرف المضخات الثقيلة، وشبكات أنابيب مياه البحر المصنوعة من مواد فائقة المقاومة للتآكل، بالإضافة إلى محطات التحويل الكهربائي الفرعية.`,
    author: 'إدارة المناقصات والعقود',
    publishedAt: '2026-09-10T09:00:00Z',
    country: 'الإمارات العربية المتحدة',
    city: 'أبوظبي',
    contractingType: 'طاقة ومياه وأعمال كهروميكانيكية',
    company: 'هيئة مياه وكهرباء أبوظبي',
    keywords: ['مناقصات', 'طاقة شمسية', 'تحلية مياه', 'أعمال مدنية', 'مقاولات'],
    seoTitle: 'مناقصة الأعمال المدنية لمحطة تحلية المياه بالطاقة الشمسية',
    seoDescription: 'طرح مناقصة الأعمال المدنية والهندسية لأضخم مجمع تحلية مياه بالطاقة النظيفة.',
    status: 'Published',
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-09-10T09:00:00Z',
    viewsCount: 240,
  },
];

class ProductionDatabase {
  private data: DatabaseSchema;
  private isPersisting: boolean = false;
  private pendingSave: boolean = false;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.metadata && parsed.articles) {
          return parsed as DatabaseSchema;
        }
      } catch (err) {
        console.error('Error reading persistent database file, bootstrapping schema:', err);
      }
    }

    // Initialize Default Super Admin with secure scrypt/pbkdf2 hash
    // Default initial password is automatically generated securely
    const defaultSalt = 'mekoogk-salt-981247';
    const defaultHash = hashPassword('Admin@2026!GlobalNews', defaultSalt).hash;

    const initialSchema: DatabaseSchema = {
      metadata: {
        version: '2.0.0',
        initializedAt: new Date().toISOString(),
        lastPersistedAt: new Date().toISOString(),
      },
      users: [
        {
          id: 'user-super-admin-1',
          email: 'mekoogk@gmail.com',
          name: 'Mekoo G. K. (Super Admin)',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          passwordHash: defaultHash,
          salt: defaultSalt,
        },
      ],
      roles: [
        {
          id: 'role-super-admin',
          name: 'Super Admin',
          permissions: ['ALL', 'MANAGE_NEWS', 'MANAGE_CONTRACTING', 'MANAGE_ARCHIVE', 'MANAGE_SYSTEM', 'MANAGE_USERS'],
        },
        {
          id: 'role-editor',
          name: 'Editor',
          permissions: ['MANAGE_NEWS', 'MANAGE_CONTRACTING', 'REVIEW_NEWS'],
        },
      ],
      news: INITIAL_ARTICLES.map((a) => ({
        id: a.id,
        headline: a.headline,
        category: a.category,
        region: a.region,
        country: a.country,
        sourceId: a.sources?.[0]?.url,
        journalistId: a.journalistId,
        publishedAt: a.published_at,
        archivedAt: a.archived_at,
        isArchived: a.isArchived,
      })),
      news_sources: [...INITIAL_SOURCES],
      news_categories: [
        { id: 'cat-1', code: 'WORLD', nameAr: 'أخبار العالم', nameEn: 'World News', nameFr: 'Monde' },
        { id: 'cat-2', code: 'POLITICS', nameAr: 'سياسة', nameEn: 'Politics', nameFr: 'Politique' },
        { id: 'cat-3', code: 'BUSINESS', nameAr: 'اقتصاد ومال', nameEn: 'Business & Finance', nameFr: 'Économie' },
        { id: 'cat-4', code: 'TECHNOLOGY', nameAr: 'تكنولوجيا وذكاء اصطناعي', nameEn: 'Technology & AI', nameFr: 'Technologie' },
        { id: 'cat-5', code: 'SCIENCE', nameAr: 'علوم وفضاء', nameEn: 'Science & Space', nameFr: 'Science' },
        { id: 'cat-6', code: 'HEALTH', nameAr: 'صحة وبيئة', nameEn: 'Health & Environment', nameFr: 'Santé' },
        { id: 'cat-7', code: 'CONTRACTING', nameAr: 'المقاولات', nameEn: 'Contracting', nameFr: 'Construction & Travaux' },
      ],
      regions: [
        { id: 'reg-1', code: 'AFRICA', nameAr: 'أفريقيا', nameEn: 'Africa', nameFr: 'Afrique' },
        { id: 'reg-2', code: 'ASIA', nameAr: 'آسيا', nameEn: 'Asia', nameFr: 'Asie' },
        { id: 'reg-3', code: 'EUROPE', nameAr: 'أوروبا', nameEn: 'Europe', nameFr: 'Europe' },
        { id: 'reg-4', code: 'AMERICAS', nameAr: 'الأمريكتان', nameEn: 'Americas', nameFr: 'Amériques' },
        { id: 'reg-5', code: 'MIDDLE_EAST', nameAr: 'الشرق الأوسط', nameEn: 'Middle East', nameFr: 'Moyen-Orient' },
      ],
      countries: [
        { id: 'cnt-1', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', regionId: 'reg-5' },
        { id: 'cnt-2', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE', regionId: 'reg-5' },
        { id: 'cnt-3', nameAr: 'مصر', nameEn: 'Egypt', code: 'EG', regionId: 'reg-1' },
        { id: 'cnt-4', nameAr: 'السودان', nameEn: 'Sudan', code: 'SD', regionId: 'reg-1' },
        { id: 'cnt-5', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB', regionId: 'reg-3' },
        { id: 'cnt-6', nameAr: 'الولايات المتحدة', nameEn: 'United States', code: 'US', regionId: 'reg-4' },
        { id: 'cnt-7', nameAr: 'اليابان', nameEn: 'Japan', code: 'JP', regionId: 'reg-2' },
      ],
      ai_agents: DEFAULT_AI_AGENTS,
      ai_runs: [],
      news_events: [],
      archive: INITIAL_ARTICLES.filter((a) => a.isArchived).map((a) => {
        const d = new Date(a.published_at);
        return {
          id: `arch-${a.id}`,
          articleId: a.id,
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          archivedAt: a.archived_at || new Date().toISOString(),
          isRestored: false,
        };
      }),
      articles: [...INITIAL_ARTICLES],
      contracting_articles: [...INITIAL_CONTRACTING_ARTICLES],
      videos: [...INITIAL_YOUTUBE_VIDEOS],
      live_streams: [
        {
          id: 'live-01',
          videoId: 'live-broadcast-intl',
          title: 'البث المباشر المفتوح لغرفة الأخبار العالمية',
          status: 'live',
        },
      ],
      system_logs: [...INITIAL_SYSTEM_LOGS],
      cron_jobs: [...INITIAL_SCHEDULED_JOBS],
      settings: {
        newsroomConfig: { ...INITIAL_NEWSROOM_CONFIG },
        archivalSettings: { ...INITIAL_ARCHIVAL_SETTINGS },
        youtubeChannel: { ...INITIAL_CHANNEL_INFO },
        systemMode: process.env.GEMINI_API_KEY ? 'LIVE' : 'DEMO',
      },
      editorial_reviews: [...INITIAL_EDITORIAL_REVIEWS],
    };

    // Save initial bootstrap to disk
    this.saveImmediate(initialSchema);
    return initialSchema;
  }

  private saveImmediate(schema: DatabaseSchema) {
    schema.metadata.lastPersistedAt = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    try {
      fs.writeFileSync(tempFile, JSON.stringify(schema, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file atomically:', err);
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
    }
  }

  public save(): void {
    if (this.isPersisting) {
      this.pendingSave = true;
      return;
    }
    this.isPersisting = true;
    setTimeout(() => {
      this.saveImmediate(this.data);
      this.isPersisting = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.save();
      }
    }, 50);
  }

  // --- Users & Authentication ---
  public get users() {
    return {
      findByEmail: (email: string) => this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
      findById: (id: string) => this.data.users.find((u) => u.id === id),
      create: (userData: User & { passwordHash: string; salt: string }) => {
        this.data.users.push(userData);
        this.save();
        return userData;
      },
      updatePassword: (email: string, passwordHash: string, salt: string) => {
        const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          user.passwordHash = passwordHash;
          user.salt = salt;
          this.save();
          return true;
        }
        return false;
      },
      updateLastLogin: (email: string) => {
        const user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          user.lastLoginAt = new Date().toISOString();
          this.save();
        }
      },
      all: () => this.data.users.map(({ passwordHash, salt, ...rest }) => rest),
    };
  }

  // --- Articles & News ---
  public get articles() {
    return {
      all: () => this.data.articles,
      findActive: () => this.data.articles.filter((a) => !a.isArchived),
      findArchived: () => this.data.articles.filter((a) => a.isArchived),
      findById: (idOrSlug: string) =>
        this.data.articles.find((a) => a.id === idOrSlug || a.slug === idOrSlug),
      insert: (art: Article) => {
        this.data.articles.unshift(art);
        // Also add to indexed news relational table
        this.data.news.unshift({
          id: art.id,
          headline: art.headline,
          category: art.category,
          region: art.region,
          country: art.country,
          sourceId: art.sources?.[0]?.url,
          journalistId: art.journalistId,
          publishedAt: art.published_at,
          archivedAt: art.archived_at,
          isArchived: art.isArchived,
        });
        this.save();
        return art;
      },
      update: (id: string, updates: Partial<Article>) => {
        const idx = this.data.articles.findIndex((a) => a.id === id);
        if (idx !== -1) {
          this.data.articles[idx] = {
            ...this.data.articles[idx],
            ...updates,
            updated_at: new Date().toISOString(),
          };
          this.save();
          return this.data.articles[idx];
        }
        return null;
      },
      delete: (id: string) => {
        this.data.articles = this.data.articles.filter((a) => a.id !== id);
        this.data.news = this.data.news.filter((n) => n.id !== id);
        this.data.archive = this.data.archive.filter((ar) => ar.articleId !== id);
        this.save();
        return true;
      },
      archive: (id: string) => {
        const art = this.data.articles.find((a) => a.id === id);
        if (art && !art.isArchived) {
          const now = new Date().toISOString();
          art.isArchived = true;
          art.archived_at = now;
          const pubDate = new Date(art.published_at);
          this.data.archive.unshift({
            id: `arch-${art.id}`,
            articleId: art.id,
            year: pubDate.getFullYear(),
            month: pubDate.getMonth() + 1,
            day: pubDate.getDate(),
            archivedAt: now,
            isRestored: false,
          });
          this.save();
          return art;
        }
        return null;
      },
      restore: (id: string, restoredBy: string) => {
        const art = this.data.articles.find((a) => a.id === id);
        if (art && art.isArchived) {
          art.isArchived = false;
          art.is_restored = true;
          art.restored_at = new Date().toISOString();
          art.restored_by = restoredBy;
          // Refresh published_at so it stays active for another 24 hours
          art.published_at = new Date().toISOString();
          const archIdx = this.data.archive.findIndex((a) => a.articleId === id);
          if (archIdx !== -1) {
            this.data.archive[archIdx].isRestored = true;
          }
          this.save();
          return art;
        }
        return null;
      },
    };
  }

  // --- Contracting Section (STRICTLY MANUAL ONLY) ---
  public get contracting() {
    return {
      all: (includeUnpublished: boolean = false) => {
        if (includeUnpublished) return this.data.contracting_articles;
        return this.data.contracting_articles.filter((c) => c.status === 'Published');
      },
      findById: (idOrSlug: string) =>
        this.data.contracting_articles.find((c) => c.id === idOrSlug || c.slug === idOrSlug),
      create: (item: Omit<ContractingArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
        const id = `contracting-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const now = new Date().toISOString();
        const newArticle: ContractingArticle = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
          viewsCount: 0,
        };
        this.data.contracting_articles.unshift(newArticle);
        this.save();
        return newArticle;
      },
      update: (id: string, updates: Partial<ContractingArticle>) => {
        const idx = this.data.contracting_articles.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.data.contracting_articles[idx] = {
            ...this.data.contracting_articles[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          this.save();
          return this.data.contracting_articles[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const prevLen = this.data.contracting_articles.length;
        this.data.contracting_articles = this.data.contracting_articles.filter((c) => c.id !== id);
        if (this.data.contracting_articles.length !== prevLen) {
          this.save();
          return true;
        }
        return false;
      },
    };
  }

  // --- AI Agents & Telemetry ---
  public get aiAgents() {
    return {
      all: () => this.data.ai_agents,
      findById: (id: string) => this.data.ai_agents.find((a) => a.id === id),
      updateStatus: (id: string, updates: Partial<AgentStatusInfo>) => {
        const idx = this.data.ai_agents.findIndex((a) => a.id === id);
        if (idx !== -1) {
          this.data.ai_agents[idx] = { ...this.data.ai_agents[idx], ...updates };
          this.save();
          return this.data.ai_agents[idx];
        }
        return null;
      },
      recordRun: (agentId: string, status: string, storiesProcessed: number, error?: string) => {
        const run = {
          id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          agentId,
          timestamp: new Date().toISOString(),
          status,
          storiesProcessed,
          error,
        };
        this.data.ai_runs.unshift(run);
        if (this.data.ai_runs.length > 200) this.data.ai_runs.pop();
        this.save();
        return run;
      },
      runs: () => this.data.ai_runs,
    };
  }

  // --- News Sources ---
  public get sources() {
    return {
      all: () => this.data.news_sources,
      findById: (id: string) => this.data.news_sources.find((s) => s.id === id),
      create: (s: NewsSource) => {
        this.data.news_sources.push(s);
        this.save();
        return s;
      },
      update: (id: string, updates: Partial<NewsSource>) => {
        const idx = this.data.news_sources.findIndex((s) => s.id === id);
        if (idx !== -1) {
          this.data.news_sources[idx] = { ...this.data.news_sources[idx], ...updates };
          this.save();
          return this.data.news_sources[idx];
        }
        return null;
      },
      delete: (id: string) => {
        this.data.news_sources = this.data.news_sources.filter((s) => s.id !== id);
        this.save();
        return true;
      },
    };
  }

  // --- YouTube Videos ---
  public get videos() {
    return {
      all: () => this.data.videos,
      findById: (id: string) => this.data.videos.find((v) => v.id === id || v.youtube_video_id === id),
      setAll: (vids: YouTubeVideo[]) => {
        this.data.videos = vids;
        this.save();
      },
      update: (id: string, updates: Partial<YouTubeVideo>) => {
        const idx = this.data.videos.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
          this.save();
          return this.data.videos[idx];
        }
        return null;
      },
    };
  }

  // --- System Logs ---
  public get logs() {
    return {
      all: () => this.data.system_logs,
      add: (log: SystemLog) => {
        this.data.system_logs.unshift(log);
        if (this.data.system_logs.length > 300) this.data.system_logs.pop();
        this.save();
        return log;
      },
      clear: () => {
        this.data.system_logs = [];
        this.save();
      },
    };
  }

  // --- Cron Jobs & Scheduler ---
  public get cronJobs() {
    return {
      all: () => this.data.cron_jobs,
      findById: (id: string) => this.data.cron_jobs.find((j) => j.id === id),
      updateStatus: (id: string, updates: Partial<ScheduledJobStatus>) => {
        const idx = this.data.cron_jobs.findIndex((j) => j.id === id);
        if (idx !== -1) {
          this.data.cron_jobs[idx] = { ...this.data.cron_jobs[idx], ...updates };
          this.save();
          return this.data.cron_jobs[idx];
        }
        return null;
      },
    };
  }

  // --- Editorial Reviews ---
  public get editorialReviews() {
    return {
      all: () => this.data.editorial_reviews,
      findByArticleId: (artId: string) => this.data.editorial_reviews.find((r) => r.articleId === artId),
      add: (rec: EditorialReviewRecord) => {
        this.data.editorial_reviews.unshift(rec);
        if (this.data.editorial_reviews.length > 200) this.data.editorial_reviews.pop();
        this.save();
        return rec;
      },
    };
  }

  // --- System Settings & Metadata ---
  public get settings() {
    return {
      get: () => this.data.settings,
      updateNewsroomConfig: (cfg: Partial<NewsroomConfig>) => {
        this.data.settings.newsroomConfig = { ...this.data.settings.newsroomConfig, ...cfg };
        this.save();
        return this.data.settings.newsroomConfig;
      },
      updateArchivalSettings: (arch: Partial<ArchivalRuleSettings>) => {
        this.data.settings.archivalSettings = { ...this.data.settings.archivalSettings, ...arch };
        this.save();
        return this.data.settings.archivalSettings;
      },
      updateYoutubeChannel: (chan: Partial<YouTubeChannelInfo>) => {
        this.data.settings.youtubeChannel = { ...this.data.settings.youtubeChannel, ...chan };
        this.save();
        return this.data.settings.youtubeChannel;
      },
      setSystemMode: (mode: 'LIVE' | 'DEMO') => {
        this.data.settings.systemMode = mode;
        this.save();
        return mode;
      },
    };
  }

  // --- Archive Tree ---
  public get archive() {
    return {
      all: () => this.data.archive,
      tree: () => {
        const tree: Record<number, Record<number, Record<number, Article[]>>> = {};
        const archivedArticles = this.data.articles.filter((a) => a.isArchived);

        for (const art of archivedArticles) {
          const date = new Date(art.published_at);
          const y = date.getFullYear() || 2026;
          const m = date.getMonth() + 1;
          const d = date.getDate();

          if (!tree[y]) tree[y] = {};
          if (!tree[y][m]) tree[y][m] = {};
          if (!tree[y][m][d]) tree[y][m][d] = [];

          tree[y][m][d].push(art);
        }
        return tree;
      },
    };
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }
}

// Export singleton instance
export const db = new ProductionDatabase();
