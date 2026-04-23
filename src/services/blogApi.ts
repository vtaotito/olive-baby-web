import api from './api';
import type {
  BlogPost,
  BlogPostListItem,
  BlogCategory,
  BlogTag,
  BlogStats,
  TopicSuggestion,
  GeneratedContent,
  CreatePostData,
  UpdatePostData,
  BlogPostStatus,
} from '../types/blog';

// ==========================================
// Public Blog API
// ==========================================

export const blogService = {
  listPublishedPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    q?: string;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: BlogPostListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/blog/posts', { params });
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await api.get<{ success: boolean; data: BlogPost }>(`/blog/posts/${slug}`);
    return response.data;
  },

  listCategories: async () => {
    const response = await api.get<{ success: boolean; data: BlogCategory[] }>('/blog/categories');
    return response.data;
  },

  listTags: async () => {
    const response = await api.get<{ success: boolean; data: BlogTag[] }>('/blog/tags');
    return response.data;
  },
};

// ==========================================
// Admin Blog API
// ==========================================

export const adminBlogService = {
  listPosts: async (params?: {
    page?: number;
    limit?: number;
    status?: BlogPostStatus;
    categoryId?: number;
    q?: string;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: BlogPost[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/admin/blog/posts', { params });
    return response.data;
  },

  getPost: async (id: number) => {
    const response = await api.get<{ success: boolean; data: BlogPost }>(`/admin/blog/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostData) => {
    const response = await api.post<{ success: boolean; data: BlogPost }>('/admin/blog/posts', data);
    return response.data;
  },

  updatePost: async (id: number, data: UpdatePostData) => {
    const response = await api.put<{ success: boolean; data: BlogPost }>(`/admin/blog/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/admin/blog/posts/${id}`);
    return response.data;
  },

  reviewPost: async (id: number, data: { approved: boolean; reviewNotes?: string }) => {
    const response = await api.post<{ success: boolean; data: BlogPost }>(`/admin/blog/posts/${id}/review`, data);
    return response.data;
  },

  publishPost: async (id: number) => {
    const response = await api.post<{ success: boolean; data: BlogPost }>(`/admin/blog/posts/${id}/publish`);
    return response.data;
  },

  archivePost: async (id: number) => {
    const response = await api.post<{ success: boolean; data: BlogPost }>(`/admin/blog/posts/${id}/archive`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ success: boolean; data: BlogStats }>('/admin/blog/stats');
    return response.data;
  },

  // Categories
  listCategories: async () => {
    const response = await api.get<{ success: boolean; data: BlogCategory[] }>('/admin/blog/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post<{ success: boolean; data: BlogCategory }>('/admin/blog/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.patch<{ success: boolean; data: BlogCategory }>(`/admin/blog/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/admin/blog/categories/${id}`);
    return response.data;
  },

  // Tags
  listTags: async () => {
    const response = await api.get<{ success: boolean; data: BlogTag[] }>('/admin/blog/tags');
    return response.data;
  },

  createTag: async (data: { name: string }) => {
    const response = await api.post<{ success: boolean; data: BlogTag }>('/admin/blog/tags', data);
    return response.data;
  },

  deleteTag: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/admin/blog/tags/${id}`);
    return response.data;
  },

  // AI
  generateTopics: async (data?: { count?: number; focus?: string }) => {
    const response = await api.post<{ success: boolean; data: TopicSuggestion[] }>('/admin/blog/ai/generate-topics', data || {});
    return response.data;
  },

  generateContent: async (data: { title: string; angle?: string; targetKeywords?: string[] }) => {
    const response = await api.post<{ success: boolean; data: GeneratedContent }>('/admin/blog/ai/generate-content', data);
    return response.data;
  },

  optimizeSeo: async (postId: number) => {
    const response = await api.post<{ success: boolean; data: { optimization: unknown; post: BlogPost } }>('/admin/blog/ai/optimize-seo', { postId });
    return response.data;
  },
};
