
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BehaviorTag = 'Attentive' | 'Confused' | 'Inattentive' | 'Visibly Confused' | 'Verbal Outburst' | 'Distracting Others';

interface StudentRecordingCardProps {
  name: string;
  avatarUrl: string;
  currentStatus: 'Attentive' | 'Confused' | 'Inattentive';
  onTagClick: (tag: BehaviorTag) => void;
}

export function StudentRecordingCard({ name, avatarUrl, currentStatus, onTagClick }: StudentRecordingCardProps) {
  const statusColors = {
    Attentive: "bg-green-500 hover:bg-green-600",
    Confused: "bg-red-500 hover:bg-red-600",
    Inattentive: "bg-yellow-500 hover:bg-yellow-600"
  };

  const behaviorTags: BehaviorTag[] = ['Visibly Confused', 'Verbal Outburst', 'Distracting Others'];

  return (
    <div className="rounded-3xl bg-[#F1F0FB] p-6 mb-4 flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{name}</h3>
          <Badge 
            className={cn(
              "w-fit mt-1",
              statusColors[currentStatus]
            )}
          >
            {currentStatus}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {behaviorTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-2 border border-gray-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
