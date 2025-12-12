// Olive Baby Web - Daily Summary Component
// Cards com resumo das rotinas do dia

import { Moon, Utensils, Droplets, Bath, Baby, Clock } from 'lucide-react';
import { Card, CardBody } from '../../ui';
import { cn } from '../../../lib/utils';
import type { BabyStats } from '../../../types';

interface DailySummaryProps {
  stats: BabyStats | null;
  isLoading?: boolean;
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  bgColor: string;
}

function SummaryCard({ icon: Icon, label, value, subtext, color, bgColor }: SummaryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
            {subtext && (
              <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
            )}
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-7 bg-gray-200 rounded w-12"></div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DailySummary({ stats, isLoading }: DailySummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  // Calcular valores
  const sleepHours = stats?.sleep?.totalMinutes 
    ? Math.round(stats.sleep.totalMinutes / 60 * 10) / 10 
    : 0;
  const sleepCount = stats?.sleep?.count || 0;

  const feedingCount = stats?.feeding?.count || 0;
  const feedingMinutes = stats?.feeding?.totalMinutes || 0;

  const diaperCount = stats?.diaper?.count || 0;
  const diaperWet = stats?.diaper?.wetCount || 0;
  const diaperDirty = stats?.diaper?.dirtyCount || 0;

  const extractionMl = stats?.extraction?.totalMl || 0;
  const extractionCount = stats?.extraction?.count || 0;

  const bathCount = stats?.bath?.count || 0;

  const complementMl = stats?.feeding?.complementMl || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Resumo das últimas 24h
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sono */}
        <SummaryCard
          icon={Moon}
          label="Sono total"
          value={`${sleepHours}h`}
          subtext={sleepCount > 0 ? `${sleepCount} período(s)` : undefined}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />

        {/* Mamadas */}
        <SummaryCard
          icon={Utensils}
          label="Mamadas"
          value={feedingCount}
          subtext={feedingMinutes > 0 ? `${feedingMinutes} min total` : undefined}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />

        {/* Fraldas */}
        <SummaryCard
          icon={Baby}
          label="Fraldas"
          value={diaperCount}
          subtext={diaperCount > 0 ? `${diaperWet} xixi, ${diaperDirty} cocô` : undefined}
          color="text-green-600"
          bgColor="bg-green-100"
        />

        {/* Extração */}
        <SummaryCard
          icon={Droplets}
          label="Extração"
          value={extractionMl > 0 ? `${extractionMl}ml` : '—'}
          subtext={extractionCount > 0 ? `${extractionCount} sessão(ões)` : undefined}
          color="text-pink-600"
          bgColor="bg-pink-100"
        />

        {/* Banho */}
        <SummaryCard
          icon={Bath}
          label="Banho"
          value={bathCount > 0 ? 'Sim' : 'Não'}
          subtext={bathCount > 1 ? `${bathCount} vezes` : undefined}
          color="text-cyan-600"
          bgColor="bg-cyan-100"
        />

        {/* Complemento */}
        <SummaryCard
          icon={Utensils}
          label="Complemento"
          value={complementMl > 0 ? `${complementMl}ml` : '—'}
          subtext={complementMl > 0 ? 'fórmula/leite' : undefined}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>
    </div>
  );
}
