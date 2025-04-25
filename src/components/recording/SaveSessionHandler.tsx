
import { toast } from "@/components/ui/sonner";
import { saveSessionData, generateSessionInsights } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface SaveSessionHandlerProps {
  lessonTitle: string;
  transcript: string[];
  attentionHistory: number[];
  understandingHistory: number[];
}

export const useSaveSession = () => {
  const navigate = useNavigate();

  const saveSession = async ({
    lessonTitle,
    transcript,
    attentionHistory,
    understandingHistory,
  }: SaveSessionHandlerProps) => {
    try {
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

      // Generate insights for the session
      await generateSessionInsights(session.id);

      toast.success("Session saved successfully!", { id: "save-session" });

      // Store the new session ID in sessionStorage
      sessionStorage.setItem('newSessionId', session.id);
      
      // Navigate to analytics page
      navigate(`/analytics?lesson=${session.id}`);

    } catch (error) {
      console.error("Error saving session:", error);
      toast.error(
        "There was an error saving your session. Please try again.", 
        { id: "save-session" }
      );
    }
  };

  return { saveSession };
};
