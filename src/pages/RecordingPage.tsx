import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSaveSession, getBackupSessionData, clearBackupSessionData } from "@/components/recording/SaveSessionHandler";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { SetupDialog } from "@/components/recording/SetupDialog";
import { RecordingStudentCard } from "@/components/recording/RecordingStudentCard";
import { LiveMetrics } from "@/components/recording/LiveMetrics";
import { LiveTranscript } from "@/components/recording/LiveTranscript";
import { toast } from "@/components/ui/sonner";

const RecordingPage = () => {
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
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
  
  // Remove unnecessary interval refs
  const metricsUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for backup on load
  useEffect(() => {
    const backup = getBackupSessionData();
    if (backup) {
      toast("You have an unsaved recording", {
        description: "Would you like to recover it?",
        action: {
          label: "Recover",
          onClick: () => {
            setLessonTitle(backup.lessonTitle);
            setTranscript(backup.transcript);
            setAttentionHistory(backup.attentionHistory);
            setUnderstandingHistory(backup.understandingHistory);
            
            // Set initial values from history
            if (backup.attentionHistory.length > 0) {
              setAttention(backup.attentionHistory[backup.attentionHistory.length - 1]);
            }
            if (backup.understandingHistory.length > 0) {
              setUnderstanding(backup.understandingHistory[backup.understandingHistory.length - 1]);
            }
            
            // Navigate to save
            handleEndSession();
          }
        },
        onDismiss: () => {
          clearBackupSessionData();
        },
        duration: 10000
      });
    }
  }, []);

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

  // Save metrics to history arrays
  const updateMetricsHistory = useCallback(() => {
    console.log('RecordingPage: Saving metrics to history:', { attention, understanding });
    setAttentionHistory(prev => [...prev, attention]);
    setUnderstandingHistory(prev => [...prev, understanding]);
    
    // Save to window for debugging
    (window as any).attentionHistory = [...attentionHistory, attention];
    (window as any).understandingHistory = [...understandingHistory, understanding];
    (window as any).transcriptHistory = transcript;
  }, [attention, understanding, attentionHistory, understandingHistory, transcript]);

  // Update metrics handling to use synchronized 10-second intervals
  const handleMetricsUpdate = useCallback((newAttention: number, newUnderstanding: number) => {
    console.log('RecordingPage: Received metrics update:', { newAttention, newUnderstanding });
    setAttention(newAttention);
    setUnderstanding(newUnderstanding);
    
    // Save metrics to history arrays
    setAttentionHistory(prev => [...prev, newAttention]);
    setUnderstandingHistory(prev => [...prev, newUnderstanding]);
  }, []);

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
      showToast({
        title: "Starting Recording",
        description: "Initializing microphone...",
      });
      
      setIsListening(true);
      
      const recorder = new AudioRecorder(
        (text) => {
          console.log("Received transcription:", text);
          setTranscript(prev => [...prev, text]);
          // Save to window for debugging
          (window as any).transcriptHistory = [...transcript, text];
        },
        (error) => {
          console.error("Recording error:", error);
          showToast({
            title: "Recording Error",
            description: error.message,
            variant: "destructive"
          });
          setIsListening(false);
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

    // Clear any existing intervals
    if (metricsUpdateIntervalRef.current) {
      clearInterval(metricsUpdateIntervalRef.current);
    }
    
    // Set up interval to save metrics to history
    metricsUpdateIntervalRef.current = setInterval(() => {
      updateMetricsHistory();
    }, 10000);
  };

  const handleQuickBehavior = (tag: string) => {
    setBehaviorEvents(evts => [
      ...evts,
      { tag, timestamp: recordingTime }
    ]);

    showToast({
      title: "Behavior Recorded",
      description: `${activeStudent?.name} - ${tag}`,
      duration: 3000,
    });
  };

  const { saveSession } = useSaveSession();
  
  const handleEndSession = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    if (metricsUpdateIntervalRef.current) clearInterval(metricsUpdateIntervalRef.current);
    
    if (audioRecorder) {
      console.log("Stopping audio recorder...");
      audioRecorder.stop();
      setAudioRecorder(null);
      setIsListening(false);
    }
    
    // Ensure we have the latest metrics saved in history
    updateMetricsHistory();
    
    // Log what we're about to save
    console.log("Preparing to save session with:", {
      lessonTitle,
      transcriptCount: transcript.length,
      attentionHistoryCount: attentionHistory.length,
      understandingHistoryCount: understandingHistory.length
    });
    
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
                  onMetricsUpdate={handleMetricsUpdate}
                />
                
                <LiveTranscript 
                  transcript={transcript}
                  isListening={isListening}
                  onMetricsUpdate={handleMetricsUpdate}
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
