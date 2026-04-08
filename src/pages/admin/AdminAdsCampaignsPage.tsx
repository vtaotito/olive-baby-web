// OlieCare Admin - Google Ads Campaigns Detail Page
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Play,
  Pause,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { SkeletonCard } from '../../components/admin';
import { adsService } from '../../services/adsApi';
import { cn } from '../../lib/utils';
import type { AdsCampaign, CreateCampaignPayload } from '../../types/ads';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    ENABLED: { label: 'Ativa', cls: 'bg-emerald-100 text-emerald-700' },
    PAUSED: { label: 'Pausada', cls: 'bg-amber-100 text-amber-700' },
    REMOVED: { label: 'Removida', cls: 'bg-gray-100 text-gray-500' },
  };
  const c = config[status] || config.REMOVED;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', c.cls)}>
      {status === 'ENABLED' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

function CreateCampaignModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateCampaignPayload>({ name: '', budget: 50 });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => adsService.createCampaign(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-campaigns'] });
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Nova Campanha</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: OlieCare - Rotina Bebê"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento Diário (R$)</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm(p => ({ ...p, budget: Number(e.target.value) }))}
              min={1}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início (opcional)</label>
            <input
              type="date"
              value={form.startDate || ''}
              onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.name || mutation.isPending}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              !form.name || mutation.isPending
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-olive-600 text-white hover:bg-olive-700'
            )}
          >
            {mutation.isPending ? 'Criando...' : 'Criar Campanha'}
          </button>
        </div>

        {mutation.isError && (
          <p className="mt-3 text-sm text-rose-600 text-center">
            Erro ao criar campanha. Verifique as credenciais.
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminAdsCampaignsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ENABLED' | 'PAUSED'>('all');

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['ads-campaigns'],
    queryFn: () => adsService.listCampaigns(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adsService.updateCampaignStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads-campaigns'] }),
  });

  const filtered = (campaigns || [])
    .filter((c: AdsCampaign) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c: AdsCampaign) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title="Campanhas Google Ads"
      subtitle="Gerencie todas as campanhas da OlieCare"
    >
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/ads')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-olive-600 text-white rounded-xl text-sm font-medium hover:bg-olive-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Campanha
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar campanha..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
          />
        </div>
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {(['all', 'ENABLED', 'PAUSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                statusFilter === s
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {s === 'all' ? 'Todas' : s === 'ENABLED' ? 'Ativas' : 'Pausadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((c: AdsCampaign) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                {/* Campaign Header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="p-2.5 bg-sky-100 rounded-xl flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Orçamento: R$ {c.dailyBudget}/dia | Tipo: {c.type}
                    </p>
                  </div>

                  {/* Quick Metrics */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{c.metrics.clicks}</p>
                      <p className="text-xs text-gray-500">Cliques</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{c.metrics.ctr}</p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{c.metrics.cost}</p>
                      <p className="text-xs text-gray-500">Gasto</p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointerClick className="w-4 h-4 text-sky-500" />
                          <span className="text-xs text-gray-500">Cliques</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.metrics.clicks}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-violet-500" />
                          <span className="text-xs text-gray-500">Impressões</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.metrics.impressions?.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-gray-500">CTR</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.metrics.ctr}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-gray-500">CPC Médio</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.metrics.avgCpc}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-rose-500" />
                          <span className="text-xs text-gray-500">Gasto Total</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{c.metrics.cost}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {c.status === 'ENABLED' ? (
                        <button
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'PAUSED' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                        >
                          <Pause className="w-4 h-4" /> Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'ENABLED' })}
                          disabled={statusMutation.isPending}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          <Play className="w-4 h-4" /> Ativar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-200">
          <Megaphone className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">Nenhuma campanha encontrada</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Tente outra busca' : 'Crie sua primeira campanha para começar'}
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => refetch()}
        />
      )}
    </AdminLayout>
  );
}
