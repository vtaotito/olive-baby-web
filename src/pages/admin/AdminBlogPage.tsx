import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Sparkles, Filter, Search, Eye, Edit, Trash2,
  CheckCircle, XCircle, Archive, Clock, Send, BarChart3, Bot, ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminBlogService } from '../../services/blogApi';
import { cn } from '../../lib/utils';
import { invalidateBlogCaches } from '../../lib/blogCache';
import type { BlogPostStatus, BlogPost, TopicSuggestion, ContentAudience } from '../../types/blog';
import { AUDIENCE_LABELS } from '../../types/blog';

const STATUS_CONFIG: Record<BlogPostStatus, { label: string; color: string; icon: typeof Clock }> = {
  IDEA: { label: 'Ideia', color: 'bg-purple-100 text-purple-700', icon: Sparkles },
  DRAFT: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: FileText },
  IN_REVIEW: { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PUBLISHED: { label: 'Publicado', color: 'bg-green-100 text-green-700', icon: Eye },
  ARCHIVED: { label: 'Arquivado', color: 'bg-stone-100 text-stone-700', icon: Archive },
};

export function AdminBlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showTopics, setShowTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<TopicSuggestion[]>([]);
  const [audienceFilter, setAudienceFilter] = useState<ContentAudience | ''>('');

  const { data: statsData } = useQuery({
    queryKey: ['admin-blog-stats'],
    queryFn: () => adminBlogService.getStats(),
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-blog-posts', statusFilter, search, page],
    queryFn: () => adminBlogService.listPosts({
      page,
      limit: 20,
      status: statusFilter || undefined,
      q: search || undefined,
    }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approved, reviewNotes }: { id: number; approved: boolean; reviewNotes?: string }) =>
      adminBlogService.reviewPost(id, { approved, reviewNotes }),
    onSuccess: () => {
      void invalidateBlogCaches(queryClient);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminBlogService.publishPost(id),
    onSuccess: () => {
      void invalidateBlogCaches(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminBlogService.deletePost(id),
    onSuccess: () => {
      void invalidateBlogCaches(queryClient);
    },
  });

  const topicsMutation = useMutation({
    mutationFn: () => adminBlogService.generateTopics({
      count: 5,
      audience: audienceFilter || undefined,
    }),
    onSuccess: (data) => {
      setGeneratedTopics(data.data || []);
      setShowTopics(true);
    },
  });

  const stats = statsData?.data;
  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;

  const reviewPosts = posts.filter((p: BlogPost) => p.status === 'IN_REVIEW');

  return (
    <AdminLayout title="Blog" subtitle="Gestão de conteúdo e agente de IA">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = stats[key === 'IN_REVIEW' ? 'inReview' : key.toLowerCase() as keyof typeof stats] as number || 0;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? '' : key as BlogPostStatus)}
                className={cn(
                  'p-3 rounded-xl border transition-all text-left',
                  statusFilter === key
                    ? 'border-olive-300 bg-olive-50 ring-2 ring-olive-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{config.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300"
          />
        </div>

        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value as ContentAudience | '')}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
        >
          <option value="">Todas audiências</option>
          {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <Button
          onClick={() => topicsMutation.mutate()}
          variant="ghost"
          size="sm"
          leftIcon={<Bot className="w-4 h-4" />}
          disabled={topicsMutation.isPending}
        >
          {topicsMutation.isPending ? 'Gerando...' : 'Gerar Pautas com IA'}
        </Button>

        <Link to="/admin/blog/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Novo Post
          </Button>
        </Link>

        <Link to="/admin/image-agent?format=blog">
          <Button variant="ghost" size="sm" leftIcon={<ImageIcon className="w-4 h-4" />}>
            Agente de Imagens
          </Button>
        </Link>

        <Link to="/admin/blog/categories">
          <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Categorias & Tags
          </Button>
        </Link>
      </div>

      {/* AI Topics Panel */}
      {showTopics && generatedTopics.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pautas Sugeridas pela IA
            </h3>
            <button onClick={() => setShowTopics(false)} className="text-purple-600 hover:text-purple-800 text-sm">
              Fechar
            </button>
          </div>
          <div className="grid gap-3">
            {generatedTopics.map((topic, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-purple-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{topic.title}</h4>
                      {topic.audience && (
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                          topic.audience === 'b2c_parents' ? 'bg-blue-100 text-blue-700' :
                          topic.audience === 'b2b_pediatricians' ? 'bg-emerald-100 text-emerald-700' :
                          topic.audience === 'b2b_lactation' ? 'bg-pink-100 text-pink-700' :
                          'bg-orange-100 text-orange-700'
                        )}>
                          {AUDIENCE_LABELS[topic.audience] || topic.audience}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{topic.angle}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {topic.targetKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{kw}</span>
                      ))}
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        topic.estimatedSearchVolume === 'alto' ? 'bg-green-100 text-green-700' :
                        topic.estimatedSearchVolume === 'medio' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        Vol: {topic.estimatedSearchVolume}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/admin/blog/new', { state: { topic, audience: topic.audience } })}
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Criar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Queue */}
      {!statusFilter && reviewPosts.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" />
            Fila de Aprovação ({reviewPosts.length})
          </h3>
          <div className="space-y-2">
            {reviewPosts.slice(0, 5).map((post: BlogPost) => (
              <div key={post.id} className="bg-white rounded-xl p-4 border border-amber-100 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                  <p className="text-sm text-gray-500">
                    {post.aiGenerated && <span className="text-purple-600 mr-2">AI</span>}
                    {post.category?.name || 'Sem categoria'}
                    {' · '}
                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link to={`/admin/blog/${post.id}/edit`}>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                      Ver
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reviewMutation.mutate({ id: post.id, approved: true })}
                    className="text-green-600 hover:bg-green-50"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reviewMutation.mutate({ id: post.id, approved: false, reviewNotes: 'Devolvido para revisão' })}
                    className="text-red-600 hover:bg-red-50"
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Devolver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Carregando...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhum post encontrado</td></tr>
              ) : (
                posts.map((post: BlogPost) => {
                  const statusCfg = STATUS_CONFIG[post.status];
                  return (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {post.coverImageUrl ? (
                            <img src={post.coverImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[300px]">{post.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {post.aiGenerated && <span className="text-purple-600 mr-1">AI</span>}
                              {post.readingTimeMin ? `${post.readingTimeMin} min leitura` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{post.category?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('pt-BR')
                          : new Date(post.updatedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/blog/${post.id}/edit`}>
                            <button className="p-2 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          {post.status === 'APPROVED' && (
                            <button
                              onClick={() => publishMutation.mutate(post.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Publicar"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este post?')) {
                                deleteMutation.mutate(post.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {pagination.total} posts · Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminBlogPage;
