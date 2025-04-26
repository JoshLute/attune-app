
import { toast } from "@/components/ui/sonner";
import { saveSessionData, generateSessionInsights } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useSessionsContext } from "@/contexts/SessionsContext";

interface SaveSessionHandlerProps {
  lessonTitle: string;
  transcript: string[];
  attentionHistory?: number[];
  understandingHistory?: number[];
}

// Helper function to backup data to localStorage
const backupSessionData = (data: SaveSessionHandlerProps) => {
  try {
    localStorage.setItem('session_backup', JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }));
    console.log('Session data backed up to localStorage', data);
  } catch (error) {
    console.error('Failed to backup session data to localStorage', error);
  }
};

// Helper function to retrieve backed up data
export const getBackupSessionData = (): SaveSessionHandlerProps | null => {
  try {
    const backup = localStorage.getItem('session_backup');
    if (!backup) return null;
    
    const data = JSON.parse(backup);
    return data;
  } catch (error) {
    console.error('Failed to retrieve session backup', error);
    return null;
  }
};

// Helper function to clear backup
export const clearBackupSessionData = () => {
  try {
    localStorage.removeItem('session_backup');
  } catch (error) {
    console.error('Failed to clear session backup', error);
  }
};

export const useSaveSession = () => {
  const navigate = useNavigate();
  const { refetchSessions } = useSessionsContext();

  const saveSession = async ({
    lessonTitle,
    transcript,
    attentionHistory = [],
    understandingHistory = [],
  }: SaveSessionHandlerProps) => {
    try {
      // Debug information about what we're trying to save
      console.log('Starting session save with data:', { 
        lessonTitle,
        transcriptCount: transcript.length,
        transcriptSamples: transcript.slice(0, 2),
        attentionPoints: attentionHistory.length,
        attentionSamples: attentionHistory.slice(0, 2),
        understandingPoints: understandingHistory.length,
        understandingSamples: understandingHistory.slice(0, 2)
      });

      // Validate data before saving
      if (!lessonTitle) {
        throw new Error("Lesson title is required");
      }

      // Prepare transcript data - handle both array and single string cases
      let processedTranscript: string[] = [];
      if (transcript.length === 0) {
        processedTranscript = ["No speech was detected during this recording."];
      } else if (transcript.length === 1 && typeof transcript[0] === 'string') {
        // If we have a single string, split it into sentences for better storage
        const sentences = transcript[0].split(/(?<=[.!?])\s+/);
        processedTranscript = sentences.length > 1 ? sentences : transcript;
      } else {
        processedTranscript = transcript;
      }

      // Backup data in case the save fails
      backupSessionData({ 
        lessonTitle, 
        transcript: processedTranscript, 
        attentionHistory, 
        understandingHistory 
      });

      toast.loading("Saving your session...", { id: "save-session" });

      // Generate placeholder metrics if missing
      const processedAttention = attentionHistory.length > 0 ? attentionHistory : [85, 80, 75];
      const processedUnderstanding = understandingHistory.length > 0 ? understandingHistory : [90, 85, 80];

      console.log('Calling saveSessionData with:', {
        transcriptCount: processedTranscript.length,
        attentionCount: processedAttention.length,
        understandingCount: processedUnderstanding.length
      });

      const { session, success } = await saveSessionData(
        lessonTitle,
        processedTranscript,
        processedAttention,
        processedUnderstanding
      );

      if (!success || !session.id) {
        throw new Error("Failed to save session data");
      }

      console.log('Session saved successfully. Session ID:', session.id);

      // Generate insights for the session
      await generateSessionInsights(session.id);
      console.log('Insights generated for session:', session.id);

      // Refetch sessions to update the UI
      await refetchSessions();
      console.log('Sessions refetched');

      toast.success("Session saved successfully!", { id: "save-session" });

      // Clear the backup after successful save
      clearBackupSessionData();

      // Store the new session ID in sessionStorage
      sessionStorage.setItem('newSessionId', session.id);
      
      // Navigate to analytics page with the session ID
      navigate(`/analytics?lesson=${session.id}`);

    } catch (error) {
      console.error("Error saving session:", error);
      toast.error(
        `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`, 
        { id: "save-session" }
      );
      
      // Show recovery option
      toast.error(
        "Your session data has been backed up. You can try again later.",
        { 
          id: "save-recovery",
          duration: 10000,
          action: {
            label: "Try Again",
            onClick: () => saveSession({ lessonTitle, transcript, attentionHistory, understandingHistory })
          }
        }
      );
    }
  };

  return { saveSession };
};
