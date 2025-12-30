// Olive Baby Web - Privacy & Security Settings Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  FileText,
  ExternalLink,
  AlertTriangle,
  Smartphone,
  Key,
  Database,
  ShieldCheck,
  Users,
  History,
  CheckCircle,
  Info,
  ChevronRight,
  Globe,
  Fingerprint,
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
  const [isExporting, setIsExporting] = useState(false);

  // Privacy toggles state
  const [privacySettings, setPrivacySettings] = useState({
    shareWithProfessionals: true,
    allowAnalytics: true,
    receiveInsights: true,
  });

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual data export API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated delay
      success('Exportação iniciada! 📬', 'Seus dados serão enviados para seu email em até 24 horas');
    } catch (err) {
      showError('Ops!', 'Não conseguimos iniciar a exportação. Tente novamente?');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showError('Atenção', 'Digite sua senha para confirmar a exclusão');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await authService.deleteAccount(deletePassword);
      
      if (response.success) {
        storage.remove('auth_tokens');
        storage.remove('user');
        
        success('Conta excluída', 'Sua conta foi excluída com sucesso. Sentiremos sua falta! 💚');
        
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

  const handleTogglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    success('Preferência salva', 'Sua configuração foi atualizada');
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
          <p className="text-gray-500">Seus dados estão seguros conosco 💚</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* How We Protect Your Data */}
        <Card className="bg-gradient-to-br from-olive-50 to-white border-olive-200">
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-olive-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-olive-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Como protegemos seus dados
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No Olive Baby, a segurança da sua família é nossa prioridade. 
                  Utilizamos criptografia de ponta a ponta, armazenamento seguro em nuvem 
                  e nunca compartilhamos seus dados com terceiros sem seu consentimento.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-olive-100 text-olive-700 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Criptografia AES-256
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-olive-100 text-olive-700 px-2.5 py-1 rounded-full">
                    <Database className="w-3 h-3" /> Backup Automático
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-olive-100 text-olive-700 px-2.5 py-1 rounded-full">
                    <Globe className="w-3 h-3" /> LGPD Compliant
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security Options */}
        <Card>
          <CardHeader 
            title="Segurança da Conta" 
            subtitle="Mantenha sua conta protegida"
          />
          <CardBody className="space-y-3">
            <button
              onClick={() => navigate('/settings/profile')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <p className="text-sm text-gray-500">Atualize sua senha de acesso regularmente</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Autenticação</h4>
                <p className="text-sm text-gray-500">Email: {user?.email}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                ✓ Verificado
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Sessão Atual</h4>
                <p className="text-sm text-gray-500">Este dispositivo • Ativo agora</p>
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </CardBody>
        </Card>

        {/* Privacy Controls */}
        <Card>
          <CardHeader 
            title="Controles de Privacidade" 
            subtitle="Você decide como seus dados são usados"
          />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Compartilhar com profissionais</h4>
                  <p className="text-sm text-gray-500">Pediatras podem ver dados do bebê</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePrivacy('shareWithProfessionals')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.shareWithProfessionals ? 'bg-olive-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    privacySettings.shareWithProfessionals ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Analytics anônimos</h4>
                  <p className="text-sm text-gray-500">Ajuda a melhorar o aplicativo</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePrivacy('allowAnalytics')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.allowAnalytics ? 'bg-olive-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    privacySettings.allowAnalytics ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center">
                  {privacySettings.receiveInsights ? (
                    <Eye className="w-5 h-5 text-olive-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-olive-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Insights personalizados</h4>
                  <p className="text-sm text-gray-500">Dicas baseadas nos dados do bebê</p>
                </div>
              </div>
              <button
                onClick={() => handleTogglePrivacy('receiveInsights')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacySettings.receiveInsights ? 'bg-olive-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    privacySettings.receiveInsights ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader 
            title="Seus Dados" 
            subtitle="Baixe ou exporte suas informações"
          />
          <CardBody className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Exportar Todos os Dados</h4>
                <p className="text-sm text-gray-500">Receba uma cópia completa por email (JSON)</p>
              </div>
              {isExporting && (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={() => navigate('/export')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-olive-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Exportar Relatórios</h4>
                <p className="text-sm text-gray-500">Rotinas, crescimento e marcos em PDF/CSV</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Direito à portabilidade:</strong> Conforme a LGPD, você pode solicitar 
                    todos os seus dados a qualquer momento. O processamento leva até 24 horas.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Legal Links */}
        <Card>
          <CardHeader 
            title="Documentos Legais" 
            subtitle="Transparência é importante para nós"
          />
          <CardBody className="space-y-3">
            <a
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Termos de Uso</h4>
                <p className="text-sm text-gray-500">Condições de utilização do serviço</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>

            <a
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Política de Privacidade</h4>
                <p className="text-sm text-gray-500">Como coletamos e usamos seus dados</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>

            <a
              href="/politica-de-cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Política de Cookies</h4>
                <p className="text-sm text-gray-500">Informações sobre cookies e rastreamento</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader 
            title="Zona de Perigo" 
            subtitle="Cuidado! Estas ações são irreversíveis"
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
                <h4 className="font-medium text-red-700">Excluir Minha Conta</h4>
                <p className="text-sm text-red-500">Remover permanentemente sua conta e todos os dados</p>
              </div>
            </button>
          </CardBody>
        </Card>

        {/* Support Note */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Dúvidas sobre privacidade?{' '}
            <button 
              onClick={() => navigate('/settings/help')}
              className="text-olive-600 hover:text-olive-700 font-medium"
            >
              Fale com nosso suporte
            </button>
          </p>
        </div>
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
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-medium">
                Esta ação é irreversível!
              </p>
              <p className="text-red-600 text-sm mt-1">
                Ao excluir sua conta, você perderá permanentemente:
              </p>
              <ul className="text-red-600 text-sm mt-2 space-y-1">
                <li>• Todos os bebês cadastrados</li>
                <li>• Histórico completo de rotinas</li>
                <li>• Dados de crescimento e marcos</li>
                <li>• Conversas com o assistente</li>
              </ul>
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
