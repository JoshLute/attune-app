
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 data in chunks to avoid memory issues
function processBase64(base64Data: string): Uint8Array {
  try {
    // Process in smaller chunks to avoid call stack size exceeded
    const chunkSize = 8192;
    const binaryChunks: Uint8Array[] = [];
    let totalLength = 0;
    
    for (let i = 0; i < base64Data.length; i += chunkSize) {
      const chunk = base64Data.substring(i, Math.min(i + chunkSize, base64Data.length));
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let j = 0; j < binaryChunk.length; j++) {
        bytes[j] = binaryChunk.charCodeAt(j);
      }
      
      binaryChunks.push(bytes);
      totalLength += bytes.length;
    }
    
    // Combine all chunks
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of binaryChunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (error) {
    console.error("Error processing base64:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log("Received transcription request");
  
  try {
    const { audioData } = await req.json()
    
    if (!audioData) {
      console.error("No audio data provided");
      throw new Error('No audio data provided')
    }

    console.log(`Received audio data of length: ${audioData.length}`);
    
    // Convert base64 to binary using the chunked approach
    const binaryAudio = processBase64(audioData);
    console.log(`Processed audio data, binary length: ${binaryAudio.length}`);
    
    // Prepare form data for OpenAI
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    console.log("Sending to OpenAI Whisper API...");
    
    // Send to OpenAI Whisper API
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const result = await response.json()
    console.log('Transcription result:', result);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
