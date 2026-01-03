// Olive Baby Web - Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, CreditCard, Phone } from 'lucide-react';
import { AuthLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/Toast';
import { validateCPF } from '../../lib/utils';
import type { RegisterFormData } from '../../types';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string()
    .min(11, 'CPF inválido')
    .refine((val) => validateCPF(val), 'CPF inválido'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve ter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const { success, error: showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Média', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Boa', color: 'bg-blue-500' };
    return { strength, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.phone?.replace(/\D/g, ''),
      });
      success('Conta criada!', 'Bem-vindo ao Olive Baby');
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro ao criar conta', error.response?.data?.message || error.message);
    }
  };

  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    
    e.target.value = value;
  };

  const formatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    
    e.target.value = value;
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a acompanhar o desenvolvimento do seu bebê"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nome completo"
          type="text"
          placeholder="Seu nome completo"
          leftIcon={<User className="w-5 h-5" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="CPF"
          type="text"
          placeholder="000.000.000-00"
          leftIcon={<CreditCard className="w-5 h-5" />}
          error={errors.cpf?.message}
          {...register('cpf', { onChange: formatCPF })}
        />

        <Input
          label="Telefone (opcional)"
          type="text"
          placeholder="(00) 00000-0000"
          leftIcon={<Phone className="w-5 h-5" />}
          error={errors.phone?.message}
          {...register('phone', { onChange: formatPhone })}
        />

        <div>
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
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Força da senha: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

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

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 mt-0.5 text-olive-600 rounded border-gray-300 focus:ring-olive-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            Li e concordo com os{' '}
            <Link to="/terms" className="text-olive-600 hover:text-olive-700 font-medium">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-olive-600 hover:text-olive-700 font-medium">
              Política de Privacidade
            </Link>
          </label>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Criar conta
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-olive-600 hover:text-olive-700 font-medium">
              Entrar
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
