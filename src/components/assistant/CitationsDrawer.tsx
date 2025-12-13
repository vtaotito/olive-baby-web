// Olive Baby Web - Citations Drawer Component
import { X, BookOpen, ExternalLink, Star } from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';
import { cn } from '../../lib/utils';
import type { AiCitation } from '../../types';

interface CitationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CitationsDrawer({ isOpen, onClose }: CitationsDrawerProps) {
  const { lastCitations } = useAiStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-gray-900">Fontes Consultadas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {lastCitations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma fonte consultada</p>
              <p className="text-sm mt-1">
                As fontes aparecerão aqui quando a Olive usar a base de conhecimento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                A Olive consultou {lastCitations.length} fonte(s) para formular a resposta:
              </p>
              
              {lastCitations.map((citation, index) => (
                <CitationCard key={index} citation={citation} index={index + 1} />
              ))}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <Star className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                  As fontes são materiais educativos sobre cuidados com bebês e não substituem orientação médica profissional.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface CitationCardProps {
  citation: AiCitation;
  index: number;
}

function CitationCard({ citation, index }: CitationCardProps) {
  const relevancePercent = Math.round(citation.similarity * 100);
  const relevanceColor = 
    relevancePercent >= 80 ? 'text-emerald-600 bg-emerald-50' :
    relevancePercent >= 60 ? 'text-amber-600 bg-amber-50' :
    'text-gray-600 bg-gray-50';

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            {index}
          </span>
          <h3 className="font-medium text-gray-900 text-sm">
            {citation.title}
          </h3>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', relevanceColor)}>
          {relevancePercent}% relevante
        </span>
      </div>

      {/* Source */}
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        <ExternalLink className="h-3 w-3" />
        {citation.source}
      </p>

      {/* Content preview */}
      <div className="bg-white p-3 rounded border border-gray-200">
        <p className="text-sm text-gray-700 line-clamp-4">
          {citation.content}
        </p>
      </div>
    </div>
  );
}
