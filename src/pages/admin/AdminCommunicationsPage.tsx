// Olive Baby Web - Admin Communications (emails tracking e volumetria)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  BarChart3,
  List,
  ExternalLink,
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { AdminLayout } from '../../components/layout';
import { adminService, type EmailCommunication } from '../../services/adminApi';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EMAIL_TEMPLATES = [
  { id: '01-professional-invite', name: 'Convite profissional (cuidador → profissional)', channel: 'B2B', file: '01-professional-invite.html' },
  { id: '02-baby-invite', name: 'Convite para bebê (pais/família/profissional)', channel: 'B2C', file: '02-baby-invite.html' },
  { id: '03-password-reset', name: 'Recuperação de senha', channel: 'B2C/B2B', file: '03-password-reset.html' },
  { id: '04-welcome', name: 'Boas-vindas (pós-registro)', channel: 'B2C/B2B', file: '04-welcome.html' },
  { id: '05-alert', name: 'Alerta sistema (admins)', channel: 'Interno', file: '05-alert.html' },
  { id: '06-payment-confirmation', name: 'Confirmação de pagamento', channel: 'B2C', file: '06-payment-confirmation.html' },
  { id: '07-subscription-cancelled', name: 'Cancelamento de assinatura', channel: 'B2C', file: '07-subscription-cancelled.html' },
  { id: '08-patient-invite', name: 'Convite paciente (profissional → paciente)', channel: 'B2B', file: '08-patient-invite.html' },
];

type TabId = 'templates' | 'volume' | 'log';

export function AdminCommunicationsPage() {
  const [tab, setTab] = useState<TabId>('templates');
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [groupBy, setGroupBy] = useState<'day' | 'template' | 'channel'>('day');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [templateFilter, setTemplateFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['admin-communications-volume', range, groupBy],
    queryFn: () => adminService.getCommunicationsVolume({ range, groupBy }),
    enabled: tab === 'volume',
  });

  const { data: logData, isLoading: logLoading } = useQuery({
    queryKey: ['admin-communications', page, channelFilter, templateFilter],
    queryFn: () =>
      adminService.getCommunications({
        page,
        limit: 20,
        ...(channelFilter && { channel: channelFilter as 'B2C' | 'B2B' | 'INTERNAL' }),
        ...(templateFilter && { templateType: templateFilter }),
      }),
    enabled: tab === 'log',
  });

  const volume = volumeData?.data;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const chartDataByDay =
    volume && volume.groupBy === 'day'
      ? {
          labels: volume.series.map((s) => formatDate(s.date)),
          datasets: [
            {
              label: 'E-mails enviados',
              data: volume.series.map((s) => s.count),
              backgroundColor: 'rgba(74, 124, 89, 0.6)',
              borderColor: 'rgba(74, 124, 89, 1)',
              borderWidth: 1,
            },
          ],
        }
      : null;

  const chartDataByTemplate =
    volume && volume.groupBy === 'template'
      ? {
          labels: volume.series.map((s) => s.templateType.replace(/_/g, ' ')),
          datasets: [
            {
              label: 'Envios',
              data: volume.series.map((s) => s.count),
              backgroundColor: ['#4a7c59', '#6b9b7a', '#8bbc9a', '#2196F3', '#FF9800', '#9c27b0', '#00bcd4', '#795548'].slice(0, volume.series.length),
            },
          ],
        }
      : null;

  const chartDataByChannel =
    volume && volume.groupBy === 'channel'
      ? {
          labels: volume.series.map((s) => s.channel),
          datasets: [
            {
              label: 'Envios',
              data: volume.series.map((s) => s.count),
              backgroundColor: ['#4a7c59', '#1976d2', '#f57c00'],
            },
          ],
        }
      : null;

  return (
    <AdminLayout title="Comunicações" subtitle="Templates de e-mail, volumetria e log de envios (B2C e B2B)">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'templates' as const, label: 'Templates', icon: FileText },
            { id: 'volume' as const, label: 'Volumetria', icon: BarChart3 },
            { id: 'log' as const, label: 'Log de envios', icon: List },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 font-medium border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-olive-600 text-olive-700 dark:text-olive-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Templates */}
        {tab === 'templates' && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">HTMLs para validação e melhorias</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Abra cada template no navegador para revisar layout e texto. Arquivos em <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">public/email-templates/</code>.
              </p>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {EMAIL_TEMPLATES.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.channel}</p>
                  </div>
                  <a
                    href={`/email-templates/${t.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-olive-600 dark:text-olive-400 hover:underline"
                  >
                    Abrir preview
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab: Volumetria */}
        {tab === 'volume' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as '7d' | '30d' | '90d')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'template' | 'channel')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="day">Por dia</option>
                <option value="template">Por template</option>
                <option value="channel">Por canal (B2C/B2B/Interno)</option>
              </select>
            </div>
            {volumeLoading && (
              <div className="flex justify-center py-12">
                <Spinner className="w-8 h-8 text-olive-600" />
              </div>
            )}
            {!volumeLoading && volume && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                {chartDataByDay && (
                  <div className="h-80">
                    <Line
                      data={chartDataByDay}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        },
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
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        },
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

        {/* Tab: Log */}
        {tab === 'log' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Todos os canais</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="INTERNAL">Interno</option>
              </select>
              <input
                type="text"
                placeholder="Filtrar por template"
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-48"
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
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Template</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Canal</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Domínio</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Enviado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logData.data.items.map((row: EmailCommunication) => (
                          <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="py-2 px-4 text-gray-900 dark:text-white">{row.templateType}</td>
                            <td className="py-2 px-4">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  row.channel === 'B2C' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
                                  row.channel === 'B2B' && 'bg-olive-100 text-olive-800 dark:bg-olive-900/30 dark:text-olive-300',
                                  row.channel === 'INTERNAL' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                )}
                              >
                                {row.channel}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-gray-600 dark:text-gray-400">{row.recipientDomain ?? '—'}</td>
                            <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                              {new Date(row.sentAt).toLocaleString('pt-BR')}
                            </td>
                          </tr>
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
                      Total: {logData.data.total} registros
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page * 20 >= logData.data.total}
                        onClick={() => setPage((p) => p + 1)}
                      >
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
    </AdminLayout>
  );
}
