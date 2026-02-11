// Olive Baby Web - Professional Patient Chart (Prontuário)
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, FileText, Baby,
  Heart, Syringe, TrendingUp, ClipboardList, Award,
  AlertTriangle, Calendar, Moon, Utensils,
  Droplets, Bath, Star, CheckCircle2, Circle,
  Activity, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner, ConfirmModal } from '../../components/ui';
import { VisitFormModal, PrescriptionFormModal, MedicalCertificateFormModal, ClinicalInfoFormModal } from '../../components/prof';
import { GrowthChart, StatsChart } from '../../components/charts';
import { cn } from '../../lib/utils';
import {
  routineService,
  statsService,
  growthService,
  vaccineService,
  milestoneService,
  clinicalVisitService,
  clinicalInfoService,
  prescriptionService,
  medicalCertificateService,
  professionalService,
} from '../../services/api';
import { format, differenceInMonths, differenceInYears, parseISO, subDays, isToday as isDateToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Helpers ───────────────────────────────────────────────

function formatAge(birthDate: string): string {
  const birth = parseISO(birthDate);
  const now = new Date();
  const years = differenceInYears(now, birth);
  if (years >= 1) {
    const remainingMonths = differenceInMonths(now, birth) % 12;
    return remainingMonths > 0 ? `${years}a ${remainingMonths}m` : `${years} ano${years > 1 ? 's' : ''}`;
  }
  const months = differenceInMonths(now, birth);
  if (months >= 1) return `${months} ${months > 1 ? 'meses' : 'mês'}`;
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}min` : `${hrs}h`;
}

const ROUTINE_TYPE_CONFIG: Record<string, { label: string; icon: typeof Utensils; color: string; bgColor: string }> = {
  FEEDING: { label: 'Alimentação', icon: Utensils, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  SLEEP: { label: 'Sono', icon: Moon, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  DIAPER: { label: 'Fralda', icon: Droplets, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  BATH: { label: 'Banho', icon: Bath, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
  MILK_EXTRACTION: { label: 'Extração', icon: Heart, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
};

// ─── Tabs ──────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Resumo', icon: ClipboardList },
  { key: 'routine', label: 'Rotina', icon: Activity },
  { key: 'growth', label: 'Crescimento', icon: TrendingUp },
  { key: 'milestones', label: 'Marcos', icon: Star },
  { key: 'vaccines', label: 'Vacinas', icon: Syringe },
  { key: 'visits', label: 'Consultas', icon: Calendar },
  { key: 'prescriptions', label: 'Receitas', icon: FileText },
  { key: 'certificates', label: 'Atestados', icon: Award },
];

// ─── Sub Components ────────────────────────────────────────

function MetricCard({ icon: Icon, iconBg, iconColor, value, label, subtitle }: {
  icon: typeof Activity;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  subtitle?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ProgressRing({ percentage, size = 80, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-gray-200 dark:text-gray-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-olive-500 dark:text-olive-400 transition-all duration-700" />
      </svg>
      <span className="absolute text-sm font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

export function ProfPatientChartPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const [baby, setBaby] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [clinicalInfo, setClinicalInfo] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [vaccineSummary, setVaccineSummary] = useState<any>(null);
  const [vaccineTimeline, setVaccineTimeline] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [routineStats, setRoutineStats] = useState<any>(null);
  const [routineHistory, setRoutineHistory] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [milestoneProgress, setMilestoneProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [routineFilter, setRoutineFilter] = useState<string>('ALL');
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [clinicalInfoModalOpen, setClinicalInfoModalOpen] = useState(false);
  const [deleteVisitId, setDeleteVisitId] = useState<number | null>(null);
  const [expandedMilestoneCategory, setExpandedMilestoneCategory] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!babyId) return;
    const id = parseInt(babyId);
    setLoading(true);
    try {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const today = new Date().toISOString();

      const [patientsRes, growthRes, visitsRes, infoRes, prescRes, certRes, vaccineRes, vaccineTimelineRes, routinesRes, statsRes, historyRes, milestonesRes, milestoneProgressRes] = await Promise.all([
        professionalService.getMyPatients(),
        growthService.getAll(id),
        clinicalVisitService.list(id),
        clinicalInfoService.get(id).catch(() => ({ data: null })),
        prescriptionService.list(id).catch(() => ({ data: [] })),
        medicalCertificateService.list(id).catch(() => ({ data: [] })),
        vaccineService.getSummary(id).catch(() => ({ data: null })),
        vaccineService.getTimeline(id).catch(() => ({ data: [] })),
        routineService.list(id, { startDate: sevenDaysAgo, endDate: today, limit: 100 }).catch(() => ({ data: [] })),
        statsService.getStats(id, '24h').catch(() => ({ data: null })),
        statsService.getHistory(id, '7d').catch(() => ({ data: null })),
        milestoneService.getAll(id).catch(() => ({ data: [] })),
        milestoneService.getProgress(id).catch(() => ({ data: null })),
      ]);

      const patient = (patientsRes?.data || []).find((p: any) => p.id === id);
      setBaby(patient || { id, name: `Paciente #${id}` });
      setGrowth(growthRes?.data || []);
      setVisits(visitsRes?.data || []);
      setClinicalInfo(infoRes?.data);
      setPrescriptions(prescRes?.data || []);
      setCertificates(certRes?.data || []);
      setVaccineSummary(vaccineRes?.data);
      setVaccineTimeline(vaccineTimelineRes?.data || []);
      setRoutines(routinesRes?.data || []);
      setRoutineStats(statsRes?.data);
      setRoutineHistory(historyRes?.data);
      setMilestones(milestonesRes?.data || []);
      setMilestoneProgress(milestoneProgressRes?.data);
    } catch {
      setBaby(null);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Computed data ───
  const todayRoutines = useMemo(() => {
    return routines.filter((r: any) => {
      try { return isDateToday(parseISO(r.startTime)); } catch { return false; }
    });
  }, [routines]);

  const routineCounts = useMemo(() => {
    const counts: Record<string, number> = { FEEDING: 0, SLEEP: 0, DIAPER: 0, BATH: 0, MILK_EXTRACTION: 0 };
    todayRoutines.forEach((r: any) => { if (counts[r.routineType] !== undefined) counts[r.routineType]++; });
    return counts;
  }, [todayRoutines]);

  const totalSleepHoursToday = useMemo(() => {
    const sleepRoutines = todayRoutines.filter((r: any) => r.routineType === 'SLEEP' && r.durationSeconds);
    const totalSeconds = sleepRoutines.reduce((acc: number, r: any) => acc + (r.durationSeconds || 0), 0);
    return (totalSeconds / 3600).toFixed(1);
  }, [todayRoutines]);

  const filteredRoutines = useMemo(() => {
    if (routineFilter === 'ALL') return routines;
    return routines.filter((r: any) => r.routineType === routineFilter);
  }, [routines, routineFilter]);

  const milestonesByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    milestones.forEach((m: any) => {
      const cat = m.milestoneLabel?.split(' - ')[0] || m.category || 'Outros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(m);
    });
    return groups;
  }, [milestones]);

  const achievedMilestones = useMemo(() => {
    return milestones.filter((m: any) => m.occurredOn || m.achievedAt);
  }, [milestones]);

  const vaccinePercentage = vaccineSummary ? Math.round((vaccineSummary.applied / Math.max(vaccineSummary.total, 1)) * 100) : 0;
  const milestonePercentage = milestoneProgress
    ? Math.round((milestoneProgress.completed / Math.max(milestoneProgress.total, 1)) * 100)
    : milestones.length > 0
      ? Math.round((achievedMilestones.length / milestones.length) * 100)
      : 0;

  // Routine chart data (last 7 days)
  const routineChartData = useMemo(() => {
    const days: Record<string, Record<string, number>> = {};
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'dd/MM');
      days[key] = { FEEDING: 0, SLEEP: 0, DIAPER: 0 };
    }
    routines.forEach((r: any) => {
      try {
        const key = format(parseISO(r.startTime), 'dd/MM');
        if (days[key] && days[key][r.routineType] !== undefined) {
          days[key][r.routineType]++;
        }
      } catch { /* ignore */ }
    });
    return {
      labels: Object.keys(days),
      feeding: Object.values(days).map(d => d.FEEDING),
      sleep: Object.values(days).map(d => d.SLEEP),
      diaper: Object.values(days).map(d => d.DIAPER),
    };
  }, [routines]);

  // ─── Render ───

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Carregando prontuário...</p>
      </div>
    );
  }

  if (!baby) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Paciente não encontrado</p>
        <Link to="/prof/patients" className="text-olive-600 hover:underline mt-2 inline-block">Voltar aos pacientes</Link>
      </div>
    );
  }

  const latestGrowth = growth[0];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/prof/patients" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar aos pacientes
      </Link>

      {/* Patient Header Card */}
      <Card className="bg-gradient-to-r from-olive-50 to-green-50 dark:from-olive-900/20 dark:to-green-900/10 border-olive-200 dark:border-olive-800">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5">
          <div className="w-16 h-16 rounded-2xl bg-olive-100 dark:bg-olive-900/40 flex items-center justify-center flex-shrink-0">
            <Baby className="w-8 h-8 text-olive-600 dark:text-olive-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{baby.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
              {baby.birthDate && (
                <>
                  <span>{formatAge(baby.birthDate)}</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>Nasc. {format(parseISO(baby.birthDate), 'dd/MM/yyyy')}</span>
                </>
              )}
              {baby.gender && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>{baby.gender === 'MALE' ? 'Masculino' : baby.gender === 'FEMALE' ? 'Feminino' : baby.gender}</span>
                </>
              )}
            </div>
            {baby.primaryCaregiver?.fullName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Responsável: {baby.primaryCaregiver.fullName}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setClinicalInfoModalOpen(true)}>
              Info Clínica
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max px-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-olive-600 text-olive-600 dark:border-olive-400 dark:text-olive-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: RESUMO (Overview)
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Utensils} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" value={routineCounts.FEEDING} label="Alimentações hoje" />
            <MetricCard icon={Moon} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" value={`${totalSleepHoursToday}h`} label="Sono hoje" />
            <MetricCard icon={Droplets} iconBg="bg-orange-100 dark:bg-orange-900/30" iconColor="text-orange-600 dark:text-orange-400" value={routineCounts.DIAPER} label="Fraldas hoje" />
            <MetricCard icon={Calendar} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400" value={visits.length} label="Consultas" subtitle={visits[0] ? `Última: ${format(new Date(visits[0].visitDate), 'dd/MM')}` : undefined} />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Última medição */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Última medição" />
              <CardBody>
                {latestGrowth ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Peso</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {latestGrowth.weightGrams ? `${(latestGrowth.weightGrams / 1000).toFixed(2)} kg` : latestGrowth.weightKg ? `${Number(latestGrowth.weightKg).toFixed(2)} kg` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Altura</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {latestGrowth.lengthCm || latestGrowth.heightCm ? `${latestGrowth.lengthCm || latestGrowth.heightCm} cm` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">PC</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {latestGrowth.headCircumferenceCm ? `${latestGrowth.headCircumferenceCm} cm` : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                      {format(new Date(latestGrowth.measurementDate || latestGrowth.measuredAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Sem medições registradas</p>
                )}
              </CardBody>
            </Card>

            {/* Vacinação */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Vacinação" />
              <CardBody>
                {vaccineSummary ? (
                  <div className="flex items-center gap-4">
                    <ProgressRing percentage={vaccinePercentage} />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{vaccineSummary.applied}/{vaccineSummary.total}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">vacinas aplicadas</p>
                      {vaccineSummary.overdue > 0 && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {vaccineSummary.overdue} atrasada{vaccineSummary.overdue > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Dados indisponíveis</p>
                )}
              </CardBody>
            </Card>

            {/* Marcos de Desenvolvimento */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Marcos de Desenvolvimento" />
              <CardBody>
                <div className="flex items-center gap-4">
                  <ProgressRing percentage={milestonePercentage} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {milestoneProgress ? `${milestoneProgress.completed}/${milestoneProgress.total}` : `${achievedMilestones.length}/${milestones.length}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">marcos alcançados</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Alergias */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Alergias / Condições" action={<Button size="sm" variant="ghost" onClick={() => setClinicalInfoModalOpen(true)}><Pencil className="w-4 h-4" /></Button>} />
              <CardBody>
                {clinicalInfo?.allergies?.length ? (
                  <div className="space-y-2">
                    {(clinicalInfo.allergies as any[]).map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{typeof a === 'string' ? a : a.substance || a.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Nenhuma alergia informada</p>
                )}
              </CardBody>
            </Card>

            {/* Receitas */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Receitas" />
              <CardBody className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{prescriptions.length}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Receitas emitidas</p>
                  {prescriptions[0] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Última: {format(new Date(prescriptions[0].prescriptionDate), 'dd/MM/yyyy')}</p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Atestados */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader title="Atestados" />
              <CardBody className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{certificates.length}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Atestados emitidos</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Routine Chart - 7 days */}
          {routines.length > 0 && (
            <Card>
              <CardHeader title="Atividade dos últimos 7 dias" subtitle="Alimentação, sono e fraldas" />
              <CardBody>
                <div className="h-64">
                  <StatsChart
                    type="bar"
                    labels={routineChartData.labels}
                    datasets={[
                      { label: 'Alimentação', data: routineChartData.feeding, borderColor: 'rgb(234, 179, 8)', backgroundColor: 'rgba(234, 179, 8, 0.7)' },
                      { label: 'Sono', data: routineChartData.sleep, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.7)' },
                      { label: 'Fraldas', data: routineChartData.diaper, borderColor: 'rgb(249, 115, 22)', backgroundColor: 'rgba(249, 115, 22, 0.7)' },
                    ]}
                  />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: ROTINA
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          {/* Today's summary counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(ROUTINE_TYPE_CONFIG).map(([type, config]) => {
              const count = routineCounts[type] || 0;
              const Icon = config.icon;
              return (
                <Card key={type} className={cn('hover:shadow-md transition-shadow cursor-pointer', routineFilter === type && 'ring-2 ring-olive-500')} onClick={() => setRoutineFilter(routineFilter === type ? 'ALL' : type)}>
                  <CardBody className="p-3 text-center">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', config.bgColor)}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{type === 'SLEEP' ? `${totalSleepHoursToday}h` : count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* 7-day chart */}
          <Card>
            <CardHeader title="Frequência - Últimos 7 dias" />
            <CardBody>
              <div className="h-64">
                <StatsChart
                  type="bar"
                  labels={routineChartData.labels}
                  datasets={[
                    { label: 'Alimentação', data: routineChartData.feeding, borderColor: 'rgb(234, 179, 8)', backgroundColor: 'rgba(234, 179, 8, 0.7)' },
                    { label: 'Sono', data: routineChartData.sleep, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.7)' },
                    { label: 'Fraldas', data: routineChartData.diaper, borderColor: 'rgb(249, 115, 22)', backgroundColor: 'rgba(249, 115, 22, 0.7)' },
                  ]}
                />
              </div>
            </CardBody>
          </Card>

          {/* Recent routine entries */}
          <Card>
            <CardHeader
              title="Registros Recentes"
              subtitle={`${filteredRoutines.length} registro${filteredRoutines.length !== 1 ? 's' : ''} nos últimos 7 dias`}
              action={
                routineFilter !== 'ALL' && (
                  <Button variant="ghost" size="sm" onClick={() => setRoutineFilter('ALL')}>Limpar filtro</Button>
                )
              }
            />
            <CardBody className="p-0">
              {filteredRoutines.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum registro de rotina encontrado</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Os registros feitos pela família aparecerão aqui</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                  {filteredRoutines.slice(0, 50).map((r: any) => {
                    const config = ROUTINE_TYPE_CONFIG[r.routineType] || ROUTINE_TYPE_CONFIG.FEEDING;
                    const Icon = config.icon;
                    return (
                      <li key={r.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
                          <Icon className={cn('w-5 h-5', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{config.label}</p>
                            {r.durationSeconds && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">• {formatDuration(r.durationSeconds)}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(parseISO(r.startTime), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            {r.endTime && ` - ${format(parseISO(r.endTime), 'HH:mm')}`}
                          </p>
                          {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{r.notes}</p>}
                        </div>
                        {r.meta && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                            {r.meta.feedingType && <span className="block">{r.meta.feedingType === 'BREAST' ? 'Peito' : r.meta.feedingType === 'BOTTLE' ? 'Mamadeira' : r.meta.feedingType}</span>}
                            {r.meta.volumeMl && <span className="block">{r.meta.volumeMl}ml</span>}
                            {r.meta.side && <span className="block">{r.meta.side === 'LEFT' ? 'Esquerdo' : r.meta.side === 'RIGHT' ? 'Direito' : 'Ambos'}</span>}
                            {r.meta.diaperType && <span className="block">{r.meta.diaperType === 'PEE' ? 'Xixi' : r.meta.diaperType === 'POOP' ? 'Cocô' : 'Ambos'}</span>}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: CRESCIMENTO
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {/* Latest measurements summary */}
          {latestGrowth && (
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                icon={TrendingUp}
                iconBg="bg-olive-100 dark:bg-olive-900/30"
                iconColor="text-olive-600 dark:text-olive-400"
                value={latestGrowth.weightGrams ? `${(latestGrowth.weightGrams / 1000).toFixed(1)}` : latestGrowth.weightKg ? `${Number(latestGrowth.weightKg).toFixed(1)}` : '-'}
                label="Peso (kg)"
                subtitle={format(new Date(latestGrowth.measurementDate || latestGrowth.measuredAt), 'dd/MM/yyyy')}
              />
              <MetricCard
                icon={TrendingUp}
                iconBg="bg-purple-100 dark:bg-purple-900/30"
                iconColor="text-purple-600 dark:text-purple-400"
                value={latestGrowth.lengthCm || latestGrowth.heightCm || '-'}
                label="Altura (cm)"
              />
              <MetricCard
                icon={TrendingUp}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                value={latestGrowth.headCircumferenceCm || '-'}
                label="PC (cm)"
              />
            </div>
          )}

          <Card>
            <CardHeader title="Curva de Crescimento" subtitle={`${growth.length} medição(ões)`} />
            <CardBody>
              {growth.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma medição registrada</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 h-72">
                    <GrowthChart
                      data={growth.slice().reverse().map((g) => ({
                        date: format(new Date(g.measurementDate || g.measuredAt), 'dd/MM'),
                        weight: g.weightGrams ? Number(g.weightGrams) / 1000 : g.weightKg ? Number(g.weightKg) : undefined,
                        length: g.lengthCm ? Number(g.lengthCm) : g.heightCm ? Number(g.heightCm) : undefined,
                      }))}
                    />
                  </div>

                  {/* Head circumference chart */}
                  {growth.some(g => g.headCircumferenceCm) && (
                    <div className="mb-6 h-48">
                      <StatsChart
                        type="line"
                        labels={growth.slice().reverse().map(g => format(new Date(g.measurementDate || g.measuredAt), 'dd/MM'))}
                        datasets={[{
                          label: 'Perímetro Cefálico (cm)',
                          data: growth.slice().reverse().map(g => Number(g.headCircumferenceCm) || 0),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        }]}
                      />
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Data</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Peso</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Altura</th>
                          <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">PC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growth.map((g) => (
                          <tr key={g.id} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-2 px-3 text-gray-900 dark:text-white">{format(new Date(g.measurementDate || g.measuredAt), 'dd/MM/yyyy')}</td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                              {g.weightGrams ? `${(Number(g.weightGrams) / 1000).toFixed(2)} kg` : g.weightKg ? `${Number(g.weightKg).toFixed(2)} kg` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                              {(g.lengthCm || g.heightCm) ? `${g.lengthCm || g.heightCm} cm` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                              {g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: MARCOS DE DESENVOLVIMENTO
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          {/* Progress header */}
          <Card className="bg-gradient-to-r from-olive-50 to-emerald-50 dark:from-olive-900/20 dark:to-emerald-900/10 border-olive-200 dark:border-olive-800">
            <CardBody className="flex items-center gap-6 py-5">
              <ProgressRing percentage={milestonePercentage} size={100} strokeWidth={10} />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Progresso do Desenvolvimento</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {milestoneProgress
                    ? `${milestoneProgress.completed} de ${milestoneProgress.total} marcos alcançados`
                    : `${achievedMilestones.length} de ${milestones.length} marcos alcançados`
                  }
                </p>
                {achievedMilestones.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Último: {format(new Date(achievedMilestones[0].occurredOn || achievedMilestones[0].achievedAt), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {milestones.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center py-12">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum marco de desenvolvimento registrado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Os marcos registrados pela família aparecerão aqui</p>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Milestones by category */}
              {Object.entries(milestonesByCategory).map(([category, items]) => {
                const achieved = items.filter((m: any) => m.occurredOn || m.achievedAt).length;
                const total = items.length;
                const pct = Math.round((achieved / total) * 100);
                const isExpanded = expandedMilestoneCategory === category;
                return (
                  <Card key={category}>
                    <button
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => setExpandedMilestoneCategory(isExpanded ? null : category)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-olive-100 dark:bg-olive-900/30 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-olive-600 dark:text-olive-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white">{category}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{achieved}/{total} alcançados</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-olive-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-10 text-right">{pct}%</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
                          {items.map((m: any) => {
                            const isAchieved = !!(m.occurredOn || m.achievedAt);
                            return (
                              <li key={m.id} className="flex items-center gap-3 px-6 py-3">
                                {isAchieved ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={cn('text-sm', isAchieved ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400')}>
                                    {m.milestoneLabel || m.title || m.milestoneKey}
                                  </p>
                                  {m.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{m.notes}</p>}
                                </div>
                                {isAchieved && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                    {format(new Date(m.occurredOn || m.achievedAt), 'dd/MM/yyyy')}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: VACINAS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'vaccines' && (
        <div className="space-y-6">
          {vaccineSummary ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard icon={Syringe} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" value={vaccineSummary.applied || 0} label="Aplicadas" />
                <MetricCard icon={Clock} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" value={vaccineSummary.pending || 0} label="Pendentes" />
                <MetricCard icon={AlertTriangle} iconBg="bg-red-100 dark:bg-red-900/30" iconColor="text-red-600 dark:text-red-400" value={vaccineSummary.overdue || 0} label="Atrasadas" />
                <MetricCard icon={Activity} iconBg="bg-gray-100 dark:bg-gray-700" iconColor="text-gray-600 dark:text-gray-400" value={vaccineSummary.skipped || 0} label="Puladas" />
              </div>

              {/* Progress bar */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso vacinal</span>
                    <span className="text-sm font-bold text-olive-600 dark:text-olive-400">{vaccinePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-olive-500 h-3 rounded-full transition-all" style={{ width: `${vaccinePercentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{vaccineSummary.applied} de {vaccineSummary.total} vacinas do calendário</p>
                </CardBody>
              </Card>

              {/* Vaccine timeline */}
              {vaccineTimeline.length > 0 && (
                <Card>
                  <CardHeader title="Calendário Vacinal" subtitle="Histórico e próximas doses" />
                  <CardBody className="p-0">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                      {vaccineTimeline.map((v: any) => {
                        const isApplied = v.status === 'APPLIED';
                        const isSkipped = v.status === 'SKIPPED';
                        const isOverdue = v.status === 'PENDING' && v.recommendedAt && new Date(v.recommendedAt) < new Date();
                        return (
                          <li key={v.id} className="flex items-center gap-4 px-6 py-3">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              isApplied ? 'bg-green-100 dark:bg-green-900/30' :
                              isSkipped ? 'bg-gray-100 dark:bg-gray-700' :
                              isOverdue ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-blue-100 dark:bg-blue-900/30'
                            )}>
                              {isApplied ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                               isOverdue ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                               <Syringe className={cn('w-4 h-4', isSkipped ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400')} />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium', isSkipped ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white')}>
                                {v.vaccineName} - {v.doseLabel}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isApplied && v.appliedAt ? `Aplicada em ${format(new Date(v.appliedAt), 'dd/MM/yyyy')}` :
                                 isSkipped ? 'Pulada' :
                                 isOverdue ? `Atrasada - prevista para ${format(new Date(v.recommendedAt), 'dd/MM/yyyy')}` :
                                 v.recommendedAt ? `Prevista para ${format(new Date(v.recommendedAt), 'dd/MM/yyyy')}` : 'Pendente'
                                }
                              </p>
                            </div>
                            <span className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                              isApplied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              isSkipped ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' :
                              isOverdue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            )}>
                              {isApplied ? 'Aplicada' : isSkipped ? 'Pulada' : isOverdue ? 'Atrasada' : 'Pendente'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardBody className="flex flex-col items-center py-12">
                <Syringe className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Dados de vacinação indisponíveis</p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: CONSULTAS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'visits' && (
        <Card>
          <CardHeader
            title="Histórico de Consultas"
            subtitle={`${visits.length} consulta${visits.length !== 1 ? 's' : ''}`}
            action={
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingVisit(null); setVisitModalOpen(true); }}>
                Nova consulta
              </Button>
            }
          />
          <CardBody className="p-0">
            {visits.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma consulta registrada</p>
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingVisit(null); setVisitModalOpen(true); }}>
                  Registrar primeira consulta
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {visits.map((v) => (
                  <li key={v.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{format(new Date(v.visitDate), 'dd')}</span>
                      <span className="text-[10px] text-blue-500 dark:text-blue-400 uppercase">{format(new Date(v.visitDate), 'MMM', { locale: ptBR })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{String(v.visitType).replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{v.chiefComplaint || 'Sem queixa principal'}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingVisit(v); setVisitModalOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteVisitId(v.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: RECEITAS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader
            title="Receitas Médicas"
            subtitle={`${prescriptions.length} receita${prescriptions.length !== 1 ? 's' : ''}`}
            action={<Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPrescriptionModalOpen(true)}>Nova receita</Button>}
          />
          <CardBody className="p-0">
            {prescriptions.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma receita emitida</p>
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPrescriptionModalOpen(true)}>Emitir receita</Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {prescriptions.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Receita - {format(new Date(p.prescriptionDate), 'dd/MM/yyyy')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{(p.items as any[])?.length || 0} medicamento(s)</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: ATESTADOS
         ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'certificates' && (
        <Card>
          <CardHeader
            title="Atestados e Declarações"
            subtitle={`${certificates.length} documento${certificates.length !== 1 ? 's' : ''}`}
            action={<Button size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setCertificateModalOpen(true)}>Novo atestado</Button>}
          />
          <CardBody className="p-0">
            {certificates.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum atestado emitido</p>
                <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setCertificateModalOpen(true)}>Emitir atestado</Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {certificates.map((c) => (
                  <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{String(c.type).replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Válido de {format(new Date(c.validFrom), 'dd/MM/yyyy')}{c.validUntil ? ` até ${format(new Date(c.validUntil), 'dd/MM/yyyy')}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODALS
         ═══════════════════════════════════════════════════════════ */}
      {babyId && (
        <>
          <VisitFormModal isOpen={visitModalOpen} onClose={() => { setVisitModalOpen(false); setEditingVisit(null); }} babyId={parseInt(babyId)} visit={editingVisit} onSuccess={loadData} />
          <PrescriptionFormModal isOpen={prescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} babyId={parseInt(babyId)} onSuccess={loadData} />
          <MedicalCertificateFormModal isOpen={certificateModalOpen} onClose={() => setCertificateModalOpen(false)} babyId={parseInt(babyId)} babyName={baby?.name} onSuccess={loadData} />
          <ClinicalInfoFormModal isOpen={clinicalInfoModalOpen} onClose={() => setClinicalInfoModalOpen(false)} babyId={parseInt(babyId)} initialData={clinicalInfo} onSuccess={loadData} />
          <ConfirmModal
            isOpen={!!deleteVisitId}
            onClose={() => setDeleteVisitId(null)}
            onConfirm={async () => {
              if (deleteVisitId && babyId) {
                await clinicalVisitService.delete(parseInt(babyId), deleteVisitId);
                setDeleteVisitId(null);
                loadData();
              }
            }}
            title="Excluir consulta"
            message="Deseja realmente excluir esta consulta? Esta ação não pode ser desfeita."
          />
        </>
      )}
    </div>
  );
}
