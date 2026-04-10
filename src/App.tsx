// Olive Baby Web - Main App Component
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './theme';
import { ProtectedRoute, DashboardLayout, BabyInitializer, AdminRoute, SessionGuard, ProfessionalRoute, ProfessionalLayout, ScrollToTop } from './components/layout';
import { PWAProvider } from './components/pwa';
import { useAuthStore } from './stores/authStore';

// Critical path: Landing, Auth, Dashboard (eagerly loaded for fast LCP)
import { LandingPage, ProfLandingPage, OliveAssistantPage } from './pages/landing';
import { shouldShowB2BLanding } from './lib/landingRouter';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ActivateProfessionalPage, AcceptInvitePage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';

// Public Legal Pages (small, public-facing, SEO-critical)
import { PublicPrivacyPage } from './pages/legal/PrivacyPage';
import { PublicTermsPage } from './pages/legal/TermsPage';

// Lazy-loaded: Admin Pages (only for admins)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminBabiesPage = lazy(() => import('./pages/admin/AdminBabiesPage').then(m => ({ default: m.AdminBabiesPage })));
const AdminUsagePage = lazy(() => import('./pages/admin/AdminUsagePage').then(m => ({ default: m.AdminUsagePage })));
const AdminActivationPage = lazy(() => import('./pages/admin/AdminActivationPage').then(m => ({ default: m.AdminActivationPage })));
const AdminMonetizationPage = lazy(() => import('./pages/admin/AdminMonetizationPage').then(m => ({ default: m.AdminMonetizationPage })));
const AdminQualityPage = lazy(() => import('./pages/admin/AdminQualityPage').then(m => ({ default: m.AdminQualityPage })));
const AdminErrorsPage = lazy(() => import('./pages/admin/AdminErrorsPage').then(m => ({ default: m.AdminErrorsPage })));
const AdminAlertsPage = lazy(() => import('./pages/admin/AdminAlertsPage').then(m => ({ default: m.AdminAlertsPage })));
const AdminCommunicationsPage = lazy(() => import('./pages/admin/AdminCommunicationsPage').then(m => ({ default: m.AdminCommunicationsPage })));
const AdminJourneysPage = lazy(() => import('./pages/admin/AdminJourneysPage').then(m => ({ default: m.AdminJourneysPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminBillingPage = lazy(() => import('./pages/admin/AdminBillingPage').then(m => ({ default: m.AdminBillingPage })));
const AdminAiAssistantPage = lazy(() => import('./pages/admin/AdminAiAssistantPage').then(m => ({ default: m.AdminAiAssistantPage })));
const AdminAdsPage = lazy(() => import('./pages/admin/AdminAdsPage').then(m => ({ default: m.AdminAdsPage })));
const AdminAdsCampaignsPage = lazy(() => import('./pages/admin/AdminAdsCampaignsPage').then(m => ({ default: m.AdminAdsCampaignsPage })));
const AdminAdsAgentPage = lazy(() => import('./pages/admin/AdminAdsAgentPage').then(m => ({ default: m.AdminAdsAgentPage })));

// Lazy-loaded: Protected feature pages
const GrowthPage = lazy(() => import('./pages/growth').then(m => ({ default: m.GrowthPage })));
const MilestonesPage = lazy(() => import('./pages/milestones').then(m => ({ default: m.MilestonesPage })));
const VaccinesPage = lazy(() => import('./pages/vaccines').then(m => ({ default: m.VaccinesPage })));
const ExportPage = lazy(() => import('./pages/export').then(m => ({ default: m.ExportPage })));
const AssistantPage = lazy(() => import('./pages/assistant').then(m => ({ default: m.AssistantPage })));
const RoutinesDashboardPage = lazy(() => import('./pages/routines').then(m => ({ default: m.RoutinesDashboardPage })));
const FeedingDashboardPage = lazy(() => import('./pages/feeding/FeedingDashboardPage').then(m => ({ default: m.FeedingDashboardPage })));

// Lazy-loaded: Settings pages
const SettingsPage = lazy(() => import('./pages/settings').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/settings').then(m => ({ default: m.ProfilePage })));
const BabiesPage = lazy(() => import('./pages/settings').then(m => ({ default: m.BabiesPage })));
const BillingPage = lazy(() => import('./pages/settings').then(m => ({ default: m.BillingPage })));
const NotificationsPage = lazy(() => import('./pages/settings').then(m => ({ default: m.NotificationsPage })));
const BabyMembersPage = lazy(() => import('./pages/settings').then(m => ({ default: m.BabyMembersPage })));
const ShareBabyPage = lazy(() => import('./pages/settings').then(m => ({ default: m.ShareBabyPage })));
const PrivacyPage = lazy(() => import('./pages/settings').then(m => ({ default: m.PrivacyPage })));
const AppearancePage = lazy(() => import('./pages/settings').then(m => ({ default: m.AppearancePage })));
const HelpPage = lazy(() => import('./pages/settings').then(m => ({ default: m.HelpPage })));

// Lazy-loaded: Professional Portal
const ProfDashboardPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfDashboardPage })));
const ProfAgendaPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfAgendaPage })));
const ProfPatientsPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfPatientsPage })));
const ProfPatientChartPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfPatientChartPage })));
const ProfInvitesPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfInvitesPage })));
const ProfSettingsPage = lazy(() => import('./pages/prof').then(m => ({ default: m.ProfSettingsPage })));

// Lazy-loaded: Routine Trackers
const FeedingTracker = lazy(() => import('./components/routines').then(m => ({ default: m.FeedingTracker })));
const SleepTracker = lazy(() => import('./components/routines').then(m => ({ default: m.SleepTracker })));
const DiaperTracker = lazy(() => import('./components/routines').then(m => ({ default: m.DiaperTracker })));
const BathTracker = lazy(() => import('./components/routines').then(m => ({ default: m.BathTracker })));
const ExtractionTracker = lazy(() => import('./components/routines').then(m => ({ default: m.ExtractionTracker })));

function LazyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
        <p className="text-sm text-stone-500 dark:text-stone-400">Carregando...</p>
      </div>
    </div>
  );
}

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
 * Roteamento por domínio (prof.oliecare.cloud) e campanha (utm_campaign=prof, ref=prof)
 */
function HomeRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  if (shouldShowB2BLanding()) return <ProfLandingPage />;
  return <LandingPage />;
}

/**
 * Rota /para-profissionais - Landing B2B (sempre exibe ProfLandingPage para visitantes)
 */
function ProfLandingRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  return <ProfLandingPage />;
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
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <PWAProvider>
          <BrowserRouter>
            <ScrollToTop />
            <SessionGuard>
            <BabyInitializer>
            <Suspense fallback={<LazyFallback />}>
            <Routes>
            {/* Home: Landing page para visitantes, redirect baseado em role para logados */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/para-profissionais" element={<ProfLandingRoute />} />

            {/* Public: Olive Assistente (marketing page) */}
            <Route path="/olive-assistente" element={<OliveAssistantPage />} />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invite/accept" element={<AcceptInvitePage />} />

            {/* Legal Pages (public, SEO-indexed) */}
            <Route path="/privacidade" element={<PublicPrivacyPage />} />
            <Route path="/termos" element={<PublicTermsPage />} />

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
              path="/admin/communications"
              element={
                <AdminRoute>
                  <AdminCommunicationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/journeys"
              element={
                <AdminRoute>
                  <AdminJourneysPage />
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
            <Route
              path="/admin/ads"
              element={
                <AdminRoute>
                  <AdminAdsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ads/campaigns"
              element={
                <AdminRoute>
                  <AdminAdsCampaignsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ads/agent"
              element={
                <AdminRoute>
                  <AdminAdsAgentPage />
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
            </Suspense>
            </BabyInitializer>
            </SessionGuard>
          </BrowserRouter>
          </PWAProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
