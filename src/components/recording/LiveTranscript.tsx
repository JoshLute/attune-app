
import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AlertCircle } from 'lucide-react';

interface LiveTranscriptProps {
  transcript: string[];
  isListening: boolean;
}

export function LiveTranscript({ 
  transcript, 
  isListening
}: LiveTranscriptProps) {
  const hasTranscriptionError = transcript.some(text => 
    text.includes("Error transcribing audio") || 
    text.includes("Error processing audio")
  );

  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Transcript</h3>
        {isListening && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm text-gray-600">Recording</span>
          </div>
        )}
      </div>
      
      {hasTranscriptionError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 flex items-start gap-2">
          <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              There was an error with the transcription. Some text may be missing.
            </p>
          </div>
        </div>
      )}
      
      <div>
        <Accordion type="single" collapsible defaultValue="open">
          <AccordionItem value="open" className="border-none rounded-xl bg-white p-0">
            <AccordionTrigger className="px-3 py-2 rounded-xl focus:outline-none text-base font-medium text-left bg-white hover:bg-gray-100">
              {isListening ? 
                transcript.length > 0 ? `Show Transcript (${transcript.length} entries)` : "Listening for speech..." 
                : "Not listening - click Start Recording"}
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4 pt-1 max-h-60 overflow-y-auto shadow-inner bg-white rounded-b-xl">
              {transcript.length > 0 ? (
                transcript.map((text, index) => (
                  <p key={index} className={`py-1 border-b border-gray-100 last:border-none ${
                    text.includes("Error") ? "text-amber-600 italic" : ""
                  }`}>
                    {text}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  {isListening ? "Waiting for speech..." : "Click Start Recording to begin"}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
