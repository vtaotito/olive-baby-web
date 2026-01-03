// Olive Baby Web - Routine Charts Component
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { Card, CardBody, CardHeader } from '../ui';

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
}

interface RoutineChartsProps {
  history: StatsHistory | null;
  breastSideDistribution?: { left: number; right: number; both: number };
  isLoading?: boolean;
}

export function RoutineCharts({ history, breastSideDistribution, isLoading }: RoutineChartsProps) {
  if (isLoading || !history) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardBody className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  // Configuração comum
  const commonOptions = {
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
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  // Dados do gráfico de sono
  const sleepData = {
    labels: history.labels,
    datasets: [
      {
        label: 'Horas de Sono',
        data: history.sleepHours,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados do gráfico de alimentações
  const feedingData = {
    labels: history.labels,
    datasets: [
      {
        label: 'Alimentações',
        data: history.feedingCounts,
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  // Dados do gráfico de fraldas
  const diaperData = {
    labels: history.labels,
    datasets: [
      {
        label: 'Trocas de Fralda',
        data: history.diaperCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  // Dados do gráfico de distribuição de lado (donut)
  const breastSideData = {
    labels: ['Esquerdo', 'Direito', 'Ambos'],
    datasets: [
      {
        data: [
          breastSideDistribution?.left || 40,
          breastSideDistribution?.right || 35,
          breastSideDistribution?.both || 25,
        ],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de Sono */}
      <Card>
        <CardHeader 
          title="📊 Padrão de Sono (7 dias)" 
          subtitle="Horas de sono por dia"
        />
        <CardBody className="p-4">
          <div className="h-48">
            <Line data={sleepData} options={commonOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Um padrão estável ajuda o ritmo circadiano do bebê
          </p>
        </CardBody>
      </Card>

      {/* Gráfico de Alimentações */}
      <Card>
        <CardHeader 
          title="🍼 Frequência de Alimentações" 
          subtitle="Quantidade por dia"
        />
        <CardBody className="p-4">
          <div className="h-48">
            <Bar data={feedingData} options={commonOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Variações são normais, especialmente em saltos de desenvolvimento
          </p>
        </CardBody>
      </Card>

      {/* Gráfico de Fraldas */}
      <Card>
        <CardHeader 
          title="🚼 Trocas de Fralda" 
          subtitle="Por dia"
        />
        <CardBody className="p-4">
          <div className="h-48">
            <Bar data={diaperData} options={commonOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 6-8 trocas por dia é sinal de boa hidratação
          </p>
        </CardBody>
      </Card>

      {/* Gráfico de Lado das Amamentações */}
      <Card>
        <CardHeader 
          title="🤱 Lado das Amamentações" 
          subtitle="Distribuição semanal"
        />
        <CardBody className="p-4">
          <div className="h-48 flex items-center justify-center">
            <div className="w-40 h-40">
              <Doughnut 
                data={breastSideData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Alternar os lados ajuda na produção equilibrada de leite
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
