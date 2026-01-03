// Olive Baby Web - Admin Monetization Page (Paywall + Upgrade Candidates + Revenue Simulation)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Crown,
  TrendingUp,
  AlertTriangle,
  Target,
  Star,
  ChevronRight,
  Calculator,
  Eye,
  Zap,
  Users,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { AdminLayout } from '../../components/layout';
import {
  RangePicker,
  ChartCard,
  KpiCard,
  ReasonList,
  UserProfileDrawer,
  SkeletonCard,
  SkeletonList,
  InfoLabel,
} from '../../components/admin';
import { adminService } from '../../services/adminApi';
import { Spinner, Button } from '../../components/ui';
import { cn } from '../../lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Premium price (would come from config in production)
const PREMIUM_PRICE = 39.90;

export function AdminMonetizationPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [conversionRate, setConversionRate] = useState(10); // Simulated conversion rate

  // Fetch paywall analytics
  const { data: paywallData, isLoading: paywallLoading } = useQuery({
    queryKey: ['admin-paywall', range],
    queryFn: () => adminService.getPaywallAnalytics(range),
  });

  // Fetch upgrade candidates
  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ['admin-upgrade-candidates'],
    queryFn: () => adminService.getUpgradeCandidates(),
  });

  // Fetch metrics for context
  const { data: metricsData } = useQuery({
    queryKey: ['admin-metrics', range],
    queryFn: () => adminService.getMetrics(range),
  });

  const paywall = paywallData?.data;
  const candidates = candidatesData?.data || [];
  const metrics = metricsData?.data;

  // Total paywall hits
  const totalPaywallHits = paywall
    ? Object.values(paywall.hitsByFeature).reduce((sum, count) => sum + count, 0)
    : 0;

  // Calculate potential revenue
  const potentialConversions = Math.floor(candidates.length * (conversionRate / 100));
  const potentialRevenue = potentialConversions * PREMIUM_PRICE;

  // Current premium revenue (simulated)
  const currentPremiumRevenue = (metrics?.premiumUsers || 0) * PREMIUM_PRICE;

  // Paywall hits by feature chart
  const paywallByFeatureData = {
    labels: paywall ? Object.keys(paywall.hitsByFeature).map(f => f.replace(/_/g, ' ')) : [],
    datasets: [
      {
        label: 'Paywall Hits',
        data: paywall ? Object.values(paywall.hitsByFeature) : [],
        backgroundColor: [
          'rgba(101, 123, 73, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  // Paywall hits timeline chart
  const paywallTimelineData = {
    labels: paywall?.hitsTimeline.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }) || [],
    datasets: [
      {
        label: 'Paywall Hits',
        data: paywall?.hitsTimeline.map(d => d.count) || [],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: 'rgba(229, 231, 235, 0.5)' },
        ticks: { color: 'rgba(107, 114, 128, 1)' },
      },
      y: {
        grid: { color: 'rgba(229, 231, 235, 0.5)' },
        ticks: { color: 'rgba(107, 114, 128, 1)' },
      },
    },
  };

  // Get score color and label
  const getScoreInfo = (score: number) => {
    if (score >= 150) return { color: 'bg-emerald-500', label: 'Alto', textColor: 'text-emerald-700' };
    if (score >= 100) return { color: 'bg-amber-500', label: 'Médio', textColor: 'text-amber-700' };
    return { color: 'bg-gray-400', label: 'Baixo', textColor: 'text-gray-600' };
  };

  return (
    <AdminLayout
      title="Monetização"
      subtitle="Acompanhe paywall, conversões e potencial de receita"
    >
      {/* Range Selector */}
      <div className="flex justify-end mb-6">
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
      </div>

      {/* === BLOCO 1: Paywall Performance === */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Performance do Paywall
        </h2>
        
        {paywallLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Total Paywall Hits"
                value={totalPaywallHits}
                subtitle={`Nos últimos ${range === '7d' ? '7' : '30'} dias`}
                icon={<AlertTriangle className="w-6 h-6" />}
                color="amber"
              />
              <KpiCard
                title="Features Bloqueadas"
                value={paywall ? Object.keys(paywall.hitsByFeature).length : 0}
                icon={<Target className="w-6 h-6" />}
                color="rose"
              />
              <KpiCard
                title="Taxa Média de Conversão"
                value={paywall?.conversionByFeature 
                  ? `${(Object.values(paywall.conversionByFeature).reduce((sum, f) => sum + f.rate, 0) / Object.keys(paywall.conversionByFeature).length).toFixed(1)}%`
                  : '0%'
                }
                icon={<TrendingUp className="w-6 h-6" />}
                color="olive"
              />
              <KpiCard
                title="Hits/Usuário Free"
                value={metrics?.freeUsers 
                  ? (totalPaywallHits / metrics.freeUsers).toFixed(1)
                  : '0'
                }
                icon={<Users className="w-6 h-6" />}
                color="sky"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Paywall Hits por Feature"
                subtitle="Quais features mais geram interesse"
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                isLoading={paywallLoading}
              >
                <Bar data={paywallByFeatureData} options={chartOptions} />
              </ChartCard>

              <ChartCard
                title="Paywall Hits - Timeline"
                subtitle="Evolução ao longo do tempo"
                icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
                isLoading={paywallLoading}
              >
                <Line data={paywallTimelineData} options={chartOptions} />
              </ChartCard>
            </div>

            {/* Conversion by Feature */}
            {paywall && Object.keys(paywall.conversionByFeature).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Conversão por Feature
                  </h3>
                  <InfoLabel label="" tooltip="Taxa de conversão = usuários que assinaram após hit no paywall" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(paywall.conversionByFeature)
                    .sort((a, b) => b[1].rate - a[1].rate)
                    .map(([feature, data]) => (
                    <div key={feature} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                        {feature.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={cn(
                          'text-2xl font-bold',
                          data.rate >= 10 ? 'text-emerald-600' : data.rate >= 5 ? 'text-amber-600' : 'text-gray-600'
                        )}>
                          {data.rate}%
                        </span>
                        <span className="text-sm text-gray-500">
                          ({data.conversions}/{data.hits})
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            data.rate >= 10 ? 'bg-emerald-500' : data.rate >= 5 ? 'bg-amber-500' : 'bg-gray-400'
                          )}
                          style={{ width: `${Math.min(data.rate * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* === BLOCO 2: Upgrade Candidates === */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Candidatos a Upgrade
        </h2>
        
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-olive-600" />
                  Usuários com Alto Potencial
                </h3>
                <p className="text-sm text-gray-500">
                  {candidates.length} usuários identificados baseado em uso e paywall hits
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Alto ({candidates.filter(c => c.score >= 150).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Médio ({candidates.filter(c => c.score >= 100 && c.score < 150).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-600">Baixo ({candidates.filter(c => c.score < 100).length})</span>
                </div>
              </div>
            </div>
          </div>

          {candidatesLoading ? (
            <div className="p-6">
              <SkeletonList items={5} />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {candidates.slice(0, 15).map((candidate) => {
                const scoreInfo = getScoreInfo(candidate.score);
                return (
                  <div
                    key={candidate.userId}
                    onClick={() => setSelectedUserId(candidate.userId)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Score Badge */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg',
                          scoreInfo.color
                        )}>
                          {candidate.score}
                        </div>
                        <span className={cn('text-xs mt-1 font-medium', scoreInfo.textColor)}>
                          {scoreInfo.label}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <span className="text-xs text-gray-400">#{candidate.userId}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{candidate.email}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            <Users className="w-3 h-3" />
                            {candidate.babiesCount} bebê(s)
                          </span>
                          <span className="flex items-center gap-1 text-olive-600 bg-olive-50 px-2 py-0.5 rounded-full">
                            <Zap className="w-3 h-3" />
                            {candidate.routinesCountRange} rotinas
                          </span>
                          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            {candidate.paywallHitsRange} hits
                          </span>
                        </div>

                        {/* Reasons */}
                        <div className="mt-2">
                          <ReasonList reasons={candidate.reasons} variant="info" />
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Ver perfil
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {candidates.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum upgrade candidate encontrado</p>
                  <p className="text-sm mt-1">Aguarde mais usuários atingirem os critérios</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* === BLOCO 3: Receita Simulada === */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Simulação de Receita
        </h2>
        
        <div className="bg-gradient-to-br from-olive-50 to-emerald-50 border border-olive-200 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-olive-100 rounded-xl">
              <Calculator className="w-6 h-6 text-olive-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Potencial de Receita
              </h3>
              <p className="text-sm text-gray-600">
                Baseado nos {candidates.length} upgrade candidates identificados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current Revenue */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Receita Atual</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {currentPremiumRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics?.premiumUsers || 0} assinantes × R$ {PREMIUM_PRICE.toFixed(2)}
              </p>
            </div>

            {/* Conversion Rate Slider */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Taxa de Conversão</p>
                <span className="text-lg font-bold text-olive-600">{conversionRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-olive-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Potential Revenue */}
            <div className="bg-olive-100 rounded-xl p-4 border border-olive-200">
              <p className="text-sm text-olive-700 mb-1">Receita Potencial Adicional</p>
              <p className="text-3xl font-bold text-olive-800">
                +R$ {potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-olive-600 mt-1">
                {potentialConversions} conversões estimadas
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/80 rounded-xl p-4 border border-olive-200">
            <p className="text-gray-700">
              <strong className="text-olive-700">Resumo:</strong> Se {conversionRate}% dos {candidates.length} upgrade candidates converterem, 
              a receita mensal aumentaria de{' '}
              <strong>R$ {currentPremiumRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> para{' '}
              <strong className="text-olive-700">
                R$ {(currentPremiumRevenue + potentialRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              <span className="text-emerald-600">
                (+{((potentialRevenue / (currentPremiumRevenue || 1)) * 100).toFixed(0)}%)
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* User Profile Drawer */}
      <UserProfileDrawer
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </AdminLayout>
  );
}
