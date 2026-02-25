import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  UserPlus,
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
  Phone,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp,
  Heart,
  Inbox,
  ArrowRight,
  Check,
  X,
  UserCheck,
  Link2,
  Filter,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { babyMemberService, babyInviteService, professionalService, patientInviteService } from '../../services/api';
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

interface ReceivedInvite {
  id: number;
  inviteType: 'FAMILY' | 'PROFESSIONAL' | 'PATIENT_INVITE';
  babyId: number | null;
  babyName: string;
  babyBirthDate: string | null;
  memberType: string;
  role: string;
  invitedName: string;
  message: string | null;
  inviterEmail: string | null;
  inviterName: string;
  expiresAt: string;
  createdAt: string;
  specialty?: string;
  professionalCRM?: string | null;
  requiresBabySelection?: boolean;
  allBabies?: { id: number; name: string; role: string }[];
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
  OWNER_PARENT_1: 'Responsável Principal',
  OWNER_PARENT_2: 'Responsável Principal',
  FAMILY_VIEWER: 'Familiar (Visualização)',
  FAMILY_EDITOR: 'Familiar (Edição)',
  PEDIATRICIAN: 'Pediatra',
  OBGYN: 'Obstetra/Ginecologista',
  LACTATION_CONSULTANT: 'Consultora de Amamentação',
  OTHER: 'Outro',
};

const memberTypeLabels: Record<string, string> = {
  PARENT: 'Responsável',
  FAMILY: 'Familiar',
  PROFESSIONAL: 'Profissional',
};

const inviteTypeConfig: Record<string, { label: string; color: string; icon: typeof Users }> = {
  FAMILY: { label: 'Familiar', color: 'blue', icon: Heart },
  PROFESSIONAL: { label: 'Profissional', color: 'teal', icon: Stethoscope },
  PATIENT_INVITE: { label: 'Convite Médico', color: 'purple', icon: Stethoscope },
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

// ====== Sub Components ======

function EmptyState({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500">{description}</p>
    </div>
  );
}

function TimeRemaining({ expiresAt }: { expiresAt: string }) {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  if (diff <= 0) return <span className="text-red-500 text-xs font-medium">Expirado</span>;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 1) return <span className="text-gray-400 text-xs">Expira em {days} dias</span>;
  if (hours > 1) return <span className="text-amber-500 text-xs font-medium">Expira em {hours}h</span>;
  return <span className="text-red-500 text-xs font-medium">Expira em breve</span>;
}

function BabySelectorModal({
  babies,
  professionalName,
  specialty,
  onConfirm,
  onCancel,
  isLoading,
}: {
  babies: { id: number; name: string }[];
  professionalName: string;
  specialty?: string;
  onConfirm: (babyIds: number[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleBaby = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === babies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(babies.map(b => b.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-purple-500 to-teal-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Compartilhar com profissional</h3>
              <p className="text-white/80 text-sm">{professionalName}{specialty ? ` · ${specialty}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Selecione quais bebês deseja compartilhar com este profissional. Ele terá acesso às informações de rotina, crescimento e desenvolvimento.
          </p>

          {babies.length > 1 && (
            <button
              onClick={selectAll}
              className="text-sm text-olive-600 dark:text-olive-400 font-medium mb-3 hover:underline"
            >
              {selectedIds.length === babies.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {babies.map(baby => (
              <button
                key={baby.id}
                onClick={() => toggleBaby(baby.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  selectedIds.includes(baby.id)
                    ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                  selectedIds.includes(baby.id)
                    ? 'bg-olive-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                )}>
                  {selectedIds.includes(baby.id) ? <Check className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
                </div>
                <span className={cn(
                  'font-medium text-sm',
                  selectedIds.includes(baby.id)
                    ? 'text-olive-700 dark:text-olive-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}>
                  {baby.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(selectedIds)}
            disabled={selectedIds.length === 0 || isLoading}
            leftIcon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          >
            {isLoading ? 'Vinculando...' : `Compartilhar ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InviteTypeFilter({
  activeFilter,
  onChange,
  counts,
}: {
  activeFilter: string;
  onChange: (filter: string) => void;
  counts: { all: number; family: number; professional: number; doctor: number };
}) {
  const filters = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'FAMILY', label: 'Familiares', count: counts.family },
    { key: 'PROFESSIONAL', label: 'Profissionais', count: counts.professional },
    { key: 'PATIENT_INVITE', label: 'Médicos', count: counts.doctor },
  ].filter(f => f.count > 0 || f.key === 'all');

  if (counts.all <= 1) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
            activeFilter === f.key
              ? 'bg-olive-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
        </button>
      ))}
    </div>
  );
}

// ====== Main Component ======
export function ShareBabyPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const { babies, selectedBaby } = useBabyStore();
  const { user } = useAuthStore();
  const { success, error: showError, info, warning } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const currentBaby = babyId
    ? babies.find(b => b.id === parseInt(babyId)) || selectedBaby
    : selectedBaby;

  // State
  const [members, setMembers] = useState<BabyMember[]>([]);
  const [invites, setInvites] = useState<BabyInvite[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<ReceivedInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingInviteId, setProcessingInviteId] = useState<number | null>(null);

  // Filter
  const [inviteFilter, setInviteFilter] = useState('all');

  // Inline forms
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteFormType, setInviteFormType] = useState<'family' | 'professional'>('family');

  // Baby selector modal
  const [babySelectorData, setBabySelectorData] = useState<{
    inviteId: number;
    professionalName: string;
    specialty?: string;
  } | null>(null);

  // Confirm revoke
  const [confirmAction, setConfirmAction] = useState<{ type: 'member' | 'invite' | 'prof'; id: number; name: string } | null>(null);

  // Sent invites expanded
  const [showSentInvites, setShowSentInvites] = useState(true);

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
    loadData();
  }, [currentBaby?.id]);

  useEffect(() => {
    familyForm.setValue('role', watchMemberType === 'PARENT' ? 'OWNER_PARENT_2' : 'FAMILY_VIEWER');
  }, [watchMemberType]);

  // Data loading
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [receivedRes, ...babyResults] = await Promise.all([
        babyInviteService.getPendingInvites().catch(() => ({ data: [] })),
        ...(currentBaby ? [
          babyMemberService.listMembers(currentBaby.id),
          babyInviteService.listInvites(currentBaby.id),
          professionalService.getByBaby(currentBaby.id),
        ] : []),
      ]);

      setReceivedInvites(receivedRes.data || []);

      if (currentBaby && babyResults.length === 3) {
        setMembers(babyResults[0].data || []);
        setInvites(babyResults[1].data || []);
        setProfessionals(babyResults[2].data || []);
      }
    } catch {
      showError('Erro ao carregar dados', 'Tente novamente em alguns segundos');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToForm = () => {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // ====== Handlers - Received Invites ======
  const handleAcceptInvite = async (invite: ReceivedInvite) => {
    if (invite.inviteType === 'PATIENT_INVITE' || invite.requiresBabySelection) {
      if (babies.length === 0) {
        showError('Nenhum bebê cadastrado', 'Cadastre um bebê antes de aceitar este convite');
        return;
      }
      setBabySelectorData({
        inviteId: invite.id,
        professionalName: invite.inviterName,
        specialty: invite.specialty,
      });
      return;
    }

    setProcessingInviteId(invite.id);
    try {
      await babyInviteService.acceptInviteById(invite.id, invite.inviteType);
      success('Convite aceito!', `Agora você tem acesso a ${invite.babyName}`);
      loadData();
    } catch (err: any) {
      showError('Erro ao aceitar', err.response?.data?.message || 'Tente novamente');
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleAcceptPatientInvite = async (babyIds: number[]) => {
    if (!babySelectorData) return;
    setProcessingInviteId(babySelectorData.inviteId);
    try {
      await patientInviteService.accept(babySelectorData.inviteId, babyIds);
      success(
        'Convite aceito!',
        `${babyIds.length} bebê(s) compartilhado(s) com ${babySelectorData.professionalName}`
      );
      setBabySelectorData(null);
      loadData();
    } catch (err: any) {
      showError('Erro ao aceitar', err.response?.data?.message || 'Tente novamente');
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleRejectInvite = async (invite: ReceivedInvite) => {
    setProcessingInviteId(invite.id);
    try {
      if (invite.inviteType === 'PATIENT_INVITE') {
        await patientInviteService.reject(invite.id);
      } else {
        await babyInviteService.rejectInvite(invite.id, invite.inviteType);
      }
      info('Convite recusado', `Convite de ${invite.inviterName} foi recusado`);
      loadData();
    } catch (err: any) {
      showError('Erro ao recusar', err.response?.data?.message || 'Tente novamente');
    } finally {
      setProcessingInviteId(null);
    }
  };

  // ====== Handlers - Send Invites ======
  const onSubmitFamilyInvite = async (data: FamilyInviteFormData) => {
    if (!currentBaby) { showError('Erro', 'Selecione um bebê primeiro'); return; }
    setIsSubmitting(true);
    try {
      const response = await babyInviteService.createInvite(currentBaby.id, data);
      const emailSent = response.data?.emailSent !== false;
      if (emailSent) {
        success('Convite enviado!', `Email enviado para ${data.emailInvited}`);
      } else {
        warning('Convite criado', 'Email não enviado. Use o link para compartilhar.');
      }
      setShowInviteForm(false);
      familyForm.reset({ memberType: 'FAMILY', role: 'FAMILY_VIEWER' });
      loadData();
      if (response.data?.token) handleCopyLink(response.data.token);
    } catch (err: any) {
      showError('Erro ao enviar convite', err.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitProfInvite = async (data: ProfessionalInviteFormData) => {
    if (!currentBaby) { showError('Erro', 'Selecione um bebê primeiro'); return; }
    setIsSubmitting(true);
    try {
      await professionalService.invite(currentBaby.id, data);
      success('Convite enviado!', `Email enviado para ${data.email}`);
      setShowInviteForm(false);
      profForm.reset({ role: 'PEDIATRICIAN' });
      loadData();
    } catch (err: any) {
      showError('Erro ao enviar convite', err.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== Handlers - Resend ======
  const handleResendInvite = async (invite: BabyInvite) => {
    if (!currentBaby) return;
    try {
      await babyInviteService.resendInvite(currentBaby.id, invite.id);
      success('Reenviado!', `Novo email enviado para ${invite.emailInvited}`);
      loadData();
    } catch (err: any) {
      showError('Erro ao reenviar', err.response?.data?.message || 'Tente novamente');
    }
  };

  const handleResendProfInvite = async (prof: Professional) => {
    if (!currentBaby) return;
    try {
      await professionalService.resendInvite(currentBaby.id, prof.professional.id);
      success('Reenviado!', `Novo email enviado para ${prof.professional.email}`);
      loadData();
    } catch (err: any) {
      showError('Erro ao reenviar', err.response?.data?.message || 'Tente novamente');
    }
  };

  // ====== Handlers - Revoke ======
  const executeConfirmAction = async () => {
    if (!currentBaby || !confirmAction) return;
    setIsSubmitting(true);
    try {
      if (confirmAction.type === 'member') {
        await babyMemberService.revokeMember(currentBaby.id, confirmAction.id);
      } else if (confirmAction.type === 'invite') {
        await babyInviteService.revokeInvite(currentBaby.id, confirmAction.id);
      } else {
        await professionalService.remove(currentBaby.id, confirmAction.id);
      }
      success('Removido com sucesso');
      setConfirmAction(null);
      loadData();
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== Utility ======
  const handleCopyLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      info('Link copiado!', 'Cole o link para compartilhar diretamente');
    } catch {
      info('Link de convite', inviteUrl);
    }
  };

  const openInviteForm = (type: 'family' | 'professional') => {
    setInviteFormType(type);
    setShowInviteForm(true);
    scrollToForm();
  };

  // ====== Derived Data ======
  const isOwnerRole = (role: string) => role === 'OWNER_PARENT_1' || role === 'OWNER_PARENT_2';
  const activeMembers = members.filter(m => m.status === 'ACTIVE');
  const pendingFamilyInvites = invites.filter(i => i.status === 'PENDING' && i.memberType !== 'PROFESSIONAL');
  const pendingProfInvites = professionals.filter(p => ['PENDING', 'INVITED'].includes(p.professional.status));
  const activeProfessionals = professionals.filter(p => p.professional.status === 'ACTIVE');
  const allPendingSent = [...pendingFamilyInvites.map(i => ({ ...i, _type: 'family' as const })), ...pendingProfInvites.map(p => ({ ...p, _type: 'prof' as const }))];

  const receivedCounts = {
    all: receivedInvites.length,
    family: receivedInvites.filter(i => i.inviteType === 'FAMILY').length,
    professional: receivedInvites.filter(i => i.inviteType === 'PROFESSIONAL').length,
    doctor: receivedInvites.filter(i => i.inviteType === 'PATIENT_INVITE').length,
  };

  const filteredReceived = inviteFilter === 'all'
    ? receivedInvites
    : receivedInvites.filter(i => i.inviteType === inviteFilter);

  // ====== No Baby Selected ======
  if (!currentBaby && receivedInvites.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-olive-100 dark:bg-olive-900/30 rounded-3xl flex items-center justify-center mb-5">
            <Baby className="w-10 h-10 text-olive-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selecione um bebê</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
            Escolha um bebê para gerenciar compartilhamentos e convites
          </p>
          <Button onClick={() => navigate('/settings/babies')}>Ver meus bebês</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ====== Header ====== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-olive-400 to-olive-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentBaby ? `Equipe de ${currentBaby.name}` : 'Convites'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentBaby ? 'Gerencie quem pode acompanhar seu bebê' : 'Veja convites que você recebeu'}
              </p>
            </div>
          </div>
          {currentBaby && !showInviteForm && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => openInviteForm('family')} leftIcon={<UserPlus className="w-4 h-4" />}>
                Convidar
              </Button>
              <Button size="sm" variant="outline" onClick={() => openInviteForm('professional')} leftIcon={<Stethoscope className="w-4 h-4" />}>
                Profissional
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-olive-600 animate-spin" />
              <p className="text-sm text-gray-500">Carregando...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ====== SECTION: Received Invites ====== */}
            {receivedInvites.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Convites Recebidos
                    </h2>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      {receivedInvites.length}
                    </span>
                  </div>
                </div>

                <InviteTypeFilter
                  activeFilter={inviteFilter}
                  onChange={setInviteFilter}
                  counts={receivedCounts}
                />

                <div className="space-y-3">
                  {filteredReceived.map((invite) => {
                    const isProcessing = processingInviteId === invite.id;
                    const config = inviteTypeConfig[invite.inviteType] || inviteTypeConfig.FAMILY;
                    const isPatientInvite = invite.inviteType === 'PATIENT_INVITE';
                    const colorClasses = {
                      blue: { border: 'border-blue-200 dark:border-blue-800/50', bg: 'from-blue-50/50', icon: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
                      teal: { border: 'border-teal-200 dark:border-teal-800/50', bg: 'from-teal-50/50', icon: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
                      purple: { border: 'border-purple-200 dark:border-purple-800/50', bg: 'from-purple-50/50', icon: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
                    }[config.color] || { border: 'border-gray-200', bg: 'from-gray-50/50', icon: 'bg-gray-100', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' };

                    return (
                      <Card key={`received-${invite.inviteType}-${invite.id}`} className={cn(colorClasses.border, `bg-gradient-to-r ${colorClasses.bg} to-white dark:to-gray-800`)}>
                        <CardBody className="p-4 sm:p-5">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colorClasses.icon)}>
                                <config.icon className={cn('w-5 h-5', colorClasses.text)} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {invite.inviterName}
                                  </span>
                                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colorClasses.badge)}>
                                    {config.label}
                                  </span>
                                </div>

                                {isPatientInvite && invite.specialty && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    {invite.specialty}
                                    {invite.professionalCRM && <span className="text-gray-400 ml-1">· {invite.professionalCRM}</span>}
                                  </p>
                                )}

                                {!isPatientInvite && invite.babyName && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Bebê: <strong>{invite.babyName}</strong>
                                  </p>
                                )}

                                {invite.message && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">"{invite.message}"</p>
                                )}

                                <div className="flex items-center gap-3 mt-1.5">
                                  {invite.inviterEmail && (
                                    <span className="text-xs text-gray-400 truncate">{invite.inviterEmail}</span>
                                  )}
                                  <TimeRemaining expiresAt={invite.expiresAt} />
                                </div>

                                {isPatientInvite && (
                                  <div className="mt-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                    <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                      <Baby className="w-3.5 h-3.5 flex-shrink-0" />
                                      Ao aceitar, você escolherá quais bebês compartilhar com este profissional
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:self-end">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptInvite(invite)}
                                disabled={isProcessing}
                                leftIcon={isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                className="flex-1 sm:flex-none"
                              >
                                {isPatientInvite ? 'Aceitar e Escolher Bebês' : 'Aceitar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRejectInvite(invite)}
                                disabled={isProcessing}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                              >
                                <X className="w-4 h-4" />
                                <span className="sm:hidden ml-1">Recusar</span>
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ====== SECTION: Invite Form ====== */}
            {showInviteForm && currentBaby && (
              <div ref={formRef}>
                <Card className="border-olive-200 dark:border-olive-800/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {inviteFormType === 'family'
                          ? <UserPlus className="w-5 h-5 text-olive-600" />
                          : <Stethoscope className="w-5 h-5 text-teal-600" />}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {inviteFormType === 'family' ? 'Convidar Familiar ou Responsável' : 'Convidar Profissional de Saúde'}
                        </h3>
                      </div>
                      <button onClick={() => setShowInviteForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex gap-2 mb-5">
                      <button
                        type="button"
                        onClick={() => setInviteFormType('family')}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          inviteFormType === 'family'
                            ? 'bg-olive-100 dark:bg-olive-900/30 text-olive-700 dark:text-olive-300 ring-1 ring-olive-300 dark:ring-olive-700'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <Users className="w-4 h-4" /> Família
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteFormType('professional')}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          inviteFormType === 'professional'
                            ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-300 dark:ring-teal-700'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <Stethoscope className="w-4 h-4" /> Profissional
                      </button>
                    </div>

                    {/* Family Form */}
                    {inviteFormType === 'family' && (
                      <form onSubmit={familyForm.handleSubmit(onSubmitFamilyInvite, () => {
                        showError('Preencha os campos', 'Verifique nome e email');
                      })} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome *</label>
                            <input
                              {...familyForm.register('invitedName')}
                              type="text"
                              placeholder="Nome da pessoa"
                              className={cn(
                                'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                                familyForm.formState.errors.invitedName ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                              )}
                            />
                            {familyForm.formState.errors.invitedName && (
                              <p className="text-xs text-red-500 mt-1">{familyForm.formState.errors.invitedName.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                            <input
                              {...familyForm.register('emailInvited')}
                              type="email"
                              placeholder="email@exemplo.com"
                              className={cn(
                                'w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                                familyForm.formState.errors.emailInvited ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                              )}
                            />
                            {familyForm.formState.errors.emailInvited && (
                              <p className="text-xs text-red-500 mt-1">{familyForm.formState.errors.emailInvited.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tipo de acesso</label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => familyForm.setValue('memberType', 'FAMILY')}
                                className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm font-medium',
                                  watchMemberType === 'FAMILY' ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20 text-olive-700 dark:text-olive-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300')}>
                                <Users className="w-4 h-4" /> Familiar
                              </button>
                              <button type="button" onClick={() => familyForm.setValue('memberType', 'PARENT')}
                                className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition text-sm font-medium',
                                  watchMemberType === 'PARENT' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300')}>
                                <Crown className="w-4 h-4" /> Responsável
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
                                  <option value="OWNER_PARENT_2">Responsável Principal</option>
                                  <option value="OWNER_PARENT_1">Responsável Principal (Alt.)</option>
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

                        <div className="flex items-center gap-3 pt-1">
                          <Button type="submit" disabled={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                            {isSubmitting ? 'Enviando...' : 'Enviar convite'}
                          </Button>
                          <Button variant="ghost" type="button" onClick={() => { setShowInviteForm(false); familyForm.reset(); }}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Professional Form */}
                    {inviteFormType === 'professional' && (
                      <form onSubmit={profForm.handleSubmit(onSubmitProfInvite, () => {
                        showError('Preencha os campos', 'Verifique nome, email e especialidade');
                      })} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome completo *</label>
                            <input {...profForm.register('fullName')} type="text" placeholder="Dr. João Silva"
                              className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                                profForm.formState.errors.fullName ? 'border-red-300' : 'border-gray-200 dark:border-gray-600')} />
                            {profForm.formState.errors.fullName && <p className="text-xs text-red-500 mt-1">{profForm.formState.errors.fullName.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                            <input {...profForm.register('email')} type="email" placeholder="email@clinica.com"
                              className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                                profForm.formState.errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600')} />
                            {profForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{profForm.formState.errors.email.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Especialidade *</label>
                            <input {...profForm.register('specialty')} type="text" placeholder="Pediatria, Neonatologia..."
                              className={cn('w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                                profForm.formState.errors.specialty ? 'border-red-300' : 'border-gray-200 dark:border-gray-600')} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Função</label>
                            <select {...profForm.register('role')}
                              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent">
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Observações</label>
                          <textarea {...profForm.register('notes')} rows={2} placeholder="Ex: Pediatra que acompanha desde o nascimento"
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-olive-500 focus:border-transparent" />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <Button type="submit" disabled={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                            {isSubmitting ? 'Enviando...' : 'Enviar convite'}
                          </Button>
                          <Button variant="ghost" type="button" onClick={() => { setShowInviteForm(false); profForm.reset(); }}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* ====== SECTION: Active Members ====== */}
            {currentBaby && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Equipe</h2>
                  <span className="text-sm text-gray-400">
                    {activeMembers.length + activeProfessionals.length} {activeMembers.length + activeProfessionals.length === 1 ? 'membro' : 'membros'}
                  </span>
                </div>

                <Card>
                  <CardBody className="p-0 divide-y divide-gray-100 dark:divide-gray-700">
                    {activeMembers.length === 0 && activeProfessionals.length === 0 ? (
                      <div className="p-6">
                        <EmptyState icon={Users} title="Nenhum membro" description="Convide alguém para acompanhar seu bebê" />
                      </div>
                    ) : (
                      <>
                        {activeMembers.map((member) => (
                          <div key={`member-${member.id}`} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                              isOwnerRole(member.role)
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : 'bg-olive-100 dark:bg-olive-900/30'
                            )}>
                              {isOwnerRole(member.role) ? <Crown className="w-5 h-5 text-amber-600" /> : <Users className="w-5 h-5 text-olive-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                {member.user.email}
                                {member.userId === user?.id && (
                                  <span className="ml-1.5 text-xs text-olive-600 dark:text-olive-400 font-normal">(você)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {roleLabels[member.role] || member.role}
                              </p>
                            </div>
                            {!isOwnerRole(member.role) && member.userId !== user?.id && (
                              <button
                                onClick={() => setConfirmAction({ type: 'member', id: member.id, name: member.user.email })}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                title="Remover acesso"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        {activeProfessionals.map((prof) => (
                          <div key={`prof-${prof.id}`} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{prof.professional.fullName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {prof.professional.specialty} · {prof.professional.email}
                              </p>
                            </div>
                            <button
                              onClick={() => setConfirmAction({ type: 'prof', id: prof.id, name: prof.professional.fullName })}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* ====== SECTION: Pending Sent Invites ====== */}
            {currentBaby && allPendingSent.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowSentInvites(!showSentInvites)}
                  className="flex items-center gap-2 px-1 w-full text-left group"
                >
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Convites Enviados</h2>
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {allPendingSent.length} pendente{allPendingSent.length > 1 ? 's' : ''}
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-gray-400 ml-auto transition-transform',
                    showSentInvites && 'rotate-180'
                  )} />
                </button>

                {showSentInvites && (
                  <Card>
                    <CardBody className="p-0 divide-y divide-gray-100 dark:divide-gray-700">
                      {pendingFamilyInvites.map((invite) => (
                        <div key={`sent-${invite.id}`} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                {invite.invitedName || invite.emailInvited}
                              </p>
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {memberTypeLabels[invite.memberType] || invite.memberType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{invite.emailInvited}</p>
                              <span className="text-gray-300 dark:text-gray-600">·</span>
                              <TimeRemaining expiresAt={invite.expiresAt} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleResendInvite(invite)}
                              className="p-2 rounded-lg text-gray-400 hover:text-olive-600 hover:bg-olive-50 dark:hover:bg-olive-900/20 transition"
                              title="Reenviar convite"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'invite', id: invite.id, name: invite.emailInvited })}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Revogar convite"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {pendingProfInvites.map((prof) => (
                        <div key={`sent-prof-${prof.id}`} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{prof.professional.fullName}</p>
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300">
                                Profissional
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {prof.professional.specialty} · {prof.professional.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleResendProfInvite(prof)}
                              className="p-2 rounded-lg text-gray-400 hover:text-olive-600 hover:bg-olive-50 dark:hover:bg-olive-900/20 transition"
                              title="Reenviar"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'prof', id: prof.id, name: prof.professional.fullName })}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Remover"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {/* ====== Confirm Action Dialog ====== */}
            {confirmAction && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 sticky bottom-4">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {confirmAction.type === 'invite' ? 'Revogar convite' : 'Remover acesso'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {confirmAction.type === 'invite'
                          ? `O convite para ${confirmAction.name} será invalidado.`
                          : `${confirmAction.name} perderá acesso ao bebê.`}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="danger" size="sm" onClick={executeConfirmAction} disabled={isSubmitting}>
                          {isSubmitting ? 'Processando...' : 'Confirmar'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* ====== Empty state when no baby and no received invites ====== */}
            {!currentBaby && receivedInvites.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Nenhum convite"
                description="Você não tem convites pendentes no momento"
              />
            )}
          </>
        )}
      </div>

      {/* ====== Baby Selector Modal ====== */}
      {babySelectorData && (
        <BabySelectorModal
          babies={babies.map(b => ({ id: b.id, name: b.name }))}
          professionalName={babySelectorData.professionalName}
          specialty={babySelectorData.specialty}
          onConfirm={handleAcceptPatientInvite}
          onCancel={() => setBabySelectorData(null)}
          isLoading={processingInviteId === babySelectorData.inviteId}
        />
      )}
    </DashboardLayout>
  );
}
