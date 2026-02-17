// Olive Baby Web - Formulário de Informações Clínicas (alergias, condições)
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { clinicalInfoService } from '../../services/api';

interface Allergy {
  substance: string;
  reaction?: string;
}

interface Condition {
  name: string;
  notes?: string;
}

interface ClinicalInfoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: number;
  initialData?: {
    allergies?: Allergy[];
    chronicConditions?: Condition[];
    familyHistory?: string;
    feedingNotes?: string;
  };
  onSuccess: () => void;
}

export function ClinicalInfoFormModal({ isOpen, onClose, babyId, initialData, onSuccess }: ClinicalInfoFormModalProps) {
  const { success, error: showError } = useToast();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [familyHistory, setFamilyHistory] = useState('');
  const [feedingNotes, setFeedingNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const allergiesData = initialData.allergies as Allergy[] | undefined;
      const conditionsData = initialData.chronicConditions;
      setAllergies(allergiesData?.length ? allergiesData : [{ substance: '', reaction: '' }]);
      setConditions(
        conditionsData?.length
          ? Array.isArray(conditionsData) && conditionsData[0] && typeof conditionsData[0] === 'object' && 'name' in (conditionsData[0] as object)
            ? (conditionsData as Condition[])
            : (conditionsData as unknown as string[]).map((c) => ({ name: c, notes: '' }))
          : [{ name: '', notes: '' }]
      );
      setFamilyHistory(initialData.familyHistory || '');
      setFeedingNotes(initialData.feedingNotes || '');
    } else if (isOpen) {
      setAllergies([{ substance: '', reaction: '' }]);
      setConditions([{ name: '', notes: '' }]);
      setFamilyHistory('');
      setFeedingNotes('');
    }
  }, [isOpen, initialData]);

  const addAllergy = () => setAllergies((p) => [...p, { substance: '', reaction: '' }]);
  const removeAllergy = (i: number) => setAllergies((p) => p.filter((_, idx) => idx !== i));
  const updateAllergy = (i: number, field: keyof Allergy, value: string) => {
    setAllergies((p) => {
      const n = [...p];
      n[i] = { ...n[i], [field]: value };
      return n;
    });
  };

  const addCondition = () => setConditions((p) => [...p, { name: '', notes: '' }]);
  const removeCondition = (i: number) => setConditions((p) => p.filter((_, idx) => idx !== i));
  const updateCondition = (i: number, field: keyof Condition, value: string) => {
    setConditions((p) => {
      const n = [...p];
      n[i] = { ...n[i], [field]: value };
      return n;
    });
  };

  const onSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        allergies: allergies.filter((a) => a.substance.trim()).map((a) => ({ substance: a.substance.trim(), reaction: a.reaction?.trim() || undefined })),
        chronicConditions: conditions.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), notes: c.notes?.trim() || undefined })),
        familyHistory: familyHistory.trim() || undefined,
        feedingNotes: feedingNotes.trim() || undefined,
      };

      const res = await clinicalInfoService.upsert(babyId, payload);
      if (res.success) {
        success('Informações salvas', 'Dados clínicos atualizados');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showError('Erro', e.response?.data?.message || 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border border-olive-200 bg-olive-50/30 rounded-xl p-4 mb-4 animate-in slide-in-from-top duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Informações clínicas</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 transition">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alergias</label>
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addAllergy}>
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {allergies.map((a, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <Input
                  placeholder="Substância"
                  value={a.substance}
                  onChange={(e) => updateAllergy(i, 'substance', e.target.value)}
                />
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Reação"
                    value={a.reaction || ''}
                    onChange={(e) => updateAllergy(i, 'reaction', e.target.value)}
                    className="flex-1"
                  />
                  {allergies.length > 1 && (
                    <button type="button" onClick={() => removeAllergy(i)} className="text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condições crônicas</label>
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addCondition}>
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {conditions.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <Input
                  placeholder="Condição"
                  value={c.name}
                  onChange={(e) => updateCondition(i, 'name', e.target.value)}
                />
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Observações"
                    value={c.notes || ''}
                    onChange={(e) => updateCondition(i, 'notes', e.target.value)}
                    className="flex-1"
                  />
                  {conditions.length > 1 && (
                    <button type="button" onClick={() => removeCondition(i)} className="text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Histórico familiar</label>
          <textarea
            value={familyHistory}
            onChange={(e) => setFamilyHistory(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Doenças na família..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alimentação</label>
          <textarea
            value={feedingNotes}
            onChange={(e) => setFeedingNotes(e.target.value)}
            rows={2}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Observações sobre alimentação..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit} isLoading={saving}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}
