// Olive Baby Web - Main App Component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute, DashboardLayout, BabyInitializer } from './components/layout';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ActivateProfessionalPage, AcceptInvitePage } from './pages/auth';

// Onboarding
import { OnboardingPage } from './pages/onboarding';

// Dashboard Pages
import { DashboardPage } from './pages/dashboard';

// Growth & Milestones
import { GrowthPage } from './pages/growth';
import { MilestonesPage } from './pages/milestones';

// Export Page
import { ExportPage } from './pages/export';

// Settings Pages
import { SettingsPage, ProfilePage, BabiesPage, NotificationsPage, BabyMembersPage, PrivacyPage, AppearancePage, HelpPage } from './pages/settings';

// Team Page
import { TeamPage } from './pages/team';

// Assistant Page
import { AssistantPage } from './pages/assistant';

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
      cacheTime: 1000 * 60 * 10, // 10 minutes - cache mantido por 10 min
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <BabyInitializer>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invite/accept" element={<AcceptInvitePage />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

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

            {/* Export */}
            <Route
              path="/export"
              element={
                <ProtectedRoute>
                  <ExportPage />
                </ProtectedRoute>
              }
            />

            {/* Team */}
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <TeamPage />
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
              path="/settings/help"
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </BabyInitializer>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
