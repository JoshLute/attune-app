import React, { useEffect, useRef } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface LiveTranscriptProps {
  transcript: string[];
  isListening: boolean;
  onMetricsUpdate?: (attention: number, understanding: number) => void;
  audioRecorder?: { getAudioLevel: () => number } | null;
}

export function LiveTranscript({ 
  transcript, 
  isListening, 
  onMetricsUpdate,
  audioRecorder 
}: LiveTranscriptProps) {
  const audioLevelRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simplified metrics update based on audio level
  useEffect(() => {
    const updateMetrics = () => {
      if (!isListening || !audioRecorder) return;
      
      const level = audioRecorder.getAudioLevel();
      
      if (audioLevelRef.current) {
        audioLevelRef.current.style.width = `${level}%`;
      }

      // Simple metrics based on audio level
      if (onMetricsUpdate && level > 0) {
        const attention = Math.min(100, level + 30);
        const understanding = Math.min(100, level + 20);
        onMetricsUpdate(attention, understanding);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateMetrics);
    };

    if (isListening) {
      updateMetrics();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, audioRecorder, onMetricsUpdate]);

  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Transcript</h3>
        {isListening && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-gray-600">Recording</span>
            </div>
            
            {/* Audio level meter */}
            <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
              <div
                ref={audioLevelRef}
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <div className="w-full">
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
                    <p key={index} className="py-1 border-b border-gray-100 last:border-none">
                      {text}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    {isListening ? "Waiting for speech... Please make sure your microphone is working properly." : "Click Start Recording to begin"}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
