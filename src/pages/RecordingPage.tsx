
import React, { useState } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Button } from "@/components/ui/button";
import { StudentRecordingCard } from "@/components/recording/StudentRecordingCard";
import { useToast } from "@/hooks/use-toast";

type StudentStatus = 'Attentive' | 'Confused' | 'Inattentive';

interface Student {
  id: string;
  name: string;
  status: StudentStatus;
  avatarUrl: string;
}

const RecordingPage = () => {
  const { toast } = useToast();
  const [students] = useState<Student[]>([
    {
      id: "jonathan",
      name: "Jonathan Sum",
      status: "Attentive",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jonathan"
    },
    {
      id: "jp",
      name: "JP Vela",
      status: "Confused",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jp"
    },
    {
      id: "cooper",
      name: "Cooper Randeen",
      status: "Inattentive",
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=cooper"
    }
  ]);

  const handleBehaviorTag = (studentName: string, tag: string) => {
    toast({
      title: "Behavior Tagged",
      description: `${studentName} marked as "${tag}"`,
    });
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">In Session</h1>
            <Button 
              variant="default"
              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
            >
              End Session
            </Button>
          </div>
          
          <div className="space-y-4">
            {students.map((student) => (
              <StudentRecordingCard
                key={student.id}
                name={student.name}
                avatarUrl={student.avatarUrl}
                currentStatus={student.status}
                onTagClick={(tag) => handleBehaviorTag(student.name, tag)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
