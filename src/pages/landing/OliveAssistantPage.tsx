import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Moon,
  Baby,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { LandingHeader } from './components/LandingHeader';
import { LandingFooter } from './components/LandingFooter';
import { ScrollReveal, StaggerReveal, StaggerItem } from '../../components/animations/ScrollReveal';

const sectionPadding = 'py-28 sm:py-36';

// ─── HERO ────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-olive-800 via-olive-700 to-emerald-800">
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-olive-900/40 via-transparent to-olive-900/20" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center pt-28 sm:pt-32 pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-sm font-medium px-5 py-2 rounded-full mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Inteligência Artificial para Pais
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight-editorial mb-6 sm:mb-8">
            Conheça o{' '}
            <span className="text-gradient bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
              Olive Assistente
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-4"
        >
          Seu assistente inteligente para entender a rotina do seu bebê.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-10 sm:mb-12"
        >
          O Olive Assistente analisa automaticamente as rotinas registradas no OlieCare
          e transforma dados em orientações simples e úteis para o dia a dia com seu bebê.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl shadow-black/20 hover:shadow-xl"
          >
            Experimente o OlieCare
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all"
          >
            Conheça o aplicativo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── COMO FUNCIONA ──────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Registre as rotinas',
      description: 'O app registra mamadas, sono, fraldas, banhos e marcos de desenvolvimento do seu bebê.',
      icon: Baby,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      number: '02',
      title: 'A IA analisa os padrões',
      description: 'O Olive Assistente processa as informações e identifica padrões, tendências e pontos de atenção.',
      icon: Brain,
      color: 'bg-violet-100 text-violet-600',
    },
    {
      number: '03',
      title: 'Receba orientações',
      description: 'Você recebe insights personalizados, claros e acolhedores para o dia a dia com seu bebê.',
      icon: MessageCircle,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <section className={`${sectionPadding} bg-white`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Como funciona</p>
            <h2 className="font-display text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Simples, inteligente e feito para você.
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Em três passos, o Olive Assistente transforma registros em orientações personalizadas.
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <div className="relative text-center group">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-stone-300 uppercase tracking-widest mb-2 block">{step.number}</span>
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-3">{step.title}</h3>
                <p className="text-stone-600 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-6 lg:-right-8 w-5 h-5 text-stone-300" />
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-16 sm:mt-20 bg-olive-50 rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 text-olive-700">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-olive-200 flex items-center justify-center ring-2 ring-olive-50 text-lg">📝</div>
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center ring-2 ring-olive-50 text-lg">🧠</div>
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center ring-2 ring-olive-50 text-lg">💬</div>
                </div>
              </div>
              <p className="text-center sm:text-left text-stone-700 font-medium">
                Registrar rotinas <span className="text-stone-400 mx-2">→</span> Analisar padrões <span className="text-stone-400 mx-2">→</span> Receber orientações
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── FEATURES GRID ──────────────────────────────────────────────────────
const capabilities = [
  {
    icon: Brain,
    title: 'Análise Inteligente de Rotinas',
    description: 'O Olive Assistente interpreta os dados do bebê e identifica padrões importantes no dia a dia.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Moon,
    title: 'Insights sobre Sono',
    description: 'Entenda se o bebê está dormindo bem e receba sugestões baseadas nos registros de sono.',
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Baby,
    title: 'Apoio na Amamentação',
    description: 'Acompanhe frequência das mamadas e receba orientações simples para o dia a dia.',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
  },
  {
    icon: BarChart3,
    title: 'Entenda os Dados do Seu Bebê',
    description: 'Transforme registros em informações claras e fáceis de entender sobre a rotina.',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
  },
];

function FeaturesSection() {
  return (
    <section className={`${sectionPadding} bg-stone-50`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Capacidades</p>
            <h2 className="font-display text-4xl font-bold text-stone-800 tracking-tight-editorial">
              O que o Olive Assistente faz por você.
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Inteligência artificial a serviço do cuidado. Cada insight é pensado para trazer mais tranquilidade ao seu dia.
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((cap, i) => (
            <StaggerItem key={i}>
              <div className="group bg-white rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-stone-100">
                <div className={`w-14 h-14 rounded-2xl ${cap.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <cap.icon className={`w-7 h-7 bg-gradient-to-br ${cap.gradient} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-stone-800 mb-3">{cap.title}</h3>
                <p className="text-stone-600 leading-relaxed flex-1">{cap.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}

// ─── EXAMPLE INSIGHTS ───────────────────────────────────────────────────
const exampleInsights = [
  {
    message: 'Seu bebê está mamando em média a cada 2h30.',
    type: 'feeding' as const,
    time: 'Insight de hoje',
  },
  {
    message: 'Os períodos de sono da tarde estão aumentando. Ótimo sinal de desenvolvimento!',
    type: 'sleep' as const,
    time: 'Insight de ontem',
  },
  {
    message: 'Hoje o bebê teve mais despertares noturnos que o padrão. Pode ser fase de salto de desenvolvimento.',
    type: 'alert' as const,
    time: 'Há 2 horas',
  },
];

function InsightBubble({ message, time, index }: { message: string; time: string; index: number }) {
  const isAssistant = true;
  return (
    <ScrollReveal delay={index * 0.12}>
      <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className="max-w-md">
          <div className="bg-white rounded-2xl rounded-tl-md px-6 py-4 shadow-sm border border-stone-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-olive-600" />
              </div>
              <div>
                <p className="text-stone-800 leading-relaxed">{message}</p>
                <p className="text-xs text-stone-400 mt-2">{time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function ExampleInsightsSection() {
  return (
    <section className={`${sectionPadding} bg-white`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Na prática</p>
              <h2 className="font-display text-4xl font-bold text-stone-800 leading-tight tracking-tight-editorial mb-6">
                Veja como o Assistente conversa com você.
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-8">
                O Olive Assistente gera mensagens claras e acolhedoras com base nos dados registrados.
                Sem jargão médico. Sem alarmes desnecessários. Apenas informações úteis.
              </p>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-olive-600 font-semibold hover:text-olive-700 transition-colors"
              >
                Experimentar agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
                <div className="w-10 h-10 rounded-full bg-olive-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-stone-800">Olive Assistente</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs text-stone-500">Analisando rotinas</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {exampleInsights.map((insight, i) => (
                  <InsightBubble key={i} message={insight.message} time={insight.time} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className={`${sectionPadding} bg-olive-700 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight-editorial mb-6">
            Tenha um assistente inteligente para cuidar da rotina do seu bebê.
          </h2>
          <p className="text-xl text-olive-100 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de famílias que já usam inteligência artificial para entender melhor a rotina dos seus bebês.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 bg-white hover:bg-amber-50 text-olive-700 px-10 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              Criar conta gratuita
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-olive-200 text-sm">
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Teste grátis de 7 dias</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Cancele quando quiser</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────
export function OliveAssistantPage() {
  return (
    <>
      <SEOHead
        title="Olive Assistente • IA para Entender a Rotina do Seu Bebê | OlieCare"
        description="O Olive Assistente usa inteligência artificial para analisar rotinas de sono, alimentação e fraldas do bebê, gerando insights personalizados para pais."
      />

      <LandingHeader variant="b2c" />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ExampleInsightsSection />
        <CTASection />
      </main>

      <LandingFooter variant="b2c" />
    </>
  );
}
