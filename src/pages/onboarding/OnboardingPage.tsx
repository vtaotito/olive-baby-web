// Olive Baby Web - Onboarding Page (Wizard para cadastrar primeiro bebê)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Baby,
  Calendar,
  MapPin,
  Scale,
  Ruler,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Card, CardBody } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import type { Relationship } from '../../types';

const steps = [
  { id: 1, title: 'Bem-vindo', icon: Sparkles },
  { id: 2, title: 'Nome do Bebê', icon: Baby },
  { id: 3, title: 'Data de Nascimento', icon: Calendar },
  { id: 4, title: 'Sua Relação', icon: Heart },
  { id: 5, title: 'Local', icon: MapPin },
  { id: 6, title: 'Medidas ao Nascer', icon: Scale },
];

const relationships: { value: Relationship; label: string; emoji: string }[] = [
  { value: 'MOTHER', label: 'Mãe', emoji: '👩' },
  { value: 'FATHER', label: 'Pai', emoji: '👨' },
  { value: 'GRANDMOTHER', label: 'Avó', emoji: '👵' },
  { value: 'GRANDFATHER', label: 'Avô', emoji: '👴' },
  { value: 'NANNY', label: 'Babá', emoji: '👩‍🍼' },
  { value: 'OTHER', label: 'Outro', emoji: '👤' },
];

const babySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  relationship: z.enum(['MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'NANNY', 'OTHER']),
  city: z.string().optional(),
  state: z.string().optional(),
  birthWeightGrams: z.number().min(500).max(7000).optional().or(z.literal('')),
  birthLengthCm: z.number().min(20).max(70).optional().or(z.literal('')),
});

type BabyFormData = z.infer<typeof babySchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BabyFormData>({
    resolver: zodResolver(babySchema),
    defaultValues: {
      relationship: 'MOTHER',
    },
  });

  const selectedRelationship = watch('relationship');
  const babyName = watch('name');

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: BabyFormData) => {
    setIsLoading(true);
    try {
      await addBaby({
        name: data.name,
        birthDate: new Date(data.birthDate).toISOString(),
        relationship: data.relationship,
        city: data.city || undefined,
        state: data.state || undefined,
        birthWeightGrams: data.birthWeightGrams ? Number(data.birthWeightGrams) : undefined,
        birthLengthCm: data.birthLengthCm ? Number(data.birthLengthCm) : undefined,
      });
      success('Bebê cadastrado!', `${data.name} foi adicionado com sucesso`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro ao cadastrar bebê', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Baby className="w-12 h-12 text-olive-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Olá, {user?.caregiver?.fullName?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vamos configurar o Olive Baby para acompanhar o desenvolvimento do seu bebê.
              Este processo leva menos de 2 minutos.
            </p>
            <Button onClick={nextStep} rightIcon={<ChevronRight className="w-5 h-5" />}>
              Começar
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Como se chama o bebê?</h2>
              <p className="text-gray-500 text-sm mt-1">Este será o nome exibido no app</p>
            </div>
            <Input
              label="Nome do bebê"
              placeholder="Ex: Maria Oliveira"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-baby-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Quando {babyName || 'o bebê'} nasceu?
              </h2>
              <p className="text-gray-500 text-sm mt-1">Usaremos para calcular a idade</p>
            </div>
            <Input
              label="Data de nascimento"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-baby-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Qual é sua relação com {babyName || 'o bebê'}?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {relationships.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => setValue('relationship', rel.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    selectedRelationship === rel.value
                      ? 'border-olive-500 bg-olive-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl mb-1 block">{rel.emoji}</span>
                  <span className="font-medium text-gray-900">{rel.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-baby-green rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Onde {babyName || 'o bebê'} mora?
              </h2>
              <p className="text-gray-500 text-sm mt-1">Opcional - ajuda nas recomendações</p>
            </div>
            <Input
              label="Cidade"
              placeholder="Ex: São Paulo"
              {...register('city')}
            />
            <Input
              label="Estado"
              placeholder="Ex: SP"
              {...register('state')}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-baby-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Medidas ao nascer
              </h2>
              <p className="text-gray-500 text-sm mt-1">Opcional - usado para acompanhar crescimento</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Peso (gramas)"
                type="number"
                placeholder="Ex: 3200"
                leftIcon={<Scale className="w-5 h-5" />}
                {...register('birthWeightGrams', { valueAsNumber: true })}
              />
              <Input
                label="Comprimento (cm)"
                type="number"
                step="0.1"
                placeholder="Ex: 49.5"
                leftIcon={<Ruler className="w-5 h-5" />}
                {...register('birthLengthCm', { valueAsNumber: true })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-baby-green flex flex-col">
      {/* Progress Bar */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    currentStep > step.id
                      ? 'bg-olive-600 text-white'
                      : currentStep === step.id
                      ? 'bg-olive-100 text-olive-600 border-2 border-olive-600'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-8 h-1 mx-1',
                      currentStep > step.id ? 'bg-olive-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            Passo {currentStep} de {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardBody className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}

              {/* Navigation */}
              {currentStep > 1 && (
                <div className="flex gap-3 mt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={prevStep}
                      leftIcon={<ChevronLeft className="w-5 h-5" />}
                    >
                      Voltar
                    </Button>
                  )}
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      fullWidth
                      rightIcon={<ChevronRight className="w-5 h-5" />}
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isLoading}
                      leftIcon={<Check className="w-5 h-5" />}
                    >
                      Finalizar
                    </Button>
                  )}
                </div>
              )}
            </form>
          </CardBody>
        </Card>
      </main>

      {/* Skip */}
      {currentStep > 1 && currentStep < steps.length && (
        <div className="p-4 text-center">
          <button
            type="button"
            onClick={nextStep}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Pular esta etapa
          </button>
        </div>
      )}
    </div>
  );
}
