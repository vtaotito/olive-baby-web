// Olive Baby Web - Forgot Password Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      success(
        'Email enviado',
        'Se o email existir em nossa base, você receberá um link de recuperação em breve.'
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Email enviado!"
        subtitle="Verifique sua caixa de entrada"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              Enviamos um link de recuperação para o email informado.
            </p>
            <p className="text-sm text-gray-500">
              Se o email existir em nossa base, você receberá um link para redefinir sua senha.
              O link expira em 30 minutos.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-olive-600 text-white font-medium rounded-xl hover:bg-olive-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
            
            <button
              onClick={() => setIsSuccess(false)}
              className="text-sm text-olive-600 hover:text-olive-700 font-medium w-full"
            >
              Enviar novamente
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Digite seu email e enviaremos um link para redefinir sua senha"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Enviar link de recuperação
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-olive-600 hover:text-olive-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

