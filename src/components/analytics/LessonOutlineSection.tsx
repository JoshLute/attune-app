
import React from 'react';
import { BookOpen } from 'lucide-react';
import LessonOutlineCard from './LessonOutlineCard';
import { LessonSegment } from '@/types/analytics';

interface LessonOutlineSectionProps {
  lessonOutline: LessonSegment[];
}

const LessonOutlineSection = ({ lessonOutline }: LessonOutlineSectionProps) => {
  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Lesson Outline</h2>
      </div>
      <div className="overflow-y-auto max-h-[250px] pr-1">
        {lessonOutline.map((item, index) => (
          <LessonOutlineCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default LessonOutlineSection;
