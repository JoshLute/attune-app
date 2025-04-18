
// Follow this setup guide for Supabase Edge Functions:
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LEMONFOX_API_KEY = Deno.env.get('LEMONFOX_API_KEY') || '';

serve(async (req) => {
  try {
    // Parse the FormData to get the audio file
    const formData = await req.formData();
    const audioBlob = formData.get('audio');
    
    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a new FormData to send to LemonFox API
    const apiFormData = new FormData();
    apiFormData.append('audio', audioBlob, 'audio.webm');
    
    // Call the LemonFox API
    const response = await fetch('https://api.lemonfox.ai/v1/transcribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONFOX_API_KEY}`
      },
      body: apiFormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LemonFox API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Transcription API error' }),
        { headers: { 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({ text: data.text }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transcription function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
