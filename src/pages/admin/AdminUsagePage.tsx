// Olive Baby Web - Admin Usage Analytics Page
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  Baby,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
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
import { Line, Bar } from 'react-chartjs-2';
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
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdminUsagePage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usage', range],
    queryFn: () => adminService.getUsageAnalytics(range),
  });

  const usage = data?.data;

  // Format date for charts
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Chart data for routines trend
  const routinesTrendData = {
    labels: usage?.routinesPerDay.map(d => formatDate(d.date)) || [],
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

  // Chart data for new users
  const newUsersTrendData = {
    labels: usage?.newUsersPerDay.map(d => formatDate(d.date)) || [],
    datasets: [
      {
        label: 'Novos Usuários',
        data: usage?.newUsersPerDay.map(d => d.count) || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart data for new babies
  const newBabiesTrendData = {
    labels: usage?.newBabiesPerDay.map(d => formatDate(d.date)) || [],
    datasets: [
      {
        label: 'Novos Bebês',
        data: usage?.newBabiesPerDay.map(d => d.count) || [],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart data for paywall hits
  const paywallHitsData = {
    labels: Object.keys(usage?.paywallHits || {}).map(k => k.replace(/_/g, ' ')),
    datasets: [
      {
        label: 'Paywall Hits',
        data: Object.values(usage?.paywallHits || {}),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
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

  if (isLoading) {
    return (
      <AdminLayout title="Métricas de Uso">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Métricas de Uso">
      {/* Range Selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex bg-slate-800 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                range === r
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {r === '7d' ? '7 dias' : r === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Funil de Conversão
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {usage?.conversionFunnel.freeUsers || 0}
            </p>
            <p className="text-sm text-slate-400">Usuários Free</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-amber-400 mb-1">
              {usage?.conversionFunnel.premiumUsers || 0}
            </p>
            <p className="text-sm text-slate-400">Usuários Premium</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {(usage?.conversionFunnel.conversionRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-slate-400">Taxa de Conversão</p>
            <div className={cn(
              'flex items-center justify-center gap-1 mt-2 text-sm',
              (usage?.conversionFunnel.conversionRate || 0) >= 5 
                ? 'text-emerald-400' 
                : 'text-rose-400'
            )}>
              {(usage?.conversionFunnel.conversionRate || 0) >= 5 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>
                {(usage?.conversionFunnel.conversionRate || 0) >= 5 ? 'Saudável' : 'Abaixo do esperado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Routines Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Rotinas por Dia
          </h3>
          <div className="h-64">
            <Line data={routinesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* New Users Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Novos Usuários por Dia
          </h3>
          <div className="h-64">
            <Line data={newUsersTrendData} options={chartOptions} />
          </div>
        </div>

        {/* New Babies Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Baby className="w-5 h-5 text-violet-400" />
            Novos Bebês por Dia
          </h3>
          <div className="h-64">
            <Line data={newBabiesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Paywall Hits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Paywall Hits por Feature
          </h3>
          {Object.keys(usage?.paywallHits || {}).length > 0 ? (
            <div className="h-64">
              <Bar data={paywallHitsData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Nenhum paywall hit registrado no período
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">
              {usage?.routinesPerDay.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
            <p className="text-sm text-slate-400">Total de Rotinas</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">
              {usage?.newUsersPerDay.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
            <p className="text-sm text-slate-400">Novos Usuários</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">
              {usage?.newBabiesPerDay.reduce((sum, d) => sum + d.count, 0) || 0}
            </p>
            <p className="text-sm text-slate-400">Novos Bebês</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">
              {Object.values(usage?.paywallHits || {}).reduce((sum, c) => sum + c, 0)}
            </p>
            <p className="text-sm text-slate-400">Paywall Hits</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

