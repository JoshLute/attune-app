
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LEMONFOX_API_KEY = Deno.env.get('LEMONFOX_API_KEY');
    
    if (!LEMONFOX_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Lemonfox API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the form data to get the audio blob
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as File;
    
    if (!audioBlob) {
      throw new Error("No audio file provided");
    }
    
    // Prepare data for Lemonfox API
    const lemonfoxFormData = new FormData();
    lemonfoxFormData.append('file', audioBlob);
    lemonfoxFormData.append('model', 'whisper-1');
    lemonfoxFormData.append('language', 'en');
    
    // Send to Lemonfox API
    const LEMONFOX_ENDPOINT = "https://api.lemonfox.ai/v1/audio/transcriptions";
    const response = await fetch(LEMONFOX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONFOX_API_KEY}`,
      },
      body: lemonfoxFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lemonfox API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({ text: data.text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
