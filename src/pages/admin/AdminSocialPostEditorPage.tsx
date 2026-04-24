import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Send, CheckCircle, XCircle, Archive, Bot, ImageIcon, Calendar,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminSocialService } from '../../services/socialApi';
import { cn } from '../../lib/utils';
import type { SocialTopicSuggestion, SocialPlatform, ContentAudience } from '../../types/social';
import { PLATFORM_CONFIG, AUDIENCE_LABELS } from '../../types/social';

export function AdminSocialPostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const topicFromNav = (location.state as { topic?: SocialTopicSuggestion })?.topic;

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [audience, setAudience] = useState<ContentAudience | ''>('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: postData } = useQuery({
    queryKey: ['admin-social-post', id],
    queryFn: () => adminSocialService.getPost(parseInt(id!)),
    enabled: isEditing,
  });

  const { data: accountsData } = useQuery({
    queryKey: ['admin-social-accounts'],
    queryFn: () => adminSocialService.listAccounts(),
  });

  const post = postData?.data;
  const accounts = accountsData?.data || [];

  useEffect(() => {
    if (post && isEditing) {
      setCaption(post.caption);
      setHashtags(post.hashtags);
      setMediaUrls(post.mediaUrls);
      setAudience((post.audience as ContentAudience) || '');
      setSelectedAccounts(post.platforms.map(p => p.accountId));
      setScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '');
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (topicFromNav && !isEditing) {
      setCaption(topicFromNav.caption);
      setHashtags(topicFromNav.hashtags || []);
      setAudience(topicFromNav.audience || '');
    }
  }, [topicFromNav, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (status?: 'DRAFT' | 'IN_REVIEW') => {
      const data = {
        caption, hashtags, mediaUrls,
        audience: audience || undefined,
        accountIds: selectedAccounts,
        scheduledAt: scheduledAt || undefined,
        status,
      };
      if (isEditing) return adminSocialService.updatePost(parseInt(id!), data);
      return adminSocialService.createPost(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-social'] });
      if (!isEditing && result.data) navigate(`/admin/social/${result.data.id}/edit`, { replace: true });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ approved, notes }: { approved: boolean; notes?: string }) =>
      adminSocialService.reviewPost(parseInt(id!), { approved, reviewNotes: notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social'] }),
  });

  const publishMutation = useMutation({
    mutationFn: () => adminSocialService.publishPost(parseInt(id!)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social'] }),
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminSocialService.archivePost(parseInt(id!)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-social'] }); navigate('/admin/social'); },
  });

  const handleGenerateCaption = async () => {
    if (!caption) return;
    setIsGenerating(true);
    try {
      const platforms = selectedAccounts.length > 0
        ? accounts.filter(a => selectedAccounts.includes(a.id)).map(a => a.platform.toLowerCase())
        : ['instagram'];
      const result = await adminSocialService.generateCaption({
        idea: caption, audience: audience || undefined, platforms,
      });
      if (result.data) {
        setCaption(result.data.caption);
        if (result.data.hashtags?.length) setHashtags(result.data.hashtags);
      }
    } finally { setIsGenerating(false); }
  };

  const handleGenerateImage = async () => {
    try {
      const result = await adminSocialService.generateImage({
        caption: caption.substring(0, 200),
        postId: isEditing ? parseInt(id!) : undefined,
      });
      if (result.data?.imageUrl) setMediaUrls([...mediaUrls, result.data.imageUrl]);
    } catch {}
  };

  const toggleAccount = (accountId: number) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const selectedPlatforms = accounts.filter(a => selectedAccounts.includes(a.id));
  const minChars = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(a => PLATFORM_CONFIG[a.platform]?.maxChars || 2200))
    : 2200;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/social')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Post Social' : 'Novo Post Social'}</h1>
            {post && <p className="text-sm text-gray-500 mt-0.5">Status: {post.status}{post.aiGenerated ? ' · AI' : ''}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && post?.status === 'IN_REVIEW' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => reviewMutation.mutate({ approved: true })}
                className="text-green-600 hover:bg-green-50" leftIcon={<CheckCircle className="w-4 h-4" />}>Aprovar</Button>
              <Button variant="ghost" size="sm" onClick={() => reviewMutation.mutate({ approved: false })}
                className="text-red-600 hover:bg-red-50" leftIcon={<XCircle className="w-4 h-4" />}>Devolver</Button>
            </>
          )}
          {isEditing && post?.status === 'APPROVED' && (
            <Button size="sm" onClick={() => publishMutation.mutate()} leftIcon={<Send className="w-4 h-4" />}>Publicar</Button>
          )}
          {isEditing && post?.status === 'PUBLISHED' && (
            <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate()} leftIcon={<Archive className="w-4 h-4" />}>Arquivar</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => saveMutation.mutate('DRAFT')} disabled={saveMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}>Salvar Rascunho</Button>
          <Button size="sm" onClick={() => saveMutation.mutate('IN_REVIEW')} disabled={saveMutation.isPending || !caption}
            leftIcon={<Send className="w-4 h-4" />}>Enviar para Revisão</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Caption */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Legenda</label>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs', caption.length > minChars ? 'text-red-600 font-medium' : 'text-gray-400')}>
                  {caption.length}/{minChars}
                </span>
                <Button variant="ghost" size="sm" onClick={handleGenerateCaption} disabled={isGenerating || !caption}
                  leftIcon={<Bot className="w-3.5 h-3.5" />} className="text-purple-600 hover:bg-purple-50">
                  {isGenerating ? 'Gerando...' : 'Refinar com IA'}
                </Button>
              </div>
            </div>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva a legenda do post..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 resize-y" />
          </div>

          {/* Hashtags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Hashtags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hashtags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-olive-100 text-olive-700 rounded text-xs flex items-center gap-1">
                  #{tag}
                  <button onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))} className="hover:text-red-600">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={hashtagInput} onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = hashtagInput.trim().replace(/^#/, ''); if (v && !hashtags.includes(v)) setHashtags([...hashtags, v]); setHashtagInput(''); } }}
                placeholder="Adicionar hashtag..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200" />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Mídia</label>
              <Button variant="ghost" size="sm" onClick={handleGenerateImage} disabled={!caption}
                leftIcon={<ImageIcon className="w-3.5 h-3.5" />} className="text-purple-600 hover:bg-purple-50">Gerar com IA</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full aspect-square rounded-lg object-cover" />
                  <button onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Platforms */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Plataformas</label>
            {accounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 mb-2">Nenhuma conta conectada</p>
                <Link to="/admin/social/accounts"><Button variant="ghost" size="sm">Conectar contas</Button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.filter(a => a.isActive).map(account => {
                  const cfg = PLATFORM_CONFIG[account.platform];
                  const selected = selectedAccounts.includes(account.id);
                  return (
                    <button key={account.id} onClick={() => toggleAccount(account.id)}
                      className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                        selected ? 'border-olive-300 bg-olive-50 ring-1 ring-olive-200' : 'border-gray-200 hover:border-gray-300')}>
                      <span className="text-lg">{cfg?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                        <p className="text-xs text-gray-500">{cfg?.label}</p>
                      </div>
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        selected ? 'border-olive-600 bg-olive-600' : 'border-gray-300')}>
                        {selected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Audiência</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value as ContentAudience | '')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200">
              <option value="">Geral</option>
              {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Agendamento
            </label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200" />
            {scheduledAt && <button onClick={() => setScheduledAt('')} className="text-xs text-red-500 mt-1 hover:underline">Remover agendamento</button>}
          </div>

          {/* Post Info */}
          {post && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700">Informações</h3>
              <p>Criado: {new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
              {post.publishedAt && <p>Publicado: {new Date(post.publishedAt).toLocaleDateString('pt-BR')}</p>}
              {post.reviewNotes && (
                <div className="p-2 bg-amber-50 rounded-lg text-amber-800 text-xs">
                  <strong>Notas:</strong> {post.reviewNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSocialPostEditorPage;
