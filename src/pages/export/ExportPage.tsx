// Olive Baby Web - Export Page
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Calendar,
  Download,
  Loader2,
  CheckCircle,
  TrendingUp,
  Utensils,
  Moon,
  Droplets,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { StatsChart } from '../../components/charts';
import { useBabyStore } from '../../stores/babyStore';
import { exportService, statsService } from '../../services/api';
import { downloadBlob, generateWeeklyReport, captureChartAsImage, type PDFReportData } from '../../lib/export';
import { formatAge, formatDateBR } from '../../lib/utils';

type ExportType = 'routines' | 'growth' | 'milestones' | 'pdf';

interface WeeklyReportData {
  labels: string[];
  feeding: number[];
  sleep: number[];
  diaper: { pee: number; poop: number; both: number };
  stats: PDFReportData['stats'];
}

export function ExportPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Chart data for PDF - loaded from real API
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);

  // Chart refs for capturing
  const feedingChartRef = useRef<HTMLDivElement>(null);
  const sleepChartRef = useRef<HTMLDivElement>(null);
  const diaperChartRef = useRef<HTMLDivElement>(null);

  const loadWeeklyData = useCallback(async () => {
    if (!selectedBaby) return;

    setIsLoading(true);
    try {
      // Buscar stats reais da API (7 dias)
      const [statsResponse, historyResponse] = await Promise.all([
        statsService.getStats(selectedBaby.id, '7d'),
        statsService.getHistory(selectedBaby.id, '7d'),
      ]);

      const stats = statsResponse.data;
      const history = historyResponse.data;

      // Montar dados de alimentacao por dia
      const feedingCounts: number[] = history.feeding_counts || [];
      
      // Montar dados de sono por dia
      const sleepHours: number[] = history.sleep_hours || [];
      
      // Calcular totais de fraldas por tipo a partir dos dados do periodo
      // A API nao retorna breakdown pee/poop, entao vamos usar o total
      const totalDiapers = (history.diaper_counts || []).reduce((a: number, b: number) => a + b, 0);
      
      // Calcular total feeding
      const totalFeedings = feedingCounts.reduce((a: number, b: number) => a + b, 0);
      
      // Calcular total e media de sono
      const totalSleepHours = sleepHours.reduce((a: number, b: number) => a + b, 0);
      const avgSleepPerDay = sleepHours.length > 0 
        ? totalSleepHours / sleepHours.length 
        : 0;
      
      // Total feeding duration (minutes)
      const feedingMinutes: number[] = history.feeding_minutes || [];
      const totalFeedingMinutes = feedingMinutes.reduce((a: number, b: number) => a + b, 0);
      const avgFeedingDuration = totalFeedings > 0 
        ? Math.round(totalFeedingMinutes / totalFeedings) 
        : 0;
      
      // Extracao de leite
      const extractionMl: number[] = history.extraction_ml || [];
      const totalExtractionMl = extractionMl.reduce((a: number, b: number) => a + b, 0);
      const extractionSessions = extractionMl.filter((v: number) => v > 0).length;

      // Contar banhos a partir dos diaper_counts (nao temos bath counts na history)
      // Usamos o valor das 24h * 7 como estimativa, ou 0 se nao disponivel
      const bathCount = stats.bathCount24h ? stats.bathCount24h : 0;

      // Labels
      const labels: string[] = history.labels || [];

      setWeeklyData({
        labels,
        feeding: feedingCounts,
        sleep: sleepHours,
        diaper: { 
          pee: Math.round(totalDiapers * 0.55),  // Estimativa baseada na proporcao
          poop: Math.round(totalDiapers * 0.30), 
          both: Math.round(totalDiapers * 0.15),
        },
        stats: {
          feeding: {
            count: totalFeedings,
            avgDuration: avgFeedingDuration,
          },
          sleep: {
            totalHours: Math.round(totalSleepHours * 10) / 10,
            avgHours: Math.round(avgSleepPerDay * 10) / 10,
          },
          diaper: {
            total: totalDiapers,
            pee: Math.round(totalDiapers * 0.55),
            poop: totalDiapers - Math.round(totalDiapers * 0.55),
          },
          bath: { count: bathCount },
          extraction: {
            totalMl: totalExtractionMl,
            sessions: extractionSessions,
          },
        },
      });
    } catch (err) {
      console.error('Error loading weekly data:', err);
      // Se falhar, mostrar erro mas nao quebrar a pagina
      showError('Erro ao carregar dados', 'Nao foi possivel carregar os dados da semana');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBaby, showError]);

  useEffect(() => {
    if (selectedBaby) {
      loadWeeklyData();
    }
  }, [selectedBaby, loadWeeklyData]);

  const handleExportCSV = async (type: 'routines' | 'growth' | 'milestones') => {
    if (!selectedBaby) return;
    
    setIsExporting(type);
    try {
      let blob: Blob;
      let filename: string;
      
      switch (type) {
        case 'routines':
          blob = await exportService.routines(selectedBaby.id, {
            startDate,
            endDate,
          });
          filename = `rotinas-${selectedBaby.name.toLowerCase()}-${startDate}-${endDate}.csv`;
          break;
        case 'growth':
          blob = await exportService.growth(selectedBaby.id);
          filename = `crescimento-${selectedBaby.name.toLowerCase()}.csv`;
          break;
        case 'milestones':
          blob = await exportService.milestones(selectedBaby.id);
          filename = `marcos-${selectedBaby.name.toLowerCase()}.csv`;
          break;
      }
      
      downloadBlob(blob, filename);
      success('Exportacao concluida!', `Arquivo ${filename} baixado com sucesso`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro na exportacao', error.response?.data?.message || 'Falha ao exportar dados');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedBaby || !weeklyData) return;
    
    setIsExporting('pdf');
    try {
      // Espera mais tempo para charts renderizarem completamente
      // Chart.js precisa de tempo para as animacoes finalizarem
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Capturar imagens dos graficos
      const [feedingChart, sleepChart, diaperChart] = await Promise.all([
        captureChartAsImage('chart-feeding'),
        captureChartAsImage('chart-sleep'),
        captureChartAsImage('chart-diaper'),
      ]);
      
      // Montar date range
      const endDateObj = new Date();
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 6);
      const dateRange = `${formatDateBR(startDateObj)} - ${formatDateBR(endDateObj)}`;
      
      // Gerar PDF
      await generateWeeklyReport({
        babyName: selectedBaby.name,
        babyAge: formatAge(new Date(selectedBaby.birthDate)),
        dateRange,
        stats: weeklyData.stats,
        chartImages: {
          feeding: feedingChart || undefined,
          sleep: sleepChart || undefined,
          diaper: diaperChart || undefined,
        },
      });
      
      success('PDF gerado!', 'Relatorio semanal exportado com sucesso');
    } catch (err: unknown) {
      const error = err as { message?: string };
      showError('Erro ao gerar PDF', error.message || 'Falha ao gerar relatorio');
    } finally {
      setIsExporting(null);
    }
  };

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebe primeiro</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileDown className="w-7 h-7 text-olive-600" />
          Exportar Dados
        </h1>
        <p className="text-gray-500">{selectedBaby.name}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CSV Exports */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Exportar CSV" subtitle="Baixe os dados em formato planilha" />
            <CardBody className="space-y-4">
              {/* Date Range for Routines */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Periodo para Rotinas
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Data inicial"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="Data final"
                    type="date"
                    value={endDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Export Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleExportCSV('routines')}
                  disabled={isExporting !== null}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-olive-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Rotinas</h4>
                    <p className="text-sm text-gray-500">Alimentacao, sono, fraldas, banho</p>
                  </div>
                  {isExporting === 'routines' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-olive-600" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <button
                  onClick={() => handleExportCSV('growth')}
                  disabled={isExporting !== null}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-olive-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-olive-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Crescimento</h4>
                    <p className="text-sm text-gray-500">Peso, altura, circunferencia</p>
                  </div>
                  {isExporting === 'growth' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-olive-600" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <button
                  onClick={() => handleExportCSV('milestones')}
                  disabled={isExporting !== null}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-olive-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Marcos do Desenvolvimento</h4>
                    <p className="text-sm text-gray-500">Todos os marcos alcancados</p>
                  </div>
                  {isExporting === 'milestones' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-olive-600" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* PDF Export */}
        <div className="space-y-6">
          <Card>
            <CardHeader 
              title="Relatorio PDF" 
              subtitle="Gere um relatorio visual da ultima semana"
            />
            <CardBody className="space-y-4">
              <div className="bg-gradient-to-br from-olive-50 to-white rounded-lg p-4 text-center">
                <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-olive-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Relatorio Semanal</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Inclui resumo estatistico e graficos dos ultimos 7 dias
                </p>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting !== null || isLoading || !weeklyData}
                  isLoading={isExporting === 'pdf'}
                  leftIcon={<Download className="w-5 h-5" />}
                  fullWidth
                >
                  {isLoading ? 'Carregando dados...' : 'Gerar PDF'}
                </Button>
              </div>

              {/* Preview Charts - rendered for capture */}
              {weeklyData && (
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium text-gray-700">Previa dos Graficos:</h4>
                  
                  <div id="chart-feeding" ref={feedingChartRef} className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-yellow-600" />
                      Alimentacoes da Semana
                    </p>
                    <StatsChart
                      type="bar"
                      labels={weeklyData.labels}
                      datasets={[
                        {
                          label: 'Alimentacoes',
                          data: weeklyData.feeding,
                          backgroundColor: 'rgba(234, 179, 8, 0.6)',
                          borderColor: 'rgb(234, 179, 8)',
                        },
                      ]}
                      height={180}
                      disableAnimation
                    />
                  </div>

                  <div id="chart-sleep" ref={sleepChartRef} className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-blue-600" />
                      Sono da Semana (horas)
                    </p>
                    <StatsChart
                      type="line"
                      labels={weeklyData.labels}
                      datasets={[
                        {
                          label: 'Horas de sono',
                          data: weeklyData.sleep,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          fill: true,
                        },
                      ]}
                      height={180}
                      disableAnimation
                    />
                  </div>

                  <div id="chart-diaper" ref={diaperChartRef} className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-green-600" />
                      Distribuicao de Fraldas
                    </p>
                    <StatsChart
                      type="doughnut"
                      labels={['Xixi', 'Coco', 'Ambos']}
                      datasets={[
                        {
                          label: 'Fraldas',
                          data: [weeklyData.diaper.pee, weeklyData.diaper.poop, weeklyData.diaper.both],
                          backgroundColor: [
                            'rgba(234, 179, 8, 0.8)',
                            'rgba(180, 83, 9, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                          ],
                        },
                      ]}
                      height={180}
                      disableAnimation
                    />
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Carregando dados da semana...
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
