// Olive Baby Web - Share Baby Page (Compartilhar Bebê)
// Painel unificado para gerenciar convites de Família/Cuidadores e Profissionais
// Formulários inline (sem modais)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Baby,
  Crown,
  Stethoscope,
  Copy,
  AlertTriangle,
  ChevronUp,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { babyMemberService, babyInviteService, professionalService } from '../../services/api';
import { cn, formatDateBR } from '../../lib/utils';

// ====== Types ======
interface BabyMember {
  id: number;
  userId: number;
  memberType: 'PARENT' | 'FAMILY' | 'PROFESSIONAL';
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
  permissions?: Record<string, any>;
  createdAt: string;
  revokedAt?: string;
  user: { id: number; email: string; role: string; createdAt: string };
}

interface BabyInvite {
  id: number;
  emailInvited: string;
  memberType: 'PARENT' | 'FAMILY' | 'PROFESSIONAL';
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedName?: string;
  message?: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

interface Professional {
  id: number;
  role: string;
  notes?: string;
  createdAt: string;
  professional: {
    id: number;
    fullName: string;
    email: string;
    specialty: string;
    crmNumber?: string;
    crmState?: string;
    phone?: string;
    status: 'PENDING' | 'INVITED' | 'ACTIVE' | 'BLOCKED';
    createdAt: string;
  };
}

// ====== Constants ======
const roleLabels: Record<string, string> = {
  OWNER_PARENT_1: 'Responsável Principal 1',
  OWNER_PARENT_2: 'Responsável Principal 2',
  FAMILY_VIEWER: 'Familiar (Visualização)',
  FAMILY_EDITOR: 'Familiar (Edição)',
  PEDIATRICIAN: 'Pediatra',
  OBGYN: 'Obstetra/Ginecologista',
  LACTATION_CONSULTANT: 'Consultora de Amamentação',
  OTHER: 'Outro',
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  ACTIVE: { label: 'Ativo', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  INVITED: { label: 'Convidado', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send },
  REVOKED: { label: 'Revogado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  ACCEPTED: { label: 'Aceito', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertTriangle },
  BLOCKED: { label: 'Bloqueado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

// ====== Validation Schemas ======
const familyInviteSchema = z.object({
  emailInvited: z.string().email('Email inválido'),
  invitedName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  memberType: z.enum(['PARENT', 'FAMILY']),
  role: z.string().min(1, 'Selecione uma função'),
  message: z.string().optional(),
});

const professionalInviteSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  specialty: z.string().min(2, 'Especialidade é obrigatória'),
  role: z.enum(['PEDIATRICIAN', 'OBGYN', 'LACTATION_CONSULTANT', 'OTHER']),
  crmNumber: z.string().optional(),
  crmState: z.string().max(2).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FamilyInviteFormData = z.infer<typeof familyInviteSchema>;
type ProfessionalInviteFormData = z.infer<typeof professionalInviteSchema>;

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 border', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ====== Main Component ======
export function ShareBabyPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const { babies, selectedBaby } = useBabyStore();
  const { success, error: showError, info } = useToast();

  const currentBaby = babyId
    ? babies.find(b => b.id === parseInt(babyId)) || selectedBaby
    : selectedBaby;

  // State
  const [activeTab, setActiveTab] = useState<'family' | 'professional'>('family');
  const [members, setMembers] = useState<BabyMember[]>([]);
  const [invites, setInvites] = useState<BabyInvite[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline forms
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showProfForm, setShowProfForm] = useState(false);

  // Confirm actions
  const [confirmRevoke, setConfirmRevoke] = useState<{ type: 'member' | 'invite' | 'prof'; id: number; name: string } | null>(null);

  // Forms
  const familyForm = useForm<FamilyInviteFormData>({
    resolver: zodResolver(familyInviteSchema),
    defaultValues: { memberType: 'FAMILY', role: 'FAMILY_VIEWER' },
  });

  const profForm = useForm<ProfessionalInviteFormData>({
    resolver: zodResolver(professionalInviteSchema),
    defaultValues: { role: 'PEDIATRICIAN' },
  });

  const watchMemberType = familyForm.watch('memberType');

  // Effects
  useEffect(() => {
    if (currentBaby) loadData();
  }, [currentBaby?.id]);

  useEffect(() => {
    familyForm.setValue('role', watchMemberType === 'PARENT' ? 'OWNER_PARENT_2' : 'FAMILY_VIEWER');
  }, [watchMemberType]);

  // Data loading
  const loadData = async () => {
    if (!currentBaby) return;
    setIsLoading(true);
    try {
      const [membersRes, invitesRes, professionalsRes] = await Promise.all([
        babyMemberService.listMembers(currentBaby.id),
        babyInviteService.listInvites(currentBaby.id),
        professionalService.getByBaby(currentBaby.id),
      ]);
      setMembers(membersRes.data || []);
      setInvites(invitesRes.data || []);
      setProfessionals(professionalsRes.data || []);
    } catch {
      showError('Erro ao carregar dados', 'Tente novamente em alguns segundos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers - Family
  const onSubmitFamilyInvite = async (data: FamilyInviteFormData) => {
    if (!currentBaby) {
      showError('Erro', 'Nenhum bebê selecionado');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await babyInviteService.createInvite(currentBaby.id, data);
      const emailSent = response.data?.emailSent !== false;
      if (emailSent) {
        success('Convite enviado!', `Email de convite enviado para ${data.emailInvited}`);
      } else {
        info('Convite criado!', 'O email não pôde ser enviado, mas o link de convite foi copiado.');
      }
      setShowFamilyForm(false);
      familyForm.reset({ memberType: 'FAMILY', role: 'FAMILY_VIEWER' });
      loadData();
      if (response.data?.token) {
        handleCopyInviteLink(response.data.token);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erro desconhecido. Tente novamente.';
      showError('Erro ao enviar convite', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendFamilyInvite = async (invite: BabyInvite) => {
    if (!currentBaby) return;
    try {
      await babyInviteService.resendInvite(currentBaby.id, invite.id);
      success('Convite reenviado!', `Novo email enviado para ${invite.emailInvited}`);
      loadData();
    } catch (err: any) {
      showError('Erro ao reenviar', err.response?.data?.message || 'Tente novamente');
    }
  };

  // Handlers - Professional
  const onSubmitProfInvite = async (data: ProfessionalInviteFormData) => {
    if (!currentBaby) return;
    setIsSubmitting(true);
    try {
      await professionalService.invite(currentBaby.id, data);
      success('Convite enviado!', `Email enviado para ${data.email}`);
      setShowProfForm(false);
      profForm.reset({ role: 'PEDIATRICIAN' });
      loadData();
    } catch (err: any) {
      showError('Erro ao enviar convite', err.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendProfInvite = async (prof: Professional) => {
    if (!currentBaby) return;
    try {
      await professionalService.resendInvite(currentBaby.id, prof.professional.id);
      success('Convite reenviado!', `Novo email enviado para ${prof.professional.email}`);
      loadData();
    } catch (err: any) {
      showError('Erro ao reenviar', err.response?.data?.message || 'Tente novamente');
    }
  };

  // Handlers - Revoke/Remove
  const executeRevoke = async () => {
    if (!currentBaby || !confirmRevoke) return;
    setIsSubmitting(true);
    try {
      if (confirmRevoke.type === 'member') {
        await babyMemberService.revokeMember(currentBaby.id, confirmRevoke.id);
      } else if (confirmRevoke.type === 'invite') {
        await babyInviteService.revokeInvite(currentBaby.id, confirmRevoke.id);
      } else {
        await professionalService.remove(currentBaby.id, confirmRevoke.id);
      }
      success('Removido', 'Ação realizada com sucesso');
      setConfirmRevoke(null);
      loadData();
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility
  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      info('Link copiado!', 'Cole o link para compartilhar diretamente');
    } catch {
      info('Link de convite', inviteUrl);
    }
  };

  const isOwner = (role: string) => role === 'OWNER_PARENT_1' || role === 'OWNER_PARENT_2';

  // Derived Data
  const familyMembers = members.filter(m => m.memberType !== 'PROFESSIONAL');
  const familyInvites = invites.filter(i => i.memberType !== 'PROFESSIONAL');
  const pendingFamilyInvites = familyInvites.filter(i => i.status === 'PENDING');
  const activeProfessionals = professionals.filter(p => p.professional.status === 'ACTIVE');
  const pendingProfessionals = professionals.filter(p => p.professional.status !== 'ACTIVE');

  if (!currentBaby) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mb-4">
            <Baby className="w-8 h-8 text-olive-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Selecione um bebê</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Escolha um bebê para gerenciar compartilhamentos</p>
          <Button onClick={() => navigate('/settings/babies')}>Ver Bebês</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-olive-400 to-olive-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compartilhar {currentBaby.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie quem pode ver e cuidar do seu bebê</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('family')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
              activeTab === 'family' ? 'bg-white dark:bg-gray-700 text-olive-700 dark:text-olive-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <Users className="w-4 h-4" />
            Família / Cuidador
            {pendingFamilyInvites.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{pendingFamilyInvites.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
              activeTab === 'professional' ? 'bg-white dark:bg-gray-700 text-olive-700 dark:text-olive-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <Stethoscope className="w-4 h-4" />
            Profissional
            {pendingProfessionals.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{pendingProfessionals.length}</span>
            )}
          </button>
        </div>

        <Button
          onClick={() => activeTab === 'family' ? setShowFamilyForm(!showFamilyForm) : setShowProfForm(!showProfForm)}
          leftIcon={activeTab === 'family'
            ? (showFamilyForm ? <ChevronUp className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)
            : (showProfForm ? <ChevronUp className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />)
          }
          className="shrink-0"
        >
          {activeTab === 'family'
            ? (showFamilyForm ? 'Fechar' : 'Convidar Familiar')
            : (showProfForm ? 'Fechar' : 'Convidar Profissional')
          }
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-olive-600 animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* ====== TAB: FAMÍLIA ====== */}
          {activeTab === 'family' && (
            <>
              {/* Inline Family Form */}
              {showFamilyForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-olive-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Convidar familiar ou cuidador</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A pessoa receberá um email para aceitar o convite.</p>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={familyForm.handleSubmit(onSubmitFamilyInvite, (errors) => {
                      const errorMessages = Object.values(errors).map(e => e?.message).filter(Boolean);
                      if (errorMessages.length > 0) {
                        showError('Preencha os campos obrigatórios', errorMessages.join(', '));
                      }
                    })} className="space-y-4">
                      {Object.keys(familyForm.formState.errors).length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Corrija os erros abaixo para enviar o convite
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome *</label>
                          <input
                            {...familyForm.register('invitedName')}
                            type="text"
                            placeholder="Nome da pessoa"
                            className={cn(
                              'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                              familyForm.formState.errors.invitedName ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                            )}
                          />
                          {familyForm.formState.errors.invitedName && <p className="text-xs text-red-500 mt-1">{familyForm.formState.errors.invitedName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                          <input
                            {...familyForm.register('emailInvited')}
                            type="email"
                            placeholder="email@exemplo.com"
                            className={cn(
                              'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                              familyForm.formState.errors.emailInvited ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                            )}
                          />
                          {familyForm.formState.errors.emailInvited && <p className="text-xs text-red-500 mt-1">{familyForm.formState.errors.emailInvited.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tipo</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => familyForm.setValue('memberType', 'FAMILY')}
                              className={cn('flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm',
                                watchMemberType === 'FAMILY' ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300')}>
                              <Users className="w-4 h-4 text-olive-600" />
                              <span className="font-medium">Familiar</span>
                            </button>
                            <button type="button" onClick={() => familyForm.setValue('memberType', 'PARENT')}
                              className={cn('flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm',
                                watchMemberType === 'PARENT' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300')}>
                              <Crown className="w-4 h-4 text-amber-600" />
                              <span className="font-medium">Responsável</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Permissões</label>
                          <select
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                            {...familyForm.register('role')}
                          >
                            {watchMemberType === 'PARENT' ? (
                              <>
                                <option value="OWNER_PARENT_1">Responsável Principal 1</option>
                                <option value="OWNER_PARENT_2">Responsável Principal 2</option>
                              </>
                            ) : (
                              <>
                                <option value="FAMILY_VIEWER">Somente visualização</option>
                                <option value="FAMILY_EDITOR">Pode editar registros</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                          Mensagem (opcional)
                        </label>
                        <textarea
                          {...familyForm.register('message')}
                          rows={2}
                          placeholder="Ex: Convite para acompanhar nosso bebê!"
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                          {isSubmitting ? 'Enviando...' : 'Enviar convite'}
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => { setShowFamilyForm(false); familyForm.reset(); }}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
              )}

              {/* Active Members */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Membros Ativos ({familyMembers.filter(m => m.status === 'ACTIVE').length})
                  </h3>
                </CardHeader>
                <CardBody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {familyMembers.filter(m => m.status === 'ACTIVE').length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">Nenhum membro ativo além de você</p>
                  ) : (
                    familyMembers.filter(m => m.status === 'ACTIVE').map((member) => (
                      <div key={member.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          isOwner(member.role) ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-olive-100 dark:bg-olive-900/30')}>
                          {isOwner(member.role) ? <Crown className="w-6 h-6 text-amber-600" /> : <Users className="w-6 h-6 text-olive-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{member.user.email}</span>
                            <StatusBadge status={member.status} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabels[member.role] || member.role}</p>
                        </div>
                        {!isOwner(member.role) && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setConfirmRevoke({ type: 'member', id: member.id, name: member.user.email })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Pending Family Invites */}
              {pendingFamilyInvites.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      Convites Pendentes ({pendingFamilyInvites.length})
                    </h3>
                  </CardHeader>
                  <CardBody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {pendingFamilyInvites.map((invite) => {
                      const expiresDate = new Date(invite.expiresAt);
                      const isExpiringSoon = expiresDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;
                      return (
                        <div key={invite.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Send className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white truncate">{invite.invitedName || invite.emailInvited}</span>
                              <StatusBadge status={invite.status} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{invite.emailInvited}</p>
                            <p className={cn('text-xs mt-1', isExpiringSoon ? 'text-red-500' : 'text-gray-400')}>
                              {isExpiringSoon && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                              Expira em {formatDateBR(expiresDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleResendFamilyInvite(invite)} title="Reenviar">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => setConfirmRevoke({ type: 'invite', id: invite.id, name: invite.emailInvited })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {/* ====== TAB: PROFISSIONAL ====== */}
          {activeTab === 'professional' && (
            <>
              {/* Inline Professional Form */}
              {showProfForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-teal-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Convidar profissional de saúde</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">O profissional receberá um email para criar sua conta e acompanhar o bebê.</p>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={profForm.handleSubmit(onSubmitProfInvite)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome completo *</label>
                          <input
                            {...profForm.register('fullName')}
                            type="text"
                            placeholder="Dr. João Silva"
                            className={cn(
                              'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                              profForm.formState.errors.fullName ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                            )}
                          />
                          {profForm.formState.errors.fullName && <p className="text-xs text-red-500 mt-1">{profForm.formState.errors.fullName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                          <input
                            {...profForm.register('email')}
                            type="email"
                            placeholder="email@clinica.com"
                            className={cn(
                              'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                              profForm.formState.errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                            )}
                          />
                          {profForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{profForm.formState.errors.email.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Especialidade *</label>
                          <input
                            {...profForm.register('specialty')}
                            type="text"
                            placeholder="Pediatria, Neonatologia..."
                            className={cn(
                              'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                              profForm.formState.errors.specialty ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                            )}
                          />
                          {profForm.formState.errors.specialty && <p className="text-xs text-red-500 mt-1">{profForm.formState.errors.specialty.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Função *</label>
                          <select
                            {...profForm.register('role')}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                          >
                            <option value="PEDIATRICIAN">Pediatra</option>
                            <option value="OBGYN">Obstetra/Ginecologista</option>
                            <option value="LACTATION_CONSULTANT">Consultora de Amamentação</option>
                            <option value="OTHER">Outro</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CRM</label>
                          <input {...profForm.register('crmNumber')} type="text" placeholder="123456"
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">UF</label>
                          <input {...profForm.register('crmState')} type="text" placeholder="SP" maxLength={2}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telefone</label>
                          <input {...profForm.register('phone')} type="tel" placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Observações (opcional)</label>
                        <textarea {...profForm.register('notes')} rows={2} placeholder="Ex: Pediatra que acompanha desde o nascimento"
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-olive-500 focus:border-transparent" />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                          {isSubmitting ? 'Enviando...' : 'Enviar convite'}
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => { setShowProfForm(false); profForm.reset(); }}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
              )}

              {/* Active Professionals */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Profissionais Ativos ({activeProfessionals.length})
                  </h3>
                </CardHeader>
                <CardBody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {activeProfessionals.length === 0 ? (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Nenhum profissional vinculado</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Convide pediatras e especialistas</p>
                    </div>
                  ) : (
                    activeProfessionals.map((prof) => (
                      <div key={prof.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{prof.professional.fullName}</span>
                            <StatusBadge status={prof.professional.status} />
                          </div>
                          <p className="text-sm text-olive-600 dark:text-olive-400 font-medium">{roleLabels[prof.role] || prof.role} · {prof.professional.specialty}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{prof.professional.email}</p>
                          {prof.professional.crmNumber && <p className="text-xs text-gray-400 dark:text-gray-500">CRM: {prof.professional.crmNumber}/{prof.professional.crmState}</p>}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setConfirmRevoke({ type: 'prof', id: prof.id, name: prof.professional.fullName })}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Pending Professionals */}
              {pendingProfessionals.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Aguardando Ativação ({pendingProfessionals.length})
                    </h3>
                  </CardHeader>
                  <CardBody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {pendingProfessionals.map((prof) => (
                      <div key={prof.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Send className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{prof.professional.fullName}</span>
                            <StatusBadge status={prof.professional.status} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{prof.professional.email}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Convidado em {formatDateBR(new Date(prof.createdAt))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleResendProfInvite(prof)} title="Reenviar">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setConfirmRevoke({ type: 'prof', id: prof.id, name: prof.professional.fullName })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {/* Inline Revoke Confirmation */}
          {confirmRevoke && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardBody>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {confirmRevoke.type === 'prof' ? 'Remover' : 'Revogar'} <strong>{confirmRevoke.name}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {confirmRevoke.type === 'prof' ? 'O profissional perderá acesso às informações do bebê.' : confirmRevoke.type === 'invite' ? 'O link de convite será invalidado.' : 'A pessoa perderá acesso às informações do bebê.'}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Button variant="danger" size="sm" onClick={executeRevoke} disabled={isSubmitting}>
                        {isSubmitting ? '...' : 'Confirmar'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(null)}>Cancelar</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
