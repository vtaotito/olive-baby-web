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

const sectionPadding = 'py-28 sm:py-36';

// ─── HERO ────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sand-50 via-white to-white" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-olive-100/20 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-800 leading-[1.1] tracking-tight-editorial mb-8">
            Mais tranquilidade para cuidar do seu{' '}
            <span className="text-olive-600">bebê</span>.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12"
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
            className="group inline-flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-olive-600/20 hover:shadow-xl hover:shadow-olive-600/30"
          >
            Começar grátis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#ritmo"
            className="inline-flex items-center justify-center gap-2 text-stone-500 hover:text-stone-700 px-8 py-4 rounded-2xl text-lg font-medium transition-colors"
          >
            Veja como funciona
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-10 flex flex-wrap items-center gap-6 justify-center text-sm text-stone-400"
        >
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-olive-500" /> Gratuito para começar</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-olive-500" /> Sem cartão de crédito</span>
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-olive-500" /> Cancele quando quiser</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mt-20"
        >
          <a href="#empatia" aria-label="Rolar para baixo">
            <ArrowDown className="w-5 h-5 text-stone-400 mx-auto animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── EMPATIA ─────────────────────────────────────────────────────────────
function EmpathySection() {
  return (
    <section id="empatia" className={`${sectionPadding} bg-white`}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-sm font-medium text-olive-600 mb-6 tracking-wider uppercase">Você não está sozinha</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-10">
            Cuidar de um recém-nascido é lindo. Mas o cansaço, as dúvidas e a sobrecarga também são reais.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg text-stone-500 leading-relaxed mb-12">
            A maternidade e paternidade não vêm com manual. Você perde a conta das mamadas,
            esquece a última troca de fralda, e se pergunta se o sono do seu bebê é normal.
            Tudo isso com privação de sono. A OlieCare existe para devolver clareza a esses dias.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <blockquote className="border-l-2 border-olive-200 pl-6">
            <p className="font-editorial text-xl sm:text-2xl text-stone-700 italic leading-relaxed">
              "Eu só queria um lugar para anotar tudo sem esquecer nada..."
            </p>
            <footer className="mt-4 text-sm text-stone-400">
              Maria, mãe de primeira viagem
            </footer>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── RITMO (Signature Interaction) ───────────────────────────────────────
function RhythmSection() {
  return (
    <section id="ritmo" className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-6 tracking-wider uppercase">O ritmo do dia</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-8">
                O caos tem um padrão. A OlieCare ajuda você a enxergá-lo.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg text-stone-500 leading-relaxed mb-8">
                Quando você registra a rotina — mamadas, sono, fraldas — padrões emergem.
                O que parecia desordem ganha forma. E com forma, vem confiança.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="space-y-4">
                {[
                  'Registre alimentação, sono, fraldas, banho e extrações',
                  'Veja padrões e entenda a rotina do seu bebê',
                  'Receba insights inteligentes e personalizados',
                  'Compartilhe com quem cuida junto com você',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-olive-600" />
                    </div>
                    <span className="text-stone-600 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.2}>
            <DailyRhythmTimeline />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Baby,
    title: 'Alimentação',
    description: 'Registre amamentação, mamadeira ou complemento. Cronômetro integrado para cada mamada.',
    accent: 'bg-peach-50 text-peach-600',
  },
  {
    icon: Moon,
    title: 'Sono',
    description: 'Acompanhe início, fim e qualidade do sono. Veja os padrões de descanso do bebê.',
    accent: 'bg-lavender-50 text-lavender-600',
  },
  {
    icon: Droplets,
    title: 'Fraldas',
    description: 'Registre trocas com tipo (xixi, cocô ou mista). Acompanhe a saúde digestiva.',
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    icon: LineChart,
    title: 'Crescimento',
    description: 'Peso, altura e perímetro cefálico com gráficos de evolução claros.',
    accent: 'bg-olive-50 text-olive-600',
  },
  {
    icon: Brain,
    title: 'Insights com IA',
    description: 'Análises inteligentes sobre padrões, tendências e sugestões personalizadas.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Bell,
    title: 'Lembretes',
    description: 'Alertas para próxima mamada, troca de fralda ou hora do banho.',
    accent: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Bath,
    title: 'Banho e Cuidados',
    description: 'Registre banhos e cuidados diários. Mantenha a rotina organizada.',
    accent: 'bg-teal-50 text-teal-600',
  },
  {
    icon: FileText,
    title: 'Exportação de Dados',
    description: 'Exporte em CSV para levar nas consultas pediátricas.',
    accent: 'bg-stone-100 text-stone-600',
  },
];

function FeaturesSection() {
  return (
    <section id="funcionalidades" className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Funcionalidades</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial">
              Tudo o que você precisa, sem complicação.
            </h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
          {features.map((feature, i) => {
            const [bgClass, textClass] = feature.accent.split(' ');
            return (
              <StaggerItem key={i}>
                <div className="flex gap-5">
                  <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-6 h-6 ${textClass}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-stone-800 mb-1">{feature.title}</h3>
                    <p className="text-stone-500 text-[15px] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { title: 'Você chega. Sem pressa.', description: 'Cadastro rápido e gratuito. Leva menos de 1 minuto.' },
    { title: 'Conta sobre o seu bebê.', description: 'Adicione nome, data de nascimento e comece.' },
    { title: 'E o ritmo começa.', description: 'Registre a rotina e receba insights personalizados.' },
  ];

  return (
    <section id="como-funciona" className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Como funciona</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Simples assim.
            </h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="space-y-12">
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 text-olive-700 font-display font-bold text-sm">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-stone-800 mb-1">{step.title}</h3>
                  <p className="text-stone-500">{step.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-14">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 bg-olive-600 hover:bg-olive-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-olive-600/20"
            >
              Começar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── SOCIAL PROOF ────────────────────────────────────────────────────────
function SocialProofSection() {
  return (
    <section className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Benefícios</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-8">
                Cuidar fica mais leve quando você tem apoio.
              </h2>
            </ScrollReveal>

            <StaggerReveal className="space-y-6">
              {[
                { icon: Shield, title: 'Mais segurança', desc: 'Saber que está fazendo a coisa certa traz paz de espírito.' },
                { icon: Heart, title: 'Menos ansiedade', desc: 'Dados organizados — pare de se preocupar com o que pode estar esquecendo.' },
                { icon: Sparkles, title: 'Mais clareza', desc: 'Visualize padrões e entenda melhor as necessidades do seu bebê.' },
                { icon: Brain, title: 'Menos decisões no cansaço', desc: 'A OlieCare sugere, você decide. No seu tempo.' },
              ].map((b, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-5 h-5 text-olive-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-stone-800 mb-0.5">{b.title}</h3>
                      <p className="text-stone-500 text-[15px]">{b.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>

          <div className="lg:col-span-7">
            <ScrollReveal delay={0.2}>
              <div className="bg-gradient-to-br from-sand-50 to-olive-50/30 rounded-3xl p-8 sm:p-10 border border-stone-100">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="font-editorial text-xl sm:text-2xl text-stone-700 italic leading-relaxed mb-8">
                  "A OlieCare me salvou. Eu estava tão cansada que não conseguia lembrar quando tinha
                  amamentado por último. Agora tenho tudo registrado e consigo ver padrões que me
                  ajudaram a organizar minha rotina."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-olive-200 flex items-center justify-center">
                    <span className="text-olive-700 font-semibold text-sm">JC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Juliana C.</p>
                    <p className="text-xs text-stone-400">Mãe do Pedro, 3 meses</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-8 justify-center text-center">
                <div>
                  <p className="text-2xl font-bold text-stone-800">2.400+</p>
                  <p className="text-xs text-stone-400 mt-0.5">famílias ativas</p>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div>
                  <p className="text-2xl font-bold text-stone-800">4.9/5</p>
                  <p className="text-xs text-stone-400 mt-0.5">avaliação média</p>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div>
                  <p className="text-2xl font-bold text-stone-800">98%</p>
                  <p className="text-xs text-stone-400 mt-0.5">sentem mais calma</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────
function PricingSection() {
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
        'Chat com Assistente IA (2 interações)',
      ],
      cta: 'Começar grátis',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: 'R$ 29,99',
      period: 'por mês',
      yearlyNote: 'ou R$ 287,90/ano (20% off)',
      description: 'Para famílias que querem o máximo de organização e insights.',
      features: [
        'Tudo do plano grátis',
        'Bebês ilimitados',
        'Histórico completo',
        'Gráficos avançados',
        'Insights com IA personalizados',
        'Chat com Assistente IA (ilimitado)',
        'Calendário de Vacinas completo',
        'Lembretes inteligentes',
        'Exportação de dados (CSV)',
        'Compartilhamento com cuidadores',
        'Suporte prioritário',
      ],
      cta: 'Assinar Premium',
      highlighted: true,
    },
  ];

  return (
    <section id="precos" className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Planos</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight-editorial mb-4">
              Escolha o plano ideal para sua família.
            </h2>
            <p className="text-stone-500">Comece grátis. Evolua no seu tempo. Sem surpresas.</p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <StaggerItem key={index}>
              <div
                className={`relative rounded-3xl p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? 'bg-olive-600 text-white shadow-xl shadow-olive-600/15'
                    : 'bg-white border border-stone-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-peach-200 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Mais escolhido pelas famílias
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`font-display text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-stone-800'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-stone-800'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-olive-200' : 'text-stone-400'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  {'yearlyNote' in plan && plan.yearlyNote && (
                    <p className={`text-xs mt-1 ${plan.highlighted ? 'text-olive-200' : 'text-stone-400'}`}>
                      {plan.yearlyNote}
                    </p>
                  )}
                  <p className={`mt-3 text-sm ${plan.highlighted ? 'text-olive-100' : 'text-stone-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-olive-200' : 'text-olive-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-olive-50' : 'text-stone-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
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

        <ScrollReveal delay={0.2}>
          <p className="text-center text-sm text-stone-400 mt-8">
            Todos os planos incluem 7 dias de teste grátis do Premium.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── CTA FINAL ───────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className={`${sectionPadding} bg-olive-600 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight-editorial mb-6">
            Pronto para ter mais tranquilidade?
          </h2>
          <p className="text-lg text-olive-100 mb-10 max-w-xl mx-auto">
            Junte-se a milhares de famílias que já descobriram como é ter a rotina do bebê organizada.
          </p>

          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
          >
            Criar minha conta agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-olive-200 text-sm">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Teste gratuito de 7 dias</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sem compromisso</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <>
      <SEOHead
        title="Acompanhe a Rotina do Bebê com Tranquilidade"
        description="OlieCare é o app gratuito para acompanhar a rotina do seu bebê. Registre alimentação, sono, fraldas e banho. Receba insights com IA e tenha mais tranquilidade na maternidade e paternidade."
        canonical="/"
      />
      <div className="min-h-screen bg-white landing-body">
        <LandingHeader variant="b2c" />
        <main>
          <HeroSection />
          <EmpathySection />
          <RhythmSection />
          <FeaturesSection />
          <HowItWorksSection />
          <SocialProofSection />
          <PricingSection />
          <CTASection />
        </main>
        <LandingFooter variant="b2c" />
      </div>
    </>
  );
}
