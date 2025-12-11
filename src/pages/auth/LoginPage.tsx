// Olive Baby Web - Login Page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/Toast';
import type { LoginFormData } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro ao fazer login', error.response?.data?.message || error.message);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Entre na sua conta para continuar"
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

        <Input
          label="Senha"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-olive-600 rounded border-gray-300 focus:ring-olive-500"
            />
            <span className="text-sm text-gray-600">Lembrar de mim</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-olive-600 hover:text-olive-700 font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Entrar
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-olive-600 hover:text-olive-700 font-medium">
              Cadastre-se
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
