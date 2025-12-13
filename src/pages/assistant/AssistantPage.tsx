// Olive Baby Web - Assistant Page
import { useState, useEffect } from 'react';
import { Sparkles, History, AlertCircle, RefreshCw } from 'lucide-react';
import { AssistantChat, InsightCards, QuickActions, CitationsDrawer } from '../../components/assistant';
import { useAiStore } from '../../stores/aiStore';
import { useBabyStore } from '../../stores/babyStore';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { AiChatSession } from '../../types';

export function AssistantPage() {
  const [showCitations, setShowCitations] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { selectedBaby } = useBabyStore();
  const { 
    sessions,
    currentSession,
    isAiConfigured,
    isCheckingHealth,
    fetchSessions,
    loadSession,
    setCurrentSession,
    checkHealth,
  } = useAiStore();

  // Check AI health on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Fetch sessions when baby changes
  useEffect(() => {
    if (selectedBaby) {
      fetchSessions(selectedBaby.id);
    }
  }, [selectedBaby, fetchSessions]);

  if (isCheckingHealth) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAiConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Assistente não disponível
        </h2>
        <p className="text-gray-500 max-w-md">
          O Olive Assistant não está configurado neste ambiente. 
          Entre em contato com o suporte para mais informações.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Olive Assistant</h1>
            <p className="text-sm text-gray-500">
              Sua assistente para cuidados com o bebê
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className={cn(showHistory && 'bg-emerald-50 border-emerald-200')}
        >
          <History className="h-4 w-4 mr-2" />
          Conversas
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* History Sidebar (conditional) */}
        {showHistory && (
          <div className="w-72 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Conversas anteriores</h3>
              
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma conversa ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={currentSession?.id === session.id}
                      onClick={() => {
                        loadSession(session.id);
                        setShowHistory(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex">
          {/* Main Chat */}
          <div className="flex-1 min-w-0">
            <AssistantChat 
              onCitationsClick={() => setShowCitations(true)}
              className="h-full"
            />
          </div>

          {/* Right Sidebar - Insights & Quick Actions */}
          <div className="hidden lg:block w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Baby Info Card */}
              {selectedBaby && (
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedBaby.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatBabyAge(selectedBaby.birthDate)}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <QuickActions />

              {/* Insights */}
              <InsightCards />
            </div>
          </div>
        </div>
      </div>

      {/* Citations Drawer */}
      <CitationsDrawer 
        isOpen={showCitations}
        onClose={() => setShowCitations(false)}
      />
    </div>
  );
}

// Session Item Component
interface SessionItemProps {
  session: AiChatSession;
  isActive: boolean;
  onClick: () => void;
}

function SessionItem({ session, isActive, onClick }: SessionItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors',
        isActive 
          ? 'bg-emerald-100 border border-emerald-200' 
          : 'bg-white border border-gray-200 hover:bg-gray-100'
      )}
    >
      <p className="font-medium text-sm text-gray-900 truncate">
        {session.title || 'Nova conversa'}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {formatRelativeDate(session.updatedAt)}
      </p>
    </button>
  );
}

// Helper Functions
function formatBabyAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  }

  const months = Math.floor(diffDays / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR');
}
