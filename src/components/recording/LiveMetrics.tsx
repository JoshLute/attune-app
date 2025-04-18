
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface LiveMetricsProps {
  understanding: number;
  attention: number;
}

export function LiveMetrics({ understanding, attention }: LiveMetricsProps) {
  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl space-y-4">
      <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Metrics</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Understanding</span>
            <span className="font-medium">{understanding}%</span>
          </div>
          <Progress 
            value={understanding} 
            className="h-3 bg-gray-200"
            indicatorColor={understanding < 25 ? '#ef4444' : '#22c55e'} 
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Attention</span>
            <span className="font-medium">{attention}%</span>
          </div>
          <Progress 
            value={attention} 
            className="h-3 bg-gray-200"
            indicatorColor="#3b82f6" 
          />
        </div>
      </div>
    </div>
  );
}
