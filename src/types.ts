export type JournalistId = 'michael-carter' | 'daniel-wilson' | 'david-okoro' | 'kenji-nakamura' | 'alex-morgan';

export type VerificationStatus = 'CONFIRMED' | 'DEVELOPING' | 'UNCONFIRMED' | 'OPINION' | 'ANALYSIS';

export type ArticleStatus = 'draft' | 'pending' | 'published' | 'archived';

export type SourceHealthStatus = 'CONNECTED' | 'ERROR' | 'RATE_LIMITED' | 'DISABLED' | 'NO_DATA';

export type NewsCategory = 
  | 'BUSINESS' 
  | 'TECHNOLOGY' 
  | 'SCIENCE' 
  | 'HEALTH' 
  | 'POLITICS' 
  | 'WORLD' 
  | 'SPORTS' 
  | 'ENVIRONMENT';

export type Region = 
  | 'Americas' 
  | 'Europe' 
  | 'Africa' 
  | 'Asia-Pacific' 
  | 'Middle East';

export type SourceType = 
  | 'RSS Feed' 
  | 'Wire Service' 
  | 'Official Institution' 
  | 'Government Portal' 
  | 'Public Announcement';

export type PipelineStage = 
  | 'SOURCE_DISCOVERY'
  | 'CONTENT_INGESTION'
  | 'LANGUAGE_DETECTION'
  | 'DUPLICATE_DETECTION'
  | 'EVENT_CLUSTERING'
  | 'SOURCE_COMPARISON'
  | 'FACT_EXTRACTION'
  | 'RELEVANCE_SCORING'
  | 'AI_JOURNALIST_ASSIGNMENT'
  | 'ARTICLE_GENERATION'
  | 'IMAGE_SEARCH'
  | 'EDITORIAL_REVIEW'
  | 'PUBLICATION'
  | 'ARCHIVING';

export interface SourceArticleRef {
  name: string;
  url: string;
  publishedAt?: string;
  quotedExcerpt?: string;
  reliability: number;
}

export interface ArticleImage {
  url: string;
  caption: string;
  credit: string;
  license: string;
  sourceUrl?: string;
}

export interface DevelopingStoryUpdate {
  id: string;
  timestamp: string;
  updateNumber: number;
  title: string;
  content: string;
  sources: SourceArticleRef[];
}

export interface EditorialReviewRecord {
  id: string;
  articleId: string;
  reviewerName: string; // "Alex Morgan (Editor-in-Chief)"
  timestamp: string;
  score: number; // 0 to 100
  verdict: 'APPROVED' | 'REQUIRES_REVISION' | 'REJECTED' | 'ESCALATE_HUMAN';
  contradictionsDetected: string[];
  duplicatesDetected: string[];
  sourcingQuality: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT';
  homepagePlacementRecommendation: 'TOP_HERO' | 'LEAD_STORY' | 'SECONDARY' | 'REGIONAL' | 'STANDARD';
  notes: string;
}

export interface Article {
  id: string;
  slug: string;
  headline: string;
  shortHeadline: string;
  subheadline?: string;
  summary: string;
  fullArticle: string;
  keyFacts: string[];
  location: string;
  country: string;
  region: Region;
  category: NewsCategory;
  verificationStatus: VerificationStatus;
  status?: ArticleStatus;
  confidenceScore: number; // 0 to 100
  eventTime?: string;
  created_at: string; // ISO UTC
  published_at: string; // ISO UTC
  updated_at: string; // ISO UTC
  archived_at?: string; // ISO UTC
  isArchived: boolean;
  restored_at?: string; // ISO UTC
  is_restored?: boolean;
  restored_by?: string;
  journalistId: JournalistId;
  journalistName: string;
  sources: SourceArticleRef[];
  image: ArticleImage;
  viewsCount: number;
  isBreaking?: boolean;
  isTopStory?: boolean;
  isDeveloping?: boolean;
  developingUpdates?: DevelopingStoryUpdate[];
  editorialReview?: EditorialReviewRecord;
  videoId?: string;
  youtube_video_id?: string;
  video?: YouTubeVideo;
  pipelineAuditTrail?: {
    stage: PipelineStage;
    timestamp: string;
    note: string;
  }[];
}

export type YouTubeLiveStatus = 'live' | 'upcoming' | 'completed' | 'none';

export type VideoCategory =
  | 'Breaking News'
  | 'World'
  | 'Africa'
  | 'Americas'
  | 'Europe'
  | 'Asia'
  | 'Politics'
  | 'Business'
  | 'Technology'
  | 'Science'
  | 'Health'
  | 'Sports'
  | 'Interviews'
  | 'Explainers'
  | 'Documentary'
  | 'Live'
  | 'Shorts';

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  channel_id: string;
  channel_title: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  duration: string;
  live_status: YouTubeLiveStatus;
  scheduled_start_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  embeddable: boolean;
  original_url: string;
  article_id?: string | null;
  category: VideoCategory;
  is_breaking?: boolean;
  is_featured?: boolean;
  is_hidden?: boolean;
  view_count?: number;
  homepage_priority?: number;
  match_confidence?: number;
  match_status?: 'matched' | 'unmatched' | 'manual_review';
  created_at: string;
  updated_at: string;
}

export interface YouTubeChannelInfo {
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
  uploads_playlist_id: string;
  authorized_email: string; // mekoogk@gmail.com
  status: 'connected' | 'requires_reauthorization' | 'unconfigured';
  last_sync_time: string;
  subscriber_count?: string;
  video_count?: number;
  active_broadcast?: YouTubeVideo | null;
  upcoming_broadcast?: YouTubeVideo | null;
}

export type SupportedLanguage =
  | 'ar'
  | 'en'
  | 'fr'
  | 'es'
  | 'pt'
  | 'de'
  | 'it'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'ru';


export interface JournalistActivityLog {
  id: string;
  timestamp: string;
  action: string;
  stage: PipelineStage;
  details: string;
}

export interface Journalist {
  id: JournalistId;
  name: string;
  role: string;
  avatar: string;
  portrait: string;
  beat: string;
  geographicScope: {
    regions: string[];
    countries: string[];
  };
  status: 'monitoring' | 'synthesizing' | 'fact_checking' | 'editorial_review' | 'idle';
  activeAssignments: number;
  articlesPublishedCount: number;
  averageConfidence: number;
  bio: string;
  assignedSourcesCount: number;
  recentActivity: JournalistActivityLog[];
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  country: string;
  region: Region;
  language: string;
  category: NewsCategory;
  sourceType: SourceType;
  reliabilityRating: number; // e.g. 9.8 out of 10
  isActive: boolean;
  healthStatus?: SourceHealthStatus; // CONNECTED, ERROR, RATE_LIMITED, DISABLED, NO_DATA
  lastCheckedTime: string;
  lastSuccess?: string;
  lastError?: string;
  requestCount?: number;
  errorCount?: number;
  lastErrorMessage?: string;
  assignedJournalistId: JournalistId;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRON';
  category: 'INGESTION' | 'AI_PIPELINE' | 'EDITORIAL' | 'ARCHIVE' | 'YOUTUBE' | 'AUTH' | 'SYSTEM';
  message: string;
  metadata?: Record<string, any>;
}

export interface NewsroomConfig {
  autoPublish: boolean;
  minimumConfidenceScore: number;
  minSourcesRequired: number;
  archiveWindowHours: number; // default 24
  cronSecret: string;
  schedulerActive: boolean;
  lastIngestionSweep: string;
  lastArchiveSweep: string;
  lastRankingUpdate: string;
  superAdminEmail: string; // 'mekoogk@gmail.com'
}

export interface ScheduledJobStatus {
  id: string;
  name: string;
  intervalDescription: string;
  intervalMinutes: number;
  lastRunTime: string;
  nextRunTime: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  itemsProcessedLastRun: number;
}

export interface ArchivalRuleSettings {
  latestWindowHours: number; // Default: 24h
  recentWindowHours: number; // Default: 72h
  autoArchiveEnabled: boolean;
  lastSweepTime: string;
}

export interface PipelineExecutionItem {
  id: string;
  rawTitle: string;
  detectedLanguage: string;
  clusterId: string;
  sourcesCount: number;
  currentStage: PipelineStage;
  assignedJournalist: string;
  status: 'pending' | 'processing' | 'completed' | 'flagged';
  durationMs: number;
  timestamp: string;
}

export interface ContractingArticle {
  id: string;
  slug: string;
  title: string; // عنوان المقال
  imageUrl: string; // صورة المقال
  introduction: string; // مقدمة المقال
  content: string; // محتوى المقال
  author: string; // اسم الكاتب
  publishedAt: string; // تاريخ النشر
  country: string; // الدولة
  city: string; // المدينة
  contractingType: string; // نوع المقاولات (بنية تحتية، إنشاءات، طرق وجسور، طاقة، إلخ)
  company?: string; // الشركة إن وجدت
  keywords: string[]; // الكلمات المفتاحية
  seoTitle: string; // SEO Title
  seoDescription: string; // SEO Description
  status: 'Draft' | 'Pending' | 'Published' | 'Archived'; // حالة المقال
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  archivedAt?: string;
  viewsCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'editor' | 'journalist';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AgentStatusInfo {
  id: JournalistId;
  name: string;
  role: string;
  region: string;
  status: 'Online' | 'Error' | 'Idle' | 'Processing';
  lastRun: string;
  storiesProcessed: number;
  latestStoryHeadline?: string;
  lastError?: string;
  nextRun: string;
  geminiConnected: boolean;
  sourceHealth: 'Online' | 'Warning' | 'Offline';
}

export interface SystemHealthService {
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  message: string;
  lastCheck: string;
  details?: Record<string, any>;
}

export interface SystemHealthData {
  mode: 'LIVE' | 'DEMO';
  demoNotice?: string;
  geminiApi: SystemHealthService;
  newsApis: SystemHealthService;
  database: SystemHealthService;
  youtubeApi: SystemHealthService;
  scheduler: SystemHealthService;
  archiveWorker: SystemHealthService;
  aiAgents: SystemHealthService;
  lastCheck: string;
}

export interface MetricDataPoint {
  timeLabel: string;
  timestamp: number;
  cpu: number;
  memoryMb: number;
  memoryPercent: number;
  activeQueue: number;
}

export interface EngineSystemMetrics {
  cpuUsagePercent: number;
  memoryUsageMb: number;
  memoryTotalMb: number;
  memoryUsagePercent: number;
  uptimeSeconds: number;
  engineStatus: 'HEALTHY' | 'OPERATIONAL' | 'DEGRADED';
  queueCounts: {
    pending: number;
    processing: number;
    completed: number;
    flagged: number;
    total: number;
  };
  journalistSummary: {
    total: number;
    active: number;
    idle: number;
    assignmentsTotal: number;
  };
  sourcesHealth: {
    total: number;
    active: number;
    healthyPercent: number;
  };
  archivalState: {
    latestSweepTime: string;
    archivedCount: number;
    activeCount: number;
  };
  recentHistory: MetricDataPoint[];
}

