import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Plus, ArrowRight, Lightbulb } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Spinner, Button, Card, CardBody, CardHeader } from '../../components/ui';
import { useBabyStore } from '../../stores/babyStore';
import { useStats } from '../../hooks/useStats';
import { useActiveRoutine } from '../../hooks/useActiveRoutine';
import { useInsights } from '../../hooks/useInsights';
import { useInsightNotifications } from '../../hooks/useNotifications';
import {
  ActiveRoutineCard,
  DailySummary,
  RoutineCharts,
  InsightsCards,
  RoutinesList,
} from '../../components/routines/dashboard';
import { InsightsCarousel } from '../../components/notifications';

export function DashboardPage() {
  const { selectedBaby, babies } = useBabyStore();
  const navigate = useNavigate();
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
  const { notifications: insightNotifications } = useInsightNotifications(selectedBaby?.id);

  const handleRoutineEnd = useCallback(() => {
    refetchStats();
    refetchActive();
    setRefreshKey(k => k + 1);
  }, [refetchStats, refetchActive]);

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="bg-gradient-to-br from-olive-50 via-green-50 to-emerald-50 border-olive-200">
            <CardBody className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Baby className="w-10 h-10 text-olive-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Bem-vindo(a) ao OlieCare!
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
                        document.querySelector('[data-baby-selector]')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Selecionar bebê no menu
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={() => navigate('/settings/babies')}
                  >
                    Adicionar bebê
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">&#x1F37C;</span>
                <h3 className="font-medium text-gray-900">Alimentação</h3>
                <p className="text-sm text-gray-500">Registre mamadas e refeições</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">&#x1F634;</span>
                <h3 className="font-medium text-gray-900">Sono</h3>
                <p className="text-sm text-gray-500">Acompanhe os padrões de sono</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 text-center">
                <span className="text-2xl mb-2 block">&#x1F4CA;</span>
                <h3 className="font-medium text-gray-900">Insights</h3>
                <p className="text-sm text-gray-500">Receba dicas personalizadas</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
        {hasActiveRoutine && (
          <ActiveRoutineCard
            activeRoutines={activeRoutines}
            babyId={selectedBaby.id}
            onRoutineEnd={handleRoutineEnd}
          />
        )}

        {insightNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-olive-600" />
                <h2 className="text-lg font-semibold text-gray-900">Insights do Dia</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Dicas personalizadas baseadas nas rotinas do seu bebê</p>
            </CardHeader>
            <CardBody>
              <InsightsCarousel insights={insightNotifications} />
            </CardBody>
          </Card>
        )}

        <InsightsCards
          insights={insights}
          welcomeMessage={welcomeMessage}
          isLoading={isLoadingStats}
        />

        <DailySummary
          stats={stats}
          isLoading={isLoadingStats}
        />

        <RoutineCharts
          history={history}
          breastSideDistribution={stats?.feeding?.breastSideDistribution as any}
          hourlyCounts={(stats as any)?.hourlyCounts}
          isLoading={isLoadingStats}
          range={chartRange}
          onRangeChange={setChartRange}
        />

        <RoutinesList
          key={refreshKey}
          babyId={selectedBaby.id}
        />
      </div>
    </DashboardLayout>
  );
}
