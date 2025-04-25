import React, { useState, useEffect } from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LessonSummary } from "@/components/analytics/LessonSummary";
import { PartsToReviewSection } from "@/components/analytics/PartsToReviewSection";
import { useSessionsContext } from "@/contexts/SessionsContext";
import { NotesSection } from '@/components/analytics/NotesSection';
import { useSessionDetails } from '@/hooks/useSessionsData';
import { SessionTranscript } from '@/components/analytics/SessionTranscript';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const { sessions, isLoading } = useSessionsContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonParam = searchParams.get('lesson');
  
  // Use the first session as default if available, or the one from URL params
  const [selectedLessonId, setSelectedLessonId] = useState(lessonParam || sessions[0]?.id || "");
  
  // If the URL contains a lesson parameter but it's not set in state, update it
  useEffect(() => {
    if (lessonParam && lessonParam !== selectedLessonId) {
      setSelectedLessonId(lessonParam);
    }
  }, [lessonParam]);
  
  const { toast } = useToast();

  const { events, insights, tags, isLoading: detailsLoading } = useSessionDetails(selectedLessonId);
  
  // Find the selected session
  const selectedSession = sessions.find(session => session.id === selectedLessonId);

  // Format events for the chart with validation
  const analyticsData = events
    .filter(event => event.event_type === 'transcript' && event.content)
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
    return (
      <div className="flex h-screen bg-white">
        <AttuneSidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-2">Loading analytics...</h2>
            <p className="text-gray-500">Please wait while we fetch your session data.</p>
          </div>
        </div>
      </div>
    );
  }

  // If no sessions available, show a message with a button to start recording
  if (sessions.length === 0) {
    return (
      <div className="flex h-screen bg-white">
        <AttuneSidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold mb-2 text-[hsl(var(--attune-purple))]">No sessions available</h1>
            <p className="text-gray-600 mb-6">Record your first session to see analytics</p>
            <Link to="/recording">
              <Button className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-dark-purple))] text-lg py-6 px-8">
                Start Your First Recording
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Find session start and end times with validation
  const sessionStart = events.length > 0 ? events[0].timestamp : null;
  const sessionEnd = events.length > 0 ? events[events.length - 1].timestamp : null;

  // Show message if no events found for the selected session
  if (selectedLessonId && events.length === 0) {
    return (
      <div className="flex h-screen bg-white">
        <AttuneSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <AnalyticsHeader 
              selectedLessonId={selectedLessonId}
              onLessonChange={(id) => {
                setSelectedLessonId(id);
                navigate(`/analytics?lesson=${id}`);
              }}
              onDownloadReport={handleDownloadReport}
            />
            <div className="text-center mt-12">
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-2">No Data Available</h2>
              <p className="text-gray-500">No analytics data found for this session. Try selecting a different session or start a new recording.</p>
            </div>
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
            onLessonChange={(id) => {
              setSelectedLessonId(id);
              navigate(`/analytics?lesson=${id}`);
            }}
            onDownloadReport={handleDownloadReport}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main column: chart and PartsToReviewSection */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Chart Area */}
              <AnalyticsChart 
                sessionTitle={selectedSession?.title || "No Session Selected"}
                analyticsData={analyticsData}
                sessionTags={tags} 
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
                startTime={sessionStart}
                endTime={sessionEnd}
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
