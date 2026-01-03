// Olive Baby Web - Settings Page
import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  Settings,
  User,
  Baby,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { cn } from '../../lib/utils';

const settingsMenu = [
  { path: '/settings/profile', icon: User, label: 'Meu Perfil', description: 'Dados pessoais e conta' },
  { path: '/settings/babies', icon: Baby, label: 'Bebês', description: 'Gerenciar bebês cadastrados' },
  { path: '/settings/billing', icon: CreditCard, label: 'Assinatura', description: 'Plano e pagamentos' },
  { path: '/settings/notifications', icon: Bell, label: 'Notificações', description: 'Alertas e lembretes' },
  { path: '/settings/privacy', icon: Shield, label: 'Privacidade', description: 'Segurança e dados' },
  { path: '/settings/appearance', icon: Palette, label: 'Aparência', description: 'Tema e personalização' },
  { path: '/settings/help', icon: HelpCircle, label: 'Ajuda', description: 'Suporte e FAQ' },
];

export function SettingsPage() {
  const location = useLocation();
  
  // If at /settings root, show the menu
  if (location.pathname === '/settings') {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-olive-600" />
            Configurações
          </h1>
          <p className="text-gray-500">Gerencie sua conta e preferências</p>
        </div>

        <div className="grid gap-3">
          {settingsMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-olive-300 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                <item.icon className="w-6 h-6 text-olive-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Otherwise, render the nested route
  return <Outlet />;
}
