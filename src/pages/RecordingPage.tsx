
import React, { useState, useEffect, useRef } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSaveSession } from "@/components/recording/SaveSessionHandler";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { SetupDialog } from "@/components/recording/SetupDialog";
import { RecordingStudentCard } from "@/components/recording/RecordingStudentCard";
import { LiveMetrics } from "@/components/recording/LiveMetrics";
import { LiveTranscript } from "@/components/recording/LiveTranscript";

const RecordingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [setupStep, setSetupStep] = useState<'student' | 'materials' | 'recording'>('student');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [understanding, setUnderstanding] = useState(85);
  const [attention, setAttention] = useState(90);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [behaviorEvents, setBehaviorEvents] = useState<{ tag: string, timestamp: number }[]>([]);
  const [attentionHistory, setAttentionHistory] = useState<number[]>([]);
  const [understandingHistory, setUnderstandingHistory] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);

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
    setAttentionHistory([]);
    setUnderstandingHistory([]);
    setTranscript([]);
    
    sessionStorage.setItem('currentLessonTitle', lessonTitle);
    
    try {
      toast({
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
          toast({
            title: "Recording Error",
            description: error.message,
            variant: "destructive"
          });
          setIsListening(false);
        }
      );
      
      recorder.start().then(() => {
        toast({
          title: "Recording Active",
          description: "Microphone is now active and listening",
        });
        setAudioRecorder(recorder);
      }).catch(error => {
        console.error("Failed to start recording:", error);
        toast({
          title: "Microphone Access Failed",
          description: "Please check microphone permissions and try again",
          variant: "destructive"
        });
        setIsListening(false);
      });
    } catch (error) {
      console.error("Error initializing audio recorder:", error);
      toast({
        title: "Recording Setup Failed",
        description: "There was an error setting up audio recording",
        variant: "destructive"
      });
      setIsListening(false);
    }

    // Simulate changing metrics over time
    const understandingInterval = setInterval(() => {
      setUnderstanding(prev => {
        const change = Math.random() > 0.5 ? 5 : -5;
        return Math.max(10, Math.min(100, prev + change));
      });
    }, 5000);
    
    const attentionInterval = setInterval(() => {
      setAttention(prev => {
        const change = Math.random() > 0.5 ? 8 : -8;
        return Math.max(20, Math.min(100, prev + change));
      });
    }, 4000);
    
    return () => {
      clearInterval(understandingInterval);
      clearInterval(attentionInterval);
    };
  };

  const handleQuickBehavior = (tag: string) => {
    setBehaviorEvents(evts => [
      ...evts,
      { tag, timestamp: recordingTime }
    ]);

    toast({
      title: "Behavior Recorded",
      description: `${activeStudent?.name} - ${tag}`,
      duration: 3000,
    });
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
    
    saveSession({
      lessonTitle,
      transcript,
      attentionHistory,
      understandingHistory,
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
              
              <div className="space-y-6">
                <RecordingStudentCard 
                  student={activeStudent}
                  understanding={understanding}
                  recordingTime={recordingTime}
                  onBehaviorClick={handleQuickBehavior}
                />
                
                <LiveMetrics 
                  understanding={understanding}
                  attention={attention}
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
