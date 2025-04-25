
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Clean up all resources
  const cleanupResources = () => {
    console.log('LiveTranscript: Cleaning up all audio resources');
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear metrics interval
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    
    // Disconnect and close audio context
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };
  
  useEffect(() => {
    if (!isListening) {
      console.log('LiveTranscript: Not listening, cleaning up resources');
      cleanupResources();
      return;
    }
    
    console.log('LiveTranscript: Setting up audio context and metrics');
    
    // Clean up any existing resources first
    cleanupResources();
    
    // Create new audio context and analyzer
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('LiveTranscript: Audio stream connected');
          if (audioContextRef.current && analyserRef.current) {
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            
            // Single metrics update function
            const updateMetrics = () => {
              if (!analyserRef.current) return;
              
              analyserRef.current.getByteFrequencyData(dataArray);
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
            console.log('LiveTranscript: Setting up new metrics interval (10s)');
            metricsIntervalRef.current = setInterval(updateMetrics, 10000);
            
            // Run the first update immediately
            updateMetrics();
            
            // Update audio level visualization more frequently but separately
            const updateAudioLevel = () => {
              if (!analyserRef.current) return;
              
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
              const level = Math.min(100, (average / 128) * 100);
              
              if (audioLevelRef.current) {
                audioLevelRef.current.style.width = `${level}%`;
              }
              
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };
            
            // Start the animation frame loop
            updateAudioLevel();
          }
        })
        .catch(err => {
          console.error('Audio level monitoring error:', err);
          cleanupResources();
        });
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      cleanupResources();
    }
      
    // Cleanup when component unmounts or isListening changes
    return cleanupResources;
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
