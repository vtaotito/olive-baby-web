// Olive Baby Web - Professional Patient Chart (Prontuário)
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, FileText } from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      setBaby({ id, name: patient?.name });
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

  if (loading || !baby) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const latestGrowth = growth[0];

  return (
    <>
      <div className="mb-6">
        <Link to="/prof/patients" className="inline-flex items-center gap-2 text-olive-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar aos pacientes
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Prontuário {baby?.name ? `- ${baby.name}` : ''}</h1>
        <p className="text-gray-500">Paciente #{babyId}</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'visits', 'growth', 'vaccines', 'prescriptions', 'certificates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab
                ? 'border-olive-600 text-olive-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'overview' && 'Resumo'}
            {tab === 'visits' && 'Consultas'}
            {tab === 'growth' && 'Crescimento'}
            {tab === 'vaccines' && 'Vacinas'}
            {tab === 'prescriptions' && 'Receitas'}
            {tab === 'certificates' && 'Atestados'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="Última medição" />
            <CardBody>
              {latestGrowth ? (
                <div>
                  <p>Peso: {latestGrowth.weightGrams ? `${(latestGrowth.weightGrams / 1000).toFixed(2)} kg` : '-'}</p>
                  <p>Altura: {latestGrowth.lengthCm ? `${latestGrowth.lengthCm} cm` : '-'}</p>
                  <p>PC: {latestGrowth.headCircumferenceCm ? `${latestGrowth.headCircumferenceCm} cm` : '-'}</p>
                  <p className="text-sm text-gray-500 mt-2">{format(new Date(latestGrowth.measurementDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              ) : (
                <p className="text-gray-500">Sem medições</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Vacinação" />
            <CardBody>
              {vaccineSummary ? (
                <p>{vaccineSummary.applied}/{vaccineSummary.total} vacinas aplicadas</p>
              ) : (
                <p className="text-gray-500">Dados não disponíveis</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader
              title="Alergias / Condições"
              action={
                <Button size="sm" variant="outline" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setClinicalInfoModalOpen(true)}>
                  Editar
                </Button>
              }
            />
            <CardBody>
              {clinicalInfo?.allergies?.length ? (
                <p>{(clinicalInfo.allergies as any[]).map((a: any) => a.substance).join(', ')}</p>
              ) : (
                <p className="text-gray-500">Nenhuma informada</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'visits' && (
        <Card>
          <CardHeader
            title="Consultas"
            action={
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingVisit(null); setVisitModalOpen(true); }}>
                Nova consulta
              </Button>
            }
          />
          <CardBody>
            {visits.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Nenhuma consulta registrada</p>
            ) : (
              <ul className="space-y-4">
                {visits.map((v) => (
                  <li key={v.id} className="border-b pb-4 last:border-0 flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium">{format(new Date(v.visitDate), 'dd/MM/yyyy', { locale: ptBR })} - {String(v.visitType).replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-500">{v.chiefComplaint || 'Sem queixa'}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => { setEditingVisit(v); setVisitModalOpen(true); }} />
                      <Button size="sm" variant="ghost" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteVisitId(v.id)} />
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
          <CardHeader title="Crescimento" />
          <CardBody>
            {growth.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Nenhuma medição</p>
            ) : (
              <>
                <div className="mb-6 h-64">
                  <GrowthChart
                    data={growth
                      .slice()
                      .reverse()
                      .map((g) => ({
                        date: format(new Date(g.measurementDate), 'dd/MM'),
                        weight: g.weightGrams ? Number(g.weightGrams) / 1000 : undefined,
                        length: g.lengthCm ? Number(g.lengthCm) : undefined,
                      }))}
                  />
                </div>
                <ul className="space-y-2">
                  {growth.slice(0, 10).map((g) => (
                    <li key={g.id} className="flex justify-between">
                      <span>{format(new Date(g.measurementDate), 'dd/MM/yyyy')}</span>
                      <span>
                        {g.weightGrams ? `${(Number(g.weightGrams) / 1000).toFixed(2)} kg` : '-'} |
                        {g.lengthCm ? `${g.lengthCm} cm` : '-'} |
                        {g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '-'}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader
            title="Receitas"
            action={
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setPrescriptionModalOpen(true)}>
                Nova receita
              </Button>
            }
          />
          <CardBody>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Nenhuma receita</p>
            ) : (
              <ul className="space-y-4">
                {prescriptions.map((p) => (
                  <li key={p.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">{format(new Date(p.prescriptionDate), 'dd/MM/yyyy')}</p>
                    <p className="text-sm text-gray-500">{(p.items as any[])?.length || 0} medicamentos</p>
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
            action={
              <Button size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => setCertificateModalOpen(true)}>
                Novo atestado
              </Button>
            }
          />
          <CardBody>
            {certificates.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">Nenhum atestado ou declaração</p>
            ) : (
              <ul className="space-y-4">
                {certificates.map((c) => (
                  <li key={c.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">{String(c.type).replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500">
                      Válido de {format(new Date(c.validFrom), 'dd/MM/yyyy')}
                      {c.validUntil ? ` até ${format(new Date(c.validUntil), 'dd/MM/yyyy')}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {activeTab === 'vaccines' && (
        <Card>
          <CardHeader title="Vacinas" />
          <CardBody>
            {vaccineSummary ? (
              <p>{vaccineSummary.applied}/{vaccineSummary.total} vacinas aplicadas</p>
            ) : (
              <p className="text-gray-500">Dados de vacinação do paciente</p>
            )}
          </CardBody>
        </Card>
      )}

      {babyId && (
        <>
          <VisitFormModal
            isOpen={visitModalOpen}
            onClose={() => { setVisitModalOpen(false); setEditingVisit(null); }}
            babyId={parseInt(babyId)}
            visit={editingVisit}
            onSuccess={loadData}
          />
          <PrescriptionFormModal
            isOpen={prescriptionModalOpen}
            onClose={() => setPrescriptionModalOpen(false)}
            babyId={parseInt(babyId)}
            onSuccess={loadData}
          />
          <MedicalCertificateFormModal
            isOpen={certificateModalOpen}
            onClose={() => setCertificateModalOpen(false)}
            babyId={parseInt(babyId)}
            babyName={baby?.name}
            onSuccess={loadData}
          />
          <ClinicalInfoFormModal
            isOpen={clinicalInfoModalOpen}
            onClose={() => setClinicalInfoModalOpen(false)}
            babyId={parseInt(babyId)}
            initialData={clinicalInfo}
            onSuccess={loadData}
          />
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
            message="Deseja realmente excluir esta consulta?"
          />
        </>
      )}
    </>
  );
}
