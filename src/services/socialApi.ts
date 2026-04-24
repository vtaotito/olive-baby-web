import api from './api';
import type { SocialPost, SocialAccount, SocialStats, SocialTopicSuggestion, SocialPostStatus } from '../types/social';

export const adminSocialService = {
  // Posts
  listPosts: async (params?: { page?: number; limit?: number; status?: SocialPostStatus; audience?: string; platform?: string; q?: string }) => {
    const response = await api.get<{ success: boolean; data: SocialPost[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/admin/social/posts', { params });
    return response.data;
  },
  getPost: async (id: number) => {
    const response = await api.get<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}`);
    return response.data;
  },
  createPost: async (data: { caption: string; mediaUrls?: string[]; audience?: string; hashtags?: string[]; scheduledAt?: string; status?: string; accountIds?: number[] }) => {
    const response = await api.post<{ success: boolean; data: SocialPost }>('/admin/social/posts', data);
    return response.data;
  },
  updatePost: async (id: number, data: Record<string, unknown>) => {
    const response = await api.put<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}`, data);
    return response.data;
  },
  deletePost: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/admin/social/posts/${id}`);
    return response.data;
  },
  reviewPost: async (id: number, data: { approved: boolean; reviewNotes?: string }) => {
    const response = await api.post<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}/review`, data);
    return response.data;
  },
  publishPost: async (id: number) => {
    const response = await api.post<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}/publish`);
    return response.data;
  },
  schedulePost: async (id: number, scheduledAt: string) => {
    const response = await api.post<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}/schedule`, { scheduledAt });
    return response.data;
  },
  archivePost: async (id: number) => {
    const response = await api.post<{ success: boolean; data: SocialPost }>(`/admin/social/posts/${id}/archive`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: SocialStats }>('/admin/social/stats');
    return response.data;
  },

  // Accounts
  listAccounts: async () => {
    const response = await api.get<{ success: boolean; data: SocialAccount[] }>('/admin/social/accounts');
    return response.data;
  },
  createAccount: async (data: { platform: string; accountName: string; accountId: string; accessToken?: string; externalData?: Record<string, unknown> }) => {
    const response = await api.post<{ success: boolean; data: SocialAccount }>('/admin/social/accounts', data);
    return response.data;
  },
  deleteAccount: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/admin/social/accounts/${id}`);
    return response.data;
  },
  testAccount: async (id: number) => {
    const response = await api.post<{ success: boolean; data: { success: boolean } }>(`/admin/social/accounts/${id}/test`);
    return response.data;
  },

  // AI
  generateTopics: async (data?: { count?: number; audience?: string; platforms?: string[] }) => {
    const response = await api.post<{ success: boolean; data: SocialTopicSuggestion[] }>('/admin/social/ai/generate-topics', data || {});
    return response.data;
  },
  generateCaption: async (data: { idea: string; audience?: string; platforms?: string[] }) => {
    const response = await api.post<{ success: boolean; data: { caption: string; hashtags: string[]; platforms: string[] } }>('/admin/social/ai/generate-caption', data);
    return response.data;
  },
  generateImage: async (data: { caption: string; postId?: number }) => {
    const response = await api.post<{ success: boolean; data: { imageUrl: string; prompt: string } }>('/admin/social/ai/generate-image', data);
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ success: boolean; data: { imageUrl: string; filename: string } }>(
      '/admin/social/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
