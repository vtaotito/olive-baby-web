// Olive Baby Web - Admin Dashboard Page (Tema Claro)
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

// KPI Card Component - Tema Claro
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'olive' | 'emerald' | 'sky' | 'violet' | 'rose';
}

function KpiCard({ title, value, subtitle, icon, trend, color = 'olive' }: KpiCardProps) {
  const colorClasses = {
    olive: 'bg-olive-50 border-olive-200 text-olive-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    sky: 'bg-sky-50 border-sky-200 text-sky-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
  };

  const iconBg = {
    olive: 'bg-olive-100',
    emerald: 'bg-emerald-100',
    sky: 'bg-sky-100',
    violet: 'bg-violet-100',
    rose: 'bg-rose-100',
  };

  return (
    <div className={cn(
      'bg-white border rounded-2xl p-6 shadow-sm',
      'border-gray-200'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              <TrendingUp className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconBg[color]
        )}>
          <div className={colorClasses[color]}>
            {icon}
          </div>
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
          'rgba(101, 123, 73, 0.8)',  // olive
          'rgba(139, 92, 246, 0.8)',  // violet
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(236, 72, 153, 0.8)',  // pink
        ],
        borderWidth: 0,
        borderRadius: 8,
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
          'rgba(101, 123, 73, 0.8)',
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
        borderColor: 'rgba(101, 123, 73, 1)',
        backgroundColor: 'rgba(101, 123, 73, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(101, 123, 73, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: 'rgba(107, 114, 128, 1)',
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: 'rgba(107, 114, 128, 1)',
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
          color: 'rgba(107, 114, 128, 1)',
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
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setRange('7d')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              range === '7d'
                ? 'bg-olive-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            7 dias
          </button>
          <button
            onClick={() => setRange('30d')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              range === '30d'
                ? 'bg-olive-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
          color="olive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Routines Trend */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotinas por Dia</h3>
          <div className="h-64">
            <Line data={routinesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Plans Distribution */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Planos</h3>
          <div className="h-64">
            <Doughnut data={plansChartData} options={doughnutOptions} />
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">Free: {metrics?.freeUsers || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-olive-600" />
              <span className="text-olive-700 font-medium">Premium: {metrics?.premiumUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Routines by Type */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotinas por Tipo</h3>
          <div className="h-64">
            <Bar data={routinesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Paywall Hits */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Paywall Hits
          </h3>
          {metrics?.paywallHits && Object.keys(metrics.paywallHits).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.paywallHits).map(([feature, count]) => (
                <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-900 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertTriangle className="w-10 h-10 mb-2 opacity-40" />
              <p>Nenhum paywall hit registrado no período</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Usuários por Rotinas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Rotinas</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.topUsersByRoutines.map((user, index) => (
                <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{user.fullName}</td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-olive-700 font-semibold">
                      <Zap className="w-4 h-4" />
                      {user.routineCount}
                    </span>
                  </td>
                </tr>
              ))}
              {(!metrics?.topUsersByRoutines || metrics.topUsersByRoutines.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
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
