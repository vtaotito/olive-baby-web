// OlieCare Admin - Google Ads Dashboard
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  MousePointerClick,
  Eye,
  DollarSign,
  Target,
  TrendingUp,
  Bot,
  BarChart3,
  Play,
  Pause,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { AdminLayout } from '../../components/layout';
import { KpiCard, RangePicker, SkeletonCard } from '../../components/admin';
import { adsService } from '../../services/adsApi';
import { cn } from '../../lib/utils';
import type { AdsCampaign } from '../../types/ads';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

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

export function AdminAdsPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const days = range === '7d' ? 7 : 30;

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['ads-overview', days],
    queryFn: () => adsService.getOverview(days),
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['ads-campaigns'],
    queryFn: () => adsService.listCampaigns(),
  });

  const { data: agentResult, isLoading: agentLoading, refetch: refetchAgent } = useQuery({
    queryKey: ['ads-agent-analysis'],
    queryFn: async () => {
      const res = await adsService.analyzeOnly();
      return res.analysis;
    },
    enabled: false,
  });

  const activeCampaigns = campaigns?.filter((c: AdsCampaign) => c.status === 'ENABLED') || [];
  const pausedCampaigns = campaigns?.filter((c: AdsCampaign) => c.status === 'PAUSED') || [];

  const campaignStatusData = {
    labels: ['Ativas', 'Pausadas'],
    datasets: [{
      data: [activeCampaigns.length, pausedCampaigns.length],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.7)'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '70%',
  };

  return (
    <AdminLayout
      title="Google Ads"
      subtitle="Gerencie campanhas e monitore performance com IA"
    >
      {/* Range + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/ads/agent')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-200"
          >
            <Bot className="w-4 h-4" />
            Agente IA
          </button>
          <button
            onClick={() => navigate('/admin/ads/campaigns')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-olive-600 text-white rounded-xl text-sm font-medium hover:bg-olive-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Campanhas
          </button>
        </div>
      </div>

      {/* KPIs */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Visão Geral da Conta
        </h2>
        {overviewLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Cliques"
              value={overview?.clicks?.toLocaleString('pt-BR') || '0'}
              subtitle={overview?.period}
              icon={<MousePointerClick className="w-6 h-6" />}
              color="sky"
            />
            <KpiCard
              title="Impressões"
              value={overview?.impressions?.toLocaleString('pt-BR') || '0'}
              subtitle={`CTR: ${overview?.ctr || '0%'}`}
              icon={<Eye className="w-6 h-6" />}
              color="violet"
            />
            <KpiCard
              title="Custo Total"
              value={overview?.totalCost || 'R$ 0,00'}
              subtitle={`CPC Médio: ${overview?.avgCpc || 'R$ 0,00'}`}
              icon={<DollarSign className="w-6 h-6" />}
              color="amber"
            />
            <KpiCard
              title="Conversões"
              value={overview?.conversions || 0}
              subtitle={`CPA: ${overview?.costPerConversion || 'N/A'}`}
              icon={<Target className="w-6 h-6" />}
              color="emerald"
            />
          </div>
        )}
      </section>

      {/* Charts + Campaign Status */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Distribution */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Campanhas</h3>
            <div className="h-48 relative">
              {campaignsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : (
                <>
                  <Doughnut data={campaignStatusData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{campaigns?.length || 0}</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Ativas: {activeCampaigns.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600">Pausadas: {pausedCampaigns.length}</span>
              </div>
            </div>
          </div>

          {/* Top Campaigns Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Campanhas</h3>
              <button
                onClick={() => navigate('/admin/ads/campaigns')}
                className="text-sm text-olive-600 hover:text-olive-700 font-medium flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {campaignsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-2">
                {campaigns.slice(0, 5).map((c: AdsCampaign) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/ads/campaigns')}
                  >
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <Megaphone className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.metrics.cost} gasto | {c.metrics.clicks} cliques</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={c.status} />
                      <p className="text-xs text-gray-500 mt-1">CTR {c.metrics.ctr}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma campanha encontrada</p>
                <p className="text-sm text-gray-400 mt-1">Configure as credenciais do Google Ads para começar</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Agent Quick Analysis */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Análise IA Rápida
        </h2>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Agente de Otimização</h3>
                <p className="text-sm text-gray-500">Claude analisa suas campanhas e sugere ações</p>
              </div>
            </div>
            <button
              onClick={() => refetchAgent()}
              disabled={agentLoading}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                agentLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200'
              )}
            >
              {agentLoading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <><Bot className="w-4 h-4" /> Analisar Agora</>
              )}
            </button>
          </div>

          {agentResult ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-white/80 rounded-xl p-4 border border-violet-100">
                <p className="text-sm font-medium text-violet-800">{agentResult.summary}</p>
              </div>

              {/* Insights */}
              {agentResult.insights?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agentResult.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-violet-100">
                      <TrendingUp className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions count */}
              {agentResult.actions?.length > 0 && (
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-4 border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{agentResult.actions.length} ações recomendadas</span>
                    {' — '}
                    <button
                      onClick={() => navigate('/admin/ads/agent')}
                      className="text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Ver e executar no painel do agente
                    </button>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                Clique em "Analisar Agora" para receber insights e sugestões de otimização
              </p>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
