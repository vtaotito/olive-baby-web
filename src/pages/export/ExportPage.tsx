// Olive Baby Web - Export Page
import { useState, useRef, useEffect } from 'react';
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
import { exportService, routineService, statsService } from '../../services/api';
import { downloadBlob, generateWeeklyReport, captureChartAsImage, type PDFReportData } from '../../lib/export';
import { formatAge, formatDateBR } from '../../lib/utils';

type ExportType = 'routines' | 'growth' | 'milestones' | 'pdf';

export function ExportPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Chart data for PDF
  const [weeklyData, setWeeklyData] = useState<{
    labels: string[];
    feeding: number[];
    sleep: number[];
    diaper: { pee: number; poop: number; both: number };
    stats: PDFReportData['stats'];
  } | null>(null);

  // Chart refs for capturing
  const feedingChartRef = useRef<HTMLDivElement>(null);
  const sleepChartRef = useRef<HTMLDivElement>(null);
  const diaperChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBaby) {
      loadWeeklyData();
    }
  }, [selectedBaby]);

  const loadWeeklyData = async () => {
    if (!selectedBaby) return;

    // Generate last 7 days labels
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const labels: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(days[date.getDay()]);
    }
    
    // Mock data - in production this would come from the API
    const feeding = labels.map(() => Math.floor(Math.random() * 8) + 4);
    const sleep = labels.map(() => Math.random() * 4 + 10);
    
    const pee = Math.floor(Math.random() * 20) + 15;
    const poop = Math.floor(Math.random() * 10) + 5;
    const both = Math.floor(Math.random() * 5) + 2;

    setWeeklyData({
      labels,
      feeding,
      sleep,
      diaper: { pee, poop, both },
      stats: {
        feeding: { 
          count: feeding.reduce((a, b) => a + b, 0), 
          avgDuration: Math.floor(Math.random() * 10) + 15 
        },
        sleep: { 
          totalHours: sleep.reduce((a, b) => a + b, 0), 
          avgHours: sleep.reduce((a, b) => a + b, 0) / 7 
        },
        diaper: { 
          total: pee + poop + both, 
          pee, 
          poop: poop + both 
        },
        bath: { count: Math.floor(Math.random() * 5) + 3 },
        extraction: { 
          totalMl: Math.floor(Math.random() * 500) + 200, 
          sessions: Math.floor(Math.random() * 10) + 5 
        },
      },
    });
  };

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
      success('Exportação concluída!', `Arquivo ${filename} baixado com sucesso`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro na exportação', error.response?.data?.message || 'Falha ao exportar dados');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedBaby || !weeklyData) return;
    
    setIsExporting('pdf');
    try {
      // Wait a bit for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture chart images
      const feedingChart = await captureChartAsImage('chart-feeding');
      const sleepChart = await captureChartAsImage('chart-sleep');
      const diaperChart = await captureChartAsImage('chart-diaper');
      
      // Get date range
      const endDateObj = new Date();
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 6);
      const dateRange = `${formatDateBR(startDateObj)} - ${formatDateBR(endDateObj)}`;
      
      // Generate PDF
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
      
      success('PDF gerado!', 'Relatório semanal exportado com sucesso');
    } catch (err: unknown) {
      const error = err as { message?: string };
      showError('Erro ao gerar PDF', error.message || 'Falha ao gerar relatório');
    } finally {
      setIsExporting(null);
    }
  };

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebê primeiro</p>
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
            <CardHeader title="📊 Exportar CSV" subtitle="Baixe os dados em formato planilha" />
            <CardBody className="space-y-4">
              {/* Date Range for Routines */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período para Rotinas
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
                    <p className="text-sm text-gray-500">Alimentação, sono, fraldas, banho</p>
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
                    <p className="text-sm text-gray-500">Peso, altura, circunferência</p>
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
                    <p className="text-sm text-gray-500">Todos os marcos alcançados</p>
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
              title="📄 Relatório PDF" 
              subtitle="Gere um relatório visual da última semana"
            />
            <CardBody className="space-y-4">
              <div className="bg-gradient-to-br from-olive-50 to-white rounded-lg p-4 text-center">
                <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-olive-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Relatório Semanal</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Inclui resumo estatístico e gráficos dos últimos 7 dias
                </p>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting !== null}
                  isLoading={isExporting === 'pdf'}
                  leftIcon={<Download className="w-5 h-5" />}
                  fullWidth
                >
                  Gerar PDF
                </Button>
              </div>

              {/* Preview Charts (hidden but rendered for capture) */}
              {weeklyData && (
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium text-gray-700">Prévia dos Gráficos:</h4>
                  
                  <div id="chart-feeding" ref={feedingChartRef} className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-yellow-600" />
                      Alimentações da Semana
                    </p>
                    <StatsChart
                      type="bar"
                      labels={weeklyData.labels}
                      datasets={[
                        {
                          label: 'Alimentações',
                          data: weeklyData.feeding,
                          backgroundColor: 'rgba(234, 179, 8, 0.6)',
                          borderColor: 'rgb(234, 179, 8)',
                        },
                      ]}
                      height={150}
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
                      height={150}
                    />
                  </div>

                  <div id="chart-diaper" ref={diaperChartRef} className="bg-white p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-green-600" />
                      Distribuição de Fraldas
                    </p>
                    <StatsChart
                      type="doughnut"
                      labels={['Xixi', 'Cocô', 'Ambos']}
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
                      height={150}
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
