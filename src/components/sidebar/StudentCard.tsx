
import React from 'react';
import { cn } from "@/lib/utils";

type StudentStatus = 'attentive' | 'confused' | 'inattentive';

interface StudentCardProps {
  name: string;
  status: StudentStatus;
  avatarUrl: string;
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

export function StudentCard({ name, status, avatarUrl }: StudentCardProps) {
  return (
    <div className="bg-[hsl(var(--attune-light-purple))] rounded-xl p-3 mb-3 flex items-center">
      <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center">
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="ml-3">
        <h3 className="text-white text-sm font-semibold">{name}</h3>
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
