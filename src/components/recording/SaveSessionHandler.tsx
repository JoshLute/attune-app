
import { toast } from "@/components/ui/sonner";
import { saveSessionData, generateSessionInsights } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useSessionsContext } from "@/contexts/SessionsContext";

interface SaveSessionHandlerProps {
  lessonTitle: string;
  transcript: string[];
  attentionHistory: number[];
  understandingHistory: number[];
}

export const useSaveSession = () => {
  const navigate = useNavigate();
  const { refetchSessions } = useSessionsContext();

  const saveSession = async ({
    lessonTitle,
    transcript,
    attentionHistory,
    understandingHistory,
  }: SaveSessionHandlerProps) => {
    try {
      // Validate data before saving
      if (!transcript.length || !attentionHistory.length || !understandingHistory.length) {
        throw new Error("Missing recording data");
      }

      console.log('Starting session save with data:', { 
        lessonTitle,
        transcriptCount: transcript.length,
        attentionPoints: attentionHistory.length,
        understandingPoints: understandingHistory.length
      });

      toast.loading("Saving your session...", { id: "save-session" });

      const { session, success } = await saveSessionData(
        lessonTitle,
        transcript,
        attentionHistory,
        understandingHistory
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
    }
  };

  return { saveSession };
};
