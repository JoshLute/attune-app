import React, { useState, useEffect } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { SetupDialog } from "@/components/recording/SetupDialog";
import { RecordingStudentCard } from "@/components/recording/RecordingStudentCard";
import { LiveTranscript } from "@/components/recording/LiveTranscript";
import { LiveMetrics } from "@/components/recording/LiveMetrics";
import { toast } from "@/components/ui/sonner";
import { AlertCircle } from 'lucide-react';
import { useSaveSession } from "@/components/recording/SaveSessionHandler";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const RecordingPage = () => {
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [setupStep, setSetupStep] = useState<'student' | 'materials' | 'recording'>('student');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [hasTranscriptionError, setHasTranscriptionError] = useState(false);

  const [attention, setAttention] = useState<number>(80);
  const [understanding, setUnderstanding] = useState<number>(75);
  const [attentionHistory, setAttentionHistory] = useState<number[]>([]);
  const [understandingHistory, setUnderstandingHistory] = useState<number[]>([]);
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    const hasQuotaError = transcript.some(text => 
      text.includes("quota exceeded") || text.includes("service unavailable")
    );
    
    setHasTranscriptionError(hasQuotaError);
  }, [transcript]);

  const students = [
    {
      id: "jonathan",
      name: "Jonathan Sum",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jonathan"
    },
    {
      id: "jp",
      name: "JP Vela",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jp"
    },
    {
      id: "cooper",
      name: "Cooper Randeen",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=cooper"
    }
  ];

  const { saveSession } = useSaveSession();
  const activeStudent = students.find(s => s.id === selectedStudent);

  const handleMetricsUpdate = (newAttention: number, newUnderstanding: number) => {
    setAttention(newAttention);
    setUnderstanding(newUnderstanding);
    setAttentionHistory(prev => [...prev, newAttention]);
    setUnderstandingHistory(prev => [...prev, newUnderstanding]);
  };

  const handleStartRecording = () => {
    setIsSetupDialogOpen(false);
    setIsRecording(true);
    setTranscript([]);
    setAttentionHistory([]);
    setUnderstandingHistory([]);
    setHasTranscriptionError(false);
    
    sessionStorage.setItem('currentLessonTitle', lessonTitle);
    
    try {
      showToast({
        title: "Starting Recording",
        description: "Initializing microphone...",
      });
      
      setIsListening(true);
      
      const recorder = new AudioRecorder(
        (text) => {
          console.log("Received transcription:", text);
          setTranscript(prev => [...prev, text]);
        },
        (error) => {
          console.error("Recording error:", error);
          showToast({
            title: "Recording Error",
            description: error.message,
            variant: "destructive"
          });
          setIsListening(false);
        },
        handleMetricsUpdate
      );
      
      recorder.start().then(() => {
        showToast({
          title: "Recording Active",
          description: "Microphone is now active and listening",
        });
        setAudioRecorder(recorder);
      }).catch(error => {
        console.error("Failed to start recording:", error);
        showToast({
          title: "Microphone Access Failed",
          description: "Please check microphone permissions and try again",
          variant: "destructive"
        });
        setIsListening(false);
      });
    } catch (error) {
      console.error("Error initializing audio recorder:", error);
      showToast({
        title: "Recording Setup Failed",
        description: "There was an error setting up audio recording",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };

  const handleEndSession = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    if (audioRecorder) {
      console.log("Stopping audio recorder...");
      audioRecorder.stop();
      setAudioRecorder(null);
      setIsListening(false);
    }
    
    console.log("Preparing to save session with:", {
      lessonTitle,
      transcriptCount: transcript.length,
      attentionHistory,
      understandingHistory
    });
    
    saveSession({
      lessonTitle,
      transcript,
      attentionHistory,
      understandingHistory
    }).finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <SetupDialog 
            isOpen={isSetupDialogOpen}
            onOpenChange={setIsSetupDialogOpen}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            onStartRecording={handleStartRecording}
            setupStep={setupStep}
            setSetupStep={setSetupStep}
            lessonTitle={lessonTitle}
            setLessonTitle={setLessonTitle}
          />
          
          {isRecording && activeStudent && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">
                  {lessonTitle || "Lesson"}
                </h1>
                <Button 
                  variant="default"
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                  onClick={handleEndSession}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "End Session"}
                </Button>
              </div>
              
              <div className="space-y-6">
                <RecordingStudentCard 
                  student={activeStudent}
                  recordingTime={recordingTime}
                />
                
                <LiveMetrics
                  understanding={understanding}
                  attention={attention}
                  onMetricsUpdate={handleMetricsUpdate}
                />
                
                <LiveTranscript 
                  transcript={transcript}
                  isListening={isListening}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
