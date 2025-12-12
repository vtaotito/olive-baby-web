// Olive Baby Web - Insights Cards Component
// Cards acolhedores com insights automáticos

import { Heart, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardBody } from '../../ui';
import { cn } from '../../../lib/utils';

interface Insight {
  id: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'extraction' | 'general';
  emoji: string;
  title: string;
  message: string;
  tone: 'positive' | 'neutral' | 'attention';
}

interface InsightsCardsProps {
  insights: Insight[];
  welcomeMessage: string;
  isLoading?: boolean;
}

const toneStyles = {
  positive: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: Heart,
    iconColor: 'text-green-500',
    titleColor: 'text-green-700',
  },
  neutral: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700',
  },
  attention: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700',
  },
};

function InsightCard({ insight }: { insight: Insight }) {
  const style = toneStyles[insight.tone];
  const Icon = style.icon;

  return (
    <Card className={cn('border', style.bg, style.border)}>
      <CardBody className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">{insight.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn('font-semibold text-sm', style.titleColor)}>
                {insight.title}
              </h4>
              <Icon className={cn('w-4 h-4', style.iconColor)} />
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {insight.message}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="animate-pulse flex gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function InsightsCards({ insights, welcomeMessage, isLoading }: InsightsCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mensagem de boas-vindas */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-purple-100">
        <CardBody className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <span className="text-2xl">💛</span>
            </div>
            <div>
              <p className="text-lg font-medium text-purple-800">
                {welcomeMessage}
              </p>
              <p className="text-sm text-purple-600">
                Você está fazendo um trabalho incrível. 🌸
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-800">Insights do dia</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
