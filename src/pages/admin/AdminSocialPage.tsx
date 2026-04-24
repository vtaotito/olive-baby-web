import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, CheckCircle, XCircle, Send, Bot,
  Clock, Archive, Share2, Sparkles, Settings,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminSocialService } from '../../services/socialApi';
import { cn } from '../../lib/utils';
import type { SocialPostStatus, SocialPost, SocialTopicSuggestion, ContentAudience } from '../../types/social';
import { PLATFORM_CONFIG, AUDIENCE_LABELS } from '../../types/social';

const STATUS_CONFIG: Record<SocialPostStatus, { label: string; color: string }> = {
  IDEA: { label: 'Ideia', color: 'bg-purple-100 text-purple-700' },
  DRAFT: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  IN_REVIEW: { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-100 text-blue-700' },
  SCHEDULED: { label: 'Agendado', color: 'bg-cyan-100 text-cyan-700' },
  PUBLISHING: { label: 'Publicando', color: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
  ARCHIVED: { label: 'Arquivado', color: 'bg-stone-100 text-stone-700' },
};

export function AdminSocialPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [audienceFilter, setAudienceFilter] = useState<ContentAudience | ''>('');
  const [showTopics, setShowTopics] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<SocialTopicSuggestion[]>([]);

  const { data: statsData } = useQuery({
    queryKey: ['admin-social-stats'],
    queryFn: () => adminSocialService.getStats(),
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-social-posts', statusFilter, search, page],
    queryFn: () => adminSocialService.listPosts({
      page, limit: 20,
      status: statusFilter || undefined,
      q: search || undefined,
    }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approved, reviewNotes }: { id: number; approved: boolean; reviewNotes?: string }) =>
      adminSocialService.reviewPost(id, { approved, reviewNotes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminSocialService.publishPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSocialService.deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social'] }),
  });

  const topicsMutation = useMutation({
    mutationFn: () => adminSocialService.generateTopics({ count: 5, audience: audienceFilter || undefined }),
    onSuccess: (data) => { setGeneratedTopics(data.data || []); setShowTopics(true); },
  });

  const stats = statsData?.data;
  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;
  const reviewPosts = posts.filter((p: SocialPost) => p.status === 'IN_REVIEW');

  return (
    <AdminLayout title="Redes Sociais" subtitle="Gestão de conteúdo e agente de IA para social media">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {(['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'ARCHIVED'] as SocialPostStatus[]).map(key => {
            const cfg = STATUS_CONFIG[key];
            const count = stats[key === 'IN_REVIEW' ? 'inReview' : key.toLowerCase() as keyof typeof stats] as number || 0;
            return (
              <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={cn('p-3 rounded-xl border transition-all text-left',
                  statusFilter === key ? 'border-olive-300 bg-olive-50 ring-2 ring-olive-200' : 'border-gray-200 bg-white hover:border-gray-300')}>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{cfg.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar posts..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300" />
        </div>

        <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value as ContentAudience | '')}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200">
          <option value="">Todas audiências</option>
          {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <Button onClick={() => topicsMutation.mutate()} variant="ghost" size="sm"
          leftIcon={<Bot className="w-4 h-4" />} disabled={topicsMutation.isPending}>
          {topicsMutation.isPending ? 'Gerando...' : 'Gerar Pautas com IA'}
        </Button>

        <Link to="/admin/social/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>Novo Post</Button>
        </Link>

        <Link to="/admin/social/accounts">
          <Button variant="ghost" size="sm" leftIcon={<Settings className="w-4 h-4" />}>Contas</Button>
        </Link>
      </div>

      {/* AI Topics */}
      {showTopics && generatedTopics.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Pautas Sugeridas pela IA
            </h3>
            <button onClick={() => setShowTopics(false)} className="text-purple-600 hover:text-purple-800 text-sm">Fechar</button>
          </div>
          <div className="grid gap-3">
            {generatedTopics.map((topic, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-purple-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 line-clamp-2">{topic.caption}</p>
                      {topic.audience && (
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                          topic.audience === 'b2c_parents' ? 'bg-blue-100 text-blue-700' :
                          topic.audience === 'b2b_pediatricians' ? 'bg-emerald-100 text-emerald-700' :
                          topic.audience === 'b2b_lactation' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700')}>
                          {AUDIENCE_LABELS[topic.audience]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{topic.angle} · {topic.contentType}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.platforms.map(p => {
                        const cfg = PLATFORM_CONFIG[p.toUpperCase() as keyof typeof PLATFORM_CONFIG];
                        return cfg ? (
                          <span key={p} className={cn('px-2 py-0.5 rounded text-xs', cfg.color)}>{cfg.icon} {cfg.label}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" leftIcon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/admin/social/new', { state: { topic } })}>
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
            <Clock className="w-5 h-5" /> Fila de Aprovação ({reviewPosts.length})
          </h3>
          <div className="space-y-2">
            {reviewPosts.slice(0, 5).map((post: SocialPost) => (
              <div key={post.id} className="bg-white rounded-xl p-4 border border-amber-100 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2">{post.caption}</p>
                  <div className="flex gap-1 mt-1">
                    {post.platforms.map(pp => {
                      const cfg = PLATFORM_CONFIG[pp.account.platform];
                      return <span key={pp.id} className={cn('px-1.5 py-0.5 rounded text-xs', cfg?.color)}>{cfg?.icon}</span>;
                    })}
                    {post.aiGenerated && <span className="text-purple-600 text-xs ml-1">AI</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link to={`/admin/social/${post.id}/edit`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => reviewMutation.mutate({ id: post.id, approved: true })}
                    className="text-green-600 hover:bg-green-50" leftIcon={<CheckCircle className="w-4 h-4" />}>Aprovar</Button>
                  <Button variant="ghost" size="sm" onClick={() => reviewMutation.mutate({ id: post.id, approved: false })}
                    className="text-red-600 hover:bg-red-50" leftIcon={<XCircle className="w-4 h-4" />}>Devolver</Button>
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Plataformas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Carregando...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhum post encontrado</td></tr>
              ) : posts.map((post: SocialPost) => {
                const statusCfg = STATUS_CONFIG[post.status];
                return (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2 max-w-[300px]">{post.caption}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {post.aiGenerated && <span className="text-purple-600 mr-1">AI</span>}
                        {post.audience && AUDIENCE_LABELS[post.audience as ContentAudience]}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusCfg.color)}>{statusCfg.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {post.platforms.map(pp => {
                          const cfg = PLATFORM_CONFIG[pp.account.platform];
                          return <span key={pp.id} className={cn('px-1.5 py-0.5 rounded text-xs', cfg?.color)}>{cfg?.icon}</span>;
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR') :
                       post.scheduledAt ? `Agendado: ${new Date(post.scheduledAt).toLocaleDateString('pt-BR')}` :
                       new Date(post.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/social/${post.id}/edit`}>
                          <button className="p-2 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        </Link>
                        {post.status === 'APPROVED' && (
                          <button onClick={() => publishMutation.mutate(post.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Publicar">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Excluir este post?')) deleteMutation.mutate(post.id); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{pagination.total} posts · Página {pagination.page} de {pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminSocialPage;
