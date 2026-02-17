// Olive Baby Web - Baby Members Management Page
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
  UserCheck,
  Crown,
  Eye,
  Edit,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Badge } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { babyMemberService, babyInviteService } from '../../services/api';
import { cn, formatDateBR } from '../../lib/utils';

// Types
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
  ACTIVE: { label: 'Ativo', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  REVOKED: { label: 'Revogado', color: 'bg-red-100 text-red-700', icon: XCircle },
  ACCEPTED: { label: 'Aceito', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-600', icon: Clock },
};

// Validation schema
const inviteSchema = z.object({
  emailInvited: z.string().email('Email inválido'),
  memberType: z.enum(['PARENT', 'FAMILY', 'PROFESSIONAL']),
  role: z.string().min(1, 'Role é obrigatório'),
  invitedName: z.string().optional(),
  message: z.string().optional(),
  expiresInHours: z.number().min(1).max(168).optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function BabyMembersPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const { babies, selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  
  // Encontrar o bebê pelo ID da URL ou usar o selecionado
  const currentBaby = babyId 
    ? babies.find(b => b.id === parseInt(babyId)) || selectedBaby
    : selectedBaby;
  const [members, setMembers] = useState<BabyMember[]>([]);
  const [invites, setInvites] = useState<BabyInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [showDeleteInviteModal, setShowDeleteInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BabyMember | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<BabyInvite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      memberType: 'PARENT',
      role: 'OWNER_PARENT_2',
    },
  });

  const selectedMemberType = watch('memberType');
  const selectedRole = watch('role');

  // Load data
  useEffect(() => {
    if (selectedBaby) {
      loadData();
    }
  }, [selectedBaby]);

  const loadData = async () => {
    if (!currentBaby) return;
    
    setIsLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        babyMemberService.listMembers(currentBaby.id),
        babyInviteService.listInvites(currentBaby.id),
      ]);
      setMembers(membersRes.data || []);
      setInvites(invitesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Erro', 'Não foi possível carregar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitInvite = async (data: InviteFormData) => {
    if (!currentBaby) return;

    setIsSubmitting(true);
    try {
      await babyInviteService.createInvite(currentBaby.id, data);
      success('Convite enviado!', `Um email foi enviado para ${data.emailInvited}`);
      setShowInviteModal(false);
      reset();
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível enviar o convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (invite: BabyInvite) => {
    if (!currentBaby) return;

    try {
      await babyInviteService.resendInvite(currentBaby.id, invite.id);
      success('Convite reenviado!', `Um novo email foi enviado para ${invite.emailInvited}`);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível reenviar o convite');
    }
  };

  const handleRevokeMember = async () => {
    if (!currentBaby || !selectedMember) return;

    setIsSubmitting(true);
    try {
      await babyMemberService.revokeMember(currentBaby.id, selectedMember.id);
      success('Acesso revogado', 'O membro foi removido do bebê');
      setShowDeleteMemberModal(false);
      setSelectedMember(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível revogar o acesso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvite = async () => {
    if (!currentBaby || !selectedInvite) return;

    setIsSubmitting(true);
    try {
      await babyInviteService.revokeInvite(currentBaby.id, selectedInvite.id);
      success('Convite revogado', 'O convite foi cancelado');
      setShowDeleteInviteModal(false);
      setSelectedInvite(null);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível revogar o convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = (role: string) => role === 'OWNER_PARENT_1' || role === 'OWNER_PARENT_2';

  if (!currentBaby) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mb-4">
            <Baby className="w-8 h-8 text-olive-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bebê não encontrado</h2>
          <p className="text-gray-500 mb-4">O bebê selecionado não foi encontrado</p>
          <Button onClick={() => navigate('/settings/babies')}>
            Voltar para Bebês
          </Button>
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
            Pessoas com Acesso a {currentBaby.name}
          </h1>
          <p className="text-gray-500">Gerencie quem tem acesso ao bebê</p>
        </div>
        <Button
          onClick={() => setShowInviteModal(!showInviteModal)}
          leftIcon={showInviteModal ? undefined : <UserPlus className="w-5 h-5" />}
          variant={showInviteModal ? 'secondary' : 'primary'}
        >
          {showInviteModal ? 'Fechar' : 'Convidar Pessoa'}
        </Button>
      </div>

      {/* Inline Invite Form */}
      {showInviteModal && (
        <Card className="border-olive-200 bg-olive-50/30 mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-olive-600" />
                Convidar Pessoa
              </h3>
              <button onClick={() => { setShowInviteModal(false); reset(); }} className="p-1.5 rounded-full hover:bg-gray-200 transition">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmitInvite)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  error={errors.emailInvited?.message}
                  {...register('emailInvited')}
                />
                <Input
                  label="Nome (opcional)"
                  placeholder="Nome da pessoa"
                  {...register('invitedName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Membro</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PARENT', 'FAMILY', 'PROFESSIONAL'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setValue('memberType', type);
                        if (type === 'PARENT') setValue('role', 'OWNER_PARENT_2');
                        else if (type === 'FAMILY') setValue('role', 'FAMILY_VIEWER');
                        else setValue('role', 'PEDIATRICIAN');
                      }}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-center',
                        selectedMemberType === type
                          ? 'border-olive-500 bg-olive-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-sm font-medium">{memberTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funcao</label>
                  <select className="input" {...register('role')}>
                    {selectedMemberType === 'PARENT' && (
                      <>
                        <option value="OWNER_PARENT_1">Responsavel Principal 1</option>
                        <option value="OWNER_PARENT_2">Responsavel Principal 2</option>
                      </>
                    )}
                    {selectedMemberType === 'FAMILY' && (
                      <>
                        <option value="FAMILY_VIEWER">Familiar (Visualizacao)</option>
                        <option value="FAMILY_EDITOR">Familiar (Edicao)</option>
                      </>
                    )}
                    {selectedMemberType === 'PROFESSIONAL' && (
                      <>
                        <option value="PEDIATRICIAN">Pediatra</option>
                        <option value="OBGYN">Obstetra/Ginecologista</option>
                        <option value="LACTATION_CONSULTANT">Consultora de Amamentacao</option>
                        <option value="OTHER">Outro</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                  <textarea className="input min-h-[40px]" placeholder="Ex: Convite para acompanhar nosso bebe!" {...register('message')} />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => { setShowInviteModal(false); reset(); }}>Cancelar</Button>
                <Button type="submit" isLoading={isSubmitting}>Enviar Convite</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'members'
                ? 'border-olive-500 text-olive-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Membros ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={cn(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'invites'
                ? 'border-olive-500 text-olive-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Convites ({invites.filter(i => i.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-olive-600 animate-spin" />
          </div>
        ) : activeTab === 'members' ? (
          <>
            {members.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-olive-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum membro cadastrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Convide pessoas para compartilhar o acesso a {selectedBaby.name}
                  </p>
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    leftIcon={<UserPlus className="w-5 h-5" />}
                  >
                    Convidar Pessoa
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {members.map((member) => {
                  const status = statusConfig[member.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardBody className="flex items-start gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0',
                          isOwner(member.role) ? 'bg-yellow-100' : 'bg-olive-100'
                        )}>
                          {isOwner(member.role) ? <Crown className="w-7 h-7 text-yellow-600" /> : 
                           member.memberType === 'FAMILY' ? <Users className="w-7 h-7 text-olive-600" /> :
                           <Shield className="w-7 h-7 text-olive-600" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {member.user.email}
                            </h3>
                            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', status.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {isOwner(member.role) && (
                              <Badge variant="warning">Owner</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-olive-600 font-medium mb-2">
                            {memberTypeLabels[member.memberType]} • {roleLabels[member.role] || member.role}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {member.user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Desde {formatDateBR(new Date(member.createdAt))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isOwner(member.role) && member.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setShowDeleteMemberModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Revogar acesso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {invites.filter(i => i.status === 'PENDING').length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-olive-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum convite pendente
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Convites aceitos ou expirados não aparecem aqui
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-4">
                {invites
                  .filter(i => i.status === 'PENDING')
                  .map((invite) => {
                    const status = statusConfig[invite.status];
                    const StatusIcon = status.icon;
                    
                    return (
                      <Card key={invite.id} className="hover:shadow-md transition-shadow">
                        <CardBody className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            <Send className="w-7 h-7 text-yellow-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {invite.invitedName || invite.emailInvited}
                              </h3>
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', status.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-olive-600 font-medium mb-2">
                              {memberTypeLabels[invite.memberType]} • {roleLabels[invite.role] || invite.role}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {invite.emailInvited}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Expira em {formatDateBR(new Date(invite.expiresAt))}
                              </span>
                            </div>
                            
                            {invite.message && (
                              <p className="mt-2 text-sm text-gray-400 italic">"{invite.message}"</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvite(invite)}
                              title="Reenviar convite"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInvite(invite);
                                setShowDeleteInviteModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Revogar convite"
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
          </>
        )}
      </div>

      {/* Delete Member Modal (confirmation - kept as modal) */}
      <Modal
        isOpen={showDeleteMemberModal}
        onClose={() => {
          setShowDeleteMemberModal(false);
          setSelectedMember(null);
        }}
        title="Revogar Acesso"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja revogar o acesso de{' '}
            <strong>{selectedMember?.user.email}</strong> a {currentBaby?.name}?
          </p>
          <p className="text-sm text-gray-500">
            A pessoa perderá acesso às informações do bebê, mas poderá ser convidada novamente.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteMemberModal(false);
                setSelectedMember(null);
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRevokeMember}
              isLoading={isSubmitting}
              fullWidth
            >
              Revogar Acesso
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Invite Modal */}
      <Modal
        isOpen={showDeleteInviteModal}
        onClose={() => {
          setShowDeleteInviteModal(false);
          setSelectedInvite(null);
        }}
        title="Revogar Convite"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja revogar o convite para{' '}
            <strong>{selectedInvite?.emailInvited}</strong>?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteInviteModal(false);
                setSelectedInvite(null);
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRevokeInvite}
              isLoading={isSubmitting}
              fullWidth
            >
              Revogar Convite
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
