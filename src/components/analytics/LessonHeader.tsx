
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Mock data for previous lessons
const previousLessons = [
  { id: '1', title: 'Photosynthesis Basics' },
  { id: '2', title: 'Cell Structure' },
  { id: '3', title: 'Genetics 101' },
  { id: '4', title: 'Evolution Theory' },
];

interface LessonHeaderProps {
  currentLesson: string;
  onLessonChange: (lessonId: string) => void;
}

const LessonHeader = ({ currentLesson, onLessonChange }: LessonHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Genetics 101');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <BookOpen className="text-[hsl(var(--attune-purple))]" />
      {isEditing ? (
        <Input
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="max-w-[200px] text-xl font-semibold"
          autoFocus
        />
      ) : (
        <h2 
          className="text-xl font-semibold text-[hsl(var(--attune-purple))] cursor-pointer" 
          onDoubleClick={handleDoubleClick}
        >
          {lessonTitle}
        </h2>
      )}
      <Select onValueChange={onLessonChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Previous lessons" />
        </SelectTrigger>
        <SelectContent>
          {previousLessons.map((lesson) => (
            <SelectItem key={lesson.id} value={lesson.id}>
              {lesson.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LessonHeader;
