
import React, { useState } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [understanding, setUnderstanding] = useState(85);
  const [attention, setAttention] = useState(90);
  const [transcript, setTranscript] = useState<string[]>([]);

  // Mock students data
  const students = [
    {
      id: "jonathan",
      name: "Jonathan Sum",
      status: "Attentive" as StudentStatus,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jonathan"
    },
    {
      id: "jp",
      name: "JP Vela",
      status: "Confused" as StudentStatus,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jp"
    },
    {
      id: "cooper",
      name: "Cooper Randeen",
      status: "Inattentive" as StudentStatus,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=cooper"
    }
  ];

  // Get the selected student's data
  const activeStudent = students.find(s => s.id === selectedStudent);

  const handleStartRecording = () => {
    if (!selectedStudent) {
      toast({
        title: "Selection Required",
        description: "Please select a student to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSetupDialogOpen(false);
    setIsRecording(true);
    
    // Simulate changing metrics over time
    const understandingInterval = setInterval(() => {
      setUnderstanding(prev => {
        const change = Math.random() > 0.5 ? 5 : -5;
        const newValue = prev + change;
        return Math.max(10, Math.min(100, newValue));
      });
    }, 5000);
    
    const attentionInterval = setInterval(() => {
      setAttention(prev => {
        const change = Math.random() > 0.5 ? 8 : -8;
        const newValue = prev + change;
        return Math.max(20, Math.min(100, newValue));
      });
    }, 4000);

    // Simulate transcript generation
    const phrases = [
      "I think I understand this concept now.",
      "Could you explain that part again?",
      "This makes a lot more sense than before.",
      "I'm having trouble with this section.",
      "Oh, I see how that works now!",
      "Wait, how does this relate to what we learned last week?",
      "That's an interesting approach to solving the problem."
    ];
    
    const transcriptInterval = setInterval(() => {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setTranscript(prev => [...prev, randomPhrase]);
    }, 3000);
    
    // Clean up intervals when component unmounts
    return () => {
      clearInterval(understandingInterval);
      clearInterval(attentionInterval);
      clearInterval(transcriptInterval);
    };
  };

  const handleBehaviorTag = (studentName: string, tag: string) => {
    toast({
      title: "Behavior Tagged",
      description: `${studentName} marked as "${tag}"`,
    });
  };

  const handleEndSession = () => {
    toast({
      title: "Session Ended",
      description: "Redirecting to analytics...",
    });
    navigate("/analytics");
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Setup Dialog */}
          <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Recording</DialogTitle>
                <DialogDescription>
                  Select a student to track during this session.
                </DialogDescription>
              </DialogHeader>
              
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
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="default"
                  className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                  onClick={handleStartRecording}
                >
                  Start Recording
                </Button>
              </DialogFooter>
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
                  key={activeStudent.id}
                  name={activeStudent.name}
                  avatarUrl={activeStudent.avatarUrl}
                  currentStatus={activeStudent.status}
                  onTagClick={(tag) => handleBehaviorTag(activeStudent.name, tag)}
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
                      <Progress value={understanding} className="h-3 bg-gray-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Attention</span>
                        <span className="font-medium">{attention}%</span>
                      </div>
                      <Progress value={attention} className="h-3 bg-gray-200" />
                    </div>
                  </div>
                </div>
                
                {/* Transcript */}
                <div className="bg-[#F1F0FB] p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Live Transcript</h3>
                  <div className="bg-white p-4 rounded-xl max-h-60 overflow-y-auto shadow-inner">
                    {transcript.length > 0 ? (
                      transcript.map((text, index) => (
                        <p key={index} className="py-1 border-b border-gray-100 last:border-none">
                          {text}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Waiting for speech...</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
