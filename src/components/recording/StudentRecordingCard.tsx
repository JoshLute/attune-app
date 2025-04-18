
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Timer } from 'lucide-react';

interface StudentRecordingCardProps {
  name: string;
  avatarUrl: string;
  understanding: number;
  attention: number;
  recordingTime: number;
  onTagClick: (tag: string) => void;
  activeTag: string | null;
}

export function StudentRecordingCard({ 
  name, 
  avatarUrl, 
  understanding,
  attention,
  recordingTime,
  onTagClick,
  activeTag
}: StudentRecordingCardProps) {
  const behaviorTags = ['Visibly Confused', 'Verbal Outburst', 'Distracting Others'];
  const minutes = Math.floor(recordingTime / 60);
  const seconds = recordingTime % 60;

  const isConfused = understanding < 25;

  return (
    <div className="rounded-3xl bg-[#F1F0FB] p-6 mb-4 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{name}</h3>
            {isConfused && (
              <Badge className="w-fit mt-1 bg-red-500 hover:bg-red-600">
                Confused
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[hsl(var(--attune-purple))]">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-lg">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {behaviorTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={cn(
              "px-4 py-2 rounded-full transition-all duration-200",
              activeTag === tag 
                ? "bg-[hsl(var(--attune-purple))] text-white shadow-lg scale-105" 
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
