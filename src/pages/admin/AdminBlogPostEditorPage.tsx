import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Send, Eye, Sparkles, Upload,
  CheckCircle, XCircle, Archive, Bot, Tag as TagIcon, ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminBlogService } from '../../services/blogApi';
import { cn } from '../../lib/utils';
import type { BlogPost, BlogPostStatus, TopicSuggestion } from '../../types/blog';

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  IDEA: 'Ideia',
  DRAFT: 'Rascunho',
  IN_REVIEW: 'Em Revisão',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

export function AdminBlogPostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const topicFromNav = (location.state as { topic?: TopicSuggestion })?.topic;

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
  const [isGenerating, setIsGenerating] = useState(false);

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
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (topicFromNav && !isEditing) {
      setTitle(topicFromNav.title);
      if (topicFromNav.targetKeywords) setSeoKeywords(topicFromNav.targetKeywords);
    }
  }, [topicFromNav, isEditing]);

  const saveMutation = useMutation({
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
        status,
      };

      if (isEditing) {
        return adminBlogService.updatePost(parseInt(id!), data);
      }
      return adminBlogService.createPost(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      if (!isEditing && result.data) {
        navigate(`/admin/blog/${result.data.id}/edit`, { replace: true });
      }
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ approved, notes }: { approved: boolean; notes?: string }) =>
      adminBlogService.reviewPost(parseInt(id!), { approved, reviewNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => adminBlogService.publishPost(parseInt(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminBlogService.archivePost(parseInt(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      navigate('/admin/blog');
    },
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
      queryClient.invalidateQueries({ queryKey: ['admin-blog-post', id] });
    },
  });

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
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tagNames.includes(trimmed)) {
      setTagNames([...tagNames, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTagNames(tagNames.filter(t => t !== tag));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/blog')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Editar Post' : 'Novo Post'}
            </h1>
            {post && (
              <p className="text-sm text-gray-500 mt-0.5">
                Status: <span className="font-medium">{STATUS_LABELS[post.status]}</span>
                {post.aiGenerated && ' · Gerado por IA'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && post?.status === 'IN_REVIEW' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reviewMutation.mutate({ approved: true })}
                className="text-green-600 hover:bg-green-50"
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Aprovar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reviewMutation.mutate({ approved: false })}
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
              leftIcon={<Send className="w-4 h-4" />}
            >
              Publicar
            </Button>
          )}
          {isEditing && post?.status === 'PUBLISHED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => archiveMutation.mutate()}
              leftIcon={<Archive className="w-4 h-4" />}
            >
              Arquivar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveMutation.mutate('DRAFT')}
            disabled={saveMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
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
                  onChange={(e) => setTitle(e.target.value)}
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
                    leftIcon={<Bot className="w-4 h-4" />}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? 'Gerando conteúdo...' : 'Gerar com IA'}
                  </Button>
                </div>
              )}

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Resumo (Excerpt)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Resumo curto do post (max 160 chars para featured snippets)..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{excerpt.length}/500</p>
              </div>

              {/* Content (Markdown) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Conteúdo (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo do post em Markdown..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 resize-y"
                />
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
                      leftIcon={<Sparkles className="w-4 h-4" />}
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
                    onChange={(e) => setSeoTitle(e.target.value)}
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
                    onChange={(e) => setSeoDescription(e.target.value)}
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
                        <button onClick={() => setSeoKeywords(seoKeywords.filter((_, idx) => idx !== i))} className="hover:text-red-600">&times;</button>
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

              {/* Cover Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Imagem de Capa</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const result = await adminBlogService.uploadImage(file);
                            if (result.data?.imageUrl) setCoverImageUrl(result.data.imageUrl);
                          } catch {}
                          e.target.value = '';
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-olive-700 hover:bg-olive-50 rounded-lg transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!title) return;
                        try {
                          setCoverImageUrl('');
                          const result = await adminBlogService.generateImage({
                            title,
                            excerpt: excerpt || undefined,
                            postId: isEditing ? parseInt(id!) : undefined,
                          });
                          if (result.data?.imageUrl) setCoverImageUrl(result.data.imageUrl);
                        } catch {}
                      }}
                      disabled={!title}
                      leftIcon={<ImageIcon className="w-4 h-4" />}
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      Gerar com IA
                    </Button>
                  </div>
                </div>

                {coverImageUrl ? (
                  <div className="relative group">
                    <img src={coverImageUrl} alt="Preview" className="rounded-lg max-h-56 object-cover w-full" />
                    <button
                      onClick={() => setCoverImageUrl('')}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >&times;</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-olive-300 hover:bg-olive-50/30 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await adminBlogService.uploadImage(file);
                          if (result.data?.imageUrl) setCoverImageUrl(result.data.imageUrl);
                        } catch {}
                        e.target.value = '';
                      }}
                    />
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Clique para fazer upload ou arraste</p>
                    <p className="text-xs text-gray-300 mt-1">JPG, PNG, GIF, WebP (max 10MB)</p>
                  </label>
                )}

                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Ou cole a URL da imagem aqui..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 mt-3"
                />
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
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
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
