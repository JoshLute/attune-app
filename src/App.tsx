
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Placeholder pages for navigation
const CollaborationPage = () => (
  <div className="flex h-screen bg-white">
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-6">Collaboration Page</h1>
      <p>This page is under construction.</p>
    </div>
  </div>
);

const AnalyticsPage = () => (
  <div className="flex h-screen bg-white">
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Page</h1>
      <p>This page is under construction.</p>
    </div>
  </div>
);

const RecordingPage = () => (
  <div className="flex h-screen bg-white">
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-6">Start New Recording</h1>
      <p>This page is under construction.</p>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
