
import React from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { StudentConnectionStatus } from "@/components/recording/StudentConnectionStatus";
import { CurriculumUpload } from "@/components/recording/CurriculumUpload";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

const RecordingPage = () => {
  // Mock data - in a real app this would come from your backend
  const students = [
    {
      name: "Jonathan Sum",
      isConnected: true,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jonathan"
    },
    {
      name: "JP Vela",
      isConnected: false,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jp"
    },
    {
      name: "Cooper Randeen",
      isConnected: false,
      avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=cooper"
    }
  ];

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))] mb-6">Start New Recording</h1>
          
          <div className="grid gap-8">
            {/* Student Connections Section */}
            <div className="rounded-3xl p-8 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <h2 className="text-xl font-semibold mb-4">Student Connections</h2>
              <div className="space-y-2">
                {students.map((student) => (
                  <StudentConnectionStatus
                    key={student.name}
                    name={student.name}
                    isConnected={student.isConnected}
                    avatarUrl={student.avatarUrl}
                  />
                ))}
              </div>
            </div>

            {/* Curriculum Upload Section */}
            <div className="rounded-3xl p-8 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <h2 className="text-xl font-semibold mb-4">Upload Curriculum</h2>
              <CurriculumUpload />
            </div>

            {/* Start Recording Button */}
            <div className="flex justify-center">
              <Button 
                size="lg"
                className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-purple))/0.9] text-white px-8 py-6 text-lg rounded-xl"
              >
                <PlayCircle className="mr-2 h-6 w-6" />
                Start Recording
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;
