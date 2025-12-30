// Olive Baby Web - Routine Meta Utilities
// Sanitização e validação dos campos meta por tipo de rotina

import type { RoutineType } from '../types';

// ====== Tipos específicos de Meta por Rotina ======

export interface FeedingMetaFields {
  feedingType?: 'breast' | 'bottle' | 'solid';
  breastSide?: 'left' | 'right' | 'both';
  complement?: 'yes' | 'no';
  complementType?: 'formula' | 'breast_milk' | 'other';
  complementMl?: number;
  bottleMl?: number;
  bottleMilkType?: 'breast_milk' | 'formula' | 'mixed';
  bottleContent?: 'breast_milk' | 'formula' | 'mixed';
  solidFoods?: string | string[];
  solidDescription?: string;
}

export interface SleepMetaFields {
  location?: string;
  environment?: string;
  quality?: 'good' | 'regular' | 'bad';
  sleepQuality?: 'good' | 'regular' | 'bad';
  wokeUpTimes?: number;
}

export interface DiaperMetaFields {
  diaperType?: 'pee' | 'poop' | 'both';
  consistency?: 'liquid' | 'pasty' | 'solid';
  color?: string;
}

export interface BathMetaFields {
  waterTemperature?: number;
  bathTemperature?: number;
  hairWashed?: boolean;
  productsUsed?: string[];
  products?: string[];
}

export interface ExtractionMetaFields {
  extractionType?: 'manual' | 'electric';
  extractionMethod?: 'manual' | 'electric';
  breastSide?: 'left' | 'right' | 'both';
  quantityMl?: number;
  extractionMl?: number;
}

export type RoutineMetaByType = {
  FEEDING: FeedingMetaFields;
  SLEEP: SleepMetaFields;
  DIAPER: DiaperMetaFields;
  BATH: BathMetaFields;
  MILK_EXTRACTION: ExtractionMetaFields;
};

// ====== Whitelist de campos permitidos ======

export const ALLOWED_META_FIELDS: Record<RoutineType, string[]> = {
  FEEDING: [
    'feedingType',
    'breastSide',
    'complement',
    'complementType',
    'complementMl',
    'bottleMl',
    'bottleMilkType',
    'bottleContent',
    'solidFoods',
    'solidDescription',
  ],
  SLEEP: [
    'location',
    'environment',
    'quality',
    'sleepQuality',
    'wokeUpTimes',
  ],
  DIAPER: [
    'diaperType',
    'consistency',
    'color',
  ],
  BATH: [
    'waterTemperature',
    'bathTemperature',
    'hairWashed',
    'productsUsed',
    'products',
  ],
  MILK_EXTRACTION: [
    'extractionType',
    'extractionMethod',
    'breastSide',
    'quantityMl',
    'extractionMl',
  ],
};

// ====== Funções de sanitização ======

/**
 * Sanitiza o objeto meta removendo campos não permitidos para o tipo de rotina
 */
export function sanitizeRoutineMeta<T extends RoutineType>(
  routineType: T,
  meta: Record<string, unknown> | null | undefined
): RoutineMetaByType[T] {
  if (!meta || typeof meta !== 'object') {
    return {} as RoutineMetaByType[T];
  }

  const allowedFields = ALLOWED_META_FIELDS[routineType] || [];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }

  return sanitized as RoutineMetaByType[T];
}

/**
 * Aplica regras de negócio específicas para FEEDING
 */
export function normalizeFeedingMeta(meta: FeedingMetaFields): FeedingMetaFields {
  const result = { ...meta };
  const feedingType = result.feedingType;
  const complement = result.complement;

  // Se não for amamentação, remover breastSide
  if (feedingType !== 'breast') {
    delete result.breastSide;
  }

  // Se não for mamadeira, remover campos de mamadeira
  if (feedingType !== 'bottle') {
    delete result.bottleMl;
    delete result.bottleMilkType;
    delete result.bottleContent;
  }

  // Se não for sólidos, remover campos de sólidos
  if (feedingType !== 'solid') {
    delete result.solidFoods;
    delete result.solidDescription;
  }

  // Se complement não for 'yes', remover campos de complemento
  if (complement !== 'yes') {
    delete result.complementType;
    delete result.complementMl;
  }

  return result;
}

/**
 * Aplica regras de negócio específicas para DIAPER
 */
export function normalizeDiaperMeta(meta: DiaperMetaFields): DiaperMetaFields {
  const result = { ...meta };
  const diaperType = result.diaperType;

  // Se for apenas xixi, remover campos de consistência e cor
  if (diaperType === 'pee') {
    delete result.consistency;
    delete result.color;
  }

  return result;
}

/**
 * Normaliza e sanitiza o meta completo baseado no tipo de rotina
 */
export function normalizeAndSanitizeMeta<T extends RoutineType>(
  routineType: T,
  meta: Record<string, unknown> | null | undefined
): RoutineMetaByType[T] {
  let sanitized = sanitizeRoutineMeta(routineType, meta);

  switch (routineType) {
    case 'FEEDING':
      sanitized = normalizeFeedingMeta(sanitized as FeedingMetaFields) as RoutineMetaByType[T];
      break;
    case 'DIAPER':
      sanitized = normalizeDiaperMeta(sanitized as DiaperMetaFields) as RoutineMetaByType[T];
      break;
  }

  return sanitized;
}

// ====== Funções de validação ======

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida timestamps de início e fim
 */
export function validateTimeRange(
  startTime: string | Date,
  endTime: string | Date | undefined | null,
  routineType: RoutineType
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!startTime) {
    errors.push({ field: 'startTime', message: 'Data/hora de início é obrigatória' });
    return errors;
  }

  const start = new Date(startTime);
  
  if (isNaN(start.getTime())) {
    errors.push({ field: 'startTime', message: 'Data/hora de início inválida' });
    return errors;
  }

  // Para DIAPER, não precisa de endTime
  if (routineType === 'DIAPER') {
    return errors;
  }

  if (endTime) {
    const end = new Date(endTime);
    
    if (isNaN(end.getTime())) {
      errors.push({ field: 'endTime', message: 'Data/hora de término inválida' });
      return errors;
    }

    if (end < start) {
      errors.push({ 
        field: 'endTime', 
        message: 'Data/hora de término deve ser igual ou posterior à de início' 
      });
    }
  }

  return errors;
}

/**
 * Valida campos meta específicos por tipo de rotina
 */
export function validateRoutineMeta<T extends RoutineType>(
  routineType: T,
  meta: RoutineMetaByType[T]
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (routineType) {
    case 'FEEDING': {
      const feedingMeta = meta as FeedingMetaFields;
      if (!feedingMeta.feedingType) {
        errors.push({ field: 'feedingType', message: 'Tipo de alimentação é obrigatório' });
      }
      
      if (feedingMeta.feedingType === 'breast' && !feedingMeta.breastSide) {
        errors.push({ field: 'breastSide', message: 'Lado do peito é obrigatório para amamentação' });
      }
      
      if (feedingMeta.complement === 'yes' && !feedingMeta.complementMl && feedingMeta.complementMl !== 0) {
        errors.push({ field: 'complementMl', message: 'Quantidade do complemento é obrigatória' });
      }
      
      if (feedingMeta.bottleMl !== undefined && feedingMeta.bottleMl < 0) {
        errors.push({ field: 'bottleMl', message: 'Quantidade da mamadeira deve ser positiva' });
      }
      break;
    }
    
    case 'DIAPER': {
      const diaperMeta = meta as DiaperMetaFields;
      if (!diaperMeta.diaperType) {
        errors.push({ field: 'diaperType', message: 'Tipo de fralda é obrigatório' });
      }
      break;
    }
    
    case 'MILK_EXTRACTION': {
      const extractionMeta = meta as ExtractionMetaFields;
      const method = extractionMeta.extractionMethod || extractionMeta.extractionType;
      if (!method) {
        errors.push({ field: 'extractionMethod', message: 'Método de extração é obrigatório' });
      }
      
      const quantity = extractionMeta.extractionMl || extractionMeta.quantityMl;
      if (quantity !== undefined && quantity < 0) {
        errors.push({ field: 'extractionMl', message: 'Quantidade extraída deve ser positiva' });
      }
      break;
    }

    case 'BATH': {
      const bathMeta = meta as BathMetaFields;
      const temp = bathMeta.bathTemperature || bathMeta.waterTemperature;
      if (temp !== undefined && (temp < 20 || temp > 50)) {
        errors.push({ field: 'bathTemperature', message: 'Temperatura deve estar entre 20°C e 50°C' });
      }
      break;
    }

    case 'SLEEP': {
      const sleepMeta = meta as SleepMetaFields;
      if (sleepMeta.wokeUpTimes !== undefined && sleepMeta.wokeUpTimes < 0) {
        errors.push({ field: 'wokeUpTimes', message: 'Número de vezes que acordou deve ser positivo' });
      }
      break;
    }
  }

  return errors;
}

// ====== Funções auxiliares ======

/**
 * Prepara o payload para a API PATCH /routines/log/:id
 * Remove campos proibidos e mantém apenas os permitidos
 */
export function prepareUpdatePayload(
  routineType: RoutineType,
  data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  }
): {
  startTime?: string;
  endTime?: string;
  notes?: string;
  meta?: Record<string, unknown>;
} {
  const payload: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  } = {};

  // Campos de tempo (sempre ISO string)
  if (data.startTime) {
    payload.startTime = new Date(data.startTime).toISOString();
  }
  if (data.endTime) {
    payload.endTime = new Date(data.endTime).toISOString();
  }

  // Notes
  if (data.notes !== undefined) {
    payload.notes = data.notes;
  }

  // Meta - sanitizar baseado no tipo
  if (data.meta) {
    payload.meta = normalizeAndSanitizeMeta(routineType, data.meta) as Record<string, unknown>;
  }

  return payload;
}

/**
 * Para DIAPER: espelha startTime em endTime pois é um registro instantâneo
 */
export function prepareDiaperPayload(
  data: {
    dateTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  }
): {
  startTime?: string;
  endTime?: string;
  notes?: string;
  meta?: Record<string, unknown>;
} {
  const payload: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  } = {};

  // Para DIAPER, startTime = endTime
  if (data.dateTime) {
    const isoTime = new Date(data.dateTime).toISOString();
    payload.startTime = isoTime;
    payload.endTime = isoTime;
  }

  if (data.notes !== undefined) {
    payload.notes = data.notes;
  }

  if (data.meta) {
    payload.meta = normalizeAndSanitizeMeta('DIAPER', data.meta) as Record<string, unknown>;
  }

  return payload;
}

// ====== Labels e opções para UI ======

export const FEEDING_TYPES = [
  { value: 'breast', label: 'Amamentação' },
  { value: 'bottle', label: 'Mamadeira' },
  { value: 'solid', label: 'Sólidos' },
] as const;

export const BREAST_SIDES = [
  { value: 'left', label: 'Esquerdo', emoji: '⬅️' },
  { value: 'right', label: 'Direito', emoji: '➡️' },
  { value: 'both', label: 'Ambos', emoji: '↔️' },
] as const;

export const BOTTLE_CONTENTS = [
  { value: 'breast_milk', label: 'Leite materno' },
  { value: 'formula', label: 'Fórmula' },
  { value: 'mixed', label: 'Misto' },
] as const;

export const COMPLEMENT_TYPES = [
  { value: 'formula', label: 'Fórmula' },
  { value: 'breast_milk', label: 'Leite materno' },
  { value: 'other', label: 'Outro' },
] as const;

export const SLEEP_QUALITIES = [
  { value: 'good', label: 'Bom', emoji: '😴' },
  { value: 'regular', label: 'Regular', emoji: '😐' },
  { value: 'bad', label: 'Ruim', emoji: '😫' },
] as const;

export const DIAPER_TYPES = [
  { value: 'pee', label: 'Xixi', emoji: '💧' },
  { value: 'poop', label: 'Cocô', emoji: '💩' },
  { value: 'both', label: 'Ambos', emoji: '💧💩' },
] as const;

export const DIAPER_CONSISTENCIES = [
  { value: 'liquid', label: 'Líquido', emoji: '💧' },
  { value: 'pasty', label: 'Pastoso', emoji: '🥄' },
  { value: 'solid', label: 'Sólido', emoji: '🟤' },
] as const;

export const DIAPER_COLORS = [
  { value: 'yellow', label: 'Amarelo', color: 'bg-yellow-400' },
  { value: 'brown', label: 'Marrom', color: 'bg-amber-700' },
  { value: 'green', label: 'Verde', color: 'bg-green-600' },
  { value: 'black', label: 'Preto', color: 'bg-gray-900' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-600' },
  { value: 'white', label: 'Branco', color: 'bg-gray-200' },
] as const;

export const BATH_PRODUCTS = [
  { value: 'shampoo', label: 'Shampoo', emoji: '🧴' },
  { value: 'soap', label: 'Sabonete', emoji: '🧼' },
  { value: 'moisturizer', label: 'Hidratante', emoji: '🧴' },
  { value: 'oil', label: 'Óleo', emoji: '💧' },
] as const;

export const EXTRACTION_METHODS = [
  { value: 'manual', label: 'Manual' },
  { value: 'electric', label: 'Elétrica' },
] as const;

/**
 * Retorna o label do tipo de rotina
 */
export function getRoutineTypeLabel(routineType: RoutineType): string {
  const labels: Record<RoutineType, string> = {
    FEEDING: 'Alimentação',
    SLEEP: 'Sono',
    DIAPER: 'Fralda',
    BATH: 'Banho',
    MILK_EXTRACTION: 'Extração de Leite',
  };
  return labels[routineType] || routineType;
}

