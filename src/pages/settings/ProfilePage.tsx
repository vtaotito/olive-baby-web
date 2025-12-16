// Olive Baby Web - Profile Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  Save,
  Camera,
  Lock,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../../components/ui';
import { formatCPF, formatPhone } from '../../lib/utils';
import { caregiverService } from '../../services/api';

const profileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user?.caregiver) {
      setValue('fullName', user.caregiver.fullName);
      setValue('phone', user.caregiver.phone || '');
      setValue('city', user.caregiver.city || '');
      setValue('state', user.caregiver.state || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await caregiverService.updateMe({
        fullName: data.fullName,
        phone: data.phone || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
      });
      
      if (response.success && response.data) {
        // Buscar dados atualizados do servidor para garantir sincronização
        const profileResponse = await caregiverService.getMe();
        if (profileResponse.success && profileResponse.data) {
          // Atualizar dados do usuário no store com dados do servidor
          const updatedUser = {
            ...user!,
            caregiver: {
              ...user!.caregiver!,
              ...profileResponse.data,
            },
          };
          setUser(updatedUser);
        } else {
          // Fallback: atualizar com dados do formulário
          const updatedUser = {
            ...user!,
            caregiver: {
              ...user!.caregiver!,
              fullName: data.fullName,
              phone: data.phone || user!.caregiver!.phone,
              city: data.city || user!.caregiver!.city,
              state: data.state || user!.caregiver!.state,
            },
          };
          setUser(updatedUser);
        }
        
        // Resetar formulário para marcar como não modificado
        setValue('fullName', data.fullName);
        setValue('phone', data.phone || '');
        setValue('city', data.city || '');
        setValue('state', data.state || '');
        
        success('Perfil atualizado!', 'Suas informações foram salvas');
      } else {
        throw new Error(response.message || 'Falha ao atualizar perfil');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call API to change password
      // await authService.changePassword(data);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Senha alterada!', 'Sua senha foi atualizada com sucesso');
      setShowPasswordModal(false);
      resetPassword();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    showError('Não disponível', 'Esta funcionalidade será implementada em breve');
    setShowDeleteModal(false);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-olive-600" />
            Meu Perfil
          </h1>
          <p className="text-gray-500">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardBody className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                name={user?.caregiver?.fullName || user?.email || 'User'}
                size="xl"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center text-white hover:bg-olive-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.caregiver?.fullName || 'Usuário'}
              </h3>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                CPF: {user?.caregiver?.cpf ? formatCPF(user.caregiver.cpf) : 'Não informado'}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader title="Informações Pessoais" />
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  leftIcon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  leftIcon={<Phone className="w-5 h-5" />}
                  {...register('phone')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  placeholder="Sua cidade"
                  leftIcon={<MapPin className="w-5 h-5" />}
                  {...register('city')}
                />
                <Input
                  label="Estado"
                  placeholder="UF"
                  maxLength={2}
                  {...register('state')}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!isDirty}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader title="Segurança" />
          <CardBody className="space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
              </div>
            </button>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader title="Zona de Perigo" />
          <CardBody>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-700">Excluir Conta</h4>
                <p className="text-sm text-red-500">Esta ação é irreversível</p>
              </div>
            </button>
          </CardBody>
        </Card>
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Alterar Senha"
      >
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="Nova senha"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Alterar Senha
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Conta"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong> e
            todos os seus dados serão permanentemente removidos.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              fullWidth
            >
              Excluir Conta
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
