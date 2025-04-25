
import React, { useEffect, useRef } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface LiveTranscriptProps {
  transcript: string[];
  isListening: boolean;
  onMetricsUpdate?: (attention: number, understanding: number) => void;
}

export function LiveTranscript({ transcript, isListening, onMetricsUpdate }: LiveTranscriptProps) {
  const audioLevelRef = useRef<HTMLDivElement>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!isListening) {
      console.log('LiveTranscript: Not listening, skipping metrics setup');
      return;
    }
    
    console.log('LiveTranscript: Setting up audio context and metrics');
    let animationFrame: number;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('LiveTranscript: Audio stream connected');
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        // Single metrics update function
        const updateMetrics = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          const level = Math.min(100, (average / 128) * 100);
          
          if (audioLevelRef.current) {
            audioLevelRef.current.style.width = `${level}%`;
          }

          if (onMetricsUpdate) {
            const attention = Math.max(20, Math.min(100, level + Math.random() * 20));
            const understanding = Math.max(20, Math.min(100, level + Math.random() * 20));
            console.log('LiveTranscript: Updating metrics -', { attention, understanding });
            onMetricsUpdate(attention, understanding);
          }
        };
        
        // Clear any existing interval
        if (metricsIntervalRef.current) {
          console.log('LiveTranscript: Clearing existing metrics interval');
          clearInterval(metricsIntervalRef.current);
        }
        
        // Set up new 10-second interval for metrics updates
        console.log('LiveTranscript: Setting up new metrics interval');
        metricsIntervalRef.current = setInterval(updateMetrics, 10000);
        
        // Run the first update immediately
        updateMetrics();
        
        // Update audio level visualization more frequently
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          const level = Math.min(100, (average / 128) * 100);
          
          if (audioLevelRef.current) {
            audioLevelRef.current.style.width = `${level}%`;
          }
          
          animationFrame = requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      })
      .catch(err => console.error('Audio level monitoring error:', err));
      
    return () => {
      console.log('LiveTranscript: Cleaning up audio context and intervals');
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      cancelAnimationFrame(animationFrame);
      audioContext.close();
    };
  }, [isListening, onMetricsUpdate]);

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
