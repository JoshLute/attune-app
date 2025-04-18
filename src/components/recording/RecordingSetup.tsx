
import React, { useState } from 'react';
import { CurriculumUpload } from './CurriculumUpload';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RecordingSetupProps {
  onNext: () => void;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  title: string;
}

export function RecordingSetup({ onNext, onBack, onTitleChange, title }: RecordingSetupProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[hsl(var(--attune-purple))]">Upload Materials</h2>
      <div className="space-y-2">
        <label htmlFor="lesson-title" className="text-sm font-medium text-gray-700">
          Lesson Title
        </label>
        <Input
          id="lesson-title"
          placeholder="Enter lesson title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full"
        />
      </div>
      <p className="text-gray-600">Add your curriculum, notes, or presentation before starting the recording.</p>
      <CurriculumUpload />
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="bg-[#9b87f5] hover:bg-[#7E69AB]"
          disabled={!title.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
