// Olive Baby Web - Breast Side Distribution Chart
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BreastSideChartProps {
  distribution: {
    left: number;
    right: number;
    both: number;
  };
}

export function BreastSideChart({ distribution }: BreastSideChartProps) {
  const data = {
    labels: ['Esquerdo', 'Direito', 'Ambos'],
    datasets: [
      {
        data: [distribution.left, distribution.right, distribution.both],
        backgroundColor: ['#FF6B9D', '#C44569', '#A05194'],
        borderColor: ['#FF6B9D', '#C44569', '#A05194'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = distribution.left + distribution.right + distribution.both;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} amamentações (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}
