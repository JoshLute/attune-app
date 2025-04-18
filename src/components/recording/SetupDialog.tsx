
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RecordingSetup } from "./RecordingSetup";

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

interface SetupDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setupStep: 'student' | 'materials' | 'recording';
  setSetupStep: (step: 'student' | 'materials' | 'recording') => void;
  selectedStudent: string | null;
  setSelectedStudent: (studentId: string) => void;
  lessonTitle: string;
  setLessonTitle: (title: string) => void;
  onStartRecording: () => void;
  students: Student[];
}

export function SetupDialog({
  isOpen,
  setIsOpen,
  setupStep,
  setSetupStep,
  selectedStudent,
  setSelectedStudent,
  lessonTitle,
  setLessonTitle,
  onStartRecording,
  students,
}: SetupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
