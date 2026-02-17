// Olive Baby Web - Vaccines Page (UX Improved)
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Syringe,
  Calendar,
  Check,
  Clock,
  AlertTriangle,
  SkipForward,
  Plus,
  RefreshCw,
  ChevronRight,
  Crown,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Spinner } from '../../components/ui';
import { PaywallModal, usePaywall } from '../../components/ui/PaywallModal';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { useEntitlements } from '../../hooks/useEntitlements';
import { vaccineService, billingService } from '../../services/api';
import { cn, formatDateBR } from '../../lib/utils';
import { VaccineRecordModal } from './VaccineRecordModal';

interface VaccineSummary {
  total: number;
  applied: number;
  pending: number;
  overdue: number;
  skipped: number;
  nextVaccines: {
    id: number;
    vaccineName: string;
    doseLabel: string;
    recommendedAt: string;
    daysUntil: number;
    isOverdue: boolean;
  }[];
}

interface VaccineRecord {
  id: number;
  vaccineKey: string;
  vaccineName: string;
  doseLabel: string;
  doseNumber: number;
  recommendedAt: string;
  appliedAt: string | null;
  status: 'PENDING' | 'APPLIED' | 'SKIPPED';
  source: 'PNI' | 'SBIM';
  lotNumber: string | null;
  clinicName: string | null;
  professionalName: string | null;
  notes: string | null;
  isOverdue: boolean;
  daysUntil: number;
}

function StatusBadge({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  if (status === 'APPLIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Check className="w-3 h-3" />
        Aplicada
      </span>
    );
  }
  if (status === 'SKIPPED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <SkipForward className="w-3 h-3" />
        Pulada
      </span>
    );
  }
  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        Atrasada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock className="w-3 h-3" />
      Pendente
    </span>
  );
}

function VaccineStats({ summary }: { summary: VaccineSummary }) {
  const stats = [
    { label: 'Aplicadas', value: summary.applied, color: 'bg-green-100 text-green-700', icon: Check },
    { label: 'Pendentes', value: summary.pending, color: 'bg-amber-100 text-amber-700', icon: Clock },
    { label: 'Atrasadas', value: summary.overdue, color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    { label: 'Puladas', value: summary.skipped, color: 'bg-gray-100 text-gray-600', icon: SkipForward },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', stat.color)}>
            <stat.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PremiumPreview({ onUpgrade }: { onUpgrade: () => void }) {
  const mockVaccines = [
    { name: 'BCG', dose: 'dose unica', date: 'Ao nascer', status: 'applied' },
    { name: 'Hepatite B', dose: '1a dose', date: 'Ao nascer', status: 'applied' },
    { name: 'Pentavalente', dose: '1a dose', date: '2 meses', status: 'pending' },
    { name: 'VIP (Poliomielite)', dose: '1a dose', date: '2 meses', status: 'pending' },
    { name: 'Pneumococica 10v', dose: '1a dose', date: '2 meses', status: 'pending' },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Recurso Premium</h3>
          <p className="text-gray-600 mb-4">
            O Calendario de Vacinas e exclusivo para assinantes Premium.
            Acompanhe todas as vacinas do seu bebe com lembretes e historico completo.
          </p>
          <Button
            onClick={onUpgrade}
            leftIcon={<Crown className="w-4 h-4" />}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            Fazer Upgrade
          </Button>
        </div>
      </div>
      <Card className="opacity-50">
        <CardHeader title="Calendario de Vacinas (Preview)" />
        <CardBody className="p-0">
          <div className="divide-y">
            {mockVaccines.map((vaccine, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Syringe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vaccine.name}</p>
                    <p className="text-sm text-gray-500">{vaccine.dose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    vaccine.status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {vaccine.status === 'applied' ? 'Aplicada' : 'Pendente'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{vaccine.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function VaccinesPage() {
  const { selectedBaby } = useBabyStore();
  const { can, isPremium } = useEntitlements();
  const { success, error: showError } = useToast();

  const [summary, setSummary] = useState<VaccineSummary | null>(null);
  const [timeline, setTimeline] = useState<VaccineRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  const [selectedRecord, setSelectedRecord] = useState<VaccineRecord | null>(null);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPLIED' | 'SKIPPED' | 'OVERDUE'>('ALL');

  // Ref for auto-scrolling to the form
  const formRef = useRef<HTMLDivElement>(null);

  const canAccessVaccines = can('vaccines');

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const loadData = useCallback(async () => {
    if (!selectedBaby || !canAccessVaccines) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [summaryRes, timelineRes] = await Promise.all([
        vaccineService.getSummary(selectedBaby.id),
        vaccineService.getTimeline(selectedBaby.id),
      ]);
      if (summaryRes.success) {
        setSummary(summaryRes.data);
        setDisclaimer(summaryRes.disclaimer);
      }
      if (timelineRes.success) {
        setTimeline(timelineRes.data);
      }
    } catch (err: any) {
      if (err.response?.data?.extra?.errorCode === 'PLAN_UPGRADE_REQUIRED') return;
      showError('Erro', err.response?.data?.message || 'Falha ao carregar vacinas');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBaby, canAccessVaccines, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    if (!selectedBaby) return;
    setIsSyncing(true);
    try {
      const response = await vaccineService.syncVaccines(selectedBaby.id);
      if (response.success) {
        success('Sincronizado', response.message);
        loadData();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await billingService.createCheckoutSession('PREMIUM', 'monthly');
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('ja possui uma assinatura ativa')) {
        try {
          const portalResponse = await billingService.createPortalSession();
          if (portalResponse.success && portalResponse.data?.url) {
            window.location.href = portalResponse.data.url;
          } else {
            showError('Erro', 'Voce ja possui uma assinatura ativa. Use o portal para gerenciar.');
          }
        } catch (portalErr: any) {
          showError('Erro', 'Voce ja possui uma assinatura ativa. Use o portal para gerenciar.');
        }
      } else {
        showError('Erro', err.response?.data?.message || 'Falha ao iniciar checkout');
      }
    }
  };

  const handleRecordClick = (record: VaccineRecord) => {
    setSelectedRecord(record);
    setIsRecordFormOpen(true);
    scrollToForm();
  };

  const handleOpenCreateForm = () => {
    setSelectedRecord(null);
    setIsRecordFormOpen(true);
    scrollToForm();
  };

  const handleFormClose = () => {
    setIsRecordFormOpen(false);
    setSelectedRecord(null);
  };

  const handleRecordUpdate = () => {
    loadData();
    handleFormClose();
  };

  const filteredTimeline = timeline.filter(record => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'OVERDUE') return record.status === 'PENDING' && record.isOverdue;
    return record.status === statusFilter;
  });

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Selecione um bebe primeiro</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!canAccessVaccines) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Syringe className="w-7 h-7 text-olive-600" />
            Vacinas
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Premium</span>
          </h1>
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
        <PremiumPreview onUpgrade={handleUpgrade} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Syringe className="w-7 h-7 text-olive-600" />
            Vacinas
          </h1>
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Sincronizar
          </Button>
          <Button
            onClick={handleOpenCreateForm}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Registrar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {summary && <VaccineStats summary={summary} />}

          {/* Disclaimer */}
          {disclaimer && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4 text-sm">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">{disclaimer}</p>
            </div>
          )}

          {/* Inline Form - scroll target */}
          <div ref={formRef}>
            <VaccineRecordModal
              isOpen={isRecordFormOpen}
              onClose={handleFormClose}
              record={selectedRecord}
              babyId={selectedBaby.id}
              onSuccess={handleRecordUpdate}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'Todas', count: timeline.length },
              { key: 'PENDING', label: 'Pendentes', count: timeline.filter(r => r.status === 'PENDING' && !r.isOverdue).length },
              { key: 'OVERDUE', label: 'Atrasadas', count: timeline.filter(r => r.status === 'PENDING' && r.isOverdue).length },
              { key: 'APPLIED', label: 'Aplicadas', count: timeline.filter(r => r.status === 'APPLIED').length },
              { key: 'SKIPPED', label: 'Puladas', count: timeline.filter(r => r.status === 'SKIPPED').length },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  statusFilter === filter.key
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Vaccine Calendar */}
          <Card>
            <CardHeader title="Calendario de Vacinas" subtitle={`${filteredTimeline.length} registro(s)`} />
            <CardBody className="p-0">
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-8">
                  <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma vacina encontrada</p>
                  <p className="text-sm text-gray-400">
                    {timeline.length === 0
                      ? 'Clique em "Sincronizar" para carregar o calendario'
                      : 'Nenhuma vacina com este filtro'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTimeline.map((record) => (
                    <div
                      key={record.id}
                      className={cn(
                        'flex items-center justify-between p-4 cursor-pointer transition-colors',
                        selectedRecord?.id === record.id && isRecordFormOpen
                          ? 'bg-olive-50 border-l-4 border-olive-500'
                          : 'hover:bg-gray-50'
                      )}
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          record.status === 'APPLIED' ? 'bg-green-100' :
                          record.status === 'SKIPPED' ? 'bg-gray-100' :
                          record.isOverdue ? 'bg-red-100' : 'bg-amber-100'
                        )}>
                          <Syringe className={cn(
                            'w-5 h-5',
                            record.status === 'APPLIED' ? 'text-green-600' :
                            record.status === 'SKIPPED' ? 'text-gray-500' :
                            record.isOverdue ? 'text-red-600' : 'text-amber-600'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.vaccineName}</p>
                          <p className="text-sm text-gray-500">{record.doseLabel}</p>
                          {record.appliedAt && (
                            <p className="text-xs text-gray-400">
                              Aplicada em {formatDateBR(new Date(record.appliedAt))}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={record.status} isOverdue={record.isOverdue} />
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-500">
                            {formatDateBR(new Date(record.recommendedAt))}
                          </p>
                          {record.status === 'PENDING' && (
                            <p className={cn(
                              'text-xs',
                              record.isOverdue ? 'text-red-500' : 'text-gray-400'
                            )}>
                              {record.isOverdue
                                ? `${Math.abs(record.daysUntil)} dias atrasada`
                                : record.daysUntil === 0
                                  ? 'Hoje'
                                  : `Em ${record.daysUntil} dias`
                              }
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        feature="vaccines"
        onUpgrade={handleUpgrade}
      />
    </DashboardLayout>
  );
}

export default VaccinesPage;
