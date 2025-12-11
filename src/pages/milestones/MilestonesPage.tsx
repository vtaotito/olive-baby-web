// Olive Baby Web - Milestones Page
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Star,
  Plus,
  Calendar,
  Check,
  Trophy,
  Sparkles,
  Baby,
  MessageCircle,
  Footprints,
  Brain,
  Heart,
  Hand,
  Trash2,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { milestoneService } from '../../services/api';
import { formatDateBR, calculateAgeMonths } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Milestone } from '../../types';

type MilestoneCategory = 'MOTOR' | 'COGNITIVE' | 'SOCIAL' | 'LANGUAGE';

const categories: { value: MilestoneCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'MOTOR', label: 'Motor', icon: Footprints, color: 'bg-blue-100 text-blue-600' },
  { value: 'COGNITIVE', label: 'Cognitivo', icon: Brain, color: 'bg-purple-100 text-purple-600' },
  { value: 'SOCIAL', label: 'Social', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { value: 'LANGUAGE', label: 'Linguagem', icon: MessageCircle, color: 'bg-green-100 text-green-600' },
];

const suggestedMilestones: { category: MilestoneCategory; ageMonths: number; title: string }[] = [
  // Motor
  { category: 'MOTOR', ageMonths: 2, title: 'Levanta a cabeça quando de bruços' },
  { category: 'MOTOR', ageMonths: 4, title: 'Rola de barriga para cima' },
  { category: 'MOTOR', ageMonths: 6, title: 'Senta sem apoio' },
  { category: 'MOTOR', ageMonths: 8, title: 'Engatinha' },
  { category: 'MOTOR', ageMonths: 10, title: 'Fica em pé com apoio' },
  { category: 'MOTOR', ageMonths: 12, title: 'Primeiros passos' },
  // Cognitive
  { category: 'COGNITIVE', ageMonths: 2, title: 'Acompanha objetos com os olhos' },
  { category: 'COGNITIVE', ageMonths: 4, title: 'Reconhece rostos familiares' },
  { category: 'COGNITIVE', ageMonths: 6, title: 'Procura objeto escondido' },
  { category: 'COGNITIVE', ageMonths: 9, title: 'Entende "não"' },
  { category: 'COGNITIVE', ageMonths: 12, title: 'Brinca de esconde-esconde' },
  // Social
  { category: 'SOCIAL', ageMonths: 2, title: 'Primeiro sorriso social' },
  { category: 'SOCIAL', ageMonths: 4, title: 'Ri alto' },
  { category: 'SOCIAL', ageMonths: 6, title: 'Reconhece estranhos' },
  { category: 'SOCIAL', ageMonths: 9, title: 'Dá tchau' },
  { category: 'SOCIAL', ageMonths: 12, title: 'Mostra afeto' },
  // Language
  { category: 'LANGUAGE', ageMonths: 2, title: 'Balbucia sons' },
  { category: 'LANGUAGE', ageMonths: 6, title: 'Responde ao próprio nome' },
  { category: 'LANGUAGE', ageMonths: 9, title: 'Fala "mama" ou "papa"' },
  { category: 'LANGUAGE', ageMonths: 12, title: 'Fala 2-3 palavras' },
];

const milestoneSchema = z.object({
  title: z.string().min(2, 'Título é obrigatório'),
  category: z.enum(['MOTOR', 'COGNITIVE', 'SOCIAL', 'LANGUAGE']),
  achievedAt: z.string().optional(),
  notes: z.string().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

export function MilestonesPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<MilestoneCategory | 'ALL'>('ALL');
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const selectedCategory = watch('category');

  useEffect(() => {
    if (selectedBaby) {
      loadMilestones();
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
        setIsModalOpen(false);
        reset();
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
      success('Excluído', 'Marco removido com sucesso');
      loadMilestones();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao excluir');
    }
  };

  const handleSelectSuggestion = (suggestion: typeof suggestedMilestones[0]) => {
    setValue('title', suggestion.title);
    setValue('category', suggestion.category);
    setShowSuggestions(false);
  };

  const getCategoryInfo = (category: MilestoneCategory) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  // Filter milestones
  const filteredMilestones = filterCategory === 'ALL' 
    ? milestones 
    : milestones.filter(m => m.category === filterCategory);

  // Get baby age for suggestions
  const babyAgeMonths = selectedBaby 
    ? calculateAgeMonths(new Date(selectedBaby.birthDate)) 
    : 0;

  // Filter suggestions by age (show milestones for baby's age +/- 2 months)
  const relevantSuggestions = suggestedMilestones.filter(
    s => Math.abs(s.ageMonths - babyAgeMonths) <= 3
  );

  // Check which suggestions are already achieved
  const achievedTitles = milestones.map(m => m.title.toLowerCase());

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebê primeiro</p>
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
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
          Novo Marco
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {categories.map((cat) => {
              const count = milestones.filter(m => m.category === cat.value && m.achievedAt).length;
              return (
                <Card key={cat.value}>
                  <CardBody className="text-center py-4">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2', cat.color)}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">{cat.label}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2',
                  filterCategory === cat.value
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Suggestions for baby's age */}
          {relevantSuggestions.length > 0 && (
            <Card className="mb-6 border-dashed border-2 border-olive-200 bg-olive-50/50">
              <CardBody>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-olive-600" />
                  <h3 className="font-semibold text-gray-900">Sugestões para {babyAgeMonths} meses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relevantSuggestions.map((suggestion, index) => {
                    const isAchieved = achievedTitles.includes(suggestion.title.toLowerCase());
                    const catInfo = getCategoryInfo(suggestion.category);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isAchieved) {
                            handleSelectSuggestion(suggestion);
                            setIsModalOpen(true);
                          }
                        }}
                        disabled={isAchieved}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all',
                          isAchieved
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-white border border-gray-200 hover:border-olive-300 hover:shadow-sm cursor-pointer'
                        )}
                      >
                        {isAchieved ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <catInfo.icon className="w-4 h-4" />
                        )}
                        {suggestion.title}
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Milestones List */}
          <Card>
            <CardHeader title="Marcos Alcançados" />
            <CardBody className="p-0">
              {filteredMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum marco registrado</p>
                  <p className="text-sm text-gray-400">Clique em "Novo Marco" para adicionar</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMilestones.map((milestone) => {
                    const catInfo = getCategoryInfo(milestone.category as MilestoneCategory);
                    return (
                      <div key={milestone.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', catInfo.color)}>
                            <catInfo.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{milestone.title}</p>
                            <div className="flex gap-3 text-sm text-gray-500">
                              <span>{catInfo.label}</span>
                              {milestone.achievedAt && (
                                <span>• {formatDateBR(new Date(milestone.achievedAt))}</span>
                              )}
                            </div>
                            {milestone.notes && (
                              <p className="text-sm text-gray-400 mt-1">{milestone.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(milestone.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Add Milestone Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Marco">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setValue('category', cat.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                    selectedCategory === cat.value
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

          <Input
            label="Título do marco"
            placeholder="Ex: Primeiros passos"
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            label="Data alcançada (opcional)"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('achievedAt')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Detalhes sobre este marco..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
