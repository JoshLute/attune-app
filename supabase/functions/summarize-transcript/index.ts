
// Follow this setup guide for Supabase Edge Functions:
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// You might want to use OpenAI or another AI service for summarization
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface TranscriptData {
  timestamp: string;
  text: string;
  confusion: number;
}

interface SummaryData {
  summary: string;
  missedContent: string;
  fullTranscript: string;
  usageStats: {
    whisperAudioSeconds: number;
    geminiTokens: number;
  };
  confusionData: Array<{
    timestamp: string;
    confusion: number;
  }>;
}

serve(async (req) => {
  try {
    const { transcripts } = await req.json();
    
    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid transcript data' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract full transcript text
    const fullText = transcripts
      .map((t: TranscriptData) => t.text)
      .join('\n');
    
    // Extract confusion data
    const confusionData = transcripts.map((t: TranscriptData) => ({
      timestamp: t.timestamp,
      confusion: t.confusion
    }));
    
    // Create full transcript with timestamps
    const fullTranscript = transcripts
      .map((t: TranscriptData) => `${t.timestamp}: ${t.text} (Confusion: ${t.confusion.toFixed(2)})`)
      .join('\n');
    
    // For now, we'll implement a simple summarization
    // In a real implementation, you would call OpenAI or another AI service
    
    let summary = `<p>Class session summary:</p>
    <ul>`;
    
    // Extract some key points (this is very basic - use an AI service for better results)
    const sentences = fullText.split('.');
    const keyPoints = sentences
      .filter(s => s.trim().length > 15)  // Filter out short sentences
      .slice(0, 5);  // Take up to 5 key points
    
    keyPoints.forEach(point => {
      summary += `<li>${point.trim()}.</li>`;
    });
    
    summary += `</ul>`;
    
    // Identify potentially confusing segments
    const confusingSegments = transcripts
      .filter((t: TranscriptData) => t.confusion > 0.6)  // Filter segments with high confusion
      .map((t: TranscriptData) => `<li>${t.text} (confusion score: ${t.confusion.toFixed(2)})</li>`)
      .join('');
    
    const missedContent = confusingSegments ? 
      `<h3>Potentially Confusing Points</h3>
       <p>There were some segments where confusion was detected:</p>
       <ul>${confusingSegments}</ul>` : 
      `<p>No significant confusion detected in this session.</p>`;
    
    const result: SummaryData = {
      summary,
      missedContent,
      fullTranscript,
      usageStats: {
        whisperAudioSeconds: transcripts.length * 5, // Roughly 5 seconds per chunk
        geminiTokens: fullText.split(' ').length * 1.5 // Rough estimate of tokens used
      },
      confusionData
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarization function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
