
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Transcribe function initialized");

serve(async (req) => {
  console.log("Transcribe function received request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LEMONFOX_API_KEY = Deno.env.get('LEMONFOX_API_KEY');
    console.log("LEMONFOX_API_KEY configured:", !!LEMONFOX_API_KEY);
    
    if (!LEMONFOX_API_KEY) {
      console.error("Lemonfox API key not configured");
      return new Response(
        JSON.stringify({ error: 'Lemonfox API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the form data to get the audio blob
    try {
      const formData = await req.formData();
      const audioBlob = formData.get('audio') as File;
      
      if (!audioBlob) {
        console.error("No audio file provided in form data");
        throw new Error("No audio file provided");
      }
      
      console.log("Received audio file:", audioBlob.name, "Size:", audioBlob.size, "bytes");
      
      // Prepare data for Lemonfox API
      const lemonfoxFormData = new FormData();
      lemonfoxFormData.append('file', audioBlob);
      lemonfoxFormData.append('model', 'whisper-1');
      lemonfoxFormData.append('language', 'en');
      
      // Send to Lemonfox API
      const LEMONFOX_ENDPOINT = "https://api.lemonfox.ai/v1/audio/transcriptions";
      console.log("Sending request to Lemonfox API:", LEMONFOX_ENDPOINT);
      
      const response = await fetch(LEMONFOX_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LEMONFOX_API_KEY}`,
        },
        body: lemonfoxFormData,
      });
      
      console.log("Lemonfox API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lemonfox API error (${response.status}):`, errorText);
        throw new Error(`Lemonfox API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Transcription successful:", data.text ? data.text.substring(0, 30) + "..." : "No text");
      
      return new Response(
        JSON.stringify({ text: data.text }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (formError) {
      console.error("Error processing form data:", formError);
      throw new Error(`Form data error: ${formError.message}`);
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
