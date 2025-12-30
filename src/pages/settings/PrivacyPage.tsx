// Olive Baby Web - Privacy & Security Settings Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronLeft,
  Lock,
  Eye,
  Download,
  Trash2,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Modal, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/api';
import { storage } from '../../lib/utils';

export function PrivacyPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    // TODO: Implement data export functionality
    success('Exportação iniciada', 'Seus dados serão enviados por email em breve');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showError('Erro', 'Digite sua senha para confirmar a exclusão');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await authService.deleteAccount(deletePassword);
      
      if (response.success) {
        storage.remove('auth_tokens');
        storage.remove('user');
        
        success('Conta excluída', 'Sua conta foi excluída com sucesso');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        throw new Error(response.message || 'Falha ao excluir conta');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao excluir conta');
    } finally {
      setIsDeleting(false);
      setDeletePassword('');
    }
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
            <Shield className="w-6 h-6 text-olive-600" />
            Privacidade e Segurança
          </h1>
          <p className="text-gray-500">Gerencie seus dados e segurança</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Security Options */}
        <Card>
          <CardHeader title="Segurança da Conta" />
          <CardBody className="space-y-4">
            <button
              onClick={() => navigate('/settings/profile')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Autenticação</h4>
                <p className="text-sm text-gray-500">Email: {user?.email}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Ativo
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader title="Gerenciamento de Dados" />
          <CardBody className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Exportar Meus Dados</h4>
                <p className="text-sm text-gray-500">Baixe uma cópia de todos os seus dados</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/export')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-olive-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Exportar Relatórios</h4>
                <p className="text-sm text-gray-500">Exporte rotinas, crescimento e marcos</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </CardBody>
        </Card>

        {/* Legal Links */}
        <Card>
          <CardHeader title="Documentos Legais" />
          <CardBody className="space-y-3">
            <a
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Termos de Uso</h4>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Política de Privacidade</h4>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader 
            title="Zona de Perigo" 
            subtitle="Ações irreversíveis"
          />
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
                <p className="text-sm text-red-500">Remover permanentemente sua conta e dados</p>
              </div>
            </button>
          </CardBody>
        </Card>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
        }}
        title="Excluir Conta"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">
                Esta ação é irreversível!
              </p>
              <p className="text-red-600 text-sm mt-1">
                Todos os seus dados, incluindo bebês cadastrados e histórico de rotinas, 
                serão permanentemente removidos.
              </p>
            </div>
          </div>
          
          <p className="text-gray-600">
            Para confirmar a exclusão, digite sua senha abaixo:
          </p>
          
          <Input
            label="Sua senha"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Digite sua senha para confirmar"
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword('');
              }}
              fullWidth
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              fullWidth
              isLoading={isDeleting}
              disabled={!deletePassword}
            >
              Excluir Minha Conta
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

