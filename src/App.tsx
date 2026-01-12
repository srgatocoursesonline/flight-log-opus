import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/ui/useTheme";
import Index from "./pages/Index";
import Flights from "./pages/Flights";
import Ranking from "./pages/Ranking";
import History from "./pages/History";
import Goals from "./pages/Goals";
import Financial from "./pages/Financial";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import EmailConfirmationPage from "./pages/EmailConfirmation";
import SuperDiagnostic from "./pages/super-diagnostic";
import Diagnostic from "./pages/Diagnostic";
import RealTimeTracking from "./pages/RealTimeTracking";
import FlightMaps from "./pages/FlightMaps";
import Maintenance from "./pages/Maintenance";
import Purchases from "./pages/Purchases";
import FinancialReports from "./pages/FinancialReports";
import Reports from "./pages/Reports";
import Companies from "./pages/Companies";
import TodCalculatorPage from "./pages/TodCalculator";
import FlightPlannerPage from "./pages/FlightPlanner";
import AirportSearchTool from "./pages/AirportSearchTool";
import ResponsiveTest from "./pages/ResponsiveTest";
import { AuthCallback } from "./pages/AuthCallback";


const queryClient = new QueryClient();

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950">
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
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
