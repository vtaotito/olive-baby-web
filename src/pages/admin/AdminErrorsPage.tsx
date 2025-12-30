// Olive Baby Web - Admin Errors Page
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bug,
  Activity,
  TrendingUp,
  AlertCircle,
  AlertOctagon,
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
import { RangePicker, ChartCard, KpiCard } from '../../components/admin';
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
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdminErrorsPage() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  // Fetch errors analytics
  const { data, isLoading } = useQuery({
    queryKey: ['admin-errors', range],
    queryFn: () => adminService.getErrorsAnalytics(range),
  });

  const errors = data?.data;

  // Errors by day chart
  const errorsByDayData = {
    labels: errors?.errorsByDay.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }) || [],
    datasets: [
      {
        label: '4xx (Client)',
        data: errors?.errorsByDay.map(d => d.count4xx) || [],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '5xx (Server)',
        data: errors?.errorsByDay.map(d => d.count5xx) || [],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Group top routes by status code category
  const routes4xx = errors?.topRoutesByErrors.filter(r => r.statusCode >= 400 && r.statusCode < 500) || [];
  const routes5xx = errors?.topRoutesByErrors.filter(r => r.statusCode >= 500) || [];

  // Top routes chart
  const topRoutesChartData = {
    labels: errors?.topRoutesByErrors.slice(0, 10).map(r => `${r.route} (${r.statusCode})`) || [],
    datasets: [
      {
        label: 'Erros',
        data: errors?.topRoutesByErrors.slice(0, 10).map(r => r.count) || [],
        backgroundColor: errors?.topRoutesByErrors.slice(0, 10).map(r =>
          r.statusCode >= 500 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.8)'
        ) || [],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
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

  const barChartOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
  };

  // Get status code color
  const getStatusColor = (code: number) => {
    if (code >= 500) return 'bg-rose-100 text-rose-700';
    if (code >= 400) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Calculate totals
  const total4xx = errors?.errorsByDay.reduce((sum, d) => sum + d.count4xx, 0) || 0;
  const total5xx = errors?.errorsByDay.reduce((sum, d) => sum + d.count5xx, 0) || 0;

  return (
    <AdminLayout title="Erros & Fricção">
      {/* Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Error Analytics</h2>
          <p className="text-sm text-gray-500">Monitore erros e pontos de fricção na API</p>
        </div>
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total de Erros"
          value={errors?.totalErrors || 0}
          icon={<Bug className="w-6 h-6" />}
          color="rose"
        />
        <KpiCard
          title="Erros 4xx"
          value={total4xx}
          subtitle="Erros do cliente"
          icon={<AlertCircle className="w-6 h-6" />}
          color="amber"
        />
        <KpiCard
          title="Erros 5xx"
          value={total5xx}
          subtitle="Erros do servidor"
          icon={<AlertOctagon className="w-6 h-6" />}
          color="rose"
        />
        <KpiCard
          title="Taxa de Erro"
          value={`${(errors?.errorRate || 0).toFixed(1)}%`}
          icon={<Activity className="w-6 h-6" />}
          color={errors?.errorRate && errors.errorRate > 5 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Erros por Dia"
          subtitle="4xx vs 5xx"
          icon={<TrendingUp className="w-5 h-5 text-gray-500" />}
          isLoading={isLoading}
        >
          <Line data={errorsByDayData} options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="Top Rotas com Erros"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          isLoading={isLoading}
        >
          <Bar data={topRoutesChartData} options={barChartOptions} />
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Routes Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Rotas com Mais Erros
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {errors?.topRoutesByErrors.slice(0, 15).map((route, index) => (
                <div
                  key={`${route.route}-${route.statusCode}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-mono text-gray-900 truncate">
                      {route.route}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusColor(route.statusCode)
                    )}>
                      {route.statusCode}
                    </span>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {route.count}x
                    </span>
                  </div>
                </div>
              ))}
              {(!errors?.topRoutesByErrors || errors.topRoutesByErrors.length === 0) && (
                <p className="text-center text-gray-400 py-8">Nenhum erro registrado</p>
              )}
            </div>
          )}
        </div>

        {/* Top Users with Errors */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-500" />
            Usuários com Mais Erros
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {errors?.topUsersByErrors.map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 text-sm font-medium rounded-full">
                    {user.count} erros
                  </span>
                </div>
              ))}
              {(!errors?.topUsersByErrors || errors.topUsersByErrors.length === 0) && (
                <p className="text-center text-gray-400 py-8">Nenhum usuário com erros</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

