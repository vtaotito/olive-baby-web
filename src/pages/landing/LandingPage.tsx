import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Baby,
  Moon,
  Droplets,
  Bath,
  LineChart,
  Brain,
  Bell,
  FileText,
  Check,
  ArrowRight,
  ArrowDown,
  Heart,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { LandingHeader } from './components/LandingHeader';
import { LandingFooter } from './components/LandingFooter';
import { ScrollReveal, StaggerReveal, StaggerItem } from '../../components/animations/ScrollReveal';
import { DailyRhythmTimeline } from '../../components/animations/DailyRhythmTimeline';
import { HumanizedImage } from '../../components/ui/HumanizedImage';

const sectionPadding = 'py-28 sm:py-36';

const ASSETS = {
  hero: '/assets/hero-mother-baby-app.jpg',
  family: '/assets/family-sharing-app.jpg',
  babyHand: '/assets/baby-sleeping-hand.jpg',
  tiredMom: '/assets/tired-mom-relieved-app.jpg',
  dashboard: '/assets/app-dashboard-mockup.png',
  feeding: '/assets/app-feeding-mockup.png',
  sleepChart: '/assets/app-sleep-chart-mockup.png',
};

// ─── HERO ────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <HumanizedImage
        src={ASSETS.hero}
        alt="Mãe segurando seu bebê recém-nascido enquanto usa o app OlieCare com tranquilidade"
        className="absolute inset-0"
        priority
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center pt-20 pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-olive-700 text-sm font-medium px-5 py-2 rounded-2xl mb-8">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Usado por mais de 2.400 famílias
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight-editorial mb-8 drop-shadow-xl">
            Mais tranquilidade para cuidar do seu{' '}
            <span className="text-olive-200">bebê</span>.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-12 drop-shadow-md"
        >
          Acompanhe alimentação, sono, fraldas e desenvolvimento.
          Receba insights personalizados e tenha clareza mesmo nos dias mais cansativos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl shadow-black/30 hover:shadow-xl"
          >
            Começar grátis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#funcionalidades"
            className="inline-flex items-center justify-center gap-2 border border-white/70 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all"
          >
            Ver como funciona
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12 flex flex-wrap items-center gap-8 justify-center text-sm text-white/70"
        >
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 7 dias grátis Premium</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sem cartão</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Cancele quando quiser</span>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <a href="#empatia" aria-label="Rolar para baixo" className="block">
          <ArrowDown className="w-6 h-6 text-white/60 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

// ─── EMPATIA ─────────────────────────────────────────────────────────────
function EmpathySection() {
  return (
    <section id="empatia" className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <HumanizedImage
              src={ASSETS.tiredMom}
              alt="Mãe cansada à noite encontra alívio e clareza usando o OlieCare"
              caption="“Finalmente consigo ver o padrão no meio do caos. Me sinto mais confiante como mãe.”"
              className="aspect-[4/3] shadow-2xl"
            />
          </div>

          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-6 tracking-wider uppercase">Você não está sozinha</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-10">
                Cuidar de um recém-nascido é lindo. Mas o cansaço, as dúvidas e a sobrecarga também são reais.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="prose prose-stone text-lg leading-relaxed text-stone-600">
                <p className="mb-6">
                  Você perde a conta das mamadas, esquece a última troca de fralda, 
                  e se pergunta se o sono do bebê está normal. Tudo isso com privação de sono.
                </p>
                <p>
                  A OlieCare foi criada por pais para pais — para trazer clareza, 
                  reduzir a ansiedade e transformar o caos em um ritmo compreensível.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="mt-10 flex items-center gap-4 text-sm text-stone-500">
                <div className="flex -space-x-4">
                  <div className="w-8 h-8 rounded-2xl bg-rose-100 flex items-center justify-center ring-2 ring-white">👩‍❤️‍👩</div>
                  <div className="w-8 h-8 rounded-2xl bg-amber-100 flex items-center justify-center ring-2 ring-white">👨‍👧</div>
                </div>
                <p className="leading-tight">
                  +2.400 famílias<br />
                  <span className="text-emerald-600 font-medium">já encontraram mais tranquilidade</span>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FUNCIONALIDADES COM MOCKUPS ───────────────────────────────────────
const features = [
  {
    mockup: ASSETS.dashboard,
    title: 'Dashboard do Bebê',
    description: 'Visão completa do dia a dia com gráficos bonitos, resumo de sono, mamadas e fraldas. Tudo em um único lugar.',
    caption: 'Dashboard • Luna, 3 meses'
  },
  {
    mockup: ASSETS.feeding,
    title: 'Registro de Mamadas',
    description: 'Timer integrado, escolha entre peito esquerdo/direito ou mamadeira. Registre em menos de 3 toques.',
    caption: 'Registro de Mamada • 14:20'
  },
  {
    mockup: ASSETS.sleepChart,
    title: 'Gráficos de Sono',
    description: 'Padrões de sono noturno, ciclos de sono profundo e insights da IA sobre o desenvolvimento do seu bebê.',
    caption: 'Padrões de Sono • Últimas 7 noites'
  },
];

function FeaturesSection() {
  return (
    <section id="funcionalidades" className={`${sectionPadding} bg-stone-50`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Funcionalidades</p>
            <h2 className="font-display text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Um app feito com carinho para famílias reais.
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Não é só um rastreador. É um companheiro que entende o ritmo da sua família.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                <div className="relative">
                  <HumanizedImage
                    src={feature.mockup}
                    alt={`Mockup do app OlieCare - ${feature.title}`}
                    className="aspect-video w-full"
                    caption={feature.caption}
                  />
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-display text-2xl font-semibold text-stone-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-stone-100 text-olive-600 text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                    Ver na prática
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RESTO DO ARQUIVO (mantido igual, apenas import e novas seções adicionadas) ──
function HowItWorksSection() {
  const steps = [
    { 
      title: 'Você chega. Sem pressa.', 
      description: 'Cadastro rápido e gratuito. Leva menos de 1 minuto.',
      image: ASSETS.family
    },
    { 
      title: 'Conta sobre o seu bebê.', 
      description: 'Adicione nome, data de nascimento e comece.',
      image: ASSETS.babyHand
    },
    { 
      title: 'E o ritmo começa.', 
      description: 'Registre a rotina e receba insights personalizados.',
      image: ASSETS.dashboard
    },
  ];

  return (
    <section id="como-funciona" className={`${sectionPadding} bg-white`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Como funciona</p>
            <h2 className="font-display text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Três passos. Uma vida mais leve.
            </h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="space-y-20">
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <div className={`flex flex-col lg:flex-row gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-5/12">
                  <HumanizedImage
                    src={step.image}
                    alt={step.title}
                    className="rounded-3xl shadow-2xl"
                  />
                </div>
                <div className="lg:w-7/12">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-olive-100 text-olive-700 font-display font-bold text-xl mb-6">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-display text-3xl font-semibold text-stone-800 mb-4">{step.title}</h3>
                  <p className="text-xl text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}

// (O resto do arquivo permanece igual - SocialProofSection, PlansSection, CTASection, etc.)
// ... [código original mantido nas seções abaixo]

function SocialProofSection() {
  return (
    <section className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Benefícios</p>
              <h2 className="font-display text-4xl font-bold text-stone-800 leading-tight tracking-tight-editorial mb-8">
                Cuidar fica mais leve quando você tem apoio.
              </h2>
            </ScrollReveal>

            <StaggerReveal className="space-y-8">
              {[
                { icon: Shield, title: 'Mais segurança', desc: 'Saber que está fazendo a coisa certa traz paz de espírito.' },
                { icon: Heart, title: 'Menos ansiedade', desc: 'Dados organizados — pare de se preocupar com o que pode estar esquecendo.' },
                { icon: Sparkles, title: 'Mais clareza', desc: 'Visualize padrões e entenda melhor as necessidades do seu bebê.' },
              ].map((benefit, i) => (
                <StaggerItem key={i} className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-olive-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl text-stone-800 mb-1">{benefit.title}</h4>
                    <p className="text-stone-600">{benefit.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>

          <div className="lg:col-span-7">
            <HumanizedImage
              src={ASSETS.family}
              alt="Família usando o OlieCare juntos"
              className="shadow-2xl"
              caption="“O app nos ajudou a dividir as tarefas e a entender nosso bebê juntos. É como ter uma pediatra no bolso.” — Juliana & Pedro"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Manter as seções PlansSection e CTASection originais (para não quebrar nada)
function PlansSection() {
  const plans = [
    {
      name: 'Grátis',
      price: 'R$ 0',
      period: 'para sempre',
      description: 'Perfeito para começar a acompanhar a rotina do bebê.',
      features: [
        'Registro de alimentação, sono e fraldas',
        'Até 1 bebê cadastrado',
        'Histórico dos últimos 7 dias',
        'Dashboard básico',
        'Chat com Assistente IA (2 interações/mês)',
      ],
      cta: 'Começar grátis',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: 'R$ 19,90',
      period: 'mês',
      yearlyNote: 'ou R$ 191,90/ano (20% off)',
      description: 'Para famílias que querem o máximo de organização e insights.',
      features: [
        'Tudo do plano grátis',
        'Bebês ilimitados',
        'Histórico completo',
        'Gráficos avançados',
        'Insights com IA personalizados',
        'Chat com Assistente IA ilimitado',
        'Calendário de Vacinas completo',
        'Lembretes inteligentes',
        'Exportação de dados (CSV)',
        'Compartilhamento com cuidadores',
        'Suporte prioritário',
      ],
      cta: 'Testar 7 dias grátis',
      highlighted: true,
    },
  ];

  return (
    <section id="precos" className={`${sectionPadding} bg-white`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Planos</p>
            <h2 className="font-display text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Escolha o plano ideal para sua família.
            </h2>
            <p className="mt-4 text-lg text-stone-600">Comece grátis. Evolua no seu tempo. Sem surpresas.</p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <StaggerItem key={index}>
              <div className={`relative h-full rounded-3xl p-10 flex flex-col ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-olive-600 to-emerald-700 text-white shadow-2xl scale-[1.02]' 
                  : 'bg-white border border-stone-100 shadow-xl'
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-stone-900 text-xs font-bold px-6 py-1 rounded-full">
                    MAIS ESCOLHIDO
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`font-display text-3xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-stone-800'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-stone-800'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${plan.highlighted ? 'text-olive-100' : 'text-stone-500'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  {'yearlyNote' in plan && plan.yearlyNote && (
                    <p className={`text-sm mt-1 ${plan.highlighted ? 'text-olive-100' : 'text-stone-500'}`}>
                      {plan.yearlyNote}
                    </p>
                  )}
                </div>

                <p className={`mb-8 ${plan.highlighted ? 'text-olive-100' : 'text-stone-600'}`}>
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-emerald-300' : 'text-olive-500'}`} />
                      <span className={`text-[15px] ${plan.highlighted ? 'text-olive-100' : 'text-stone-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full text-center py-4 rounded-2xl font-semibold text-lg transition-all ${
                    plan.highlighted
                      ? 'bg-white text-olive-700 hover:bg-olive-50'
                      : 'bg-olive-600 text-white hover:bg-olive-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-sm text-stone-400 mt-12">
            Todos os planos incluem <span className="font-medium text-olive-600">7 dias de teste grátis do Premium</span>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={`${sectionPadding} bg-olive-700 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      
      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight-editorial mb-6">
            Pronto para ter mais tranquilidade?
          </h2>
          <p className="text-xl text-olive-100 mb-10">
            Junte-se a milhares de famílias que já descobriram como é ter a rotina do bebê organizada.
          </p>

          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-3 bg-white hover:bg-amber-50 text-olive-700 px-12 py-6 rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-3xl"
          >
            Criar minha conta agora
            <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-olive-200 text-sm">
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Teste grátis de 7 dias</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Sem compromisso</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Cancele quando quiser</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <>
      <SEOHead 
        title="OlieCare • Acompanhe a rotina do seu bebê com tranquilidade"
        description="Registre mamadas, sono, fraldas e crescimento. Receba insights com IA e transforme o caos em clareza. Gratuito para começar."
      />
      
      <LandingHeader variant="b2c" />
      
      <main>
        <HeroSection />
        <EmpathySection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <PlansSection />
        <CTASection />
      </main>

      <LandingFooter variant="b2c" />
    </>
  );
}
