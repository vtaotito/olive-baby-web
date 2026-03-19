// Olive Baby Web - B2B Landing Page (Profissionais)
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
  Sparkles,
  Heart,
  ClipboardList,
  BarChart3,
  Shield,
} from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { LandingHeader } from './components/LandingHeader';
import { LandingFooter } from './components/LandingFooter';

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sand-50 via-white to-olive-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olive-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-peach-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23738251' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-olive-100/80 text-olive-700 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Stethoscope className="w-4 h-4" />
              <span>Portal gratuito para profissionais de saúde</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6">
              Acompanhe seus{' '}
              <span className="text-olive-600 relative">
                pacientes
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-peach-300" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              {' '}com dados reais da rotina do bebê.
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Prontuário integrado, agenda, convites e dados de rotina em um só lugar.
              Consultas mais informadas, menos retrabalho.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register?profile=professional"
                className="group inline-flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-olive-600/25 hover:shadow-xl hover:shadow-olive-600/30 hover:-translate-y-0.5"
              >
                Começar como profissional
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border-2 border-stone-200 hover:border-olive-200"
              >
                Ver como funciona
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>Até 50 pacientes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-900/10 p-3 w-[300px] border border-stone-100">
              <div className="bg-gradient-to-br from-olive-50 to-sand-50 rounded-[2.5rem] p-6 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-stone-400">Portal Profissional</p>
                    <p className="font-semibold text-stone-700">Dr. Silva</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-olive-600" />
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-peach-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-700">Pacientes ativos</p>
                        <p className="text-xs text-stone-400">12 vinculados</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-lavender-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-700">Agenda hoje</p>
                        <p className="text-xs text-stone-400">3 consultas</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-700">Prontuário</p>
                        <p className="text-xs text-stone-400">Rotinas, vacinas, marcos</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-r from-olive-500 to-olive-600 rounded-2xl p-4 text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dados em tempo real</p>
                      <p className="text-xs text-olive-100 mt-1">Rotinas dos pacientes na palma da mão</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: ClipboardList,
      title: 'Pais chegam sem dados',
      description: 'Consultas baseadas em memória. "Acho que mamou bem" ou "Dormiu mais ou menos".',
    },
    {
      icon: BarChart3,
      title: 'Consultas superficiais',
      description: 'Pouco tempo para entender padrões reais de alimentação, sono e desenvolvimento.',
    },
    {
      icon: FileText,
      title: 'Informações dispersas',
      description: 'Planilhas, anotações e apps diferentes. Nada integrado ao seu fluxo.',
    },
    {
      icon: Users,
      title: 'Engajamento baixo',
      description: 'Pais não seguem recomendações por falta de organização e acompanhamento.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">O desafio</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Consultas mais <span className="text-olive-600">informadas</span> começam com dados reais
          </h2>
          <p className="text-lg text-stone-600 leading-relaxed">
            Quando os pais registram a rotina do bebê, você tem acesso a dados concretos
            para tomar decisões clínicas mais precisas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-olive-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-peach-50 group-hover:bg-peach-100 flex items-center justify-center mb-4 transition-colors">
                <problem.icon className="w-7 h-7 text-peach-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-800 mb-2">{problem.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="py-20 bg-olive-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0c27.614 0 50 22.386 50 50s-22.386 50-50 50S0 77.614 0 50 22.386 0 50 0zm0 10c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-olive-200 font-medium mb-4">A solução</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              Prontuário integrado com dados de rotina
            </h2>
            <p className="text-xl text-olive-100 mb-8 leading-relaxed">
              A OlieCare conecta você aos seus pacientes. Quando os pais registram alimentação,
              sono, fraldas e marcos, você vê tudo organizado no prontuário.
            </p>

            <div className="space-y-4">
              {[
                'Dados de rotina (alimentação, sono, fraldas) em tempo real',
                'Calendário de vacinas e marcos de desenvolvimento',
                'Gráficos de crescimento com curvas de referência',
                'Agenda de consultas e prontuário simplificado',
                'Convite para pacientes se cadastrarem com um clique',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-olive-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-olive-50">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                to="/register?profile=professional"
                className="group inline-flex items-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg"
              >
                Cadastrar grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-olive-600" />
                  </div>
                </div>
              </div>
              {[Users, Calendar, FileText, LineChart, UserPlus, Shield].map((Icon, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <div
                    key={index}
                    className="absolute w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    style={{
                      left: `calc(50% + ${x}px - 28px)`,
                      top: `calc(50% + ${y}px - 28px)`,
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Users, title: 'Pacientes vinculados', description: 'Até 50 pacientes com dados de rotina em tempo real.', color: 'peach' },
    { icon: Calendar, title: 'Agenda', description: 'Agende consultas e acompanhe sua rotina clínica.', color: 'lavender' },
    { icon: FileText, title: 'Prontuário', description: 'Visitas, receitas, atestados e dados do bebê em um só lugar.', color: 'sky' },
    { icon: UserPlus, title: 'Convites', description: 'Convide pacientes por e-mail para se cadastrarem na OlieCare.', color: 'olive' },
    { icon: LineChart, title: 'Crescimento', description: 'Gráficos com curvas de referência (OMS) para acompanhamento.', color: 'amber' },
    { icon: Shield, title: 'Segurança', description: 'Dados com consentimento do responsável. LGPD.', color: 'teal' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    peach: { bg: 'bg-peach-50', icon: 'text-peach-600' },
    lavender: { bg: 'bg-lavender-50', icon: 'text-lavender-600' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600' },
    olive: { bg: 'bg-olive-50', icon: 'text-olive-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
  };

  return (
    <section id="funcionalidades" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Funcionalidades</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Tudo o que você precisa, em um só lugar
          </h2>
          <p className="text-lg text-stone-600">
            Ferramentas pensadas para simplificar o seu dia a dia clínico.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color];
            return (
              <div
                key={index}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-olive-100 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-800 mb-2">{feature.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: '01', title: 'Cadastre-se grátis', description: 'Crie sua conta em menos de 1 minuto. Sem cartão.', icon: '✨' },
    { number: '02', title: 'Convide seus pacientes', description: 'Envie convites por e-mail. Eles se cadastram na OlieCare.', icon: '📧' },
    { number: '03', title: 'Veja dados nas consultas', description: 'Rotinas, vacinas, marcos e crescimento em tempo real.', icon: '📊' },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-gradient-to-b from-sand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Como funciona</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Três passos para começar
          </h2>
          <p className="text-lg text-stone-600">
            Simples e rápido. Sem custo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-olive-200 -translate-y-1/2 z-0" />
              )}
              <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-olive-100 text-olive-700 font-bold text-sm mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-3">{step.title}</h3>
                <p className="text-stone-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/register?profile=professional"
            className="group inline-flex items-center gap-2 bg-olive-600 hover:bg-olive-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-olive-600/25"
          >
            Começar agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    { icon: BarChart3, title: 'Consultas mais informadas', description: 'Dados reais em vez de "acho que".' },
    { icon: Calendar, title: 'Menos retrabalho', description: 'Pais organizados seguem melhor as orientações.' },
    { icon: Users, title: 'Pacientes engajados', description: 'Famílias que usam a OlieCare voltam mais preparadas.' },
    { icon: Heart, title: 'Diferencial no consultório', description: 'Ofereça uma ferramenta moderna aos seus pacientes.' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-olive-600 font-medium mb-4">Benefícios</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
              Por que profissionais escolhem a <span className="text-olive-600">OlieCare</span>
            </h2>
            <p className="text-lg text-stone-600 mb-8">
              O plano profissional é gratuito para criar o flywheel: cada pediatra que usa
              traz seus pacientes. E os pacientes que usam convertem para Premium.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-olive-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-stone-800 mb-1">{benefit.title}</h3>
                    <p className="text-stone-500 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-olive-50 to-sand-50 rounded-3xl p-8 border border-olive-100">
              <div className="flex items-center gap-1 mb-4">
                <Stethoscope className="w-8 h-8 text-olive-600" />
              </div>
              <blockquote className="text-lg text-stone-700 mb-6 italic">
                "Agora meus pacientes chegam com os dados organizados. Consigo ver padrões
                de sono e alimentação que antes eu só perguntava. A consulta ficou muito mais produtiva."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-olive-200 flex items-center justify-center">
                  <span className="text-olive-700 font-semibold">DS</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Dra. Silva</p>
                  <p className="text-sm text-stone-500">Pediatra, São Paulo</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-stone-100">
              <p className="text-3xl font-bold text-olive-600">R$ 0</p>
              <p className="text-sm text-stone-500">para sempre</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="precos" className="py-20 bg-gradient-to-b from-white to-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Planos</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Plano Profissional gratuito
          </h2>
          <p className="text-lg text-stone-600">
            Estratégico para você. Sem custo. Sem compromisso.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl p-8 bg-olive-600 text-white shadow-xl shadow-olive-600/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-peach-400 text-stone-800 text-sm font-semibold px-4 py-1 rounded-full">
                Para profissionais
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold mb-2 text-white">Profissional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$ 0</span>
                <span className="text-olive-200">/para sempre</span>
              </div>
              <p className="mt-2 text-olive-100">
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
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-olive-200" />
                  <span className="text-olive-50">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register?profile=professional"
              className="block w-full text-center py-4 rounded-2xl font-semibold transition-all duration-300 bg-white text-olive-700 hover:bg-olive-50"
            >
              Cadastrar grátis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-olive-600 via-olive-600 to-olive-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-6xl mb-6">🩺</div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Pronto para acompanhar seus pacientes com dados reais?
        </h2>
        <p className="text-xl text-olive-100 mb-10 max-w-2xl mx-auto">
          Junte-se a profissionais que já usam a OlieCare. Cadastro gratuito, sem cartão.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register?profile=professional"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
          >
            Começar como profissional
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-olive-100">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>100% gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Cancelamento simples</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Sem compromisso</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfLandingPage() {
  return (
    <>
    <SEOHead
      title="Para Profissionais - Acompanhe Pacientes com Dados Reais"
      description="Portal gratuito OlieCare para pediatras e especialistas. Prontuário integrado, agenda, convites e dados de rotina dos bebês em um só lugar."
      canonical="/para-profissionais"
    />
    <div className="min-h-screen bg-white">
      <LandingHeader variant="b2b" />
      <main className="pt-16">
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
