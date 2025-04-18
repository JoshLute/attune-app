
import React, { useState, useEffect, useRef } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { useToast } from "@/hooks/use-toast";
import { recordingService } from "@/services/recordingService";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type StudentStatus = 'Attentive' | 'Confused' | 'Inattentive';

interface Student {
  id: string;
  name: string;
  status: StudentStatus;
  avatarUrl: string;
}

const RecordingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [students] = useState<Student[]>([
    {
      id: "jonathan",
      name: "Jonathan Sum",
      status: "Attentive",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jonathan"
    },
    {
      id: "jp",
      name: "JP Vela",
      status: "Confused",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jp"
    },
    {
      id: "cooper",
      name: "Cooper Randeen",
      status: "Inattentive",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=cooper"
    }
  ]);
  
  // Reference to the transcript container for auto-scrolling
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Handle transcription updates
  const handleTranscriptUpdate = (data: any) => {
    setTranscriptText(prev => `${prev}${data.timestamp}: ${data.text}\n`);
    
    // Auto-scroll to the bottom of the transcript
    setTimeout(() => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    }, 100);
  };

  // Handle session end
  const handleEndSession = async () => {
    if (isRecording) {
      const summary = await recordingService.endRecording();
      setIsRecording(false);
      toast({
        title: "Session Ended",
        description: "Your recording has been processed. Redirecting to analytics...",
      });
      
      // Store summary data in sessionStorage to pass to analytics page
      sessionStorage.setItem('sessionSummary', JSON.stringify(summary));
      
      // Navigate to analytics page
      setTimeout(() => {
        navigate('/analytics');
      }, 1500);
    }
  };
  
  // Handle behavior tagging
  const handleBehaviorTag = (studentName: string, tag: string) => {
    recordingService.addBehaviorTag(studentName, tag as any);
    toast({
      title: "Behavior Tagged",
      description: `${studentName} marked as "${tag}"`,
    });
  };

  // Handle start recording
  const handleStartRecording = async () => {
    if (!isRecording) {
      // Check for microphone permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the tracks after permission check
        
        setHasPermission(true);
        
        // Start the actual recording
        const success = await recordingService.startRecording();
        if (success) {
          setIsRecording(true);
          setTranscriptText("");
          toast({
            title: "Recording Started",
            description: "Live transcription is now active",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Recording Failed",
            description: "Could not start recording. Please try again.",
          });
        }
      } catch (error) {
        console.error("Microphone access denied:", error);
        setHasPermission(false);
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use this feature.",
        });
      }
    }
  };
  
  // Toggle mute/unmute
  const handleToggleMute = () => {
    // In a real implementation, this would mute the microphone
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
      description: isMuted ? "Audio recording resumed" : "Audio recording paused temporarily",
    });
  };

  // Set up and clean up listeners
  useEffect(() => {
    recordingService.addTranscriptListener(handleTranscriptUpdate);
    
    return () => {
      // Ensure we stop recording if the component unmounts
      if (isRecording) {
        recordingService.endRecording();
      }
      recordingService.removeTranscriptListener(handleTranscriptUpdate);
    };
  }, [isRecording]);

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">In Session</h1>
            <div className="flex space-x-4">
              {isRecording && (
                <Button
                  onClick={handleToggleMute}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-red-500" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Mute</span>
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={handleStartRecording}
                disabled={isRecording}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="default"
                className="bg-[#9b87f5] hover:bg-[#7E69AB] flex items-center space-x-2"
              >
                {isRecording && <MicOff className="h-4 w-4" />}
                <span>End Session</span>
              </Button>
            </div>
          </div>
          
          {hasPermission === false && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Microphone Access Required</AlertTitle>
              <AlertDescription>
                To use the recording feature, you must allow microphone access in your browser settings.
              </AlertDescription>
            </Alert>
          )}
          
          {isRecording && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Live Transcript</h2>
              <div 
                ref={transcriptRef}
                className="bg-white p-3 rounded border max-h-40 overflow-y-auto font-mono text-sm whitespace-pre-line"
              >
                {transcriptText || "Waiting for transcription..."}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {students.map((student) => (
              <StudentRecordingCard
                key={student.id}
                name={student.name}
                avatarUrl={student.avatarUrl}
                currentStatus={student.status}
                onTagClick={(tag) => handleBehaviorTag(student.name, tag)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
