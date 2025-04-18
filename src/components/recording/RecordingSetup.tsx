
import React from 'react';
import { CurriculumUpload } from './CurriculumUpload';
import { Button } from "@/components/ui/button";

interface RecordingSetupProps {
  onNext: () => void;
  onBack: () => void;
}

export function RecordingSetup({ onNext, onBack }: RecordingSetupProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[hsl(var(--attune-purple))]">Upload Materials</h2>
      <p className="text-gray-600">Add your curriculum, notes, or presentation before starting the recording.</p>
      <CurriculumUpload />
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="bg-[#9b87f5] hover:bg-[#7E69AB]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
