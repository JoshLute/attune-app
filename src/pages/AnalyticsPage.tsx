
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

  // Format events for the chart by combining events at same timestamp
  const analyticsData = events.reduce((acc: any[], event) => {
    const timestamp = new Date(event.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Find or create entry for this timestamp
    let entry = acc.find(item => item.timestamp === timestamp);
    if (!entry) {
      entry = {
        timestamp,
        attention: null,
        understanding: null,
        transcript: ""
      };
      acc.push(entry);
    }

    // Update the entry based on event type, preserving existing values
    if (event.event_type === 'attention' && event.value !== null) {
      entry.attention = event.value;
    } else if (event.event_type === 'understanding' && event.value !== null) {
      entry.understanding = event.value;
    } else if (event.event_type === 'transcript') {
      entry.transcript = event.content || "";
    }

    console.log(`Processing event: ${event.event_type}, value: ${event.value}, timestamp: ${timestamp}`);
    console.log('Current entry:', entry);

    return acc;
  }, []);

  // Sort analyticsData by timestamp
  analyticsData.sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.timestamp}`).getTime();
    const timeB = new Date(`1970/01/01 ${b.timestamp}`).getTime();
    return timeA - timeB;
  });

  console.log('Final analytics data:', analyticsData);

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your lesson summary report has been downloaded",
    });
  };

  if (isLoading || detailsLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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

  // Find session start and end times
  const sessionStart = events.length > 0 ? events[0].timestamp : null;
  const sessionEnd = events.length > 0 ? events[events.length - 1].timestamp : null;

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
