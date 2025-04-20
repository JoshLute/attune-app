
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, type, data } = await req.json();

    if (!GOOGLE_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    // Different prompt templates based on insight type
    let promptText = "";
    
    switch (type) {
      case "student":
        promptText = `You are an expert educational assistant analyzing student data. Given the following information about a student:
          ${JSON.stringify(data)}
          
          Provide 2-3 concise, specific, and personalized teaching suggestions to help this student based on their understanding level, attention patterns, and behavior.
          Format your response as a simple array of strings with no additional text or explanation.`;
        break;
      
      case "analytics":
        promptText = `You are an expert educational data analyst. Analyze the following classroom data:
          ${JSON.stringify(data)}
          
          Provide a concise summary of key insights about overall classroom performance, identifying patterns, areas of strength, and opportunities for improvement.
          Limit your response to 3-4 sentences.`;
        break;
      
      case "chat":
        promptText = `You are an AI assistant for educators named "Attune AI". Respond to the following message from a teacher:
          "${context}"
          
          Given this student data for context: ${JSON.stringify(data)}
          
          Provide a helpful, concise response that offers specific insights or suggestions based on the data.
          Be conversational but focused on providing actionable advice. Keep your response under 100 words.`;
        break;
      
      default:
        throw new Error("Invalid insight type");
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the text from the response
    let output;
    if (type === "student" && result.candidates[0].content.parts[0].text) {
      try {
        // Try to parse as JSON array for student insights
        output = JSON.parse(result.candidates[0].content.parts[0].text);
      } catch (e) {
        // If parsing fails, just return the raw text
        output = result.candidates[0].content.parts[0].text;
      }
    } else {
      output = result.candidates[0].content.parts[0].text;
    }

    return new Response(JSON.stringify({ response: output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
