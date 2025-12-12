// Olive Baby Web - Hourly Heatmap Chart
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HourlyHeatmapProps {
  hourlyCounts: number[];
  hourlyLabels?: string[];
}

export function HourlyHeatmap({ hourlyCounts, hourlyLabels }: HourlyHeatmapProps) {
  const labels = hourlyLabels || Array.from({ length: 24 }, (_, i) => `${i}h`);
  
  // Cores baseadas na intensidade (gradiente)
  const maxCount = Math.max(...hourlyCounts, 1);
  const getColor = (value: number) => {
    const intensity = value / maxCount;
    if (intensity === 0) return 'rgba(232, 244, 248, 0.3)';
    if (intensity < 0.3) return 'rgba(0, 107, 166, 0.4)';
    if (intensity < 0.6) return 'rgba(0, 107, 166, 0.6)';
    return 'rgba(0, 107, 166, 0.9)';
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Mamadas por hora',
        data: hourlyCounts,
        backgroundColor: hourlyCounts.map(getColor),
        borderColor: hourlyCounts.map((_, i) => 
          hourlyCounts[i] > 0 ? 'rgba(0, 107, 166, 1)' : 'transparent'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const count = context.parsed.y;
            if (count === 0) return 'Nenhuma mamada neste horário';
            return `${count} mamada${count > 1 ? 's' : ''} às ${context.label}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}
