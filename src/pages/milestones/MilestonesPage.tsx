// Olive Baby Web - Milestones Page (Improved UI/UX)
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Star,
  Plus,
  Check,
  Trophy,
  Sparkles,
  MessageCircle,
  Footprints,
  Brain,
  Heart,
  Trash2,
  ChevronUp,
  X,
  Calendar,
  Target,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { milestoneService } from '../../services/api';
import { formatDateBR, calculateAgeMonths, cn } from '../../lib/utils';
import type { Milestone } from '../../types';

type MilestoneCategory = 'MOTOR' | 'COGNITIVE' | 'SOCIAL' | 'LANGUAGE';

const categories: { value: MilestoneCategory; label: string; icon: React.ElementType; color: string; bgLight: string }[] = [
  { value: 'MOTOR', label: 'Motor', icon: Footprints, color: 'bg-blue-100 text-blue-600', bgLight: 'bg-blue-50 border-blue-200' },
  { value: 'COGNITIVE', label: 'Cognitivo', icon: Brain, color: 'bg-purple-100 text-purple-600', bgLight: 'bg-purple-50 border-purple-200' },
  { value: 'SOCIAL', label: 'Social', icon: Heart, color: 'bg-pink-100 text-pink-600', bgLight: 'bg-pink-50 border-pink-200' },
  { value: 'LANGUAGE', label: 'Linguagem', icon: MessageCircle, color: 'bg-green-100 text-green-600', bgLight: 'bg-green-50 border-green-200' },
];

const suggestedMilestones: { category: MilestoneCategory; ageMonths: number; title: string; description?: string }[] = [
  // Motor - 0 a 36 meses
  { category: 'MOTOR', ageMonths: 1, title: 'Levanta brevemente a cabeca de brucos', description: 'Consegue erguer a cabeca por alguns segundos quando de barriga para baixo' },
  { category: 'MOTOR', ageMonths: 2, title: 'Levanta a cabeca quando de brucos', description: 'Sustenta a cabeca a 45 graus na posicao prona' },
  { category: 'MOTOR', ageMonths: 3, title: 'Sustenta a cabeca firmemente', description: 'Mantem a cabeca erguida de forma estavel' },
  { category: 'MOTOR', ageMonths: 3, title: 'Abre e fecha as maos', description: 'Movimenta os dedos de forma voluntaria' },
  { category: 'MOTOR', ageMonths: 4, title: 'Rola de barriga para cima', description: 'Consegue virar da posicao prona para supina' },
  { category: 'MOTOR', ageMonths: 5, title: 'Rola de costas para barriga', description: 'Vira completo para ambos os lados' },
  { category: 'MOTOR', ageMonths: 5, title: 'Agarra objetos com as duas maos', description: 'Segura brinquedos usando as duas maos simultaneamente' },
  { category: 'MOTOR', ageMonths: 6, title: 'Senta com apoio', description: 'Fica sentado com suporte dos bracos ou travesseiros' },
  { category: 'MOTOR', ageMonths: 7, title: 'Senta sem apoio', description: 'Consegue sentar sozinho de forma estavel' },
  { category: 'MOTOR', ageMonths: 8, title: 'Engatinha', description: 'Se movimenta de gatinhas pelo ambiente' },
  { category: 'MOTOR', ageMonths: 9, title: 'Puxa para ficar em pe', description: 'Usa moveis para se levantar sozinho' },
  { category: 'MOTOR', ageMonths: 10, title: 'Fica em pe com apoio', description: 'Permanece em pe segurando em moveis' },
  { category: 'MOTOR', ageMonths: 10, title: 'Pinca com polegar e indicador', description: 'Pega objetos pequenos com a pinca fina' },
  { category: 'MOTOR', ageMonths: 11, title: 'Caminha com apoio', description: 'Da passos apoiando-se em moveis ou maos' },
  { category: 'MOTOR', ageMonths: 12, title: 'Primeiros passos', description: 'Caminha sozinho sem apoio' },
  { category: 'MOTOR', ageMonths: 14, title: 'Anda com seguranca', description: 'Caminha sem cair frequentemente' },
  { category: 'MOTOR', ageMonths: 18, title: 'Corre', description: 'Corre de forma coordenada' },
  { category: 'MOTOR', ageMonths: 18, title: 'Empilha 2-3 blocos', description: 'Empilha blocos ou pecas' },
  { category: 'MOTOR', ageMonths: 20, title: 'Chuta bola', description: 'Chuta uma bola para frente' },
  { category: 'MOTOR', ageMonths: 24, title: 'Sobe escadas com apoio', description: 'Sobe degraus segurando-se' },
  { category: 'MOTOR', ageMonths: 24, title: 'Empilha 6 ou mais blocos', description: 'Coordenacao para empilhar mais blocos' },
  { category: 'MOTOR', ageMonths: 30, title: 'Pula com os dois pes', description: 'Salta com ambos os pes ao mesmo tempo' },
  { category: 'MOTOR', ageMonths: 36, title: 'Pedala triciclo', description: 'Consegue pedalar um triciclo' },

  // Cognitivo - 0 a 36 meses
  { category: 'COGNITIVE', ageMonths: 1, title: 'Foca o olhar em rostos', description: 'Mantem contato visual brevemente' },
  { category: 'COGNITIVE', ageMonths: 2, title: 'Acompanha objetos com os olhos', description: 'Segue visualmente um objeto em movimento' },
  { category: 'COGNITIVE', ageMonths: 3, title: 'Observa as proprias maos', description: 'Demonstra interesse por suas proprias maos' },
  { category: 'COGNITIVE', ageMonths: 4, title: 'Reconhece rostos familiares', description: 'Reage de forma diferente a pessoas conhecidas' },
  { category: 'COGNITIVE', ageMonths: 5, title: 'Explora objetos com a boca', description: 'Leva objetos a boca para explorar texturas' },
  { category: 'COGNITIVE', ageMonths: 6, title: 'Procura objeto escondido', description: 'Demonstra nocao de permanencia do objeto' },
  { category: 'COGNITIVE', ageMonths: 7, title: 'Transfere objetos entre maos', description: 'Passa brinquedos de uma mao para outra' },
  { category: 'COGNITIVE', ageMonths: 8, title: 'Explora causa e efeito', description: 'Repete acoes para ver o resultado (apertar botoes, sacudir chocalho)' },
  { category: 'COGNITIVE', ageMonths: 9, title: 'Entende o significado de "nao"', description: 'Para brevemente ao ouvir a palavra nao' },
  { category: 'COGNITIVE', ageMonths: 10, title: 'Imita gestos simples', description: 'Copia gestos como bater palmas' },
  { category: 'COGNITIVE', ageMonths: 12, title: 'Brinca de esconde-esconde', description: 'Participa ativamente da brincadeira' },
  { category: 'COGNITIVE', ageMonths: 12, title: 'Usa objetos corretamente', description: 'Leva telefone a orelha, escova no cabelo' },
  { category: 'COGNITIVE', ageMonths: 15, title: 'Aponta para o que quer', description: 'Usa o dedo para indicar interesse' },
  { category: 'COGNITIVE', ageMonths: 18, title: 'Faz brincadeira de faz de conta', description: 'Finge dar comida a boneca, fazer comidinha' },
  { category: 'COGNITIVE', ageMonths: 18, title: 'Identifica partes do corpo', description: 'Aponta nariz, olhos, boca quando perguntado' },
  { category: 'COGNITIVE', ageMonths: 24, title: 'Separa formas e cores', description: 'Classifica objetos por forma ou cor' },
  { category: 'COGNITIVE', ageMonths: 24, title: 'Completa quebra-cabeca simples', description: 'Encaixa pecas de quebra-cabecas de 3-4 pecas' },
  { category: 'COGNITIVE', ageMonths: 30, title: 'Conta ate 3', description: 'Recita numeros em ordem ate 3' },
  { category: 'COGNITIVE', ageMonths: 36, title: 'Entende conceito de "meu" e "seu"', description: 'Diferencia posse' },
  { category: 'COGNITIVE', ageMonths: 36, title: 'Conta ate 10', description: 'Recita numeros ate 10' },

  // Social - 0 a 36 meses
  { category: 'SOCIAL', ageMonths: 1, title: 'Acalma-se com a voz dos pais', description: 'Para de chorar ao ouvir voz familiar' },
  { category: 'SOCIAL', ageMonths: 2, title: 'Primeiro sorriso social', description: 'Sorri em resposta a estímulos sociais' },
  { category: 'SOCIAL', ageMonths: 3, title: 'Ri ao interagir', description: 'Da gargalhadas durante brincadeiras' },
  { category: 'SOCIAL', ageMonths: 4, title: 'Ri alto', description: 'Emite risadas audíveis e espontaneas' },
  { category: 'SOCIAL', ageMonths: 5, title: 'Gosta de se olhar no espelho', description: 'Demonstra interesse pelo proprio reflexo' },
  { category: 'SOCIAL', ageMonths: 6, title: 'Reconhece estranhos', description: 'Demonstra estranheza com desconhecidos' },
  { category: 'SOCIAL', ageMonths: 7, title: 'Responde a emocoes dos outros', description: 'Reage ao tom de voz feliz ou triste' },
  { category: 'SOCIAL', ageMonths: 8, title: 'Ansiedade de separacao', description: 'Fica desconfortavel quando pais se afastam' },
  { category: 'SOCIAL', ageMonths: 9, title: 'Da tchau', description: 'Acena "tchau" como gesto social' },
  { category: 'SOCIAL', ageMonths: 10, title: 'Bate palmas', description: 'Bate palmas em resposta a musica ou brincadeira' },
  { category: 'SOCIAL', ageMonths: 12, title: 'Mostra afeto', description: 'Abraca ou da beijo em pessoas queridas' },
  { category: 'SOCIAL', ageMonths: 14, title: 'Brinca ao lado de outras criancas', description: 'Jogo paralelo - brinca proximo mas nao junto' },
  { category: 'SOCIAL', ageMonths: 18, title: 'Demonstra independencia', description: 'Quer fazer as coisas sozinho' },
  { category: 'SOCIAL', ageMonths: 18, title: 'Ajuda a se vestir', description: 'Colabora ao colocar roupas, estende bracos' },
  { category: 'SOCIAL', ageMonths: 24, title: 'Brinca de faz de conta com outros', description: 'Inicia brincadeira cooperativa simples' },
  { category: 'SOCIAL', ageMonths: 24, title: 'Expressa varias emocoes', description: 'Demonstra alegria, tristeza, raiva, medo' },
  { category: 'SOCIAL', ageMonths: 30, title: 'Compartilha brinquedos', description: 'Divide espontaneamente com outras criancas' },
  { category: 'SOCIAL', ageMonths: 36, title: 'Brinca de turnos', description: 'Espera sua vez em brincadeiras e jogos' },
  { category: 'SOCIAL', ageMonths: 36, title: 'Mostra empatia', description: 'Tenta consolar quem esta triste' },

  // Linguagem - 0 a 36 meses
  { category: 'LANGUAGE', ageMonths: 1, title: 'Reage a sons altos', description: 'Assusta-se ou acalma-se com sons' },
  { category: 'LANGUAGE', ageMonths: 2, title: 'Balbucia sons', description: 'Emite sons como "aah", "ooh"' },
  { category: 'LANGUAGE', ageMonths: 3, title: 'Vocaliza em resposta', description: 'Faz sons quando alguem fala com ele' },
  { category: 'LANGUAGE', ageMonths: 4, title: 'Emite sons variados', description: 'Produz diferentes tipos de vocalizacoes' },
  { category: 'LANGUAGE', ageMonths: 5, title: 'Vira a cabeca para som', description: 'Localiza fonte sonora virando a cabeca' },
  { category: 'LANGUAGE', ageMonths: 6, title: 'Responde ao proprio nome', description: 'Vira quando chamado pelo nome' },
  { category: 'LANGUAGE', ageMonths: 6, title: 'Faz sons repetitivos (bababa)', description: 'Balbucio canonico com silabas repetidas' },
  { category: 'LANGUAGE', ageMonths: 8, title: 'Combina silabas diferentes', description: 'Junta silabas variadas como "bada", "gaba"' },
  { category: 'LANGUAGE', ageMonths: 9, title: 'Fala "mama" ou "papa"', description: 'Primeira palavra com significado' },
  { category: 'LANGUAGE', ageMonths: 10, title: 'Entende comandos simples', description: 'Segue instrucoes como "da pra mamae"' },
  { category: 'LANGUAGE', ageMonths: 12, title: 'Fala 2-3 palavras', description: 'Vocabulario ativo de poucas palavras' },
  { category: 'LANGUAGE', ageMonths: 15, title: 'Fala 5-10 palavras', description: 'Vocabulario em expansao' },
  { category: 'LANGUAGE', ageMonths: 18, title: 'Fala 15-20 palavras', description: 'Vocabulario significativo' },
  { category: 'LANGUAGE', ageMonths: 18, title: 'Aponta para objetos nomeados', description: 'Identifica objetos quando voce fala o nome' },
  { category: 'LANGUAGE', ageMonths: 24, title: 'Combina 2 palavras', description: 'Forma mini-frases como "quer agua", "mamae vem"' },
  { category: 'LANGUAGE', ageMonths: 24, title: 'Fala 50 ou mais palavras', description: 'Explosao de vocabulario' },
  { category: 'LANGUAGE', ageMonths: 30, title: 'Forma frases de 3 palavras', description: 'Estrutura frases mais completas' },
  { category: 'LANGUAGE', ageMonths: 30, title: 'Usa pronomes (eu, voce)', description: 'Incorpora pronomes na fala' },
  { category: 'LANGUAGE', ageMonths: 36, title: 'Conta historias simples', description: 'Narra eventos do dia de forma simples' },
  { category: 'LANGUAGE', ageMonths: 36, title: 'Faz perguntas (por que?)', description: 'Fase das perguntas constantes' },
];

const milestoneSchema = z.object({
  title: z.string().min(2, 'Titulo e obrigatorio'),
  category: z.enum(['MOTOR', 'COGNITIVE', 'SOCIAL', 'LANGUAGE']),
  achievedAt: z.string().optional(),
  notes: z.string().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

// Age ranges for filtering suggestions
const AGE_RANGES = [
  { label: '0-3m', min: 0, max: 3 },
  { label: '3-6m', min: 3, max: 6 },
  { label: '6-9m', min: 6, max: 9 },
  { label: '9-12m', min: 9, max: 12 },
  { label: '12-18m', min: 12, max: 18 },
  { label: '18-24m', min: 18, max: 24 },
  { label: '24-36m', min: 24, max: 36 },
];

export function MilestonesPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<MilestoneCategory | 'ALL'>('ALL');
  const [selectedAgeRange, setSelectedAgeRange] = useState<typeof AGE_RANGES[0] | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      category: 'MOTOR',
      achievedAt: new Date().toISOString().split('T')[0],
    },
  });

  const selectedFormCategory = watch('category');

  useEffect(() => {
    if (selectedBaby) {
      loadMilestones();
    }
  }, [selectedBaby]);

  // Auto-select age range based on baby's age
  useEffect(() => {
    if (selectedBaby) {
      const ageMonths = calculateAgeMonths(new Date(selectedBaby.birthDate));
      const range = AGE_RANGES.find(r => ageMonths >= r.min && ageMonths <= r.max) || AGE_RANGES[0];
      setSelectedAgeRange(range);
    }
  }, [selectedBaby]);

  const loadMilestones = async () => {
    if (!selectedBaby) return;
    setIsLoading(true);
    try {
      const response = await milestoneService.getAll(selectedBaby.id);
      if (response.success) {
        setMilestones(response.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao carregar marcos');
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (suggestion?: typeof suggestedMilestones[0]) => {
    if (suggestion) {
      reset({
        title: suggestion.title,
        category: suggestion.category,
        achievedAt: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } else {
      reset({
        title: '',
        category: 'MOTOR',
        achievedAt: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeForm = () => {
    setShowForm(false);
    reset();
  };

  const onSubmit = async (data: MilestoneFormData) => {
    if (!selectedBaby) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        category: data.category,
        achievedAt: data.achievedAt ? new Date(data.achievedAt).toISOString() : undefined,
        notes: data.notes || undefined,
      };
      const response = await milestoneService.create(selectedBaby.id, payload);
      if (response.success) {
        success('Marco registrado!', `"${data.title}" foi salvo com sucesso`);
        closeForm();
        loadMilestones();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao salvar marco');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (suggestion: typeof suggestedMilestones[0]) => {
    if (!selectedBaby) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: suggestion.title,
        category: suggestion.category,
        achievedAt: new Date().toISOString(),
        notes: suggestion.description || undefined,
      };
      const response = await milestoneService.create(selectedBaby.id, payload);
      if (response.success) {
        success('Marco registrado!', `"${suggestion.title}" alcancado`);
        loadMilestones();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao salvar marco');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedBaby || !confirm('Deseja realmente excluir este marco?')) return;
    try {
      await milestoneService.delete(selectedBaby.id, id);
      success('Excluido', 'Marco removido com sucesso');
      loadMilestones();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao excluir');
    }
  };

  const getCategoryInfo = (category: MilestoneCategory) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const filteredMilestones = filterCategory === 'ALL'
    ? milestones
    : milestones.filter(m => m.category === filterCategory);

  const babyAgeMonths = selectedBaby
    ? calculateAgeMonths(new Date(selectedBaby.birthDate))
    : 0;

  const achievedTitles = new Set(milestones.map(m => m.title.toLowerCase()));

  // Suggestions filtered by selected age range
  const filteredSuggestions = selectedAgeRange
    ? suggestedMilestones.filter(s => s.ageMonths >= selectedAgeRange.min && s.ageMonths <= selectedAgeRange.max)
    : suggestedMilestones.filter(s => Math.abs(s.ageMonths - babyAgeMonths) <= 3);

  // Progress calculation
  const totalSuggested = selectedAgeRange
    ? suggestedMilestones.filter(s => s.ageMonths >= selectedAgeRange.min && s.ageMonths <= selectedAgeRange.max).length
    : 0;
  const achievedInRange = selectedAgeRange
    ? filteredSuggestions.filter(s => achievedTitles.has(s.title.toLowerCase())).length
    : 0;
  const progressPercent = totalSuggested > 0 ? Math.round((achievedInRange / totalSuggested) * 100) : 0;

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebe primeiro</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-500" />
            Marcos do Desenvolvimento
          </h1>
          <p className="text-gray-500">
            {selectedBaby.name} - {babyAgeMonths} {babyAgeMonths === 1 ? 'mes' : 'meses'}
          </p>
        </div>
        <Button
          onClick={() => showForm ? closeForm() : openForm()}
          leftIcon={showForm ? <ChevronUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Fechar' : 'Novo Marco'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {categories.map((cat) => {
              const count = milestones.filter(m => m.category === cat.value && m.achievedAt).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(filterCategory === cat.value ? 'ALL' : cat.value)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    filterCategory === cat.value
                      ? 'ring-2 ring-olive-500 border-olive-300 bg-olive-50/50'
                      : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', cat.color)}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-gray-900 leading-none">{count}</p>
                    <p className="text-xs text-gray-500">{cat.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inline Form */}
          <div ref={formRef}>
            {showForm && (
              <Card className="border-olive-200 bg-olive-50/30 mb-6 animate-in slide-in-from-top duration-200">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-olive-600" />
                      Registrar Novo Marco
                    </h3>
                    <button onClick={closeForm} className="p-1.5 rounded-full hover:bg-gray-200 transition">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Category Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                      <div className="grid grid-cols-4 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setValue('category', cat.value)}
                            className={cn(
                              'p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                              selectedFormCategory === cat.value
                                ? 'border-olive-500 bg-olive-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', cat.color)}>
                              <cat.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Titulo do marco"
                        placeholder="Ex: Primeiros passos"
                        error={errors.title?.message}
                        {...register('title')}
                      />
                      <Input
                        label="Data alcancada (opcional)"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        {...register('achievedAt')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 resize-none text-sm"
                        placeholder="Detalhes sobre este marco..."
                        rows={2}
                        {...register('notes')}
                      />
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <Button type="button" variant="secondary" onClick={closeForm}>Cancelar</Button>
                      <Button type="submit" isLoading={isSubmitting}>Salvar Marco</Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Suggestions by Age Range */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-olive-600" />
                  <h3 className="font-semibold text-gray-900">Marcos esperados</h3>
                  {selectedAgeRange && (
                    <span className="text-sm text-gray-500">
                      ({achievedInRange}/{totalSuggested} alcancados)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {AGE_RANGES.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedAgeRange(range)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                        selectedAgeRange?.label === range.label
                          ? 'bg-olive-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              {totalSuggested > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso {selectedAgeRange?.label}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-olive-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Suggestions grid by category */}
              {filteredSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {categories.map(cat => {
                    const catSuggestions = filteredSuggestions.filter(s => s.category === cat.value);
                    if (catSuggestions.length === 0) return null;

                    return (
                      <div key={cat.value}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <cat.icon className={cn('w-3.5 h-3.5', cat.color.split(' ')[1])} />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{cat.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {catSuggestions.map((suggestion, index) => {
                            const isAchieved = achievedTitles.has(suggestion.title.toLowerCase());
                            return (
                              <div
                                key={index}
                                className={cn(
                                  'group relative flex items-center gap-1.5 rounded-lg text-sm transition-all',
                                  isAchieved
                                    ? 'bg-green-50 border border-green-200 px-3 py-1.5'
                                    : 'bg-white border border-gray-200 hover:border-olive-300 hover:shadow-sm'
                                )}
                              >
                                {isAchieved ? (
                                  <div className="flex items-center gap-1.5 px-0 py-0">
                                    <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                    <span className="text-green-700 text-sm">{suggestion.title}</span>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleQuickAdd(suggestion)}
                                      disabled={isSubmitting}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:text-olive-700"
                                      title={suggestion.description || suggestion.title}
                                    >
                                      <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <span>{suggestion.title}</span>
                                    </button>
                                    <button
                                      onClick={() => openForm(suggestion)}
                                      className="px-2 py-1.5 text-gray-400 hover:text-olive-600 border-l border-gray-200 transition"
                                      title="Personalizar e registrar"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">Nenhuma sugestao para este periodo</p>
              )}
            </CardBody>
          </Card>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                filterCategory === 'ALL'
                  ? 'bg-olive-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Todos ({milestones.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  filterCategory === cat.value
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label} ({milestones.filter(m => m.category === cat.value).length})
              </button>
            ))}
          </div>

          {/* Milestones List */}
          <Card>
            <CardHeader
              title="Marcos Alcancados"
              subtitle={`${filteredMilestones.length} marco(s) registrado(s)`}
            />
            <CardBody className="p-0">
              {filteredMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum marco registrado</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Use as sugestoes acima ou clique em "Novo Marco"
                  </p>
                  <Button onClick={() => openForm()} leftIcon={<Plus className="w-4 h-4" />} size="sm">
                    Adicionar primeiro marco
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMilestones.map((milestone) => {
                    const catInfo = getCategoryInfo(milestone.category as MilestoneCategory);
                    return (
                      <div key={milestone.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', catInfo.color)}>
                            <catInfo.icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{milestone.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className={cn(
                                'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                                catInfo.color
                              )}>
                                {catInfo.label}
                              </span>
                              {milestone.achievedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDateBR(new Date(milestone.achievedAt))}
                                </span>
                              )}
                            </div>
                            {milestone.notes && (
                              <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xs">{milestone.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(milestone.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
