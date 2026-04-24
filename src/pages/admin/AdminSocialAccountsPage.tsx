import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminSocialService } from '../../services/socialApi';
import { cn } from '../../lib/utils';
import type { SocialPlatform, SocialAccount } from '../../types/social';
import { PLATFORM_CONFIG } from '../../types/social';

const ALL_PLATFORMS: SocialPlatform[] = ['INSTAGRAM', 'LINKEDIN', 'FACEBOOK', 'TWITTER', 'THREADS', 'TIKTOK', 'YOUTUBE', 'BLUESKY'];

export function AdminSocialAccountsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [newName, setNewName] = useState('');
  const [newAccountId, setNewAccountId] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['admin-social-accounts'],
    queryFn: () => adminSocialService.listAccounts(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { platform: string; accountName: string; accountId: string }) =>
      adminSocialService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] });
      setShowForm(false);
      setNewName('');
      setNewAccountId('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSocialService.deleteAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-social-accounts'] }),
  });

  const testMutation = useMutation({
    mutationFn: (id: number) => adminSocialService.testAccount(id),
  });

  const accounts = accountsData?.data || [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/social')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Contas Conectadas</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} leftIcon={<Plus className="w-4 h-4" />}>
          Conectar Conta
        </Button>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nova Conexão</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
              <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200">
                {ALL_PLATFORMS.map(p => {
                  const cfg = PLATFORM_CONFIG[p];
                  return <option key={p} value={p}>{cfg.icon} {cfg.label}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: @oliecare" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Conta / Publora Platform ID</label>
              <input type="text" value={newAccountId} onChange={(e) => setNewAccountId(e.target.value)}
                placeholder="ID externo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" disabled={!newName.trim() || !newAccountId.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate({ platform: newPlatform, accountName: newName.trim(), accountId: newAccountId.trim() })}>
              Conectar
            </Button>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account: SocialAccount) => {
          const cfg = PLATFORM_CONFIG[account.platform];
          return (
            <div key={account.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', cfg?.color)}>
                    {cfg?.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{account.accountName}</p>
                    <p className="text-xs text-gray-500">{cfg?.label}</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                  account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                  {account.isActive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {account.isActive ? 'Ativo' : 'Inativo'}
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p>ID: {account.accountId}</p>
                <p>Conectado: {new Date(account.connectedAt).toLocaleDateString('pt-BR')}</p>
                {account.lastPublishedAt && (
                  <p>Último post: {new Date(account.lastPublishedAt).toLocaleDateString('pt-BR')}</p>
                )}
                <p>Posts: {account._count?.posts || 0}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1"
                  onClick={() => testMutation.mutate(account.id)}
                  disabled={testMutation.isPending}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Testar
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                  onClick={() => { if (confirm(`Desconectar ${account.accountName}?`)) deleteMutation.mutate(account.id); }}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Remover
                </Button>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 mb-3">Nenhuma conta conectada</p>
            <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Conectar primeira conta
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminSocialAccountsPage;
