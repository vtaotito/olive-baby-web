// Olive Baby Web - Admin Activation Page (Funnel + Cohorts Acionáveis)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Baby, Activity, Zap, Target, Eye, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import {
  RangePicker,
  ChartCard,
  FunnelChart,
  KpiCard,
  Drawer,
  DrawerSection,
  StatusBadge,
  TrendBadge,
  SkeletonTable,
  InfoLabel,
} from '../../components/admin';
import { adminService } from '../../services/adminApi';
import { Spinner, Button } from '../../components/ui';
import { cn } from '../../lib/utils';
import type { CohortData, HealthStatus } from '../../types/admin';

// Cohort User Card
interface CohortUserCardProps {
  user: {
    userId: number;
    email: string;
    fullName?: string;
    createdAt: string;
    lastActivityAt?: string;
    routinesCount: number;
    isRetained: boolean;
  };
}

function CohortUserCard({ user }: CohortUserCardProps) {
  const daysSinceActivity = user.lastActivityAt
    ? Math.floor((Date.now() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        user.isRetained ? 'bg-emerald-100' : 'bg-rose-100'
      )}>
        <Users className={cn('w-5 h-5', user.isRetained ? 'text-emerald-600' : 'text-rose-600')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.fullName || user.email.split('@')[0]}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{user.routinesCount} rotinas</p>
        {daysSinceActivity !== null && (
          <p className={cn(
            'text-xs',
            daysSinceActivity > 7 ? 'text-rose-500' : 'text-gray-500'
          )}>
            {daysSinceActivity === 0 ? 'Ativo hoje' : `${daysSinceActivity}d inativo`}
          </p>
        )}
      </div>
    </div>
  );
}

// Get cohort status
function getCohortStatus(d7Retention: number): HealthStatus {
  if (d7Retention >= 30) return 'healthy';
  if (d7Retention >= 15) return 'warning';
  return 'critical';
}

// Get status label
function getStatusLabel(status: HealthStatus): string {
  switch (status) {
    case 'healthy': return '🟢 Saudável';
    case 'warning': return '🟡 Atenção';
    case 'critical': return '🔴 Risco';
    default: return 'Normal';
  }
}

// Get suggested action
function getSuggestedAction(status: HealthStatus, d7Retention: number): string {
  if (status === 'critical') return 'Investigar imediatamente';
  if (status === 'warning') return 'Monitorar de perto';
  return 'Manter estratégia atual';
}

export function AdminActivationPage() {
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const [selectedCohort, setSelectedCohort] = useState<CohortData | null>(null);

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

  // Calculate cohort deltas
  const cohortsWithDelta = cohorts.map((cohort, index) => {
    const previousCohort = cohorts[index + 1];
    const d7Delta = previousCohort ? cohort.d7Retention - previousCohort.d7Retention : 0;
    return { ...cohort, d7Delta };
  });

  // Calculate funnel percentages
  const funnelSteps = funnel ? [
    { label: 'Cadastrados', value: funnel.registered, color: 'bg-sky-500' },
    { label: 'Criaram bebê', value: funnel.createdBaby, color: 'bg-violet-500' },
    { label: 'Primeira rotina', value: funnel.createdFirstRoutine, color: 'bg-olive-500' },
    { label: '3 rotinas em 24h', value: funnel.created3RoutinesIn24h, color: 'bg-emerald-500' },
    { label: '2+ tipos em 7d', value: funnel.used2RoutineTypesIn7d, color: 'bg-amber-500' },
  ] : [];

  // Summary stats
  const totalUsers = cohorts.reduce((sum, c) => sum + c.usersInCohort, 0);
  const avgD7 = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.d7Retention, 0) / cohorts.length
    : 0;
  const riskCohorts = cohorts.filter(c => getCohortStatus(c.d7Retention) === 'critical').length;

  // Simulated cohort users (in real app, would come from API)
  const cohortUsers = selectedCohort ? Array.from({ length: Math.min(selectedCohort.usersInCohort, 10) }).map((_, i) => ({
    userId: i + 1,
    email: `user${i + 1}@example.com`,
    fullName: `Usuário ${i + 1}`,
    createdAt: selectedCohort.cohortStartDate,
    lastActivityAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    routinesCount: Math.floor(Math.random() * 50),
    isRetained: Math.random() < (selectedCohort.d7Retention / 100),
  })) : [];

  return (
    <AdminLayout
      title="Ativação & Retenção"
      subtitle="Acompanhe a jornada de ativação e retenção dos usuários"
    >
      {/* Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-lg">
            <Users className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-medium text-sky-700">{totalUsers} usuários analisados</span>
          </div>
          {riskCohorts > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg">
              <Target className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">{riskCohorts} cohorts em risco</span>
            </div>
          )}
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

      {/* Cohorts Table - ACIONÁVEL */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-olive-600" />
                Cohorts Semanais
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Clique em uma cohort para ver os usuários
              </p>
            </div>
            <div className="flex items-center gap-2">
              <InfoLabel
                label="D7"
                tooltip="Usuários que registraram ao menos 1 rotina 7 dias após o cadastro"
              />
            </div>
          </div>
        </div>

        {cohortsLoading ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Semana</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Usuários</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">D1</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      D7
                      <InfoLabel label="" tooltip="Taxa de retenção no 7º dia" />
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Δ D7</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">D30</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Ação</th>
                </tr>
              </thead>
              <tbody>
                {cohortsWithDelta.map((cohort, index) => {
                  const status = getCohortStatus(cohort.d7Retention);
                  return (
                    <tr
                      key={index}
                      className={cn(
                        'border-b border-gray-100 transition-colors cursor-pointer',
                        status === 'critical' ? 'bg-rose-50/30 hover:bg-rose-50' :
                        status === 'warning' ? 'bg-amber-50/30 hover:bg-amber-50' :
                        'hover:bg-gray-50'
                      )}
                      onClick={() => setSelectedCohort(cohort)}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(cohort.cohortStartDate).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            até {new Date(cohort.cohortEndDate).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {cohort.usersInCohort}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          'inline-block px-2.5 py-1 text-xs font-medium rounded-full',
                          cohort.d1Retention >= 50 ? 'bg-emerald-100 text-emerald-700' :
                          cohort.d1Retention >= 30 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        )}>
                          {cohort.d1Retention}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          'inline-block px-2.5 py-1 text-xs font-bold rounded-full',
                          status === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
                          status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        )}>
                          {cohort.d7Retention}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <TrendBadge value={cohort.d7Delta} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={status} showIcon size="sm" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={cn(
                          'inline-block px-2.5 py-1 text-xs font-medium rounded-full',
                          cohort.d30Retention >= 20 ? 'bg-emerald-100 text-emerald-700' :
                          cohort.d30Retention >= 10 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        )}>
                          {cohort.d30Retention}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            status === 'critical' && 'text-rose-600 hover:bg-rose-100',
                            status === 'warning' && 'text-amber-600 hover:bg-amber-100'
                          )}
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver usuários
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {cohorts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Sem dados de cohorts disponíveis
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Average Stats Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Média geral:</span>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">D7: {avgD7.toFixed(1)}%</span>
              <span className="text-gray-400">|</span>
              <span className={cn(
                'font-medium',
                avgD7 >= 25 ? 'text-emerald-600' : avgD7 >= 15 ? 'text-amber-600' : 'text-rose-600'
              )}>
                {avgD7 >= 25 ? 'Acima da média do mercado' :
                 avgD7 >= 15 ? 'Dentro do esperado' :
                 'Abaixo da média - investigar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Detail Drawer */}
      <Drawer
        isOpen={!!selectedCohort}
        onClose={() => setSelectedCohort(null)}
        title={selectedCohort ? `Cohort: ${new Date(selectedCohort.cohortStartDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : ''}
        subtitle={selectedCohort ? `${selectedCohort.usersInCohort} usuários` : ''}
        width="lg"
      >
        {selectedCohort && (
          <div className="space-y-6">
            {/* Cohort Summary */}
            <div className={cn(
              'rounded-xl p-4 border',
              getCohortStatus(selectedCohort.d7Retention) === 'critical' ? 'bg-rose-50 border-rose-200' :
              getCohortStatus(selectedCohort.d7Retention) === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-emerald-50 border-emerald-200'
            )}>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={getCohortStatus(selectedCohort.d7Retention)} />
                <span className="text-2xl font-bold">
                  {selectedCohort.d7Retention}% D7
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Ação sugerida:</strong> {getSuggestedAction(getCohortStatus(selectedCohort.d7Retention), selectedCohort.d7Retention)}
              </p>
            </div>

            {/* Retention Breakdown */}
            <DrawerSection title="Retenção">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCohort.d1Retention}%</p>
                  <p className="text-xs text-gray-500">D1</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCohort.d7Retention}%</p>
                  <p className="text-xs text-gray-500">D7</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCohort.d30Retention}%</p>
                  <p className="text-xs text-gray-500">D30</p>
                </div>
              </div>
            </DrawerSection>

            {/* Users List */}
            <DrawerSection title={`Usuários (${cohortUsers.length})`}>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {cohortUsers.map((user) => (
                  <CohortUserCard key={user.userId} user={user} />
                ))}
              </div>
            </DrawerSection>

            {/* Quick Actions */}
            <DrawerSection title="Ações Rápidas">
              <div className="space-y-2">
                <Button variant="outline" fullWidth size="sm">
                  Exportar lista de usuários
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Ver detalhes de engajamento
                </Button>
              </div>
            </DrawerSection>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}
