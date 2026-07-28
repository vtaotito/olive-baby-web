import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Loader2, FileText, Share2, CheckCircle, ExternalLink,
  RefreshCw, ArrowRight, ArrowLeft, ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';
import { AUDIENCE_LABELS, type ContentAudience } from '../../types/blog';
import { IMAGE_AGENT_TEMPLATES, type ImageAgentTemplateId } from '../../constants/imageAgent';
import { adminSocialService } from '../../services/socialApi';
import { adminBlogService } from '../../services/blogApi';
import {
  contentStudioApi,
  type ContentChannel,
  type ContentGenerateResult,
  type ContentQueueItem,
} from '../../services/contentStudioApi';

const AUDIENCE_ORDER: ContentAudience[] = [
  'b2c_parents',
  'b2b_pediatricians',
  'b2b_lactation',
  'b2b_caregivers',
];

const AUDIENCE_DEFAULT_TEMPLATE: Record<ContentAudience, ImageAgentTemplateId> = {
  b2c_parents: 'jardim',
  b2b_pediatricians: 'impulso',
  b2b_lactation: 'afeto',
  b2b_caregivers: 'essencial',
};

type Step = 'brief' | 'channels' | 'generate' | 'review';

const STEPS: Array<{ id: Step; label: string }> = [
  { id: 'brief', label: 'Brief' },
  { id: 'channels', label: 'Canais' },
  { id: 'generate', label: 'Gerar' },
  { id: 'review', label: 'Revisão' },
];

export function AdminContentStudioPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<Step>('brief');
  const [brief, setBrief] = useState('');
  const [angle, setAngle] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [audience, setAudience] = useState<ContentAudience>('b2c_parents');
  const [templateId, setTemplateId] = useState<ImageAgentTemplateId>('jardim');
  const [channels, setChannels] = useState<ContentChannel[]>(['blog']);
  const [accountIds, setAccountIds] = useState<number[]>([]);
  const [generateInlineImages, setGenerateInlineImages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStep, setGenerateStep] = useState('');
  const [result, setResult] = useState<ContentGenerateResult | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  const { data: accountsData } = useQuery({
    queryKey: ['admin-social-accounts'],
    queryFn: () => adminSocialService.listAccounts(),
  });
  const accounts = accountsData?.data || [];

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['admin-content-queue'],
    queryFn: () => contentStudioApi.getQueue(40),
  });
  const queueItems: ContentQueueItem[] = queueData?.data?.items || [];

  const keywords = useMemo(
    () => keywordsInput.split(',').map(k => k.trim()).filter(Boolean).slice(0, 20),
    [keywordsInput]
  );

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const toggleChannel = (ch: ContentChannel) => {
    setChannels(prev => {
      if (prev.includes(ch)) {
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== ch);
      }
      return [...prev, ch];
    });
  };

  const toggleAccount = (id: number) => {
    setAccountIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const canGoNext = () => {
    if (step === 'brief') return brief.trim().length >= 3;
    if (step === 'channels') return channels.length > 0;
    return true;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleGenerate = async () => {
    if (!brief.trim() || !channels.length) return;
    setIsGenerating(true);
    setGenerateStep('Gerando conteúdo com IA...');
    setResult(null);
    try {
      const response = await contentStudioApi.generate({
        brief: brief.trim(),
        angle: angle.trim() || undefined,
        audience,
        channels,
        targetKeywords: keywords.length ? keywords : undefined,
        templateId,
        accountIds: channels.includes('social') && accountIds.length ? accountIds : undefined,
        generateInlineImages: channels.includes('blog') ? generateInlineImages : undefined,
      });
      setResult(response.data);
      setGenerateStep('');
      setStep('review');
      void refetchQueue();
      success(
        response.data.qualityScore != null
          ? `Conteúdo gerado (qualidade ${response.data.qualityScore}/100)`
          : 'Conteúdo gerado e enviado para revisão'
      );
      if (response.data.errors?.length) {
        toastError(response.data.errors.map(e => `${e.channel}: ${e.message}`).join(' · '));
      }
    } catch {
      toastError('Falha ao gerar conteúdo. Tente novamente.');
      setGenerateStep('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (item: ContentQueueItem | { channel: ContentChannel; id: number }) => {
    try {
      if (item.channel === 'blog') {
        await adminBlogService.reviewPost(item.id, { approved: true });
      } else {
        await adminSocialService.reviewPost(item.id, { approved: true });
      }
      success('Aprovado');
      void refetchQueue();
      void queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-social'] });
    } catch {
      toastError('Erro ao aprovar');
    }
  };

  const handleRegenerate = async (channel: ContentChannel, id: number, part: string) => {
    const key = `${channel}-${id}-${part}`;
    setRegeneratingKey(key);
    try {
      await contentStudioApi.regenerate({
        channel,
        id,
        part: part as 'content' | 'seo' | 'cover' | 'caption' | 'social_image' | 'inline',
        audience,
        templateId,
      });
      success('Parte regenerada');
      void refetchQueue();
      if (result?.blogPostId === id && channel === 'blog') {
        const refreshed = await adminBlogService.getPost(id);
        if (refreshed.data) {
          setResult(prev => prev ? {
            ...prev,
            blog: {
              id: refreshed.data.id,
              title: refreshed.data.title,
              slug: refreshed.data.slug,
              excerpt: refreshed.data.excerpt,
              coverImageUrl: refreshed.data.coverImageUrl,
              status: refreshed.data.status,
            },
            qualityScore: refreshed.data.qualityScore ?? prev.qualityScore,
          } : prev);
        }
      }
      if (result?.socialPostId === id && channel === 'social') {
        const refreshed = await adminSocialService.getPost(id);
        if (refreshed.data) {
          setResult(prev => prev ? {
            ...prev,
            social: {
              id: refreshed.data.id,
              caption: refreshed.data.caption,
              mediaUrls: refreshed.data.mediaUrls,
              status: refreshed.data.status,
              audience: refreshed.data.audience,
            },
          } : prev);
        }
      }
    } catch {
      toastError('Falha ao regenerar');
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handleSocialFromBlog = async (blogPostId: number) => {
    try {
      const created = await contentStudioApi.createSocialFromBlog({
        blogPostId,
        accountIds: accountIds.length ? accountIds : undefined,
      });
      success('Post social criado a partir do blog');
      if (created.data?.id) navigate(`/admin/social/${created.data.id}/edit`);
    } catch {
      toastError('Erro ao criar post social a partir do blog');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Brief → canais → geração com IA → revisão. Blog e Social na mesma fila.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (i <= stepIndex || (s.id === 'review' && result)) setStep(s.id);
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                step === s.id
                  ? 'bg-olive-600 text-white'
                  : i < stepIndex
                    ? 'bg-olive-50 text-olive-800'
                    : 'bg-gray-100 text-gray-500'
              )}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* Step: Brief */}
        {step === 'brief' && (
          <div className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tema / brief</label>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={3}
                placeholder="Ex: Como estabelecer a rotina de sono do bebê nos primeiros 6 meses"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ângulo (opcional)</label>
              <input
                value={angle}
                onChange={e => setAngle(e.target.value)}
                placeholder="Ex: foco em evidências SBP e dicas práticas para pais cansados"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Audiência</label>
                <select
                  value={audience}
                  onChange={e => {
                    const next = e.target.value as ContentAudience;
                    setAudience(next);
                    setTemplateId(AUDIENCE_DEFAULT_TEMPLATE[next]);
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
                >
                  {AUDIENCE_ORDER.map(a => (
                    <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Template visual</label>
                <select
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value as ImageAgentTemplateId)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
                >
                  {IMAGE_AGENT_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords (separadas por vírgula)</label>
              <input
                value={keywordsInput}
                onChange={e => setKeywordsInput(e.target.value)}
                placeholder="sono do bebê, rotina noturna, ..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={goNext} disabled={!canGoNext()} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step: Channels */}
        {step === 'channels' && (
          <div className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-600">Escolha onde gerar a partir deste brief.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleChannel('blog')}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                  channels.includes('blog') ? 'border-olive-500 bg-olive-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <FileText className="w-5 h-5 text-olive-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Blog</p>
                  <p className="text-xs text-gray-500 mt-0.5">Artigo Markdown + SEO + capa</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleChannel('social')}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                  channels.includes('social') ? 'border-olive-500 bg-olive-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Share2 className="w-5 h-5 text-olive-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Social</p>
                  <p className="text-xs text-gray-500 mt-0.5">Legenda Instagram + imagem</p>
                </div>
              </button>
            </div>

            {channels.includes('blog') && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={generateInlineImages}
                  onChange={e => setGenerateInlineImages(e.target.checked)}
                />
                Gerar imagens nas seções do artigo (mais lento)
              </label>
            )}

            {channels.includes('social') && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Contas sociais (opcional)</p>
                {accounts.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Nenhuma conta cadastrada.{' '}
                    <Link to="/admin/social/accounts" className="text-olive-700 underline">Cadastrar</Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccount(acc.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                          accountIds.includes(acc.id)
                            ? 'bg-olive-100 border-olive-400 text-olive-800'
                            : 'bg-white border-gray-200 text-gray-600'
                        )}
                      >
                        {acc.platform} · {acc.accountName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={goBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>Voltar</Button>
              <Button onClick={goNext} disabled={!canGoNext()} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step: Generate */}
        {step === 'generate' && (
          <div className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
              <p><strong>Brief:</strong> {brief}</p>
              {angle && <p><strong>Ângulo:</strong> {angle}</p>}
              <p><strong>Audiência:</strong> {AUDIENCE_LABELS[audience]}</p>
              <p><strong>Canais:</strong> {channels.join(', ')}</p>
              <p><strong>Template:</strong> {templateId}</p>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Button variant="ghost" onClick={goBack} disabled={isGenerating} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Voltar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? (generateStep || 'Gerando...') : 'Gerar com IA'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            {result && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Gerado agora</h2>
                {result.blog && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-olive-700" />
                        <span className="text-xs font-semibold uppercase text-olive-700">Blog</span>
                        {result.qualityScore != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            Qualidade {result.qualityScore}/100
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="ghost" onClick={() => handleRegenerate('blog', result.blog!.id, 'cover')} disabled={!!regeneratingKey}>
                          <ImageIcon className="w-3.5 h-3.5 mr-1" /> Capa
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRegenerate('blog', result.blog!.id, 'content')} disabled={!!regeneratingKey}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Conteúdo
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSocialFromBlog(result.blog!.id)}>
                          <Share2 className="w-3.5 h-3.5 mr-1" /> Virar social
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleApprove({ channel: 'blog', id: result.blog!.id })} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                          Aprovar
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/admin/blog/${result.blog!.id}/edit`)} leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Abrir editor
                        </Button>
                      </div>
                    </div>
                    {result.blog.coverImageUrl && (
                      <img src={result.blog.coverImageUrl} alt="" className="w-full max-h-48 object-cover rounded-xl" />
                    )}
                    <p className="font-semibold text-gray-900">{result.blog.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{result.blog.excerpt}</p>
                  </div>
                )}

                {result.social && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-olive-700" />
                        <span className="text-xs font-semibold uppercase text-olive-700">Social</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="ghost" onClick={() => handleRegenerate('social', result.social!.id, 'caption')} disabled={!!regeneratingKey}>
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Legenda
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRegenerate('social', result.social!.id, 'social_image')} disabled={!!regeneratingKey}>
                          <ImageIcon className="w-3.5 h-3.5 mr-1" /> Imagem
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleApprove({ channel: 'social', id: result.social!.id })} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                          Aprovar
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/admin/social/${result.social!.id}/edit`)} leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Abrir editor
                        </Button>
                      </div>
                    </div>
                    {result.social.mediaUrls?.[0] && (
                      <img src={result.social.mediaUrls[0]} alt="" className="w-full max-h-64 object-cover rounded-xl" />
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">{result.social.caption}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Fila de revisão ({queueItems.length})
                </h2>
                <Button size="sm" variant="ghost" onClick={() => { setResult(null); setStep('brief'); setBrief(''); }}>
                  Novo brief
                </Button>
              </div>
              {queueItems.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nada em revisão no momento.</p>
              ) : (
                <div className="space-y-3">
                  {queueItems.map(item => (
                    <div key={`${item.channel}-${item.id}`} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-olive-700">{item.channel}</span>
                          {item.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">AI</span>}
                          {item.qualityScore != null && (
                            <span className="text-[10px] text-violet-700">{item.qualityScore}/100</span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.excerpt}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => handleApprove(item)}>Aprovar</Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(item.editPath)}>Editar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminContentStudioPage;
