// Olive Baby Web - Routines Dashboard Page
// Dashboard completo de rotinas com insights e gráficos

import { useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout';
import { Spinner } from '../../components/ui';
import { useBabyStore } from '../../stores/babyStore';
import { useStats } from '../../hooks/useStats';
import { useActiveRoutine } from '../../hooks/useActiveRoutine';
import { useInsights } from '../../hooks/useInsights';
import {
  ActiveRoutineCard,
  DailySummary,
  RoutineCharts,
  InsightsCards,
  RoutinesList,
} from '../../components/routines/dashboard';

export function RoutinesDashboardPage() {
  const { selectedBaby } = useBabyStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartRange, setChartRange] = useState<'7d' | '14d' | '30d'>('7d');

  const { stats, history, isLoading: isLoadingStats, refetch: refetchStats } = useStats(
    selectedBaby?.id, 
    '24h',
    chartRange
  );
  const { activeRoutines, hasActiveRoutine, isLoading: isLoadingActive, refetch: refetchActive } = useActiveRoutine(
    selectedBaby?.id
  );
  const { insights, welcomeMessage } = useInsights(stats, selectedBaby?.name);

  // Callback quando uma rotina termina
  const handleRoutineEnd = useCallback(() => {
    refetchStats();
    refetchActive();
    setRefreshKey(k => k + 1);
  }, [refetchStats, refetchActive]);

  // Se não há bebê selecionado
  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Selecione um bebê primeiro</p>
        </div>
      </DashboardLayout>
    );
  }

  // Loading inicial
  if (isLoadingStats && isLoadingActive) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
          <p className="text-gray-500 mt-4">Carregando rotinas...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Rotina ativa (se houver) */}
        {hasActiveRoutine && (
          <div className="mb-6">
            <ActiveRoutineCard
              activeRoutines={activeRoutines}
              babyId={selectedBaby.id}
              onRoutineEnd={handleRoutineEnd}
            />
          </div>
        )}

        {/* Welcome inline */}
        <p className="text-sm text-gray-500">{welcomeMessage}</p>

        {/* Resumo do dia */}
        <DailySummary
          stats={stats}
          isLoading={isLoadingStats}
        />

        {/* Insights */}
        <InsightsCards
          insights={insights}
          isLoading={isLoadingStats}
        />

        {/* Gráficos */}
        <RoutineCharts
          history={history}
          breastSideDistribution={stats?.feeding?.breastSideDistribution as any}
          hourlyCounts={(stats as any)?.hourlyCounts}
          isLoading={isLoadingStats}
          range={chartRange}
          onRangeChange={setChartRange}
        />

        {/* Lista de rotinas */}
        <RoutinesList
          key={refreshKey}
          babyId={selectedBaby.id}
        />
      </div>
    </DashboardLayout>
  );
}
