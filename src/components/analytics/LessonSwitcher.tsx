
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessions } from "@/contexts/SessionsContext";

interface LessonSwitcherProps {
  value: string;
  onChange: (value: string) => void;
}

export const LessonSwitcher: React.FC<LessonSwitcherProps> = ({
  value,
  onChange,
}) => {
  const { sessions } = useSessions();
  
  return (
    <div className="inline-block">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-56 bg-white border-gray-300">
          <SelectValue placeholder="Select Lesson" />
        </SelectTrigger>
        <SelectContent>
          {sessions.map((session) => (
            <SelectItem key={session.id} value={session.id}>
              {session.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
