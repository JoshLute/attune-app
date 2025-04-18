
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

interface StudentCardProps {
  name: string;
  avatarUrl: string;
  id: string;
  understanding?: number;
  status?: 'attentive' | 'confused' | 'inattentive';
}

export function StudentCard({ name, avatarUrl, id, understanding, status }: StudentCardProps) {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/student/${id}`);
  };

  // Convert the status to an understanding value if provided
  let understandingValue = understanding;
  if (status && !understanding) {
    switch (status) {
      case 'confused':
        understandingValue = 20;
        break;
      case 'inattentive':
        understandingValue = 50;
        break;
      case 'attentive':
      default:
        understandingValue = 90;
        break;
    }
  }

  // Only show confused tag if understanding is below 25%
  const isConfused = understandingValue !== undefined && understandingValue < 25;

  return (
    <div 
      className={cn(
        "bg-[hsl(var(--attune-light-purple))] rounded-xl p-3 mb-3 flex items-center cursor-pointer transition-all duration-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),_-4px_-4px_8px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),_-2px_-2px_4px_rgba(255,255,255,0.5)] hover:translate-y-[-2px]",
        isActive && "bg-[hsl(var(--attune-purple))] text-white",
        "hover:bg-[hsl(var(--attune-purple)/0.8)]"
      )}
      onClick={handleClick}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-inner">
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="ml-3">
        <h3 className={cn(
          "text-sm font-semibold", 
          isActive ? "text-white" : "text-white"
        )}>{name}</h3>
        {isConfused && (
          <span className="text-xs text-red-100">Confused</span>
        )}
      </div>
    </div>
  );
}
