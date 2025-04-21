import React, { useState, useEffect, useRef } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { RecordingSetup } from "@/components/recording/RecordingSetup";
import BehaviorSidebar from "@/components/recording/BehaviorSidebar";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

type StudentStatus = 'Attentive' | 'Confused' | 'Inattentive';

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

const BEHAVIOR_TAGS = [
  "Visibly Confused",
  "Verbal Outburst",
  "Distracting Others"
];

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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [behaviorEvents, setBehaviorEvents] = useState<{ tag: string, timestamp: number }[]>([]);
  const prevUnderstanding = useRef(understanding);
  const prevAttention = useRef(attention);

  // For animated progress bar
  useEffect(() => { prevUnderstanding.current = understanding }, [understanding]);
  useEffect(() => { prevAttention.current = attention }, [attention]);

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
    
    return () => {
      clearInterval(understandingInterval);
      clearInterval(attentionInterval);
      clearInterval(transcriptInterval);
    };
  };

  // When user clicks main behavior button, open sidebar and add event
  const handleBehaviorClick = () => {
    const tags = [
      "Visibly Confused",
      "Verbal Outburst",
      "Distracting Others"
    ];
    // show sidebar
    // For simplicity, prompt for tag, but in a real UI use a dropdown, etc.
    // For now, just cycle the tags for demo.
    const lastEvent = behaviorEvents[behaviorEvents.length - 1];
    let nextTagIdx = 0;
    if (lastEvent) {
      const lastTagIdx = tags.findIndex(t => t === lastEvent.tag);
      nextTagIdx = (lastTagIdx + 1) % tags.length;
    }
    setBehaviorEvents(evts => [
      ...evts,
      { tag: tags[nextTagIdx], timestamp: recordingTime }
    ]);
  };

  // Handle 3 quick click behavior buttons
  const handleQuickBehavior = (tag: string) => {
    setBehaviorEvents(evts => [
      ...evts,
      { tag, timestamp: recordingTime }
    ]);

    // Show toast notification
    if (activeStudent) {
      toast({
        title: "Behavior Recorded",
        description: `${activeStudent.name} - ${tag}`,
        duration: 3000,
      });
    }
  };

  const handleEndSession = () => {
    navigate("/analytics");
  };

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
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">
                  {lessonTitle || "Lesson"}
                </h1>
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
                <div className="rounded-3xl bg-[#F1F0FB] p-6 mb-4 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={activeStudent.avatarUrl}
                        alt={activeStudent.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{activeStudent.name}</h3>
                        {understanding < 25 && (
                          <span className="inline-flex items-center w-fit mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold">Confused</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[hsl(var(--attune-purple))]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="font-mono text-lg">
                        {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  
                  {/* 3 Quick Behavior Buttons */}
                  <div className="flex gap-3">
                    {BEHAVIOR_TAGS.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleQuickBehavior(tag)}
                        className="transition-transform duration-200 flex-1 px-4 py-3 rounded-full bg-[hsl(var(--attune-purple))] text-white font-semibold text-base shadow-md hover:scale-105 active:scale-100 focus:outline-none"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Metrics */}
                <div className="bg-[#F1F0FB] p-6 rounded-3xl space-y-4">
                  <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Understanding</span>
                        <span className="font-medium">{understanding}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-700"
                          style={{
                            width: `${understanding}%`,
                            backgroundColor: understanding < 25 ? '#ef4444' : '#22c55e',
                            transitionProperty: "width, background-color"
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Attention</span>
                        <span className="font-medium">{attention}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-700"
                          style={{
                            width: `${attention}%`,
                            transitionProperty: "width"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Transcript (collapsible) */}
                <div className="bg-[#F1F0FB] p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Live Transcript</h3>
                  <div>
                    <div className="w-full">
                      <Accordion type="single" collapsible defaultValue={transcript.length > 0 ? "open" : undefined}>
                        <AccordionItem value="open" className="border-none rounded-xl bg-white p-0">
                          <AccordionTrigger className="px-3 py-2 rounded-xl focus:outline-none text-base font-medium text-left bg-white hover:bg-gray-100">
                            {transcript.length > 0 ? "Show Transcript" : "Waiting for speech..."}
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-4 pt-1 max-h-60 overflow-y-auto shadow-inner bg-white rounded-b-xl">
                            {transcript.length > 0 ? (
                              transcript.map((text, index) => (
                                <p key={index} className="py-1 border-b border-gray-100 last:border-none">
                                  {text}
                                </p>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">Waiting for speech...</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
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
