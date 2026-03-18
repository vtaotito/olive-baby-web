import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Mail,
  Megaphone,
  RefreshCw,
  Settings2,
  Shield,
  Trash2,
  X,
  Zap,
  Info,
  XCircle,
  Volume2,
  VolumeX,
  Send,
  BarChart3,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { KpiCard } from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import {
  adminService,
  type SystemAlert,
  type AlertConfig,
  type AlertStats,
  type AlertSeverityType,
  type AlertStatusType,
} from '../../services/adminApi';

type TabId = 'alerts' | 'configs' | 'comms';

const SEVERITY_META: Record<AlertSeverityType, { label: string; icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  CRITICAL: { label: 'Crítico', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' },
  ERROR: { label: 'Erro', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  WARNING: { label: 'Atenção', icon: Info, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  INFO: { label: 'Info', icon: Info, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800' },
};

const STATUS_META: Record<AlertStatusType, { label: string; color: string; bg: string }> = {
  NEW: { label: 'Novo', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  SEEN: { label: 'Visto', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  RESOLVED: { label: 'Resolvido', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  MUTED: { label: 'Silenciado', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
};

const COMPONENT_LABELS: Record<string, string> = {
  monitoring: 'Monitoramento', memory: 'Memória', database: 'Banco de Dados',
  redis: 'Cache Redis', email: 'Email', push: 'Push', billing: 'Billing',
  api: 'API', 'admin-test': 'Teste Admin',
};

const CONFIG_CATEGORY_META: Record<string, { label: string; color: string }> = {
  system: { label: 'Sistema', color: 'text-violet-600' },
  email: { label: 'Email', color: 'text-sky-600' },
  push: { label: 'Push', color: 'text-emerald-600' },
  business: { label: 'Negócio', color: 'text-amber-600' },
};

export function AdminAlertsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('alerts');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverityType | ''>('');
  const [filterStatus, setFilterStatus] = useState<AlertStatusType | ''>('');
  const [alertPage, setAlertPage] = useState(1);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<number>>(new Set());
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-alert-stats'],
    queryFn: () => adminService.getAlertStats(),
  });

  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['admin-alerts', filterSeverity, filterStatus, alertPage],
    queryFn: () => adminService.listAlerts({
      ...(filterSeverity && { severity: filterSeverity }),
      ...(filterStatus && { status: filterStatus }),
      page: alertPage, limit: 30,
    }),
  });

  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['admin-alert-configs'],
    queryFn: () => adminService.listAlertConfigs(),
    enabled: tab === 'configs',
  });

  const { data: commsData, isLoading: commsLoading } = useQuery({
    queryKey: ['admin-comms-log-alerts', 1],
    queryFn: () => adminService.getCommunications({ page: 1, limit: 20 }),
    enabled: tab === 'comms',
  });

  // Mutations
  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminService.updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alert-stats'] });
    },
  });

  const bulkUpdateMut = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: string }) => adminService.bulkUpdateAlerts(ids, status),
    onSuccess: () => {
      setSelectedAlerts(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alert-stats'] });
    },
  });

  const resolveTypeMut = useMutation({
    mutationFn: (type: string) => adminService.resolveAlertsByType(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alert-stats'] });
    },
  });

  const updateConfigMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertConfig> }) => adminService.updateAlertConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alert-configs'] });
      setEditingConfig(null);
    },
  });

  const testAlertMut = useMutation({
    mutationFn: () => adminService.createTestAlert({ severity: 'INFO', title: 'Teste de Alerta', message: 'Este é um alerta de teste criado pela interface admin.' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alert-stats'] });
    },
  });

  const stats: AlertStats | undefined = statsData?.data;
  const alerts: SystemAlert[] = alertsData?.data?.items ?? [];
  const totalAlerts = alertsData?.data?.total ?? 0;
  const configs: AlertConfig[] = configsData?.data ?? [];
  const comms = commsData?.data?.items ?? [];

  const tabs: Array<{ id: TabId; label: string; icon: typeof AlertTriangle }> = [
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'configs', label: 'Configurações', icon: Settings2 },
    { id: 'comms', label: 'Comunicações Enviadas', icon: Mail },
  ];

  const toggleSelect = (id: number) => {
    setSelectedAlerts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const unresolvedIds = alerts.filter(a => a.status !== 'RESOLVED').map(a => a.id);
    setSelectedAlerts(prev => prev.size === unresolvedIds.length ? new Set() : new Set(unresolvedIds));
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <AdminLayout title="Alertas & Comunicações" subtitle="Monitore alertas do sistema, configure notificações e visualize comunicações enviadas">
      <div className="space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statsLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))
          ) : (
            <>
              <KpiCard title="Alertas Hoje" value={stats?.todayCount ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
              <KpiCard title="Não Resolvidos" value={(stats?.byStatus?.NEW ?? 0) + (stats?.byStatus?.SEEN ?? 0)} subtitle="ação pendente" icon={<Clock className="w-5 h-5" />} color="rose" />
              <KpiCard title="Críticos Ativos" value={stats?.unresolvedCritical ?? 0} icon={<XCircle className="w-5 h-5" />} color="rose" />
              <KpiCard title="Últimos 7 dias" value={stats?.last7dCount ?? 0} icon={<BarChart3 className="w-5 h-5" />} color="sky" />
              <KpiCard title="Resolvidos" value={stats?.byStatus?.RESOLVED ?? 0} subtitle="total" icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn(
              'flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 -mb-px transition-colors whitespace-nowrap text-sm',
              tab === id ? 'border-olive-600 text-olive-700 dark:text-olive-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ==================== ALERTS TAB ==================== */}
        {tab === 'alerts' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2 flex-wrap items-center">
                <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value as AlertSeverityType | ''); setAlertPage(1); }}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <option value="">Toda severidade</option>
                  {Object.entries(SEVERITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as AlertStatusType | ''); setAlertPage(1); }}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <option value="">Todo status</option>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {selectedAlerts.size > 0 && (
                  <div className="flex gap-1 ml-2">
                    <Button size="sm" variant="outline" onClick={() => bulkUpdateMut.mutate({ ids: [...selectedAlerts], status: 'SEEN' })} disabled={bulkUpdateMut.isPending}>
                      <Eye className="w-3 h-3 mr-1" /> Marcar visto ({selectedAlerts.size})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdateMut.mutate({ ids: [...selectedAlerts], status: 'RESOLVED' })} disabled={bulkUpdateMut.isPending}>
                      <Check className="w-3 h-3 mr-1" /> Resolver ({selectedAlerts.size})
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => refetchAlerts()}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Atualizar
                </Button>
                <Button size="sm" variant="outline" onClick={() => testAlertMut.mutate()} disabled={testAlertMut.isPending}>
                  {testAlertMut.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />} Teste
                </Button>
              </div>
            </div>

            {/* Alert List */}
            {alertsLoading ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Nenhum alerta encontrado</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">O sistema está operando normalmente.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={selectedAlerts.size > 0 && selectedAlerts.size === alerts.filter(a => a.status !== 'RESOLVED').length}
                    onChange={selectAll} className="rounded border-gray-300 dark:border-gray-600" />
                  <span className="text-xs text-gray-500">{totalAlerts} alertas</span>
                </div>
                <div className="space-y-2">
                  {alerts.map(alert => {
                    const sev = SEVERITY_META[alert.severity];
                    const st = STATUS_META[alert.status];
                    const SevIcon = sev.icon;
                    const isExpanded = expandedAlert === alert.id;
                    return (
                      <div key={alert.id} className={cn('rounded-xl border transition-all', sev.border, alert.status === 'RESOLVED' ? 'opacity-60' : '')}>
                        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}>
                          {alert.status !== 'RESOLVED' && (
                            <input type="checkbox" checked={selectedAlerts.has(alert.id)}
                              onChange={() => toggleSelect(alert.id)} onClick={e => e.stopPropagation()}
                              className="rounded border-gray-300 dark:border-gray-600 shrink-0" />
                          )}
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', sev.bg)}>
                            <SevIcon className={cn('w-4 h-4', sev.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{alert.title}</h4>
                              <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0', st.bg, st.color)}>{st.label}</span>
                              <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0', sev.bg, sev.color)}>{sev.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.message}</p>
                          </div>
                          <div className="text-right shrink-0 hidden sm:block">
                            <p className="text-[10px] text-gray-400">{timeAgo(alert.createdAt)}</p>
                            <p className="text-[10px] text-gray-400">{COMPONENT_LABELS[alert.component] ?? alert.component}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {alert.status === 'NEW' && (
                              <button onClick={e => { e.stopPropagation(); updateStatusMut.mutate({ id: alert.id, status: 'SEEN' }); }}
                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Marcar visto">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {alert.status !== 'RESOLVED' && alert.status !== 'MUTED' && (
                              <button onClick={e => { e.stopPropagation(); updateStatusMut.mutate({ id: alert.id, status: 'RESOLVED' }); }}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Resolver">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {alert.status !== 'MUTED' && alert.status !== 'RESOLVED' && (
                              <button onClick={e => { e.stopPropagation(); updateStatusMut.mutate({ id: alert.id, status: 'MUTED' }); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" title="Silenciar">
                                <VolumeX className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                              <div><span className="text-gray-400">Componente:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{COMPONENT_LABELS[alert.component] ?? alert.component}</span></div>
                              <div><span className="text-gray-400">Tipo:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{alert.type}</span></div>
                              <div><span className="text-gray-400">Criado:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(alert.createdAt)}</span></div>
                              {alert.resolvedAt && <div><span className="text-gray-400">Resolvido:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(alert.resolvedAt)} por {alert.resolvedBy ?? '—'}</span></div>}
                            </div>
                            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                              <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Metadata</p>
                                <pre className="text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(alert.metadata, null, 2)}</pre>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" onClick={() => resolveTypeMut.mutate(alert.type)} disabled={resolveTypeMut.isPending}>
                                <Check className="w-3 h-3 mr-1" /> Resolver todos "{alert.type}"
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalAlerts > 30 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button size="sm" variant="outline" disabled={alertPage <= 1} onClick={() => setAlertPage(p => p - 1)}>Anterior</Button>
                    <span className="text-sm text-gray-500 py-2">Página {alertPage} de {Math.ceil(totalAlerts / 30)}</span>
                    <Button size="sm" variant="outline" disabled={alertPage >= Math.ceil(totalAlerts / 30)} onClick={() => setAlertPage(p => p + 1)}>Próxima</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== CONFIGS TAB ==================== */}
        {tab === 'configs' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure thresholds, canais de notificação e cooldown de cada tipo de alerta.
            </p>
            {configsLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : (
              <div className="space-y-3">
                {Object.entries(CONFIG_CATEGORY_META).map(([cat, catMeta]) => {
                  const catConfigs = configs.filter(c => c.category === cat);
                  if (catConfigs.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 mt-4', catMeta.color)}>{catMeta.label}</h3>
                      <div className="space-y-2">
                        {catConfigs.map(cfg => (
                          <ConfigRow key={cfg.id} config={cfg} editing={editingConfig === cfg.id}
                            onEdit={() => setEditingConfig(editingConfig === cfg.id ? null : cfg.id)}
                            onSave={(data) => updateConfigMut.mutate({ id: cfg.id, data })}
                            saving={updateConfigMut.isPending} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== COMMS TAB ==================== */}
        {tab === 'comms' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Últimas comunicações enviadas pela plataforma (emails e push notifications).
            </p>
            {commsLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : comms.length === 0 ? (
              <p className="text-center py-12 text-gray-400">Nenhuma comunicação registrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 pr-3">Tipo</th>
                      <th className="text-left py-2 pr-3">Canal</th>
                      <th className="text-left py-2 pr-3">Destinatário</th>
                      <th className="text-left py-2">Enviado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comms.map(c => (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            {c.templateType.startsWith('push_') ? <Bell className="w-3.5 h-3.5 text-violet-500" /> : <Mail className="w-3.5 h-3.5 text-sky-500" />}
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{c.templateType.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                            c.channel === 'B2C' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                            c.channel === 'B2B' ? 'bg-olive-100 text-olive-700 dark:bg-olive-900/30 dark:text-olive-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          )}>{c.channel}</span>
                        </td>
                        <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 text-xs">{c.recipientDomain ?? '—'}</td>
                        <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(c.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ==========================================
// Config Row Component
// ==========================================

function ConfigRow({ config, editing, onEdit, onSave, saving }: {
  config: AlertConfig;
  editing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<AlertConfig>) => void;
  saving: boolean;
}) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [cooldown, setCooldown] = useState(config.cooldownMin);
  const [channels, setChannels] = useState<string[]>(Array.isArray(config.channels) ? config.channels : []);
  const [thresholdValue, setThresholdValue] = useState(
    (config.threshold as any)?.value ?? ''
  );

  const threshold = config.threshold as Record<string, unknown> | null;
  const hasThreshold = threshold && threshold.value !== undefined;

  const handleSave = () => {
    onSave({
      enabled,
      cooldownMin: cooldown,
      channels,
      ...(hasThreshold && { threshold: { ...threshold, value: Number(thresholdValue) || thresholdValue } }),
    });
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  return (
    <div className={cn('rounded-xl border bg-white dark:bg-gray-900 transition-all',
      enabled ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 opacity-60'
    )}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => { setEnabled(!enabled); if (!editing) onEdit(); }}
          className={cn('shrink-0 w-10 h-6 rounded-full relative transition-colors', enabled ? 'bg-olive-500' : 'bg-gray-300 dark:bg-gray-600')}>
          <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', enabled ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{config.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
        </div>
        {hasThreshold && (
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-xs text-gray-500">Limite: <span className="font-medium text-gray-700 dark:text-gray-300">{String(threshold?.value)} {String(threshold?.unit ?? '')}</span></p>
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex gap-0.5">
            {(Array.isArray(config.channels) ? config.channels : []).map((ch: string) => (
              <span key={ch} className="text-[9px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                {ch === 'email' ? '📧' : ch === 'push' ? '🔔' : ch === 'slack' ? '💬' : ch}
              </span>
            ))}
          </div>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editing && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hasThreshold && (
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Limite ({String(threshold?.unit ?? '')})</label>
                <input type="number" value={thresholdValue} onChange={e => setThresholdValue(e.target.value)}
                  className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            )}
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Cooldown (min)</label>
              <input type="number" min={1} value={cooldown} onChange={e => setCooldown(parseInt(e.target.value) || 5)}
                className="mt-0.5 w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Canais</label>
              <div className="flex gap-2 mt-1">
                {['email', 'push', 'slack'].map(ch => (
                  <button key={ch} onClick={() => toggleChannel(ch)}
                    className={cn('text-xs px-2.5 py-1 rounded-lg border transition-colors',
                      channels.includes(ch) ? 'bg-olive-50 border-olive-300 text-olive-700 dark:bg-olive-900/20 dark:border-olive-700 dark:text-olive-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300')}>
                    {ch === 'email' ? '📧 Email' : ch === 'push' ? '🔔 Push' : '💬 Slack'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
