// Olive Baby Web - Admin Monetization Page (Paywall + Upgrade Candidates)
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
import { RangePicker, ChartCard, KpiCard, ReasonList } from '../../components/admin';
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

export function AdminMonetizationPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');

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

  const paywall = paywallData?.data;
  const candidates = candidatesData?.data || [];

  // Total paywall hits
  const totalPaywallHits = paywall
    ? Object.values(paywall.hitsByFeature).reduce((sum, count) => sum + count, 0)
    : 0;

  // Paywall hits by feature chart
  const paywallByFeatureData = {
    labels: paywall ? Object.keys(paywall.hitsByFeature).map(f => f.replace(/_/g, ' ')) : [],
    datasets: [
      {
        label: 'Paywall Hits',
        data: paywall ? Object.values(paywall.hitsByFeature) : [],
        backgroundColor: 'rgba(101, 123, 73, 0.8)',
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

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 150) return 'bg-emerald-500';
    if (score >= 100) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <AdminLayout title="Monetização">
      {/* Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Paywall Analytics</h2>
          <p className="text-sm text-gray-500">Acompanhe o funil de conversão premium</p>
        </div>
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Paywall Hits"
          value={totalPaywallHits}
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
          title="Upgrade Candidates"
          value={candidates.length}
          icon={<Crown className="w-6 h-6" />}
          color="olive"
        />
        <KpiCard
          title="Top Score"
          value={candidates[0]?.score || 0}
          icon={<Star className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Paywall Hits por Feature"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          isLoading={paywallLoading}
        >
          <Bar data={paywallByFeatureData} options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="Paywall Hits - Timeline"
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          isLoading={paywallLoading}
        >
          <Line data={paywallTimelineData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Conversion by Feature */}
      {paywall && Object.keys(paywall.conversionByFeature).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conversão por Feature
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(paywall.conversionByFeature).map(([feature, data]) => (
              <div key={feature} className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                  {feature.replace(/_/g, ' ')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{data.rate}%</span>
                  <span className="text-sm text-gray-500">
                    ({data.conversions}/{data.hits})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Candidates */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-olive-600" />
                Upgrade Candidates
              </h3>
              <p className="text-sm text-gray-500">Usuários com maior potencial de conversão</p>
            </div>
          </div>
        </div>

        {candidatesLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {candidates.slice(0, 15).map((candidate) => (
              <div key={candidate.userId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Score Badge */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold',
                    getScoreColor(candidate.score)
                  )}>
                    {candidate.score}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{candidate.name}</p>
                      <span className="text-xs text-gray-400">#{candidate.userId}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{candidate.email}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{candidate.babiesCount} bebê(s)</span>
                      <span>{candidate.routinesCountRange} rotinas/30d</span>
                      <span>{candidate.paywallHitsRange} paywall hits</span>
                    </div>

                    {/* Reasons */}
                    <div className="mt-2">
                      <ReasonList reasons={candidate.reasons} variant="info" />
                    </div>
                  </div>

                  {/* Action */}
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {candidates.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                Nenhum upgrade candidate encontrado
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

