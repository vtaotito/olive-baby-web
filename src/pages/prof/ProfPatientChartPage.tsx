// Olive Baby Web - Professional Patient Chart (Prontuário)
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, FileText, Baby,
  Heart, Syringe, TrendingUp, ClipboardList, Award,
  AlertTriangle, Calendar,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner, ConfirmModal } from '../../components/ui';
import { VisitFormModal, PrescriptionFormModal, MedicalCertificateFormModal, ClinicalInfoFormModal } from '../../components/prof';
import { GrowthChart } from '../../components/charts';
import { cn } from '../../lib/utils';
import {
  growthService,
  vaccineService,
  clinicalVisitService,
  clinicalInfoService,
  prescriptionService,
  medicalCertificateService,
  professionalService,
} from '../../services/api';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const TABS = [
  { key: 'overview', label: 'Resumo', icon: ClipboardList },
  { key: 'visits', label: 'Consultas', icon: Calendar },
  { key: 'growth', label: 'Crescimento', icon: TrendingUp },
  { key: 'vaccines', label: 'Vacinas', icon: Syringe },
  { key: 'prescriptions', label: 'Receitas', icon: FileText },
  { key: 'certificates', label: 'Atestados', icon: Award },
];

export function ProfPatientChartPage() {
  const { babyId } = useParams<{ babyId: string }>();
  const [baby, setBaby] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [clinicalInfo, setClinicalInfo] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [vaccineSummary, setVaccineSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [clinicalInfoModalOpen, setClinicalInfoModalOpen] = useState(false);
  const [deleteVisitId, setDeleteVisitId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!babyId) return;
    const id = parseInt(babyId);
    setLoading(true);
    try {
      const [patientsRes, growthRes, visitsRes, infoRes, prescRes, certRes, vaccineRes] = await Promise.all([
        professionalService.getMyPatients(),
        growthService.getAll(id),
        clinicalVisitService.list(id),
        clinicalInfoService.get(id).catch(() => ({ data: null })),
        prescriptionService.list(id).catch(() => ({ data: [] })),
        medicalCertificateService.list(id).catch(() => ({ data: [] })),
        vaccineService.getSummary(id).catch(() => ({ data: null })),
      ]);
      const patient = (patientsRes?.data || []).find((p: any) => p.id === id);
      setBaby(patient || { id, name: `Paciente #${id}` });
      setGrowth(growthRes?.data || []);
      setVisits(visitsRes?.data || []);
      setClinicalInfo(infoRes?.data);
      setPrescriptions(prescRes?.data || []);
      setCertificates(certRes?.data || []);
      setVaccineSummary(vaccineRes?.data);
    } catch {
      setBaby(null);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <Link to="/prof/patients" className="text-olive-600 hover:underline mt-2 inline-block">
          Voltar aos pacientes
        </Link>
      </div>
    );
  }

  const latestGrowth = growth[0];
  const vaccinePercentage = vaccineSummary ? Math.round((vaccineSummary.applied / vaccineSummary.total) * 100) : 0;

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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Responsável: {baby.primaryCaregiver.fullName}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Pencil className="w-4 h-4" />}
              onClick={() => setClinicalInfoModalOpen(true)}
            >
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
                      {latestGrowth.weightGrams ? `${(latestGrowth.weightGrams / 1000).toFixed(2)} kg` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Altura</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {latestGrowth.lengthCm ? `${latestGrowth.lengthCm} cm` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">PC</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {latestGrowth.headCircumferenceCm ? `${latestGrowth.headCircumferenceCm} cm` : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {format(new Date(latestGrowth.measurementDate), 'dd/MM/yyyy', { locale: ptBR })}
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{vaccinePercentage}%</span>
                    <Syringe className="w-8 h-8 text-olive-400" />
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-olive-500 h-2 rounded-full transition-all"
                      style={{ width: `${vaccinePercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {vaccineSummary.applied} de {vaccineSummary.total} vacinas aplicadas
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Dados indisponíveis</p>
              )}
            </CardBody>
          </Card>

          {/* Alergias */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader
              title="Alergias / Condições"
              action={
                <Button size="sm" variant="ghost" onClick={() => setClinicalInfoModalOpen(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              }
            />
            <CardBody>
              {clinicalInfo?.allergies?.length ? (
                <div className="space-y-2">
                  {(clinicalInfo.allergies as any[]).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{a.substance}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                  Nenhuma alergia informada
                </p>
              )}
            </CardBody>
          </Card>

          {/* Resumo rápido */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader title="Consultas" />
            <CardBody className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{visits.length}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Consultas registradas</p>
                {visits[0] && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última: {format(new Date(visits[0].visitDate), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader title="Receitas" />
            <CardBody className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{prescriptions.length}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Receitas emitidas</p>
                {prescriptions[0] && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última: {format(new Date(prescriptions[0].prescriptionDate), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

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
      )}

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
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {format(new Date(v.visitDate), 'dd')}
                      </span>
                      <span className="text-[10px] text-blue-500 dark:text-blue-400 uppercase">
                        {format(new Date(v.visitDate), 'MMM', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {String(v.visitType).replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {v.chiefComplaint || 'Sem queixa principal'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingVisit(v); setVisitModalOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteVisitId(v.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'growth' && (
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
                <div className="mb-6 h-64">
                  <GrowthChart
                    data={growth.slice().reverse().map((g) => ({
                      date: format(new Date(g.measurementDate), 'dd/MM'),
                      weight: g.weightGrams ? Number(g.weightGrams) / 1000 : undefined,
                      length: g.lengthCm ? Number(g.lengthCm) : undefined,
                    }))}
                  />
                </div>
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
                      {growth.slice(0, 10).map((g) => (
                        <tr key={g.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-2 px-3 text-gray-900 dark:text-white">{format(new Date(g.measurementDate), 'dd/MM/yyyy')}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{g.weightGrams ? `${(Number(g.weightGrams) / 1000).toFixed(2)} kg` : '-'}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{g.lengthCm ? `${g.lengthCm} cm` : '-'}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader
            title="Receitas Médicas"
            subtitle={`${prescriptions.length} receita${prescriptions.length !== 1 ? 's' : ''}`}
            action={
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPrescriptionModalOpen(true)}>
                Nova receita
              </Button>
            }
          />
          <CardBody className="p-0">
            {prescriptions.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma receita emitida</p>
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPrescriptionModalOpen(true)}>
                  Emitir receita
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {prescriptions.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Receita - {format(new Date(p.prescriptionDate), 'dd/MM/yyyy')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(p.items as any[])?.length || 0} medicamento(s)
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'certificates' && (
        <Card>
          <CardHeader
            title="Atestados e Declarações"
            subtitle={`${certificates.length} documento${certificates.length !== 1 ? 's' : ''}`}
            action={
              <Button size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setCertificateModalOpen(true)}>
                Novo atestado
              </Button>
            }
          />
          <CardBody className="p-0">
            {certificates.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum atestado emitido</p>
                <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setCertificateModalOpen(true)}>
                  Emitir atestado
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {certificates.map((c) => (
                  <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {String(c.type).replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Válido de {format(new Date(c.validFrom), 'dd/MM/yyyy')}
                        {c.validUntil ? ` até ${format(new Date(c.validUntil), 'dd/MM/yyyy')}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'vaccines' && (
        <Card>
          <CardHeader title="Calendário Vacinal" />
          <CardBody>
            {vaccineSummary ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-olive-50 dark:bg-olive-900/20 rounded-2xl flex items-center justify-center">
                    <Syringe className="w-8 h-8 text-olive-600 dark:text-olive-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{vaccineSummary.applied}/{vaccineSummary.total}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">vacinas aplicadas</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-olive-500 h-3 rounded-full transition-all"
                    style={{ width: `${vaccinePercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12">
                <Syringe className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Dados de vacinação indisponíveis</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modals */}
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
