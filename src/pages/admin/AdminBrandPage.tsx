import { useState } from 'react';
import { Download, Copy, Check, Palette, Type, Image as ImageIcon, Shield, ExternalLink, FileText } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { LogoIcon, LogoMark } from '../../components/brand/OlieCareLogo';
import { cn } from '../../lib/utils';

type Section = 'logos' | 'cores' | 'tipografia' | 'aplicacoes' | 'regras' | 'downloads';

const SECTIONS: Array<{ id: Section; label: string; icon: typeof Shield }> = [
  { id: 'logos', label: 'Variações', icon: ImageIcon },
  { id: 'cores', label: 'Paleta', icon: Palette },
  { id: 'tipografia', label: 'Tipografia', icon: Type },
  { id: 'aplicacoes', label: 'Aplicações', icon: Shield },
  { id: 'regras', label: 'Regras de Uso', icon: FileText },
  { id: 'downloads', label: 'Downloads', icon: Download },
];

const COLORS = [
  { name: 'Olive Primary', hex: '#738251', varName: 'olive-600', tone: 'dark' },
  { name: 'Olive Dark', hex: '#5a6641', varName: 'olive-700', tone: 'dark' },
  { name: 'Olive 500', hex: '#8fa066', varName: 'olive-500', tone: 'dark' },
  { name: 'Olive 400', hex: '#a8b683', varName: 'olive-400', tone: 'light' },
  { name: 'Olive 100', hex: '#eef0e6', varName: 'olive-100', tone: 'light' },
  { name: 'Olive Light', hex: '#f7f8f3', varName: 'olive-50', tone: 'light' },
  { name: 'Sand', hex: '#f9f6f1', varName: 'sand-100', tone: 'light' },
  { name: 'Peach Accent', hex: '#f26d3d', varName: 'peach-500', tone: 'dark' },
];

const PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      title="Copiar"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
      {label || (copied ? 'Copiado!' : 'Copiar')}
    </button>
  );
}

function DownloadButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      download
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        primary 
          ? 'bg-olive-600 text-white hover:bg-olive-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      <Download className="w-3 h-3" />
      {label}
    </a>
  );
}

export function AdminBrandPage() {
  const [activeSection, setActiveSection] = useState<Section>('logos');

  return (
    <AdminLayout
      title="Identidade Visual"
      subtitle="Manual da marca OlieCare • Todas as variações, cores, tipografia e aplicações"
    >
      {/* Navegação interna */}
      <div className="mb-6 sticky top-0 z-10 -mx-6 px-6 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeSection === id
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-olive-50 via-white to-sand-50 rounded-3xl p-8 md:p-12 border border-olive-100 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <LogoIcon size={120} className="drop-shadow-xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 text-olive-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Versão 1.1 • Abril 2026
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-3 tracking-tight">
              Manual da Marca OlieCare
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              Guia completo da identidade visual para garantir consistência em todas as plataformas e materiais.
              Use os assets oficiais em <code className="bg-white px-1.5 py-0.5 rounded text-olive-700">/brand/</code> 
              ou baixe diretamente pelos links abaixo.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
              <a 
                href="/brand-manual.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-olive-600 text-white rounded-xl hover:bg-olive-700 transition-colors font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Manual Externo
              </a>
              <a 
                href="/brand/oliecare-logo-icon.svg" 
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Baixar Logo (SVG)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Variações */}
      <section id="section-logos" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">01 • Variações</p>
            <h3 className="text-2xl font-bold text-gray-900">Logo & Símbolo</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Icon */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex justify-center items-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 h-56">
              <LogoIcon size={120} />
            </div>
            <div className="p-5 border-t border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Principal</div>
              <h4 className="font-bold text-gray-900 mb-1">Logo Icon</h4>
              <p className="text-xs text-gray-500 mb-4">Com fundo. App icons, favicons, avatares.</p>
              <div className="flex gap-2">
                <DownloadButton href="/brand/oliecare-logo-icon.svg" label="SVG" primary />
                <DownloadButton href="/brand/png/oliecare-logo-icon-512.png" label="PNG" />
              </div>
            </div>
          </div>

          {/* Mark */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex justify-center items-center p-12 bg-gradient-to-br from-olive-50 to-olive-100 h-56">
              <LogoMark size={90} />
            </div>
            <div className="p-5 border-t border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Símbolo</div>
              <h4 className="font-bold text-gray-900 mb-1">Logo Mark</h4>
              <p className="text-xs text-gray-500 mb-4">Folha isolada. Ícones pequenos e minimalistas.</p>
              <div className="flex gap-2">
                <DownloadButton href="/brand/oliecare-logo-mark.svg" label="SVG" primary />
                <DownloadButton href="/brand/png/oliecare-logo-mark-512.png" label="PNG" />
              </div>
            </div>
          </div>

          {/* Horizontal */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex justify-center items-center p-8 bg-white h-56 border border-gray-100">
              <img src="/brand/oliecare-logo-horizontal.svg" alt="Logo Horizontal" className="max-w-full max-h-full" />
            </div>
            <div className="p-5 border-t border-gray-100">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Completa</div>
              <h4 className="font-bold text-gray-900 mb-1">Logo Horizontal</h4>
              <p className="text-xs text-gray-500 mb-4">Símbolo + nome. Headers, emails, cartões.</p>
              <div className="flex gap-2">
                <DownloadButton href="/brand/oliecare-logo-horizontal.svg" label="SVG" primary />
                <DownloadButton href="/brand/png/oliecare-logo-horizontal-512.png" label="PNG" />
              </div>
            </div>
          </div>
        </div>

        {/* Dark version */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center border border-gray-800">
            <img src="/brand/oliecare-logo-horizontal-dark.svg" alt="Logo Dark" className="max-w-full h-20" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Alternativa</div>
            <h4 className="font-bold text-gray-900 mb-2">Versão Dark</h4>
            <p className="text-sm text-gray-600 mb-4">Use em fundos escuros (modo noturno, banners, mídias sociais).</p>
            <div>
              <DownloadButton href="/brand/oliecare-logo-horizontal-dark.svg" label="SVG Dark" primary />
            </div>
          </div>
        </div>
      </section>

      {/* Seção Cores */}
      <section id="section-cores" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">02 • Paleta</p>
            <h3 className="text-2xl font-bold text-gray-900">Cores Oficiais</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COLORS.map((color) => (
            <div key={color.hex} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="h-28"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 text-sm">{color.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-mono">{color.hex}</span>
                  <CopyButton text={color.hex} label="" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">tailwind: <span className="text-olive-700">{color.varName}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-olive-50 border border-olive-200 rounded-2xl p-5">
          <h4 className="font-semibold text-olive-900 mb-2 text-sm">Regras de Uso de Cor</h4>
          <ul className="space-y-1.5 text-sm text-olive-800">
            <li>• <strong>Primária</strong>: <code className="bg-white px-1.5 py-0.5 rounded text-xs">#738251</code> - use em ~60% dos elementos</li>
            <li>• <strong>Secundária</strong>: <code className="bg-white px-1.5 py-0.5 rounded text-xs">#5a6641</code> - textos, hovers, botões</li>
            <li>• <strong>Destaque</strong>: <code className="bg-white px-1.5 py-0.5 rounded text-xs">#f26d3d</code> - máx 10%, apenas CTAs</li>
            <li>• <strong>Fundos suaves</strong>: Olive Light e Sand para criar respiros</li>
          </ul>
        </div>
      </section>

      {/* Seção Tipografia */}
      <section id="section-tipografia" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">03 • Tipografia</p>
            <h3 className="text-2xl font-bold text-gray-900">Fontes Oficiais</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Primária • Headings</div>
            <p className="font-display text-5xl font-bold text-gray-900 mb-3 tracking-tighter">DM Sans</p>
            <p className="text-sm text-gray-600 mb-4">Logo, títulos e elementos de destaque. Sans-serif geométrica moderna.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">700 Bold</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">500 Medium</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">-0.02em tracking</span>
            </div>
            <div className="mt-4">
              <CopyButton text="font-display" label="font-display" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Secundária • Corpo</div>
            <p className="font-sans text-5xl font-semibold text-gray-900 mb-3">Inter</p>
            <p className="text-sm text-gray-600 mb-4">Textos corridos, UI, legendas. Alta legibilidade em qualquer tamanho.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">400 Regular</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">500 Medium</span>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">600 SemiBold</span>
            </div>
            <div className="mt-4">
              <CopyButton text="font-sans" label="font-sans" />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Editorial • Opcional</p>
          <p className="font-editorial text-4xl text-gray-900 italic">"Acompanhe cada momento."</p>
          <p className="text-xs text-gray-500 mt-2">Lora - use apenas para citações e conteúdo emocional em landing pages.</p>
        </div>
      </section>

      {/* Seção Aplicações */}
      <section id="section-aplicacoes" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">04 • Mockups</p>
            <h3 className="text-2xl font-bold text-gray-900">Exemplos de Aplicação</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Instagram Story */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-olive-600 to-olive-700 aspect-[9/16] flex items-center justify-center p-8 relative">
              <div className="text-center">
                <LogoMark size={80} color="#ffffff" />
                <h4 className="text-white font-display font-bold text-2xl mt-4">OlieCare</h4>
                <p className="text-olive-100 text-xs tracking-widest mt-1">ROTINA • SAÚDE</p>
                <p className="text-white/90 text-sm italic mt-8 px-4">"Cada dia um novo descobrir."</p>
              </div>
              <span className="absolute bottom-4 text-white/50 text-[10px]">@oliecare</span>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm text-gray-900">Instagram Story</h4>
              <p className="text-xs text-gray-500">1080×1920px • Fundo olive escuro</p>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-xl m-4 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-olive-700 to-olive-600 relative flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <LogoIcon size={36} />
                  <span className="text-white font-display font-bold text-xl">OlieCare</span>
                </div>
              </div>
              <div className="p-4 -mt-8 relative">
                <div className="w-14 h-14 bg-white rounded-full border-4 border-white shadow flex items-center justify-center">
                  <LogoIcon size={44} />
                </div>
                <h4 className="font-bold text-sm mt-2 text-gray-900">OlieCare</h4>
                <p className="text-[11px] text-gray-500">Saúde Infantil • SaaS</p>
                <p className="text-[11px] text-gray-600 mt-1">Plataforma de acompanhamento de rotina do bebê</p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <h4 className="font-semibold text-sm text-gray-900">LinkedIn Company</h4>
              <p className="text-xs text-gray-500">Banner 1584×396px • Avatar 400×400px</p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-500 font-mono mb-2">De: suporte@oliecare.cloud</p>
              <div className="bg-white rounded-lg p-3 text-[11px] text-gray-700">
                Olá! Estamos aqui para ajudar. Qualquer dúvida sobre o app, é só responder este e-mail.
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <LogoIcon size={40} />
              <div>
                <div className="font-bold text-sm text-olive-700">Equipe OlieCare</div>
                <div className="text-[10px] text-gray-500">suporte@oliecare.cloud</div>
                <div className="text-[9px] text-gray-400 tracking-wider mt-0.5">ROTINA • SAÚDE • CRESCIMENTO</div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <h4 className="font-semibold text-sm text-gray-900">Email Signature</h4>
              <p className="text-xs text-gray-500">Altura recomendada: 80px</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Regras */}
      <section id="section-regras" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">05 • Regras</p>
            <h3 className="text-2xl font-bold text-gray-900">Do's & Don'ts</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-emerald-800">Faça Sempre</h4>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-700">
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Manter proporções originais (1:1 para ícones)</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Respeitar espaço mínimo (25% da altura da logo)</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Usar SVG sempre que possível (escalável)</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Aplicar versão dark em fundos escuros</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Manter <code className="bg-gray-100 px-1 rounded text-xs">#738251</code> como cor primária</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Tamanho mínimo digital: 32px • impresso: 15mm</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border-2 border-rose-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-bold">
                ✕
              </div>
              <h4 className="font-bold text-rose-800">Nunca Faça</h4>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-700">
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Distorcer, inclinar ou espelhar a logo</li>
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Adicionar sombras, gradientes ou brilhos decorativos</li>
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Alterar as cores oficiais da marca</li>
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Colocar em fundos de baixo contraste</li>
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Girar, remover ou cortar partes do símbolo</li>
              <li className="flex gap-2"><span className="text-rose-500 flex-shrink-0">✕</span>Usar versões antigas ou não oficiais</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Seção Downloads */}
      <section id="section-downloads" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-olive-600 uppercase tracking-wider mb-1">06 • Assets</p>
            <h3 className="text-2xl font-bold text-gray-900">Downloads Completos</h3>
            <p className="text-sm text-gray-500 mt-1">Clique para baixar os arquivos individualmente.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* SVGs */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-olive-100 text-olive-700 rounded-md flex items-center justify-center text-xs font-bold">S</span>
              SVGs (Vetores)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <DownloadButton href="/brand/oliecare-logo-icon.svg" label="Logo Icon" primary />
              <DownloadButton href="/brand/oliecare-logo-mark.svg" label="Logo Mark" primary />
              <DownloadButton href="/brand/oliecare-logo-horizontal.svg" label="Horizontal" primary />
              <DownloadButton href="/brand/oliecare-logo-horizontal-dark.svg" label="Horizontal Dark" primary />
            </div>
          </div>

          {/* PNGs Icon */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-olive-100 text-olive-700 rounded-md flex items-center justify-center text-xs font-bold">I</span>
              PNGs Icon
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PNG_SIZES.map((size) => (
                <DownloadButton 
                  key={size}
                  href={`/brand/png/oliecare-logo-icon-${size}.png`} 
                  label={`${size}px`}
                  primary={size === 512}
                />
              ))}
              <DownloadButton href="/brand/png/favicon.ico" label="favicon.ico" />
            </div>
          </div>

          {/* PNGs Mark */}
          <div className="p-6 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-olive-100 text-olive-700 rounded-md flex items-center justify-center text-xs font-bold">M</span>
              PNGs Mark
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PNG_SIZES.map((size) => (
                <DownloadButton 
                  key={size}
                  href={`/brand/png/oliecare-logo-mark-${size}.png`} 
                  label={`${size}px`}
                  primary={size === 512}
                />
              ))}
            </div>
          </div>

          {/* PNGs Horizontal */}
          <div className="p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-olive-100 text-olive-700 rounded-md flex items-center justify-center text-xs font-bold">H</span>
              PNGs Horizontal
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PNG_SIZES.map((size) => (
                <DownloadButton 
                  key={size}
                  href={`/brand/png/oliecare-logo-horizontal-${size}.png`} 
                  label={`${size}px`}
                  primary={size === 512}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-olive-50 to-sand-50 border border-olive-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-olive-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Manual em HTML Completo</h4>
              <p className="text-sm text-gray-600 mb-3">Versão standalone do manual para abrir em qualquer navegador, compartilhar com parceiros ou salvar como PDF.</p>
              <div className="flex flex-wrap gap-2">
                <a 
                  href="/brand-manual.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-olive-700 border border-olive-200 rounded-lg hover:bg-olive-50 transition-colors font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Manual em Nova Aba
                </a>
                <CopyButton text={`${window.location.origin}/brand-manual.html`} label="Copiar URL" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-6 text-xs text-gray-400">
        Manual da Marca OlieCare v1.1 • Abril 2026 • 
        Para aprovação de usos especiais: <a href="mailto:design@oliecare.cloud" className="text-olive-600 hover:underline">design@oliecare.cloud</a>
      </div>
    </AdminLayout>
  );
}
