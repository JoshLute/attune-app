import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentPage from "./pages/StudentPage";
import { AttuneSidebar } from "./components/sidebar/AttuneSidebar";
import AnalyticsPage from "./pages/AnalyticsPage";
import RecordingPage from "./pages/RecordingPage";

// Placeholder pages for navigation
const CollaborationPage = () => (
  <div className="flex h-screen bg-white">
    <AttuneSidebar />
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))] mb-6">Collaboration</h1>
        <div className="rounded-3xl p-8 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
          <p className="text-gray-600">This page is under construction.</p>
        </div>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
