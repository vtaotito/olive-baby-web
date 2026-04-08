// OlieCare Admin - AI Agent Dashboard
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Play,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Pause,
  DollarSign,
  Search as SearchIcon,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  Brain,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { adsService } from '../../services/adsApi';
import { cn } from '../../lib/utils';
import type { AgentAction, AgentAnalysis } from '../../types/ads';

function ActionIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: typeof Pause; cls: string; bg: string }> = {
    pause_campaign: { icon: Pause, cls: 'text-amber-600', bg: 'bg-amber-100' },
    update_budget: { icon: DollarSign, cls: 'text-sky-600', bg: 'bg-sky-100' },
    pause_keyword: { icon: Ban, cls: 'text-rose-600', bg: 'bg-rose-100' },
    add_keywords: { icon: SearchIcon, cls: 'text-emerald-600', bg: 'bg-emerald-100' },
    alert: { icon: AlertTriangle, cls: 'text-violet-600', bg: 'bg-violet-100' },
  };
  const c = icons[type] || icons.alert;
  const Icon = c.icon;
  return (
    <div className={cn('p-2.5 rounded-xl', c.bg)}>
      <Icon className={cn('w-5 h-5', c.cls)} />
    </div>
  );
}

function ActionTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    pause_campaign: 'Pausar Campanha',
    update_budget: 'Ajustar Orçamento',
    pause_keyword: 'Pausar Palavra-chave',
    add_keywords: 'Adicionar Palavras-chave',
    alert: 'Alerta',
  };
  return <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{labels[type] || type}</span>;
}

function ResultBadge({ status }: { status: string }) {
  if (status === 'executado') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
        <CheckCircle2 className="w-3 h-3" /> Executado
      </span>
    );
  }
  if (status === 'erro') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" /> Erro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
      <Clock className="w-3 h-3" /> {status}
    </span>
  );
}

export function AdminAdsAgentPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [runResults, setRunResults] = useState<Array<{ action: string; status: string; id?: string; error?: string }>>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');

  const analyzeMutation = useMutation({
    mutationFn: () => adsService.analyzeOnly(),
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setRunResults([]);
    },
  });

  const runMutation = useMutation({
    mutationFn: () => adsService.runAgent(),
    onSuccess: (data) => {
      setAnalysis(data.result);
      setRunResults([]);
    },
  });

  const isLoading = analyzeMutation.isPending || runMutation.isPending;

  return (
    <AdminLayout
      title="Agente IA — Google Ads"
      subtitle="Claude analisa e otimiza suas campanhas automaticamente"
    >
      {/* Back */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/admin/ads')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </button>
      </div>

      {/* Hero / CTA */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agente de Otimização</h2>
              <p className="text-white/80 text-sm">Powered by Claude AI</p>
            </div>
          </div>
          <p className="text-white/90 mb-6 max-w-2xl">
            O agente analisa métricas de todas as campanhas, identifica oportunidades de otimização,
            e pode executar ações automaticamente: pausar campanhas ineficientes, ajustar orçamentos,
            negativar palavras-chave e mais.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all',
                isLoading
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-white text-violet-700 hover:bg-white/90 shadow-lg'
              )}
            >
              {analyzeMutation.isPending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analisar (sem executar)</>
              )}
            </button>
            <button
              onClick={() => {
                if (window.confirm('O agente vai analisar E executar as ações recomendadas. Continuar?')) {
                  runMutation.mutate();
                }
              }}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all',
                isLoading
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30'
              )}
            >
              {runMutation.isPending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Executando...</>
              ) : (
                <><Zap className="w-4 h-4" /> Executar Ciclo Completo</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Como funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, title: 'Coleta', desc: 'Busca métricas da conta e campanhas no Google Ads' },
            { icon: Brain, title: 'Análise', desc: 'Claude avalia CTR, CPC, conversões e tendências' },
            { icon: Sparkles, title: 'Recomendações', desc: 'Gera ações concretas com justificativa' },
            { icon: Shield, title: 'Execução', desc: 'Executa as ações via API (com confirmação)' },
          ].map((step, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-sm font-bold text-violet-600">
                  {i + 1}
                </div>
                <step.icon className="w-5 h-5 text-violet-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis Results */}
      {analysis && (
        <section className="mb-8 space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-violet-100 rounded-xl">
                <Bot className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Resumo do Agente</h3>
                <p className="text-gray-700">{analysis.summary}</p>
              </div>
            </div>
          </div>

          {/* Insights */}
          {analysis.insights?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Insights ({analysis.insights.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {analysis.actions?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Ações Recomendadas ({analysis.actions.length})
              </h3>
              <div className="space-y-3">
                {analysis.actions.map((action: AgentAction, i: number) => {
                  const result = runResults.find(r => r.id === action.target_id && r.action === action.type);
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <ActionIcon type={action.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <ActionTypeLabel type={action.type} />
                            {result && <ResultBadge status={result.status} />}
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{action.reason}</p>
                          <p className="text-xs text-gray-400">
                            Target: {action.target_id}
                            {action.params && Object.keys(action.params).length > 0 && (
                              <> | Params: {JSON.stringify(action.params)}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {analysis.actions?.length === 0 && analysis.insights?.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-emerald-800 mb-1">Tudo sob controle!</h3>
              <p className="text-sm text-emerald-600">O agente não encontrou nenhuma ação necessária no momento.</p>
            </div>
          )}
        </section>
      )}

      {/* Error States */}
      {(analyzeMutation.isError || runMutation.isError) && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-rose-800 mb-1">Erro ao comunicar com o agente</h3>
              <p className="text-sm text-rose-600">
                Verifique se o backend oliecare-ads-agent está rodando na porta 3001 e se as credenciais
                do Google Ads e Anthropic estão corretas no .env.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto Schedule Info */}
      <section>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Ciclo Automático</h3>
              <p className="text-sm text-gray-500">
                O agente roda automaticamente a cada 6 horas via cron no backend. Para ajustar a frequência,
                edite o <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">cron.schedule</code> em{' '}
                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">server.js</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
