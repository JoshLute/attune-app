import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSaveSession, getBackupSessionData, clearBackupSessionData } from "@/components/recording/SaveSessionHandler";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { SetupDialog } from "@/components/recording/SetupDialog";
import { RecordingStudentCard } from "@/components/recording/RecordingStudentCard";
import { LiveTranscript } from "@/components/recording/LiveTranscript";
import { toast } from "@/components/ui/sonner";
import { AlertCircle } from 'lucide-react';

const RecordingPage = () => {
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [setupStep, setSetupStep] = useState<'student' | 'materials' | 'recording'>('student');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [hasTranscriptionError, setHasTranscriptionError] = useState(false);

  // Handle recording timer
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

  // Monitor transcript for API quota errors
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

  const handleStartRecording = () => {
    setIsSetupDialogOpen(false);
    setIsRecording(true);
    setTranscript([]);
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
          
          if (error.message.includes("quota") || error.message.includes("API")) {
            toast("Transcription Limited", {
              description: "OpenAI API quota exceeded. Recording will continue without full transcription.",
              icon: <AlertCircle className="h-5 w-5" />,
              duration: 10000,
            });
          } else {
            showToast({
              title: "Recording Error",
              description: error.message,
              variant: "destructive"
            });
          }
          
          if (!error.message.includes("quota") && !error.message.includes("API")) {
            setIsListening(false);
          }
        }
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

  const { saveSession } = useSaveSession();
  
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
      transcriptCount: transcript.length
    });
    
    saveSession({
      lessonTitle,
      transcript
    }).finally(() => {
      setIsSaving(false);
    });
  };

  const activeStudent = students.find(s => s.id === selectedStudent);

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
              
              {hasTranscriptionError && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="text-amber-500 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">OpenAI API Quota Exceeded</p>
                    <p className="text-xs mt-0.5">
                      Speech transcription is limited. Recording will continue normally.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                <RecordingStudentCard 
                  student={activeStudent}
                  recordingTime={recordingTime}
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
