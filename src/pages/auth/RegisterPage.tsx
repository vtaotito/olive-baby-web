import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail, Lock, Eye, EyeOff, User, Baby, Stethoscope,
  Heart, ArrowRight, ArrowLeft, Check, Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

// ====== Profile Types ======
type ProfileType = 'parent' | 'professional' | null;

// ====== Schemas ======
const credentialsSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de uma letra maiúscula')
    .regex(/[a-z]/, 'Precisa de uma letra minúscula')
    .regex(/[0-9]/, 'Precisa de um número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type CredentialsData = z.infer<typeof credentialsSchema>;

// ====== Password Requirements ======
function PasswordChecklist({ password }: { password: string }) {
  const rules = [
    { label: '8+ caracteres', pass: password.length >= 8 },
    { label: 'Letra maiúscula', pass: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', pass: /[a-z]/.test(password) },
    { label: 'Um número', pass: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
      {rules.map((r) => (
        <div key={r.label} className="flex items-center gap-1.5 text-xs">
          <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors',
            r.pass ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600')}>
            {r.pass && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className={r.pass ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// ====== Step Indicator ======
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
            step < current
              ? 'bg-olive-600 text-white scale-90'
              : step === current
                ? 'bg-olive-600 text-white ring-4 ring-olive-200 dark:ring-olive-800'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          )}>
            {step < current ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < total && (
            <div className={cn('w-8 h-0.5 rounded-full transition-colors duration-300',
              step < current ? 'bg-olive-600' : 'bg-gray-200 dark:bg-gray-700')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ====== Main Component ======
export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const { success, error: showError } = useToast();

  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [showPassword, setShowPassword] = useState(false);

  const totalSteps = 3;

  const form = useForm<CredentialsData>({
    resolver: zodResolver(credentialsSchema),
    mode: 'onTouched',
  });

  const watchPassword = form.watch('password', '');

  // ====== Submit ======
  const handleRegister = async (data: CredentialsData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      success('Conta criada!', 'Bem-vindo(a) ao OlieCare');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar conta';
      showError('Erro no cadastro', msg);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  // ====== Render ======
  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="p-5 sm:p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-9 h-9 bg-olive-600 rounded-xl flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-olive-800 dark:text-olive-300">OlieCare</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 pb-10">
        <div className="w-full max-w-lg">
          <StepIndicator current={step} total={totalSteps} />

          {/* ====== STEP 1: Profile Type ====== */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-olive-100 dark:bg-olive-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-olive-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Bem-vindo ao OlieCare
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Como você vai usar a plataforma?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setProfileType('parent'); goNext(); }}
                  className={cn(
                    'w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 group',
                    'hover:border-olive-500 hover:shadow-lg hover:shadow-olive-100 dark:hover:shadow-none',
                    profileType === 'parent'
                      ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-olive-100 dark:from-pink-900/30 dark:to-olive-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Heart className="w-7 h-7 text-olive-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Sou pai, mãe ou cuidador</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Quero acompanhar o desenvolvimento do meu bebê
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-olive-600 transition-colors flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => { setProfileType('professional'); goNext(); }}
                  className={cn(
                    'w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 group',
                    'hover:border-teal-500 hover:shadow-lg hover:shadow-teal-100 dark:hover:shadow-none',
                    profileType === 'professional'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Sou profissional de saúde</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Pediatra, obstetra ou especialista
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors flex-shrink-0" />
                </button>
              </div>

              <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-olive-600 dark:text-olive-400 hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </div>
          )}

          {/* ====== STEP 2: Credentials ====== */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profileType === 'professional' ? 'Crie sua conta profissional' : 'Crie sua conta'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Preencha seus dados para começar
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                <form onSubmit={form.handleSubmit((data) => { goNext(); })} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...form.register('fullName')}
                        type="text"
                        placeholder="Seu nome completo"
                        autoFocus
                        className={cn(
                          'w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                          form.formState.errors.fullName ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                        )}
                      />
                    </div>
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...form.register('email')}
                        type="email"
                        placeholder="seu@email.com"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                          form.formState.errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                        )}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...form.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        className={cn(
                          'w-full pl-10 pr-12 py-3 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                          form.formState.errors.password ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                        )}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordChecklist password={watchPassword} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...form.register('confirmPassword')}
                        type="password"
                        placeholder="Repita a senha"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent',
                          form.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-200 dark:border-gray-600'
                        )}
                      />
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 pt-1">
                    <input type="checkbox" id="terms" required
                      className="w-4 h-4 mt-0.5 text-olive-600 rounded border-gray-300 focus:ring-olive-500" />
                    <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Concordo com os{' '}
                      <Link to="/terms" className="text-olive-600 dark:text-olive-400 hover:underline">Termos de Uso</Link>
                      {' '}e{' '}
                      <Link to="/privacy" className="text-olive-600 dark:text-olive-400 hover:underline">Política de Privacidade</Link>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={goBack}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition font-medium">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <Button type="submit" fullWidth className="flex-1">
                      Continuar <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ====== STEP 3: Final - Confirm & Register ====== */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
                  profileType === 'professional'
                    ? 'bg-teal-100 dark:bg-teal-900/30'
                    : 'bg-olive-100 dark:bg-olive-900/30'
                )}>
                  {profileType === 'professional'
                    ? <Stethoscope className="w-8 h-8 text-teal-600" />
                    : <Heart className="w-8 h-8 text-olive-600" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Tudo pronto!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Confira seus dados e finalize o cadastro
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                {/* Summary */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      profileType === 'professional' ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-olive-100 dark:bg-olive-900/30'
                    )}>
                      {profileType === 'professional'
                        ? <Stethoscope className="w-5 h-5 text-teal-600" />
                        : <Heart className="w-5 h-5 text-olive-600" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Perfil</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profileType === 'professional' ? 'Profissional de Saúde' : 'Pai, Mãe ou Cuidador'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nome</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{form.getValues('fullName')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{form.getValues('email')}</p>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">O que vem a seguir</p>
                  <div className="space-y-2">
                    {profileType === 'parent' ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-olive-600 font-bold">1</span>
                          </div>
                          Cadastre seu bebê no painel
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-olive-600 font-bold">2</span>
                          </div>
                          Comece a registrar rotinas e marcos
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-olive-600 font-bold">3</span>
                          </div>
                          Convide familiares e profissionais
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-teal-600 font-bold">1</span>
                          </div>
                          Complete seu perfil profissional
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-teal-600 font-bold">2</span>
                          </div>
                          Aceite convites de famílias
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-teal-600 font-bold">3</span>
                          </div>
                          Acompanhe o desenvolvimento dos bebês
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={goBack}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition font-medium">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <Button
                    fullWidth
                    className="flex-1"
                    isLoading={isLoading}
                    onClick={() => form.handleSubmit(handleRegister)()}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Criar minha conta
                  </Button>
                </div>
              </div>

              <p className="text-center mt-6 text-xs text-gray-400 dark:text-gray-500">
                Ao criar sua conta, você concorda com nossos termos e pode cancelar quando quiser.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
