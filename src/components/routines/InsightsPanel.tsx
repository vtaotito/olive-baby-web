// Olive Baby Web - Insights Panel Component
import { Lightbulb, Heart, Moon, Utensils, Baby as BabyIcon, Droplets } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui';
import type { BabyStats, Baby } from '../../types';

interface InsightsPanelProps {
  stats: BabyStats | null;
  baby: Baby | null;
  isLoading?: boolean;
}

interface Insight {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  title: string;
  message: string;
  emoji: string;
}

// Calcular idade em meses
function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return months;
}

// Gerar insights baseados nos dados
function generateInsights(stats: BabyStats, ageInMonths: number): Insight[] {
  const insights: Insight[] = [];

  // Insight de sono
  const sleepHours = stats.sleep?.totalHoursToday || 0;
  const expectedSleep = ageInMonths < 3 ? 16 : ageInMonths < 6 ? 14 : ageInMonths < 12 ? 12 : 11;
  
  if (sleepHours >= expectedSleep * 0.8) {
    insights.push({
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      emoji: '😴',
      title: 'Sono',
      message: `Seu bebê dormiu ${sleepHours.toFixed(1)}h — ótimo para a idade! O sono adequado ajuda no desenvolvimento cerebral.`,
    });
  } else if (sleepHours > 0) {
    insights.push({
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      emoji: '💤',
      title: 'Sono',
      message: `${sleepHours.toFixed(1)}h de sono até agora. Bebês dessa idade precisam de ~${expectedSleep}h. Tente manter uma rotina calma antes de dormir.`,
    });
  }

  // Insight de alimentação
  const feedingCount = stats.feeding?.totalToday || 0;
  const expectedFeedings = ageInMonths < 3 ? 10 : ageInMonths < 6 ? 8 : 6;

  if (feedingCount >= 4) {
    insights.push({
      icon: Utensils,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      emoji: '🍼',
      title: 'Alimentação',
      message: `${feedingCount} mamadas hoje — ritmo ${feedingCount >= expectedFeedings * 0.8 ? 'excelente' : 'bom'}! Cada mamada é um momento de conexão.`,
    });
  }

  // Insight de fraldas
  const diaperCount = stats.diaper?.totalToday || 0;
  if (diaperCount >= 6) {
    insights.push({
      icon: BabyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      emoji: '✨',
      title: 'Hidratação',
      message: `${diaperCount} trocas de fralda — sinal de boa hidratação! Continue assim.`,
    });
  } else if (diaperCount > 0 && diaperCount < 4) {
    insights.push({
      icon: BabyIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      emoji: '💧',
      title: 'Hidratação',
      message: `${diaperCount} trocas até agora. Se notar diminuição importante, fale com o pediatra.`,
    });
  }

  // Insight de banho
  if (stats.bath?.totalToday && stats.bath.totalToday > 0) {
    insights.push({
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      emoji: '🛁',
      title: 'Banho',
      message: 'Banhinho feito! Um banho relaxante pode ajudar na rotina de sono.',
    });
  }

  // Insight de extração
  const extractionMl = stats.extraction?.totalMlToday || 0;
  if (extractionMl > 0) {
    insights.push({
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      emoji: '🤱',
      title: 'Extração',
      message: `${extractionMl}ml extraídos hoje. Cada gota conta! Variações são normais, não se compare.`,
    });
  }

  return insights;
}

export function InsightsPanel({ stats, baby, isLoading }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!stats || !baby) {
    return null;
  }

  const ageInMonths = getAgeInMonths(baby.birthDate);
  const insights = generateInsights(stats, ageInMonths);

  // Mensagem de acolhimento
  const welcomeMessages = [
    'Você está fazendo um ótimo trabalho hoje 💛',
    'O cansaço é real — esse painel está aqui para facilitar sua vida',
    'Cada dia é uma conquista, mamãe/papai!',
    'Você está indo muito bem. Respire fundo 💜',
  ];
  const welcomeMessage = welcomeMessages[new Date().getDate() % welcomeMessages.length];

  return (
    <Card className="border-olive-200 bg-gradient-to-br from-olive-50 to-white">
      <CardHeader 
        title={
          <span className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-olive-600" />
            Insights do Dia
          </span>
        }
        subtitle={welcomeMessage}
      />
      <CardBody className="p-6 pt-0">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Registre algumas rotinas para ver insights personalizados! 💛</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl ${insight.bgColor} border border-transparent hover:border-gray-200 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xl">{insight.emoji}</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${insight.color}`}>{insight.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dica do dia */}
        <div className="mt-6 p-4 bg-lavender-50 rounded-xl border border-lavender-100">
          <div className="flex items-center gap-2 text-lavender-700">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Dica do dia</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lembre-se: você conhece seu bebê melhor do que ninguém. Confie nos seus instintos! 💜
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
