import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  BarChart3,
  List,
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
} from '../../services/adminApi';
import { KpiCard } from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

type TabId = 'overview' | 'templates' | 'volume' | 'log';

const CHANNEL_LABELS: Record<string, string> = {
  B2C: 'Consumidor (B2C)',
  B2B: 'Profissional (B2B)',
  INTERNAL: 'Interno',
};

const CHANNEL_COLORS: Record<string, string> = {
  B2C: '#0ea5e9',
  B2B: '#4a7c59',
  INTERNAL: '#f59e0b',
};

const TEMPLATE_LABELS: Record<string, string> = {
  professional_invite: 'Convite Profissional',
  baby_invite: 'Convite Bebê',
  password_reset: 'Recuperação de Senha',
  welcome: 'Boas-vindas',
  alert: 'Alerta do Sistema',
  payment_confirmation: 'Confirmação Pagamento',
  subscription_cancelled: 'Cancelamento',
  patient_invite: 'Convite Paciente',
};

export function AdminCommunicationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('overview');
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [groupBy, setGroupBy] = useState<'day' | 'template' | 'channel'>('day');
  const [channelFilter, setChannelFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplatePreview | null>(null);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testEmailType, setTestEmailType] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-comms-stats'],
    queryFn: () => adminService.getCommunicationsStats(),
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: () => adminService.getEmailTemplates(),
    enabled: tab === 'templates' || tab === 'overview',
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['admin-comms-volume', range, groupBy],
    queryFn: () => adminService.getCommunicationsVolume({ range, groupBy }),
    enabled: tab === 'volume' || tab === 'overview',
  });

  const { data: logData, isLoading: logLoading } = useQuery({
    queryKey: ['admin-comms-log', page, channelFilter, templateFilter],
    queryFn: () =>
      adminService.getCommunications({
        page,
        limit: 20,
        ...(channelFilter && { channel: channelFilter as 'B2C' | 'B2B' | 'INTERNAL' }),
        ...(templateFilter && { templateType: templateFilter }),
      }),
    enabled: tab === 'log',
  });

  const sendTestMutation = useMutation({
    mutationFn: ({ email, type }: { email: string; type: string }) =>
      adminService.sendTestEmail(email, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comms-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-comms-log'] });
      setTestEmailAddr('');
      setTestEmailType('');
    },
  });

  const stats: CommunicationsStats | undefined = statsData?.data;
  const volume = volumeData?.data;
  const templates: EmailTemplatePreview[] = templatesData?.data ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const openPreview = useCallback((t: EmailTemplatePreview) => {
    setPreviewTemplate(t);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewTemplate(null);
  }, []);

  const handleSendTest = useCallback((type: string) => {
    setTestEmailType(type);
    setTestEmailAddr('');
  }, []);

  const chartDataByDay = volume && volume.groupBy === 'day' ? {
    labels: volume.series.map(s => formatDate(s.date)),
    datasets: [{
      label: 'E-mails enviados',
      data: volume.series.map(s => s.count),
      backgroundColor: 'rgba(74, 124, 89, 0.15)',
      borderColor: '#4a7c59',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#4a7c59',
    }],
  } : null;

  const chartDataByTemplate = volume && volume.groupBy === 'template' ? {
    labels: volume.series.map(s => TEMPLATE_LABELS[s.templateType] || s.templateType.replace(/_/g, ' ')),
    datasets: [{
      label: 'Envios',
      data: volume.series.map(s => s.count),
      backgroundColor: ['#4a7c59', '#6b9b7a', '#8bbc9a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#06b6d4', '#78716c']
        .slice(0, volume.series.length),
      borderRadius: 6,
    }],
  } : null;

  const chartDataByChannel = volume && volume.groupBy === 'channel' ? {
    labels: volume.series.map(s => s.channel),
    datasets: [{
      label: 'Envios',
      data: volume.series.map(s => s.count),
      backgroundColor: ['#4a7c59', '#0ea5e9', '#f59e0b'],
      borderRadius: 6,
    }],
  } : null;

  const doughnutChannelData = stats?.byChannel ? {
    labels: Object.keys(stats.byChannel).map(k => CHANNEL_LABELS[k] || k),
    datasets: [{
      data: Object.values(stats.byChannel),
      backgroundColor: Object.keys(stats.byChannel).map(k => CHANNEL_COLORS[k] || '#94a3b8'),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  } : null;

  const tabs: Array<{ id: TabId; label: string; icon: typeof Mail }> = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: Eye },
    { id: 'volume', label: 'Volumetria', icon: TrendingUp },
    { id: 'log', label: 'Log de Envios', icon: List },
  ];

  return (
    <AdminLayout title="Comunicações" subtitle="Emails enviados, templates, métricas e testes">
      <div className="space-y-6">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total de E-mails"
              value={stats.total.toLocaleString('pt-BR')}
              subtitle="desde o início"
              icon={<Mail className="w-5 h-5" />}
              color="olive"
            />
            <KpiCard
              title="Hoje"
              value={stats.todayCount}
              subtitle="enviados hoje"
              icon={<CalendarDays className="w-5 h-5" />}
              color="sky"
            />
            <KpiCard
              title="Últimos 30 dias"
              value={stats.last30Days.toLocaleString('pt-BR')}
              subtitle={`~${stats.avgPerDay}/dia`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <KpiCard
              title="Templates Ativos"
              value={stats.templateRanking.length}
              subtitle="tipos diferentes"
              icon={<Eye className="w-5 h-5" />}
              color="violet"
            />
          </div>
        )}
        {statsLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 -mb-px transition-colors whitespace-nowrap text-sm',
                tab === id
                  ? 'border-olive-600 text-olive-700 dark:text-olive-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ==================== OVERVIEW ==================== */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Canal */}
            {doughnutChannelData && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Canal</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={doughnutChannelData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '60%',
                      plugins: {
                        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Top Templates */}
            {stats && stats.templateRanking.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ranking de Templates</h3>
                <div className="space-y-3">
                  {stats.templateRanking.map((t, idx) => {
                    const maxCount = stats.templateRanking[0]?.count || 1;
                    const pct = Math.round((t.count / maxCount) * 100);
                    return (
                      <div key={t.templateType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {idx + 1}. {TEMPLATE_LABELS[t.templateType] || t.templateType}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-olive-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Channel breakdown cards */}
            {stats?.byChannel && (
              <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                {Object.entries(stats.byChannel).map(([channel, count]) => (
                  <div key={channel} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-center">
                    <div className="inline-flex p-2.5 rounded-lg mb-2" style={{ backgroundColor: (CHANNEL_COLORS[channel] || '#94a3b8') + '20' }}>
                      {channel === 'B2C' && <Users className="w-5 h-5" style={{ color: CHANNEL_COLORS[channel] }} />}
                      {channel === 'B2B' && <Building2 className="w-5 h-5" style={{ color: CHANNEL_COLORS[channel] }} />}
                      {channel === 'INTERNAL' && <AlertTriangle className="w-5 h-5" style={{ color: CHANNEL_COLORS[channel] }} />}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{CHANNEL_LABELS[channel] || channel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TEMPLATES ==================== */}
        {tab === 'templates' && (
          <div className="space-y-4">
            {templatesLoading && (
              <div className="flex justify-center py-12">
                <Spinner className="w-8 h-8 text-olive-600" />
              </div>
            )}
            {!templatesLoading && templates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {templates.map(t => (
                  <div
                    key={t.type}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col"
                  >
                    {/* Preview thumbnail */}
                    <div
                      className="relative h-48 bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-pointer group"
                      onClick={() => openPreview(t)}
                    >
                      <iframe
                        srcDoc={t.html}
                        title={t.name}
                        className="w-[600px] h-[600px] origin-top-left pointer-events-none"
                        style={{ transform: 'scale(0.42)', transformOrigin: 'top left' }}
                        sandbox=""
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow">
                          <Eye className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                          Ver preview
                        </span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium shrink-0',
                          t.channel === 'B2C' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
                          t.channel === 'B2B' && 'bg-olive-100 text-olive-800 dark:bg-olive-900/30 dark:text-olive-300',
                          t.channel === 'INTERNAL' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                        )}>
                          {t.channel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{t.subject}</p>
                      <div className="flex gap-2 mt-auto">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openPreview(t)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendTest(t.type)}>
                          <Send className="w-3.5 h-3.5 mr-1" /> Testar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== VOLUMETRIA ==================== */}
        {tab === 'volume' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={range}
                onChange={e => setRange(e.target.value as '7d' | '30d' | '90d')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value as 'day' | 'template' | 'channel')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="day">Por dia</option>
                <option value="template">Por template</option>
                <option value="channel">Por canal</option>
              </select>
            </div>
            {volumeLoading && (
              <div className="flex justify-center py-12">
                <Spinner className="w-8 h-8 text-olive-600" />
              </div>
            )}
            {!volumeLoading && volume && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                {chartDataByDay && (
                  <div className="h-80">
                    <Line
                      data={chartDataByDay}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                      }}
                    />
                  </div>
                )}
                {(chartDataByTemplate || chartDataByChannel) && (
                  <div className="h-80">
                    <Bar
                      data={chartDataByTemplate || chartDataByChannel!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: chartDataByTemplate ? 'y' as const : 'x' as const,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } }, y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                )}
                {volume.series.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum envio registrado no período.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== LOG DE ENVIOS ==================== */}
        {tab === 'log' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={channelFilter}
                onChange={e => { setChannelFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Todos os canais</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="INTERNAL">Interno</option>
              </select>
              <input
                type="text"
                placeholder="Filtrar por template..."
                value={templateFilter}
                onChange={e => { setTemplateFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-52"
              />
            </div>

            {logLoading && (
              <div className="flex justify-center py-12">
                <Spinner className="w-8 h-8 text-olive-600" />
              </div>
            )}

            {!logLoading && logData?.data && (
              <>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-8" />
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Template</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Canal</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Domínio</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Enviado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logData.data.items.map((row: EmailCommunication) => (
                          <>
                            <tr
                              key={row.id}
                              className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                            >
                              <td className="py-2 px-4 text-gray-400">
                                {expandedRow === row.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </td>
                              <td className="py-2 px-4 text-gray-900 dark:text-white font-medium">
                                {TEMPLATE_LABELS[row.templateType] || row.templateType}
                              </td>
                              <td className="py-2 px-4">
                                <span className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  row.channel === 'B2C' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
                                  row.channel === 'B2B' && 'bg-olive-100 text-olive-800 dark:bg-olive-900/30 dark:text-olive-300',
                                  row.channel === 'INTERNAL' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                                )}>
                                  {row.channel}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-gray-600 dark:text-gray-400">{row.recipientDomain ?? '—'}</td>
                              <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                                {new Date(row.sentAt).toLocaleString('pt-BR')}
                              </td>
                            </tr>
                            {expandedRow === row.id && (
                              <tr key={`${row.id}-detail`} className="bg-gray-50 dark:bg-gray-700/20">
                                <td colSpan={5} className="px-4 py-3">
                                  <div className="text-xs space-y-1">
                                    <p><strong className="text-gray-700 dark:text-gray-300">ID:</strong> <span className="text-gray-500 dark:text-gray-400">{row.id}</span></p>
                                    <p><strong className="text-gray-700 dark:text-gray-300">Template Type:</strong> <span className="font-mono text-gray-500 dark:text-gray-400">{row.templateType}</span></p>
                                    {row.metadata && Object.keys(row.metadata).length > 0 && (
                                      <div>
                                        <strong className="text-gray-700 dark:text-gray-300">Metadata:</strong>
                                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                          {JSON.stringify(row.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {logData.data.items.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum registro encontrado.</p>
                  )}
                </div>

                {logData.data.total > 20 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Página {page} · {logData.data.total.toLocaleString('pt-BR')} registros
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" disabled={page * 20 >= logData.data.total} onClick={() => setPage(p => p + 1)}>
                        Próxima
                      </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closePreview}>
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{previewTemplate.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Subject: {previewTemplate.subject}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleSendTest(previewTemplate.type)}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Enviar Teste
                </Button>
                <button
                  onClick={closePreview}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">
              <iframe
                ref={iframeRef}
                srcDoc={previewTemplate.html}
                title={previewTemplate.name}
                className="w-full h-full min-h-[500px] bg-white"
                sandbox=""
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== SEND TEST MODAL ==================== */}
      {testEmailType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTestEmailType('')}>
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enviar E-mail de Teste</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Template: <strong>{TEMPLATE_LABELS[testEmailType] || testEmailType}</strong>
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (testEmailAddr) sendTestMutation.mutate({ email: testEmailAddr, type: testEmailType });
              }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-mail de destino
              </label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={testEmailAddr}
                onChange={e => setTestEmailAddr(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setTestEmailType('')}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!testEmailAddr || sendTestMutation.isPending}
                >
                  {sendTestMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enviando...</>
                  ) : sendTestMutation.isSuccess && !sendTestMutation.isPending ? (
                    <><Check className="w-4 h-4 mr-1" /> Enviado!</>
                  ) : (
                    <><Send className="w-4 h-4 mr-1" /> Enviar</>
                  )}
                </Button>
              </div>
              {sendTestMutation.isSuccess && (
                <p className="text-sm text-emerald-600 mt-3 text-center">
                  E-mail enviado com sucesso!
                </p>
              )}
              {sendTestMutation.isError && (
                <p className="text-sm text-rose-600 mt-3 text-center">
                  Erro ao enviar. Verifique o log do servidor.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
