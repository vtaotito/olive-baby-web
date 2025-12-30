// Olive Baby Web - Admin Dashboard Page
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Baby,
  Activity,
  TrendingUp,
  Crown,
  Zap,
  AlertTriangle,
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AdminLayout } from '../../components/layout';
import { adminService } from '../../services/adminApi';
import { Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'amber' | 'emerald' | 'sky' | 'violet' | 'rose';
}

function KpiCard({ title, value, subtitle, icon, trend, color = 'amber' }: KpiCardProps) {
  const colorClasses = {
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
  };

  return (
    <div className={cn(
      'bg-gradient-to-br border rounded-2xl p-6',
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            )}>
              <TrendingUp className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  // Fetch metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics', range],
    queryFn: () => adminService.getMetrics(range),
  });

  // Fetch usage analytics
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['admin-usage', range],
    queryFn: () => adminService.getUsageAnalytics(range),
  });

  const metrics = metricsData?.data;
  const usage = usageData?.data;

  // Chart data for routines by type
  const routinesChartData = {
    labels: ['Amamentação', 'Sono', 'Fralda', 'Banho', 'Extração'],
    datasets: [
      {
        data: metrics ? [
          metrics.routinesByType.FEEDING || 0,
          metrics.routinesByType.SLEEP || 0,
          metrics.routinesByType.DIAPER || 0,
          metrics.routinesByType.BATH || 0,
          metrics.routinesByType.MILK_EXTRACTION || 0,
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart data for Free vs Premium
  const plansChartData = {
    labels: ['Free', 'Premium'],
    datasets: [
      {
        data: metrics ? [metrics.freeUsers, metrics.premiumUsers] : [0, 0],
        backgroundColor: [
          'rgba(148, 163, 184, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart data for routines over time
  const routinesTrendData = {
    labels: usage?.routinesPerDay.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }) || [],
    datasets: [
      {
        label: 'Rotinas',
        data: usage?.routinesPerDay.map(d => d.count) || [],
        borderColor: 'rgba(251, 191, 36, 1)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.6)',
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.6)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(148, 163, 184, 0.8)',
          padding: 20,
        },
      },
    },
  };

  if (metricsLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setRange('7d')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              range === '7d'
                ? 'bg-amber-500 text-slate-900'
                : 'text-slate-400 hover:text-white'
            )}
          >
            7 dias
          </button>
          <button
            onClick={() => setRange('30d')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              range === '30d'
                ? 'bg-amber-500 text-slate-900'
                : 'text-slate-400 hover:text-white'
            )}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total de Usuários"
          value={metrics?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="sky"
        />
        <KpiCard
          title="Usuários Ativos"
          value={metrics?.usersActive || 0}
          subtitle={`no período de ${range === '7d' ? '7' : '30'} dias`}
          icon={<Activity className="w-6 h-6" />}
          color="emerald"
        />
        <KpiCard
          title="Total de Bebês"
          value={metrics?.totalBabies || 0}
          icon={<Baby className="w-6 h-6" />}
          color="violet"
        />
        <KpiCard
          title="Rotinas Registradas"
          value={metrics?.routinesCount || 0}
          subtitle={`no período de ${range === '7d' ? '7' : '30'} dias`}
          icon={<Zap className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Routines Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rotinas por Dia</h3>
          <div className="h-64">
            <Line data={routinesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Plans Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição de Planos</h3>
          <div className="h-64">
            <Doughnut data={plansChartData} options={doughnutOptions} />
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-slate-400">Free: {metrics?.freeUsers || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400">Premium: {metrics?.premiumUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Routines by Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rotinas por Tipo</h3>
          <div className="h-64">
            <Bar data={routinesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Paywall Hits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Paywall Hits
          </h3>
          {metrics?.paywallHits && Object.keys(metrics.paywallHits).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.paywallHits).map(([feature, count]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span className="text-slate-400 capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              Nenhum paywall hit registrado no período
            </p>
          )}
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Usuários por Rotinas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Rotinas</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.topUsersByRoutines.map((user, index) => (
                <tr key={user.userId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                  <td className="py-3 px-4 text-white">{user.fullName}</td>
                  <td className="py-3 px-4 text-slate-400">{user.email}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                      <Zap className="w-4 h-4" />
                      {user.routineCount}
                    </span>
                  </td>
                </tr>
              ))}
              {(!metrics?.topUsersByRoutines || metrics.topUsersByRoutines.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Nenhum dado disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

