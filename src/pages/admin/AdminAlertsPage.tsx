// Olive Baby Web - Admin Alerts Page (Central de Alertas)
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  Clock,
  Users,
  CheckCircle,
  Eye,
  Filter,
  Bell,
  BellOff,
  ChevronRight,
  Bug,
  UserMinus,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import {
  KpiCard,
  AlertTypeBadge,
  PriorityBadge,
  SkeletonList,
} from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import type { AdminAlert, AlertStatus, AlertPriority, AlertType } from '../../types/admin';

// Simulated alerts data (in production would come from API)
const generateMockAlerts = (): AdminAlert[] => [
  {
    id: '1',
    type: 'retention_drop',
    priority: 'high',
    status: 'new',
    title: 'Retenção D7 caiu 5.2pp',
    description: 'A cohort da semana 2025-W01 apresentou queda significativa na retenção D7 comparada à semana anterior.',
    impact: 'Potencial perda de 15% dos novos usuários',
    affectedCount: 42,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/admin/activation',
  },
  {
    id: '2',
    type: 'inactive_users',
    priority: 'medium',
    status: 'new',
    title: '28 usuários inativos há mais de 7 dias',
    description: 'Usuários que não registraram nenhuma rotina nos últimos 7 dias.',
    impact: 'Risco de churn elevado',
    affectedCount: 28,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/admin/users?status=inactive',
  },
  {
    id: '3',
    type: 'errors',
    priority: 'high',
    status: 'seen',
    title: 'Aumento de erros 500 na API',
    description: 'Taxa de erros 5xx subiu 3x nas últimas 24 horas.',
    impact: 'Experiência do usuário afetada',
    affectedCount: 156,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    link: '/admin/errors',
  },
  {
    id: '4',
    type: 'pending_invites',
    priority: 'low',
    status: 'new',
    title: '12 convites de profissionais pendentes',
    description: 'Convites enviados há mais de 48h sem resposta.',
    affectedCount: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'churn_risk',
    priority: 'high',
    status: 'new',
    title: '8 usuários premium em risco de churn',
    description: 'Usuários premium que reduziram significativamente o uso nos últimos 14 dias.',
    impact: 'Perda potencial de R$ 320/mês',
    affectedCount: 8,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    link: '/admin/users?plan=PREMIUM&status=inactive',
  },
  {
    id: '6',
    type: 'cohort_warning',
    priority: 'medium',
    status: 'resolved',
    title: 'Cohort 2024-W52 abaixo da meta',
    description: 'Retenção D7 de 18%, abaixo da meta de 25%.',
    affectedCount: 35,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/admin/activation',
  },
];

// Alert Icon Component
function AlertIcon({ type }: { type: AlertType }) {
  const iconConfig: Record<AlertType, { icon: typeof AlertCircle; color: string }> = {
    retention_drop: { icon: TrendingDown, color: 'text-rose-500' },
    inactive_users: { icon: UserMinus, color: 'text-amber-500' },
    errors: { icon: Bug, color: 'text-red-500' },
    pending_invites: { icon: Clock, color: 'text-sky-500' },
    churn_risk: { icon: AlertTriangle, color: 'text-orange-500' },
    cohort_warning: { icon: AlertCircle, color: 'text-amber-500' },
  };

  const { icon: Icon, color } = iconConfig[type];
  return <Icon className={cn('w-5 h-5', color)} />;
}

// Alert Card Component
interface AlertCardProps {
  alert: AdminAlert;
  onMarkSeen: (id: string) => void;
  onResolve: (id: string) => void;
  onClick: () => void;
}

function AlertCard({ alert, onMarkSeen, onResolve, onClick }: AlertCardProps) {
  const isNew = alert.status === 'new';
  const isResolved = alert.status === 'resolved';

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora';
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-xl p-4 transition-all duration-200',
        isNew ? 'border-l-4 border-l-rose-500 border-gray-200' :
        isResolved ? 'border-gray-200 opacity-60' :
        'border-gray-200',
        !isResolved && 'hover:shadow-md cursor-pointer'
      )}
      onClick={() => !isResolved && onClick()}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'p-2 rounded-lg',
          isNew ? 'bg-rose-50' :
          isResolved ? 'bg-gray-100' :
          'bg-amber-50'
        )}>
          <AlertIcon type={alert.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn(
                  'font-medium',
                  isResolved ? 'text-gray-500' : 'text-gray-900'
                )}>
                  {alert.title}
                </h4>
                {isNew && (
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">
                    NOVO
                  </span>
                )}
              </div>
              <p className={cn(
                'text-sm mt-1',
                isResolved ? 'text-gray-400' : 'text-gray-500'
              )}>
                {alert.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={alert.priority} />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <AlertTypeBadge type={alert.type} />
            {alert.affectedCount && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {alert.affectedCount} afetados
              </span>
            )}
            {alert.impact && (
              <span className="text-xs text-amber-600 font-medium">
                {alert.impact}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {timeAgo(alert.createdAt)}
            </span>
          </div>

          {/* Actions */}
          {!isResolved && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              {isNew && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkSeen(alert.id);
                  }}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  Marcar como visto
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(alert.id);
                }}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                className="text-emerald-600 hover:bg-emerald-50"
              >
                Resolver
              </Button>
              {alert.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="ml-auto"
                >
                  Investigar
                </Button>
              )}
            </div>
          )}

          {/* Resolved info */}
          {isResolved && alert.resolvedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Resolvido {timeAgo(alert.resolvedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAlertsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all');
  
  // In production, this would fetch from API
  const [alerts, setAlerts] = useState<AdminAlert[]>(generateMockAlerts);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && alert.priority !== priorityFilter) return false;
    return true;
  });

  // Stats
  const newAlerts = alerts.filter(a => a.status === 'new').length;
  const highPriorityAlerts = alerts.filter(a => a.priority === 'high' && a.status !== 'resolved').length;
  const resolvedToday = alerts.filter(a => 
    a.status === 'resolved' && 
    a.resolvedAt && 
    new Date(a.resolvedAt).toDateString() === new Date().toDateString()
  ).length;

  // Handlers
  const handleMarkSeen = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'seen' as AlertStatus } : a
    ));
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() } : a
    ));
  };

  const handleAlertClick = (alert: AdminAlert) => {
    if (alert.link) {
      navigate(alert.link);
    }
  };

  return (
    <AdminLayout
      title="Alertas"
      subtitle="Central de monitoramento e alertas do sistema"
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Novos Alertas"
          value={newAlerts}
          icon={<Bell className="w-6 h-6" />}
          color={newAlerts > 0 ? 'rose' : 'emerald'}
        />
        <KpiCard
          title="Alta Prioridade"
          value={highPriorityAlerts}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={highPriorityAlerts > 0 ? 'amber' : 'emerald'}
        />
        <KpiCard
          title="Resolvidos Hoje"
          value={resolvedToday}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
        <KpiCard
          title="Total Pendentes"
          value={alerts.filter(a => a.status !== 'resolved').length}
          icon={<Clock className="w-6 h-6" />}
          color="sky"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Filtrar:</span>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
          >
            <option value="all">Todos os status</option>
            <option value="new">Novos</option>
            <option value="seen">Vistos</option>
            <option value="resolved">Resolvidos</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as AlertPriority | 'all')}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-500"
          >
            <option value="all">Todas as prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="text-sm text-olive-600 hover:text-olive-700"
          >
            Limpar filtros
          </button>
        )}

        <span className="text-sm text-gray-500 ml-auto">
          {filteredAlerts.length} alerta(s)
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts
            .sort((a, b) => {
              // Sort by: new first, then by priority, then by date
              if (a.status !== b.status) {
                if (a.status === 'new') return -1;
                if (b.status === 'new') return 1;
                if (a.status === 'resolved') return 1;
                if (b.status === 'resolved') return -1;
              }
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onMarkSeen={handleMarkSeen}
                onResolve={handleResolve}
                onClick={() => handleAlertClick(alert)}
              />
            ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum alerta encontrado</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Tudo sob controle!'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
