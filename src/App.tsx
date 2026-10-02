import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/ui/useTheme";

// Code splitting: cada página vira um chunk carregado sob demanda
const Index = lazy(() => import("./pages/Index"));
const Flights = lazy(() => import("./pages/Flights"));
const Ranking = lazy(() => import("./pages/Ranking"));
const History = lazy(() => import("./pages/History"));
const Goals = lazy(() => import("./pages/Goals"));
const Financial = lazy(() => import("./pages/Financial"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/Login").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/Signup").then(m => ({ default: m.SignupPage })));
const EmailConfirmationPage = lazy(() => import("./pages/EmailConfirmation"));
const SuperDiagnostic = lazy(() => import("./pages/super-diagnostic"));
const Diagnostic = lazy(() => import("./pages/Diagnostic"));
const RealTimeTracking = lazy(() => import("./pages/RealTimeTracking"));
const FlightMaps = lazy(() => import("./pages/FlightMaps"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Purchases = lazy(() => import("./pages/Purchases"));
const FinancialReports = lazy(() => import("./pages/FinancialReports"));
const Reports = lazy(() => import("./pages/Reports"));
const Companies = lazy(() => import("./pages/Companies"));
const TodCalculatorPage = lazy(() => import("./pages/TodCalculator"));
const FlightPlannerPage = lazy(() => import("./pages/FlightPlanner"));
const AirportSearchTool = lazy(() => import("./pages/AirportSearchTool"));
const ResponsiveTest = lazy(() => import("./pages/ResponsiveTest"));
const AuthCallback = lazy(() => import("./pages/AuthCallback").then(m => ({ default: m.AuthCallback })));

// Fallback HUD para troca de rota
const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Carregando">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        Carregando…
      </p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 hud-hero-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  // Inicializar tema
  useTheme();
  
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/confirm-email" element={<EmailConfirmationPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/super-diagnostic" element={<SuperDiagnostic />} />
          <Route path="/test-responsive" element={<ResponsiveTest />} />

          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Index />} />
            <Route path="flights" element={<Flights />} />
            <Route path="realtime" element={<RealTimeTracking />} />
            <Route path="maps" element={<FlightMaps />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="history" element={<History />} />
            <Route path="goals" element={<Goals />} />
            <Route path="financial" element={<Financial />} />
            <Route path="manutencao" element={<Maintenance />} />
            <Route path="compras" element={<Purchases />} />
            <Route path="relatorios-financeiros" element={<FinancialReports />} />
            <Route path="reports" element={<Reports />} />
            <Route path="companies" element={<Companies />} />
            <Route path="tod-calculator" element={<TodCalculatorPage />} />
            <Route path="flight-planner" element={<FlightPlannerPage />} />
            <Route path="airport-search" element={<AirportSearchTool />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
