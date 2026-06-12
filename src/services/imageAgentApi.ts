import api from './api';
import type {
  ImageAgentFormat,
  ImageAgentTemplateId,
  ImageGenerationProvider,
} from '../constants/imageAgent';

export interface ImageAgentCopyResult {
  destaque: string;
  titulo: string;
  corpo: string;
  hashtags: string[];
}

export interface ImageAgentConfig {
  providers: ImageGenerationProvider[];
  defaultProvider: ImageGenerationProvider;
}

export interface ImageAgentImageResult {
  imageUrl: string;
  prompt: string;
  filename: string;
  provider: ImageGenerationProvider;
}

export const imageAgentService = {
  getConfig: async () => {
    const response = await api.get<{ success: boolean; data: ImageAgentConfig }>(
      '/admin/image-agent/config'
    );
    return response.data;
  },

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
    provider?: ImageGenerationProvider;
  }) => {
    const response = await api.post<{ success: boolean; data: ImageAgentImageResult }>(
      '/admin/image-agent/generate-image',
      data
    );
    return response.data;
  },
};
