export type ImageAgentFormat = 'blog' | 'instagram';

export type ImageAgentTemplateId = 'essencial' | 'jardim' | 'impulso' | 'afeto';

export interface ImageAgentPostData {
  destaque: string;
  titulo: string;
  corpo: string;
  hashtags: string[];
  backgroundImageUrl?: string;
}

export interface ImageAgentTemplateMeta {
  id: ImageAgentTemplateId;
  label: string;
  description: string;
}

export const IMAGE_AGENT_FORMATS: Record<
  ImageAgentFormat,
  { width: number; height: number; label: string; short: string }
> = {
  blog: { width: 1200, height: 630, label: 'Blog — 1200×630', short: 'Blog' },
  instagram: { width: 1080, height: 1080, label: 'Instagram — 1080×1080', short: 'Instagram' },
};

export const IMAGE_AGENT_TEMPLATES: ImageAgentTemplateMeta[] = [
  { id: 'essencial', label: 'Essencial', description: 'Clean com barra' },
  { id: 'jardim', label: 'Jardim', description: 'Folhas e natureza' },
  { id: 'impulso', label: 'Impulso', description: 'Bold escuro' },
  { id: 'afeto', label: 'Afeto', description: 'Suave com lua' },
];
