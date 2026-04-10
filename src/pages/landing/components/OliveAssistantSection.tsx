import { Link } from 'react-router-dom';
import {
  Brain,
  Moon,
  Baby,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { ScrollReveal, StaggerReveal, StaggerItem } from '../../../components/animations/ScrollReveal';

const sectionPadding = 'py-28 sm:py-36';

interface OliveAssistantSectionProps {
  variant: 'b2c' | 'b2b';
}

// ─── HOW IT WORKS (3-step flow) ─────────────────────────────────────────
const steps = [
  {
    number: '01',
    title: 'Registre as rotinas',
    description: 'O app registra mamadas, sono, fraldas, banhos e marcos de desenvolvimento.',
    icon: Baby,
    color: 'bg-rose-100 text-rose-600',
  },
  {
    number: '02',
    title: 'A IA analisa os padrões',
    description: 'O Olive Assistente processa as informações e identifica padrões e tendências.',
    icon: Brain,
    color: 'bg-violet-100 text-violet-600',
  },
  {
    number: '03',
    title: 'Receba orientações',
    description: 'Insights personalizados, claros e acolhedores para o dia a dia.',
    icon: MessageCircle,
    color: 'bg-emerald-100 text-emerald-600',
  },
];

// ─── FEATURES ───────────────────────────────────────────────────────────
const capabilities = [
  {
    icon: Brain,
    title: 'Análise Inteligente de Rotinas',
    description: 'Interpreta os dados do bebê e identifica padrões importantes no dia a dia.',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Moon,
    title: 'Insights sobre Sono',
    description: 'Entenda se o bebê está dormindo bem, com sugestões baseadas nos registros.',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Baby,
    title: 'Apoio na Amamentação',
    description: 'Acompanhe frequência das mamadas e receba orientações simples.',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    icon: BarChart3,
    title: 'Entenda os Dados',
    description: 'Transforme registros em informações claras e fáceis de entender.',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

// ─── EXAMPLE INSIGHTS ───────────────────────────────────────────────────
const exampleInsights = [
  { message: 'Seu bebê está mamando em média a cada 2h30.', time: 'Insight de hoje' },
  { message: 'Os períodos de sono da tarde estão aumentando. Ótimo sinal de desenvolvimento!', time: 'Insight de ontem' },
  { message: 'Hoje o bebê teve mais despertares noturnos que o padrão. Pode ser fase de salto de desenvolvimento.', time: 'Há 2 horas' },
];

function InsightBubble({ message, time, index }: { message: string; time: string; index: number }) {
  return (
    <ScrollReveal delay={index * 0.12}>
      <div className="flex justify-start mb-3">
        <div className="max-w-sm">
          <div className="bg-white rounded-2xl rounded-tl-md px-5 py-3.5 shadow-sm border border-stone-100">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-olive-600" />
              </div>
              <div>
                <p className="text-stone-800 text-sm leading-relaxed">{message}</p>
                <p className="text-xs text-stone-400 mt-1.5">{time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ─── MAIN SECTION ───────────────────────────────────────────────────────
export function OliveAssistantSection({ variant }: OliveAssistantSectionProps) {
  const registerLink = variant === 'b2b' ? '/register?profile=professional' : '/register';

  return (
    <>
      {/* ── Part 1: Intro + How It Works ── */}
      <section id="olive-assistente" className={`${sectionPadding} bg-gradient-to-br from-olive-800 via-olive-700 to-emerald-800 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-olive-900/30 via-transparent to-olive-900/10" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-sm font-medium px-5 py-2 rounded-full mb-8 border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Inteligência Artificial
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.08] tracking-tight-editorial mb-6">
                Conheça o{' '}
                <span className="bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                  Olive Assistente
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
                {variant === 'b2b'
                  ? 'IA que analisa rotinas registradas pelos pais e gera insights automaticamente — dados que complementam a avaliação clínica.'
                  : 'Seu assistente inteligente que analisa as rotinas do bebê e transforma dados em orientações simples e úteis para o dia a dia.'}
              </p>
            </div>
          </ScrollReveal>

          {/* 3-step flow */}
          <StaggerReveal className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-14">
            {steps.map((step, i) => (
              <StaggerItem key={i}>
                <div className="relative text-center group">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">{step.number}</span>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
                  {i < steps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-7 -right-5 lg:-right-7 w-5 h-5 text-white/25" />
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-lg mx-auto border border-white/10">
              <p className="text-center text-white/80 text-sm font-medium">
                📝 Registrar rotinas <span className="text-white/40 mx-2">→</span> 🧠 Analisar padrões <span className="text-white/40 mx-2">→</span> 💬 Receber orientações
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Part 2: Features Grid + Example Insights ── */}
      <section className={`${sectionPadding} bg-stone-50`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Features 2x2 */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Capacidades da IA</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight-editorial">
                O que o Olive Assistente faz por você.
              </h2>
            </div>
          </ScrollReveal>

          <StaggerReveal className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-20 sm:mb-24">
            {capabilities.map((cap, i) => (
              <StaggerItem key={i}>
                <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-stone-100">
                  <div className={`w-12 h-12 rounded-2xl ${cap.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <cap.icon className={`w-6 h-6 ${cap.iconColor}`} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">{cap.title}</h3>
                  <p className="text-stone-600 leading-relaxed flex-1 text-[15px]">{cap.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          {/* Example Insights */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Na prática</p>
                <h3 className="font-display text-3xl font-bold text-stone-800 leading-tight tracking-tight-editorial mb-5">
                  Veja como o Assistente conversa com você.
                </h3>
                <p className="text-stone-600 leading-relaxed mb-8">
                  {variant === 'b2b'
                    ? 'Mensagens claras geradas pela IA com base nos dados de rotina. Informações que complementam a análise clínica sem jargão técnico para os pais.'
                    : 'Mensagens claras e acolhedoras com base nos dados registrados. Sem jargão médico. Sem alarmes desnecessários. Apenas informações úteis.'}
                </p>
                <Link
                  to={registerLink}
                  className="group inline-flex items-center gap-2 text-olive-600 font-semibold hover:text-olive-700 transition-colors"
                >
                  Experimentar agora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <ScrollReveal delay={0.1}>
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-100">
                    <div className="w-9 h-9 rounded-full bg-olive-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-stone-800 text-sm">Olive Assistente</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-xs text-stone-400">Analisando rotinas</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {exampleInsights.map((insight, i) => (
                      <InsightBubble key={i} message={insight.message} time={insight.time} index={i} />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
