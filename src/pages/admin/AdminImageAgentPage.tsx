import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Download, ImageIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { ImageAgentCanvas } from '../../components/admin/image-agent/ImageAgentCanvas';
import {
  IMAGE_AGENT_FORMATS,
  IMAGE_AGENT_TEMPLATES,
  IMAGE_PROVIDER_LABELS,
  type ImageAgentFormat,
  type ImageAgentPostData,
  type ImageAgentTemplateId,
  type ImageGenerationProvider,
} from '../../constants/imageAgent';
import { imageAgentService } from '../../services/imageAgentApi';
import { cn } from '../../lib/utils';

export function AdminImageAgentPage() {
  const [searchParams] = useSearchParams();
  const initialFormat = (searchParams.get('format') === 'instagram' ? 'instagram' : 'blog') as ImageAgentFormat;

  const [format, setFormat] = useState<ImageAgentFormat>(initialFormat);
  const [templateId, setTemplateId] = useState<ImageAgentTemplateId>('essencial');
  const [topico, setTopico] = useState(searchParams.get('topico') || '');
  const [destaque, setDestaque] = useState('');
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [hashtagsText, setHashtagsText] = useState('#oliecare #maternidade');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState('');
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [providers, setProviders] = useState<ImageGenerationProvider[]>([]);
  const [imageProvider, setImageProvider] = useState<ImageGenerationProvider>('gemini');
  const [lastGeneratedProvider, setLastGeneratedProvider] = useState<ImageGenerationProvider | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    imageAgentService
      .getConfig()
      .then(result => {
        if (result.data) {
          setProviders(result.data.providers);
          setImageProvider(result.data.defaultProvider);
        }
      })
      .catch(() => {
        setProviders(['pollinations']);
        setImageProvider('pollinations');
      });
  }, []);

  const postData: ImageAgentPostData = {
    destaque,
    titulo,
    corpo,
    hashtags: hashtagsText.split(/[\s,]+/).filter(Boolean),
    backgroundImageUrl: backgroundImageUrl || undefined,
  };

  const dims = IMAGE_AGENT_FORMATS[format];
  const previewScale = format === 'instagram' ? 0.43 : Math.min(640 / 1200, 0.53);

  const switchFormat = (f: ImageAgentFormat) => {
    setFormat(f);
    setTemplateId('essencial');
  };

  const generateContent = async () => {
    if (!topico.trim()) {
      setError('Informe o tópico antes de gerar.');
      return;
    }
    setError('');
    setLoadingCopy(true);
    try {
      const result = await imageAgentService.generateCopy({ topico, format, templateId });
      if (result.data) {
        setDestaque(result.data.destaque);
        setTitulo(result.data.titulo);
        setCorpo(result.data.corpo);
        setHashtagsText(result.data.hashtags.join(' '));
      }
    } catch {
      setError('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setLoadingCopy(false);
    }
  };

  const generateImage = async () => {
    const topic = topico.trim() || titulo.trim();
    if (!topic) {
      setError('Informe o tópico ou título antes de gerar a imagem.');
      return;
    }
    setError('');
    setLoadingImage(true);
    try {
      const result = await imageAgentService.generateImage({
        topico: topic,
        excerpt: corpo || destaque,
        customPrompt: customPrompt || undefined,
        format,
        templateId,
        provider: imageProvider,
      });
      if (result.data?.imageUrl) {
        setBackgroundImageUrl(result.data.imageUrl);
        setLastGeneratedProvider(result.data.provider);
      }
    } catch {
      setError(`Erro ao gerar imagem (${IMAGE_PROVIDER_LABELS[imageProvider]}). Verifique a API key no servidor.`);
    } finally {
      setLoadingImage(false);
    }
  };

  const downloadPng = async () => {
    const el = document.getElementById('image-agent-export-root');
    if (!el) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `oliecare-${format}-${templateId}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      setError('Erro ao exportar PNG.');
    } finally {
      setDownloading(false);
    }
  };

  const applyUrl = format === 'blog' ? '/admin/blog/new' : '/admin/social/new';

  return (
    <AdminLayout
      title="Agente de Imagens"
      subtitle="Templates OlieCare com geração via Gemini, OpenAI ou Pollinations — blog e redes sociais"
    >
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Painel esquerdo */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tipo de imagem
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['blog', 'instagram'] as ImageAgentFormat[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => switchFormat(f)}
                    className={cn(
                      'px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                      format === f
                        ? 'bg-olive-600 text-white border-olive-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-olive-300'
                    )}
                  >
                    {IMAGE_AGENT_FORMATS[f].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Template visual
              </label>
              <div className="grid grid-cols-2 gap-2">
                {IMAGE_AGENT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                      templateId === t.id
                        ? 'border-olive-500 bg-olive-50 text-olive-800'
                        : 'border-gray-200 hover:border-olive-200'
                    )}
                  >
                    <span className="font-semibold block">{t.label}</span>
                    <span className="text-xs text-gray-500">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tópico do post</label>
              <textarea
                value={topico}
                onChange={e => { setTopico(e.target.value); setError(''); }}
                rows={3}
                placeholder="Ex.: Benefícios da amamentação nos primeiros 6 meses"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-olive-200 focus:outline-none"
              />
            </div>

            <Button
              fullWidth
              onClick={generateContent}
              disabled={loadingCopy}
              leftIcon={loadingCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {loadingCopy ? 'Gerando texto...' : 'Gerar texto com IA (OpenAI)'}
            </Button>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <input
                value={destaque}
                onChange={e => setDestaque(e.target.value)}
                placeholder="Destaque"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <textarea
                value={corpo}
                onChange={e => setCorpo(e.target.value)}
                placeholder="Corpo do post"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <input
                value={hashtagsText}
                onChange={e => setHashtagsText(e.target.value)}
                placeholder="#oliecare #maternidade"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Provedor de imagem
              </label>
              {providers.length === 0 ? (
                <p className="text-sm text-gray-500">Carregando provedores...</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {providers.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setImageProvider(p)}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                        imageProvider === p
                          ? 'border-olive-500 bg-olive-50 text-olive-800'
                          : 'border-gray-200 hover:border-olive-200'
                      )}
                    >
                      <span className="font-semibold">{IMAGE_PROVIDER_LABELS[p]}</span>
                      {p === 'gemini' && (
                        <span className="block text-xs text-gray-500 mt-0.5">Recomendado — gemini-2.5-flash-image</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt extra (imagem IA)</label>
              <textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                rows={2}
                placeholder="Opcional — refinamento do fundo fotográfico"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={generateImage}
              disabled={loadingImage || providers.length === 0}
              leftIcon={loadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            >
              {loadingImage
                ? 'Gerando imagem...'
                : `Gerar foto de fundo (${IMAGE_PROVIDER_LABELS[imageProvider]})`}
            </Button>

            {lastGeneratedProvider && backgroundImageUrl && (
              <p className="text-xs text-gray-500">
                Última imagem gerada com {IMAGE_PROVIDER_LABELS[lastGeneratedProvider]}.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              fullWidth
              onClick={downloadPng}
              disabled={downloading}
              leftIcon={downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              Exportar PNG
            </Button>
            {backgroundImageUrl && (
              <Link
                to={applyUrl}
                state={{
                  coverImageUrl: backgroundImageUrl,
                  title: titulo,
                  excerpt: corpo,
                }}
                className="text-center text-sm text-olive-600 hover:text-olive-700 font-medium py-2"
              >
                Usar no editor de {format === 'blog' ? 'blog' : 'redes sociais'} →
              </Link>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <ImageIcon className="w-4 h-4" />
            Preview — {dims.width}×{dims.height}
          </div>
          <div
            ref={previewRef}
            className="overflow-auto max-w-full rounded-xl border border-gray-200 bg-[#738251]/10 p-6"
            style={{ maxHeight: 'calc(100vh - 220px)' }}
          >
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
                width: dims.width,
                height: dims.height,
              }}
            >
              <ImageAgentCanvas format={format} templateId={templateId} data={postData} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminImageAgentPage;
