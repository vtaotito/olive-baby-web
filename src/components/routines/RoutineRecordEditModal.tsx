// Olive Baby Web - Routine Record Edit Modal Component
// Modal completo para editar registros de rotinas com campos meta específicos
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Button } from '../ui';
import type { RoutineLog, RoutineType } from '../../types';
import {
  prepareUpdatePayload,
  prepareDiaperPayload,
  validateTimeRange,
  validateRoutineMeta,
  normalizeAndSanitizeMeta,
  getRoutineTypeLabel,
  FEEDING_TYPES,
  BREAST_SIDES,
  BOTTLE_CONTENTS,
  COMPLEMENT_TYPES,
  SLEEP_QUALITIES,
  DIAPER_TYPES,
  DIAPER_CONSISTENCIES,
  DIAPER_COLORS,
  BATH_PRODUCTS,
  EXTRACTION_METHODS,
  type FeedingMetaFields,
  type SleepMetaFields,
  type DiaperMetaFields,
  type BathMetaFields,
  type ExtractionMetaFields,
} from '../../utils/routineMeta';
import { cn } from '../../lib/utils';
import { useTimezone } from '../../hooks';

// Schema base de validação
const baseEditSchema = z.object({
  startTime: z.string().min(1, 'Data/hora de início é obrigatória'),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

type BaseFormData = z.infer<typeof baseEditSchema>;

interface RoutineRecordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineLog;
  routineType: RoutineType;
  onSave: (data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  }) => void;
  isLoading?: boolean;
}

export function RoutineRecordEditModal({
  isOpen,
  onClose,
  routine,
  routineType,
  onSave,
  isLoading = false,
}: RoutineRecordEditModalProps) {
  // State para campos meta específicos
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [metaErrors, setMetaErrors] = useState<string[]>([]);
  
  // Timezone hook para conversão correta de horários
  const { fromUTC, toUTC } = useTimezone();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BaseFormData>({
    resolver: zodResolver(baseEditSchema),
  });

  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');

  // Inicializar form quando abrir
  useEffect(() => {
    if (isOpen && routine) {
      // Formatar data/hora para input datetime-local usando timezone do usuário
      const startDateTime = fromUTC(routine.startTime);
      const endDateTime = routine.endTime
        ? fromUTC(routine.endTime)
        : '';

      reset({
        startTime: startDateTime,
        endTime: endDateTime,
        notes: routine.notes || '',
      });

      // Inicializar meta
      setMeta((routine.meta as Record<string, unknown>) || {});
      setMetaErrors([]);
    }
  }, [isOpen, routine, reset, fromUTC]);

  // Handler de mudança de campo meta
  const handleMetaChange = (field: string, value: unknown) => {
    setMeta((prev) => {
      const newMeta = { ...prev, [field]: value };
      // Normalizar baseado nas regras de negócio
      return normalizeAndSanitizeMeta(routineType, newMeta) as Record<string, unknown>;
    });
  };

  const onSubmit = (data: BaseFormData) => {
    // Validar tempo
    const timeErrors = validateTimeRange(data.startTime, data.endTime, routineType);
    if (timeErrors.length > 0) {
      setMetaErrors(timeErrors.map((e) => e.message));
      return;
    }

    // Validar meta
    const normalizedMeta = normalizeAndSanitizeMeta(routineType, meta) as Record<string, unknown>;
    const metaValidationErrors = validateRoutineMeta(routineType, normalizedMeta as any);
    if (metaValidationErrors.length > 0) {
      setMetaErrors(metaValidationErrors.map((e) => e.message));
      return;
    }

    setMetaErrors([]);

    // Converter horários do timezone do usuário para UTC
    const startTimeUTC = toUTC(data.startTime);
    const endTimeUTC = data.endTime ? toUTC(data.endTime) : undefined;

    // Preparar payload com horários em UTC
    let payload;
    if (routineType === 'DIAPER') {
      payload = prepareDiaperPayload({
        dateTime: startTimeUTC,
        notes: data.notes,
        meta: normalizedMeta,
      });
    } else {
      payload = prepareUpdatePayload(routineType, {
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        notes: data.notes,
        meta: normalizedMeta,
      });
    }

    onSave(payload);
  };

  // Renderizar campos meta específicos por tipo
  const renderMetaFields = () => {
    switch (routineType) {
      case 'FEEDING':
        return renderFeedingFields();
      case 'SLEEP':
        return renderSleepFields();
      case 'DIAPER':
        return renderDiaperFields();
      case 'BATH':
        return renderBathFields();
      case 'MILK_EXTRACTION':
        return renderExtractionFields();
      default:
        return null;
    }
  };

  // ====== FEEDING Fields ======
  const renderFeedingFields = () => {
    const feedingMeta = meta as FeedingMetaFields;

    return (
      <div className="space-y-4">
        {/* Tipo de alimentação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Alimentação
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FEEDING_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleMetaChange('feedingType', type.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-all border-2',
                  feedingMeta.feedingType === type.value
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seio (apenas para amamentação) */}
        {feedingMeta.feedingType === 'breast' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lado do Seio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BREAST_SIDES.map((side) => (
                <button
                  key={side.value}
                  type="button"
                  onClick={() => handleMetaChange('breastSide', side.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm transition-all border-2 flex flex-col items-center',
                    feedingMeta.breastSide === side.value
                      ? 'border-olive-500 bg-olive-50 text-olive-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">{side.emoji}</span>
                  <span>{side.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campos de mamadeira */}
        {feedingMeta.feedingType === 'bottle' && (
          <>
            <Input
              label="Quantidade (ml)"
              type="number"
              min={0}
              value={feedingMeta.bottleMl || ''}
              onChange={(e) =>
                handleMetaChange('bottleMl', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Ex: 120"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo
              </label>
              <div className="flex gap-2 flex-wrap">
                {BOTTLE_CONTENTS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleMetaChange('bottleContent', opt.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-all',
                      (feedingMeta.bottleContent || feedingMeta.bottleMilkType) === opt.value
                        ? 'bg-olive-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Descrição de sólidos */}
        {feedingMeta.feedingType === 'solid' && (
          <Input
            label="Descrição da Refeição"
            value={(feedingMeta.solidDescription as string) || ''}
            onChange={(e) => handleMetaChange('solidDescription', e.target.value)}
            placeholder="Ex: Papinha de banana com aveia"
          />
        )}

        {/* Complemento (para amamentação) */}
        {feedingMeta.feedingType === 'breast' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={feedingMeta.complement === 'yes'}
                onChange={(e) =>
                  handleMetaChange('complement', e.target.checked ? 'yes' : 'no')
                }
                className="w-4 h-4 text-olive-600 rounded"
              />
              <span className="text-sm text-gray-700">Houve complemento?</span>
            </label>

            {feedingMeta.complement === 'yes' && (
              <div className="pl-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Complemento
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COMPLEMENT_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleMetaChange('complementType', opt.value)}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm transition-all',
                          feedingMeta.complementType === opt.value
                            ? 'bg-olive-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Quantidade do complemento (ml)"
                  type="number"
                  min={0}
                  value={feedingMeta.complementMl || ''}
                  onChange={(e) =>
                    handleMetaChange(
                      'complementMl',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 30"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ====== SLEEP Fields ======
  const renderSleepFields = () => {
    const sleepMeta = meta as SleepMetaFields;

    return (
      <div className="space-y-4">
        {/* Qualidade do sono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualidade do Sono
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SLEEP_QUALITIES.map((quality) => (
              <button
                key={quality.value}
                type="button"
                onClick={() => handleMetaChange('sleepQuality', quality.value)}
                className={cn(
                  'px-3 py-3 rounded-lg text-sm transition-all border-2 flex flex-col items-center',
                  (sleepMeta.sleepQuality || sleepMeta.quality) === quality.value
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-2xl mb-1">{quality.emoji}</span>
                <span>{quality.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vezes que acordou */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Acordou quantas vezes?
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                handleMetaChange('wokeUpTimes', Math.max(0, (sleepMeta.wokeUpTimes || 0) - 1))
              }
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              -
            </button>
            <span className="text-3xl font-bold text-gray-900 w-12 text-center">
              {sleepMeta.wokeUpTimes || 0}
            </span>
            <button
              type="button"
              onClick={() =>
                handleMetaChange('wokeUpTimes', (sleepMeta.wokeUpTimes || 0) + 1)
              }
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Local (opcional) */}
        <Input
          label="Local (opcional)"
          value={sleepMeta.location || ''}
          onChange={(e) => handleMetaChange('location', e.target.value)}
          placeholder="Ex: Berço, cama dos pais"
        />
      </div>
    );
  };

  // ====== DIAPER Fields ======
  const renderDiaperFields = () => {
    const diaperMeta = meta as DiaperMetaFields;

    return (
      <div className="space-y-4">
        {/* Tipo de fralda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Fralda
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIAPER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleMetaChange('diaperType', type.value)}
                className={cn(
                  'px-3 py-3 rounded-lg text-sm transition-all border-2 flex flex-col items-center',
                  diaperMeta.diaperType === type.value
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-2xl mb-1">{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Consistência e cor (apenas para cocô) */}
        {(diaperMeta.diaperType === 'poop' || diaperMeta.diaperType === 'both') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consistência
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIAPER_CONSISTENCIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleMetaChange('consistency', c.value)}
                    className={cn(
                      'px-3 py-3 rounded-lg text-sm transition-all border-2 flex flex-col items-center',
                      diaperMeta.consistency === c.value
                        ? 'border-olive-500 bg-olive-50 text-olive-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl mb-1">{c.emoji}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="grid grid-cols-6 gap-2">
                {DIAPER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleMetaChange('color', c.value)}
                    className={cn(
                      'w-10 h-10 rounded-full border-4 transition-all',
                      c.color,
                      diaperMeta.color === c.value
                        ? 'border-olive-500 ring-2 ring-olive-200'
                        : 'border-transparent'
                    )}
                    title={c.label}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecionado: {DIAPER_COLORS.find((c) => c.value === diaperMeta.color)?.label || 'Nenhum'}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  // ====== BATH Fields ======
  const renderBathFields = () => {
    const bathMeta = meta as BathMetaFields;
    const products = bathMeta.products || bathMeta.productsUsed || [];

    const toggleProduct = (product: string) => {
      const currentProducts = [...products];
      const index = currentProducts.indexOf(product);
      if (index > -1) {
        currentProducts.splice(index, 1);
      } else {
        currentProducts.push(product);
      }
      handleMetaChange('products', currentProducts);
    };

    return (
      <div className="space-y-4">
        {/* Temperatura da água */}
        <div className="flex items-center gap-3">
          <Input
            label="Temperatura da água (°C)"
            type="number"
            step="0.5"
            min={20}
            max={50}
            value={(bathMeta.bathTemperature || bathMeta.waterTemperature) ?? ''}
            onChange={(e) =>
              handleMetaChange(
                'bathTemperature',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="37"
            className="w-24"
          />
          <span className="text-sm text-gray-500 mt-6">Ideal: 36-37°C</span>
        </div>

        {/* Lavou cabelo */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bathMeta.hairWashed || false}
            onChange={(e) => handleMetaChange('hairWashed', e.target.checked)}
            className="w-4 h-4 text-olive-600 rounded"
          />
          <span className="text-sm text-gray-700">Lavou o cabelo?</span>
        </label>

        {/* Produtos utilizados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Produtos utilizados
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BATH_PRODUCTS.map((product) => (
              <button
                key={product.value}
                type="button"
                onClick={() => toggleProduct(product.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-all border-2 flex items-center gap-2',
                  products.includes(product.value)
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{product.emoji}</span>
                <span>{product.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ====== EXTRACTION Fields ======
  const renderExtractionFields = () => {
    const extractionMeta = meta as ExtractionMetaFields;

    return (
      <div className="space-y-4">
        {/* Método de extração */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Extração
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXTRACTION_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => handleMetaChange('extractionMethod', method.value)}
                className={cn(
                  'px-3 py-3 rounded-lg text-sm transition-all border-2',
                  (extractionMeta.extractionMethod || extractionMeta.extractionType) ===
                    method.value
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lado do peito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lado do Peito
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BREAST_SIDES.map((side) => (
              <button
                key={side.value}
                type="button"
                onClick={() => handleMetaChange('breastSide', side.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-all border-2 flex flex-col items-center',
                  extractionMeta.breastSide === side.value
                    ? 'border-olive-500 bg-olive-50 text-olive-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{side.emoji}</span>
                <span>{side.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantidade extraída */}
        <Input
          label="Quantidade extraída (ml)"
          type="number"
          min={0}
          value={(extractionMeta.extractionMl || extractionMeta.quantityMl) ?? ''}
          onChange={(e) =>
            handleMetaChange(
              'extractionMl',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          placeholder="Ex: 60"
        />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar ${getRoutineTypeLabel(routineType)}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Erros gerais */}
        {metaErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium mb-1">Erros de validação:</p>
            <ul className="text-red-700 text-sm list-disc list-inside">
              {metaErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Campos de data/hora */}
        {routineType === 'DIAPER' ? (
          <Input
            label="Data e Hora"
            type="datetime-local"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
        ) : (
          <>
            <Input
              label="Data e Hora de Início"
              type="datetime-local"
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <Input
              label="Data e Hora de Término"
              type="datetime-local"
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </>
        )}

        {/* Separator */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Detalhes do Registro
          </h4>
          {renderMetaFields()}
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 resize-none"
            placeholder="Adicione observações sobre este registro..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
