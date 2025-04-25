
import React, { useState } from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LessonSummary } from "@/components/analytics/LessonSummary";
import { LessonSwitcher } from "@/components/analytics/LessonSwitcher";
import { PartsToReviewSection } from "@/components/analytics/PartsToReviewSection";
import { useSessionsContext } from "@/contexts/SessionsContext";
import { NotesSection } from '@/components/analytics/NotesSection';
import { useSessionDetails } from '@/hooks/useSessionsData';
import { SessionTranscript } from '@/components/analytics/SessionTranscript';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';

const AnalyticsPage = () => {
  const { sessions, isLoading } = useSessionsContext();
  // Use the first session as default if available
  const [selectedLessonId, setSelectedLessonId] = useState(sessions[0]?.id || "");
  const { toast } = useToast();

  const { events, insights, isLoading: detailsLoading } = useSessionDetails(selectedLessonId);
  
  // Find the selected session
  const selectedSession = sessions.find(session => session.id === selectedLessonId);

  // Format events for the chart
  const analyticsData = events
    .filter(event => event.event_type === 'transcript')
    .map(event => {
      // Find corresponding attention and understanding events with the nearest timestamp
      const timestamp = event.timestamp;
      const attentionEvent = events.find(e => 
        e.event_type === 'attention' && 
        Math.abs(new Date(e.timestamp).getTime() - new Date(timestamp).getTime()) < 5000
      );
      
      const understandingEvent = events.find(e => 
        e.event_type === 'understanding' && 
        Math.abs(new Date(e.timestamp).getTime() - new Date(timestamp).getTime()) < 5000
      );

      return {
        timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attention: attentionEvent?.value || 0,
        understanding: understandingEvent?.value || 0,
        transcript: event.content || ""
      };
    });

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your lesson summary report has been downloaded",
    });
  };
  
  if (isLoading || detailsLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If no sessions available, show a message
  if (sessions.length === 0) {
    return (
      <div className="flex h-screen bg-white">
        <AttuneSidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No sessions available</h1>
            <p>Create a new session to see analytics</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <AnalyticsHeader 
            selectedLessonId={selectedLessonId}
            onLessonChange={setSelectedLessonId}
            onDownloadReport={handleDownloadReport}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main column: chart and PartsToReviewSection */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Chart Area */}
              <AnalyticsChart 
                sessionTitle={selectedSession?.title || "No Session Selected"}
                analyticsData={analyticsData} 
              />
              {/* PartsToReviewSection directly below the chart */}
              <PartsToReviewSection analytics={analyticsData} className="mt-4" />
            </div>

            {/* Sidebar column (Notes and then LessonSummary) */}
            <div className="space-y-6 flex flex-col">
              <NotesSection />
              <LessonSummary
                understanding={selectedSession?.understanding_avg || 0}
                attention={selectedSession?.attention_avg || 0}
                summary={selectedSession?.summary || "No summary available"}
              />
            </div>
          </div>

          {/* Transcript full width at the bottom */}
          <SessionTranscript analyticsData={analyticsData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
