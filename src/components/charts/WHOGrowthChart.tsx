// Olive Baby Web - WHO Growth Chart Component
// Grafico de crescimento com curvas de referencia OMS (0-24 meses)
// Com seletor de range para melhor visualizacao
import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { cn } from '../../lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// WHO Growth Standards (0-24 meses, meninos e meninas combinados - media)
const WHO_MONTHS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

const WHO_WEIGHT = {
  p3:   [2.5, 3.4, 4.3, 5.0, 5.6, 6.1, 6.4, 6.7, 7.0, 7.2, 7.4, 7.6, 7.7, 7.9, 8.1, 8.3, 8.4, 8.6, 8.8, 8.9, 9.1, 9.2, 9.4, 9.5, 9.7],
  p15:  [2.9, 3.9, 4.9, 5.7, 6.2, 6.7, 7.1, 7.4, 7.7, 7.9, 8.1, 8.4, 8.5, 8.7, 8.9, 9.1, 9.3, 9.5, 9.7, 9.8, 10.0, 10.2, 10.3, 10.5, 10.7],
  p50:  [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 9.9, 10.1, 10.3, 10.5, 10.7, 10.9, 11.1, 11.3, 11.5, 11.8, 12.0, 12.2],
  p85:  [3.9, 5.1, 6.3, 7.2, 7.8, 8.4, 8.8, 9.2, 9.6, 9.9, 10.2, 10.5, 10.8, 11.0, 11.3, 11.5, 11.7, 12.0, 12.2, 12.4, 12.7, 12.9, 13.2, 13.4, 13.7],
  p97:  [4.4, 5.8, 7.1, 8.0, 8.7, 9.3, 9.8, 10.3, 10.7, 11.0, 11.4, 11.7, 12.0, 12.3, 12.6, 12.8, 13.1, 13.4, 13.7, 13.9, 14.2, 14.5, 14.7, 15.0, 15.3],
};

const WHO_LENGTH = {
  p3:   [46.3, 51.1, 54.7, 57.6, 59.9, 61.9, 63.6, 65.1, 66.5, 67.7, 69.0, 70.2, 71.3, 72.4, 73.4, 74.4, 75.4, 76.3, 77.2, 78.1, 79.0, 79.9, 80.8, 81.6, 82.5],
  p15:  [47.9, 52.7, 56.4, 59.3, 61.7, 63.7, 65.4, 67.0, 68.4, 69.7, 71.0, 72.2, 73.4, 74.5, 75.6, 76.6, 77.6, 78.6, 79.5, 80.4, 81.3, 82.2, 83.1, 84.0, 84.8],
  p50:  [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7, 76.9, 78.0, 79.1, 80.2, 81.2, 82.3, 83.2, 84.2, 85.1, 86.0, 86.9, 87.8],
  p85:  [51.8, 56.7, 60.5, 63.5, 66.0, 68.1, 69.8, 71.4, 72.8, 74.2, 75.6, 76.9, 78.1, 79.3, 80.5, 81.7, 82.8, 83.9, 85.0, 86.0, 87.1, 88.0, 89.0, 89.9, 90.9],
  p97:  [53.4, 58.4, 62.2, 65.3, 67.8, 69.9, 71.6, 73.2, 74.7, 76.2, 77.6, 78.9, 80.2, 81.4, 82.7, 83.9, 85.0, 86.2, 87.3, 88.4, 89.5, 90.5, 91.6, 92.5, 93.6],
};

const WHO_HEAD = {
  p3:   [32.1, 34.9, 36.8, 38.1, 39.2, 40.0, 40.7, 41.3, 41.8, 42.3, 42.6, 43.0, 43.3, 43.5, 43.8, 44.0, 44.2, 44.4, 44.6, 44.7, 44.9, 45.1, 45.2, 45.3, 45.5],
  p15:  [33.1, 35.9, 37.8, 39.2, 40.2, 41.1, 41.8, 42.4, 42.9, 43.3, 43.7, 44.1, 44.4, 44.6, 44.9, 45.1, 45.3, 45.5, 45.7, 45.9, 46.0, 46.2, 46.3, 46.5, 46.6],
  p50:  [34.5, 37.3, 39.1, 40.5, 41.6, 42.6, 43.3, 43.8, 44.4, 44.8, 45.2, 45.6, 45.9, 46.1, 46.4, 46.6, 46.8, 47.0, 47.2, 47.4, 47.5, 47.7, 47.8, 48.0, 48.1],
  p85:  [35.8, 38.6, 40.5, 41.9, 43.0, 44.0, 44.7, 45.3, 45.8, 46.3, 46.7, 47.1, 47.4, 47.7, 47.9, 48.2, 48.4, 48.6, 48.8, 48.9, 49.1, 49.3, 49.4, 49.6, 49.7],
  p97:  [36.9, 39.8, 41.5, 43.0, 44.1, 45.0, 45.8, 46.4, 46.9, 47.4, 47.8, 48.2, 48.5, 48.8, 49.1, 49.3, 49.5, 49.7, 49.9, 50.1, 50.3, 50.4, 50.6, 50.7, 50.9],
};

type ChartType = 'weight' | 'length' | 'head';

interface MeasurementPoint {
  ageMonths: number;
  value: number;
  date?: string;
}

interface WHOGrowthChartProps {
  birthDate: string;
  measurements: {
    date: string;
    weightKg?: number;
    lengthCm?: number;
    headCm?: number;
  }[];
}

type RangeOption = { label: string; min: number; max: number };

const RANGE_OPTIONS: RangeOption[] = [
  { label: '0-3m', min: 0, max: 3 },
  { label: '0-6m', min: 0, max: 6 },
  { label: '0-9m', min: 0, max: 9 },
  { label: '0-12m', min: 0, max: 12 },
  { label: '0-18m', min: 0, max: 18 },
  { label: '0-24m', min: 0, max: 24 },
];

function getWHOData(type: ChartType) {
  switch (type) {
    case 'weight': return WHO_WEIGHT;
    case 'length': return WHO_LENGTH;
    case 'head': return WHO_HEAD;
  }
}

function getUnit(type: ChartType) {
  switch (type) {
    case 'weight': return 'kg';
    case 'length': return 'cm';
    case 'head': return 'cm';
  }
}

function getLabel(type: ChartType) {
  switch (type) {
    case 'weight': return 'Peso';
    case 'length': return 'Comprimento';
    case 'head': return 'Per. Cefalico';
  }
}

export function WHOGrowthChart({ birthDate, measurements }: WHOGrowthChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('weight');

  // Calculate baby age to auto-select best range
  const babyAgeMonths = useMemo(() => {
    const birth = new Date(birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  }, [birthDate]);

  // Auto-select best initial range based on baby's age
  const getDefaultRange = (): RangeOption => {
    if (babyAgeMonths <= 3) return RANGE_OPTIONS[0]; // 0-3m
    if (babyAgeMonths <= 6) return RANGE_OPTIONS[1]; // 0-6m
    if (babyAgeMonths <= 9) return RANGE_OPTIONS[2]; // 0-9m
    if (babyAgeMonths <= 12) return RANGE_OPTIONS[3]; // 0-12m
    if (babyAgeMonths <= 18) return RANGE_OPTIONS[4]; // 0-18m
    return RANGE_OPTIONS[5]; // 0-24m
  };

  const [selectedRange, setSelectedRange] = useState<RangeOption>(getDefaultRange);

  const babyPoints = useMemo(() => {
    const birth = new Date(birthDate);
    const points: Record<ChartType, MeasurementPoint[]> = { weight: [], length: [], head: [] };

    for (const m of measurements) {
      const mDate = new Date(m.date);
      const ageMonths = (mDate.getFullYear() - birth.getFullYear()) * 12 + (mDate.getMonth() - birth.getMonth());
      const ageDays = (mDate.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
      const ageMonthsPrecise = Math.max(0, ageDays / 30.44);
      const ageAdjusted = Math.max(0, Math.min(24, ageMonthsPrecise));

      if (m.weightKg && m.weightKg > 0) {
        points.weight.push({ ageMonths: ageAdjusted, value: m.weightKg, date: m.date });
      }
      if (m.lengthCm && m.lengthCm > 0) {
        points.length.push({ ageMonths: ageAdjusted, value: m.lengthCm, date: m.date });
      }
      if (m.headCm && m.headCm > 0) {
        points.head.push({ ageMonths: ageAdjusted, value: m.headCm, date: m.date });
      }
    }

    return points;
  }, [birthDate, measurements]);

  const hasData = (type: ChartType) => babyPoints[type].length > 0;

  // Filter months for the selected range
  const rangeMonths = useMemo(() => {
    return WHO_MONTHS.filter(m => m >= selectedRange.min && m <= selectedRange.max);
  }, [selectedRange]);

  const chartData = useMemo(() => {
    const who = getWHOData(activeChart);
    const unit = getUnit(activeChart);
    const points = babyPoints[activeChart];
    const { min, max } = selectedRange;

    // Slice WHO data to selected range
    const sliceStart = min;
    const sliceEnd = max + 1;
    const whoP3 = who.p3.slice(sliceStart, sliceEnd);
    const whoP15 = who.p15.slice(sliceStart, sliceEnd);
    const whoP50 = who.p50.slice(sliceStart, sliceEnd);
    const whoP85 = who.p85.slice(sliceStart, sliceEnd);
    const whoP97 = who.p97.slice(sliceStart, sliceEnd);

    // Map baby points to the WHO months array within range (sparse)
    const babyData = rangeMonths.map(month => {
      const point = points.find(p => Math.round(p.ageMonths) === month);
      return point ? point.value : null;
    });

    return {
      labels: rangeMonths.map(m => `${m}m`),
      datasets: [
        {
          label: 'P97',
          data: whoP97,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          order: 5,
        },
        {
          label: 'P85',
          data: whoP85,
          borderColor: 'rgba(245, 158, 11, 0.3)',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: '-1',
          tension: 0.4,
          order: 4,
        },
        {
          label: 'P50 (mediana)',
          data: whoP50,
          borderColor: 'rgba(34, 197, 94, 0.6)',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          borderWidth: 2,
          pointRadius: 0,
          fill: '-1',
          tension: 0.4,
          order: 3,
        },
        {
          label: 'P15',
          data: whoP15,
          borderColor: 'rgba(245, 158, 11, 0.3)',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: '-1',
          tension: 0.4,
          order: 2,
        },
        {
          label: 'P3',
          data: whoP3,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: '-1',
          tension: 0.4,
          order: 1,
        },
        {
          label: `${getLabel(activeChart)} do bebe (${unit})`,
          data: babyData,
          borderColor: 'rgb(99, 118, 98)',
          backgroundColor: 'rgb(99, 118, 98)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(99, 118, 98)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          spanGaps: true,
          order: 0,
        },
      ],
    };
  }, [activeChart, babyPoints, selectedRange, rangeMonths]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11 },
          filter: (item: any) => {
            return ['P3', 'P50 (mediana)', 'P97'].includes(item.text) || item.text.includes('bebe');
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            const month = items[0]?.label;
            return `Idade: ${month}`;
          },
          label: (context: any) => {
            const val = context.raw;
            if (val === null || val === undefined) return '';
            const unit = getUnit(activeChart);
            return `${context.dataset.label}: ${typeof val === 'number' ? val.toFixed(1) : val} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Idade (meses)',
          font: { size: 12, weight: 'bold' as const },
          color: '#6b7280',
        },
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        title: {
          display: true,
          text: `${getLabel(activeChart)} (${getUnit(activeChart)})`,
          font: { size: 12, weight: 'bold' as const },
          color: '#6b7280',
        },
        grid: { color: 'rgba(0, 0, 0, 0.04)' },
        ticks: { font: { size: 10 } },
      },
    },
  }), [activeChart]);

  // Determine if baby is within normal range
  const latestAssessment = useMemo(() => {
    const points = babyPoints[activeChart];
    if (points.length === 0) return null;
    const latest = points[points.length - 1];
    const who = getWHOData(activeChart);
    const monthIdx = Math.min(Math.round(latest.ageMonths), 24);
    const p3 = who.p3[monthIdx];
    const p15 = who.p15[monthIdx];
    const p50 = who.p50[monthIdx];
    const p85 = who.p85[monthIdx];
    const p97 = who.p97[monthIdx];
    const v = latest.value;

    let status: 'low' | 'watch-low' | 'normal' | 'watch-high' | 'high';
    let percentile: string;
    if (v < p3) { status = 'low'; percentile = '< P3'; }
    else if (v < p15) { status = 'watch-low'; percentile = 'P3-P15'; }
    else if (v <= p85) { status = 'normal'; percentile = v <= p50 ? 'P15-P50' : 'P50-P85'; }
    else if (v <= p97) { status = 'watch-high'; percentile = 'P85-P97'; }
    else { status = 'high'; percentile = '> P97'; }

    return { status, percentile, value: v, ageMonths: latest.ageMonths };
  }, [activeChart, babyPoints]);

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'low': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Abaixo do esperado' },
    'watch-low': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Atencao - abaixo da mediana' },
    'normal': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Dentro do esperado' },
    'watch-high': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Atencao - acima da mediana' },
    'high': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Acima do esperado' },
  };

  const tabs: { key: ChartType; label: string; icon: string }[] = [
    { key: 'weight', label: 'Peso', icon: '⚖️' },
    { key: 'length', label: 'Comprimento', icon: '📏' },
    { key: 'head', label: 'Per. Cefalico', icon: '🧠' },
  ];

  return (
    <div className="space-y-4">
      {/* Chart type selector + Range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeChart === tab.key
                  ? 'bg-olive-100 dark:bg-olive-900/40 text-olive-800 dark:text-olive-200 ring-1 ring-olive-300 dark:ring-olive-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                !hasData(tab.key) && 'opacity-50'
              )}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
              {hasData(tab.key) && (
                <span className="ml-0.5 text-xs opacity-60">({babyPoints[tab.key].length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Periodo:</span>
          {RANGE_OPTIONS.map(range => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                selectedRange.label === range.label
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status indicator */}
      {latestAssessment && (
        <div className={cn('flex items-center gap-3 p-3 rounded-lg', statusConfig[latestAssessment.status].bg)}>
          <div className={cn('text-sm font-medium', statusConfig[latestAssessment.status].text)}>
            {statusConfig[latestAssessment.status].label}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ultima medicao: {latestAssessment.value.toFixed(1)} {getUnit(activeChart)} ({latestAssessment.percentile}) aos {Math.round(latestAssessment.ageMonths)} meses
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      {/* Legend explanation */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="font-medium">Percentis OMS:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-300" />
          <span>P3 / P97 (limites)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-amber-300" />
          <span>P15 / P85</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-1 bg-green-400 rounded" />
          <span>P50 (mediana)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-olive-600 border-2 border-white" />
          <span>Bebe</span>
        </div>
      </div>
    </div>
  );
}
