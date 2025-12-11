// Olive Baby Web - Team Management Page
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Stethoscope,
  RefreshCw,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Baby,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { professionalService } from '../../services/api';
import { cn } from '../../lib/utils';

// Types
interface Professional {
  id: number;
  fullName: string;
  email: string;
  specialty: string;
  crmNumber?: string;
  crmState?: string;
  phone?: string;
  city?: string;
  state?: string;
  status: 'PENDING' | 'INVITED' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

interface BabyProfessional {
  id: number;
  role: 'PEDIATRICIAN' | 'OBGYN' | 'LACTATION_CONSULTANT' | 'OTHER';
  notes?: string;
  createdAt: string;
  professional: Professional;
}

type ProfessionalRole = 'PEDIATRICIAN' | 'OBGYN' | 'LACTATION_CONSULTANT' | 'OTHER';

const roleLabels: Record<ProfessionalRole, string> = {
  PEDIATRICIAN: 'Pediatra',
  OBGYN: 'Obstetra/Ginecologista',
  LACTATION_CONSULTANT: 'Consultora de Amamentação',
  OTHER: 'Outro Especialista',
};

const roleIcons: Record<ProfessionalRole, string> = {
  PEDIATRICIAN: '👶',
  OBGYN: '🤰',
  LACTATION_CONSULTANT: '🍼',
  OTHER: '🏥',
};

const statusConfig = {
  PENDING: { label: 'Pendente', color: 'bg-gray-100 text-gray-600', icon: Clock },
  INVITED: { label: 'Convite Enviado', color: 'bg-yellow-100 text-yellow-700', icon: Send },
  ACTIVE: { label: 'Ativo', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  BLOCKED: { label: 'Bloqueado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// Validation schema
const inviteSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  specialty: z.string().min(2, 'Especialidade é obrigatória'),
  role: z.enum(['PEDIATRICIAN', 'OBGYN', 'LACTATION_CONSULTANT', 'OTHER']),
  crmNumber: z.string().optional(),
  crmState: z.string().max(2).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function TeamPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [professionals, setProfessionals] = useState<BabyProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<BabyProfessional | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'PEDIATRICIAN',
    },
  });

  const selectedRole = watch('role');

  // Load professionals
  useEffect(() => {
    if (selectedBaby) {
      loadProfessionals();
    }
  }, [selectedBaby]);

  const loadProfessionals = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const response = await professionalService.getByBaby(selectedBaby.id);
      setProfessionals(response.data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
      showError('Erro', 'Não foi possível carregar os profissionais');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitInvite = async (data: InviteFormData) => {
    if (!selectedBaby) return;

    setIsSubmitting(true);
    try {
      await professionalService.invite(selectedBaby.id, data);
      success('Convite enviado!', `Um email foi enviado para ${data.email}`);
      setShowInviteModal(false);
      reset();
      loadProfessionals();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível enviar o convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (bp: BabyProfessional) => {
    if (!selectedBaby) return;

    try {
      await professionalService.resendInvite(selectedBaby.id, bp.professional.id);
      success('Convite reenviado!', `Um novo email foi enviado para ${bp.professional.email}`);
      loadProfessionals();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível reenviar o convite');
    }
  };

  const handleRemove = async () => {
    if (!selectedBaby || !selectedProfessional) return;

    setIsSubmitting(true);
    try {
      await professionalService.remove(selectedBaby.id, selectedProfessional.id);
      success('Profissional removido', 'O profissional foi desvinculado do bebê');
      setShowDeleteModal(false);
      setSelectedProfessional(null);
      loadProfessionals();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível remover o profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mb-4">
            <Baby className="w-8 h-8 text-olive-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecione um bebê</h2>
          <p className="text-gray-500">Selecione um bebê no menu para gerenciar a equipe de profissionais</p>
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
            <Users className="w-7 h-7 text-olive-600" />
            Equipe de {selectedBaby.name}
          </h1>
          <p className="text-gray-500">Profissionais de saúde vinculados ao bebê</p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          leftIcon={<UserPlus className="w-5 h-5" />}
        >
          Convidar Profissional
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-olive-600 animate-spin" />
          </div>
        ) : professionals.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-olive-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum profissional vinculado
              </h3>
              <p className="text-gray-500 mb-4">
                Convide pediatras, consultoras e outros profissionais para acompanhar {selectedBaby.name}
              </p>
              <Button
                onClick={() => setShowInviteModal(true)}
                leftIcon={<UserPlus className="w-5 h-5" />}
              >
                Convidar Profissional
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {professionals.map((bp) => {
              const status = statusConfig[bp.professional.status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={bp.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-olive-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {roleIcons[bp.role]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {bp.professional.fullName}
                        </h3>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', status.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-olive-600 font-medium mb-2">
                        {roleLabels[bp.role]} • {bp.professional.specialty}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {bp.professional.email}
                        </span>
                        {bp.professional.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {bp.professional.phone}
                          </span>
                        )}
                        {bp.professional.crmNumber && (
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-4 h-4" />
                            CRM {bp.professional.crmNumber}/{bp.professional.crmState}
                          </span>
                        )}
                      </div>
                      
                      {bp.notes && (
                        <p className="mt-2 text-sm text-gray-400 italic">"{bp.notes}"</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {bp.professional.status === 'INVITED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(bp)}
                          title="Reenviar convite"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProfessional(bp);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Remover profissional"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardBody className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Como funciona o convite?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Ao convidar um profissional, ele receberá um email com um link para criar sua conta.
                Após ativar a conta, ele poderá visualizar as informações de {selectedBaby.name}: 
                estatísticas, gráficos de crescimento, marcos do desenvolvimento e histórico de rotinas.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          reset();
        }}
        title="Convidar Profissional"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitInvite)} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="Dr. João Silva"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="joao.silva@clinica.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(roleLabels) as [ProfessionalRole, string][]).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all',
                    selectedRole === value
                      ? 'border-olive-500 bg-olive-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register('role')}
                  />
                  <span className="text-xl">{roleIcons[value]}</span>
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Especialidade"
            placeholder="Pediatria, Neonatologia, etc."
            error={errors.specialty?.message}
            {...register('specialty')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CRM (opcional)"
              placeholder="123456"
              {...register('crmNumber')}
            />
            <Input
              label="UF do CRM"
              placeholder="SP"
              maxLength={2}
              {...register('crmState')}
            />
          </div>

          <Input
            label="Telefone (opcional)"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Ex: Pediatra de acompanhamento desde o nascimento"
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowInviteModal(false);
                reset();
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProfessional(null);
        }}
        title="Remover Profissional"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja desvincular{' '}
            <strong>{selectedProfessional?.professional.fullName}</strong> de {selectedBaby?.name}?
          </p>
          <p className="text-sm text-gray-500">
            O profissional perderá acesso às informações do bebê, mas poderá ser convidado novamente.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProfessional(null);
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRemove}
              isLoading={isSubmitting}
              fullWidth
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
