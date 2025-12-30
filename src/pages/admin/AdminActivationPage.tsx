// Olive Baby Web - Admin Activation Page (Funnel + Cohorts)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Baby, Activity, Zap, Target } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { RangePicker, ChartCard, FunnelChart, KpiCard } from '../../components/admin';
import { adminService } from '../../services/adminApi';
import { Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

export function AdminActivationPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['admin-funnel', range],
    queryFn: () => adminService.getActivationFunnel(range),
  });

  // Fetch cohorts data
  const { data: cohortsData, isLoading: cohortsLoading } = useQuery({
    queryKey: ['admin-cohorts'],
    queryFn: () => adminService.getCohorts(12),
  });

  const funnel = funnelData?.data;
  const cohorts = cohortsData?.data || [];

  // Calculate funnel percentages
  const funnelSteps = funnel ? [
    { label: 'Cadastrados', value: funnel.registered, color: 'bg-sky-500' },
    { label: 'Criaram bebê', value: funnel.createdBaby, color: 'bg-violet-500' },
    { label: 'Primeira rotina', value: funnel.createdFirstRoutine, color: 'bg-olive-500' },
    { label: '3 rotinas em 24h', value: funnel.created3RoutinesIn24h, color: 'bg-emerald-500' },
    { label: '2+ tipos em 7d', value: funnel.used2RoutineTypesIn7d, color: 'bg-amber-500' },
  ] : [];

  // Get retention color based on value
  const getRetentionColor = (value: number) => {
    if (value >= 30) return 'bg-emerald-100 text-emerald-700';
    if (value >= 15) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <AdminLayout title="Ativação & Retenção">
      {/* Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Funil de Ativação</h2>
          <p className="text-sm text-gray-500">Acompanhe a jornada de ativação dos usuários</p>
        </div>
        <RangePicker value={range} onChange={(v) => setRange(v as '7d' | '30d')} />
      </div>

      {/* Funnel KPIs */}
      {funnel && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <KpiCard
            title="Cadastrados"
            value={funnel.registered}
            icon={<Users className="w-6 h-6" />}
            color="sky"
          />
          <KpiCard
            title="Com bebê"
            value={funnel.createdBaby}
            subtitle={funnel.registered > 0 ? `${Math.round((funnel.createdBaby / funnel.registered) * 100)}% conversão` : ''}
            icon={<Baby className="w-6 h-6" />}
            color="violet"
          />
          <KpiCard
            title="1ª Rotina"
            value={funnel.createdFirstRoutine}
            subtitle={funnel.createdBaby > 0 ? `${Math.round((funnel.createdFirstRoutine / funnel.createdBaby) * 100)}% conversão` : ''}
            icon={<Activity className="w-6 h-6" />}
            color="olive"
          />
          <KpiCard
            title="3+ em 24h"
            value={funnel.created3RoutinesIn24h}
            icon={<Zap className="w-6 h-6" />}
            color="emerald"
          />
          <KpiCard
            title="2+ tipos"
            value={funnel.used2RoutineTypesIn7d}
            icon={<Target className="w-6 h-6" />}
            color="amber"
          />
        </div>
      )}

      {/* Funnel Visualization */}
      <ChartCard
        title="Funil de Ativação"
        subtitle={`Últimos ${range === '7d' ? '7' : '30'} dias`}
        icon={<Target className="w-5 h-5 text-olive-600" />}
        isLoading={funnelLoading}
        height="h-auto"
        className="mb-8"
      >
        <FunnelChart steps={funnelSteps} />
      </ChartCard>

      {/* Cohorts Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cohorts Semanais - Retenção D1/D7/D30
        </h3>
        {cohortsLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Semana</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Usuários</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">D1</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">D7</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">D30</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {new Date(cohort.cohortStartDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {cohort.usersInCohort}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 text-xs font-medium rounded-full',
                        getRetentionColor(cohort.d1Retention)
                      )}>
                        {cohort.d1Retention}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 text-xs font-medium rounded-full',
                        getRetentionColor(cohort.d7Retention)
                      )}>
                        {cohort.d7Retention}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'inline-block px-2 py-1 text-xs font-medium rounded-full',
                        getRetentionColor(cohort.d30Retention)
                      )}>
                        {cohort.d30Retention}%
                      </span>
                    </td>
                  </tr>
                ))}
                {cohorts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Sem dados de cohorts disponíveis
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

