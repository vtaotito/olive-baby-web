// Olive Baby Web - Volume By Type Dashboard Component
// Gráfico de volumetria ofertada por tipo de leite (LM/Fórmula/Misto)

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Card, CardBody, CardHeader, Spinner } from '../../ui';
import { statsService } from '../../../services/api';
import { cn } from '../../../lib/utils';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VolumeByTypeDashboardProps {
  babyId: number;
}

type RangeOption = '7d' | '14d' | '30d';

const rangeOptions: { value: RangeOption; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
];

interface VolumeByTypeData {
  labels: string[];
  breastMilkMl: number[];
  formulaMl: number[];
  mixedMl: number[];
  totals: {
    breastMilk: number;
    formula: number;
    mixed: number;
    total: number;
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
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
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 10,
        },
        maxRotation: 45,
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
        callback: (value: number | string) => `${value}ml`,
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
};

export function VolumeByTypeDashboard({ babyId }: VolumeByTypeDashboardProps) {
  const [range, setRange] = useState<RangeOption>('7d');
  
  // Buscar dados de volumetria por tipo do backend
  const { data: volumeData, isLoading } = useQuery<VolumeByTypeData>({
    queryKey: ['volume-by-type', babyId, range],
    queryFn: async () => {
      const response = await statsService.getVolumeByType(babyId, range);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Extrair dados
  const labels = volumeData?.labels || [];
  const breastMilkMl = volumeData?.breastMilkMl || [];
  const formulaMl = volumeData?.formulaMl || [];
  const mixedMl = volumeData?.mixedMl || [];
  
  // Dados do gráfico
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Leite Materno',
        data: breastMilkMl,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
      },
      {
        label: 'Fórmula',
        data: formulaMl,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Misto',
        data: mixedMl,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
      },
    ],
  }), [labels, breastMilkMl, formulaMl, mixedMl]);
  
  // Totais (usar do backend se disponível)
  const totalBreastMilk = volumeData?.totals?.breastMilk ?? breastMilkMl.reduce((a, b) => a + b, 0);
  const totalFormula = volumeData?.totals?.formula ?? formulaMl.reduce((a, b) => a + b, 0);
  const totalMixed = volumeData?.totals?.mixed ?? mixedMl.reduce((a, b) => a + b, 0);
  const total = volumeData?.totals?.total ?? (totalBreastMilk + totalFormula + totalMixed);
  
  // Se não há dados relevantes, não exibir
  if (!isLoading && total === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🍼 Volumetria Ofertada
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Mamadeira + complementos por tipo</p>
          </div>
          <div className="flex gap-1">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={cn(
                  'px-2 py-1 text-xs rounded-md transition-all',
                  range === opt.value
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            <div className="h-56">
              <Line data={chartData} options={chartOptions} />
            </div>
            
            {/* Totais do período */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span className="text-gray-600">Leite Materno:</span>
                <span className="font-semibold text-gray-900">{totalBreastMilk.toLocaleString()}ml</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">Fórmula:</span>
                <span className="font-semibold text-gray-900">{totalFormula.toLocaleString()}ml</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-gray-600">Misto:</span>
                <span className="font-semibold text-gray-900">{totalMixed.toLocaleString()}ml</span>
              </div>
            </div>
            
            {/* Tip */}
            <p className="mt-3 text-xs text-gray-400">
              💡 Inclui volume de mamadeira e complementos da amamentação
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
