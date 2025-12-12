// Olive Baby Web - Insights Engine
import type { RoutineLog } from '../types';

export type InsightType = 'positive' | 'warning' | 'tip' | 'neutral';

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  warnAboutMedical: boolean;
}

interface BreastSideDistribution {
  left: number;
  right: number;
  both: number;
}

interface FeedingStats {
  feedingCount24h: number;
  totalFeedingMinutes24h: number;
  breastSideDistribution: BreastSideDistribution;
  complementMlPerDay: number[];
  totalComplementMlRange: number;
  totalComplementMl24h: number;
  hourlyCounts: number[];
  labels: string[];
  // Compatibilidade com nomes alternativos
  feeding_count_24h?: number;
  total_feeding_minutes_24h?: number;
  breast_side_distribution?: BreastSideDistribution;
}

/**
 * Engine de insights para amamentação
 */
export class FeedingInsightsEngine {
  /**
   * Gera insights baseados nos dados de amamentação
   */
  static generateInsights(stats: FeedingStats, babyContext?: { ageInDays?: number; notes?: string }): Insight[] {
    const insights: Insight[] = [];

    // 1. Insight de equilíbrio dos seios
    const balanceInsight = this.checkBreastBalance(stats.breastSideDistribution);
    if (balanceInsight) insights.push(balanceInsight);

    // 2. Insight de frequência de mamadas
    const frequencyInsight = this.checkFeedingFrequency(stats.feedingCount24h, babyContext?.ageInDays);
    if (frequencyInsight) insights.push(frequencyInsight);

    // 3. Insight de cluster feeding
    const clusterInsight = this.detectClusterFeeding(stats.hourlyCounts);
    if (clusterInsight) insights.push(clusterInsight);

    // 4. Insight de mamadas noturnas
    const nightInsight = this.checkNightFeeding(stats.hourlyCounts);
    if (nightInsight) insights.push(nightInsight);

    // 5. Insight de complemento
    if (stats.totalComplementMlRange > 0) {
      const complementInsight = this.checkComplementTrend(stats.complementMlPerDay);
      if (complementInsight) insights.push(complementInsight);
    }

    // 6. Insight de encorajamento para mãe de primeira viagem
    if (babyContext?.notes) {
      const encouragementInsight = this.checkFirstTimeMom(babyContext.notes);
      if (encouragementInsight) insights.push(encouragementInsight);
    }

    return insights;
  }

  /**
   * Verifica equilíbrio dos seios
   */
  private static checkBreastBalance(distribution: BreastSideDistribution): Insight | null {
    const total = distribution.left + distribution.right + distribution.both;
    if (total === 0) return null;

    const left = distribution.left;
    const right = distribution.right;
    const both = distribution.both;

    const difference = Math.abs(left - right);
    const average = (left + right) / 2;
    const percentageDiff = average > 0 ? (difference / average) : 0;

    if (percentageDiff < 0.2) {
      return {
        id: 'breast_balance_good',
        type: 'positive',
        message: `Você está alternando bem os seios! ${left} mamadas no esquerdo, ${right} no direito e ${both} nos dois. Continuar alternando ajuda a manter a produção equilibrada. 💚`,
        warnAboutMedical: false,
      };
    } else if (percentageDiff > 0.4) {
      const moreUsed = left > right ? 'esquerdo' : 'direito';
      const lessUsed = left > right ? 'direito' : 'esquerdo';
      return {
        id: 'breast_balance_uneven',
        type: 'tip',
        message: `Notamos que você tem usado mais o seio ${moreUsed} que o ${lessUsed} (${left} esquerdo vs ${right} direito). Tente começar a próxima mamada pelo seio que foi menos usado - isso ajuda a estimular ambos igualmente. 💡`,
        warnAboutMedical: false,
      };
    }

    return null;
  }

  /**
   * Verifica frequência de mamadas
   */
  private static checkFeedingFrequency(count24h: number, ageInDays?: number): Insight | null {
    // Para recém-nascidos (0-3 meses), esperado é 8-12 mamadas por dia
    const isNewborn = !ageInDays || ageInDays <= 90;

    if (isNewborn) {
      if (count24h >= 8 && count24h <= 14) {
        return {
          id: 'frequent_feeding_normal',
          type: 'positive',
          message: `Seu bebê mamou ${count24h} vezes nas últimas 24h. Isso está dentro do esperado para a idade dele! 🌟`,
          warnAboutMedical: false,
        };
      } else if (count24h < 6) {
        return {
          id: 'low_feeding_attention',
          type: 'warning',
          message: `Foram registradas apenas ${count24h} mamadas nas últimas 24h. Bebês dessa idade costumam mamar mais vezes. Vale conversar com a pediatra para ter certeza de que está tudo bem. 💙`,
          warnAboutMedical: true,
        };
      } else if (count24h > 14) {
        return {
          id: 'very_frequent_feeding',
          type: 'neutral',
          message: `Seu bebê mamou ${count24h} vezes nas últimas 24h. Isso pode ser normal, especialmente em períodos de crescimento acelerado. Se estiver preocupada, converse com a pediatra. 💙`,
          warnAboutMedical: false,
        };
      }
    }

    return null;
  }

  /**
   * Detecta cluster feeding
   */
  private static detectClusterFeeding(hourlyCounts: number[]): Insight | null {
    // Verifica se há 3+ mamadas consecutivas em janela de 4 horas
    for (let i = 0; i <= hourlyCounts.length - 4; i++) {
      const window = hourlyCounts.slice(i, i + 4);
      const totalInWindow = window.reduce((sum, count) => sum + count, 0);
      
      if (totalInWindow >= 3) {
        return {
          id: 'cluster_feeding_detected',
          type: 'neutral',
          message: 'Notamos que seu bebê está mamando várias vezes seguidas em alguns períodos do dia. Isso é chamado de "cluster feeding" e é completamente normal - é assim que ele estimula sua produção! 💪',
          warnAboutMedical: false,
        };
      }
    }

    return null;
  }

  /**
   * Verifica mamadas noturnas
   */
  private static checkNightFeeding(hourlyCounts: number[]): Insight | null {
    // Horários noturnos: 22h às 6h (índices 22, 23, 0, 1, 2, 3, 4, 5, 6)
    const nightHours = [
      ...hourlyCounts.slice(22), // 22h, 23h
      ...hourlyCounts.slice(0, 7), // 0h-6h
    ];
    const nightTotal = nightHours.reduce((sum, count) => sum + count, 0);

    if (nightTotal > 0) {
      return {
        id: 'night_feeding_normal',
        type: 'neutral',
        message: 'Seu bebê está mamando de madrugada. Isso é esperado e importante para a produção de leite - o hormônio prolactina está em níveis mais altos durante a noite. É cansativo, mas é temporário. Você está fazendo um ótimo trabalho! 🌙',
        warnAboutMedical: false,
      };
    }

    return null;
  }

  /**
   * Verifica tendência de complemento
   */
  private static checkComplementTrend(complementMlPerDay: number[]): Insight | null {
    if (complementMlPerDay.length < 3) return null;

    // Calcula tendência (redução de >20% na semana)
    const firstHalf = complementMlPerDay.slice(0, Math.floor(complementMlPerDay.length / 2));
    const secondHalf = complementMlPerDay.slice(Math.floor(complementMlPerDay.length / 2));

    const avgFirst = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    if (avgFirst > 0 && avgSecond < avgFirst * 0.8) {
      const reduction = ((avgFirst - avgSecond) / avgFirst * 100).toFixed(0);
      return {
        id: 'complement_reducing',
        type: 'positive',
        message: `Ótima notícia! A quantidade de complemento vem diminuindo ao longo da semana (redução de ~${reduction}%). Isso pode indicar que sua produção está aumentando. Continue amamentando sob demanda! 🎉`,
        warnAboutMedical: false,
      };
    } else if (avgFirst > 0 && avgSecond === avgFirst) {
      return {
        id: 'complement_stable',
        type: 'neutral',
        message: 'A quantidade de complemento está estável. Se seu objetivo é reduzir, converse com a pediatra sobre estratégias para aumentar a produção. 💙',
        warnAboutMedical: false,
      };
    }

    return null;
  }

  /**
   * Insight para mãe de primeira viagem
   */
  private static checkFirstTimeMom(notes: string): Insight | null {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('primeira viagem') || lowerNotes.includes('insegura') || lowerNotes.includes('inseguro')) {
      return {
        id: 'first_time_mom_encouragement',
        type: 'positive',
        message: 'Lembre-se: você está aprendendo junto com seu bebê, e isso é completamente normal. A amamentação pode levar algumas semanas para "encaixar". Você está fazendo o melhor que pode! 💚',
        warnAboutMedical: false,
      };
    }

    return null;
  }
}
