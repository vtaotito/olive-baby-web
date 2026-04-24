export type SocialPlatform = 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK' | 'TWITTER' | 'THREADS' | 'TIKTOK' | 'YOUTUBE' | 'BLUESKY';
export type SocialPostStatus = 'IDEA' | 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED';
export type ContentAudience = 'b2c_parents' | 'b2b_pediatricians' | 'b2b_lactation' | 'b2b_caregivers';

export const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; color: string; icon: string; maxChars: number }> = {
  INSTAGRAM: { label: 'Instagram', color: 'bg-pink-100 text-pink-700', icon: '📸', maxChars: 2200 },
  LINKEDIN: { label: 'LinkedIn', color: 'bg-blue-100 text-blue-700', icon: '💼', maxChars: 3000 },
  FACEBOOK: { label: 'Facebook', color: 'bg-indigo-100 text-indigo-700', icon: '👥', maxChars: 5000 },
  TWITTER: { label: 'X / Twitter', color: 'bg-gray-100 text-gray-800', icon: '𝕏', maxChars: 280 },
  THREADS: { label: 'Threads', color: 'bg-stone-100 text-stone-700', icon: '🧵', maxChars: 500 },
  TIKTOK: { label: 'TikTok', color: 'bg-black/10 text-black', icon: '🎵', maxChars: 2200 },
  YOUTUBE: { label: 'YouTube', color: 'bg-red-100 text-red-700', icon: '▶️', maxChars: 5000 },
  BLUESKY: { label: 'Bluesky', color: 'bg-sky-100 text-sky-700', icon: '🦋', maxChars: 300 },
};

export const AUDIENCE_LABELS: Record<ContentAudience, string> = {
  b2c_parents: 'Pais & Famílias',
  b2b_pediatricians: 'Pediatras',
  b2b_lactation: 'Consultoras Amamentação',
  b2b_caregivers: 'Cuidadores & Babás',
};

export interface SocialAccount {
  id: number;
  platform: SocialPlatform;
  accountName: string;
  accountId: string;
  isActive: boolean;
  connectedAt: string;
  lastPublishedAt?: string | null;
  externalData?: Record<string, unknown> | null;
  _count?: { posts: number };
}

export interface SocialPostPlatform {
  id: number;
  postId: number;
  accountId: number;
  externalPostId?: string | null;
  status: string;
  errorMessage?: string | null;
  publishedAt?: string | null;
  account: { id: number; platform: SocialPlatform; accountName: string };
}

export interface SocialPost {
  id: number;
  caption: string;
  mediaUrls: string[];
  status: SocialPostStatus;
  audience?: string | null;
  hashtags: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
  aiGenerated: boolean;
  aiPromptUsed?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  authorId?: number | null;
  author?: { id: number; email: string; caregiver?: { fullName: string } | null } | null;
  platforms: SocialPostPlatform[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
  scheduled: number;
  failed: number;
  archived: number;
  accounts: Array<{ platform: SocialPlatform; accountName: string; _count: { posts: number } }>;
  recentPosts: Array<{ id: number; caption: string; publishedAt: string | null; audience: string | null }>;
}

export interface SocialTopicSuggestion {
  caption: string;
  hashtags: string[];
  audience: ContentAudience;
  platforms: string[];
  angle: string;
  contentType: string;
}
