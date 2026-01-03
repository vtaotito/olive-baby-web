// Olive Baby Web - Insights Carousel Component
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Lightbulb } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/api';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import type { Notification } from '../../types';

interface InsightsCarouselProps {
  insights: Notification[];
  className?: string;
}

export function InsightsCarousel({ insights, className }: InsightsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localInsights, setLocalInsights] = useState(insights);
  const queryClient = useQueryClient();
  const { success } = useToast();

  // Sync local state with props
  useEffect(() => {
    setLocalInsights(insights);
    if (currentIndex >= insights.length) {
      setCurrentIndex(Math.max(0, insights.length - 1));
    }
  }, [insights, currentIndex]);

  const archiveMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.archive(notificationId),
    onSuccess: (_, notificationId) => {
      // Optimistically remove from local state
      setLocalInsights(prev => prev.filter(i => i.id !== notificationId));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      success('Insight arquivado');
    },
  });

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : localInsights.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < localInsights.length - 1 ? prev + 1 : 0));
  };

  const handleDismiss = (notificationId: number) => {
    archiveMutation.mutate(notificationId);
  };

  if (localInsights.length === 0) {
    return (
      <div className={cn('bg-gradient-to-br from-olive-50 to-emerald-50 rounded-xl p-6 text-center', className)}>
        <Lightbulb className="w-10 h-10 text-olive-400 mx-auto mb-3" />
        <p className="text-gray-600">Nenhum insight no momento.</p>
        <p className="text-sm text-gray-500 mt-1">Continue registrando rotinas para receber insights personalizados!</p>
      </div>
    );
  }

  const currentInsight = localInsights[currentIndex];

  const severityStyles = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    alert: 'bg-rose-50 border-rose-200',
  };

  const severityIconColors = {
    info: 'text-blue-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    alert: 'text-rose-500',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Carousel Container */}
      <div className={cn(
        'rounded-xl border p-4 transition-all duration-300',
        severityStyles[currentInsight.severity]
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className={cn('w-5 h-5', severityIconColors[currentInsight.severity])} />
            <h3 className="font-semibold text-gray-900">{currentInsight.title}</h3>
          </div>
          <button
            onClick={() => handleDismiss(currentInsight.id)}
            disabled={archiveMutation.isPending}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            title="Arquivar insight"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 text-sm leading-relaxed">{currentInsight.message}</p>

        {/* CTA Button */}
        {currentInsight.ctaUrl && (
          <a
            href={currentInsight.ctaUrl}
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-olive-600 hover:text-olive-700"
          >
            {currentInsight.ctaLabel || 'Ver mais'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Navigation */}
        {localInsights.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {localInsights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    index === currentIndex
                      ? 'bg-olive-500 w-4'
                      : 'bg-gray-300 hover:bg-gray-400'
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Counter Badge */}
      {localInsights.length > 1 && (
        <div className="absolute -top-2 -right-2 bg-olive-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {currentIndex + 1}/{localInsights.length}
        </div>
      )}
    </div>
  );
}
