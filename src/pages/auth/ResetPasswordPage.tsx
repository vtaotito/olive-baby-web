// Olive Baby Web - Reset Password Page
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/api';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showError('Link inválido', 'O link de recuperação não contém um token válido.');
      navigate('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, showError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showError('Erro', 'Token não encontrado');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      success('Senha alterada!', 'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Falha ao redefinir senha';
      
      // Se token inválido/expirado, redirecionar para forgot-password
      if (errorMessage.includes('inválido') || errorMessage.includes('expirado')) {
        showError('Link inválido ou expirado', 'Por favor, solicite um novo link de recuperação.');
        setTimeout(() => {
          navigate('/forgot-password', { replace: true });
        }, 2000);
      } else {
        showError('Erro', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Carregando..." subtitle="Validando link de recuperação">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Senha redefinida!"
        subtitle="Sua senha foi alterada com sucesso"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              Sua senha foi redefinida com sucesso!
            </p>
            <p className="text-sm text-gray-500">
              Você será redirecionado para a página de login em instantes.
            </p>
          </div>

          <Button
            as={Link}
            to="/login"
            variant="primary"
            fullWidth
          >
            Ir para o login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Digite sua nova senha"
    >
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Requisitos da senha:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Mínimo de 8 caracteres</li>
              <li>Pelo menos uma letra maiúscula</li>
              <li>Pelo menos uma letra minúscula</li>
              <li>Pelo menos um número</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nova senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Redefinir senha
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-olive-600 hover:text-olive-700 font-medium"
          >
            Voltar para o login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

