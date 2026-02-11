// Olive Baby Web - Login Page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Shield, Stethoscope, Baby } from 'lucide-react';
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

  const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

  // Determina redirect baseado na role do usuário (não no domínio)
  function getRedirectForRole(role: string): string {
    if (role === 'ADMIN') return '/admin';
    if (PROFESSIONAL_ROLES.includes(role)) return '/prof/dashboard';
    return '/dashboard';
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);

      if (!user) {
        showError('Erro ao fazer login', 'Resposta inesperada do servidor');
        return;
      }

      // Redirect inteligente baseado na role
      const fromState = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const destination = fromState || getRedirectForRole(user.role);
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro ao fazer login', error.response?.data?.message || error.message);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo ao OlieCare"
      subtitle="Entre na sua conta para continuar"
    >
      {/* Unified platform info */}
      <div className="flex items-center justify-center gap-3 mb-6 bg-olive-50 dark:bg-olive-900/20 text-olive-800 dark:text-olive-300 border border-olive-200 dark:border-olive-700 rounded-xl px-4 py-3">
        <div className="flex -space-x-1">
          <div className="w-6 h-6 rounded-full bg-olive-500 flex items-center justify-center ring-2 ring-olive-50 dark:ring-olive-900">
            <Baby className="w-3 h-3 text-white" />
          </div>
          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center ring-2 ring-olive-50 dark:ring-olive-900">
            <Stethoscope className="w-3 h-3 text-white" />
          </div>
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-olive-50 dark:ring-olive-900">
            <Shield className="w-3 h-3 text-white" />
          </div>
        </div>
        <p className="text-xs font-medium">Famílias, Profissionais e Administradores</p>
      </div>

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
            <span className="text-sm text-gray-600 dark:text-gray-400">Lembrar de mim</span>
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
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-olive-600 hover:text-olive-700 font-medium">
              Cadastre-se
            </Link>
          </span>
        </div>

        {/* Info sobre tipos de conta */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-3">Você será redirecionado automaticamente para:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Baby className="w-4 h-4 mx-auto text-olive-500 mb-1" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">OlieCare</p>
            </div>
            <div className="px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Stethoscope className="w-4 h-4 mx-auto text-teal-500 mb-1" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Profissional</p>
            </div>
            <div className="px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Shield className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Admin</p>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
