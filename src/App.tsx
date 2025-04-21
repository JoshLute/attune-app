import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import { SessionsProvider } from "./contexts/SessionsContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentPage from "./pages/StudentPage";
import CollaborationPage from "./pages/CollaborationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RecordingPage from "./pages/RecordingPage";

const App = () => {
  // Initialize QueryClient inside the component to ensure React context is available
  const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/collaboration" element={<CollaborationPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/recording" element={<RecordingPage />} />
              <Route path="/student/:studentId" element={<StudentPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SessionsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
