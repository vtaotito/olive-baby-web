// Olive Baby Web - Day Summary Component
import { Moon, Utensils, Baby as BabyIcon, Droplets, Clock, Milk } from 'lucide-react';
import { Card, CardBody } from '../ui';
import type { BabyStats } from '../../types';

interface DaySummaryProps {
  stats: BabyStats | null;
  isLoading?: boolean;
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  bgColor: string;
}

function SummaryCard({ icon: Icon, label, value, subtitle, color, bgColor }: SummaryCardProps) {
  return (
    <div className={`p-4 rounded-xl ${bgColor} transition-transform hover:scale-105`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export function DaySummary({ stats, isLoading }: DaySummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Calcular valores
  const sleepHours = stats.sleep?.totalHoursToday || 0;
  const feedingCount = stats.feeding?.totalToday || 0;
  const feedingMinutes = stats.feeding?.averageDurationMinutes || 0;
  const diaperCount = stats.diaper?.totalToday || 0;
  const bathCount = stats.bath?.totalToday || 0;
  const extractionMl = stats.extraction?.totalMlToday || 0;
  const totalMl = stats.feeding?.totalMl || 0;

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-olive-600" />
            Resumo das últimas 24h
          </h2>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SummaryCard
            icon={Moon}
            label="Sono Total"
            value={`${sleepHours.toFixed(1)}h`}
            subtitle={`${stats.sleep?.sleepSessions || 0} sessões`}
            color="bg-purple-500"
            bgColor="bg-purple-50"
          />

          <SummaryCard
            icon={Utensils}
            label="Alimentações"
            value={feedingCount}
            subtitle={`~${Math.round(feedingMinutes)}min cada`}
            color="bg-yellow-500"
            bgColor="bg-yellow-50"
          />

          <SummaryCard
            icon={Milk}
            label="Volume Total"
            value={`${totalMl}ml`}
            subtitle="mamadeira + complemento"
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />

          <SummaryCard
            icon={BabyIcon}
            label="Fraldas"
            value={diaperCount}
            subtitle={`${stats.diaper?.peeCount || 0} xixi / ${stats.diaper?.poopCount || 0} cocô`}
            color="bg-green-500"
            bgColor="bg-green-50"
          />

          <SummaryCard
            icon={Droplets}
            label="Banho"
            value={bathCount > 0 ? 'Sim ✓' : 'Não'}
            color="bg-cyan-500"
            bgColor="bg-cyan-50"
          />

          <SummaryCard
            icon={BabyIcon}
            label="Extração"
            value={`${extractionMl}ml`}
            subtitle={`${stats.extraction?.sessionsToday || 0} sessões`}
            color="bg-pink-500"
            bgColor="bg-pink-50"
          />
        </div>
      </CardBody>
    </Card>
  );
}
