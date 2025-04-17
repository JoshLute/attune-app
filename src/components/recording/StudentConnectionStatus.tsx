
import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface StudentConnectionProps {
  name: string;
  isConnected: boolean;
  avatarUrl: string;
}

export function StudentConnectionStatus({ name, isConnected, avatarUrl }: StudentConnectionProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm mb-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <div className={cn(
        "flex items-center gap-2",
        isConnected ? "text-green-500" : "text-red-500"
      )}>
        {isConnected ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5" />
            <span>Waiting...</span>
          </>
        )}
      </div>
    </div>
  );
}
