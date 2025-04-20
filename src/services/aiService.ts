
import { supabase } from "@/integrations/supabase/client";

interface InsightRequest {
  type: "student" | "analytics" | "chat";
  context?: string;
  data: any;
}

interface TranscribeRequest {
  audio: string; // Base64 encoded audio
}

export const aiService = {
  /**
   * Generate AI insights using the Gemini API
   */
  async generateInsights({ type, context = "", data }: InsightRequest) {
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-insights", {
        body: { type, context, data },
      });

      if (error) throw new Error(error.message);
      return result;
    } catch (error) {
      console.error("Error generating insights:", error);
      throw error;
    }
  },

  /**
   * Transcribe audio using LemonFox API
   */
  async transcribeAudio({ audio }: TranscribeRequest) {
    try {
      const { data: result, error } = await supabase.functions.invoke("transcribe", {
        body: { audio },
      });

      if (error) throw new Error(error.message);
      return result;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  },
};
