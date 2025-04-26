
import { toast } from "@/components/ui/sonner";
import { saveSessionData } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useSessionsContext } from "@/contexts/SessionsContext";

interface SaveSessionHandlerProps {
  lessonTitle: string;
  transcript: string[];
  attentionHistory?: number[];
  understandingHistory?: number[];
}

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
      if (!lessonTitle) {
        throw new Error("Lesson title is required");
      }

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

      await refetchSessions();
      toast.success("Session saved successfully!", { id: "save-session" });
      
      sessionStorage.setItem('newSessionId', session.id);
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
