import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown } from "lucide-react";
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { RecordingSetup } from "@/components/recording/RecordingSetup";
import { LiveTranscription } from "@/components/recording/LiveTranscription";
import { addLiveLogEntry } from "@/services/liveLogService";
import { useToast } from "@/hooks/use-toast";

type StudentStatus = 'Attentive' | 'Confused' | 'Inattentive';

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

const RecordingPage = () => {
  const navigate = useNavigate();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [setupStep, setSetupStep] = useState<'student' | 'materials' | 'recording'>('student');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [understanding, setUnderstanding] = useState(85);
  const [attention, setAttention] = useState(90);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);

  const { toast } = useToast();

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

  // Mock students data
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
    // Store the lesson title in sessionStorage so it persists across pages
    sessionStorage.setItem('currentLessonTitle', lessonTitle);
    
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

  const handleBehaviorTag = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  const handleEndSession = () => {
    navigate("/analytics");
  };

  // Modified handleTranscriptUpdate to store data in Supabase
  const handleTranscriptUpdate = async (text: string) => {
    try {
      await addLiveLogEntry({
        confusion_level: 100 - understanding, // inverse of understanding
        attention_level: attention,
        transcription_text: text,
      });

      setTranscript(prev => {
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const newTranscript = [...prev, ...sentences.map(s => s.trim())];
        sessionStorage.setItem('currentTranscript', JSON.stringify(newTranscript));
        return newTranscript;
      });
    } catch (error) {
      toast({
        title: "Error saving recording data",
        description: "Failed to save the recording data to the database.",
        variant: "destructive"
      });
      console.error('Error saving live log:', error);
    }
  };

  // Also log metrics changes
  useEffect(() => {
    if (isRecording) {
      const logMetrics = async () => {
        try {
          await addLiveLogEntry({
            confusion_level: 100 - understanding,
            attention_level: attention,
            transcription_text: null,
          });
        } catch (error) {
          console.error('Error logging metrics:', error);
        }
      };

      const metricsInterval = setInterval(logMetrics, 5000); // Log every 5 seconds

      return () => clearInterval(metricsInterval);
    }
  }, [isRecording, understanding, attention]);

  const activeStudent = students.find(s => s.id === selectedStudent);

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Setup Dialog */}
          <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {setupStep === 'student' ? 'Select Student' : 'Upload Materials'}
                </DialogTitle>
                <DialogDescription>
                  {setupStep === 'student' 
                    ? 'Select a student to track during this session.'
                    : 'Add your curriculum or presentation materials.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              {setupStep === 'student' ? (
                <div className="py-4">
                  <RadioGroup value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3 space-y-2">
                        <RadioGroupItem value={student.id} id={student.id} />
                        <Label htmlFor={student.id} className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img 
                              src={student.avatarUrl} 
                              alt={student.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{student.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-end mt-6">
                    <Button 
                      disabled={!selectedStudent}
                      onClick={() => setSetupStep('materials')}
                      className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <RecordingSetup 
                  onNext={handleStartRecording}
                  onBack={() => setSetupStep('student')}
                  onTitleChange={setLessonTitle}
                  title={lessonTitle}
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Recording Session UI */}
          {isRecording && activeStudent && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">In Session</h1>
                <Button 
                  variant="default"
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                  onClick={handleEndSession}
                >
                  End Session
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Student Card */}
                <StudentRecordingCard
                  name={activeStudent.name}
                  avatarUrl={activeStudent.avatarUrl}
                  understanding={understanding}
                  attention={attention}
                  recordingTime={recordingTime}
                  onTagClick={handleBehaviorTag}
                  activeTag={activeTag}
                />
                
                {/* Live Metrics */}
                <div className="bg-[#F1F0FB] p-6 rounded-3xl space-y-4">
                  <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Metrics</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Understanding</span>
                        <span className="font-medium">{understanding}%</span>
                      </div>
                      <Progress 
                        value={understanding} 
                        className="h-3 bg-gray-200"
                        indicatorColor={understanding < 25 ? '#ef4444' : '#22c55e'} 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Attention</span>
                        <span className="font-medium">{attention}%</span>
                      </div>
                      <Progress 
                        value={attention} 
                        className="h-3 bg-gray-200"
                        indicatorColor="#3b82f6" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Transcript */}
                <Collapsible
                  open={isTranscriptOpen}
                  onOpenChange={setIsTranscriptOpen}
                  className="bg-[#F1F0FB] p-6 rounded-3xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">
                      Live Transcript
                    </h3>
                    <CollapsibleTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      {isTranscriptOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="bg-white p-4 rounded-xl max-h-60 overflow-y-auto shadow-inner relative">
                      {transcript.length > 0 ? (
                        transcript.map((text, index) => (
                          <p key={index} className="py-1 border-b border-gray-100 last:border-none">
                            {text}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">Waiting for speech...</p>
                      )}
                      
                      {/* Live transcription status indicator */}
                      <LiveTranscription 
                        isRecording={isRecording} 
                        onTranscriptUpdate={handleTranscriptUpdate} 
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
