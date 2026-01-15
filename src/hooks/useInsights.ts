// Olive Baby Web - useInsights Hook
// Gera insights acolhedores baseados nos dados do bebê

import { useMemo } from 'react';
import type { BabyStats } from '../types';

interface Insight {
  id: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'extraction' | 'general';
  emoji: string;
  title: string;
  message: string;
  tone: 'positive' | 'neutral' | 'attention';
}

interface UseInsightsReturn {
  insights: Insight[];
  welcomeMessage: string;
}

export function useInsights(stats: BabyStats | null, babyName?: string): UseInsightsReturn {
  const insights = useMemo(() => {
    if (!stats) return [];

    const result: Insight[] = [];

    // Insights de sono
    if (stats.sleep) {
      const sleepHours = Math.round(stats.sleep.totalMinutes / 60 * 10) / 10;
      
      if (sleepHours >= 8) {
        result.push({
          id: 'sleep-good',
          type: 'sleep',
          emoji: '😴',
          title: 'Sono excelente!',
          message: `${babyName || 'Seu bebê'} dormiu ${sleepHours}h nas últimas 24h — dentro do esperado para a idade. Isso ajuda muito no desenvolvimento.`,
          tone: 'positive',
        });
      } else if (sleepHours >= 5) {
        result.push({
          id: 'sleep-moderate',
          type: 'sleep',
          emoji: '🌙',
          title: 'Sono moderado',
          message: `${sleepHours}h de sono nas últimas 24h. Se notar muito choro ou irritação, tente criar um ambiente mais escuro e silencioso.`,
          tone: 'neutral',
        });
      } else if (sleepHours > 0) {
        result.push({
          id: 'sleep-attention',
          type: 'sleep',
          emoji: '💤',
          title: 'Sono reduzido',
          message: `${sleepHours}h de sono registradas. Não se preocupe demais — cada bebê tem seu ritmo. Observe se há algum desconforto.`,
          tone: 'attention',
        });
      }

      // Insight sobre número de cochilos
      if (stats.sleep.count > 0) {
        result.push({
          id: 'sleep-naps',
          type: 'sleep',
          emoji: '🛏️',
          title: 'Padrão de cochilos',
          message: `${stats.sleep.count} período(s) de sono hoje. Cochilos frequentes são normais e importantes para bebês.`,
          tone: 'positive',
        });
      }
    }

    // Insights de alimentação
    if (stats.feeding) {
      const feedingMinutes = stats.feeding.totalMinutes;
      const feedingCount = stats.feeding.count;

      if (feedingCount >= 6 && feedingCount <= 12) {
        result.push({
          id: 'feeding-count-good',
          type: 'feeding',
          emoji: '🍼',
          title: 'Alimentação no ritmo certo',
          message: `${feedingCount} alimentações hoje — um ritmo ótimo! Cada alimentação fortalece o vínculo e garante nutrição adequada.`,
          tone: 'positive',
        });
      } else if (feedingCount > 12) {
        result.push({
          id: 'feeding-count-high',
          type: 'feeding',
          emoji: '🤱',
          title: 'Demanda aumentada',
          message: `${feedingCount} alimentações hoje — pode ser um salto de desenvolvimento ou necessidade de conforto. Você está atendendo seu bebê com amor.`,
          tone: 'neutral',
        });
      } else if (feedingCount > 0 && feedingCount < 6) {
        result.push({
          id: 'feeding-count-low',
          type: 'feeding',
          emoji: '🍼',
          title: 'Alimentações registradas',
          message: `${feedingCount} alimentação(ões) registrada(s). Se estiver amamentando exclusivamente, ofereça o seio sempre que o bebê demonstrar sinais de fome.`,
          tone: 'neutral',
        });
      }

      // Duração média
      if (feedingCount > 0) {
        const avgMinutes = Math.round(feedingMinutes / feedingCount);
        if (avgMinutes >= 10 && avgMinutes <= 30) {
          result.push({
            id: 'feeding-duration',
            type: 'feeding',
            emoji: '⏱️',
            title: 'Duração consistente',
            message: `Média de ${avgMinutes} minutos por alimentação — tempo adequado para uma boa nutrição.`,
            tone: 'positive',
          });
        }
      }

      // Complemento
      if (stats.feeding.complementMl && stats.feeding.complementMl > 0) {
        result.push({
          id: 'feeding-complement',
          type: 'feeding',
          emoji: '🍶',
          title: 'Uso de complemento',
          message: `${stats.feeding.complementMl}ml de complemento hoje. Não se culpe — você está atendendo as necessidades do seu bebê da melhor forma.`,
          tone: 'neutral',
        });
      }
    }

    // Insights de fralda
    if (stats.diaper) {
      const diaperCount = stats.diaper.count;
      
      if (diaperCount >= 6) {
        result.push({
          id: 'diaper-good',
          type: 'diaper',
          emoji: '🚼',
          title: 'Hidratação adequada',
          message: `${diaperCount} trocas de fralda — sinal positivo de boa hidratação e alimentação.`,
          tone: 'positive',
        });
      } else if (diaperCount >= 3) {
        result.push({
          id: 'diaper-moderate',
          type: 'diaper',
          emoji: '👶',
          title: 'Trocas registradas',
          message: `${diaperCount} trocas de fralda hoje. Continue observando o padrão normal do seu bebê.`,
          tone: 'neutral',
        });
      } else if (diaperCount > 0 && diaperCount < 3) {
        result.push({
          id: 'diaper-attention',
          type: 'diaper',
          emoji: '💧',
          title: 'Atenção às fraldas',
          message: `${diaperCount} troca(s) registrada(s). Se notar diminuição importante, converse com o pediatra.`,
          tone: 'attention',
        });
      }
    }

    // Insights de extração
    if (stats.extraction && stats.extraction.totalMl > 0) {
      result.push({
        id: 'extraction-recorded',
        type: 'extraction',
        emoji: '🤱',
        title: 'Extração de leite',
        message: `${stats.extraction.totalMl}ml extraídos hoje. Cada gota é preciosa — não compare com outras mães, cada corpo é único.`,
        tone: 'positive',
      });
    }

    // Insights gerais (se não tiver dados ou poucos)
    if (result.length === 0) {
      result.push({
        id: 'general-start',
        type: 'general',
        emoji: '💛',
        title: 'Comece a registrar',
        message: 'Registre as rotinas do seu bebê para receber insights personalizados e acompanhar o desenvolvimento.',
        tone: 'neutral',
      });
    }

    return result;
  }, [stats, babyName]);

  // Mensagem de boas-vindas baseada na hora do dia
  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    const name = babyName ? ` de ${babyName}` : '';
    
    if (hour >= 5 && hour < 12) {
      return `Bom dia! ☀️ Como foi a noite${name}?`;
    } else if (hour >= 12 && hour < 18) {
      return `Boa tarde! 🌤️ Como está sendo o dia${name}?`;
    } else {
      return `Boa noite! 🌙 Você está fazendo um ótimo trabalho${name ? ` cuidando ${name}` : ''}.`;
    }
  }, [babyName]);

  return {
    insights,
    welcomeMessage,
  };
}
