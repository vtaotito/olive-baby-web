// Olive Baby Web - Routine Charts Component
// Gráficos para visualização de padrões

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardBody, CardHeader } from '../../ui';
import { cn } from '../../../lib/utils';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsHistory {
  labels: string[];
  sleepHours: number[];
  feedingCounts: number[];
  feedingMinutes: number[];
  diaperCounts: number[];
  extractionMl: number[];
  bottleMl: number[];
  complementMl: number[];
  // Novos campos para volumetria por tipo
  breastMilkMl?: number[];
  formulaMl?: number[];
  mixedMl?: number[];
}

interface RoutineChartsProps {
  history: StatsHistory | null;
  breastSideDistribution?: { left: number; right: number; both: number };
  isLoading?: boolean;
}

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
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-48 bg-gray-100 rounded"></div>
    </div>
  );
}

// Gráfico de Padrão de Sono
function SleepChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Horas de sono',
        data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
      },
    ],
  }), [labels, data]);

  const avg = data.length > 0 ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1) : 0;
  const max = data.length > 0 ? Math.max(...data) : 0;

  return (
    <Card>
      <CardHeader 
        title="😴 Padrão de Sono" 
        subtitle={`Média: ${avg}h por dia`}
      />
      <CardBody className="h-48">
        <Line data={chartData} options={chartOptions} />
      </CardBody>
      {max > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500">
            💡 Melhor noite: {max}h de sono
          </p>
        </div>
      )}
    </Card>
  );
}

// Gráfico de Frequência de Alimentações
function FeedingChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Alimentações',
        data,
        backgroundColor: 'rgba(251, 191, 36, 0.7)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }), [labels, data]);

  const avg = data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;

  return (
    <Card>
      <CardHeader 
        title="🍼 Frequência de Alimentações" 
        subtitle={`Média: ${avg} por dia`}
      />
      <CardBody className="h-48">
        <Bar data={chartData} options={chartOptions} />
      </CardBody>
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500">
          💡 6-12 alimentações por dia é normal para recém-nascidos
        </p>
      </div>
    </Card>
  );
}

// Gráfico de Trocas de Fralda
function DiaperChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Fraldas',
        data,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }), [labels, data]);

  const avg = data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;

  return (
    <Card>
      <CardHeader 
        title="🚼 Trocas de Fralda" 
        subtitle={`Média: ${avg} por dia`}
      />
      <CardBody className="h-48">
        <Bar data={chartData} options={chartOptions} />
      </CardBody>
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500">
          💡 6-8 fraldas molhadas indica boa hidratação
        </p>
      </div>
    </Card>
  );
}

// Gráfico de Volume (Extração, Mamadeira, Complemento)
function VolumeChart({ 
  labels, 
  extraction, 
  bottle, 
  complement 
}: { 
  labels: string[]; 
  extraction: number[]; 
  bottle: number[]; 
  complement: number[];
}) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Extração',
        data: extraction,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Mamadeira',
        data: bottle,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Complemento',
        data: complement,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }), [labels, extraction, bottle, complement]);

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader 
        title="💧 Volume de Leite (ml)" 
        subtitle="Extração, mamadeira e complemento"
      />
      <CardBody className="h-56">
        <Line data={chartData} options={options} />
      </CardBody>
    </Card>
  );
}

// Gráfico de Volumetria por Tipo de Leite
function VolumeByTypeChart({ 
  labels, 
  breastMilk, 
  formula, 
  mixed 
}: { 
  labels: string[]; 
  breastMilk: number[]; 
  formula: number[]; 
  mixed: number[];
}) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Leite Materno',
        data: breastMilk,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(236, 72, 153)',
      },
      {
        label: 'Fórmula',
        data: formula,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Misto',
        data: mixed,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(168, 85, 247)',
      },
    ],
  }), [labels, breastMilk, formula, mixed]);

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const totalBreastMilk = breastMilk.reduce((a, b) => a + b, 0);
  const totalFormula = formula.reduce((a, b) => a + b, 0);
  const totalMixed = mixed.reduce((a, b) => a + b, 0);
  const total = totalBreastMilk + totalFormula + totalMixed;

  return (
    <Card>
      <CardHeader 
        title="🍼 Volumetria Ofertada (ml)" 
        subtitle="Mamadeira + complementos por tipo"
      />
      <CardBody className="h-56">
        <Line data={chartData} options={options} />
      </CardBody>
      {total > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            LM: {totalBreastMilk}ml
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Fórmula: {totalFormula}ml
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Misto: {totalMixed}ml
          </span>
        </div>
      )}
    </Card>
  );
}

// Gráfico de Distribuição dos Lados (Amamentação)
function BreastSideChart({ distribution }: { distribution: { left: number; right: number; both: number } }) {
  const chartData = useMemo(() => ({
    labels: ['Esquerdo', 'Direito', 'Ambos'],
    datasets: [
      {
        data: [distribution.left, distribution.right, distribution.both],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(236, 72, 153)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
    ],
  }), [distribution]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const total = distribution.left + distribution.right + distribution.both;
  const dominantSide = distribution.left > distribution.right ? 'esquerdo' : 
                       distribution.right > distribution.left ? 'direito' : 'equilibrado';

  return (
    <Card>
      <CardHeader 
        title="🤱 Lado das Amamentações" 
        subtitle={`Total: ${total} amamentações`}
      />
      <CardBody className="h-48">
        <Doughnut data={chartData} options={options} />
      </CardBody>
      {total > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500">
            💡 Lado {dominantSide} mais usado. 
            {dominantSide !== 'equilibrado' && ' Tente alternar para equilibrar a produção.'}
          </p>
        </div>
      )}
    </Card>
  );
}

// Componente principal
export function RoutineCharts({ history, breastSideDistribution, isLoading }: RoutineChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <ChartSkeleton />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (!history) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-500">Registre rotinas para visualizar gráficos</p>
        </CardBody>
      </Card>
    );
  }

  const hasData = history.sleepHours.some(v => v > 0) || 
                  history.feedingCounts.some(v => v > 0) ||
                  history.diaperCounts.some(v => v > 0);

  if (!hasData) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <p className="text-gray-500">📊 Os gráficos aparecerão conforme você registrar rotinas</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        📊 Padrões da Semana
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sono */}
        {history.sleepHours.some(v => v > 0) && (
          <SleepChart labels={history.labels} data={history.sleepHours} />
        )}

        {/* Alimentações */}
        {history.feedingCounts.some(v => v > 0) && (
          <FeedingChart labels={history.labels} data={history.feedingCounts} />
        )}

        {/* Fraldas */}
        {history.diaperCounts.some(v => v > 0) && (
          <DiaperChart labels={history.labels} data={history.diaperCounts} />
        )}

        {/* Volume de leite (extração, mamadeira, complemento) */}
        {(history.extractionMl.some(v => v > 0) || 
          history.bottleMl.some(v => v > 0) || 
          history.complementMl.some(v => v > 0)) && (
          <VolumeChart 
            labels={history.labels}
            extraction={history.extractionMl}
            bottle={history.bottleMl}
            complement={history.complementMl}
          />
        )}

        {/* Volumetria por tipo de leite (novo gráfico) */}
        {(history.breastMilkMl?.some(v => v > 0) || 
          history.formulaMl?.some(v => v > 0) || 
          history.mixedMl?.some(v => v > 0)) && (
          <VolumeByTypeChart 
            labels={history.labels}
            breastMilk={history.breastMilkMl || history.labels.map(() => 0)}
            formula={history.formulaMl || history.labels.map(() => 0)}
            mixed={history.mixedMl || history.labels.map(() => 0)}
          />
        )}

        {/* Distribuição de lados */}
        {breastSideDistribution && 
         (breastSideDistribution.left > 0 || breastSideDistribution.right > 0 || breastSideDistribution.both > 0) && (
          <BreastSideChart distribution={breastSideDistribution} />
        )}
      </div>
    </div>
  );
}
