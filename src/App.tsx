// Olive Baby Web - Main App Component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute, DashboardLayout } from './components/layout';

// Auth Pages
import { LoginPage, RegisterPage, ActivateProfessionalPage } from './pages/auth';

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
import { SettingsPage, ProfilePage, BabiesPage, NotificationsPage } from './pages/settings';

// Team Page
import { TeamPage } from './pages/team';

// Routine Trackers
import {
  FeedingTracker,
  SleepTracker,
  DiaperTracker,
  BathTracker,
  ExtractionTracker,
} from './components/routines';

// Placeholder Pages (to be implemented)
const RoutinesHistoryPage = () => (
  <DashboardLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Rotinas</h1>
      <p className="text-gray-500">Página em desenvolvimento...</p>
    </div>
  </DashboardLayout>
);

// Placeholder for other settings pages
const PlaceholderSettingsPage = ({ title }: { title: string }) => (
  <DashboardLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-500">Esta funcionalidade estará disponível em breve.</p>
    </div>
  </DashboardLayout>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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
                  <RoutinesHistoryPage />
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
              path="/settings/privacy"
              element={
                <ProtectedRoute>
                  <PlaceholderSettingsPage title="Privacidade e Segurança" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/appearance"
              element={
                <ProtectedRoute>
                  <PlaceholderSettingsPage title="Aparência" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/help"
              element={
                <ProtectedRoute>
                  <PlaceholderSettingsPage title="Ajuda e Suporte" />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
