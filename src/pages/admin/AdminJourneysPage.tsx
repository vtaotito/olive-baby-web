import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Route,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Copy,
  ChevronDown,
  ChevronRight,
  Mail,
  Bell,
  Clock,
  GitBranch,
  Zap,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Eye,
  LayoutTemplate,
  Send,
  AlertTriangle,
  GripVertical,
  MessageCircle,
  Megaphone,
  Crown,
  UserPlus,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { KpiCard } from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import {
  adminService,
  type Journey,
  type JourneyStep,
  type JourneyTemplate,
  type JourneyMetrics,
  type JourneyCategory,
  type JourneyAudience,
  type JourneyStatusType,
  type StepType,
  type JourneyStepInput,
  type CreateJourneyInput,
} from '../../services/adminApi';

type ViewMode = 'list' | 'builder';

const CATEGORY_META: Record<JourneyCategory, { label: string; icon: typeof Route; color: string; bg: string }> = {
  engagement: { label: 'Engajamento', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  onboarding: { label: 'Onboarding', icon: Sparkles, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  premium: { label: 'Premium', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  invites: { label: 'Convites', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  retention: { label: 'Retenção', icon: RefreshCw, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
};

const AUDIENCE_LABELS: Record<JourneyAudience, string> = {
  all: 'Todos', b2c: 'B2C (Pais)', b2b: 'B2B (Profissionais)', premium: 'Premium', free: 'Free',
};

const STATUS_META: Record<JourneyStatusType, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Rascunho', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
  ACTIVE: { label: 'Ativa', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  PAUSED: { label: 'Pausada', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  COMPLETED: { label: 'Concluída', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
};

const STEP_META: Record<StepType, { label: string; icon: typeof Mail; color: string; bg: string }> = {
  email: { label: 'E-mail', icon: Mail, color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  push: { label: 'Push', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  delay: { label: 'Aguardar', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  condition: { label: 'Condição', icon: GitBranch, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

export function AdminJourneysPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>('list');
  const [filterCategory, setFilterCategory] = useState<JourneyCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<JourneyStatusType | ''>('');
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedJourney, setExpandedJourney] = useState<number | null>(null);

  // Queries
  const { data: journeysData, isLoading: journeysLoading } = useQuery({
    queryKey: ['admin-journeys', filterCategory, filterStatus],
    queryFn: () => adminService.listJourneys({
      ...(filterCategory && { category: filterCategory }),
      ...(filterStatus && { status: filterStatus }),
    }),
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-journey-metrics'],
    queryFn: () => adminService.getJourneyMetrics(),
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['admin-journey-templates'],
    queryFn: () => adminService.getJourneyTemplates(),
    enabled: showTemplates,
  });

  // Mutations
  const createFromTemplateMut = useMutation({
    mutationFn: (templateId: string) => adminService.createJourneyFromTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['admin-journey-metrics'] });
      setShowTemplates(false);
    },
  });

  const activateMut = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminService.activateJourney(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['admin-journey-metrics'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteJourney(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['admin-journey-metrics'] });
      setExpandedJourney(null);
    },
  });

  const journeys: Journey[] = journeysData?.data?.items ?? [];
  const metrics: JourneyMetrics | undefined = metricsData?.data;
  const templates: JourneyTemplate[] = templatesData?.data ?? [];

  return (
    <AdminLayout title="Jornadas de Comunicação" subtitle="Crie e gerencie jornadas automatizadas de e-mail e push para engajamento, onboarding e conversão">
      <div className="space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {metricsLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))
          ) : (
            <>
              <KpiCard title="Total Jornadas" value={metrics?.total ?? 0} icon={<Route className="w-5 h-5" />} color="olive" />
              <KpiCard title="Ativas" value={metrics?.byStatus?.ACTIVE ?? 0} subtitle={`de ${metrics?.total ?? 0}`} icon={<Play className="w-5 h-5" />} color="emerald" />
              <KpiCard title="Enrollments" value={(metrics?.enrollments?.ACTIVE ?? 0).toLocaleString('pt-BR')} subtitle={`${(metrics?.enrollments?.COMPLETED ?? 0).toLocaleString('pt-BR')} concluídos`} icon={<Users className="w-5 h-5" />} color="amber" />
              <KpiCard title="Total Enviados" value={(metrics?.totalSent ?? 0).toLocaleString('pt-BR')} subtitle="comunicações" icon={<Send className="w-5 h-5" />} color="sky" />
              <KpiCard title="Entregues" value={(metrics?.totalDelivered ?? 0).toLocaleString('pt-BR')} icon={<Check className="w-5 h-5" />} color="violet" />
            </>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as JourneyCategory | '')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="">Todas categorias</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as JourneyStatusType | '')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="">Todos status</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
              <LayoutTemplate className="w-4 h-4 mr-1" /> Templates
            </Button>
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Nova Jornada
            </Button>
          </div>
        </div>

        {/* Journeys List */}
        {journeysLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : journeys.length === 0 ? (
          <EmptyState onCreateTemplate={() => setShowTemplates(true)} onCreateNew={() => setShowCreateForm(true)} />
        ) : (
          <div className="space-y-3">
            {journeys.map(j => (
              <JourneyCard
                key={j.id}
                journey={j}
                expanded={expandedJourney === j.id}
                onToggle={() => setExpandedJourney(expandedJourney === j.id ? null : j.id)}
                onActivate={(active) => activateMut.mutate({ id: j.id, active })}
                onDelete={() => { if (confirm('Excluir esta jornada?')) deleteMut.mutate(j.id); }}
                onEdit={() => { setEditingJourney(j); setView('builder'); }}
                activating={activateMut.isPending}
              />
            ))}
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <TemplatesModal
            templates={templates}
            loading={templatesLoading}
            creating={createFromTemplateMut.isPending}
            onClose={() => setShowTemplates(false)}
            onSelect={(id) => createFromTemplateMut.mutate(id)}
          />
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <CreateJourneyModal
            onClose={() => setShowCreateForm(false)}
            onCreated={() => {
              setShowCreateForm(false);
              queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
              queryClient.invalidateQueries({ queryKey: ['admin-journey-metrics'] });
            }}
          />
        )}

        {/* Journey Builder */}
        {view === 'builder' && editingJourney && (
          <JourneyBuilderModal
            journey={editingJourney}
            onClose={() => { setView('list'); setEditingJourney(null); }}
            onSaved={() => {
              setView('list');
              setEditingJourney(null);
              queryClient.invalidateQueries({ queryKey: ['admin-journeys'] });
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// ==========================================
// Empty State
// ==========================================

function EmptyState({ onCreateTemplate, onCreateNew }: { onCreateTemplate: () => void; onCreateNew: () => void }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-olive-50 dark:bg-olive-900/20 flex items-center justify-center mb-4">
        <Route className="w-8 h-8 text-olive-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma jornada criada</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Crie jornadas automatizadas para engajar seus usuários com sequências inteligentes de e-mail e push notifications.
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onCreateTemplate}>
          <LayoutTemplate className="w-4 h-4 mr-1" /> Usar Template
        </Button>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-1" /> Criar do Zero
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Journey Card
// ==========================================

function JourneyCard({ journey, expanded, onToggle, onActivate, onDelete, onEdit, activating }: {
  journey: Journey;
  expanded: boolean;
  onToggle: () => void;
  onActivate: (active: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
  activating: boolean;
}) {
  const cat = CATEGORY_META[journey.category];
  const status = STATUS_META[journey.status];
  const CatIcon = cat?.icon ?? Route;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={onToggle}>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cat?.bg)}>
          <CatIcon className={cn('w-5 h-5', cat?.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{journey.name}</h3>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {cat?.label} · {AUDIENCE_LABELS[journey.audience]} · {journey.steps.length} etapas
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          {journey._count?.enrollments != null && (
            <div className="text-center">
              <p className="font-semibold text-amber-600 text-sm">{journey._count.enrollments.toLocaleString('pt-BR')}</p>
              <p>Inscritos</p>
            </div>
          )}
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{journey.totalSent.toLocaleString('pt-BR')}</p>
            <p>Enviados</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-emerald-600 text-sm">{journey.totalDelivered.toLocaleString('pt-BR')}</p>
            <p>Entregues</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {journey.status === 'DRAFT' || journey.status === 'PAUSED' ? (
            <button onClick={e => { e.stopPropagation(); onActivate(true); }} disabled={activating}
              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Ativar">
              <Play className="w-4 h-4" />
            </button>
          ) : journey.status === 'ACTIVE' ? (
            <button onClick={e => { e.stopPropagation(); onActivate(false); }} disabled={activating}
              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Pausar">
              <Pause className="w-4 h-4" />
            </button>
          ) : null}
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Editar">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Excluir">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Steps */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 bg-gray-50/50 dark:bg-gray-950/50">
          {journey.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{journey.description}</p>
          )}
          <StepTimeline steps={journey.steps} />
          {journey.steps.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Métricas por Etapa</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400">
                      <th className="text-left py-1.5 pr-4">Etapa</th>
                      <th className="text-right py-1.5 px-2">Enviados</th>
                      <th className="text-right py-1.5 px-2">Entregues</th>
                      <th className="text-right py-1.5 px-2">Falhas</th>
                      <th className="text-right py-1.5 px-2">Abertos</th>
                      <th className="text-right py-1.5 px-2">Cliques</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journey.steps.filter(s => s.type !== 'delay' && s.type !== 'condition').map(s => (
                      <tr key={s.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="py-1.5 pr-4 font-medium text-gray-700 dark:text-gray-300">{s.name}</td>
                        <td className="text-right py-1.5 px-2">{s.sent}</td>
                        <td className="text-right py-1.5 px-2 text-emerald-600">{s.delivered}</td>
                        <td className="text-right py-1.5 px-2 text-rose-500">{s.failed}</td>
                        <td className="text-right py-1.5 px-2">{s.opened}</td>
                        <td className="text-right py-1.5 px-2 text-sky-600">{s.clicked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Step Timeline (visual flow)
// ==========================================

function StepTimeline({ steps }: { steps: JourneyStep[] }) {
  if (steps.length === 0) return <p className="text-xs text-gray-400 italic">Nenhuma etapa definida</p>;

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const meta = STEP_META[step.type as StepType];
        const Icon = meta?.icon ?? Zap;
        return (
          <Fragment key={step.id}>
            <div className="flex flex-col items-center shrink-0 min-w-[100px] max-w-[130px]">
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', meta?.bg)}>
                <Icon className={cn('w-4 h-4', meta?.color)} />
              </div>
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mt-1.5 text-center leading-tight">{step.name}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{meta?.label}</p>
              {step.type === 'delay' && step.config && (
                <p className="text-[9px] text-amber-500 mt-0.5">
                  {(step.config as any).hours ? `${(step.config as any).hours}h` : (step.config as any).days ? `${(step.config as any).days}d` : ''}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center shrink-0 mt-4">
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600 -ml-0.5" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ==========================================
// Templates Modal
// ==========================================

function TemplatesModal({ templates, loading, creating, onClose, onSelect }: {
  templates: JourneyTemplate[];
  loading: boolean;
  creating: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-olive-600" /> Templates de Jornada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Comece rapidamente com jornadas pré-configuradas</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : templates.map(t => {
            const cat = CATEGORY_META[t.category as JourneyCategory];
            const CatIcon = cat?.icon ?? Route;
            return (
              <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-olive-300 dark:hover:border-olive-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cat?.bg)}>
                    <CatIcon className={cn('w-5 h-5', cat?.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', cat?.bg, cat?.color)}>
                        {cat?.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {AUDIENCE_LABELS[t.audience as JourneyAudience]} · {t.steps.length} etapas
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {t.steps.map((s, i) => {
                        const sm = STEP_META[s.type as StepType];
                        const SI = sm?.icon ?? Zap;
                        return (
                          <div key={i} className={cn('w-6 h-6 rounded-md flex items-center justify-center', sm?.bg)} title={s.name}>
                            <SI className={cn('w-3 h-3', sm?.color)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onSelect(t.id)} disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Copy className="w-3 h-3 mr-1" /> Usar</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Create Journey Modal
// ==========================================

function CreateJourneyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateJourneyInput>({
    name: '',
    description: '',
    category: 'engagement',
    audience: 'all',
    steps: [],
  });

  const createMut = useMutation({
    mutationFn: (data: CreateJourneyInput) => adminService.createJourney(data),
    onSuccess: onCreated,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Plus className="w-5 h-5 text-olive-600" /> Nova Jornada
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Crie uma jornada personalizada de comunicação.</p>

        <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome da Jornada</label>
            <input
              type="text" required maxLength={120}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Ex: Onboarding de novos pais"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea
              maxLength={500}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={2}
              placeholder="Descrição opcional..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as JourneyCategory }))}
                className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                {Object.entries(CATEGORY_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Audiência</label>
              <select
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value as JourneyAudience }))}
                className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                {Object.entries(AUDIENCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!form.name || createMut.isPending}>
              {createMut.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Criando...</> : <><Plus className="w-4 h-4 mr-1" /> Criar Jornada</>}
            </Button>
          </div>
          {createMut.isError && <p className="text-xs text-rose-600 text-center">Erro ao criar jornada.</p>}
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Journey Builder Modal (Steps Editor)
// ==========================================

function JourneyBuilderModal({ journey, onClose, onSaved }: {
  journey: Journey;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState<JourneyStepInput[]>(
    journey.steps.map(s => ({
      type: s.type as StepType,
      name: s.name,
      stepOrder: s.stepOrder,
      config: s.config as Record<string, unknown>,
      variables: s.variables as Record<string, unknown>[] | undefined,
    }))
  );
  const [editName, setEditName] = useState(journey.name);
  const [editDesc, setEditDesc] = useState(journey.description ?? '');
  const [editCategory, setEditCategory] = useState(journey.category);
  const [editAudience, setEditAudience] = useState(journey.audience);
  const [showAddStep, setShowAddStep] = useState(false);

  const saveMut = useMutation({
    mutationFn: async () => {
      await adminService.updateJourney(journey.id, {
        name: editName,
        description: editDesc,
        category: editCategory,
        audience: editAudience,
      });
      await adminService.replaceJourneySteps(journey.id, steps);
    },
    onSuccess: onSaved,
  });

  const addStep = (type: StepType) => {
    const defaultNames: Record<StepType, string> = {
      email: 'Enviar E-mail',
      push: 'Enviar Push',
      whatsapp: 'Enviar WhatsApp',
      delay: 'Aguardar',
      condition: 'Verificar condição',
    };
    const defaultConfigs: Record<StepType, Record<string, unknown>> = {
      email: { templateType: 'welcome', subject: '' },
      push: { title: '', body: '', clickAction: '/' },
      whatsapp: { message: '', instanceName: 'oliecare' },
      delay: { hours: 24 },
      condition: { field: '', operator: 'equals', value: '' },
    };
    setSteps(prev => [...prev, {
      type,
      name: defaultNames[type],
      stepOrder: prev.length,
      config: defaultConfigs[type],
    }]);
    setShowAddStep(false);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepOrder: i })));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    setSteps(prev => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((s, i) => ({ ...s, stepOrder: i }));
    });
  };

  const updateStepField = (idx: number, field: string, value: unknown) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const updateStepConfig = (idx: number, key: string, value: unknown) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, config: { ...s.config, [key]: value } } : s));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-olive-600" /> Editor de Jornada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure as etapas da jornada de comunicação</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Journey Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Nome</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select value={editCategory} onChange={e => setEditCategory(e.target.value as JourneyCategory)}
                  className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Audiência</label>
                <select value={editAudience} onChange={e => setEditAudience(e.target.value as JourneyAudience)}
                  className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  {Object.entries(AUDIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
              className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Etapas da Jornada ({steps.length})</h4>
              <Button size="sm" variant="outline" onClick={() => setShowAddStep(!showAddStep)}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar Etapa
              </Button>
            </div>

            {showAddStep && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selecione o tipo de etapa:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.entries(STEP_META) as Array<[StepType, typeof STEP_META['email']]>).map(([type, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <button key={type} onClick={() => addStep(type)}
                        className={cn('flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-olive-400 dark:hover:border-olive-700 transition-colors text-left', meta.bg)}>
                        <Icon className={cn('w-4 h-4', meta.color)} />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <StepEditor
                  key={idx}
                  step={step}
                  index={idx}
                  total={steps.length}
                  onUpdateField={(field, val) => updateStepField(idx, field, val)}
                  onUpdateConfig={(key, val) => updateStepConfig(idx, key, val)}
                  onRemove={() => removeStep(idx)}
                  onMove={(dir) => moveStep(idx, dir)}
                />
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <Zap className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Adicione etapas para construir a jornada</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {steps.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preview do Fluxo</h4>
              <StepTimeline steps={steps.map((s, i) => ({
                id: i,
                journeyId: journey.id,
                stepOrder: i,
                type: s.type as StepType,
                name: s.name,
                config: s.config,
                variables: s.variables,
                sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0,
                createdAt: '',
              }))} />
            </div>
          )}

          {/* Personalization Variables */}
          <div className="bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800 p-4">
            <h4 className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Variáveis de Personalização
            </h4>
            <p className="text-xs text-violet-600 dark:text-violet-500 mb-2">Use estas variáveis nos textos de push e e-mail:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: '{{userName}}', desc: 'Nome do usuário' },
                { key: '{{babyName}}', desc: 'Nome do bebê' },
                { key: '{{planName}}', desc: 'Plano atual' },
                { key: '{{daysActive}}', desc: 'Dias de atividade' },
                { key: '{{lastLogin}}', desc: 'Último acesso' },
                { key: '{{recordCount}}', desc: 'Total de registros' },
              ].map(v => (
                <span key={v.key} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 rounded-md text-[10px] font-mono text-violet-700 dark:text-violet-400" title={v.desc}>
                  {v.key}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <p className="text-xs text-gray-400">{steps.length} etapas · {steps.filter(s => s.type === 'email').length} emails · {steps.filter(s => s.type === 'push').length} push</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={() => saveMut.mutate()} disabled={!editName || saveMut.isPending}>
              {saveMut.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4 mr-1" /> Salvar Jornada</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Step Editor
// ==========================================

function StepEditor({ step, index, total, onUpdateField, onUpdateConfig, onRemove, onMove }: {
  step: JourneyStepInput;
  index: number;
  total: number;
  onUpdateField: (field: string, val: unknown) => void;
  onUpdateConfig: (key: string, val: unknown) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const meta = STEP_META[step.type as StepType];
  const Icon = meta?.icon ?? Zap;

  return (
    <div className={cn('border rounded-xl transition-colors', expanded ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700')}>
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col gap-0.5 text-gray-300 dark:text-gray-600 cursor-grab">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-mono text-gray-400 w-5">{index + 1}</span>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', meta?.bg)}>
          <Icon className={cn('w-3.5 h-3.5', meta?.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{step.name}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={index === 0}
            className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Mover cima">▲</button>
          <button onClick={e => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1}
            className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Mover baixo">▼</button>
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div>
            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome da Etapa</label>
            <input type="text" value={step.name} onChange={e => onUpdateField('name', e.target.value)}
              className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>

          {step.type === 'email' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</label>
                  <select value={(step.config.templateType as string) ?? 'welcome'}
                    onChange={e => onUpdateConfig('templateType', e.target.value)}
                    className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <option value="welcome">Boas-vindas</option>
                    <option value="professional_invite">Convite Profissional</option>
                    <option value="baby_invite">Convite Bebê</option>
                    <option value="patient_invite">Convite Paciente</option>
                    <option value="password_reset">Reset de Senha</option>
                    <option value="payment_confirmation">Confirmação Pagamento</option>
                    <option value="subscription_cancelled">Cancelamento</option>
                    <option value="alert">Alerta</option>
                    <option value="custom">Customizado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assunto</label>
                  <input type="text" value={(step.config.subject as string) ?? ''} onChange={e => onUpdateConfig('subject', e.target.value)}
                    className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Assunto do e-mail..." />
                </div>
              </div>
              {step.config.templateType === 'custom' && (
                <div>
                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Corpo Customizado</label>
                  <textarea value={(step.config.customBody as string) ?? ''} onChange={e => onUpdateConfig('customBody', e.target.value)}
                    className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" rows={3}
                    placeholder="Texto do e-mail com variáveis {{userName}}..." />
                </div>
              )}
            </>
          )}

          {step.type === 'push' && (
            <>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</label>
                <input type="text" value={(step.config.title as string) ?? ''} onChange={e => onUpdateConfig('title', e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Título da notificação..." />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mensagem</label>
                <textarea value={(step.config.body as string) ?? ''} onChange={e => onUpdateConfig('body', e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" rows={2}
                  placeholder="Corpo da notificação..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Click Action (URL)</label>
                  <input type="text" value={(step.config.clickAction as string) ?? '/'} onChange={e => onUpdateConfig('clickAction', e.target.value)}
                    className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridade</label>
                  <select value={(step.config.priority as string) ?? 'default'} onChange={e => onUpdateConfig('priority', e.target.value)}
                    className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <option value="default">Normal</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              {/* Push Preview */}
              {(step.config.title || step.config.body) && (
                <div className="p-2.5 bg-gray-100 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Preview</p>
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-md bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center shrink-0">
                      <Bell className="w-3 h-3 text-olive-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{(step.config.title as string) || 'Título'}</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">{(step.config.body as string) || 'Mensagem'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step.type === 'delay' && (
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tempo de espera (horas)</label>
              <input type="number" min={1} value={(step.config.hours as number) ?? 24}
                onChange={e => onUpdateConfig('hours', parseInt(e.target.value) || 24)}
                className="mt-0.5 w-32 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <p className="text-[10px] text-gray-400 mt-1">
                ≈ {Math.round(((step.config.hours as number) ?? 24) / 24 * 10) / 10} dia(s)
              </p>
            </div>
          )}

          {step.type === 'condition' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campo</label>
                <select value={(step.config.field as string) ?? ''} onChange={e => onUpdateConfig('field', e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <option value="">Selecionar...</option>
                  <option value="hasBaby">Tem bebê cadastrado</option>
                  <option value="lastActivity">Última atividade</option>
                  <option value="accountAge">Idade da conta (dias)</option>
                  <option value="planType">Tipo de plano</option>
                  <option value="recordCount">Registros criados</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operador</label>
                <select value={(step.config.operator as string) ?? 'equals'} onChange={e => onUpdateConfig('operator', e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <option value="equals">Igual a</option>
                  <option value="notEquals">Diferente de</option>
                  <option value="greaterThan">Maior que</option>
                  <option value="lessThan">Menor que</option>
                  <option value="olderThan">Mais antigo que (dias)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</label>
                <input type="text" value={String((step.config.value as string | number | boolean) ?? '')}
                  onChange={e => onUpdateConfig('value', e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
