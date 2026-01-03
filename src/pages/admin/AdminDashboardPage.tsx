// Olive Baby Web - Admin Dashboard Page (3 Zonas: Saúde, Mudanças, Ações)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Baby,
  Activity,
  TrendingUp,
  TrendingDown,
  Crown,
  Zap,
  AlertTriangle,
  Target,
  ArrowRight,
  ChevronRight,
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
import {
  KpiCard,
  RangePicker,
  ActionCard,
  ChangeItem,
  ChangesSection,
  SkeletonCard,
  SkeletonChart,
  InfoLabel,
  ChangeType,
} from '../../components/admin';
import { adminService } from '../../services/adminApi';
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

// Health KPI Card with trend and clickable
interface HealthKpiProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color: 'olive' | 'emerald' | 'sky' | 'violet' | 'rose' | 'amber';
  tooltip?: string;
  onClick?: () => void;
  inverted?: boolean;
}

function HealthKpi({ title, value, trend, trendLabel, icon, color, tooltip, onClick, inverted }: HealthKpiProps) {
  const colorClasses = {
    olive: 'hover:border-olive-300',
    emerald: 'hover:border-emerald-300',
    sky: 'hover:border-sky-300',
    violet: 'hover:border-violet-300',
    rose: 'hover:border-rose-300',
    amber: 'hover:border-amber-300',
  };

  const iconBgColors = {
    olive: 'bg-olive-100',
    emerald: 'bg-emerald-100',
    sky: 'bg-sky-100',
    violet: 'bg-violet-100',
    rose: 'bg-rose-100',
    amber: 'bg-amber-100',
  };

  const iconTextColors = {
    olive: 'text-olive-600',
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
    violet: 'text-violet-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  const isPositive = inverted ? (trend ?? 0) < 0 : (trend ?? 0) > 0;
  const isNeutral = trend === 0 || trend === undefined;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-left transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        onClick && colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-gray-500">{title}</p>
            {tooltip && <InfoLabel label="" tooltip={tooltip} />}
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              isNeutral ? 'text-gray-500' : isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {isNeutral ? null : isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {trend > 0 && '+'}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && <span className="text-gray-400 font-normal">vs semana anterior</span>}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBgColors[color])}>
          <div className={iconTextColors[color]}>{icon}</div>
        </div>
      </div>
      {onClick && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-sm text-gray-500">
          <span>Ver detalhes</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </button>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
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

  // Fetch cohorts for retention
  const { data: cohortsData } = useQuery({
    queryKey: ['admin-cohorts'],
    queryFn: () => adminService.getCohorts(4),
  });

  // Fetch upgrade candidates
  const { data: candidatesData } = useQuery({
    queryKey: ['admin-upgrade-candidates'],
    queryFn: () => adminService.getUpgradeCandidates(),
  });

  // Fetch errors
  const { data: errorsData } = useQuery({
    queryKey: ['admin-errors', '7d'],
    queryFn: () => adminService.getErrorsAnalytics('7d'),
  });

  const metrics = metricsData?.data;
  const usage = usageData?.data;
  const cohorts = cohortsData?.data || [];
  const candidates = candidatesData?.data || [];
  const errors = errorsData?.data;

  // Calculate trends (simulated - would come from API in real app)
  const latestCohort = cohorts[0];
  const previousCohort = cohorts[1];
  const d7Delta = latestCohort && previousCohort
    ? latestCohort.d7Retention - previousCohort.d7Retention
    : 0;

  // Conversion rate
  const conversionRate = metrics
    ? ((metrics.premiumUsers / (metrics.freeUsers + metrics.premiumUsers)) * 100)
    : 0;

  // Generate recent changes based on data
  const recentChanges: Array<{ type: ChangeType; title: string; description: string }> = [
    ...(d7Delta !== 0 ? [{
      type: (d7Delta > 0 ? 'increase' : 'decrease') as ChangeType,
      title: `Retenção D7 ${d7Delta > 0 ? 'subiu' : 'caiu'} ${Math.abs(d7Delta).toFixed(1)}pp`,
      description: 'Comparado com a cohort anterior',
    }] : []),
    ...(usage?.paywallHits ? Object.entries(usage.paywallHits).slice(0, 2).map(([feature, count]) => ({
      type: 'info' as ChangeType,
      title: `Paywall de ${feature.replace(/_/g, ' ')} acionado ${count}x`,
      description: `Nos últimos ${range === '7d' ? '7' : '30'} dias`,
    })) : []),
    ...(candidates.length > 0 ? [{
      type: 'increase' as ChangeType,
      title: `${candidates.length} candidatos a upgrade identificados`,
      description: 'Baseado em uso e paywall hits',
    }] : []),
  ];

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
        pointRadius: 3,
      },
    ],
  };

  // Chart data for Free vs Premium
  const plansChartData = {
    labels: ['Free', 'Premium'],
    datasets: [
      {
        data: metrics ? [metrics.freeUsers, metrics.premiumUsers] : [0, 0],
        backgroundColor: ['rgba(148, 163, 184, 0.8)', 'rgba(101, 123, 73, 0.8)'],
        borderWidth: 0,
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '70%',
  };

  return (
    <AdminLayout
      title="Visão Geral"
      subtitle="Acompanhe a saúde do seu negócio em tempo real"
    >
      {/* Range Selector */}
      <div className="flex justify-end mb-6">
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
      </div>

      {/* ==========================================
          ZONA 1: Saúde do Negócio (KPIs Principais)
          ========================================== */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Saúde do Negócio
        </h2>
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HealthKpi
              title="Usuários Ativos"
              value={metrics?.usersActive || 0}
              trend={5.2}
              trendLabel="vs semana anterior"
              icon={<Activity className="w-6 h-6" />}
              color="emerald"
              tooltip="Usuários que registraram ao menos 1 rotina no período"
              onClick={() => navigate('/admin/users')}
            />
            <HealthKpi
              title="Retenção D7"
              value={`${latestCohort?.d7Retention || 0}%`}
              trend={d7Delta}
              icon={<Target className="w-6 h-6" />}
              color={latestCohort?.d7Retention >= 25 ? 'olive' : latestCohort?.d7Retention >= 15 ? 'amber' : 'rose'}
              tooltip="Usuários que voltaram 7 dias após o cadastro"
              onClick={() => navigate('/admin/activation')}
            />
            <HealthKpi
              title="Conversão Free → Premium"
              value={`${conversionRate.toFixed(1)}%`}
              trend={1.2}
              icon={<Crown className="w-6 h-6" />}
              color="violet"
              tooltip="Percentual de usuários no plano premium"
              onClick={() => navigate('/admin/monetization')}
            />
            <HealthKpi
              title="Churn Risk"
              value={candidates.length}
              icon={<AlertTriangle className="w-6 h-6" />}
              color={candidates.length > 10 ? 'rose' : candidates.length > 5 ? 'amber' : 'emerald'}
              tooltip="Usuários inativos há mais de 7 dias"
              onClick={() => navigate('/admin/alerts')}
              inverted
            />
          </div>
        )}
      </section>

      {/* ==========================================
          ZONA 2: O que mudou recentemente
          ========================================== */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Changes */}
          <ChangesSection
            title="Últimos 7 dias"
            subtitle="Mudanças importantes no seu negócio"
            className="lg:col-span-1"
          >
            {recentChanges.length > 0 ? (
              recentChanges.slice(0, 4).map((change, i) => (
                <ChangeItem
                  key={i}
                  type={change.type}
                  title={change.title}
                  description={change.description}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma mudança significativa
              </p>
            )}
          </ChangesSection>

          {/* Routines Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rotinas por Dia</h3>
                <p className="text-sm text-gray-500">
                  Total: {metrics?.routinesCount || 0} no período
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-olive-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {usage?.routinesPerDay[usage.routinesPerDay.length - 1]?.count || 0}
                </span>
                <span className="text-sm text-gray-500">hoje</span>
              </div>
            </div>
            <div className="h-64">
              {usageLoading ? (
                <div className="h-full flex items-end gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-200 rounded-t animate-pulse"
                      style={{ height: `${Math.random() * 60 + 20}%` }}
                    />
                  ))}
                </div>
              ) : (
                <Line data={routinesTrendData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          ZONA 3: Ações Recomendadas
          ========================================== */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Ações Recomendadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestCohort?.d7Retention < 25 && (
            <ActionCard
              icon={<Target className="w-5 h-5" />}
              title="Ver cohorts em risco"
              description="Identificar usuários que precisam de atenção"
              count={cohorts.filter(c => c.d7Retention < 20).length}
              variant="danger"
              onClick={() => navigate('/admin/activation')}
            />
          )}
          {candidates.length > 0 && (
            <ActionCard
              icon={<Crown className="w-5 h-5" />}
              title="Ver candidatos a upgrade"
              description="Usuários com alto potencial de conversão"
              count={candidates.length}
              variant="success"
              onClick={() => navigate('/admin/monetization')}
            />
          )}
          {errors && errors.totalErrors > 0 && (
            <ActionCard
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Ver erros recorrentes"
              description="Pontos de fricção que precisam de atenção"
              count={errors.totalErrors}
              variant="warning"
              onClick={() => navigate('/admin/errors')}
            />
          )}
          <ActionCard
            icon={<Users className="w-5 h-5" />}
            title="Usuários inativos"
            description="Verificar usuários sem atividade recente"
            onClick={() => navigate('/admin/users?status=inactive')}
          />
        </div>
      </section>

      {/* ==========================================
          Quick Stats Row
          ========================================== */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans Distribution */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição de Planos
            </h3>
            <div className="h-48 relative">
              <Doughnut data={plansChartData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {metrics?.totalUsers || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">Free: {metrics?.freeUsers || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-olive-600" />
                <span className="text-olive-700 font-medium">
                  Premium: {metrics?.premiumUsers || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Usuários por Rotinas
              </h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-sm text-olive-600 hover:text-olive-700 font-medium flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {metrics?.topUsersByRoutines.slice(0, 5).map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 bg-olive-100 text-olive-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-olive-700 font-semibold">
                    <Zap className="w-4 h-4" />
                    {user.routineCount}
                  </span>
                </div>
              ))}
              {(!metrics?.topUsersByRoutines || metrics.topUsersByRoutines.length === 0) && (
                <p className="text-center text-gray-400 py-8">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
