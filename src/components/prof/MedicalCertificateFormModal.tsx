// Olive Baby Web - Formulário de Atestado
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { medicalCertificateService } from '../../services/api';
import { format } from 'date-fns';

const CERT_TYPES = [
  { value: 'ATESTADO', label: 'Atestado médico' },
  { value: 'DECLARACAO_VACINA', label: 'Declaração de vacina' },
  { value: 'DECLARACAO_CRECHE', label: 'Declaração para creche' },
] as const;

const schema = z.object({
  type: z.enum(['ATESTADO', 'DECLARACAO_VACINA', 'DECLARACAO_CRECHE']),
  validFrom: z.string().min(1, 'Data inicial é obrigatória'),
  validUntil: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
});

type FormData = z.infer<typeof schema>;

interface MedicalCertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: number;
  babyName?: string;
  onSuccess: () => void;
}

export function MedicalCertificateFormModal({ isOpen, onClose, babyId, babyName, onSuccess }: MedicalCertificateFormModalProps) {
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'ATESTADO',
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      content: '',
    },
  });

  const certType = watch('type');

  const defaultContent = {
    ATESTADO: `Atesto para os devidos fins que o(a) paciente ${babyName || '[nome]'}, esteve sob meus cuidados médicos, necessitando de afastamento de suas atividades por __ dias, a partir de ${format(new Date(), 'dd/MM/yyyy')}.`,
    DECLARACAO_VACINA: `Declaro que o(a) paciente ${babyName || '[nome]'} encontra-se em dia com as vacinas do calendário nacional de imunização, conforme cartão de vacinação.`,
    DECLARACAO_CRECHE: `Declaro que o(a) paciente ${babyName || '[nome]'} está apto(a) a frequentar creche/escola, não apresentando condições que impeçam a convivência em ambiente coletivo.`,
  };

  const fillTemplate = () => {
    reset((prev) => ({
      ...prev,
      content: defaultContent[certType],
    }));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        type: data.type,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
        content: data.content,
      };

      const res = await medicalCertificateService.create(babyId, payload);
      if (res.success) {
        success('Documento criado', 'Atestado/declaração salvo com sucesso');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showError('Erro', e.response?.data?.message || 'Falha ao salvar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo atestado / declaração" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select
            {...register('type')}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            {CERT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Válido de"
            type="date"
            {...register('validFrom')}
            error={errors.validFrom?.message}
          />
          <Input label="Válido até" type="date" {...register('validUntil')} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo</label>
            <Button type="button" variant="ghost" size="sm" onClick={fillTemplate}>
              Usar modelo
            </Button>
          </div>
          <textarea
            {...register('content')}
            rows={6}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Digite o texto do atestado/declaração..."
          />
          {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Gerar documento</Button>
        </div>
      </form>
    </Modal>
  );
}
