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
      useCORS: true,
      allowTaint: true,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
}

// ====== PDF Drawing Helpers ======

const COLORS = {
  primary: [99, 118, 98] as [number, number, number],       // olive
  primaryDark: [70, 88, 69] as [number, number, number],     // olive dark
  text: [51, 51, 51] as [number, number, number],
  textLight: [128, 128, 128] as [number, number, number],
  lightGray: [220, 220, 220] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bgCard: [248, 248, 248] as [number, number, number],
  feeding: [234, 179, 8] as [number, number, number],       // yellow
  sleep: [59, 130, 246] as [number, number, number],         // blue
  diaper: [34, 197, 94] as [number, number, number],         // green
  bath: [147, 51, 234] as [number, number, number],          // purple
  extraction: [236, 72, 153] as [number, number, number],    // pink
};

function addText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    color?: [number, number, number];
    bold?: boolean;
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  }
) {
  const {
    fontSize = 12,
    color = COLORS.text,
    bold = false,
    align = 'left',
  } = options || {};

  pdf.setFontSize(fontSize);
  pdf.setTextColor(...color);
  pdf.setFont('helvetica', bold ? 'bold' : 'normal');
  pdf.text(text, x, y, { align, maxWidth: options?.maxWidth });
}

/** Draw a small filled circle as bullet / icon placeholder */
function drawBullet(
  pdf: jsPDF,
  x: number,
  y: number,
  color: [number, number, number],
  radius: number = 3
) {
  pdf.setFillColor(...color);
  pdf.circle(x, y - 1, radius, 'F');
}

function addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  addText(pdf, `Gerado em ${formatDateBR(new Date())} as ${formatTimeBR(new Date())}`, pageWidth / 2, pageHeight - 5, {
    fontSize: 7,
    color: COLORS.white,
    align: 'center',
  });
  addText(pdf, 'OlieCare - Acompanhe o desenvolvimento do seu bebe', pageWidth / 2, pageHeight - 1.5, {
    fontSize: 6,
    color: [200, 220, 200] as [number, number, number],
    align: 'center',
  });
}

// ====== Main PDF Generation ======

export async function generateWeeklyReport(data: PDFReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // ================================
  // PAGE 1 - Header & Stats
  // ================================

  // Header band
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 32, 'F');

  // Accent line
  pdf.setFillColor(...COLORS.primaryDark);
  pdf.rect(0, 32, pageWidth, 1.5, 'F');

  addText(pdf, 'Olive Baby', margin, 14, { fontSize: 22, color: COLORS.white, bold: true });
  addText(pdf, 'Relatorio Semanal', margin, 22, { fontSize: 12, color: [200, 220, 200] as [number, number, number] });
  addText(pdf, data.dateRange, pageWidth - margin, 14, {
    fontSize: 11,
    color: COLORS.white,
    align: 'right',
  });

  yPos = 42;

  // Baby Info
  addText(pdf, `Bebe: ${data.babyName}`, margin, yPos, { fontSize: 16, bold: true, color: COLORS.primary });
  addText(pdf, `Idade: ${data.babyAge}`, margin + pdf.getTextWidth(`Bebe: ${data.babyName}  `), yPos, {
    fontSize: 12,
    color: COLORS.textLight,
  });

  yPos += 10;

  // Divider
  pdf.setDrawColor(...COLORS.lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Section title
  addText(pdf, 'Resumo da Semana', margin, yPos, { fontSize: 14, bold: true, color: COLORS.primary });
  yPos += 10;

  // ================================
  // Stats Grid - Row 1 (3 cards)
  // ================================
  const cardWidth = (contentWidth - 8) / 3; // 4mm gap between cards
  const cardHeight = 32;

  const statsRow1 = [
    {
      color: COLORS.feeding,
      label: 'Alimentacoes',
      value: `${data.stats.feeding.count}x`,
      sub: `Media: ${data.stats.feeding.avgDuration}min`,
    },
    {
      color: COLORS.sleep,
      label: 'Sono Total',
      value: `${data.stats.sleep.totalHours.toFixed(1)}h`,
      sub: `Media: ${data.stats.sleep.avgHours.toFixed(1)}h/dia`,
    },
    {
      color: COLORS.diaper,
      label: 'Trocas de Fralda',
      value: `${data.stats.diaper.total}x`,
      sub: `Xixi: ${data.stats.diaper.pee} | Coco: ${data.stats.diaper.poop}`,
    },
  ];

  statsRow1.forEach((stat, index) => {
    const x = margin + index * (cardWidth + 4);

    // Card background
    pdf.setFillColor(...COLORS.bgCard);
    pdf.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'F');

    // Color accent bar on left
    pdf.setFillColor(...stat.color);
    pdf.rect(x, yPos + 2, 2, cardHeight - 4, 'F');

    // Label
    addText(pdf, stat.label, x + 7, yPos + 8, { fontSize: 9, color: COLORS.textLight });

    // Value
    addText(pdf, stat.value, x + 7, yPos + 18, { fontSize: 16, bold: true, color: COLORS.primary });

    // Sub text
    addText(pdf, stat.sub, x + 7, yPos + 25, { fontSize: 8, color: COLORS.textLight });
  });

  yPos += cardHeight + 6;

  // ================================
  // Stats Grid - Row 2 (2 cards)
  // ================================
  const cardWidthRow2 = (contentWidth - 4) / 2;
  const cardHeightRow2 = 28;

  const statsRow2 = [
    {
      color: COLORS.bath,
      label: 'Banhos',
      value: `${data.stats.bath.count}x`,
      sub: '',
    },
    {
      color: COLORS.extraction,
      label: 'Extracao de Leite',
      value: `${data.stats.extraction.totalMl}ml`,
      sub: `${data.stats.extraction.sessions} sessoes`,
    },
  ];

  statsRow2.forEach((stat, index) => {
    const x = margin + index * (cardWidthRow2 + 4);

    pdf.setFillColor(...COLORS.bgCard);
    pdf.roundedRect(x, yPos, cardWidthRow2, cardHeightRow2, 2, 2, 'F');

    pdf.setFillColor(...stat.color);
    pdf.rect(x, yPos + 2, 2, cardHeightRow2 - 4, 'F');

    addText(pdf, stat.label, x + 7, yPos + 8, { fontSize: 9, color: COLORS.textLight });
    addText(pdf, stat.value, x + 7, yPos + 18, { fontSize: 16, bold: true, color: COLORS.primary });

    if (stat.sub) {
      addText(pdf, stat.sub, x + 7 + pdf.getTextWidth(stat.value + '  '), yPos + 18, {
        fontSize: 9,
        color: COLORS.textLight,
      });
    }
  });

  yPos += cardHeightRow2 + 8;

  // ================================
  // Charts Section
  // ================================
  const hasCharts =
    data.chartImages.feeding || data.chartImages.sleep || data.chartImages.diaper;

  if (hasCharts) {
    // Divider
    pdf.setDrawColor(...COLORS.lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    addText(pdf, 'Graficos da Semana', margin, yPos, {
      fontSize: 14,
      bold: true,
      color: COLORS.primary,
    });
    yPos += 10;

    const chartFullWidth = contentWidth;
    const chartHalfWidth = (contentWidth - 6) / 2;
    const chartHeight = 55;

    // Feeding & Sleep side by side
    if (data.chartImages.feeding || data.chartImages.sleep) {
      if (data.chartImages.feeding && data.chartImages.sleep) {
        // Both charts - side by side
        drawBullet(pdf, margin + 2, yPos + 1, COLORS.feeding, 2);
        addText(pdf, 'Alimentacoes', margin + 6, yPos + 2, {
          fontSize: 9,
          bold: true,
          color: COLORS.text,
        });

        drawBullet(pdf, margin + chartHalfWidth + 8, yPos + 1, COLORS.sleep, 2);
        addText(pdf, 'Sono (horas)', margin + chartHalfWidth + 12, yPos + 2, {
          fontSize: 9,
          bold: true,
          color: COLORS.text,
        });

        yPos += 5;

        try {
          pdf.addImage(
            data.chartImages.feeding,
            'PNG',
            margin,
            yPos,
            chartHalfWidth,
            chartHeight
          );
        } catch (e) {
          console.error('Error adding feeding chart:', e);
        }

        try {
          pdf.addImage(
            data.chartImages.sleep,
            'PNG',
            margin + chartHalfWidth + 6,
            yPos,
            chartHalfWidth,
            chartHeight
          );
        } catch (e) {
          console.error('Error adding sleep chart:', e);
        }

        yPos += chartHeight + 8;
      } else {
        // Single chart - full width
        const singleChart = data.chartImages.feeding || data.chartImages.sleep;
        const singleLabel = data.chartImages.feeding ? 'Alimentacoes' : 'Sono (horas)';
        const singleColor = data.chartImages.feeding ? COLORS.feeding : COLORS.sleep;

        drawBullet(pdf, margin + 2, yPos + 1, singleColor, 2);
        addText(pdf, singleLabel, margin + 6, yPos + 2, {
          fontSize: 9,
          bold: true,
          color: COLORS.text,
        });
        yPos += 5;

        try {
          pdf.addImage(singleChart!, 'PNG', margin, yPos, chartFullWidth, chartHeight);
        } catch (e) {
          console.error('Error adding single chart:', e);
        }

        yPos += chartHeight + 8;
      }
    }

    // Diaper chart - check if we need a new page
    if (data.chartImages.diaper) {
      const diaperChartHeight = 55;
      const spaceNeeded = diaperChartHeight + 25; // chart + label + footer

      if (yPos + spaceNeeded > pageHeight - 15) {
        addFooter(pdf, pageWidth, pageHeight);
        pdf.addPage();
        yPos = margin;
      }

      drawBullet(pdf, margin + 2, yPos + 1, COLORS.diaper, 2);
      addText(pdf, 'Distribuicao de Fraldas', margin + 6, yPos + 2, {
        fontSize: 9,
        bold: true,
        color: COLORS.text,
      });
      yPos += 5;

      try {
        pdf.addImage(
          data.chartImages.diaper,
          'PNG',
          margin,
          yPos,
          chartHalfWidth,
          diaperChartHeight
        );
      } catch (e) {
        console.error('Error adding diaper chart:', e);
      }
    }
  }

  // Footer on every page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    addFooter(pdf, pageWidth, pageHeight);
  }

  // Save PDF
  const filename = `olive-baby-relatorio-${data.babyName.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
