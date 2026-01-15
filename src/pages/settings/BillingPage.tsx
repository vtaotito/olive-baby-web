// Olive Baby Web - Billing Settings Page
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Crown,
  Check,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Loader2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Button, Card, Badge, Spinner } from '../../components/ui';
import { billingService } from '../../services/api';
import type { BillingStatus, AvailablePlan } from '../../types/admin';
import { cn } from '../../lib/utils';

export function BillingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [plans, setPlans] = useState<AvailablePlan[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check for success/cancel from Stripe
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (success) {
      setToast({ type: 'success', message: 'Assinatura realizada com sucesso! 🎉' });
      // Clear URL params
      navigate('/settings/billing', { replace: true });
    } else if (canceled) {
      setToast({ type: 'error', message: 'Assinatura cancelada.' });
      navigate('/settings/billing', { replace: true });
    }
  }, [success, canceled, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, plansRes, stripeRes] = await Promise.all([
        billingService.getStatus(),
        billingService.getPlans(),
        billingService.getStripeStatus(),
      ]);

      if (statusRes.success) {
        setBillingStatus(statusRes.data);
      }
      if (plansRes.success) {
        setPlans(plansRes.data);
      }
      if (stripeRes.success) {
        setStripeConfigured(stripeRes.data.configured);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      setToast({ type: 'error', message: 'Erro ao carregar dados de billing' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planCode: string) => {
    if (!stripeConfigured) {
      setToast({ type: 'error', message: 'Sistema de pagamento não configurado' });
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await billingService.createCheckoutSession(planCode, selectedInterval);
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setToast({ type: 'error', message: 'Erro ao criar sessão de checkout' });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setToast({ type: 'error', message: 'Erro ao iniciar checkout' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!billingStatus?.stripeCustomerId) {
      setToast({ type: 'error', message: 'Você não tem uma assinatura ativa' });
      return;
    }

    setPortalLoading(true);
    try {
      const response = await billingService.createPortalSession();
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setToast({ type: 'error', message: 'Erro ao abrir portal de gerenciamento' });
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      setToast({ type: 'error', message: 'Erro ao abrir portal' });
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const isPremium = billingStatus?.plan === 'PREMIUM';
  const hasActiveSubscription = billingStatus?.subscription?.status === 'ACTIVE';

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2',
            toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-olive-600" />
          Assinatura
        </h1>
        <p className="text-gray-500">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Current Plan */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isPremium ? (
                  <Crown className="w-8 h-8 text-yellow-500" />
                ) : (
                  <Star className="w-8 h-8 text-gray-400" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Plano {billingStatus?.planName || 'Gratuito'}
                  </h2>
                  {billingStatus?.subscription && (
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(billingStatus.subscription.status)}
                      {billingStatus.subscription.cancelAtPeriodEnd && (
                        <Badge variant="warning">Cancela no fim do período</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {billingStatus?.subscription?.currentPeriodEnd && (
                <p className="text-sm text-gray-500 mt-2">
                  Próxima renovação: {formatDate(billingStatus.subscription.currentPeriodEnd)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Atualizar
              </Button>
              {hasActiveSubscription && (
                <Button onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gerenciar Assinatura
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          {billingStatus?.features && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(billingStatus.features).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Check
                    className={cn(
                      'w-5 h-5',
                      value ? 'text-green-500' : 'text-gray-300'
                    )}
                  />
                  <span className={cn(value ? 'text-gray-700' : 'text-gray-400')}>
                    {key === 'exportPdf' && 'Exportar PDF'}
                    {key === 'exportCsv' && 'Exportar CSV'}
                    {key === 'advancedInsights' && 'Insights Avançados'}
                    {key === 'aiChat' && 'Chat com IA'}
                    {key === 'vaccines' && 'Calendário de Vacinas'}
                    {key === 'multiCaregivers' && 'Múltiplos Cuidadores'}
                    {key === 'prioritySupport' && 'Suporte Prioritário'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Upgrade Plans */}
      {!isPremium && (
        <>
          {/* Interval Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedInterval === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setSelectedInterval('yearly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedInterval === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Anual
                <span className="ml-1 text-green-600 text-xs">-20%</span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {plans
              .filter((plan) => plan.type === 'PREMIUM')
              .map((plan) => (
                <Card
                  key={plan.id}
                  className="border-2 border-olive-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-olive-500 text-white px-3 py-1 text-sm font-medium">
                    Recomendado
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(
                            selectedInterval === 'yearly' && plan.priceYearly
                              ? plan.priceYearly / 12
                              : plan.price,
                            plan.currency
                          )}
                        </span>
                        <span className="text-gray-500 mb-1">/mês</span>
                      </div>
                      {selectedInterval === 'yearly' && plan.priceYearly && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatPrice(plan.priceYearly, plan.currency)}/ano
                        </p>
                      )}
                    </div>

                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-6">
                      {plan.features.exportPdf && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Exportação em PDF
                        </li>
                      )}
                      {plan.features.exportCsv && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Exportação em CSV
                        </li>
                      )}
                      {plan.features.advancedInsights && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Insights Avançados com IA
                        </li>
                      )}
                      {plan.features.aiChat && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Chat com Assistente IA (ilimitado)
                        </li>
                      )}
                      {plan.features.vaccines && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Calendário de Vacinas completo
                        </li>
                      )}
                      {plan.features.multiCaregivers && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Múltiplos Cuidadores
                        </li>
                      )}
                      {plan.features.prioritySupport && (
                        <li className="flex items-center gap-2 text-gray-700">
                          <Check className="w-5 h-5 text-green-500" />
                          Suporte Prioritário
                        </li>
                      )}
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-500" />
                        Até {plan.limits.maxBabies} bebês
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-500" />
                        Histórico de {plan.limits.historyDays} dias
                      </li>
                    </ul>

                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan.code)}
                      disabled={checkoutLoading || !plan.hasStripeIntegration}
                    >
                      {checkoutLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      {plan.hasStripeIntegration ? 'Assinar Premium' : 'Em breve'}
                    </Button>

                    {!plan.hasStripeIntegration && (
                      <p className="text-center text-sm text-gray-500 mt-2">
                        Pagamento ainda não disponível
                      </p>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </>
      )}

      {/* Stripe not configured warning */}
      {!stripeConfigured && (
        <Card className="mt-6 border-yellow-300 bg-yellow-50">
          <div className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Sistema de pagamento em configuração</p>
              <p className="text-sm text-yellow-700">
                O sistema de pagamentos ainda está sendo configurado. Em breve você poderá
                assinar o plano Premium.
              </p>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default BillingPage;
