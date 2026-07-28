import api from './api';
import type { ContentAudience } from '../types/blog';

export type ContentChannel = 'blog' | 'social';
export type RegeneratePart = 'content' | 'seo' | 'cover' | 'caption' | 'social_image' | 'inline';
export type ImageTemplateId = 'essencial' | 'jardim' | 'impulso' | 'afeto';

export interface ContentGenerateInput {
  brief: string;
  angle?: string;
  audience: ContentAudience;
  channels: ContentChannel[];
  targetKeywords?: string[];
  templateId?: ImageTemplateId;
  accountIds?: number[];
  generateInlineImages?: boolean;
}

export interface ContentGenerateResult {
  blogPostId?: number;
  socialPostId?: number;
  qualityScore?: number;
  sources?: unknown;
  blog?: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    status: string;
  };
  social?: {
    id: number;
    caption: string;
    mediaUrls: string[];
    status: string;
    audience?: string | null;
  };
  errors: Array<{ channel: ContentChannel; stage: string; message: string }>;
}

export interface ContentQueueItem {
  channel: ContentChannel;
  id: number;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status: string;
  audience?: string | null;
  qualityScore?: number | null;
  aiGenerated: boolean;
  updatedAt: string;
  editPath: string;
}

export const contentStudioApi = {
  generate: async (data: ContentGenerateInput) => {
    const response = await api.post<{ success: boolean; data: ContentGenerateResult }>(
      '/admin/content/generate',
      data
    );
    return response.data;
  },

  getQueue: async (limit = 30) => {
    const response = await api.get<{
      success: boolean;
      data: { items: ContentQueueItem[]; total: number };
    }>('/admin/content/queue', { params: { limit } });
    return response.data;
  },

  regenerate: async (data: {
    channel: ContentChannel;
    id: number;
    part: RegeneratePart;
    audience?: ContentAudience;
    templateId?: ImageTemplateId;
  }) => {
    const response = await api.post<{ success: boolean; data: unknown }>(
      '/admin/content/regenerate',
      data
    );
    return response.data;
  },

  createSocialFromBlog: async (data: { blogPostId: number; accountIds?: number[] }) => {
    const response = await api.post<{ success: boolean; data: { id: number } }>(
      '/admin/content/from-blog',
      data
    );
    return response.data;
  },
};
