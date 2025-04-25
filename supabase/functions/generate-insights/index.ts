
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

const supabaseUrl = "https://objlnvvnifkotxctblgd.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the session data
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all transcript events for this session
    const { data: events, error: eventsError } = await supabase
      .from("session_events")
      .select("*")
      .eq("session_id", sessionId)
      .eq("event_type", "transcript")
      .order("timestamp", { ascending: true });

    if (eventsError) {
      return new Response(
        JSON.stringify({ error: "Could not fetch session events" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract transcripts
    const transcripts = events
      .map(event => event.content)
      .filter(Boolean)
      .join(" ");

    if (!transcripts) {
      return new Response(
        JSON.stringify({ error: "No transcripts found for this session" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a session summary (simulated AI summary for now)
    const summary = `This session covered ${session.title} with an average understanding level of ${session.understanding_avg}%. Students demonstrated varying levels of engagement throughout the ${events.length} interactions recorded.`;

    // Update the session with the summary
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ summary })
      .eq("id", sessionId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update session summary" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate insights
    await supabase.from("ai_insights").insert([
      {
        session_id: sessionId,
        type: "summary",
        content: summary,
        metadata: { generated_at: new Date().toISOString() },
      },
    ]);

    // Find problematic areas (low understanding scores)
    const { data: lowUnderstandingEvents } = await supabase
      .from("session_events")
      .select("*")
      .eq("session_id", sessionId)
      .eq("event_type", "understanding")
      .lt("value", 40)
      .order("value", { ascending: true })
      .limit(3);

    if (lowUnderstandingEvents && lowUnderstandingEvents.length > 0) {
      // For each low understanding moment, find nearby transcript
      for (const event of lowUnderstandingEvents) {
        const timestamp = new Date(event.timestamp);
        
        // Find transcripts within 10 seconds of this timestamp
        const { data: nearbyTranscripts } = await supabase
          .from("session_events")
          .select("*")
          .eq("session_id", sessionId)
          .eq("event_type", "transcript")
          .gte("timestamp", new Date(timestamp.getTime() - 10000).toISOString())
          .lte("timestamp", new Date(timestamp.getTime() + 10000).toISOString())
          .order("timestamp", { ascending: false });

        if (nearbyTranscripts && nearbyTranscripts.length > 0) {
          await supabase.from("ai_insights").insert([
            {
              session_id: sessionId,
              type: "review_point",
              content: `Students showed confusion (${event.value}% understanding) when discussing: "${nearbyTranscripts[0].content}"`,
              metadata: {
                understanding: event.value,
                timestamp: event.timestamp,
              },
            },
          ]);
        }
      }
    }

    // Generate suggestions
    await supabase.from("ai_insights").insert([
      {
        session_id: sessionId,
        type: "suggestion",
        content: `Consider using more visual aids when explaining complex concepts to improve overall understanding.`,
        metadata: { priority: "medium" },
      },
    ]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Insights generated successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
