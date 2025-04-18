
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { SetupDialog } from "@/components/recording/SetupDialog";
import { LiveMetrics } from "@/components/recording/LiveMetrics";
import { TranscriptDisplay } from "@/components/recording/TranscriptDisplay";
import { useRecordingState } from "@/hooks/useRecordingState";

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

const RecordingPage = () => {
  const navigate = useNavigate();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(true);
  const [setupStep, setSetupStep] = useState<'student' | 'materials' | 'recording'>('student');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  
  const {
    isRecording,
    setIsRecording,
    recordingTime,
    understanding,
    attention,
    transcript,
    setTranscript,
    activeTag,
    setActiveTag,
  } = useRecordingState();

  const handleStartRecording = () => {
    setIsSetupDialogOpen(false);
    setIsRecording(true);
    sessionStorage.setItem('currentLessonTitle', lessonTitle);
  };

  const handleEndSession = () => {
    navigate("/analytics");
  };

  const handleTranscriptUpdate = (text: string) => {
    setTranscript(prev => {
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      const newTranscript = [...prev, ...sentences.map(s => s.trim())];
      sessionStorage.setItem('currentTranscript', JSON.stringify(newTranscript));
      return newTranscript;
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
            setIsOpen={setIsSetupDialogOpen}
            setupStep={setupStep}
            setSetupStep={setSetupStep}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            lessonTitle={lessonTitle}
            setLessonTitle={setLessonTitle}
            onStartRecording={handleStartRecording}
            students={students}
          />
          
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
                <StudentRecordingCard
                  name={activeStudent.name}
                  avatarUrl={activeStudent.avatarUrl}
                  understanding={understanding}
                  attention={attention}
                  recordingTime={recordingTime}
                  onTagClick={(tag) => setActiveTag(activeTag === tag ? null : tag)}
                  activeTag={activeTag}
                />
                
                <LiveMetrics 
                  understanding={understanding}
                  attention={attention}
                />
                
                <TranscriptDisplay 
                  transcript={transcript}
                  isRecording={isRecording}
                  onTranscriptUpdate={handleTranscriptUpdate}
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
