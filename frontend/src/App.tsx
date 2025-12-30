import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import StudioPage from "./pages/StudioPage";
import FeedbackPage from "./pages/FeedbackPage";
import GuidePage from "./pages/GuidePage";
import LegalPage from "./pages/LegalPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to handle redirect after sign-in
// Component to handle redirect after sign-in
const AuthRedirect = () => {
    // Logic removed to allow users to stay on Landing page
    return null;
};

const App = () => {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is on, show maintenance page
  if (isMaintenanceMode) {
    return (
      <ThemeProvider>
        <MaintenancePage />
      </ThemeProvider>
    );
  }

  // Normal app
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
              <BrowserRouter>
              <ScrollToTop />
              <AuthRedirect />
              <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/studio" element={<StudioPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

