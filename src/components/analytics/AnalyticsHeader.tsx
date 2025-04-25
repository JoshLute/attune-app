
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LessonSwitcher } from './LessonSwitcher';

interface AnalyticsHeaderProps {
  selectedLessonId: string;
  onLessonChange: (id: string) => void;
  onDownloadReport: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedLessonId,
  onLessonChange,
  onDownloadReport
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
        <p className="text-gray-500">Get insights from class sessions</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <LessonSwitcher
          value={selectedLessonId}
          onChange={onLessonChange}
        />
        <Button 
          onClick={onDownloadReport} 
          className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-dark-purple))]"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
};
