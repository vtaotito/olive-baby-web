// Olive Baby Web - Feeding Dashboard Page
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Baby,
  Utensils,
  Clock,
  Scale,
  Milk,
  Plus,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Spinner } from '../../components/ui';
import { StatsChart } from '../../components/charts/StatsChart';
import { BreastSideChart } from '../../components/charts/BreastSideChart';
import { HourlyHeatmap } from '../../components/charts/HourlyHeatmap';
import { InsightCard } from '../../components/insights/InsightCard';
import { KPICard } from '../../components/kpi/KPICard';
import { useBabyStore } from '../../stores/babyStore';
import { statsService, routineService } from '../../services/api';
import { FeedingInsightsEngine, type Insight } from '../../utils/insights';
import { formatDateBR } from '../../lib/utils';

interface FeedingStats {
  labels: string[];
  feedingCountsPerDay: number[];
  feedingMinutesPerDay: number[];
  breastSideDistribution: {
    left: number;
    right: number;
    both: number;
  };
  complementMlPerDay: number[];
  totalComplementMlRange: number;
  totalComplementMl24h: number;
  hourlyLabels: number[];
  hourlyCounts: number[];
  feedingCount24h: number;
  totalFeedingMinutes24h: number;
  complementFeeds24h: number;
}

export function FeedingDashboardPage() {
  const navigate = useNavigate();
  const { selectedBaby } = useBabyStore();
  const [insights, setInsights] = useState<Insight[]>([]);

  // Fetch stats
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['feeding-stats', selectedBaby?.id, '7d'],
    queryFn: async () => {
      if (!selectedBaby) throw new Error('No baby selected');
      const response = await statsService.get(selectedBaby.id, '7d');
      return response.data as FeedingStats;
    },
    enabled: !!selectedBaby,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch recent routines for context
  const { data: routinesData } = useQuery({
    queryKey: ['feeding-routines', selectedBaby?.id],
    queryFn: async () => {
      if (!selectedBaby) return null;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await routineService.list(selectedBaby.id, {
        type: 'feeding',
        startDate,
        endDate,
        limit: 50,
      });
      return response.data;
    },
    enabled: !!selectedBaby,
  });

  // Generate insights
  useEffect(() => {
    if (statsData) {
      const generatedInsights = FeedingInsightsEngine.generateInsights(statsData, {
        ageInDays: selectedBaby ? Math.floor(
          (Date.now() - new Date(selectedBaby.birthDate).getTime()) / (1000 * 60 * 60 * 24)
        ) : undefined,
      });
      setInsights(generatedInsights);
    }
  }, [statsData, selectedBaby]);

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum bebê selecionado</h2>
          <p className="text-gray-600 mb-6">Selecione um bebê para ver o dashboard de amamentação.</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!statsData) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sem dados ainda</h2>
          <p className="text-gray-600 mb-6">
            Comece registrando as alimentações do seu bebê para ver aqui padrões, insights e acompanhar sua evolução.
          </p>
          <Button onClick={() => navigate('/routines/feeding')}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar primeira alimentação
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const distribution = statsData.breastSideDistribution || { left: 0, right: 0, both: 0 };
  const totalBreastFeedings = distribution.left + distribution.right + distribution.both;
  const balancePercentage = totalBreastFeedings > 0
    ? Math.abs(distribution.left - distribution.right) / totalBreastFeedings * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Amamentação</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe sua jornada de amamentação com clareza e tranquilidade
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="hidden md:flex"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* KPIs - Resumo de Hoje */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Hoje</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              icon={<Utensils className="w-5 h-5 text-yellow-600" />}
              label="Alimentações hoje"
              value={statsData.feedingCount24h || 0}
              color="bg-yellow-100"
              hint="Recém-nascidos se alimentam de 8 a 12 vezes por dia em média, mas cada bebê tem seu ritmo."
            />
            <KPICard
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              label="Tempo mamando hoje"
              value={statsData.totalFeedingMinutes24h || 0}
              format="minutos"
              color="bg-blue-100"
              hint="O tempo varia muito entre bebês. O importante é que ele esteja ganhando peso."
            />
            <KPICard
              icon={<Scale className="w-5 h-5 text-purple-600" />}
              label="Equilíbrio dos seios"
              value={`${(100 - balancePercentage).toFixed(0)}%`}
              format="percentual"
              color="bg-purple-100"
              hint="Alternar os seios ajuda a manter a produção equilibrada."
            />
            {statsData.totalComplementMl24h > 0 && (
              <KPICard
                icon={<Milk className="w-5 h-5 text-orange-600" />}
                label="Complemento hoje"
                value={statsData.totalComplementMl24h || 0}
                format="ml"
                color="bg-orange-100"
                hint="Se você está usando complemento, converse com sua pediatra sobre redução gradual se for seu objetivo."
              />
            )}
          </div>
        </section>

        {/* Alternância dos Seios */}
        {totalBreastFeedings > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">⚖️ Alternância dos Seios</h2>
              <p className="text-sm text-gray-600 mt-1">
                É importante alternar para manter a produção equilibrada
              </p>
            </CardHeader>
            <CardBody>
              <BreastSideChart distribution={distribution} />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Esquerdo: {distribution.left} • Direito: {distribution.right} • Ambos: {distribution.both}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Padrão de Alimentações */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">📊 Padrão de Alimentações</h2>
            <p className="text-sm text-gray-600 mt-1">
              Veja como tem sido a rotina de amamentação
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Frequência por dia */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Alimentações por dia (última semana)
              </h3>
              <StatsChart
                type="bar"
                labels={statsData.labels || []}
                datasets={[
                  {
                    label: 'Alimentações',
                    data: statsData.feedingCountsPerDay || [],
                    backgroundColor: '#4ECDC4',
                    borderColor: '#4ECDC4',
                  },
                ]}
                height={200}
              />
              <p className="text-xs text-gray-500 mt-2">
                Quantidade de alimentações em cada dia. É normal variar um pouco, mas observar a média ajuda.
              </p>
            </div>

            {/* Duração por dia */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Tempo total mamando por dia
              </h3>
              <StatsChart
                type="line"
                labels={statsData.labels || []}
                datasets={[
                  {
                    label: 'Minutos',
                    data: statsData.feedingMinutesPerDay || [],
                    borderColor: '#44A08D',
                    backgroundColor: 'rgba(68, 160, 141, 0.1)',
                    fill: true,
                  },
                ]}
                height={200}
              />
              <p className="text-xs text-gray-500 mt-2">
                Total de minutos que seu bebê passou no seio em cada dia.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Horários de Alimentação */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">🕐 Horários mais comuns de alimentação</h2>
            <p className="text-sm text-gray-600 mt-1">
              Veja em quais horários seu bebê costuma se alimentar mais. Isso ajuda a entender o ritmo dele.
            </p>
          </CardHeader>
          <CardBody>
            <HourlyHeatmap
              hourlyCounts={statsData.hourlyCounts || Array(24).fill(0)}
              hourlyLabels={statsData.hourlyLabels?.map(h => `${h}h`) || []}
            />
          </CardBody>
        </Card>

        {/* Complemento (se houver) */}
        {statsData.totalComplementMlRange > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">🍶 Complemento ao longo da semana</h2>
              <p className="text-sm text-gray-600 mt-1">
                Acompanhe se você tem usado complemento e em que quantidade.
              </p>
            </CardHeader>
            <CardBody>
              <StatsChart
                type="line"
                labels={statsData.labels || []}
                datasets={[
                  {
                    label: 'Complemento (ml)',
                    data: statsData.complementMlPerDay || [],
                    borderColor: '#F39C12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    fill: true,
                  },
                ]}
                height={200}
              />
            </CardBody>
          </Card>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">💡 Olhar da Olive</h2>
              <p className="text-sm text-gray-600 mt-1">
                Insights automáticos baseados nos seus registros. Não substituem a avaliação da pediatra.
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Empty State para Insights */}
        {insights.length === 0 && statsData.feedingCount24h > 0 && (
          <Card>
            <CardBody className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Continue registrando as alimentações para receber insights personalizados!
              </p>
            </CardBody>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/routines/feeding')}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar nova alimentação
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/routines?type=feeding')}
            className="flex-1"
          >
            Ver histórico completo
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-500 py-4 border-t">
          <p>
            💙 Lembre-se: esses insights são gerados automaticamente e não substituem a orientação da sua pediatra.
            Em caso de dúvidas, sempre consulte seu profissional de saúde.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
