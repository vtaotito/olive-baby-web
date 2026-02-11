// Olive Baby Web - Export Page (CSV only, Premium feature)
import { useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  Calendar,
  Loader2,
  CheckCircle,
  TrendingUp,
  Utensils,
  Crown,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input } from '../../components/ui';
import { PaywallModal, usePaywall } from '../../components/ui/PaywallModal';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { exportService } from '../../services/api';
import { downloadBlob } from '../../lib/export';
import { useEntitlements } from '../../hooks/useEntitlements';

type ExportType = 'routines' | 'growth' | 'milestones';

export function ExportPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const { can, isPremium } = useEntitlements();
  const { isOpen, feature, resource, currentCount, limit, checkFeature, closePaywall } = usePaywall();
  
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleExportCSV = async (type: ExportType) => {
    if (!selectedBaby) return;

    // Check premium access
    if (!checkFeature('exportCsv')) return;
    
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
        <p className="text-gray-500 mt-1">{selectedBaby.name}</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader 
            title="Exportar CSV" 
            subtitle="Baixe os dados em formato planilha"
          />
          <CardBody className="space-y-4">
            {/* Premium badge */}
            {!isPremium && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-4 py-3">
                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm">
                  A exportacao de dados e um recurso exclusivo do plano <strong>Premium</strong>.
                </p>
              </div>
            )}

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

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isOpen}
        onClose={closePaywall}
        feature={feature}
        resource={resource}
        currentCount={currentCount}
        limit={limit}
      />
    </DashboardLayout>
  );
}
