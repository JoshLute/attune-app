
import { BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

interface LessonHeaderProps {
  lessonTitle: string;
  setLessonTitle: (title: string) => void;
  previousLessons: Array<{ id: string; title: string }>;
}

export const LessonHeader = ({ lessonTitle, setLessonTitle, previousLessons }: LessonHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center mb-4">
      <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
      {isEditing ? (
        <Input
          className="w-60 text-xl font-semibold"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
        />
      ) : (
        <h2 
          className="text-xl font-semibold text-[hsl(var(--attune-purple))] cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
        >
          {lessonTitle}
        </h2>
      )}
      <div className="ml-4">
        <Select onValueChange={(value) => {
          const lesson = previousLessons.find(l => l.id === value);
          if (lesson) setLessonTitle(lesson.title);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Previous lessons" />
          </SelectTrigger>
          <SelectContent>
            {previousLessons.map(lesson => (
              <SelectItem key={lesson.id} value={lesson.id}>
                {lesson.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
