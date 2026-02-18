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
import type { StatsHistory } from '../../../hooks/useStats';

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

type ChartRange = '7d' | '14d' | '30d';

interface RoutineChartsProps {
  history: StatsHistory | null;
  breastSideDistribution?: { left: number; right: number; both: number };
  hourlyCounts?: number[];
  isLoading?: boolean;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}

const rangeOptions: { value: ChartRange; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, maxRotation: 45 },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.04)' },
      ticks: { font: { size: 11 } },
    },
  },
};

const legendChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
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

function RangeSelector({ range, onRangeChange }: { range: ChartRange; onRangeChange: (r: ChartRange) => void }) {
  return (
    <div className="flex gap-1">
      {rangeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onRangeChange(opt.value)}
          className={cn(
            'px-2.5 py-1 text-xs rounded-lg font-medium transition-all',
            range === opt.value
              ? 'bg-olive-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SleepChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Horas de sono',
      data,
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      borderWidth: 2,
    }],
  }), [labels, data]);

  const nonZero = data.filter(v => v > 0);
  const avg = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '0';
  const max = data.length > 0 ? Math.max(...data) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Padrão de Sono"
        subtitle={`Média: ${avg}h por dia`}
      />
      <CardBody className="h-52">
        <Line data={chartData} options={chartOptions} />
      </CardBody>
      {max > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400">Melhor noite: {max}h de sono</p>
        </div>
      )}
    </Card>
  );
}

function FeedingChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Alimentações',
      data,
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'rgb(245, 158, 11)',
      borderWidth: 1,
      borderRadius: 6,
    }],
  }), [labels, data]);

  const nonZero = data.filter(v => v > 0);
  const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Frequência de Alimentações"
        subtitle={`Média: ${avg} por dia`}
      />
      <CardBody className="h-52">
        <Bar data={chartData} options={chartOptions} />
      </CardBody>
    </Card>
  );
}

function FeedingDurationChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Minutos',
      data,
      borderColor: 'rgb(217, 119, 6)',
      backgroundColor: 'rgba(217, 119, 6, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: 'rgb(217, 119, 6)',
      borderWidth: 2,
    }],
  }), [labels, data]);

  const nonZero = data.filter(v => v > 0);
  const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Duração das Alimentações"
        subtitle={`Média: ${avg} min/dia`}
      />
      <CardBody className="h-52">
        <Line data={chartData} options={chartOptions} />
      </CardBody>
    </Card>
  );
}

function DiaperChart({ labels, total, wet, dirty }: { labels: string[]; total: number[]; wet: number[]; dirty: number[] }) {
  const hasBreakdown = wet.some(v => v > 0) || dirty.some(v => v > 0);

  const chartData = useMemo(() => {
    if (hasBreakdown) {
      return {
        labels,
        datasets: [
          {
            label: 'Xixi',
            data: wet,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 4,
            stack: 'stack0',
          },
          {
            label: 'Cocô',
            data: dirty,
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
            borderColor: 'rgb(168, 85, 247)',
            borderWidth: 1,
            borderRadius: 4,
            stack: 'stack0',
          },
        ],
      };
    }
    return {
      labels,
      datasets: [{
        label: 'Fraldas',
        data: total,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    };
  }, [labels, total, wet, dirty, hasBreakdown]);

  const stackedOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: hasBreakdown
        ? { display: true, position: 'bottom' as const, labels: { boxWidth: 12, padding: 12, font: { size: 11 } } }
        : { display: false },
    },
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, stacked: hasBreakdown },
      y: { ...chartOptions.scales.y, stacked: hasBreakdown },
    },
  };

  const nonZero = total.filter(v => v > 0);
  const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Trocas de Fralda"
        subtitle={`Média: ${avg} por dia`}
      />
      <CardBody className="h-52">
        <Bar data={chartData} options={stackedOptions} />
      </CardBody>
    </Card>
  );
}

function BathChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Banhos',
      data,
      backgroundColor: 'rgba(6, 182, 212, 0.6)',
      borderColor: 'rgb(6, 182, 212)',
      borderWidth: 1,
      borderRadius: 6,
    }],
  }), [labels, data]);

  const totalBaths = data.reduce((a, b) => a + b, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Frequência de Banhos"
        subtitle={`${totalBaths} banho(s) no período`}
      />
      <CardBody className="h-52">
        <Bar data={chartData} options={chartOptions} />
      </CardBody>
    </Card>
  );
}

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
        backgroundColor: 'rgba(236, 72, 153, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(236, 72, 153)',
      },
      {
        label: 'Mamadeira',
        data: bottle,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Complemento',
        data: complement,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(249, 115, 22)',
      },
    ],
  }), [labels, extraction, bottle, complement]);

  const totalExt = extraction.reduce((a, b) => a + b, 0);
  const totalBot = bottle.reduce((a, b) => a + b, 0);
  const totalComp = complement.reduce((a, b) => a + b, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Volume de Leite (ml)"
        subtitle="Extração, mamadeira e complemento"
      />
      <CardBody className="h-56">
        <Line data={chartData} options={legendChartOptions} />
      </CardBody>
      {(totalExt > 0 || totalBot > 0 || totalComp > 0) && (
        <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500" />Ext: {totalExt}ml
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />Mam: {totalBot}ml
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />Comp: {totalComp}ml
          </span>
        </div>
      )}
    </Card>
  );
}

function BreastSideChart({ distribution }: { distribution: { left: number; right: number; both: number } }) {
  const chartData = useMemo(() => ({
    labels: ['Esquerdo', 'Direito', 'Ambos'],
    datasets: [{
      data: [distribution.left, distribution.right, distribution.both],
      backgroundColor: [
        'rgba(236, 72, 153, 0.75)',
        'rgba(59, 130, 246, 0.75)',
        'rgba(168, 85, 247, 0.75)',
      ],
      borderColor: ['rgb(236, 72, 153)', 'rgb(59, 130, 246)', 'rgb(168, 85, 247)'],
      borderWidth: 2,
    }],
  }), [distribution]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { padding: 12, font: { size: 11 } },
      },
    },
  };

  const total = distribution.left + distribution.right + distribution.both;
  const dominantSide = distribution.left > distribution.right ? 'esquerdo' :
    distribution.right > distribution.left ? 'direito' : 'equilibrado';

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        title="Lado das Amamentações"
        subtitle={`Total: ${total} amamentações`}
      />
      <CardBody className="h-52">
        <Doughnut data={chartData} options={options} />
      </CardBody>
      {total > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400">
            Lado {dominantSide} mais usado.
            {dominantSide !== 'equilibrado' && ' Tente alternar para equilibrar a produção.'}
          </p>
        </div>
      )}
    </Card>
  );
}

function HourlyActivityChart({ hourlyCounts }: { hourlyCounts: number[] }) {
  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const maxCount = Math.max(...hourlyCounts, 1);

  const getColor = (value: number) => {
    const intensity = value / maxCount;
    if (intensity === 0) return 'rgba(209, 213, 219, 0.3)';
    if (intensity < 0.25) return 'rgba(99, 102, 241, 0.3)';
    if (intensity < 0.5) return 'rgba(99, 102, 241, 0.5)';
    if (intensity < 0.75) return 'rgba(99, 102, 241, 0.7)';
    return 'rgba(99, 102, 241, 0.9)';
  };

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Atividades',
      data: hourlyCounts,
      backgroundColor: hourlyCounts.map(getColor),
      borderColor: hourlyCounts.map(v => v > 0 ? 'rgba(99, 102, 241, 0.8)' : 'transparent'),
      borderWidth: 1,
      borderRadius: 3,
    }],
  }), [hourlyCounts]);

  const options = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: { ...chartOptions.scales.y.ticks, stepSize: 1 },
      },
    },
  };

  const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
  const totalActivities = hourlyCounts.reduce((a, b) => a + b, 0);

  return (
    <Card className="border-0 shadow-sm md:col-span-2">
      <CardHeader
        title="Distribuição Horária (24h)"
        subtitle={totalActivities > 0 ? `Pico de atividade: ${peakHour}h` : 'Nenhuma atividade registrada'}
      />
      <CardBody className="h-52">
        <Bar data={chartData} options={options} />
      </CardBody>
    </Card>
  );
}

export function RoutineCharts({ history, breastSideDistribution, hourlyCounts, isLoading, range, onRangeChange }: RoutineChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardBody className="p-4"><ChartSkeleton /></CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="p-8 text-center">
          <p className="text-gray-500">Registre rotinas para visualizar gráficos</p>
        </CardBody>
      </Card>
    );
  }

  const hasData = history.sleepHours.some(v => v > 0) ||
    history.feedingCounts.some(v => v > 0) ||
    history.diaperCounts.some(v => v > 0) ||
    history.bathCounts.some(v => v > 0);

  if (!hasData) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="p-8 text-center">
          <p className="text-gray-500">Os gráficos aparecerão conforme você registrar rotinas</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Padrões e Gráficos
        </h2>
        <RangeSelector range={range} onRangeChange={onRangeChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.sleepHours.some(v => v > 0) && (
          <SleepChart labels={history.labels} data={history.sleepHours} />
        )}

        {history.feedingCounts.some(v => v > 0) && (
          <FeedingChart labels={history.labels} data={history.feedingCounts} />
        )}

        {history.feedingMinutes.some(v => v > 0) && (
          <FeedingDurationChart labels={history.labels} data={history.feedingMinutes} />
        )}

        {history.diaperCounts.some(v => v > 0) && (
          <DiaperChart
            labels={history.labels}
            total={history.diaperCounts}
            wet={history.diaperWetCounts}
            dirty={history.diaperDirtyCounts}
          />
        )}

        {history.bathCounts.some(v => v > 0) && (
          <BathChart labels={history.labels} data={history.bathCounts} />
        )}

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

        {breastSideDistribution &&
          (breastSideDistribution.left > 0 || breastSideDistribution.right > 0 || breastSideDistribution.both > 0) && (
          <BreastSideChart distribution={breastSideDistribution} />
        )}

        {hourlyCounts && hourlyCounts.some(v => v > 0) && (
          <HourlyActivityChart hourlyCounts={hourlyCounts} />
        )}
      </div>
    </div>
  );
}
