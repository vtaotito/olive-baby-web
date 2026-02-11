// Olive Baby Web - Admin Billing Page
import { useState, useEffect } from 'react';
import {
  CreditCard,
  Settings,
  Users,
  Activity,
  ExternalLink,
  RefreshCw,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button, Card, Badge, Spinner, Input } from '../../components/ui';
import { billingService } from '../../services/api';
import { adminService } from '../../services/adminApi';
import type { AdminSubscription, BillingEvent, Plan } from '../../types/admin';
import { cn } from '../../lib/utils';

export function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'events'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [events, setEvents] = useState<BillingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    stripeProductId: '',
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'plans') {
        const response = await adminService.getPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } else if (activeTab === 'subscriptions') {
        const response = await billingService.getAdminSubscriptions();
        if (response.success) {
          setSubscriptions(response.data);
        }
      } else if (activeTab === 'events') {
        const response = await billingService.getAdminEvents();
        if (response.success) {
          setEvents(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ type: 'error', message: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      stripeProductId: (plan as any).stripeProductId || '',
      stripePriceIdMonthly: (plan as any).stripePriceIdMonthly || '',
      stripePriceIdYearly: (plan as any).stripePriceIdYearly || '',
    });
  };

  const handleSavePlan = async (planId: number) => {
    try {
      await billingService.updatePlanStripeConfig(planId, editForm);
      setToast({ type: 'success', message: 'Configuração salva com sucesso' });
      setEditingPlan(null);
      loadData();
    } catch (error) {
      console.error('Error saving plan:', error);
      setToast({ type: 'error', message: 'Erro ao salvar configuração' });
    }
  };

  const handleOpenPortal = async (userId: number) => {
    try {
      const response = await billingService.createAdminPortalSession(userId);
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      setToast({ type: 'error', message: 'Erro ao abrir portal do usuário' });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
      ACTIVE: { label: 'Ativo', variant: 'success' },
      TRIALING: { label: 'Trial', variant: 'warning' },
      PAST_DUE: { label: 'Atrasado', variant: 'danger' },
      CANCELED: { label: 'Cancelado', variant: 'danger' },
      INCOMPLETE: { label: 'Incompleto', variant: 'warning' },
      UNPAID: { label: 'Não pago', variant: 'danger' },
    };
    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2',
            toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-olive-600" />
            Billing Admin
          </h1>
          <p className="text-gray-500">Gerenciar planos, assinaturas e webhooks</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { key: 'plans', label: 'Planos', icon: Settings },
            { key: 'subscriptions', label: 'Assinaturas', icon: Users },
            { key: 'events', label: 'Webhooks', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-olive-500 text-olive-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <Badge variant={plan.type === 'PREMIUM' ? 'success' : 'secondary'}>{plan.type}</Badge>
                        {!plan.isActive && <Badge variant="danger">Inativo</Badge>}
                      </div>
                      <p className="text-gray-600 mb-4">{plan.description}</p>

                      {editingPlan === plan.id ? (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stripe Product ID
                            </label>
                            <Input
                              value={editForm.stripeProductId}
                              onChange={(e) =>
                                setEditForm({ ...editForm, stripeProductId: e.target.value })
                              }
                              placeholder="prod_..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stripe Price ID (Mensal)
                            </label>
                            <Input
                              value={editForm.stripePriceIdMonthly}
                              onChange={(e) =>
                                setEditForm({ ...editForm, stripePriceIdMonthly: e.target.value })
                              }
                              placeholder="price_..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stripe Price ID (Anual)
                            </label>
                            <Input
                              value={editForm.stripePriceIdYearly}
                              onChange={(e) =>
                                setEditForm({ ...editForm, stripePriceIdYearly: e.target.value })
                              }
                              placeholder="price_..."
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => handleSavePlan(plan.id)}>
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingPlan(null)}>
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <p>
                            <strong>Product ID:</strong> {(plan as any).stripeProductId || 'Não configurado'}
                          </p>
                          <p>
                            <strong>Price ID Mensal:</strong>{' '}
                            {(plan as any).stripePriceIdMonthly || 'Não configurado'}
                          </p>
                          <p>
                            <strong>Price ID Anual:</strong>{' '}
                            {(plan as any).stripePriceIdYearly || 'Não configurado'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {editingPlan !== plan.id && (
                        <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>
                          <Edit2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Intervalo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Período
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Nenhuma assinatura encontrada
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {sub.user.caregiver?.fullName || sub.user.email}
                              </p>
                              <p className="text-sm text-gray-500">{sub.user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={sub.plan.type === 'PREMIUM' ? 'success' : 'secondary'}>
                              {sub.plan.name}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sub.interval === 'YEARLY' ? 'Anual' : 'Mensal'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(sub.currentPeriodEnd)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPortal(sub.userId)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Portal
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Event ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Nenhum evento encontrado
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {event.stripeEventId.slice(0, 20)}...
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {event.type}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            {event.processed ? (
                              <Badge variant="success">Processado</Badge>
                            ) : event.errorMessage ? (
                              <Badge variant="danger">Erro</Badge>
                            ) : (
                              <Badge variant="warning">Pendente</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(event.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default AdminBillingPage;
