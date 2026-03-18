import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Bell,
  BarChart3,
  Eye,
  Send,
  CalendarDays,
  TrendingUp,
  Users,
  Building2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Loader2,
  Smartphone,
  Zap,
  Radio,
  List,
  Wifi,
  WifiOff,
  Monitor,
  Target,
  Megaphone,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { AdminLayout } from '../../components/layout';
import {
  adminService,
  type EmailCommunication,
  type CommunicationsStats,
  type EmailTemplatePreview,
  type PushStats,
  type PushTrigger,
} from '../../services/adminApi';
import { KpiCard } from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

type TabId = 'overview' | 'email' | 'push' | 'triggers' | 'log';

const CHANNEL_LABELS: Record<string, string> = { B2C: 'B2C', B2B: 'B2B', INTERNAL: 'Interno' };
const CHANNEL_COLORS: Record<string, string> = { B2C: '#0ea5e9', B2B: '#4a7c59', INTERNAL: '#f59e0b' };
const TEMPLATE_LABELS: Record<string, string> = {
  professional_invite: 'Convite Profissional', baby_invite: 'Convite Bebê',
  password_reset: 'Recuperação Senha', welcome: 'Boas-vindas',
  alert: 'Alerta Sistema', payment_confirmation: 'Confirmação Pagamento',
  subscription_cancelled: 'Cancelamento', patient_invite: 'Convite Paciente',
  push_broadcast: 'Push Broadcast', push_test: 'Push Teste',
  push_routine_reminder: 'Push Rotina', push_inactivity_nudge: 'Push Inatividade',
};
const CATEGORY_LABELS: Record<string, string> = {
  engagement: 'Engajamento', lifecycle: 'Ciclo de Vida', clinical: 'Clínico', system: 'Sistema',
};
const CATEGORY_COLORS: Record<string, string> = {
  engagement: '#8b5cf6', lifecycle: '#0ea5e9', clinical: '#4a7c59', system: '#f59e0b',
};

export function AdminCommunicationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');

  // Email state
  const [emailRange, setEmailRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [emailGroupBy, setEmailGroupBy] = useState<'day' | 'template' | 'channel'>('day');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplatePreview | null>(null);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testEmailType, setTestEmailType] = useState('');

  // Push state
  const [broadcastForm, setBroadcastForm] = useState({ segment: 'all', title: '', body: '', clickAction: '' });
  const [showBroadcast, setShowBroadcast] = useState(false);

  // Log state
  const [logChannel, setLogChannel] = useState('');
  const [logTemplate, setLogTemplate] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Queries
  const { data: emailStats, isLoading: emailStatsLoading } = useQuery({
    queryKey: ['admin-email-stats'],
    queryFn: () => adminService.getCommunicationsStats(),
  });

  const { data: pushStatsData, isLoading: pushStatsLoading } = useQuery({
    queryKey: ['admin-push-stats'],
    queryFn: () => adminService.getPushStats(),
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: () => adminService.getEmailTemplates(),
    enabled: tab === 'email',
  });

  const { data: triggersData, isLoading: triggersLoading } = useQuery({
    queryKey: ['admin-push-triggers'],
    queryFn: () => adminService.getPushTriggers(),
    enabled: tab === 'triggers' || tab === 'overview',
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['admin-comms-volume', emailRange, emailGroupBy],
    queryFn: () => adminService.getCommunicationsVolume({ range: emailRange, groupBy: emailGroupBy }),
    enabled: tab === 'email',
  });

  const { data: logData, isLoading: logLoading } = useQuery({
    queryKey: ['admin-comms-log', logPage, logChannel, logTemplate],
    queryFn: () => adminService.getCommunications({
      page: logPage, limit: 25,
      ...(logChannel && { channel: logChannel as 'B2C' | 'B2B' | 'INTERNAL' }),
      ...(logTemplate && { templateType: logTemplate }),
    }),
    enabled: tab === 'log',
  });

  // Mutations
  const sendTestEmailMut = useMutation({
    mutationFn: ({ email, type }: { email: string; type: string }) => adminService.sendTestEmail(email, type),
    onSuccess: () => { setTestEmailAddr(''); setTestEmailType(''); queryClient.invalidateQueries({ queryKey: ['admin-email-stats'] }); },
  });

  const sendPushTestMut = useMutation({
    mutationFn: () => adminService.sendPushTest(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-push-stats'] }),
  });

  const sendBroadcastMut = useMutation({
    mutationFn: (data: typeof broadcastForm) => adminService.sendPushBroadcast(data),
    onSuccess: () => {
      setShowBroadcast(false);
      setBroadcastForm({ segment: 'all', title: '', body: '', clickAction: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-push-stats'] });
    },
  });

  const stats = emailStats?.data;
  const pushStats: PushStats | undefined = pushStatsData?.data;
  const templates: EmailTemplatePreview[] = templatesData?.data ?? [];
  const triggers: PushTrigger[] = triggersData?.data ?? [];
  const volume = volumeData?.data;

  const formatDate = (d: string) => { const dt = new Date(d); return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}`; };

  const chartByDay = volume?.groupBy === 'day' ? {
    labels: volume.series.map(s => formatDate(s.date)),
    datasets: [{
      label: 'E-mails', data: volume.series.map(s => s.count),
      backgroundColor: 'rgba(74,124,89,0.15)', borderColor: '#4a7c59', borderWidth: 2, fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#4a7c59',
    }],
  } : null;

  const chartByTemplate = volume?.groupBy === 'template' ? {
    labels: volume.series.map(s => TEMPLATE_LABELS[s.templateType] || s.templateType.replace(/_/g, ' ')),
    datasets: [{ label: 'Envios', data: volume.series.map(s => s.count), backgroundColor: ['#4a7c59', '#6b9b7a', '#8bbc9a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#06b6d4', '#78716c'].slice(0, volume.series.length), borderRadius: 6 }],
  } : null;

  const chartByChannel = volume?.groupBy === 'channel' ? {
    labels: volume.series.map(s => s.channel),
    datasets: [{ label: 'Envios', data: volume.series.map(s => s.count), backgroundColor: ['#4a7c59', '#0ea5e9', '#f59e0b'], borderRadius: 6 }],
  } : null;

  const doughnutData = stats?.byChannel ? {
    labels: Object.keys(stats.byChannel).map(k => CHANNEL_LABELS[k] || k),
    datasets: [{ data: Object.values(stats.byChannel), backgroundColor: Object.keys(stats.byChannel).map(k => CHANNEL_COLORS[k] || '#94a3b8'), borderWidth: 0 }],
  } : null;

  const platformDoughnut = pushStats?.devices?.byPlatform ? {
    labels: Object.keys(pushStats.devices.byPlatform),
    datasets: [{ data: Object.values(pushStats.devices.byPlatform), backgroundColor: ['#4a7c59', '#0ea5e9', '#f59e0b', '#8b5cf6'], borderWidth: 0 }],
  } : null;

  const tabs: Array<{ id: TabId; label: string; icon: typeof Mail }> = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'email', label: 'E-mail', icon: Mail },
    { id: 'push', label: 'Push', icon: Bell },
    { id: 'triggers', label: 'Triggers', icon: Zap },
    { id: 'log', label: 'Log Unificado', icon: List },
  ];

  const openPreview = useCallback((t: EmailTemplatePreview) => setPreviewTemplate(t), []);

  return (
    <AdminLayout title="Comunicações" subtitle="E-mail, push notifications, triggers e métricas unificadas">
      <div className="space-y-6">

        {/* ========== KPI CARDS ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {(emailStatsLoading || pushStatsLoading) ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))
          ) : (
            <>
              <KpiCard title="E-mails Enviados" value={stats?.total?.toLocaleString('pt-BR') ?? '0'} subtitle="total" icon={<Mail className="w-5 h-5" />} color="olive" />
              <KpiCard title="Push Enviados" value={pushStats?.pushSends?.total?.toLocaleString('pt-BR') ?? '0'} subtitle="total" icon={<Bell className="w-5 h-5" />} color="violet" />
              <KpiCard title="Dispositivos Ativos" value={pushStats?.devices?.active ?? 0} subtitle={`de ${pushStats?.devices?.total ?? 0} total`} icon={<Smartphone className="w-5 h-5" />} color="sky" />
              <KpiCard title="Envios Hoje" value={(stats?.todayCount ?? 0) + (pushStats?.pushSends?.today ?? 0)} subtitle="email + push" icon={<CalendarDays className="w-5 h-5" />} color="emerald" />
              <KpiCard title="Triggers Ativos" value={triggers.filter(t => t.enabled).length} subtitle={`de ${triggers.length} total`} icon={<Zap className="w-5 h-5" />} color="amber" />
            </>
          )}
        </div>

        {/* ========== TABS ========== */}
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

        {/* ==================== OVERVIEW ==================== */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email channel distribution */}
              {doughnutData && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-olive-600" /> E-mails por Canal</h3>
                  <div className="h-52 flex items-center justify-center mt-2">
                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } } }} />
                  </div>
                </div>
              )}

              {/* Device platform distribution */}
              {platformDoughnut && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm flex items-center gap-2"><Smartphone className="w-4 h-4 text-violet-600" /> Dispositivos por Plataforma</h3>
                  <div className="h-52 flex items-center justify-center mt-2">
                    <Doughnut data={platformDoughnut} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } } }} />
                  </div>
                </div>
              )}

              {/* Push capabilities */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-600" /> Provedores Push</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Web Push (VAPID)', ok: pushStats?.capabilities?.webPush, icon: Monitor },
                    { label: 'Firebase (FCM)', ok: pushStats?.capabilities?.fcm, icon: Smartphone },
                    { label: 'Expo (React Native)', ok: pushStats?.capabilities?.expo, icon: Smartphone },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-3 py-2">
                      <div className={cn('p-2 rounded-lg', p.ok ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700')}>
                        {p.ok ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</p>
                        <p className={cn('text-xs', p.ok ? 'text-emerald-600' : 'text-gray-400')}>{p.ok ? 'Configurado' : 'Não configurado'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template ranking */}
            {stats && stats.templateRanking.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Ranking de Templates (E-mail + Push)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {stats.templateRanking.slice(0, 10).map((t, idx) => {
                    const maxCount = stats.templateRanking[0]?.count || 1;
                    const pct = Math.round((t.count / maxCount) * 100);
                    const isPush = t.templateType.startsWith('push_');
                    return (
                      <div key={t.templateType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            {isPush ? <Bell className="w-3 h-3 text-violet-500" /> : <Mail className="w-3 h-3 text-olive-500" />}
                            {idx + 1}. {TEMPLATE_LABELS[t.templateType] || t.templateType}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', isPush ? 'bg-violet-500' : 'bg-olive-500')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== EMAIL TAB ==================== */}
        {tab === 'email' && (
          <div className="space-y-6">
            {/* Templates Grid */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Templates de E-mail</h3>
              {templatesLoading ? <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-olive-600" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {templates.map(t => (
                    <div key={t.type} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
                      <div className="relative h-36 bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-pointer group" onClick={() => openPreview(t)}>
                        <iframe srcDoc={t.html} title={t.name} className="w-[600px] h-[600px] origin-top-left pointer-events-none" style={{ transform: 'scale(0.35)', transformOrigin: 'top left' }} sandbox="" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow">
                            <Eye className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" /> Preview
                          </span>
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">{t.name}</h4>
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0',
                            t.channel === 'B2C' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
                            t.channel === 'B2B' && 'bg-olive-100 text-olive-800 dark:bg-olive-900/30 dark:text-olive-300',
                            t.channel === 'INTERNAL' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                          )}>{t.channel}</span>
                        </div>
                        <div className="flex gap-1.5 mt-auto pt-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => openPreview(t)}>
                            <Eye className="w-3 h-3 mr-1" /> Ver
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => { setTestEmailType(t.type); setTestEmailAddr(''); }}>
                            <Send className="w-3 h-3 mr-1" /> Testar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Volumetria */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Volumetria</h3>
                <div className="flex gap-2">
                  <select value={emailRange} onChange={e => setEmailRange(e.target.value as any)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs">
                    <option value="7d">7 dias</option><option value="30d">30 dias</option><option value="90d">90 dias</option>
                  </select>
                  <select value={emailGroupBy} onChange={e => setEmailGroupBy(e.target.value as any)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs">
                    <option value="day">Por dia</option><option value="template">Por template</option><option value="channel">Por canal</option>
                  </select>
                </div>
              </div>
              {volumeLoading ? <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-olive-600" /></div> : volume && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                  {chartByDay && <div className="h-72"><Line data={chartByDay} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /></div>}
                  {(chartByTemplate || chartByChannel) && <div className="h-72"><Bar data={chartByTemplate || chartByChannel!} options={{ responsive: true, maintainAspectRatio: false, indexAxis: chartByTemplate ? 'y' : 'x', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } }} /></div>}
                  {volume.series.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">Nenhum envio no período.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PUSH TAB ==================== */}
        {tab === 'push' && (
          <div className="space-y-6">
            {/* Push stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pushStats && (
                <>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-900/30"><Smartphone className="w-5 h-5 text-violet-600" /></div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{pushStats.devices.active}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">dispositivos ativos</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(pushStats.devices.byPlatform).map(([p, c]) => (
                        <div key={p} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{p}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{pushStats.pushSends.last30Days}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">push nos últimos 30 dias</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(pushStats.pushSends.byChannel).map(([ch, c]) => (
                        <div key={ch} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{CHANNEL_LABELS[ch] || ch}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Ações Rápidas</h4>
                    <div className="space-y-2 flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => sendPushTestMut.mutate()} disabled={sendPushTestMut.isPending}>
                        {sendPushTestMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                        Enviar push de teste (para mim)
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowBroadcast(true)}>
                        <Megaphone className="w-4 h-4 mr-2" /> Enviar push broadcast
                      </Button>
                    </div>
                    {sendPushTestMut.isSuccess && <p className="text-xs text-emerald-600 mt-2">{sendPushTestMut.data?.message}</p>}
                    {sendPushTestMut.isError && <p className="text-xs text-rose-600 mt-2">Erro ao enviar push de teste.</p>}
                  </div>
                </>
              )}
              {pushStatsLoading && [1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TRIGGERS TAB ==================== */}
        {tab === 'triggers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Triggers automáticos disparam push notifications baseados em eventos e condições do sistema.
              </p>
            </div>

            {triggersLoading ? <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-olive-600" /></div> : (
              <div className="space-y-3">
                {['B2C', 'B2B', 'INTERNAL'].map(channelGroup => {
                  const channelTriggers = triggers.filter(t => t.channel === channelGroup);
                  if (channelTriggers.length === 0) return null;
                  return (
                    <div key={channelGroup}>
                      <div className="flex items-center gap-2 mb-2 mt-4">
                        {channelGroup === 'B2C' && <Users className="w-4 h-4 text-sky-600" />}
                        {channelGroup === 'B2B' && <Building2 className="w-4 h-4 text-olive-600" />}
                        {channelGroup === 'INTERNAL' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{CHANNEL_LABELS[channelGroup] || channelGroup}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {channelTriggers.map(trigger => (
                          <div key={trigger.id} className={cn(
                            'rounded-xl border bg-white dark:bg-gray-800 p-4 transition-all',
                            trigger.enabled ? 'border-olive-300 dark:border-olive-700' : 'border-gray-200 dark:border-gray-700 opacity-75'
                          )}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Target className="w-4 h-4 text-gray-400" />
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{trigger.name}</h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{trigger.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: (CATEGORY_COLORS[trigger.category] || '#94a3b8') + '20', color: CATEGORY_COLORS[trigger.category] }}>
                                    {CATEGORY_LABELS[trigger.category]}
                                  </span>
                                  {trigger.configSchema.map(cfg => (
                                    <span key={cfg.key} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                      {cfg.label}: {String(cfg.default)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className={cn(
                                'shrink-0 w-10 h-6 rounded-full relative cursor-pointer transition-colors',
                                trigger.enabled ? 'bg-olive-500' : 'bg-gray-300 dark:bg-gray-600'
                              )}>
                                <div className={cn(
                                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                                  trigger.enabled ? 'translate-x-4' : 'translate-x-0.5'
                                )} />
                              </div>
                            </div>
                            {/* Preview payload */}
                            <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Preview da notificação</p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">{trigger.defaultPayload.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{trigger.defaultPayload.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== LOG UNIFICADO ==================== */}
        {tab === 'log' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select value={logChannel} onChange={e => { setLogChannel(e.target.value); setLogPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">Todos os canais</option><option value="B2C">B2C</option><option value="B2B">B2B</option><option value="INTERNAL">Interno</option>
              </select>
              <input type="text" placeholder="Filtrar template..." value={logTemplate} onChange={e => { setLogTemplate(e.target.value); setLogPage(1); }} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-52" />
            </div>

            {logLoading ? <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-olive-600" /></div> : logData?.data && (
              <>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <th className="w-8 py-3 px-3" />
                          <th className="text-left py-3 px-3 font-medium text-gray-700 dark:text-gray-300 w-8">Tipo</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-700 dark:text-gray-300">Template</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-700 dark:text-gray-300">Canal</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-700 dark:text-gray-300">Destino</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-700 dark:text-gray-300">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logData.data.items.map((row: EmailCommunication) => {
                          const isPush = row.templateType.startsWith('push_');
                          return (
                            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                              <td className="py-2 px-3 text-gray-400">{expandedRow === row.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</td>
                              <td className="py-2 px-3">{isPush ? <Bell className="w-4 h-4 text-violet-500" /> : <Mail className="w-4 h-4 text-olive-500" />}</td>
                              <td className="py-2 px-3 text-gray-900 dark:text-white font-medium text-xs">{TEMPLATE_LABELS[row.templateType] || row.templateType}</td>
                              <td className="py-2 px-3"><span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium',
                                row.channel === 'B2C' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
                                row.channel === 'B2B' && 'bg-olive-100 text-olive-800 dark:bg-olive-900/30 dark:text-olive-300',
                                row.channel === 'INTERNAL' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                              )}>{row.channel}</span></td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs">{row.recipientDomain ?? '—'}</td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs">{new Date(row.sentAt).toLocaleString('pt-BR')}</td>
                            </tr>
                          );
                        })}
                        {logData.data.items.map((row: EmailCommunication) => expandedRow === row.id && (
                          <tr key={`${row.id}-d`} className="bg-gray-50 dark:bg-gray-700/20">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="text-xs space-y-1">
                                <p><strong className="text-gray-700 dark:text-gray-300">ID:</strong> {row.id}</p>
                                <p><strong className="text-gray-700 dark:text-gray-300">Template:</strong> <code className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1 rounded">{row.templateType}</code></p>
                                {row.metadata && Object.keys(row.metadata).length > 0 && (
                                  <div><strong className="text-gray-700 dark:text-gray-300">Metadata:</strong>
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-[10px] overflow-x-auto">{JSON.stringify(row.metadata, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {logData.data.items.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">Nenhum registro encontrado.</p>}
                </div>
                {logData.data.total > 25 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Página {logPage} · {logData.data.total.toLocaleString('pt-BR')} registros</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)}>Anterior</Button>
                      <Button variant="outline" size="sm" disabled={logPage * 25 >= logData.data.total} onClick={() => setLogPage(p => p + 1)}>Próxima</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ==================== PREVIEW MODAL ==================== */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div><h3 className="font-semibold text-gray-900 dark:text-white">{previewTemplate.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Subject: {previewTemplate.subject}</p></div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setTestEmailType(previewTemplate.type); setTestEmailAddr(''); }}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Testar
                </Button>
                <button onClick={() => setPreviewTemplate(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
              <iframe srcDoc={previewTemplate.html} title={previewTemplate.name} className="w-full h-full min-h-[500px] bg-white" sandbox="" />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SEND TEST EMAIL MODAL ==================== */}
      {testEmailType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTestEmailType('')}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enviar E-mail de Teste</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Template: <strong>{TEMPLATE_LABELS[testEmailType] || testEmailType}</strong></p>
            <form onSubmit={e => { e.preventDefault(); if (testEmailAddr) sendTestEmailMut.mutate({ email: testEmailAddr, type: testEmailType }); }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail de destino</label>
              <input type="email" required placeholder="seu@email.com" value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm mb-4" autoFocus />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setTestEmailType('')}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={!testEmailAddr || sendTestEmailMut.isPending}>
                  {sendTestEmailMut.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4 mr-1" /> Enviar</>}
                </Button>
              </div>
              {sendTestEmailMut.isSuccess && <p className="text-sm text-emerald-600 mt-3 text-center">E-mail enviado com sucesso!</p>}
              {sendTestEmailMut.isError && <p className="text-sm text-rose-600 mt-3 text-center">Erro ao enviar.</p>}
            </form>
          </div>
        </div>
      )}

      {/* ==================== BROADCAST MODAL ==================== */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBroadcast(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Megaphone className="w-5 h-5 text-violet-600" /> Push Broadcast</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enviar push notification para um segmento de usuários.</p>
            <form onSubmit={e => { e.preventDefault(); sendBroadcastMut.mutate(broadcastForm); }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segmento</label>
                  <select value={broadcastForm.segment} onChange={e => setBroadcastForm(f => ({ ...f, segment: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                    <option value="all">Todos os usuários</option>
                    <option value="b2c">B2C (Pais/Cuidadores)</option>
                    <option value="b2b">B2B (Profissionais)</option>
                    <option value="premium">Premium</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                  <input type="text" required maxLength={100} placeholder="Título da notificação" value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
                  <textarea required maxLength={300} rows={3} placeholder="Corpo da notificação..." value={broadcastForm.body} onChange={e => setBroadcastForm(f => ({ ...f, body: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de destino (opcional)</label>
                  <input type="text" placeholder="/dashboard" value={broadcastForm.clickAction} onChange={e => setBroadcastForm(f => ({ ...f, clickAction: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowBroadcast(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={!broadcastForm.title || !broadcastForm.body || sendBroadcastMut.isPending}>
                  {sendBroadcastMut.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enviando...</> : <><Megaphone className="w-4 h-4 mr-1" /> Enviar Broadcast</>}
                </Button>
              </div>
              {sendBroadcastMut.isSuccess && (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
                  {sendBroadcastMut.data?.message} — {sendBroadcastMut.data?.data?.sent} enviados, {sendBroadcastMut.data?.data?.failed} falhas, {sendBroadcastMut.data?.data?.noToken} sem token
                </div>
              )}
              {sendBroadcastMut.isError && <p className="text-sm text-rose-600 mt-3 text-center">Erro ao enviar broadcast.</p>}
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
