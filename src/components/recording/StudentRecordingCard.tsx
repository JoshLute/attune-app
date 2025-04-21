
import React, { useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentRecordingCardProps {
  name: string;
  avatarUrl: string;
  understanding: number;
  attention: number;
  recordingTime: number;
  onBehaviorClick: () => void;
  isBehaviorSidebarOpen: boolean;
}

export function StudentRecordingCard({
  name,
  avatarUrl,
  understanding,
  attention,
  recordingTime,
  onBehaviorClick,
  isBehaviorSidebarOpen
}: StudentRecordingCardProps) {
  const isConfused = understanding < 25;
  const minutes = Math.floor(recordingTime / 60);
  const seconds = recordingTime % 60;

  // Smooth animation for the button
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = () => {
    // Button uses Tailwind for smooth scale, no shake
    if (btnRef.current) {
      btnRef.current.classList.add("scale-105", "shadow-lg", "ring-2", "ring-[#9b87f5]");
      setTimeout(() => {
        btnRef.current?.classList.remove("scale-105", "shadow-lg", "ring-2", "ring-[#9b87f5]");
      }, 180);
    }
    onBehaviorClick();
  };

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
          <span className="font-mono text-lg">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>
      {/* Single behavior button */}
      <div className="flex gap-2">
        <button
          ref={btnRef}
          type="button"
          onClick={handleButtonClick}
          className={cn(
            "flex-grow px-6 py-3 rounded-full bg-[hsl(var(--attune-purple))] text-white shadow-md text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none active:scale-100",
            isBehaviorSidebarOpen && "ring-2 ring-[hsl(var(--attune-purple))]/80"
          )}
        >
          Add Behavior
        </button>
      </div>
    </div>
  );
}
