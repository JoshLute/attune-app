
import React from 'react';
import { BookOpen, Activity, AlertTriangle, Eye } from 'lucide-react';

interface LessonSegment {
  timestamp: string;
  topic: string;
  status: string;
  transcript: string;
}

interface LessonOutlineProps {
  lessonOutline: LessonSegment[];
}

const LessonOutlineCard = ({ item }: { item: LessonSegment }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'attentive':
        return "bg-green-100 text-green-700 border-green-200";
      case 'confused':
        return "bg-red-100 text-red-700 border-red-200";
      case 'inattentive':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'attentive':
        return <Eye size={16} className="text-green-600" />;
      case 'confused':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'inattentive':
        return <Activity size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const statusStyles = getStatusStyles(item.status);
  
  return (
    <div className={`mb-3 rounded-xl p-3 border ${statusStyles} shadow-[2px_2px_5px_rgba(0,0,0,0.08),_-2px_-2px_5px_rgba(255,255,255,0.8)]`}>
      <div className="flex items-center gap-2 mb-1">
        <StatusIcon status={item.status} />
        <h3 className="font-medium">{item.topic}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
      <p className="text-sm">{item.transcript}</p>
    </div>
  );
};

export const LessonOutline = ({ lessonOutline }: LessonOutlineProps) => {
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
