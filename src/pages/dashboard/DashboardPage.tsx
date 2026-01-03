// Olive Baby Web - Dashboard Page
// Dashboard completo de rotinas com insights e gráficos
import { useState, useCallback } from 'react';
import { Baby, Plus, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Spinner, Button, Card, CardBody } from '../../components/ui';
import { useBabyStore } from '../../stores/babyStore';
import { useModalStore } from '../../stores/modalStore';
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

export function DashboardPage() {
  const { selectedBaby, babies } = useBabyStore();
  const { openBabyModal } = useModalStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // Hooks de dados
  const { stats, history, isLoading: isLoadingStats, refetch: refetchStats } = useStats(
    selectedBaby?.id, 
    '24h'
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
        <div className="max-w-2xl mx-auto mt-8">
          {/* Welcome Banner */}
          <Card className="bg-gradient-to-br from-olive-50 via-green-50 to-emerald-50 border-olive-200">
            <CardBody className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Baby className="w-10 h-10 text-olive-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Bem-vindo(a) ao Olive Baby! 🌿
                </h1>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {babies.length > 0 
                    ? 'Para começar, selecione um bebê no menu lateral ou adicione um novo bebê.'
                    : 'Para começar a acompanhar as rotinas do seu bebê, cadastre seu primeiro bebê.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {babies.length > 0 && (
                    <Button
                      variant="secondary"
                      leftIcon={<ArrowRight className="w-5 h-5" />}
                      onClick={() => {
                        // Abrir o dropdown de bebês na sidebar
                        document.querySelector('[data-baby-selector]')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Selecionar bebê no menu
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={openBabyModal}
                  >
                    Adicionar bebê
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">🍼</span>
                <h3 className="font-medium text-gray-900">Alimentação</h3>
                <p className="text-sm text-gray-500">Registre mamadas e refeições</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">😴</span>
                <h3 className="font-medium text-gray-900">Sono</h3>
                <p className="text-sm text-gray-500">Acompanhe os padrões de sono</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">📊</span>
                <h3 className="font-medium text-gray-900">Insights</h3>
                <p className="text-sm text-gray-500">Receba dicas personalizadas</p>
              </CardBody>
            </Card>
          </div>
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

        {/* Insights e mensagem de boas-vindas */}
        <InsightsCards
          insights={insights}
          welcomeMessage={welcomeMessage}
          isLoading={isLoadingStats}
        />

        {/* Resumo do dia */}
        <DailySummary
          stats={stats}
          isLoading={isLoadingStats}
        />

        {/* Gráficos */}
        <RoutineCharts
          history={history}
          breastSideDistribution={stats?.feeding?.breastSideDistribution as any}
          isLoading={isLoadingStats}
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
