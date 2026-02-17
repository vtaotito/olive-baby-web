// Olive Baby Web - Admin Babies Page with Permission Tree & Detailed Data
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Baby,
  Users,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  X,
  Crown,
  Shield,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Heart,
  Ruler,
  Weight,
  FileText,
  Syringe,
  TrendingUp,
  Droplets,
  Moon,
  UtensilsCrossed,
  Bath,
  Milk,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { adminService } from '../../services/adminApi';
import { Button, Spinner } from '../../components/ui';
import { cn, formatAge, formatDateBR } from '../../lib/utils';
import type { AdminBaby, AdminBabyFilters } from '../../types/admin';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  ACTIVE: { label: 'Ativo', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  INVITED: { label: 'Convidado', color: 'bg-blue-100 text-blue-700', icon: Send },
  REVOKED: { label: 'Revogado', color: 'bg-red-100 text-red-700', icon: XCircle },
  ACCEPTED: { label: 'Aceito', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-600', icon: AlertTriangle },
  BLOCKED: { label: 'Bloqueado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const memberTypeLabels: Record<string, string> = {
  PARENT: 'Responsavel',
  FAMILY: 'Familiar',
  PROFESSIONAL: 'Profissional',
};

const roleLabels: Record<string, string> = {
  OWNER_PARENT_1: 'Responsavel Principal 1',
  OWNER_PARENT_2: 'Responsavel Principal 2',
  FAMILY_VIEWER: 'Familiar (Visualizacao)',
  FAMILY_EDITOR: 'Familiar (Edicao)',
  PEDIATRICIAN: 'Pediatra',
  OBGYN: 'Obstetra',
  LACTATION_CONSULTANT: 'Consultora Amamentacao',
  OTHER: 'Outro',
};

const relationshipLabels: Record<string, string> = {
  MOTHER: 'Mae',
  FATHER: 'Pai',
  GRANDMOTHER: 'Avo',
  GRANDFATHER: 'Avo',
  OTHER: 'Outro',
};

const routineTypeConfig: Record<string, { label: string; icon: typeof Activity; color: string }> = {
  FEEDING: { label: 'Alimentacao', icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
  SLEEP: { label: 'Sono', icon: Moon, color: 'text-indigo-600 bg-indigo-50' },
  DIAPER: { label: 'Fralda', icon: Droplets, color: 'text-sky-600 bg-sky-50' },
  BATH: { label: 'Banho', icon: Bath, color: 'text-cyan-600 bg-cyan-50' },
  MILK_EXTRACTION: { label: 'Extracao de Leite', icon: Milk, color: 'text-pink-600 bg-pink-50' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function getActivityStatus(lastActivityAt: string | null | undefined): { label: string; color: string } {
  if (!lastActivityAt) return { label: 'Sem atividade', color: 'bg-gray-100 text-gray-500' };
  const diff = Date.now() - new Date(lastActivityAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 7) return { label: `${days}d atras`, color: 'bg-green-100 text-green-700' };
  if (days <= 30) return { label: `${days}d atras`, color: 'bg-amber-100 text-amber-700' };
  return { label: `${days}d atras`, color: 'bg-red-100 text-red-700' };
}

export function AdminBabiesPage() {
  const [filters, setFilters] = useState<AdminBabyFilters>({ page: 1, limit: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBabyId, setSelectedBabyId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-babies', filters],
    queryFn: () => adminService.listBabies(filters),
  });

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof AdminBabyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const babies = data?.data || [];
  const pagination = data?.pagination;

  return (
    <AdminLayout title="Bebes">
      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome do bebe, cuidador ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos os estados</option>
                {BRAZILIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {pagination && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            <p className="text-xs text-gray-500">Total de Bebes</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {babies.filter(b => b.routinesCount30d > 0).length}
            </p>
            <p className="text-xs text-gray-500">Ativos (30d)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {babies.filter(b => b.routinesTotal > 0 && b.routinesCount30d === 0).length}
            </p>
            <p className="text-xs text-gray-500">Inativos (30d)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-400">
              {babies.filter(b => b.routinesTotal === 0).length}
            </p>
            <p className="text-xs text-gray-500">Sem dados</p>
          </div>
        </div>
      )}

      {/* Babies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {babies.map((baby) => (
              <BabyCard key={baby.id} baby={baby} onClick={() => setSelectedBabyId(baby.id)} />
            ))}
          </div>

          {babies.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum bebe encontrado</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} bebes
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  disabled={pagination.page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2">{pagination.page} / {pagination.totalPages}</span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Baby Details Drawer */}
      {selectedBabyId && (
        <BabyDetailsDrawer babyId={selectedBabyId} onClose={() => setSelectedBabyId(null)} />
      )}
    </AdminLayout>
  );
}

// ====== Baby Card ======
function BabyCard({ baby, onClick }: { baby: AdminBaby; onClick: () => void }) {
  const activityStatus = getActivityStatus(baby.lastActivityAt);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-olive-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
            <Baby className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-sm">{baby.name}</h3>
            <p className="text-xs text-gray-500">{formatAge(baby.birthDate)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', activityStatus.color)}>
            {activityStatus.label}
          </span>
        </div>
      </div>

      {/* Data Counts Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-olive-50 border border-olive-100 rounded-lg p-2 text-center">
          <Activity className="w-3.5 h-3.5 text-olive-600 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-gray-900">{baby.routinesTotal}</p>
          <p className="text-[9px] text-gray-500 leading-tight">Rotinas</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-gray-900">{baby.growthCount}</p>
          <p className="text-[9px] text-gray-500 leading-tight">Crescimento</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
          <Syringe className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-gray-900">{baby.vaccinesCount}</p>
          <p className="text-[9px] text-gray-500 leading-tight">Vacinas</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-lg p-2 text-center">
          <Clipboard className="w-3.5 h-3.5 text-violet-600 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-gray-900">{baby.milestonesCount}</p>
          <p className="text-[9px] text-gray-500 leading-tight">Marcos</p>
        </div>
      </div>

      {/* 30d indicator */}
      {baby.routinesTotal > 0 && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-gray-50 rounded-lg">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            Ultimos 30 dias: <span className={cn('font-semibold', baby.routinesCount30d > 0 ? 'text-green-600' : 'text-red-500')}>{baby.routinesCount30d} rotinas</span>
          </span>
        </div>
      )}

      {/* Links */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3 h-3 text-sky-500" />
          <span>{baby.caregiversCount} cuidador{baby.caregiversCount !== 1 ? 'es' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Stethoscope className="w-3 h-3 text-emerald-500" />
          <span>{baby.professionalsCount} profissional{baby.professionalsCount !== 1 ? 'is' : ''}</span>
        </div>
      </div>

      {/* Primary caregiver */}
      {baby.primaryCaregiver && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-gray-900 font-medium truncate">{baby.primaryCaregiver.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate">{baby.primaryCaregiver.email}</p>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
              {relationshipLabels[baby.primaryCaregiver.relationship] || baby.primaryCaregiver.relationship?.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{baby.city ? `${baby.city}, ${baby.state}` : baby.state || '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDateBR(new Date(baby.birthDate))}</span>
        </div>
      </div>
    </div>
  );
}

// ====== Baby Details Drawer ======
function BabyDetailsDrawer({ babyId, onClose }: { babyId: number; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    routines: true,
    growth: true,
    caregivers: true,
    members: true,
    professionals: true,
    invites: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-baby-details', babyId],
    queryFn: () => adminService.getBabyDetails(babyId),
  });

  const baby = data?.data;

  const toggleSection = (s: string) => {
    setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-violet-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Baby className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{baby?.name || '...'}</h2>
              {baby && (
                <p className="text-sm text-gray-500">
                  {formatAge(baby.birthDate)} - Nasc. {formatDateBR(new Date(baby.birthDate))} - ID: {baby.id}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : baby ? (
            <>
              {/* Baby Info Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {baby.gender && (
                  <InfoChip icon={Heart} label="Genero" value={baby.gender === 'MALE' ? 'Masculino' : baby.gender === 'FEMALE' ? 'Feminino' : 'N/I'} />
                )}
                {baby.birthWeightGrams && (
                  <InfoChip icon={Weight} label="Peso nasc." value={`${(baby.birthWeightGrams / 1000).toFixed(2)} kg`} />
                )}
                {baby.birthLengthCm && (
                  <InfoChip icon={Ruler} label="Comp. nasc." value={`${baby.birthLengthCm} cm`} />
                )}
                {baby.city && (
                  <InfoChip icon={MapPin} label="Local" value={`${baby.city}/${baby.state}`} />
                )}
              </div>

              {/* Data Counts */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <CountChip label="Rotinas" value={baby.counts?.routineLogs || 0} icon={Activity} color="olive" />
                <CountChip label="30 dias" value={baby.counts?.routines30d || 0} icon={Clock} color={baby.counts?.routines30d > 0 ? 'emerald' : 'red'} />
                <CountChip label="Crescimento" value={baby.counts?.growthRecords || 0} icon={TrendingUp} color="blue" />
                <CountChip label="Marcos" value={baby.counts?.milestones || 0} icon={Clipboard} color="violet" />
                <CountChip label="Vacinas" value={baby.counts?.vaccineRecords || 0} icon={Syringe} color="emerald" />
                <CountChip label="Consultas" value={baby.counts?.clinicalVisits || 0} icon={FileText} color="amber" />
              </div>

              {/* Last Activity */}
              {baby.lastActivityAt && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Ultima atividade: <span className="font-medium text-gray-900">{formatDateBR(new Date(baby.lastActivityAt))}</span>
                    {baby.lastActivityType && (
                      <span className="text-gray-400 ml-1">
                        ({routineTypeConfig[baby.lastActivityType]?.label || baby.lastActivityType})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* ====== Routine Breakdown ====== */}
              {baby.routineBreakdown && baby.routineBreakdown.length > 0 && (
                <TreeSection
                  title="Rotinas por Tipo"
                  icon={Activity}
                  iconColor="text-olive-600"
                  bgColor="bg-olive-50"
                  count={baby.counts?.routineLogs || 0}
                  expanded={expandedSections.routines}
                  onToggle={() => toggleSection('routines')}
                >
                  <div className="space-y-2">
                    {baby.routineBreakdown.map((rb: any) => {
                      const config = routineTypeConfig[rb.type] || { label: rb.type, icon: Activity, color: 'text-gray-600 bg-gray-50' };
                      const RIcon = config.icon;
                      return (
                        <div key={rb.type} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border-l-4 border-olive-200">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color.split(' ')[1])}>
                              <RIcon className={cn('w-4 h-4', config.color.split(' ')[0])} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{config.label}</p>
                              <p className="text-xs text-gray-400">
                                {rb.firstAt && `Desde ${formatDateBR(new Date(rb.firstAt))}`}
                                {rb.lastAt && ` ate ${formatDateBR(new Date(rb.lastAt))}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{rb.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </TreeSection>
              )}

              {/* ====== Recent Growth ====== */}
              {baby.recentGrowth && baby.recentGrowth.length > 0 && (
                <TreeSection
                  title="Crescimento Recente"
                  icon={TrendingUp}
                  iconColor="text-blue-600"
                  bgColor="bg-blue-50"
                  count={baby.counts?.growthRecords || 0}
                  expanded={expandedSections.growth}
                  onToggle={() => toggleSection('growth')}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="text-left py-2 px-2">Data</th>
                          <th className="text-right py-2 px-2">Peso (kg)</th>
                          <th className="text-right py-2 px-2">Altura (cm)</th>
                          <th className="text-right py-2 px-2">P.C. (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {baby.recentGrowth.map((g: any) => (
                          <tr key={g.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-2 text-gray-700">{formatDateBR(new Date(g.measuredAt))}</td>
                            <td className="py-2 px-2 text-right font-medium text-gray-900">{g.weightKg ?? '-'}</td>
                            <td className="py-2 px-2 text-right font-medium text-gray-900">{g.heightCm ?? '-'}</td>
                            <td className="py-2 px-2 text-right font-medium text-gray-900">{g.headCircumferenceCm ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TreeSection>
              )}

              {/* ====== TREE: Cuidadores (CaregiverBaby) ====== */}
              <TreeSection
                title="Cuidadores (Cadastro)"
                icon={Crown}
                iconColor="text-amber-600"
                bgColor="bg-amber-50"
                count={baby.caregivers?.length || 0}
                expanded={expandedSections.caregivers}
                onToggle={() => toggleSection('caregivers')}
              >
                {baby.caregivers?.length === 0 ? (
                  <EmptyState text="Nenhum cuidador cadastrado" />
                ) : (
                  baby.caregivers?.map((cg: any) => (
                    <PersonRow key={cg.id} className="border-l-4 border-amber-300 pl-3">
                      <PersonAvatar icon={Crown} bg="bg-amber-100" color="text-amber-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{cg.caregiver.fullName}</span>
                          {cg.isPrimary && (
                            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Primario</span>
                          )}
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {relationshipLabels[cg.relationship] || cg.relationship}
                          </span>
                        </div>
                        {cg.user && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {cg.user.email}
                            <span className="text-gray-300 mx-1">|</span>
                            <span>User #{cg.user.id}</span>
                            <span className="text-gray-300 mx-1">|</span>
                            <StatusBadge status={cg.user.status} />
                          </p>
                        )}
                        {cg.caregiver.phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {cg.caregiver.phone}
                          </p>
                        )}
                      </div>
                    </PersonRow>
                  ))
                )}
              </TreeSection>

              {/* ====== TREE: Membros (BabyMember) ====== */}
              <TreeSection
                title="Membros (Permissoes)"
                icon={Shield}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
                count={baby.members?.length || 0}
                expanded={expandedSections.members}
                onToggle={() => toggleSection('members')}
              >
                {baby.members?.length === 0 ? (
                  <EmptyState text="Nenhum membro vinculado" />
                ) : (
                  baby.members?.map((m: any) => (
                    <PersonRow key={m.id} className={cn('border-l-4 pl-3', m.status === 'ACTIVE' ? 'border-blue-300' : m.status === 'REVOKED' ? 'border-red-300 opacity-60' : 'border-gray-300')}>
                      <PersonAvatar
                        icon={m.memberType === 'PARENT' ? Crown : m.memberType === 'PROFESSIONAL' ? Stethoscope : Users}
                        bg={m.memberType === 'PARENT' ? 'bg-amber-100' : m.memberType === 'PROFESSIONAL' ? 'bg-emerald-100' : 'bg-blue-100'}
                        color={m.memberType === 'PARENT' ? 'text-amber-600' : m.memberType === 'PROFESSIONAL' ? 'text-emerald-600' : 'text-blue-600'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{m.user.email}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {memberTypeLabels[m.memberType] || m.memberType}
                          </span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500">{roleLabels[m.role] || m.role}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-400">User #{m.user.id}</span>
                        </div>
                        {m.revokedAt && (
                          <p className="text-xs text-red-400 mt-0.5">Revogado em {formatDateBR(new Date(m.revokedAt))}</p>
                        )}
                      </div>
                    </PersonRow>
                  ))
                )}
              </TreeSection>

              {/* ====== TREE: Profissionais ====== */}
              <TreeSection
                title="Profissionais"
                icon={Stethoscope}
                iconColor="text-emerald-600"
                bgColor="bg-emerald-50"
                count={baby.professionals?.length || 0}
                expanded={expandedSections.professionals}
                onToggle={() => toggleSection('professionals')}
              >
                {baby.professionals?.length === 0 ? (
                  <EmptyState text="Nenhum profissional vinculado" />
                ) : (
                  baby.professionals?.map((bp: any) => (
                    <PersonRow key={bp.id} className="border-l-4 border-emerald-300 pl-3">
                      <PersonAvatar icon={Stethoscope} bg="bg-emerald-100" color="text-emerald-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{bp.professional.fullName}</span>
                          <StatusBadge status={bp.professional.status} />
                          {bp.professional.hasAccount && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Conta ativa</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {roleLabels[bp.role] || bp.role} - {bp.professional.specialty}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{bp.professional.email}</span>
                          {bp.professional.crmNumber && (
                            <span>CRM: {bp.professional.crmNumber}/{bp.professional.crmState}</span>
                          )}
                          {bp.professional.phone && (
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{bp.professional.phone}</span>
                          )}
                        </div>
                      </div>
                    </PersonRow>
                  ))
                )}
              </TreeSection>

              {/* ====== TREE: Convites ====== */}
              <TreeSection
                title="Convites Enviados"
                icon={Send}
                iconColor="text-violet-600"
                bgColor="bg-violet-50"
                count={baby.invites?.length || 0}
                expanded={expandedSections.invites}
                onToggle={() => toggleSection('invites')}
              >
                {baby.invites?.length === 0 ? (
                  <EmptyState text="Nenhum convite enviado" />
                ) : (
                  baby.invites?.map((inv: any) => {
                    const isPending = inv.status === 'PENDING';
                    const isExpired = inv.status === 'EXPIRED' || (isPending && new Date(inv.expiresAt) < new Date());
                    return (
                      <PersonRow key={inv.id} className={cn('border-l-4 pl-3',
                        isPending && !isExpired ? 'border-amber-300' :
                        inv.status === 'ACCEPTED' ? 'border-green-300' :
                        'border-gray-300 opacity-60'
                      )}>
                        <PersonAvatar
                          icon={isPending ? Clock : inv.status === 'ACCEPTED' ? CheckCircle2 : XCircle}
                          bg={isPending ? 'bg-amber-100' : inv.status === 'ACCEPTED' ? 'bg-green-100' : 'bg-gray-100'}
                          color={isPending ? 'text-amber-600' : inv.status === 'ACCEPTED' ? 'text-green-600' : 'text-gray-400'}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">
                              {inv.invitedName || inv.emailInvited}
                            </span>
                            <StatusBadge status={isExpired && isPending ? 'EXPIRED' : inv.status} />
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                              {memberTypeLabels[inv.memberType] || inv.memberType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inv.emailInvited}</span>
                            <span className="text-gray-300">-</span>
                            <span>{roleLabels[inv.role] || inv.role}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                            <span>Enviado: {formatDateBR(new Date(inv.createdAt))}</span>
                            {isPending && !isExpired && (
                              <span className="text-amber-500">Expira: {formatDateBR(new Date(inv.expiresAt))}</span>
                            )}
                            {inv.acceptedAt && (
                              <span className="text-green-500">Aceito: {formatDateBR(new Date(inv.acceptedAt))}</span>
                            )}
                            {inv.createdBy && (
                              <span>Por: {inv.createdBy.email}</span>
                            )}
                          </div>
                        </div>
                      </PersonRow>
                    );
                  })
                )}
              </TreeSection>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Erro ao carregar dados do bebe</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ====== Reusable Components ======

function InfoChip({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
      <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function CountChip({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Activity; color: string }) {
  const colors: Record<string, string> = {
    olive: 'bg-olive-50 border-olive-100 text-olive-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    violet: 'bg-violet-50 border-violet-100 text-violet-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    red: 'bg-red-50 border-red-100 text-red-600',
  };
  return (
    <div className={cn('rounded-lg p-2 text-center border', colors[color] || colors.olive)}>
      <Icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
    </div>
  );
}

function TreeSection({ title, icon: Icon, iconColor, bgColor, count, expanded, onToggle, children }: {
  title: string; icon: typeof Crown; iconColor: string; bgColor: string;
  count: number; expanded: boolean; onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className={cn('w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition', expanded && 'border-b border-gray-200')}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bgColor)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">{count}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && <div className="p-3 space-y-2 bg-gray-50/50">{children}</div>}
    </div>
  );
}

function PersonRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm', className)}>
      {children}
    </div>
  );
}

function PersonAvatar({ icon: Icon, bg, color }: { icon: typeof Crown; bg: string; color: string }) {
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', bg)}>
      <Icon className={cn('w-4 h-4', color)} />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
