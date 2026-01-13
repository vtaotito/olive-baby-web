// Olive Baby Web - Export Utilities
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDateBR, formatTimeBR } from './utils';

// ====== CSV Export Functions ======

export function downloadCSV(data: string, filename: string) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Convert array of objects to CSV string
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headers = columns.map((c) => `"${c.header}"`).join(',');
  
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return `"${formatDateBR(value)}"`;
        return `"${String(value)}"`;
      })
      .join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// ====== PDF Export Functions ======

export interface PDFReportData {
  babyName: string;
  babyAge: string;
  dateRange: string;
  stats: {
    feeding: { count: number; avgDuration: number };
    sleep: { totalHours: number; avgHours: number };
    diaper: { total: number; pee: number; poop: number };
    bath: { count: number };
    extraction: { totalMl: number; sessions: number };
  };
  chartImages: {
    feeding?: string;
    sleep?: string;
    diaper?: string;
  };
}

export async function captureChartAsImage(elementId: string): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
}

export async function generateWeeklyReport(data: PDFReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor = [99, 118, 98] as [number, number, number]; // olive
  const textColor = [51, 51, 51] as [number, number, number];
  const lightGray = [200, 200, 200] as [number, number, number];

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { 
    fontSize?: number; 
    color?: [number, number, number]; 
    bold?: boolean;
    align?: 'left' | 'center' | 'right';
  }) => {
    const { fontSize = 12, color = textColor, bold = false, align = 'left' } = options || {};
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    
    let xPos = x;
    if (align === 'center') {
      xPos = pageWidth / 2;
    } else if (align === 'right') {
      xPos = pageWidth - margin;
    }
    
    pdf.text(text, xPos, y, { align });
  };

  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  addText('🍼 Olive Baby', margin, 15, { fontSize: 24, color: [255, 255, 255], bold: true });
  addText('Relatório Semanal', margin, 25, { fontSize: 14, color: [255, 255, 255] });
  addText(data.dateRange, pageWidth - margin, 20, { fontSize: 12, color: [255, 255, 255], align: 'right' });
  
  yPos = 50;

  // Baby Info
  addText(`Bebê: ${data.babyName}`, margin, yPos, { fontSize: 16, bold: true, color: primaryColor });
  addText(`Idade: ${data.babyAge}`, margin, yPos + 8, { fontSize: 12 });
  
  yPos += 25;

  // Divider
  pdf.setDrawColor(...lightGray);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Stats Section
  addText('📊 Resumo da Semana', margin, yPos, { fontSize: 14, bold: true, color: primaryColor });
  yPos += 12;

  // Stats Grid
  const statsColWidth = (pageWidth - margin * 2) / 3;
  
  // Row 1
  const stats1 = [
    { emoji: '🍼', label: 'Alimentações', value: `${data.stats.feeding.count}x`, sub: `Média: ${data.stats.feeding.avgDuration}min` },
    { emoji: '😴', label: 'Sono Total', value: `${data.stats.sleep.totalHours.toFixed(1)}h`, sub: `Média: ${data.stats.sleep.avgHours.toFixed(1)}h/dia` },
    { emoji: '👶', label: 'Trocas de Fralda', value: `${data.stats.diaper.total}x`, sub: `Xixi: ${data.stats.diaper.pee} | Cocô: ${data.stats.diaper.poop}` },
  ];

  stats1.forEach((stat, index) => {
    const x = margin + index * statsColWidth;
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(x, yPos, statsColWidth - 5, 30, 3, 3, 'F');
    addText(`${stat.emoji} ${stat.label}`, x + 5, yPos + 8, { fontSize: 10 });
    addText(stat.value, x + 5, yPos + 18, { fontSize: 14, bold: true, color: primaryColor });
    addText(stat.sub, x + 5, yPos + 25, { fontSize: 8, color: [128, 128, 128] });
  });

  yPos += 40;

  // Row 2
  const stats2 = [
    { emoji: '🛁', label: 'Banhos', value: `${data.stats.bath.count}x` },
    { emoji: '🥛', label: 'Extração de Leite', value: `${data.stats.extraction.totalMl}ml`, sub: `${data.stats.extraction.sessions} sessões` },
  ];

  stats2.forEach((stat, index) => {
    const x = margin + index * statsColWidth;
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(x, yPos, statsColWidth - 5, 25, 3, 3, 'F');
    addText(`${stat.emoji} ${stat.label}`, x + 5, yPos + 8, { fontSize: 10 });
    addText(stat.value, x + 5, yPos + 18, { fontSize: 14, bold: true, color: primaryColor });
    if (stat.sub) {
      addText(stat.sub, x + statsColWidth - 10, yPos + 18, { fontSize: 8, color: [128, 128, 128], align: 'right' });
    }
  });

  yPos += 35;

  // Charts Section
  if (data.chartImages.feeding || data.chartImages.sleep || data.chartImages.diaper) {
    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setDrawColor(...lightGray);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    addText('📈 Gráficos da Semana', margin, yPos, { fontSize: 14, bold: true, color: primaryColor });
    yPos += 15;

    const chartWidth = (pageWidth - margin * 2 - 10) / 2;
    const chartHeight = 50;

    // Feeding Chart
    if (data.chartImages.feeding) {
      addText('Alimentações', margin, yPos, { fontSize: 10, bold: true });
      yPos += 5;
      try {
        pdf.addImage(data.chartImages.feeding, 'PNG', margin, yPos, chartWidth, chartHeight);
      } catch (e) {
        console.error('Error adding feeding chart:', e);
      }
    }

    // Sleep Chart
    if (data.chartImages.sleep) {
      addText('Sono (horas)', margin + chartWidth + 10, yPos - 5, { fontSize: 10, bold: true });
      try {
        pdf.addImage(data.chartImages.sleep, 'PNG', margin + chartWidth + 10, yPos, chartWidth, chartHeight);
      } catch (e) {
        console.error('Error adding sleep chart:', e);
      }
    }

    yPos += chartHeight + 15;

    // Diaper Chart
    if (data.chartImages.diaper) {
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = margin;
      }
      addText('Distribuição de Fraldas', margin, yPos, { fontSize: 10, bold: true });
      yPos += 5;
      try {
        pdf.addImage(data.chartImages.diaper, 'PNG', margin, yPos, chartWidth, chartHeight);
      } catch (e) {
        console.error('Error adding diaper chart:', e);
      }
    }
  }

  // Footer
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  addText(`Gerado em ${formatDateBR(new Date())} às ${formatTimeBR(new Date())}`, pageWidth / 2, pageHeight - 6, { 
    fontSize: 8, 
    color: [255, 255, 255], 
    align: 'center' 
  });
  addText('OlieCare - Acompanhe o desenvolvimento do seu bebê', pageWidth / 2, pageHeight - 2, { 
    fontSize: 6, 
    color: [200, 200, 200], 
    align: 'center' 
  });

  // Save PDF
  const filename = `olive-baby-relatorio-${data.babyName.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
