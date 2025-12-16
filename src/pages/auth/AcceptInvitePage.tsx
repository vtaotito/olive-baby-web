// Olive Baby Web - Accept Invite Page
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Baby, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, Button, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { babyInviteService, authService } from '../../services/api';
import { formatDateBR } from '../../lib/utils';

const acceptSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type AcceptFormData = z.infer<typeof acceptSchema>;

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<{
    invite: {
      emailInvited: string;
      memberType: string;
      role: string;
      invitedName?: string;
      message?: string;
    };
    baby: {
      id: number;
      name: string;
      birthDate: string;
    };
  } | null>(null);
  const [userExists, setUserExists] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      showError('Token inválido', 'O link de convite está incompleto');
      setIsLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;
    
    try {
      const response = await babyInviteService.verifyToken(token);
      setInviteData(response.data);
      
      // Verificar se usuário já existe
      try {
        await authService.login(response.data.invite.emailInvited, 'dummy');
        setUserExists(true);
      } catch {
        setUserExists(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Token inválido ou expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AcceptFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      // Se usuário não existe, criar conta primeiro
      if (!userExists) {
        await authService.register({
          email: inviteData!.invite.emailInvited,
          password: data.password,
          fullName: inviteData!.invite.invitedName || inviteData!.invite.emailInvited,
          cpf: '', // CPF será preenchido depois
        });
      }

      // Fazer login
      const loginResponse = await authService.login(
        inviteData!.invite.emailInvited,
        data.password
      );

      // Aceitar convite
      await babyInviteService.acceptInvite(token);
      
      success('Convite aceito!', 'Você agora tem acesso ao bebê');
      
      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível aceitar o convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-baby-green flex items-center justify-center p-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-baby-green flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Convite Inválido
            </h2>
            <p className="text-gray-500 mb-4">
              Este convite não é válido ou já expirou.
            </p>
            <Button onClick={() => navigate('/login')}>
              Ir para Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-baby-green flex items-center justify-center p-6">
      <Card className="max-w-md mx-auto">
        <CardBody className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-olive-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Aceitar Convite
            </h1>
            <p className="text-gray-500">
              Você foi convidado para acompanhar <strong>{inviteData.baby.name}</strong>
            </p>
          </div>

          <div className="bg-olive-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Baby className="w-4 h-4 text-olive-600" />
              <span className="font-medium">Bebê:</span>
              <span>{inviteData.baby.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-olive-600" />
              <span className="font-medium">Email:</span>
              <span>{inviteData.invite.emailInvited}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-olive-600" />
              <span className="font-medium">Função:</span>
              <span>{inviteData.invite.role}</span>
            </div>
          </div>

          {inviteData.invite.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{inviteData.invite.message}</p>
            </div>
          )}

          {userExists ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Você já possui uma conta. Faça login para aceitar o convite.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Digite a senha novamente"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                Aceitar Convite e Criar Conta
              </Button>
            </form>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-olive-600 hover:text-olive-700"
            >
              Já tem uma conta? Faça login
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
