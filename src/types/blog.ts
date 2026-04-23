// ==========================================
// Blog Types
// ==========================================

export type BlogPostStatus = 'IDEA' | 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count?: { posts: number };
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogPostAuthor {
  id: number;
  email: string;
  caregiver?: { fullName: string } | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  status: BlogPostStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  ogImageUrl?: string | null;
  schemaMarkup?: Record<string, unknown> | null;
  readingTimeMin?: number | null;
  aiGenerated: boolean;
  aiPromptUsed?: string | null;
  publishedAt?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  categoryId?: number | null;
  category?: BlogCategory | null;
  tags: BlogTag[];
  authorId?: number | null;
  author?: BlogPostAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  readingTimeMin?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  category?: BlogCategory | null;
  tags: BlogTag[];
  author?: BlogPostAuthor | null;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
  archived: number;
  idea: number;
  recentPosts: Array<{ id: number; title: string; slug: string; publishedAt: string | null }>;
}

export interface TopicSuggestion {
  title: string;
  angle: string;
  targetKeywords: string[];
  category: string;
  estimatedSearchVolume: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  suggestedCategory: string;
  suggestedTags: string[];
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  categoryId?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImageUrl?: string;
  schemaMarkup?: Record<string, unknown>;
  aiGenerated?: boolean;
  aiPromptUsed?: string;
  status?: 'IDEA' | 'DRAFT' | 'IN_REVIEW';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  categoryId?: number | null;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImageUrl?: string | null;
  schemaMarkup?: Record<string, unknown>;
  status?: 'IDEA' | 'DRAFT' | 'IN_REVIEW';
}
