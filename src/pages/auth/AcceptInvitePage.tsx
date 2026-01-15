// Olive Baby Web - Accept Invite Page (Melhorado)
// Estados claros: VERIFICANDO, VÁLIDO, INVÁLIDO, EXPIRADO, REVOGADO, ACEITO, JÁ_ACEITO
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserCheck,
  Baby,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  LogIn,
  UserPlus,
  RefreshCw,
  Calendar,
  Users,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { Card, CardBody, Button, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { babyInviteService, authService } from '../../services/api';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDateBR, cn, storage } from '../../lib/utils';

// ====== Types ======
type InviteStatus = 'LOADING' | 'VALID' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'ALREADY_ACCEPTED' | 'ACCEPTED' | 'ERROR';

interface InviteData {
  invite: {
    id: number;
    babyId: number;
    emailInvited: string;
    memberType: 'PARENT' | 'FAMILY' | 'PROFESSIONAL';
    role: string;
    invitedName?: string;
    message?: string;
  };
  baby: {
    id: number;
    name: string;
    birthDate: string;
  };
  userExists?: boolean;
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

const memberTypeIcons: Record<string, any> = {
  PARENT: Crown,
  FAMILY: Users,
  PROFESSIONAL: Shield,
};

// ====== Validation Schema ======
const registerSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

// ====== Main Component ======
export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();
  const { fetchBabies, selectBaby } = useBabyStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const token = searchParams.get('token');
  
  // ====== State ======
  const [status, setStatus] = useState<InviteStatus>('LOADING');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // ====== Forms ======
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ====== Token Verification ======
  const verifyToken = useCallback(async () => {
    if (!token) {
      setStatus('INVALID');
      setErrorMessage('Link de convite incompleto ou inválido');
      return;
    }

    try {
      const response = await babyInviteService.verifyToken(token);
      
      if (response.success && response.data) {
        setInviteData(response.data);
        setStatus('VALID');
        
        // Use userExists from backend response (for non-authenticated users)
        if (!isAuthenticated) {
          const userExistsFromBackend = response.data.userExists ?? false;
          setUserExists(userExistsFromBackend);
          setMode(userExistsFromBackend ? 'login' : 'register');
        }
      } else {
        setStatus('INVALID');
        setErrorMessage(response.message || 'Convite inválido');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || '';
      
      // Determine specific error type
      if (message.toLowerCase().includes('expirou') || message.toLowerCase().includes('expired')) {
        setStatus('EXPIRED');
        setErrorMessage('Este convite expirou. Peça ao remetente para enviar um novo.');
      } else if (message.toLowerCase().includes('revogado') || message.toLowerCase().includes('revoked')) {
        setStatus('REVOKED');
        setErrorMessage('Este convite foi cancelado pelo remetente.');
      } else if (message.toLowerCase().includes('aceito') || message.toLowerCase().includes('accepted')) {
        setStatus('ALREADY_ACCEPTED');
        setErrorMessage('Este convite já foi aceito anteriormente.');
      } else {
        setStatus('INVALID');
        setErrorMessage(message || 'Token de convite inválido ou não encontrado.');
      }
    }
  }, [token, isAuthenticated]);

  // ====== Effects ======
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // ====== Handlers ======
  const handleRegisterAndAccept = async (data: RegisterFormData) => {
    if (!token || !inviteData) return;

    setIsSubmitting(true);
    try {
      // 1. Create account
      const registerResponse = await authService.register({
        email: inviteData.invite.emailInvited,
        password: data.password,
        fullName: inviteData.invite.invitedName || inviteData.invite.emailInvited.split('@')[0],
        cpf: '', // Will be filled later in profile
      });

      if (!registerResponse.success) {
        throw new Error(registerResponse.message || 'Erro ao criar conta');
      }

      // 2. Login to get tokens
      const loginResponse = await authService.login(inviteData.invite.emailInvited, data.password);
      
      if (loginResponse.success && loginResponse.data) {
        // Save tokens
        storage.set('auth_tokens', {
          accessToken: loginResponse.data.accessToken,
          refreshToken: loginResponse.data.refreshToken,
        });
        storage.set('user', loginResponse.data.user);
      }

      // 3. Accept invite
      const acceptResponse = await babyInviteService.acceptInvite(token);
      
      if (acceptResponse.success) {
        setStatus('ACCEPTED');
        success('Bem-vindo(a)! 🎉', `Você agora tem acesso a ${inviteData.baby.name}`);
        
        // 4. Fetch babies and select the correct one
        setTimeout(async () => {
          await fetchBabies();
          // The fetchBabies will auto-select the first baby, but we want the invited baby
          const babyId = acceptResponse.data?.babyId || inviteData.baby.id;
          if (babyId) {
            // This will be handled by navigating to dashboard
            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível aceitar o convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginAndAccept = async (data: LoginFormData) => {
    if (!token || !inviteData) return;

    setIsSubmitting(true);
    try {
      // 1. Login
      const loginResponse = await authService.login(inviteData.invite.emailInvited, data.password);
      
      if (loginResponse.success && loginResponse.data) {
        // Save tokens
        storage.set('auth_tokens', {
          accessToken: loginResponse.data.accessToken,
          refreshToken: loginResponse.data.refreshToken,
        });
        storage.set('user', loginResponse.data.user);

        // 2. Accept invite
        const acceptResponse = await babyInviteService.acceptInvite(token);
        
        if (acceptResponse.success) {
          setStatus('ACCEPTED');
          success('Convite aceito! 🎉', `Você agora tem acesso a ${inviteData.baby.name}`);
          
          // 3. Fetch babies and redirect
          setTimeout(async () => {
            await fetchBabies();
            navigate('/dashboard', { replace: true });
          }, 2000);
        }
      } else {
        showError('Erro', loginResponse.message || 'Senha incorreta');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Senha incorreta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAsLoggedUser = async () => {
    if (!token || !inviteData) return;

    // Check if logged user email matches invite email
    if (user?.email?.toLowerCase() !== inviteData.invite.emailInvited.toLowerCase()) {
      showError(
        'Email diferente',
        `Este convite foi enviado para ${inviteData.invite.emailInvited}. Você está logado como ${user?.email}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const acceptResponse = await babyInviteService.acceptInvite(token);
      
      if (acceptResponse.success) {
        setStatus('ACCEPTED');
        success('Convite aceito! 🎉', `Você agora tem acesso a ${inviteData.baby.name}`);
        
        // Fetch babies and redirect
        setTimeout(async () => {
          await fetchBabies();
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      
      // Handle specific errors
      const message = error.response?.data?.message || '';
      if (message.toLowerCase().includes('já está vinculado') || message.toLowerCase().includes('already')) {
        setStatus('ALREADY_ACCEPTED');
        setErrorMessage('Você já tem acesso a este bebê.');
      } else {
        showError('Erro', message || 'Não foi possível aceitar o convite');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndContinue = () => {
    logout();
    storage.remove('auth_tokens');
    storage.remove('user');
    setUserExists(null);
    setMode('register');
  };

  // ====== Render Functions ======
  const renderInviteInfo = () => {
    if (!inviteData) return null;

    const MemberIcon = memberTypeIcons[inviteData.invite.memberType] || Users;
    const babyBirthDate = new Date(inviteData.baby.birthDate);

    return (
      <div className="space-y-4">
        {/* Baby Info */}
        <div className="bg-gradient-to-br from-olive-50 to-olive-100 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Baby className="w-8 h-8 text-olive-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{inviteData.baby.name}</h3>
              <p className="text-olive-700 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Nascido em {formatDateBR(babyBirthDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Convite para:</span>
            <span className="font-medium text-gray-900">{inviteData.invite.emailInvited}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MemberIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium text-gray-900">
              {memberTypeLabels[inviteData.invite.memberType]}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Função:</span>
            <span className="font-medium text-gray-900">
              {roleLabels[inviteData.invite.role] || inviteData.invite.role}
            </span>
          </div>
        </div>

        {/* Custom Message */}
        {inviteData.invite.message && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800 italic">"{inviteData.invite.message}"</p>
          </div>
        )}
      </div>
    );
  };

  // ====== Status-based Renders ======
  
  // Loading
  if (status === 'LOADING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <Loader2 className="w-12 h-12 text-olive-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verificando convite...</h2>
            <p className="text-gray-500">Aguarde um momento</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Invalid/Expired/Revoked/AlreadyAccepted
  if (['INVALID', 'EXPIRED', 'REVOKED', 'ALREADY_ACCEPTED'].includes(status)) {
    const configs = {
      INVALID: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        title: 'Convite Inválido',
      },
      EXPIRED: {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100',
        title: 'Convite Expirado',
      },
      REVOKED: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        title: 'Convite Cancelado',
      },
      ALREADY_ACCEPTED: {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        title: 'Convite Já Aceito',
      },
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-8">
            <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', config.bgColor)}>
              <Icon className={cn('w-10 h-10', config.color)} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h2>
            <p className="text-gray-500 mb-6">{errorMessage}</p>
            
            {status === 'ALREADY_ACCEPTED' ? (
              <Button onClick={() => navigate('/dashboard')} fullWidth>
                Ir para Dashboard
              </Button>
            ) : (
              <div className="space-y-3">
                <Button onClick={() => navigate('/login')} fullWidth>
                  Ir para Login
                </Button>
                {status === 'EXPIRED' && (
                  <p className="text-sm text-gray-400">
                    Peça ao remetente para reenviar o convite
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // Accepted Success
  if (status === 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Convite Aceito! 🎉</h2>
            <p className="text-gray-500 mb-2">
              Você agora tem acesso a <strong>{inviteData?.baby.name}</strong>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Redirecionando para o dashboard...
            </p>
            <Loader2 className="w-6 h-6 text-olive-600 animate-spin mx-auto" />
          </CardBody>
        </Card>
      </div>
    );
  }

  // Valid - Show accept form
  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-green-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-olive-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Você foi convidado! 🎉
            </h1>
            <p className="text-gray-500">
              Para acompanhar o desenvolvimento de um bebê
            </p>
          </div>

          {/* Invite Info */}
          {renderInviteInfo()}

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Action Section */}
          {isAuthenticated && user ? (
            // User is logged in
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Logado como:</strong> {user.email}
                </p>
              </div>
              
              {user.email?.toLowerCase() === inviteData?.invite.emailInvited.toLowerCase() ? (
                <Button
                  onClick={handleAcceptAsLoggedUser}
                  fullWidth
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Aceitar Convite
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      Este convite foi enviado para <strong>{inviteData?.invite.emailInvited}</strong>.
                      Você está logado com outro email.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleLogoutAndContinue}
                    fullWidth
                    leftIcon={<LogIn className="w-5 h-5" />}
                  >
                    Sair e continuar como {inviteData?.invite.emailInvited}
                  </Button>
                </div>
              )}
            </div>
          ) : userExists ? (
            // User exists but not logged in - Login Form
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  Você já tem uma conta. Entre com sua senha para aceitar o convite.
                </p>
              </div>

              <form onSubmit={loginForm.handleSubmit(handleLoginAndAccept)} className="space-y-4">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="font-medium text-gray-900">{inviteData?.invite.emailInvited}</p>
                </div>

                <Input
                  label="Senha"
                  type="password"
                  placeholder="Sua senha"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar e Aceitar
                </Button>
              </form>

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-olive-600 hover:text-olive-700">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
          ) : (
            // User doesn't exist - Register Form
            <div className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  Crie sua conta para aceitar o convite e começar a acompanhar o bebê.
                </p>
              </div>

              <form onSubmit={registerForm.handleSubmit(handleRegisterAndAccept)} className="space-y-4">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="font-medium text-gray-900">{inviteData?.invite.emailInvited}</p>
                </div>

                <Input
                  label="Criar Senha"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />

                <Input
                  label="Confirmar Senha"
                  type="password"
                  placeholder="Digite novamente"
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                />

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Conta e Aceitar
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUserExists(true);
                    setMode('login');
                  }}
                  className="text-sm text-olive-600 hover:text-olive-700"
                >
                  Já tenho uma conta
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
