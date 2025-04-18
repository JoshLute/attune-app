
import React, { useState, useEffect } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { useToast } from "@/hooks/use-toast";
import { recordingService } from "@/services/recordingService";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [transcriptText, setTranscriptText] = useState<string>("");
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

  // Handle transcription updates
  const handleTranscriptUpdate = (data: any) => {
    setTranscriptText(prev => `${prev}${data.timestamp}: ${data.text}\n`);
  };

  // Handle session end
  const handleEndSession = () => {
    if (isRecording) {
      const summary = recordingService.endRecording();
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
  const handleStartRecording = () => {
    if (!isRecording) {
      recordingService.startRecording();
      setIsRecording(true);
      setTranscriptText("");
      toast({
        title: "Recording Started",
        description: "Live transcription is now active",
      });
    }
  };

  // Set up and clean up listeners
  useEffect(() => {
    recordingService.addTranscriptListener(handleTranscriptUpdate);
    
    return () => {
      recordingService.removeTranscriptListener(handleTranscriptUpdate);
    };
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">In Session</h1>
            <div className="flex space-x-4">
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
          
          {isRecording && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Live Transcript</h2>
              <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto font-mono text-sm whitespace-pre-line">
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
