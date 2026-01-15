// Olive Baby Web - Help & Support Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  MessageCircle,
  Mail,
  BookOpen,
  Heart,
  Star,
  ExternalLink,
  Baby,
  Utensils,
  Moon,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { cn } from '../../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: 'Rotinas',
    question: 'Como registrar uma alimentação?',
    answer: 'Acesse a tela de rotinas, selecione "Alimentação" e toque em "Iniciar". Você pode escolher o tipo (seio, mamadeira, etc) e o aplicativo começará a contar o tempo. Quando terminar, toque em "Finalizar".',
  },
  {
    category: 'Rotinas',
    question: 'O que fazer se esqueci de registrar uma rotina?',
    answer: 'Você pode editar registros passados! Vá no histórico de rotinas, encontre o dia desejado e adicione manualmente informando os horários de início e fim.',
  },
  {
    category: 'Bebês',
    question: 'Posso cadastrar mais de um bebê?',
    answer: 'Sim! Você pode cadastrar quantos bebês precisar. Cada bebê terá seu próprio histórico de rotinas, crescimento e marcos de desenvolvimento.',
  },
  {
    category: 'Bebês',
    question: 'Como compartilhar o acompanhamento com outra pessoa?',
    answer: 'Acesse as configurações do bebê e use a opção "Compartilhar". Você pode convidar familiares ou profissionais de saúde por email. Eles receberão um convite para acessar os dados.',
  },
  {
    category: 'Assistente IA',
    question: 'O que é a Olívia?',
    answer: 'A Olívia é nossa assistente de IA especializada em cuidados com bebês. Ela analisa os padrões de rotina do seu bebê e oferece insights personalizados, além de responder dúvidas sobre amamentação, sono e desenvolvimento.',
  },
  {
    category: 'Conta',
    question: 'Como exportar meus dados?',
    answer: 'Acesse Configurações > Privacidade > Exportar Meus Dados. Você receberá um arquivo com todas as informações do bebê, incluindo rotinas, crescimento e marcos.',
  },
  {
    category: 'Conta',
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta a ponta e seguimos todas as diretrizes da LGPD. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros sem seu consentimento.',
  },
];

const categories = [
  { id: 'rotinas', label: 'Rotinas', icon: Utensils },
  { id: 'bebes', label: 'Bebês', icon: Baby },
  { id: 'assistente', label: 'Assistente IA', icon: Sparkles },
  { id: 'conta', label: 'Conta', icon: Users },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQ = selectedCategory
    ? faqItems.filter(item => item.category.toLowerCase() === selectedCategory)
    : faqItems;

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-olive-600" />
            Ajuda e Suporte
          </h1>
          <p className="text-gray-500">Tire suas dúvidas e entre em contato</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href="mailto:contact@api.oliecare.cloud"
            className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl border border-gray-200 hover:border-olive-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-olive-600" />
            </div>
            <span className="font-medium text-gray-900">Email</span>
            <span className="text-xs text-gray-500">contact@api.oliecare.cloud</span>
          </a>

          <a
            href="https://wa.me/5548984218268"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-medium text-gray-900">WhatsApp</span>
            <span className="text-xs text-gray-500">+55 48 98421-8268</span>
          </a>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader title="Categorias" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === null
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
                    selectedCategory === cat.id
                      ? 'bg-olive-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader 
            title="Perguntas Frequentes" 
            subtitle={`${filteredFAQ.length} pergunta${filteredFAQ.length !== 1 ? 's' : ''}`}
          />
          <CardBody className="divide-y divide-gray-100">
            {filteredFAQ.map((item, index) => (
              <div key={index} className="py-3 first:pt-0 last:pb-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform mt-0.5',
                      expandedFAQ === index && 'rotate-180'
                    )}
                  />
                  <div className="flex-1">
                    <span className="text-xs text-olive-600 font-medium uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h4 className="font-medium text-gray-900 mt-1">
                      {item.question}
                    </h4>
                    {expandedFAQ === index && (
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader title="Recursos" />
          <CardBody className="space-y-3">
            <a
              href="/guia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Guia do Usuário</h4>
                <p className="text-sm text-gray-500">Aprenda a usar todas as funcionalidades</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <a
              href="https://instagram.com/olivebaby"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Instagram</h4>
                <p className="text-sm text-gray-500">Dicas e conteúdo sobre maternidade</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </CardBody>
        </Card>

        {/* Rate App */}
        <Card className="bg-gradient-to-br from-olive-50 to-olive-100 border-olive-200">
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 bg-olive-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gostando do OlieCare?
            </h3>
            <p className="text-gray-600 mb-4">
              Sua avaliação nos ajuda a continuar melhorando!
            </p>
            <Button
              onClick={() => {
                // TODO: Link to app store rating
                window.open('https://play.google.com/store/apps/details?id=com.olivebaby', '_blank');
              }}
            >
              Avaliar o App
            </Button>
          </CardBody>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-400 py-4">
          <p>OlieCare v1.0.0</p>
          <p>© 2024 OlieCare. Todos os direitos reservados.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

