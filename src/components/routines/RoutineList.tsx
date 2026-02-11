// Olive Baby Web - Routine List Component
import { useState } from 'react';
import { Moon, Utensils, Baby, Droplets, ChevronRight, Filter } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '../ui';
import type { RoutineLog, RoutineType } from '../../types';

interface RoutineListProps {
  routines: RoutineLog[];
  isLoading?: boolean;
  onViewDetails?: (routine: RoutineLog) => void;
}

const routineConfig: Record<RoutineType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
  emoji: string;
}> = {
  FEEDING: {
    icon: Utensils,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Alimentação',
    emoji: '🍼',
  },
  SLEEP: {
    icon: Moon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Sono',
    emoji: '😴',
  },
  DIAPER: {
    icon: Baby,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Fralda',
    emoji: '🚼',
  },
  BATH: {
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Banho',
    emoji: '🛁',
  },
  MILK_EXTRACTION: {
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Extração',
    emoji: '🤱',
  },
};

const filterOptions: { value: RoutineType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'FEEDING', label: '🍼 Alimentação' },
  { value: 'SLEEP', label: '😴 Sono' },
  { value: 'DIAPER', label: '🚼 Fraldas' },
  { value: 'BATH', label: '🛁 Banho' },
  { value: 'MILK_EXTRACTION', label: '🤱 Extração' },
];

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR');
}

function getRoutineDetails(routine: RoutineLog): string {
  const meta = routine.meta as Record<string, unknown>;
  const details: string[] = [];

  switch (routine.routineType) {
    case 'FEEDING':
      if (meta?.feedingType === 'breast') details.push('Peito');
      if (meta?.feedingType === 'bottle') details.push('Mamadeira');
      if (meta?.feedingType === 'solid') details.push('Sólidos');
      if (meta?.breastSide === 'left') details.push('esq');
      if (meta?.breastSide === 'right') details.push('dir');
      if (meta?.breastSide === 'both') details.push('ambos');
      if (meta?.bottleMl) details.push(`${meta.bottleMl}ml`);
      break;
    case 'SLEEP':
      if (meta?.sleepQuality === 'good') details.push('Qualidade boa');
      if (meta?.sleepQuality === 'regular') details.push('Regular');
      if (meta?.sleepQuality === 'bad') details.push('Agitado');
      break;
    case 'DIAPER':
      if (meta?.diaperType === 'pee') details.push('Xixi');
      if (meta?.diaperType === 'poop') details.push('Cocô');
      if (meta?.diaperType === 'both') details.push('Xixi e cocô');
      break;
    case 'MILK_EXTRACTION':
      if (meta?.extractionMl) details.push(`${meta.extractionMl}ml`);
      break;
  }

  return details.join(' • ');
}

export function RoutineList({ routines, isLoading, onViewDetails }: RoutineListProps) {
  const [filter, setFilter] = useState<RoutineType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Filtrar rotinas
  const filteredRoutines = filter === 'all' 
    ? routines 
    : routines.filter(r => r.routineType === filter);

  // Agrupar por data
  const groupedRoutines: Record<string, RoutineLog[]> = {};
  filteredRoutines.forEach(routine => {
    const dateKey = formatDate(routine.startTime);
    if (!groupedRoutines[dateKey]) {
      groupedRoutines[dateKey] = [];
    }
    groupedRoutines[dateKey].push(routine);
  });

  return (
    <Card>
      <CardHeader 
        title="📋 Histórico de Rotinas"
        action={
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtros
          </Button>
        }
      />
      
      {/* Filtros */}
      {showFilters && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-olive-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <CardBody className="p-4 pt-0">
        {filteredRoutines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Nenhuma rotina encontrada</p>
            <p className="text-sm">Comece registrando as atividades do bebê! 💛</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRoutines).map(([date, dayRoutines]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
                <div className="space-y-2">
                  {dayRoutines.map(routine => {
                    const config = routineConfig[routine.routineType];
                    const Icon = config.icon;
                    const details = getRoutineDetails(routine);

                    return (
                      <div
                        key={routine.id}
                        onClick={() => onViewDetails?.(routine)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                          <span className="text-lg">{config.emoji}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{config.label}</span>
                            {routine.durationSeconds && (
                              <Badge variant="secondary" size="sm">
                                {formatDuration(routine.durationSeconds)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {formatTime(routine.startTime)}
                            {routine.endTime && ` → ${formatTime(routine.endTime)}`}
                            {details && ` • ${details}`}
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
