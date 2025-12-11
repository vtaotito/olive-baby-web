// Olive Baby Web - Dashboard Page
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Baby,
  Utensils,
  Moon,
  Droplets,
  Bath,
  Milk,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Spinner } from '../../components/ui';
import { StatsChart } from '../../components/charts';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { formatAge, formatTimeBR, formatDateBR, getTimeAgo } from '../../lib/utils';
import type { BabyStats, RoutineLog } from '../../types';

const routineCards = [
  { type: 'feeding', label: 'Alimentação', icon: Utensils, color: 'bg-yellow-100 text-yellow-700', path: '/routines/feeding' },
  { type: 'sleep', label: 'Sono', icon: Moon, color: 'bg-blue-100 text-blue-700', path: '/routines/sleep' },
  { type: 'diaper', label: 'Fralda', icon: Droplets, color: 'bg-green-100 text-green-700', path: '/routines/diaper' },
  { type: 'bath', label: 'Banho', icon: Bath, color: 'bg-purple-100 text-purple-700', path: '/routines/bath' },
  { type: 'extraction', label: 'Extração', icon: Milk, color: 'bg-pink-100 text-pink-700', path: '/routines/extraction' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { babies, selectedBaby, stats, fetchBabies, selectBaby, fetchStats, isLoading } = useBabyStore();
  const [recentActivities, setRecentActivities] = useState<RoutineLog[]>([]);

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  useEffect(() => {
    if (babies.length > 0 && !selectedBaby) {
      selectBaby(babies[0]);
    }
  }, [babies, selectedBaby, selectBaby]);

  useEffect(() => {
    if (selectedBaby) {
      fetchStats(selectedBaby.id);
    }
  }, [selectedBaby, fetchStats]);

  // Generate chart data from stats
  const generateWeeklyData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const labels: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(days[date.getDay()]);
    }
    
    // Mock data - in production this would come from the API
    return {
      labels,
      feeding: labels.map(() => Math.floor(Math.random() * 8) + 4),
      sleep: labels.map(() => Math.random() * 4 + 10),
    };
  };

  const weeklyData = generateWeeklyData();

  if (isLoading && babies.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // If no babies, redirect to onboarding
  if (!isLoading && babies.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-24 h-24 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Baby className="w-12 h-12 text-olive-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Olive Baby!
          </h2>
          <p className="text-gray-600 mb-8">
            Cadastre seu primeiro bebê para começar a acompanhar o desenvolvimento.
          </p>
          <Button onClick={() => navigate('/onboarding')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Bebê
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.caregiver?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Selected Baby Info */}
      {selectedBaby && (
        <Card className="mb-6 bg-gradient-to-br from-olive-50 to-white">
          <CardBody className="flex items-center gap-4">
            <div className="w-16 h-16 bg-olive-200 rounded-full flex items-center justify-center text-2xl">
              👶
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedBaby.name}</h2>
              <p className="text-gray-500">
                {formatAge(new Date(selectedBaby.birthDate))}
              </p>
            </div>
            <Link to="/settings/babies" className="text-olive-600 hover:text-olive-700">
              <ChevronRight className="w-6 h-6" />
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Atividade</h3>
        <div className="grid grid-cols-5 gap-3">
          {routineCards.map((routine) => (
            <button
              key={routine.type}
              onClick={() => navigate(routine.path)}
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-olive-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${routine.color}`}>
                <routine.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">{routine.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Utensils className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.today?.feedingCount || 0}</p>
              <p className="text-xs text-gray-500">Alimentações hoje</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Moon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.today?.sleepMinutes ? Math.round(stats.today.sleepMinutes / 60) : 0}h
              </p>
              <p className="text-xs text-gray-500">Sono hoje</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.today?.diaperCount || 0}</p>
              <p className="text-xs text-gray-500">Fraldas hoje</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bath className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.today?.bathCount || 0}</p>
              <p className="text-xs text-gray-500">Banhos hoje</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader title="Alimentações da Semana" />
          <CardBody>
            <StatsChart
              type="bar"
              labels={weeklyData.labels}
              datasets={[
                {
                  label: 'Alimentações',
                  data: weeklyData.feeding,
                  backgroundColor: 'rgba(234, 179, 8, 0.6)',
                  borderColor: 'rgb(234, 179, 8)',
                },
              ]}
              height={200}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Sono da Semana (horas)" />
          <CardBody>
            <StatsChart
              type="line"
              labels={weeklyData.labels}
              datasets={[
                {
                  label: 'Horas de sono',
                  data: weeklyData.sleep,
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  fill: true,
                },
              ]}
              height={200}
            />
          </CardBody>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/growth">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-olive-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Crescimento</h4>
                <p className="text-sm text-gray-500">Peso e altura</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardBody>
          </Card>
        </Link>
        <Link to="/milestones">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-baby-purple rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Marcos</h4>
                <p className="text-sm text-gray-500">Desenvolvimento</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardBody>
          </Card>
        </Link>
        <Link to="/routines">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-baby-blue rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Histórico</h4>
                <p className="text-sm text-gray-500">Ver atividades</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardBody>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
