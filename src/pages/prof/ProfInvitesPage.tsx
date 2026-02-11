// Olive Baby Web - Professional Patient Invites Page
import { useEffect, useState, useCallback } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Search,
  Phone,
  Baby,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Spinner, Button, Input } from '../../components/ui';
import { patientInviteService } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ── Types ──────────────────────────────────────────────

interface PatientInvite {
  id: number;
  patientName: string;
  email: string;
  phone?: string | null;
  babyName?: string | null;
  message?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

// ── Form Schema ────────────────────────────────────────

const inviteSchema = z.object({
  patientName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  babyName: z.string().optional(),
  message: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

// ── Status helpers ─────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; bg: string }> = {
  PENDING: { label: 'Pendente', color: 'text-amber-600 dark:text-amber-400', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  ACCEPTED: { label: 'Aceito', color: 'text-green-600 dark:text-green-400', icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  EXPIRED: { label: 'Expirado', color: 'text-red-500 dark:text-red-400', icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  CANCELLED: { label: 'Cancelado', color: 'text-gray-500 dark:text-gray-400', icon: XCircle, bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color} ${config.bg} border`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────

export function ProfInvitesPage() {
  const [invites, setInvites] = useState<PatientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'>('all');
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientInviteService.list();
      if (res.success) {
        setInvites(res.data || []);
      }
    } catch {
      toastError('Erro', 'Falha ao carregar convites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  const handleResend = async (id: number) => {
    setResendingId(id);
    try {
      await patientInviteService.resend(id);
      toastSuccess('Reenviado', 'Convite reenviado com sucesso');
      fetchInvites();
    } catch (err: any) {
      toastError('Erro', err?.response?.data?.message || 'Falha ao reenviar');
    } finally {
      setResendingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await patientInviteService.cancel(id);
      toastSuccess('Cancelado', 'Convite cancelado com sucesso');
      fetchInvites();
    } catch (err: any) {
      toastError('Erro', err?.response?.data?.message || 'Falha ao cancelar');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Filter + Search ──

  const filteredInvites = invites
    .filter(inv => filter === 'all' || inv.status === filter)
    .filter(inv => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        inv.patientName.toLowerCase().includes(q) ||
        inv.email.toLowerCase().includes(q) ||
        inv.babyName?.toLowerCase().includes(q) ||
        inv.phone?.includes(q)
      );
    });

  // ── Stats ──

  const stats = {
    total: invites.length,
    pending: invites.filter(i => i.status === 'PENDING').length,
    accepted: invites.filter(i => i.status === 'ACCEPTED').length,
    expired: invites.filter(i => i.status === 'EXPIRED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Convites para Pacientes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Convide pacientes e famílias para acompanhar o desenvolvimento dos bebês no OlieCare
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          leftIcon={showForm ? <ChevronUp className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          className="shrink-0"
        >
          {showForm ? 'Fechar formulário' : 'Novo convite'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total enviados" value={stats.total} icon={Mail} color="blue" />
        <StatsCard label="Pendentes" value={stats.pending} icon={Clock} color="amber" />
        <StatsCard label="Aceitos" value={stats.accepted} icon={CheckCircle2} color="green" />
        <StatsCard label="Expirados" value={stats.expired} icon={AlertCircle} color="red" />
      </div>

      {/* Inline Form */}
      {showForm && (
        <InviteForm
          onSuccess={() => {
            setShowForm(false);
            fetchInvites();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'] as const).map((f) => {
            const labels: Record<string, string> = { all: 'Todos', PENDING: 'Pendentes', ACCEPTED: 'Aceitos', EXPIRED: 'Expirados', CANCELLED: 'Cancelados' };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-olive-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invites List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredInvites.length === 0 ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {invites.length === 0 ? 'Nenhum convite enviado' : 'Nenhum convite encontrado'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                {invites.length === 0
                  ? 'Envie convites para seus pacientes começarem a utilizar o OlieCare para acompanhar o desenvolvimento dos bebês.'
                  : 'Tente alterar os filtros ou o texto de busca.'}
              </p>
              {invites.length === 0 && (
                <Button onClick={() => setShowForm(true)} className="mt-4" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Enviar primeiro convite
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onResend={handleResend}
              onCancel={handleCancel}
              resending={resendingId === invite.id}
              cancelling={cancellingId === invite.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats Card ─────────────────────────────────────────

function StatsCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Mail; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
  };

  return (
    <Card>
      <CardBody className="!p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ── Invite Card ────────────────────────────────────────

function InviteCard({
  invite,
  onResend,
  onCancel,
  resending,
  cancelling,
}: {
  invite: PatientInvite;
  onResend: (id: number) => void;
  onCancel: (id: number) => void;
  resending: boolean;
  cancelling: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="!p-4 sm:!p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar + Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-olive-700 dark:text-olive-300">
                {invite.patientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{invite.patientName}</h3>
                <StatusBadge status={invite.status} />
              </div>
              <div className="mt-1 space-y-0.5">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{invite.email}</span>
                </p>
                {invite.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {invite.phone}
                  </p>
                )}
                {invite.babyName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 flex-shrink-0" />
                    {invite.babyName}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                Enviado em {format(new Date(invite.createdAt), 'dd/MM/yyyy HH:mm')}
                {invite.status === 'PENDING' && (
                  <> · Expira em {format(new Date(invite.expiresAt), 'dd/MM/yyyy')}</>
                )}
                {invite.acceptedAt && (
                  <> · Aceito em {format(new Date(invite.acceptedAt), 'dd/MM/yyyy HH:mm')}</>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          {invite.status === 'PENDING' && (
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResend(invite.id)}
                disabled={resending}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />}
              >
                {resending ? 'Enviando...' : 'Reenviar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(invite.id)}
                disabled={cancelling}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {cancelling ? '...' : 'Cancelar'}
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── Inline Form ────────────────────────────────────────

function InviteForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { patientName: '', email: '', phone: '', babyName: '', message: '' },
  });

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);
    try {
      await patientInviteService.create({
        patientName: data.patientName,
        email: data.email,
        phone: data.phone || undefined,
        babyName: data.babyName || undefined,
        message: data.message || undefined,
      });
      toastSuccess('Convite enviado', `Email de convite enviado para ${data.email}`);
      reset();
      onSuccess();
    } catch (err: any) {
      toastError('Erro', err?.response?.data?.message || 'Falha ao enviar convite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-olive-600 dark:text-olive-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Enviar novo convite</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          O paciente receberá um email com instruções para criar a conta e começar a usar o OlieCare.
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome do paciente / responsável *
              </label>
              <input
                {...register('patientName')}
                type="text"
                placeholder="Ex: Maria Silva"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent ${
                  errors.patientName ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.patientName && (
                <p className="text-xs text-red-500 mt-1">{errors.patientName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent ${
                  errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Telefone
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>

            {/* Baby Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome do bebê
              </label>
              <input
                {...register('babyName')}
                type="text"
                placeholder="Ex: João (opcional)"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              Mensagem personalizada (opcional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Escreva uma mensagem personalizada para o paciente..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none transition focus:ring-2 focus:ring-olive-500 focus:border-transparent ${
                errors.message ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting} leftIcon={<Send className="w-4 h-4" />}>
              {submitting ? 'Enviando...' : 'Enviar convite por email'}
            </Button>
            <Button variant="ghost" type="button" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
