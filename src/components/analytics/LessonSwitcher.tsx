
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useSessions } from "@/contexts/SessionsContext";


let lessons = []


interface LessonSwitcherProps {
  value: string;
  onChange: (value: string) => void;
  lessons: string[];
}

export const LessonSwitcher: React.FC<LessonSwitcherProps> = ({
  value,
  onChange,
  lessons,
}) => {
  // const { sessions } = useSessions();
  
  return (
    <div className="inline-block">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-56 bg-white border-gray-300">
          <SelectValue placeholder="Select Lesson" />
        </SelectTrigger>
        <SelectContent>
          {lessons.map((lesson) => (
            <SelectItem key={lesson} value={lesson}>
              {lesson}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
