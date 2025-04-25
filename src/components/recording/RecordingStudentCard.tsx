
import React from 'react';
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

interface RecordingStudentCardProps {
  student: Student;
  understanding: number;
  recordingTime: number;
  onBehaviorClick: (tag: string) => void;
}

const BEHAVIOR_TAGS = [
  "Visibly Confused",
  "Verbal Outburst",
  "Distracting Others"
];

export function RecordingStudentCard({ 
  student, 
  understanding, 
  recordingTime,
  onBehaviorClick 
}: RecordingStudentCardProps) {
  return (
    <div className="rounded-3xl bg-[#F1F0FB] p-6 mb-4 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={student.avatarUrl}
            alt={student.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{student.name}</h3>
            {understanding < 25 && (
              <span className="inline-flex items-center w-fit mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold">Confused</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[hsl(var(--attune-purple))]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-mono text-lg">
            {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
          </span>
        </div>
      </div>
      
      <div className="flex gap-3">
        {BEHAVIOR_TAGS.map(tag => (
          <button
            type="button"
            key={tag}
            onClick={() => onBehaviorClick(tag)}
            className="transition-transform duration-200 flex-1 px-4 py-3 rounded-full bg-[hsl(var(--attune-purple))] text-white font-semibold text-base shadow-md hover:scale-105 active:scale-100 focus:outline-none"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
