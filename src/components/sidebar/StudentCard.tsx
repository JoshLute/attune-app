
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

type StudentStatus = 'attentive' | 'confused' | 'inattentive';

interface StudentCardProps {
  name: string;
  status: StudentStatus;
  avatarUrl: string;
  id: string;
}

const statusColors = {
  attentive: "bg-green-500",
  confused: "bg-red-500",
  inattentive: "bg-yellow-500"
};

const statusText = {
  attentive: "Attentive",
  confused: "Confused",
  inattentive: "Inattentive"
};

export function StudentCard({ name, status, avatarUrl, id }: StudentCardProps) {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/student/${id}`);
  };

  return (
    <div 
      className={cn(
        "bg-[hsl(var(--attune-light-purple))] rounded-xl p-3 mb-3 flex items-center cursor-pointer transition-all duration-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),_-4px_-4px_8px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),_-2px_-2px_4px_rgba(255,255,255,0.5)] hover:translate-y-[-2px]",
        // Add a darker background when active or hovered
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
        <div className="flex items-center">
          <span className={cn("h-2 w-2 rounded-full mr-1", statusColors[status])}></span>
          <span className={cn(
            "text-xs",
            status === 'attentive' && "text-green-100",
            status === 'confused' && "text-red-100",
            status === 'inattentive' && "text-yellow-100"
          )}>
            {statusText[status]}
          </span>
        </div>
      </div>
    </div>
  );
}

