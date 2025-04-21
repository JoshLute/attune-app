
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LessonSwitcherProps {
  lessonIds: string[];
  lessonNames: string[];
  value: string;
  onChange: (value: string) => void;
}

export const LessonSwitcher: React.FC<LessonSwitcherProps> = ({
  lessonIds,
  lessonNames,
  value,
  onChange,
}) => (
  <div className="inline-block">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-56 bg-white border-gray-300">
        <SelectValue placeholder="Select Lesson" />
      </SelectTrigger>
      <SelectContent>
        {lessonIds.map((id, idx) => (
          <SelectItem key={id} value={id}>
            {lessonNames[idx] || `Lesson ${idx + 1}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
