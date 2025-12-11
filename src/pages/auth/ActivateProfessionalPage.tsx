// Olive Baby Web - Activate Professional Account Page
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stethoscope,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { AuthLayout } from '../../components/layout';
import { Button, Input, Card, CardBody } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { professionalService } from '../../services/api';

interface ProfessionalInfo {
  email: string;
  fullName: string;
  specialty: string;
}

const activateSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type ActivateFormData = z.infer<typeof activateSchema>;

export function ActivateProfessionalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { success, error: showError } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
  });

  // Verify token on mount
  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    try {
      const response = await professionalService.verifyToken(token);
      setProfessionalInfo(response.data);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: ActivateFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await professionalService.activate({
        token,
        password: data.password,
        phone: data.phone,
        city: data.city,
        state: data.state,
      });

      setIsActivated(true);
      success('Conta ativada!', 'Você já pode fazer login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showError('Erro', error.response?.data?.message || 'Não foi possível ativar sua conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <AuthLayout
        title="Verificando convite..."
        subtitle="Aguarde enquanto validamos seu convite"
      >
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-olive-600 animate-spin mb-4" />
          <p className="text-gray-500">Verificando token...</p>
        </div>
      </AuthLayout>
    );
  }

  // Invalid token
  if (!token || !isValid) {
    return (
      <AuthLayout
        title="Convite inválido"
        subtitle="Este link de convite não é válido ou expirou"
      >
        <Card className="border-red-200">
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Link inválido ou expirado
            </h3>
            <p className="text-gray-500 mb-6">
              O convite pode ter expirado ou já foi utilizado. 
              Entre em contato com quem lhe enviou o convite para solicitar um novo.
            </p>
            <Button onClick={() => navigate('/login')}>
              Ir para Login
            </Button>
          </CardBody>
        </Card>
      </AuthLayout>
    );
  }

  // Success state
  if (isActivated) {
    return (
      <AuthLayout
        title="Conta ativada!"
        subtitle="Sua conta foi criada com sucesso"
      >
        <Card className="border-green-200">
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bem-vindo(a), {professionalInfo?.fullName}!
            </h3>
            <p className="text-gray-500 mb-6">
              Sua conta foi ativada com sucesso. Agora você pode fazer login 
              e acompanhar o desenvolvimento dos bebês vinculados a você.
            </p>
            <Button onClick={() => navigate('/login')} fullWidth>
              Fazer Login
            </Button>
          </CardBody>
        </Card>
      </AuthLayout>
    );
  }

  // Activation form
  return (
    <AuthLayout
      title="Ative sua conta"
      subtitle="Complete seu cadastro para acessar o Olive Baby"
    >
      <Card>
        <CardBody>
          {/* Professional Info */}
          <div className="bg-olive-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-olive-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{professionalInfo?.fullName}</h3>
                <p className="text-sm text-olive-600">{professionalInfo?.specialty}</p>
                <p className="text-sm text-gray-500">{professionalInfo?.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Digite a senha novamente"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Input
              label="Telefone (opcional)"
              placeholder="(11) 99999-9999"
              leftIcon={<Phone className="w-5 h-5" />}
              {...register('phone')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cidade (opcional)"
                placeholder="São Paulo"
                leftIcon={<MapPin className="w-5 h-5" />}
                {...register('city')}
              />
              <Input
                label="Estado"
                placeholder="SP"
                maxLength={2}
                {...register('state')}
              />
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Ativar Conta
            </Button>
          </form>
        </CardBody>
      </Card>
    </AuthLayout>
  );
}
