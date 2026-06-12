import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ArrowLeft, Save, Send, Eye, Sparkles, Upload, Loader2,
  CheckCircle, XCircle, Archive, Bot, Tag as TagIcon, ImageIcon,
  ExternalLink, PenLine, Globe,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { BlogMarkdown } from '../../components/blog/BlogMarkdown';
import { adminBlogService } from '../../services/blogApi';
import { cn } from '../../lib/utils';
import { invalidateBlogCaches } from '../../lib/blogCache';
import type { BlogPostStatus, TopicSuggestion } from '../../types/blog';

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  IDEA: 'Ideia',
  DRAFT: 'Rascunho',
  IN_REVIEW: 'Em Revisão',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const STATUS_COLORS: Record<BlogPostStatus, string> = {
  IDEA: 'bg-gray-100 text-gray-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  IN_REVIEW: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-violet-100 text-violet-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const MAX_UPLOAD_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function uploadErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 413) {
      return `Imagem muito grande. O limite é ${MAX_UPLOAD_MB}MB.`;
    }
    const msg = (err.response?.data as { message?: string })?.message;
    if (msg) return msg;
    if (!err.response) return 'Falha de conexão durante o upload. Tente novamente.';
  }
  return 'Erro ao enviar a imagem. Tente novamente.';
}

export function AdminBlogPostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const isEditing = !!id;
  const navState = location.state as {
    topic?: TopicSuggestion;
    coverImageUrl?: string;
    title?: string;
    excerpt?: string;
  } | null;
  const topicFromNav = navState?.topic;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagInput, setTagInput] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [contentView, setContentView] = useState<'write' | 'preview'>('write');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: postData } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: () => adminBlogService.getPost(parseInt(id!)),
    enabled: isEditing,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: () => adminBlogService.listCategories(),
  });

  const post = postData?.data;
  const categories = categoriesData?.data || [];
  const isPublished = post?.status === 'PUBLISHED';

  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setCoverImageUrl(post.coverImageUrl || '');
      setCategoryId(post.categoryId || undefined);
      setTagNames(post.tags.map(t => t.name));
      setSeoTitle(post.seoTitle || '');
      setSeoDescription(post.seoDescription || '');
      setSeoKeywords(post.seoKeywords || []);
      setHasUnsavedChanges(false);
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (topicFromNav && !isEditing) {
      setTitle(topicFromNav.title);
      if (topicFromNav.targetKeywords) setSeoKeywords(topicFromNav.targetKeywords);
    }
  }, [topicFromNav, isEditing]);

  useEffect(() => {
    if (!isEditing && navState) {
      if (navState.coverImageUrl) setCoverImageUrl(navState.coverImageUrl);
      if (navState.title) setTitle(navState.title);
      if (navState.excerpt) setExcerpt(navState.excerpt);
    }
  }, [navState, isEditing]);

  const markDirty = () => setHasUnsavedChanges(true);

  // ==========================================
  // Mutations
  // ==========================================

  const saveMutation = useMutation({
    // status undefined = mantém o status atual (essencial para editar post publicado)
    mutationFn: async (status?: 'DRAFT' | 'IN_REVIEW') => {
      const data = {
        title,
        content,
        excerpt: excerpt || undefined,
        coverImageUrl: coverImageUrl || undefined,
        categoryId,
        tagNames,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords,
        ...(status ? { status } : {}),
      };

      if (isEditing) {
        return adminBlogService.updatePost(parseInt(id!), data);
      }
      return adminBlogService.createPost({ ...data, status: status || 'DRAFT' });
    },
    onSuccess: (result, status) => {
      void invalidateBlogCaches(queryClient);
      setHasUnsavedChanges(false);
      if (!isEditing && result.data) {
        success('Post criado com sucesso');
        navigate(`/admin/blog/${result.data.id}/edit`, { replace: true });
      } else if (status === 'IN_REVIEW') {
        success('Post enviado para revisão');
      } else if (isPublished) {
        success('Alterações salvas — post continua publicado');
      } else {
        success('Alterações salvas');
      }
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || 'Erro ao salvar o post'
        : 'Erro ao salvar o post';
      toastError(msg);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ approved, notes }: { approved: boolean; notes?: string }) =>
      adminBlogService.reviewPost(parseInt(id!), { approved, reviewNotes: notes }),
    onSuccess: (_, vars) => {
      void invalidateBlogCaches(queryClient);
      success(vars.approved ? 'Post aprovado' : 'Post devolvido para ajustes');
    },
    onError: () => toastError('Erro ao revisar o post'),
  });

  const publishMutation = useMutation({
    mutationFn: () => adminBlogService.publishPost(parseInt(id!)),
    onSuccess: () => {
      void invalidateBlogCaches(queryClient);
      success('Post publicado com sucesso');
    },
    onError: () => toastError('Erro ao publicar o post'),
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminBlogService.archivePost(parseInt(id!)),
    onSuccess: () => {
      void invalidateBlogCaches(queryClient);
      success('Post arquivado');
      navigate('/admin/blog');
    },
    onError: () => toastError('Erro ao arquivar o post'),
  });

  const seoMutation = useMutation({
    mutationFn: () => adminBlogService.optimizeSeo(parseInt(id!)),
    onSuccess: (result) => {
      const updated = result.data?.post;
      if (updated) {
        setSeoTitle(updated.seoTitle || '');
        setSeoDescription(updated.seoDescription || '');
        setSeoKeywords(updated.seoKeywords || []);
      }
      void invalidateBlogCaches(queryClient);
      success('SEO otimizado com IA');
    },
    onError: () => toastError('Erro ao otimizar SEO'),
  });

  // ==========================================
  // Upload de imagem (com validação e feedback)
  // ==========================================

  const handleImageUpload = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toastError('Formato inválido. Use JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toastError(`Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: ${MAX_UPLOAD_MB}MB.`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await adminBlogService.uploadImage(file);
      if (result.data?.imageUrl) {
        setCoverImageUrl(result.data.imageUrl);
        setHasUnsavedChanges(true);
        success('Imagem enviada com sucesso');
      } else {
        toastError('O servidor não retornou a URL da imagem.');
      }
    } catch (err) {
      toastError(uploadErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }, [success, toastError]);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleImageUpload(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleImageUpload(file);
  };

  const handleGenerateImage = async () => {
    if (!title) {
      toastError('Preencha o título antes de gerar a imagem.');
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await adminBlogService.generateImage({
        title,
        excerpt: excerpt || undefined,
        postId: isEditing ? parseInt(id!) : undefined,
      });
      if (result.data?.imageUrl) {
        setCoverImageUrl(result.data.imageUrl);
        setHasUnsavedChanges(true);
        success('Imagem gerada com IA');
      }
    } catch {
      toastError('Erro ao gerar imagem com IA. Verifique as chaves no servidor.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const result = await adminBlogService.generateContent({
        title,
        targetKeywords: seoKeywords.length > 0 ? seoKeywords : undefined,
      });
      const gen = result.data;
      if (gen) {
        setContent(gen.content);
        setExcerpt(gen.excerpt);
        setSeoTitle(gen.seoTitle);
        setSeoDescription(gen.seoDescription);
        setSeoKeywords(gen.seoKeywords);
        if (gen.suggestedTags) setTagNames(gen.suggestedTags);
        setHasUnsavedChanges(true);
        success('Conteúdo gerado com IA');
      }
    } catch {
      toastError('Erro ao gerar conteúdo com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tagNames.includes(trimmed)) {
      setTagNames([...tagNames, trimmed]);
      markDirty();
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTagNames(tagNames.filter(t => t !== tag));
    markDirty();
  };

  // ==========================================
  // Render
  // ==========================================

  const coverImageSection = (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <label className="block text-sm font-medium text-gray-700">Imagem de Capa</label>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Link
            to={`/admin/image-agent?format=blog&topico=${encodeURIComponent(title || '')}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Agente de Imagens
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateImage}
            disabled={!title || isGeneratingImage}
            leftIcon={isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            className="text-purple-600 hover:bg-purple-50"
          >
            {isGeneratingImage ? 'Gerando...' : 'Gerar com IA'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFileSelected}
      />

      {coverImageUrl ? (
        <div className="relative group">
          <img
            src={coverImageUrl}
            alt="Capa do post"
            className="rounded-lg max-h-64 object-cover w-full"
            onError={() => toastError('Não foi possível carregar a imagem desta URL.')}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              leftIcon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            >
              Trocar imagem
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { setCoverImageUrl(''); markDirty(); }}
              className="!text-red-600"
            >
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          disabled={isUploading}
          className={cn(
            'flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors',
            isDraggingOver
              ? 'border-olive-500 bg-olive-50'
              : 'border-gray-200 hover:border-olive-300 hover:bg-olive-50/30',
            isUploading && 'opacity-60 cursor-wait'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-olive-400 mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Enviando imagem...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Clique para escolher ou arraste a imagem aqui</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF ou WebP · máx {MAX_UPLOAD_MB}MB</p>
            </>
          )}
        </button>
      )}

      <input
        type="url"
        value={coverImageUrl}
        onChange={(e) => { setCoverImageUrl(e.target.value); markDirty(); }}
        placeholder="Ou cole a URL da imagem aqui..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 mt-3"
      />
    </div>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/blog')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Post' : 'Novo Post'}
              </h1>
              {post && (
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[post.status])}>
                  {STATUS_LABELS[post.status]}
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 font-medium">• alterações não salvas</span>
              )}
            </div>
            {post?.aiGenerated && (
              <p className="text-xs text-gray-400 mt-0.5">Gerado por IA</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isPublished && post?.slug && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              Ver no site
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {isEditing && post?.status === 'IN_REVIEW' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reviewMutation.mutate({ approved: true })}
                disabled={reviewMutation.isPending}
                className="text-green-600 hover:bg-green-50"
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Aprovar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reviewMutation.mutate({ approved: false })}
                disabled={reviewMutation.isPending}
                className="text-red-600 hover:bg-red-50"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Devolver
              </Button>
            </>
          )}

          {isEditing && post?.status === 'APPROVED' && (
            <Button
              size="sm"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              leftIcon={publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            >
              {publishMutation.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          )}

          {isPublished && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              leftIcon={<Archive className="w-4 h-4" />}
            >
              Arquivar
            </Button>
          )}

          {isPublished ? (
            // Post publicado: salvar mantém o status PUBLISHED
            <Button
              size="sm"
              onClick={() => saveMutation.mutate(undefined)}
              disabled={saveMutation.isPending || !title || !content}
              leftIcon={saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveMutation.mutate('DRAFT')}
                disabled={saveMutation.isPending || !title}
                leftIcon={saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                Salvar Rascunho
              </Button>
              <Button
                size="sm"
                onClick={() => saveMutation.mutate('IN_REVIEW')}
                disabled={saveMutation.isPending || !title || !content}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Enviar para Revisão
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Conteúdo
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'seo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          )}
        >
          SEO & Metadados
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'content' ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                  placeholder="Título do post..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300"
                />
              </div>

              {/* AI Generate Button */}
              {title && !content && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800 mb-2">
                    Quer gerar o conteúdo automaticamente com IA?
                  </p>
                  <Button
                    size="sm"
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? 'Gerando conteúdo...' : 'Gerar com IA'}
                  </Button>
                </div>
              )}

              {/* Cover Image — sempre visível na aba de conteúdo */}
              {coverImageSection}

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Resumo (Excerpt)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => { setExcerpt(e.target.value); markDirty(); }}
                  placeholder="Resumo curto do post (max 160 chars para featured snippets)..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{excerpt.length}/500</p>
              </div>

              {/* Content: escrever / visualizar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Conteúdo (Markdown)</label>
                  <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setContentView('write')}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors',
                        contentView === 'write' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      <PenLine className="w-3 h-3" /> Escrever
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentView('preview')}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors',
                        contentView === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      <Eye className="w-3 h-3" /> Visualizar
                    </button>
                  </div>
                </div>

                {contentView === 'write' ? (
                  <textarea
                    value={content}
                    onChange={(e) => { setContent(e.target.value); markDirty(); }}
                    placeholder="Escreva o conteúdo do post em Markdown..."
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 resize-y"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl p-6 bg-white min-h-[300px]">
                    {content ? (
                      <BlogMarkdown content={content} className="prose max-w-none" />
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-12">
                        Nada para visualizar ainda. Escreva o conteúdo na aba "Escrever".
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* SEO Tab */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">SEO & Metadados</h3>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => seoMutation.mutate()}
                      disabled={seoMutation.isPending}
                      leftIcon={seoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    >
                      {seoMutation.isPending ? 'Otimizando...' : 'Otimizar com IA'}
                    </Button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => { setSeoTitle(e.target.value); markDirty(); }}
                    placeholder="Título otimizado para SEO (max 60 chars)"
                    maxLength={70}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
                  />
                  <p className="text-xs text-gray-400 mt-1">{seoTitle.length}/60</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => { setSeoDescription(e.target.value); markDirty(); }}
                    placeholder="Descrição para motores de busca (max 155 chars)"
                    maxLength={160}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{seoDescription.length}/155</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {seoKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-olive-100 text-olive-700 rounded text-xs flex items-center gap-1">
                        {kw}
                        <button
                          onClick={() => { setSeoKeywords(seoKeywords.filter((_, idx) => idx !== i)); markDirty(); }}
                          className="hover:text-red-600"
                        >&times;</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Adicionar keyword e pressionar Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !seoKeywords.includes(val)) {
                          setSeoKeywords([...seoKeywords, val]);
                          markDirty();
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
                  />
                </div>

                {/* Google Snippet Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Preview do Google</p>
                  <p className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                    {seoTitle || title || 'Título do Post'}
                  </p>
                  <p className="text-green-700 text-sm">oliecare.cloud/blog/{post?.slug || 'slug-do-post'}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {seoDescription || excerpt || 'Descrição do post aparecerá aqui...'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={categoryId || ''}
              onChange={(e) => { setCategoryId(e.target.value ? parseInt(e.target.value) : undefined); markDirty(); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
            >
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tagNames.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-olive-100 text-olive-700 rounded-lg text-xs flex items-center gap-1">
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-600 ml-0.5">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Nova tag..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
              <Button variant="ghost" size="sm" onClick={addTag}>+</Button>
            </div>
          </div>

          {/* Post Info */}
          {post && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Informações</h3>
              <div className="text-sm space-y-2 text-gray-600">
                <p>Criado: {new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                <p>Atualizado: {new Date(post.updatedAt).toLocaleDateString('pt-BR')}</p>
                {post.publishedAt && <p>Publicado: {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</p>}
                {post.readingTimeMin && <p>Tempo de leitura: {post.readingTimeMin} min</p>}
                {post.reviewNotes && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg text-amber-800 text-xs">
                    <strong>Notas da revisão:</strong> {post.reviewNotes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBlogPostEditorPage;
