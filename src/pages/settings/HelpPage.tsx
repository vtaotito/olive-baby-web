// Olive Baby Web - Help and Support Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Baby,
  Moon,
  Utensils,
  TrendingUp,
  Users,
  FileText,
  Lightbulb,
  Heart,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { cn } from '../../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FeatureGuide {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  link?: string;
}

export function HelpPage() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      category: 'Geral',
      question: 'Como funciona o Olive Baby?',
      answer: 'O Olive Baby é um aplicativo completo para acompanhar o desenvolvimento do seu bebê. Você pode registrar rotinas como alimentação, sono, troca de fraldas, banho e extração de leite. O app gera gráficos e insights automáticos para ajudar você a entender melhor os padrões do seu bebê.',
    },
    {
      category: 'Rotinas',
      question: 'Como registro uma mamada?',
      answer: 'No dashboard, clique no botão "Alimentação" ou acesse o menu "Rotinas > Alimentação". Você pode iniciar um timer, informar qual seio foi usado, adicionar complemento se necessário, e incluir observações.',
    },
    {
      category: 'Rotinas',
      question: 'O que fazer se esqueci de parar o timer?',
      answer: 'Não se preocupe! Você pode editar a rotina no histórico e ajustar o horário de término. Acesse "Rotinas > Histórico", encontre a rotina em questão e clique para editar.',
    },
    {
      category: 'Dados',
      question: 'Como funciona a alternância dos seios?',
      answer: 'Ao registrar uma mamada, você informa qual seio foi usado (esquerdo, direito ou ambos). O app calcula automaticamente a distribuição e te avisa se houver desequilíbrio, ajudando a manter a produção equilibrada.',
    },
    {
      category: 'Dados',
      question: 'Os gráficos mostram qual período?',
      answer: 'Por padrão, os gráficos mostram os últimos 7 dias. Você pode ajustar o período em algumas telas para ver dados de 24h, 7 dias, 30 dias ou períodos personalizados.',
    },
    {
      category: 'Privacidade',
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Todos os dados são criptografados e armazenados de forma segura. Nós seguimos as melhores práticas de segurança e estamos em conformidade com a LGPD (Lei Geral de Proteção de Dados).',
    },
    {
      category: 'Conta',
      question: 'Posso cadastrar mais de um bebê?',
      answer: 'Sim! Você pode cadastrar múltiplos bebês em "Configurações > Bebês" e alternar entre eles facilmente no dashboard.',
    },
    {
      category: 'Conta',
      question: 'Como compartilho o acompanhamento com outras pessoas?',
      answer: 'Em "Equipe", você pode convidar outros cuidadores (parceiro, avós, babá) para colaborar no acompanhamento. Você também pode adicionar profissionais como pediatras e consultoras.',
    },
    {
      category: 'Exportação',
      question: 'Posso exportar os dados para levar na consulta?',
      answer: 'Sim! Na seção "Exportar", você pode gerar relatórios em PDF ou CSV com todos os dados das rotinas, crescimento e marcos do desenvolvimento.',
    },
    {
      category: 'Notificações',
      question: 'Como funcionam os lembretes?',
      answer: 'Você pode configurar lembretes para rotinas em "Configurações > Notificações". Defina horários específicos ou intervalos para ser notificado sobre alimentação, sono, banho e outras atividades.',
    },
  ];

  const featureGuides: FeatureGuide[] = [
    {
      icon: Baby,
      title: 'Dashboard',
      description: 'Visão geral com resumo de hoje e acesso rápido às rotinas',
      color: 'bg-olive-100 text-olive-600',
      link: '/dashboard',
    },
    {
      icon: Utensils,
      title: 'Amamentação',
      description: 'Registre mamadas, alterne seios e veja insights sobre alimentação',
      color: 'bg-yellow-100 text-yellow-600',
      link: '/feeding/dashboard',
    },
    {
      icon: Moon,
      title: 'Sono',
      description: 'Acompanhe padrões de sono e identifique rotinas',
      color: 'bg-blue-100 text-blue-600',
      link: '/routines/sleep',
    },
    {
      icon: TrendingUp,
      title: 'Crescimento',
      description: 'Monitore peso, altura e perímetro cefálico com gráficos',
      color: 'bg-green-100 text-green-600',
      link: '/growth',
    },
    {
      icon: Heart,
      title: 'Marcos do Desenvolvimento',
      description: 'Acompanhe as conquistas e desenvolvimento do seu bebê',
      color: 'bg-purple-100 text-purple-600',
      link: '/milestones',
    },
    {
      icon: Users,
      title: 'Equipe',
      description: 'Compartilhe o acompanhamento com cuidadores e profissionais',
      color: 'bg-pink-100 text-pink-600',
      link: '/team',
    },
    {
      icon: FileText,
      title: 'Exportar Dados',
      description: 'Gere relatórios em PDF ou CSV para consultas',
      color: 'bg-indigo-100 text-indigo-600',
      link: '/export',
    },
  ];

  const quickTips = [
    {
      icon: Lightbulb,
      tip: 'Use o timer para não precisar lembrar os horários exatos das rotinas',
    },
    {
      icon: Lightbulb,
      tip: 'Adicione notas nas rotinas para registrar detalhes importantes',
    },
    {
      icon: Lightbulb,
      tip: 'Confira os gráficos regularmente para identificar padrões',
    },
    {
      icon: Lightbulb,
      tip: 'Exporte os dados antes das consultas pediátricas',
    },
    {
      icon: Lightbulb,
      tip: 'Convide o parceiro para compartilhar o acompanhamento',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Group FAQ by category
  const faqByCategory = faqItems.reduce((acc, item, index) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, (FAQItem & { originalIndex: number })[]>);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-olive-600" />
          Ajuda e Suporte
        </h1>
        <p className="text-gray-500">Como podemos te ajudar hoje?</p>
      </div>

      {/* Quick Access Feature Guides */}
      <Card className="mb-6">
        <CardHeader title="Guias de Funcionalidades" subtitle="Conheça as principais ferramentas do app" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featureGuides.map((guide, index) => (
              <button
                key={index}
                onClick={() => guide.link && navigate(guide.link)}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-300 hover:shadow-sm transition-all text-left"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', guide.color)}>
                  <guide.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                  <p className="text-sm text-gray-600">{guide.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* FAQ Section */}
      <Card className="mb-6">
        <CardHeader title="Perguntas Frequentes (FAQ)" subtitle="Respostas para as dúvidas mais comuns" />
        <CardBody>
          <div className="space-y-6">
            {Object.entries(faqByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.originalIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(item.originalIndex)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {item.question}
                        </span>
                        {expandedFAQ === item.originalIndex ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === item.originalIndex && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Quick Tips */}
      <Card className="mb-6">
        <CardHeader title="Dicas Rápidas" subtitle="Aproveite ao máximo o Olive Baby" />
        <CardBody>
          <div className="space-y-3">
            {quickTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-olive-50 rounded-lg">
                <tip.icon className="w-5 h-5 text-olive-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader title="Precisa de mais ajuda?" subtitle="Entre em contato com nosso suporte" />
        <CardBody>
          <div className="space-y-3">
            <a
              href="mailto:suporte@olivebaby.com"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-olive-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-olive-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-sm text-gray-600">suporte@olivebaby.com</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">Chat ao vivo: Seg-Sex, 9h-18h</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Telefone</h3>
                <p className="text-sm text-gray-600">(11) 9999-9999 - Seg-Sex, 9h-18h</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex gap-3">
              <Book className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Base de Conhecimento</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Acesse nossa documentação completa com guias detalhados, vídeos tutoriais e artigos sobre desenvolvimento infantil.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://docs.olivebaby.com', '_blank')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Acessar Documentação
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* App Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Olive Baby Web v1.0.0</p>
        <p className="mt-1 text-gray-400">
          Termos de Uso • Política de Privacidade
        </p>
      </div>
    </DashboardLayout>
  );
}
