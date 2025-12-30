// Olive Baby Web - Admin Data Quality Page
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Info,
  Utensils,
  Moon,
  Droplet,
  Bath,
  Milk,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { KpiCard } from '../../components/admin';
import { adminService } from '../../services/adminApi';
import { Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

// Routine type icons
const routineIcons: Record<string, React.ElementType> = {
  FEEDING: Utensils,
  SLEEP: Moon,
  DIAPER: Droplet,
  BATH: Bath,
  MILK_EXTRACTION: Milk,
};

// Routine type labels
const routineLabels: Record<string, string> = {
  FEEDING: 'Alimentação',
  SLEEP: 'Sono',
  DIAPER: 'Fralda',
  BATH: 'Banho',
  MILK_EXTRACTION: 'Extração de Leite',
};

// Routine type colors
const routineColors: Record<string, string> = {
  FEEDING: 'olive',
  SLEEP: 'violet',
  DIAPER: 'emerald',
  BATH: 'sky',
  MILK_EXTRACTION: 'rose',
};

export function AdminQualityPage() {
  // Fetch data quality report
  const { data, isLoading } = useQuery({
    queryKey: ['admin-data-quality'],
    queryFn: () => adminService.getDataQuality(),
  });

  const reports = data?.data || [];

  // Calculate overall completeness
  const overallCompleteness = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.metaCompleteness, 0) / reports.length)
    : 0;

  const totalRoutines = reports.reduce((sum, r) => sum + r.totalRoutines, 0);
  const totalWithMeta = reports.reduce((sum, r) => sum + r.withMeta, 0);

  // Get completeness color
  const getCompletenessColor = (value: number) => {
    if (value >= 80) return 'text-emerald-600 bg-emerald-100';
    if (value >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };

  // Get bar color
  const getBarColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <AdminLayout title="Qualidade de Dados">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Data Quality Report</h2>
        <p className="text-sm text-gray-500">Análise de completude de metadados por tipo de rotina (últimos 30 dias)</p>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total de Rotinas"
          value={totalRoutines.toLocaleString()}
          icon={<Database className="w-6 h-6" />}
          color="olive"
        />
        <KpiCard
          title="Com Metadata"
          value={totalWithMeta.toLocaleString()}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
        <KpiCard
          title="Sem Metadata"
          value={(totalRoutines - totalWithMeta).toLocaleString()}
          icon={<AlertCircle className="w-6 h-6" />}
          color="amber"
        />
        <KpiCard
          title="Completude Média"
          value={`${overallCompleteness}%`}
          icon={<Info className="w-6 h-6" />}
          color={overallCompleteness >= 80 ? 'emerald' : overallCompleteness >= 50 ? 'amber' : 'rose'}
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      ) : (
        /* Reports Grid */
        <div className="space-y-6">
          {reports.map((report) => {
            const Icon = routineIcons[report.routineType] || Database;
            const label = routineLabels[report.routineType] || report.routineType;
            const color = routineColors[report.routineType] || 'olive';

            return (
              <div
                key={report.routineType}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      color === 'olive' && 'bg-olive-100',
                      color === 'violet' && 'bg-violet-100',
                      color === 'emerald' && 'bg-emerald-100',
                      color === 'sky' && 'bg-sky-100',
                      color === 'rose' && 'bg-rose-100',
                    )}>
                      <Icon className={cn(
                        'w-6 h-6',
                        color === 'olive' && 'text-olive-600',
                        color === 'violet' && 'text-violet-600',
                        color === 'emerald' && 'text-emerald-600',
                        color === 'sky' && 'text-sky-600',
                        color === 'rose' && 'text-rose-600',
                      )} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                      <p className="text-sm text-gray-500">
                        {report.totalRoutines.toLocaleString()} rotinas
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-4 py-2 rounded-full font-semibold',
                    getCompletenessColor(report.metaCompleteness)
                  )}>
                    {report.metaCompleteness}% completo
                  </div>
                </div>

                {/* Completeness Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Completude de Metadados</span>
                    <span className="font-medium text-gray-900">
                      {report.withMeta} / {report.totalRoutines}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getBarColor(report.metaCompleteness))}
                      style={{ width: `${report.metaCompleteness}%` }}
                    />
                  </div>
                </div>

                {/* Missing Fields */}
                {report.missingFields.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Campos Faltantes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {report.missingFields.slice(0, 6).map((field) => (
                        <div
                          key={field.field}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm text-gray-600">{field.field}</span>
                          <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            field.percentage >= 80 ? 'bg-rose-100 text-rose-700' :
                            field.percentage >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          )}>
                            {field.percentage}% faltando
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum dado de qualidade disponível</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

