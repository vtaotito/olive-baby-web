// Olive Baby Web - Main App Component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './theme';
import { ProtectedRoute, DashboardLayout, BabyInitializer, AdminRoute, SessionGuard, ProfessionalRoute, ProfessionalLayout } from './components/layout';
import { PWAProvider } from './components/pwa';
import { useAuthStore } from './stores/authStore';

// Landing Page
import { LandingPage } from './pages/landing';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ActivateProfessionalPage, AcceptInvitePage } from './pages/auth';

// Admin Pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminBabiesPage,
  AdminUsagePage,
  AdminActivationPage,
  AdminMonetizationPage,
  AdminQualityPage,
  AdminErrorsPage,
  AdminAlertsPage,
  AdminSettingsPage,
} from './pages/admin';

// Onboarding removido - usuário vai direto para dashboard

// Dashboard Pages
import { DashboardPage } from './pages/dashboard';

// Growth & Milestones
import { GrowthPage } from './pages/growth';
import { MilestonesPage } from './pages/milestones';

// Vaccines
import { VaccinesPage } from './pages/vaccines';

// Export Page
import { ExportPage } from './pages/export';

// Settings Pages
import { SettingsPage, ProfilePage, BabiesPage, BillingPage, NotificationsPage, BabyMembersPage, ShareBabyPage, PrivacyPage, AppearancePage, HelpPage } from './pages/settings';

// Admin Billing and AI Pages
import { AdminBillingPage } from './pages/admin/AdminBillingPage';
import { AdminAiAssistantPage } from './pages/admin/AdminAiAssistantPage';

// Team/Share - redireciona para ShareBabyPage unificado

// Assistant Page
import { AssistantPage } from './pages/assistant';

// Professional Portal (prontuário, agenda, white-label)
import {
  ProfDashboardPage,
  ProfAgendaPage,
  ProfPatientsPage,
  ProfPatientChartPage,
  ProfInvitesPage,
  ProfSettingsPage,
} from './pages/prof';

// Routine Trackers
import {
  FeedingTracker,
  SleepTracker,
  DiaperTracker,
  BathTracker,
  ExtractionTracker,
} from './components/routines';

// Feeding Dashboard
import { FeedingDashboardPage } from './pages/feeding/FeedingDashboardPage';

// Routines Dashboard
import { RoutinesDashboardPage } from './pages/routines';

// Create a client com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - dados considerados frescos por 5 min
      gcTime: 1000 * 60 * 10, // 10 minutes - cache mantido por 10 min (anteriormente cacheTime)
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      refetchOnReconnect: true, // Refetch apenas ao reconectar
      refetchOnMount: true, // Refetch ao montar componente
      retry: 1, // Apenas 1 tentativa em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
    },
    mutations: {
      retry: 0, // Mutations não devem retry automaticamente
    },
  },
});

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

/**
 * Retorna o redirect correto baseado na role do usuário autenticado
 */
function getHomeForRole(role?: string): string {
  if (!role) return '/login';
  if (role === 'ADMIN') return '/admin';
  if (PROFESSIONAL_ROLES.includes(role)) return '/prof/dashboard';
  return '/dashboard';
}

/**
 * Componente para a rota "/" - Landing page OU redirect baseado na role
 */
function HomeRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  return <LandingPage />;
}

/**
 * Componente para rota "*" - redirect inteligente baseado na role
 */
function CatchAllRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <PWAProvider>
          <BrowserRouter>
            <SessionGuard>
            <BabyInitializer>
            <Routes>
            {/* Home: Landing page para visitantes, redirect baseado em role para logados */}
            <Route path="/" element={<HomeRoute />} />
            
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invite/accept" element={<AcceptInvitePage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Routine Trackers */}
            <Route
              path="/routines"
              element={
                <ProtectedRoute>
                  <RoutinesDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/feeding"
              element={
                <ProtectedRoute>
                  <FeedingTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feeding/dashboard"
              element={
                <ProtectedRoute>
                  <FeedingDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/sleep"
              element={
                <ProtectedRoute>
                  <SleepTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/diaper"
              element={
                <ProtectedRoute>
                  <DiaperTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/bath"
              element={
                <ProtectedRoute>
                  <BathTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines/extraction"
              element={
                <ProtectedRoute>
                  <ExtractionTracker />
                </ProtectedRoute>
              }
            />

            {/* Growth & Milestones */}
            <Route
              path="/growth"
              element={
                <ProtectedRoute>
                  <GrowthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/milestones"
              element={
                <ProtectedRoute>
                  <MilestonesPage />
                </ProtectedRoute>
              }
            />

            {/* Vaccines */}
            <Route
              path="/vaccines"
              element={
                <ProtectedRoute>
                  <VaccinesPage />
                </ProtectedRoute>
              }
            />

            {/* Export */}
            <Route
              path="/export"
              element={
                <ProtectedRoute>
                  <ExportPage />
                </ProtectedRoute>
              }
            />

            {/* Compartilhar / Convites (unificado no ShareBabyPage) */}
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <ShareBabyPage />
                </ProtectedRoute>
              }
            />

            {/* AI Assistant */}
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AssistantPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Settings Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/babies"
              element={
                <ProtectedRoute>
                  <BabiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/babies/:babyId/members"
              element={
                <ProtectedRoute>
                  <BabyMembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/babies/:babyId/share"
              element={
                <ProtectedRoute>
                  <ShareBabyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/privacy"
              element={
                <ProtectedRoute>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/appearance"
              element={
                <ProtectedRoute>
                  <AppearancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/billing"
              element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/help"
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/babies"
              element={
                <AdminRoute>
                  <AdminBabiesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/usage"
              element={
                <AdminRoute>
                  <AdminUsagePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/activation"
              element={
                <AdminRoute>
                  <AdminActivationPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/monetization"
              element={
                <AdminRoute>
                  <AdminMonetizationPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/quality"
              element={
                <AdminRoute>
                  <AdminQualityPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/errors"
              element={
                <AdminRoute>
                  <AdminErrorsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/alerts"
              element={
                <AdminRoute>
                  <AdminAlertsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <AdminRoute>
                  <AdminBillingPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ai-assistant"
              element={
                <AdminRoute>
                  <AdminAiAssistantPage />
                </AdminRoute>
              }
            />

            {/* Professional Portal Routes (prontuário, agenda, white-label) */}
            <Route
              path="/prof/dashboard"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfDashboardPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />
            <Route
              path="/prof/agenda"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfAgendaPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />
            <Route
              path="/prof/patients"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfPatientsPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />
            <Route
              path="/prof/patients/:babyId"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfPatientChartPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />
            <Route
              path="/prof/invites"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfInvitesPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />
            <Route
              path="/prof/settings"
              element={
                <ProfessionalRoute>
                  <ProfessionalLayout>
                    <ProfSettingsPage />
                  </ProfessionalLayout>
                </ProfessionalRoute>
              }
            />

            {/* Catch-all: redirect inteligente baseado na role */}
            <Route path="*" element={<CatchAllRoute />} />
          </Routes>
            </BabyInitializer>
            </SessionGuard>
          </BrowserRouter>
          </PWAProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
