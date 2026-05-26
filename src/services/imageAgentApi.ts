import api from './api';
import type { ImageAgentFormat, ImageAgentTemplateId } from '../constants/imageAgent';

export interface ImageAgentCopyResult {
  destaque: string;
  titulo: string;
  corpo: string;
  hashtags: string[];
}

export const imageAgentService = {
  generateCopy: async (data: {
    topico: string;
    format: ImageAgentFormat;
    templateId: ImageAgentTemplateId;
  }) => {
    const response = await api.post<{ success: boolean; data: ImageAgentCopyResult }>(
      '/admin/image-agent/generate-copy',
      data
    );
    return response.data;
  },

  generateImage: async (data: {
    topico: string;
    excerpt?: string;
    customPrompt?: string;
    format: ImageAgentFormat;
    templateId: ImageAgentTemplateId;
  }) => {
    const response = await api.post<{
      success: boolean;
      data: { imageUrl: string; prompt: string; filename: string };
    }>('/admin/image-agent/generate-image', data);
    return response.data;
  },
};
