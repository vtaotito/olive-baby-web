// Olive Baby Web - Stats Chart Component
import { useEffect, useRef } from 'react';
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

// Register Chart.js components
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

interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  fill?: boolean;
}

interface StatsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  labels: string[];
  datasets: ChartDataset[];
  title?: string;
  height?: number;
}

const defaultColors = [
  { border: 'rgb(99, 118, 98)', background: 'rgba(99, 118, 98, 0.2)' },
  { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.2)' },
  { border: 'rgb(234, 179, 8)', background: 'rgba(234, 179, 8, 0.2)' },
  { border: 'rgb(168, 85, 247)', background: 'rgba(168, 85, 247, 0.2)' },
  { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.2)' },
];

export function StatsChart({ type, labels, datasets, title, height = 300 }: StatsChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds, index) => ({
      ...ds,
      borderColor: ds.borderColor || defaultColors[index % defaultColors.length].border,
      backgroundColor: ds.backgroundColor || defaultColors[index % defaultColors.length].background,
      tension: 0.3,
      fill: ds.fill ?? true,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    } : undefined,
  };

  const ChartComponent = type === 'line' ? Line : type === 'bar' ? Bar : Doughnut;

  return (
    <div style={{ height }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
}

// Specific chart components
export function SleepChart({ data }: { data: { date: string; hours: number }[] }) {
  return (
    <StatsChart
      type="line"
      labels={data.map(d => d.date)}
      datasets={[
        {
          label: 'Horas de sono',
          data: data.map(d => d.hours),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
        },
      ]}
    />
  );
}

export function FeedingChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <StatsChart
      type="bar"
      labels={data.map(d => d.date)}
      datasets={[
        {
          label: 'Alimentações',
          data: data.map(d => d.count),
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.6)',
        },
      ]}
    />
  );
}

export function DiaperChart({ data }: { data: { pee: number; poop: number; both: number } }) {
  return (
    <StatsChart
      type="doughnut"
      labels={['Xixi', 'Cocô', 'Ambos']}
      datasets={[
        {
          label: 'Fraldas',
          data: [data.pee, data.poop, data.both],
          backgroundColor: [
            'rgba(234, 179, 8, 0.8)',
            'rgba(180, 83, 9, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
        },
      ]}
      height={250}
    />
  );
}

export function GrowthChart({ data }: { data: { date: string; weight?: number; length?: number }[] }) {
  const datasets: ChartDataset[] = [];
  
  if (data.some(d => d.weight !== undefined)) {
    datasets.push({
      label: 'Peso (kg)',
      data: data.map(d => d.weight || 0),
      borderColor: 'rgb(99, 118, 98)',
      backgroundColor: 'rgba(99, 118, 98, 0.2)',
    });
  }
  
  if (data.some(d => d.length !== undefined)) {
    datasets.push({
      label: 'Comprimento (cm)',
      data: data.map(d => d.length || 0),
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
    });
  }

  return (
    <StatsChart
      type="line"
      labels={data.map(d => d.date)}
      datasets={datasets}
    />
  );
}
