import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  UserPlus,
  LineChart,
  Check,
  ArrowRight,
  ArrowDown,
  Heart,
  Shield,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '../../components/seo/SEOHead';
import { LandingHeader } from './components/LandingHeader';
import { LandingFooter } from './components/LandingFooter';
import { ScrollReveal, StaggerReveal, StaggerItem } from '../../components/animations/ScrollReveal';
import { HumanizedImage } from '../../components/ui/HumanizedImage';

const sectionPadding = 'py-28 sm:py-36';

const ASSETS = {
  hero: '/assets/prof/prof-hero-pediatra-mamae.jpg',
  dashboard: '/assets/prof/prof-dashboard-mockup.png',
  prontuario: '/assets/prof/prof-prontuario-pediatra.jpg',
  convite: '/assets/prof/prof-convite-pediatra.jpg',
  agenda: '/assets/prof/prof-agenda-mockup.png',
  crescimento: '/assets/prof/prof-grafico-crescimento.jpg',
  conexao: '/assets/prof/prof-pediatra-mamae-conexao.jpg',
};

// ─── HERO ────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-stone-900">
      <img
        src={ASSETS.hero}
        alt="Pediatra mostrando dashboard do OlieCare Pro para mãe com bebê no consultório"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/85" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center pt-28 sm:pt-32 pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-olive-700 px-5 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
            <Stethoscope className="w-4 h-4" />
            <span>Portal gratuito para profissionais de saúde</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight-editorial mb-6 sm:mb-8 [text-shadow:0_2px_24px_rgba(0,0,0,0.5),0_1px_4px_rgba(0,0,0,0.4)]">
            Acompanhe seus{' '}
            <span className="text-olive-200">pacientes</span>{' '}
            <br className="hidden sm:block" />
            com dados reais.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg sm:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 [text-shadow:0_1px_12px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.3)]"
        >
          Prontuário integrado, agenda, convites e dados de rotina em um só lugar.
          Consultas mais informadas, menos retrabalho.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register?profile=professional"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl shadow-black/30 hover:shadow-xl"
          >
            Começar como profissional
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/60 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all"
          >
            Veja como funciona
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center gap-6 sm:gap-8 justify-center text-sm text-white/80"
        >
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 100% gratuito</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Até 50 pacientes</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sem cartão</span>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a href="#desafio" aria-label="Rolar para baixo" className="block">
          <ArrowDown className="w-6 h-6 text-white/60 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

// ─── PROBLEM ─────────────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section id="desafio" className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-6 tracking-wider uppercase">O desafio</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-10">
                Consultas mais informadas começam com dados reais.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-lg text-stone-500 leading-relaxed mb-12">
                Quando os pais registram a rotina do bebê, você tem acesso a dados concretos
                para tomar decisões clínicas mais precisas. Sem "acho que mamou bem" ou "dormiu mais ou menos".
              </p>
            </ScrollReveal>

            <StaggerReveal className="grid sm:grid-cols-2 gap-8">
              {[
                { title: 'Pais chegam sem dados', desc: 'Consultas baseadas em memória — imprecisas por natureza.' },
                { title: 'Consultas superficiais', desc: 'Pouco tempo para entender padrões reais de alimentação e sono.' },
                { title: 'Informações dispersas', desc: 'Planilhas, anotações e apps diferentes. Nada integrado.' },
                { title: 'Engajamento baixo', desc: 'Pais não seguem recomendações por falta de organização.' },
              ].map((problem, i) => (
                <StaggerItem key={i}>
                  <div className="border-l-2 border-stone-200 pl-5">
                    <h3 className="font-display font-semibold text-stone-800 mb-1">{problem.title}</h3>
                    <p className="text-stone-500 text-[15px]">{problem.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>

          <ScrollReveal delay={0.2}>
            <HumanizedImage
              src={ASSETS.prontuario}
              alt="Pediatra analisando prontuário integrado com dados de rotina do bebê"
              className="aspect-[4/3]"
              caption="Dados reais de rotina integrados ao prontuário"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── SOLUTION ────────────────────────────────────────────────────────────
function SolutionSection() {
  return (
    <section className={`${sectionPadding} bg-olive-600 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollReveal>
              <p className="text-olive-200 font-medium mb-4 text-sm tracking-wider uppercase">A solução</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-[1.15] tracking-tight-editorial mb-6">
                Prontuário integrado com dados de rotina.
              </h2>
              <p className="text-lg text-olive-100 mb-8 leading-relaxed">
                A OlieCare conecta você aos seus pacientes. Quando os pais registram alimentação,
                sono, fraldas e marcos, você vê tudo organizado no prontuário.
              </p>
            </ScrollReveal>

            <StaggerReveal className="space-y-4">
              {[
                'Dados de rotina (alimentação, sono, fraldas) em tempo real',
                'Calendário de vacinas e marcos de desenvolvimento',
                'Gráficos de crescimento com curvas de referência',
                'Agenda de consultas e prontuário simplificado',
                'Convite para pacientes se cadastrarem com um clique',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-olive-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-olive-50">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-10">
                <Link
                  to="/register?profile=professional"
                  className="group inline-flex items-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg"
                >
                  Cadastrar grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.2}>
            <div className="hidden lg:block">
              <HumanizedImage
                src={ASSETS.dashboard}
                alt="Dashboard profissional do OlieCare Pro mostrando lista de pacientes, gráficos e alertas"
                className="aspect-[16/10] shadow-2xl shadow-black/30"
                caption="Dashboard completo para o dia a dia clínico"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────
function FeaturesSection() {
  const feats = [
    {
      icon: Users,
      title: 'Pacientes vinculados',
      description: 'Até 50 pacientes com dados de rotina em tempo real.',
      image: ASSETS.conexao,
      imageAlt: 'Pediatra e mãe com bebê conectados pelo OlieCare',
    },
    {
      icon: Calendar,
      title: 'Agenda integrada',
      description: 'Agende consultas e acompanhe sua rotina clínica com alertas.',
      image: ASSETS.agenda,
      imageAlt: 'Agenda do dia do profissional com consultas e alertas',
    },
    {
      icon: LineChart,
      title: 'Gráficos de crescimento',
      description: 'Curvas de referência OMS com dados reais do bebê.',
      image: ASSETS.crescimento,
      imageAlt: 'Pediatra analisando gráfico de crescimento OMS no tablet',
    },
  ];

  return (
    <section id="funcionalidades" className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Funcionalidades</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial">
              Tudo para simplificar o seu dia a dia clínico.
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-20">
          {feats.map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-olive-600" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-stone-800">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-stone-500 leading-relaxed">{feature.description}</p>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <HumanizedImage
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="aspect-[4/3]"
                  />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-20 grid sm:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'Prontuário', description: 'Visitas, receitas, atestados e dados do bebê.' },
              { icon: UserPlus, title: 'Convites', description: 'Convide pacientes por e-mail com um clique.' },
              { icon: Shield, title: 'LGPD', description: 'Dados com consentimento do responsável.' },
            ].map((feat, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-stone-800 mb-1">{feat.title}</h3>
                  <p className="text-stone-500 text-[15px]">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      title: 'Cadastre-se grátis.',
      description: 'Crie sua conta em menos de 1 minuto. Sem cartão.',
      image: ASSETS.dashboard,
      imageAlt: 'Dashboard profissional do OlieCare',
    },
    {
      title: 'Convide seus pacientes.',
      description: 'Envie convites por e-mail. Eles se cadastram na OlieCare e começam a registrar.',
      image: ASSETS.convite,
      imageAlt: 'Pediatra enviando convite para pacientes pelo OlieCare',
    },
    {
      title: 'Veja dados nas consultas.',
      description: 'Rotinas, vacinas, marcos e crescimento — tudo em tempo real no prontuário.',
      image: ASSETS.crescimento,
      imageAlt: 'Pediatra visualizando gráficos de crescimento do bebê',
    },
  ];

  return (
    <section id="como-funciona" className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Como funciona</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight-editorial">
              Três passos para começar.
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-24">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? '' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-start gap-5 mb-4">
                    <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 text-olive-700 font-display font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-stone-800 mb-2">{step.title}</h3>
                      <p className="text-lg text-stone-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <HumanizedImage
                    src={step.image}
                    alt={step.imageAlt}
                    className="aspect-[4/3]"
                  />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-16">
            <Link
              to="/register?profile=professional"
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

// ─── BENEFITS + TESTIMONIAL ──────────────────────────────────────────────
function BenefitsSection() {
  return (
    <section className={`${sectionPadding} bg-white`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Benefícios</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 leading-[1.15] tracking-tight-editorial mb-8">
                Por que profissionais escolhem a OlieCare.
              </h2>
            </ScrollReveal>

            <StaggerReveal className="space-y-6">
              {[
                { icon: BarChart3, title: 'Consultas mais informadas', desc: 'Dados reais em vez de "acho que".' },
                { icon: Calendar, title: 'Menos retrabalho', desc: 'Pais organizados seguem melhor as orientações.' },
                { icon: Users, title: 'Pacientes engajados', desc: 'Famílias que usam a OlieCare voltam mais preparadas.' },
                { icon: Heart, title: 'Diferencial no consultório', desc: 'Ofereça uma ferramenta moderna aos seus pacientes.' },
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

          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delay={0.1}>
              <HumanizedImage
                src={ASSETS.conexao}
                alt="Pediatra e mãe compartilhando dados do bebê pelo OlieCare"
                className="aspect-[16/10]"
                caption="Conexão direta entre profissional e família"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-gradient-to-br from-sand-50 to-olive-50/30 rounded-3xl p-8 sm:p-10 border border-stone-100">
                <div className="flex items-center gap-2 mb-5">
                  <Stethoscope className="w-6 h-6 text-olive-600" />
                </div>
                <blockquote className="font-editorial text-xl sm:text-2xl text-stone-700 italic leading-relaxed mb-8">
                  "Agora meus pacientes chegam com os dados organizados. Consigo ver padrões
                  de sono e alimentação que antes eu só perguntava. A consulta ficou muito mais produtiva."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-olive-200 flex items-center justify-center">
                    <span className="text-olive-700 font-semibold text-sm">DS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Dra. Silva</p>
                    <p className="text-xs text-stone-400">Pediatra, São Paulo</p>
                  </div>
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
  return (
    <section id="precos" className={`${sectionPadding} bg-sand-50`}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-olive-600 mb-4 tracking-wider uppercase">Planos</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight-editorial mb-4">
              Plano profissional gratuito.
            </h2>
            <p className="text-stone-500">Estratégico para você. Sem custo. Sem compromisso.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-olive-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-olive-600/15 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-peach-200 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">
                Para profissionais
              </span>
            </div>

            <div className="mb-8">
              <h3 className="font-display text-2xl font-bold text-white mb-2">Profissional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$ 0</span>
                <span className="text-olive-200">/para sempre</span>
              </div>
              <p className="mt-2 text-olive-100 text-sm">
                Até 50 pacientes vinculados. Portal completo.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Até 50 pacientes vinculados',
                'Prontuário integrado (visitas, receitas, atestados)',
                'Agenda de consultas',
                'Dados de rotina em tempo real',
                'Calendário de vacinas e marcos',
                'Gráficos de crescimento com curvas de referência',
                'Convites por e-mail para pacientes',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-olive-200" />
                  <span className="text-olive-50 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register?profile=professional"
              className="block w-full text-center py-4 rounded-xl font-semibold transition-all duration-200 bg-white text-olive-700 hover:bg-olive-50"
            >
              Cadastrar grátis
            </Link>
          </div>
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
            Pronto para acompanhar seus pacientes com dados reais?
          </h2>
          <p className="text-lg text-olive-100 mb-10 max-w-xl mx-auto">
            Junte-se a profissionais que já usam a OlieCare. Cadastro gratuito, sem cartão.
          </p>

          <Link
            to="/register?profile=professional"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
          >
            Começar como profissional
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-olive-200 text-sm">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 100% gratuito</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sem compromisso</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────
export function ProfLandingPage() {
  return (
    <>
      <SEOHead
        title="Para Profissionais - Acompanhe Pacientes com Dados Reais"
        description="Portal gratuito OlieCare para pediatras e especialistas. Prontuário integrado, agenda, convites e dados de rotina dos bebês em um só lugar."
        canonical="/para-profissionais"
      />
      <div className="min-h-screen bg-white landing-body">
        <LandingHeader variant="b2b" />
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <FeaturesSection />
          <HowItWorksSection />
          <BenefitsSection />
          <PricingSection />
          <CTASection />
        </main>
        <LandingFooter variant="b2b" />
      </div>
    </>
  );
}
