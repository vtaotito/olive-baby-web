import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  Moon,
  Droplets,
  Bath,
  LineChart,
  Brain,
  Bell,
  FileText,
  ChevronRight,
  Check,
  Heart,
  Shield,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Coffee,
  Clock,
  HelpCircle,
  Star,
} from 'lucide-react';

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background com gradientes sutis */}
      <div className="absolute inset-0 bg-gradient-to-br from-sand-50 via-white to-olive-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olive-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-peach-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      
      {/* Padrão decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23738251' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-olive-100/80 text-olive-700 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Organize a rotina do seu bebê com carinho</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6">
              Mais tranquilidade para cuidar do seu{' '}
              <span className="text-olive-600 relative">
                bebê
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-peach-300" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              , um dia de cada vez.
            </h1>
            
            <p className="text-lg sm:text-xl text-stone-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Acompanhe alimentação, sono, fraldas e muito mais. 
              Receba insights personalizados e tenha <strong className="text-stone-700">clareza</strong> mesmo 
              nos dias mais cansativos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-olive-600/25 hover:shadow-xl hover:shadow-olive-600/30 hover:-translate-y-0.5"
              >
                Começar grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border-2 border-stone-200 hover:border-olive-200"
              >
                Ver como funciona
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>Gratuito para começar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive-500" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Ilustração/Preview do App */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Phone mockup */}
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-900/10 p-3 mx-auto w-[300px] border border-stone-100">
                <div className="bg-gradient-to-br from-olive-50 to-sand-50 rounded-[2.5rem] p-6 min-h-[500px] flex flex-col">
                  {/* Header do app */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-stone-400">Olá, mamãe</p>
                      <p className="font-semibold text-stone-700">Helena 💛</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-olive-600" />
                    </div>
                  </div>
                  
                  {/* Cards de atividade */}
                  <div className="space-y-3 flex-1">
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center">
                          <Baby className="w-5 h-5 text-peach-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-700">Última mamada</p>
                          <p className="text-xs text-stone-400">há 2h · 15 min</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300" />
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-lavender-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-700">Soneca atual</p>
                          <p className="text-xs text-stone-400">dormindo há 45 min</p>
                        </div>
                        <span className="text-xs bg-olive-100 text-olive-700 px-2 py-1 rounded-full">ativo</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-700">Fraldas hoje</p>
                          <p className="text-xs text-stone-400">5 trocas</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300" />
                      </div>
                    </div>
                  </div>

                  {/* Insight card */}
                  <div className="mt-4 bg-gradient-to-r from-olive-500 to-olive-600 rounded-2xl p-4 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dica do dia</p>
                        <p className="text-xs text-olive-100 mt-1">Helena está dormindo bem! Média de 14h nas últimas 24h.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-lg shadow-stone-900/5 p-4 animate-float">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-medium text-stone-600">+2.4k mamães</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-8 bg-white rounded-2xl shadow-lg shadow-stone-900/5 p-4 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-stone-600">4.9/5 avaliação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PROBLEMA SECTION
// ============================================
function ProblemSection() {
  const problems = [
    {
      icon: Coffee,
      title: 'Noites sem fim',
      description: 'Você perdeu a conta de quantas vezes acordou. O cansaço é real.',
    },
    {
      icon: HelpCircle,
      title: '"Será que mamou bem?"',
      description: 'A dúvida constante se o bebê está se alimentando o suficiente.',
    },
    {
      icon: Clock,
      title: 'Horários confusos',
      description: 'Quando foi a última fralda? A que horas ele dormiu? Difícil lembrar.',
    },
    {
      icon: Brain,
      title: 'Sobrecarga mental',
      description: 'Mil coisas para lembrar, decidir e cuidar. Todo. Santo. Dia.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Você não está sozinho(a)</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Cuidar de um recém-nascido é <span className="text-peach-600">lindo</span>,
            mas também é <span className="text-stone-500">exaustivo</span>
          </h2>
          <p className="text-lg text-stone-600 leading-relaxed">
            A maternidade e paternidade não vêm com manual. E tudo bem não ter todas as respostas.
            O importante é ter <strong>apoio</strong>.
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

        <div className="text-center mt-12">
          <p className="text-stone-500 italic">
            "Eu só queria um lugar para anotar tudo sem esquecer nada..." — Maria, mãe de primeira viagem
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SOLUÇÃO SECTION
// ============================================
function SolutionSection() {
  return (
    <section className="py-20 bg-olive-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0c27.614 0 50 22.386 50 50s-22.386 50-50 50S0 77.614 0 50 22.386 0 50 0zm0 10c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-olive-200 font-medium mb-4">Conheça a OlieCare</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              A sua nova forma de acompanhar a rotina do bebê
            </h2>
            <p className="text-xl text-olive-100 mb-8 leading-relaxed">
              A OlieCare é o seu diário digital do bebê. Simples, bonito e feito para 
              caber na sua rotina — mesmo quando você está com uma mão só.
            </p>

            <div className="space-y-4">
              {[
                'Registre alimentação, sono, fraldas, banho e extrações',
                'Veja padrões e entenda a rotina do seu bebê',
                'Receba insights inteligentes e personalizados',
                'Compartilhe com quem cuida junto com você',
                'Tenha tudo organizado em um só lugar',
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
                to="/register"
                className="group inline-flex items-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg"
              >
                Quero experimentar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center">
            {/* Visual representation */}
            <div className="relative w-80 h-80">
              {/* Central circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                    <Heart className="w-10 h-10 text-olive-600" />
                  </div>
                </div>
              </div>

              {/* Orbiting elements */}
              {[Baby, Moon, Droplets, LineChart, Brain, Bell].map((Icon, index) => {
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

// ============================================
// FEATURES SECTION
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: Baby,
      title: 'Alimentação',
      description: 'Registre amamentação, mamadeira ou complemento. Cronômetro integrado para cada mamada.',
      color: 'peach',
    },
    {
      icon: Moon,
      title: 'Sono',
      description: 'Acompanhe início, fim e qualidade do sono. Veja os padrões de descanso do bebê.',
      color: 'lavender',
    },
    {
      icon: Droplets,
      title: 'Fraldas',
      description: 'Registre trocas com tipo (xixi, cocô ou mista). Ideal para acompanhar a saúde digestiva.',
      color: 'sky',
    },
    {
      icon: LineChart,
      title: 'Crescimento',
      description: 'Acompanhe peso, altura e perímetro cefálico. Visualize a evolução com gráficos claros.',
      color: 'olive',
    },
    {
      icon: Brain,
      title: 'Insights com IA',
      description: 'Receba análises inteligentes sobre padrões, tendências e sugestões personalizadas.',
      color: 'amber',
    },
    {
      icon: Bell,
      title: 'Lembretes',
      description: 'Configure alertas para próxima mamada, troca de fralda ou hora do banho.',
      color: 'rose',
    },
    {
      icon: Bath,
      title: 'Banho e Cuidados',
      description: 'Registre banhos e outros cuidados diários. Mantenha a rotina organizada.',
      color: 'teal',
    },
    {
      icon: FileText,
      title: 'Relatórios',
      description: 'Exporte dados em PDF para levar nas consultas pediátricas.',
      color: 'stone',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    peach: { bg: 'bg-peach-50', icon: 'text-peach-600' },
    lavender: { bg: 'bg-lavender-50', icon: 'text-lavender-600' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600' },
    olive: { bg: 'bg-olive-50', icon: 'text-olive-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
    stone: { bg: 'bg-stone-100', icon: 'text-stone-600' },
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
            Ferramentas pensadas para simplificar o seu dia a dia, sem complicação.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

// ============================================
// HOW IT WORKS SECTION
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Crie sua conta',
      description: 'Cadastro rápido e gratuito. Leva menos de 1 minuto.',
      icon: '✨',
    },
    {
      number: '02',
      title: 'Cadastre seu bebê',
      description: 'Adicione as informações básicas como nome e data de nascimento.',
      icon: '👶',
    },
    {
      number: '03',
      title: 'Registre e acompanhe',
      description: 'Comece a registrar a rotina e receba insights personalizados.',
      icon: '📊',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-gradient-to-b from-sand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Como funciona</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Simples assim. Três passos.
          </h2>
          <p className="text-lg text-stone-600">
            Você não precisa de tutorial. É intuitivo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
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
            to="/register"
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

// ============================================
// BENEFITS SECTION
// ============================================
function BenefitsSection() {
  const benefits = [
    {
      icon: Shield,
      title: 'Mais segurança',
      description: 'Saber que está fazendo a coisa certa traz paz de espírito para você e para o bebê.',
    },
    {
      icon: Heart,
      title: 'Menos ansiedade',
      description: 'Com os dados organizados, você para de se preocupar com o que pode estar esquecendo.',
    },
    {
      icon: Sparkles,
      title: 'Mais clareza',
      description: 'Visualize padrões e entenda melhor as necessidades do seu pequeno.',
    },
    {
      icon: Brain,
      title: 'Menos decisões no cansaço',
      description: 'A OlieCare sugere, você decide. Sem pressão, no seu tempo.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-olive-600 font-medium mb-4">Benefícios</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
              Cuidar do bebê fica mais leve quando você tem <span className="text-olive-600">apoio</span>
            </h2>
            <p className="text-lg text-stone-600 mb-8">
              Não se trata apenas de anotar informações. É sobre ter confiança no dia a dia, 
              mesmo quando você está exausto(a).
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
            {/* Testimonial card */}
            <div className="bg-gradient-to-br from-olive-50 to-sand-50 rounded-3xl p-8 border border-olive-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg text-stone-700 mb-6 italic">
                "A OlieCare me salvou. Eu estava tão cansada que não conseguia lembrar quando 
                tinha amamentado por último. Agora tenho tudo registrado e consigo até ver 
                que meu filho mama mais de manhã. Isso me ajudou a organizar minha rotina."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-olive-200 flex items-center justify-center">
                  <span className="text-olive-700 font-semibold">JC</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Juliana C.</p>
                  <p className="text-sm text-stone-500">Mãe do Pedro, 3 meses</p>
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-stone-100">
              <p className="text-3xl font-bold text-olive-600">98%</p>
              <p className="text-sm text-stone-500">das mães sentem mais calma</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================
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
      ],
      cta: 'Começar grátis',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: 'R$ 14,90',
      period: 'por mês',
      description: 'Para famílias que querem o máximo de organização e insights.',
      features: [
        'Tudo do plano grátis',
        'Bebês ilimitados',
        'Histórico completo',
        'Gráficos avançados',
        'Insights com IA personalizados',
        'Lembretes inteligentes',
        'Exportação de relatórios PDF',
        'Compartilhamento com cuidadores',
        'Suporte prioritário',
      ],
      cta: 'Assinar Premium',
      highlighted: true,
    },
  ];

  return (
    <section id="precos" className="py-20 bg-gradient-to-b from-white to-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-olive-600 font-medium mb-4">Planos</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-800 mb-6">
            Escolha o plano ideal para sua família
          </h2>
          <p className="text-lg text-stone-600">
            Comece grátis e evolua quando fizer sentido para você. Sem pressão.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-olive-600 text-white shadow-xl shadow-olive-600/20'
                  : 'bg-white border border-stone-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-peach-400 text-stone-800 text-sm font-semibold px-4 py-1 rounded-full">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-stone-800'
                }`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-stone-800'
                  }`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-olive-200' : 'text-stone-500'}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`mt-2 ${plan.highlighted ? 'text-olive-100' : 'text-stone-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'text-olive-200' : 'text-olive-500'
                    }`} />
                    <span className={plan.highlighted ? 'text-olive-50' : 'text-stone-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full text-center py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white text-olive-700 hover:bg-olive-50'
                    : 'bg-olive-600 text-white hover:bg-olive-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-stone-500 mt-8">
          Todos os planos incluem 7 dias de teste grátis do Premium. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}

// ============================================
// CTA FINAL SECTION
// ============================================
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-olive-600 via-olive-600 to-olive-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-6xl mb-6">💛</div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Pronto para ter mais tranquilidade?
        </h2>
        <p className="text-xl text-olive-100 mb-10 max-w-2xl mx-auto">
          Junte-se a milhares de famílias que já descobriram como é ter a rotina do bebê 
          organizada. Comece agora, é grátis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-olive-50 text-olive-700 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
          >
            Criar minha conta agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-olive-100">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Teste gratuito de 7 dias</span>
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

// ============================================
// HEADER/NAV
// ============================================
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-olive-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-stone-800">OlieCare</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-stone-600 hover:text-olive-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-stone-600 hover:text-olive-600 transition-colors">
              Como funciona
            </a>
            <a href="#precos" className="text-stone-600 hover:text-olive-600 transition-colors">
              Preços
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-stone-600 hover:text-olive-600 transition-colors font-medium">
              Entrar
            </Link>
            <Link
              to="/register"
              className="bg-olive-600 hover:bg-olive-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100">
            <nav className="flex flex-col gap-4">
              <a href="#funcionalidades" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Como funciona
              </a>
              <a href="#precos" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Preços
              </a>
              <Link to="/login" className="text-stone-600 hover:text-olive-600 transition-colors py-2 font-medium">
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-olive-600 hover:bg-olive-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors text-center"
              >
                Começar grátis
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-olive-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">OlieCare</span>
            </Link>
            <p className="text-stone-400 max-w-sm leading-relaxed">
              Ajudando famílias a acompanharem a rotina dos seus bebês com mais clareza, 
              organização e tranquilidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><a href="mailto:contato@oliecare.cloud" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} OlieCare. Todos os direitos reservados.</p>
          <p className="text-sm">Feito com 💛 para famílias</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
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
      <Footer />
    </div>
  );
}
