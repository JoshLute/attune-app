
import React from 'react';
import { RecordingSetup } from "@/components/recording/RecordingSetup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

interface SetupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent: string | null;
  setSelectedStudent: (id: string) => void;
  onStartRecording: () => void;
  setupStep: 'student' | 'materials' | 'recording';
  setSetupStep: (step: 'student' | 'materials' | 'recording') => void;
  lessonTitle: string;
  setLessonTitle: (title: string) => void;
}

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

export function SetupDialog({
  isOpen,
  onOpenChange,
  selectedStudent,
  setSelectedStudent,
  onStartRecording,
  setupStep,
  setSetupStep,
  lessonTitle,
  setLessonTitle
}: SetupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onNext={onStartRecording}
            onBack={() => setSetupStep('student')}
            onTitleChange={setLessonTitle}
            title={lessonTitle}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
