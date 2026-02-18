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
  detail?: string;
  color: string;
  bgColor: string;
  iconBg: string;
  progress?: number;
}

function SummaryCard({ icon: Icon, label, value, subtext, detail, color, bgColor, iconBg, progress }: SummaryCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-all border-0', bgColor)}>
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={cn('text-2xl font-bold mt-0.5 leading-tight', color)}>{value}</p>
            {subtext && (
              <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
            )}
            {detail && (
              <p className="text-[11px] text-gray-400 mt-0.5">{detail}</p>
            )}
          </div>
        </div>
        {progress !== undefined && progress > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', color.replace('text-', 'bg-'))}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card className="border-0">
      <CardBody className="p-4">
        <div className="animate-pulse flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-7 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DailySummary({ stats, isLoading }: DailySummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const sleepHours = stats?.sleep?.totalMinutes
    ? Math.round(stats.sleep.totalMinutes / 60 * 10) / 10
    : 0;
  const sleepCount = stats?.sleep?.count || 0;
  const sleepProgress = Math.round((sleepHours / 14) * 100);

  const feedingCount = stats?.feeding?.count || 0;
  const feedingMinutes = stats?.feeding?.totalMinutes || 0;

  const complementMl = stats?.feeding?.complementMl || 0;
  const bottleMl = (stats as any)?.feeding?.bottleMl || 0;
  const totalVolumeMl = complementMl + bottleMl;

  const diaperCount = stats?.diaper?.count || 0;
  const diaperWet = stats?.diaper?.wetCount || 0;
  const diaperDirty = stats?.diaper?.dirtyCount || 0;

  const extractionMl = stats?.extraction?.totalMl || 0;
  const extractionCount = stats?.extraction?.count || 0;

  const bathCount = stats?.bath?.count || 0;

  const diaperBreakdown = [];
  if (diaperWet > 0) diaperBreakdown.push(`${diaperWet} xixi`);
  if (diaperDirty > 0) diaperBreakdown.push(`${diaperDirty} cocô`);
  const diaperSubtext = diaperBreakdown.length > 0 ? diaperBreakdown.join(', ') : (diaperCount > 0 ? `${diaperCount} troca(s)` : undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Resumo das últimas 24h
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          icon={Moon}
          label="Sono total"
          value={sleepHours > 0 ? `${sleepHours}h` : '—'}
          subtext={sleepCount > 0 ? `${sleepCount} período(s)` : undefined}
          color="text-indigo-600"
          bgColor="bg-indigo-50/80"
          iconBg="bg-indigo-100"
          progress={sleepProgress}
        />

        <SummaryCard
          icon={Utensils}
          label="Alimentações"
          value={feedingCount}
          subtext={feedingMinutes > 0 ? `${feedingMinutes} min total` : undefined}
          detail={totalVolumeMl > 0 ? `+ ${totalVolumeMl}ml ofertado` : undefined}
          color="text-amber-600"
          bgColor="bg-amber-50/80"
          iconBg="bg-amber-100"
        />

        <SummaryCard
          icon={Baby}
          label="Fraldas"
          value={diaperCount}
          subtext={diaperSubtext}
          color="text-green-600"
          bgColor="bg-green-50/80"
          iconBg="bg-green-100"
        />

        <SummaryCard
          icon={Droplets}
          label="Extração"
          value={extractionMl > 0 ? `${extractionMl}ml` : '—'}
          subtext={extractionCount > 0 ? `${extractionCount} sessão(ões)` : undefined}
          color="text-pink-600"
          bgColor="bg-pink-50/80"
          iconBg="bg-pink-100"
        />

        <SummaryCard
          icon={Bath}
          label="Banhos"
          value={bathCount > 0 ? `${bathCount}x` : '—'}
          subtext={bathCount === 1 ? '1 banho' : bathCount > 1 ? `${bathCount} banhos` : undefined}
          color="text-cyan-600"
          bgColor="bg-cyan-50/80"
          iconBg="bg-cyan-100"
        />

        <SummaryCard
          icon={Utensils}
          label="Complemento"
          value={complementMl > 0 ? `${complementMl}ml` : '—'}
          subtext={complementMl > 0 ? 'fórmula/leite' : undefined}
          color="text-orange-600"
          bgColor="bg-orange-50/80"
          iconBg="bg-orange-100"
        />
      </div>
    </div>
  );
}
