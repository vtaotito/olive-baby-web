// Olive Baby Web - Share Baby Page (Compartilhar Bebê)
// Painel unificado para gerenciar convites de Família/Cuidadores e Profissionais
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
  ExternalLink,
  AlertTriangle,
  Edit3,
  MoreVertical,
  Link2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Badge } from '../../components/ui';
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
  user: {
    id: number;
    email: string;
    role: string;
    createdAt: string;
  };
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

const memberTypeLabels: Record<string, string> = {
  PARENT: 'Responsável',
  FAMILY: 'Familiar',
  PROFESSIONAL: 'Profissional',
};

const statusConfig = {
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

// ====== Main Component ======
export function ShareBabyPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const { babies, selectedBaby, selectBaby } = useBabyStore();
  const { success, error: showError, info } = useToast();
  
  // Find baby by ID from URL or use selected
  const currentBaby = babyId 
    ? babies.find(b => b.id === parseInt(babyId)) || selectedBaby
    : selectedBaby;

  // ====== State ======
  const [activeTab, setActiveTab] = useState<'family' | 'professional'>('family');
  const [members, setMembers] = useState<BabyMember[]>([]);
  const [invites, setInvites] = useState<BabyInvite[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showFamilyInviteModal, setShowFamilyInviteModal] = useState(false);
  const [showProfessionalInviteModal, setShowProfessionalInviteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showCopyLinkModal, setShowCopyLinkModal] = useState(false);
  
  // Selected items for actions
  const [selectedMember, setSelectedMember] = useState<BabyMember | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<BabyInvite | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====== Forms ======
  const familyForm = useForm<FamilyInviteFormData>({
    resolver: zodResolver(familyInviteSchema),
    defaultValues: {
      memberType: 'FAMILY',
      role: 'FAMILY_VIEWER',
    },
  });

  const professionalForm = useForm<ProfessionalInviteFormData>({
    resolver: zodResolver(professionalInviteSchema),
    defaultValues: {
      role: 'PEDIATRICIAN',
    },
  });

  const watchMemberType = familyForm.watch('memberType');

  // ====== Effects ======
  useEffect(() => {
    if (currentBaby) {
      loadData();
    }
  }, [currentBaby?.id]);

  // Reset role when memberType changes
  useEffect(() => {
    if (watchMemberType === 'PARENT') {
      familyForm.setValue('role', 'OWNER_PARENT_2');
    } else {
      familyForm.setValue('role', 'FAMILY_VIEWER');
    }
  }, [watchMemberType]);

  // ====== Data Loading ======
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
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Erro ao carregar dados', 'Tente novamente em alguns segundos');
    } finally {
      setIsLoading(false);
    }
  };

  // ====== Handlers - Family ======
  const onSubmitFamilyInvite = async (data: FamilyInviteFormData) => {
    if (!currentBaby) return;

    setIsSubmitting(true);
    try {
      const response = await babyInviteService.createInvite(currentBaby.id, data);
      success('Convite enviado! 🎉', `Email enviado para ${data.emailInvited}`);
      setShowFamilyInviteModal(false);
      familyForm.reset();
      loadData();
      
      // Se retornou token, mostrar opção de copiar link
      if (response.data?.token) {
        setLastInviteToken(response.data.token);
        setShowCopyLinkModal(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao enviar convite', error.response?.data?.message || 'Tente novamente');
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao reenviar', error.response?.data?.message || 'Tente novamente');
    }
  };

  const handleRevokeFamilyInvite = async () => {
    if (!currentBaby || !selectedInvite) return;

    setIsSubmitting(true);
    try {
      await babyInviteService.revokeInvite(currentBaby.id, selectedInvite.id);
      success('Convite revogado', 'O convite foi cancelado');
      setShowRevokeModal(false);
      setSelectedInvite(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao revogar', error.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeMember = async () => {
    if (!currentBaby || !selectedMember) return;

    setIsSubmitting(true);
    try {
      await babyMemberService.revokeMember(currentBaby.id, selectedMember.id);
      success('Acesso revogado', 'O membro foi removido');
      setShowRevokeModal(false);
      setSelectedMember(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao revogar', error.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== Handlers - Professional ======
  const onSubmitProfessionalInvite = async (data: ProfessionalInviteFormData) => {
    if (!currentBaby) return;

    setIsSubmitting(true);
    try {
      await professionalService.invite(currentBaby.id, data);
      success('Convite enviado! 🩺', `Email enviado para ${data.email}`);
      setShowProfessionalInviteModal(false);
      professionalForm.reset();
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao enviar convite', error.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendProfessionalInvite = async (prof: Professional) => {
    if (!currentBaby) return;

    try {
      await professionalService.resendInvite(currentBaby.id, prof.professional.id);
      success('Convite reenviado!', `Novo email enviado para ${prof.professional.email}`);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao reenviar', error.response?.data?.message || 'Tente novamente');
    }
  };

  const handleRemoveProfessional = async () => {
    if (!currentBaby || !selectedProfessional) return;

    setIsSubmitting(true);
    try {
      await professionalService.remove(currentBaby.id, selectedProfessional.id);
      success('Profissional removido', 'O vínculo foi removido');
      setShowRevokeModal(false);
      setSelectedProfessional(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro ao remover', error.response?.data?.message || 'Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== Handlers - Utility ======
  const handleCopyInviteLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      info('Link copiado! 📋', 'Cole o link para compartilhar');
    } catch {
      // Fallback para browsers antigos
      const textarea = document.createElement('textarea');
      textarea.value = inviteUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      info('Link copiado!', 'Cole o link para compartilhar');
    }
  };

  const isOwner = (role: string) => role === 'OWNER_PARENT_1' || role === 'OWNER_PARENT_2';

  // ====== Derived Data ======
  const familyMembers = members.filter(m => m.memberType !== 'PROFESSIONAL');
  const familyInvites = invites.filter(i => i.memberType !== 'PROFESSIONAL');
  const pendingFamilyInvites = familyInvites.filter(i => i.status === 'PENDING');
  const activeProfessionals = professionals.filter(p => p.professional.status === 'ACTIVE');
  const pendingProfessionals = professionals.filter(p => p.professional.status !== 'ACTIVE');

  // ====== Render - No Baby ======
  if (!currentBaby) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mb-4">
            <Baby className="w-8 h-8 text-olive-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecione um bebê</h2>
          <p className="text-gray-500 mb-4">Escolha um bebê para gerenciar compartilhamentos</p>
          <Button onClick={() => navigate('/settings/babies')}>
            Ver Bebês
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ====== Main Render ======
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-olive-400 to-olive-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Compartilhar {currentBaby.name}
            </h1>
            <p className="text-gray-500">
              Gerencie quem pode ver e cuidar do seu bebê
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('family')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
              activeTab === 'family'
                ? 'bg-white text-olive-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Users className="w-4 h-4" />
            Família / Cuidador
            {pendingFamilyInvites.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {pendingFamilyInvites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
              activeTab === 'professional'
                ? 'bg-white text-olive-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Stethoscope className="w-4 h-4" />
            Profissional
            {pendingProfessionals.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                {pendingProfessionals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-olive-600 animate-spin" />
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* ====== TAB: FAMÍLIA ====== */}
          {activeTab === 'family' && (
            <>
              {/* Invite Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowFamilyInviteModal(true)}
                  leftIcon={<UserPlus className="w-5 h-5" />}
                >
                  Convidar Familiar
                </Button>
              </div>

              {/* Active Members */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Membros Ativos ({familyMembers.filter(m => m.status === 'ACTIVE').length})
                  </h3>
                </CardHeader>
                <CardBody className="divide-y divide-gray-100">
                  {familyMembers.filter(m => m.status === 'ACTIVE').length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                      Nenhum membro ativo além de você
                    </p>
                  ) : (
                    familyMembers
                      .filter(m => m.status === 'ACTIVE')
                      .map((member) => {
                        const status = statusConfig[member.status];
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={member.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                            <div className={cn(
                              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                              isOwner(member.role) ? 'bg-amber-100' : 'bg-olive-100'
                            )}>
                              {isOwner(member.role) ? (
                                <Crown className="w-6 h-6 text-amber-600" />
                              ) : (
                                <Users className="w-6 h-6 text-olive-600" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 truncate">
                                  {member.user.email}
                                </span>
                                <span className={cn(
                                  'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border',
                                  status.color
                                )}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {roleLabels[member.role] || member.role}
                              </p>
                            </div>
                            
                            {!isOwner(member.role) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setShowRevokeModal(true);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })
                  )}
                </CardBody>
              </Card>

              {/* Pending Invites */}
              {pendingFamilyInvites.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      Convites Pendentes ({pendingFamilyInvites.length})
                    </h3>
                  </CardHeader>
                  <CardBody className="divide-y divide-gray-100">
                    {pendingFamilyInvites.map((invite) => {
                      const status = statusConfig[invite.status];
                      const StatusIcon = status.icon;
                      const expiresDate = new Date(invite.expiresAt);
                      const isExpiringSoon = expiresDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;
                      
                      return (
                        <div key={invite.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Send className="w-6 h-6 text-amber-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {invite.invitedName || invite.emailInvited}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border',
                                status.color
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{invite.emailInvited}</p>
                            <p className={cn(
                              'text-xs mt-1',
                              isExpiringSoon ? 'text-red-500' : 'text-gray-400'
                            )}>
                              {isExpiringSoon && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                              Expira em {formatDateBR(expiresDate)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendFamilyInvite(invite)}
                              title="Reenviar convite"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvite(invite);
                                setShowRevokeModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Revogar convite"
                            >
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
              {/* Invite Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowProfessionalInviteModal(true)}
                  leftIcon={<Stethoscope className="w-5 h-5" />}
                >
                  Convidar Profissional
                </Button>
              </div>

              {/* Active Professionals */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Profissionais Ativos ({activeProfessionals.length})
                  </h3>
                </CardHeader>
                <CardBody className="divide-y divide-gray-100">
                  {activeProfessionals.length === 0 ? (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">Nenhum profissional vinculado</p>
                      <p className="text-sm text-gray-400">
                        Convide pediatras e especialistas para acompanhar {currentBaby.name}
                      </p>
                    </div>
                  ) : (
                    activeProfessionals.map((prof) => {
                      const status = statusConfig[prof.professional.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={prof.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {prof.professional.fullName}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border',
                                status.color
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-olive-600 font-medium">
                              {roleLabels[prof.role] || prof.role} • {prof.professional.specialty}
                            </p>
                            <p className="text-sm text-gray-500">{prof.professional.email}</p>
                            {prof.professional.crmNumber && (
                              <p className="text-xs text-gray-400">
                                CRM: {prof.professional.crmNumber}/{prof.professional.crmState}
                              </p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProfessional(prof);
                              setShowRevokeModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </CardBody>
              </Card>

              {/* Pending Professionals */}
              {pendingProfessionals.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Aguardando Ativação ({pendingProfessionals.length})
                    </h3>
                  </CardHeader>
                  <CardBody className="divide-y divide-gray-100">
                    {pendingProfessionals.map((prof) => {
                      const status = statusConfig[prof.professional.status] || statusConfig.PENDING;
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={prof.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Send className="w-6 h-6 text-blue-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {prof.professional.fullName}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border',
                                status.color
                              )}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{prof.professional.email}</p>
                            <p className="text-xs text-gray-400">
                              Convidado em {formatDateBR(new Date(prof.createdAt))}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendProfessionalInvite(prof)}
                              title="Reenviar convite"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProfessional(prof);
                                setShowRevokeModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
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
        </div>
      )}

      {/* ====== MODALS ====== */}
      
      {/* Family Invite Modal */}
      <Modal
        isOpen={showFamilyInviteModal}
        onClose={() => {
          setShowFamilyInviteModal(false);
          familyForm.reset();
        }}
        title="Convidar Familiar ou Cuidador"
        size="lg"
      >
        <form onSubmit={familyForm.handleSubmit(onSubmitFamilyInvite)} className="space-y-4">
          <Input
            label="Email *"
            type="email"
            placeholder="email@exemplo.com"
            error={familyForm.formState.errors.emailInvited?.message}
            {...familyForm.register('emailInvited')}
          />

          <Input
            label="Nome *"
            placeholder="Nome da pessoa"
            error={familyForm.formState.errors.invitedName?.message}
            {...familyForm.register('invitedName')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Membro
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => familyForm.setValue('memberType', 'FAMILY')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  watchMemberType === 'FAMILY'
                    ? 'border-olive-500 bg-olive-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Users className="w-6 h-6 text-olive-600 mb-2" />
                <span className="block font-medium">Familiar</span>
                <span className="text-xs text-gray-500">Avós, tios, etc.</span>
              </button>
              <button
                type="button"
                onClick={() => familyForm.setValue('memberType', 'PARENT')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  watchMemberType === 'PARENT'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Crown className="w-6 h-6 text-amber-600 mb-2" />
                <span className="block font-medium">Responsável</span>
                <span className="text-xs text-gray-500">Pai/Mãe adicional</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissões
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem (opcional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500 min-h-[80px]"
              placeholder="Ex: Convite para acompanhar nosso bebê!"
              {...familyForm.register('message')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowFamilyInviteModal(false);
                familyForm.reset();
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Professional Invite Modal */}
      <Modal
        isOpen={showProfessionalInviteModal}
        onClose={() => {
          setShowProfessionalInviteModal(false);
          professionalForm.reset();
        }}
        title="Convidar Profissional de Saúde"
        size="lg"
      >
        <form onSubmit={professionalForm.handleSubmit(onSubmitProfessionalInvite)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              placeholder="email@clinica.com"
              error={professionalForm.formState.errors.email?.message}
              {...professionalForm.register('email')}
            />
            <Input
              label="Nome Completo *"
              placeholder="Dr. Nome Sobrenome"
              error={professionalForm.formState.errors.fullName?.message}
              {...professionalForm.register('fullName')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Especialidade *"
              placeholder="Pediatria, Neonatologia..."
              error={professionalForm.formState.errors.specialty?.message}
              {...professionalForm.register('specialty')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
                {...professionalForm.register('role')}
              >
                <option value="PEDIATRICIAN">Pediatra</option>
                <option value="OBGYN">Obstetra/Ginecologista</option>
                <option value="LACTATION_CONSULTANT">Consultora de Amamentação</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="CRM"
              placeholder="123456"
              {...professionalForm.register('crmNumber')}
            />
            <Input
              label="UF"
              placeholder="SP"
              maxLength={2}
              {...professionalForm.register('crmState')}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              {...professionalForm.register('phone')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-olive-500 focus:border-olive-500 min-h-[80px]"
              placeholder="Ex: Pediatra que acompanha desde o nascimento"
              {...professionalForm.register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowProfessionalInviteModal(false);
                professionalForm.reset();
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setSelectedMember(null);
          setSelectedInvite(null);
          setSelectedProfessional(null);
        }}
        title={selectedProfessional ? "Remover Profissional" : selectedInvite ? "Revogar Convite" : "Revogar Acesso"}
      >
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium">
                  {selectedProfessional && (
                    <>Remover <strong>{selectedProfessional.professional.fullName}</strong>?</>
                  )}
                  {selectedInvite && (
                    <>Revogar convite para <strong>{selectedInvite.emailInvited}</strong>?</>
                  )}
                  {selectedMember && (
                    <>Revogar acesso de <strong>{selectedMember.user.email}</strong>?</>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProfessional 
                    ? 'O profissional perderá acesso às informações do bebê.'
                    : selectedInvite
                    ? 'O link de convite será invalidado.'
                    : 'A pessoa perderá acesso às informações do bebê.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRevokeModal(false);
                setSelectedMember(null);
                setSelectedInvite(null);
                setSelectedProfessional(null);
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedProfessional) handleRemoveProfessional();
                else if (selectedInvite) handleRevokeFamilyInvite();
                else if (selectedMember) handleRevokeMember();
              }}
              isLoading={isSubmitting}
              fullWidth
            >
              {selectedProfessional ? 'Remover' : 'Revogar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Copy Link Modal */}
      <Modal
        isOpen={showCopyLinkModal}
        onClose={() => {
          setShowCopyLinkModal(false);
          setLastInviteToken(null);
        }}
        title="Convite Enviado!"
      >
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-900 font-medium">
              Um email foi enviado com o link de convite.
            </p>
          </div>

          {lastInviteToken && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Você também pode compartilhar o link diretamente:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/invite/accept?token=${lastInviteToken}`}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                />
                <Button
                  variant="secondary"
                  onClick={() => handleCopyInviteLink(lastInviteToken)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              setShowCopyLinkModal(false);
              setLastInviteToken(null);
            }}
            fullWidth
          >
            Fechar
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
