
import React, { useEffect } from 'react';

interface LiveMetricsProps {
  understanding: number;
  attention: number;
  onMetricsUpdate?: (attention: number, understanding: number) => void;
}

export function LiveMetrics({ 
  understanding = 0, 
  attention = 0, 
  onMetricsUpdate 
}: LiveMetricsProps) {
  // Send metrics to parent component for tracking when they change
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(attention, understanding);
    }
  }, [attention, understanding, onMetricsUpdate]);

  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl space-y-4">
      <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Live Metrics</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Understanding</span>
            <span className="font-medium">{Math.round(understanding)}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-700"
              style={{
                width: `${understanding}%`,
                backgroundColor: understanding < 25 ? '#ef4444' : '#22c55e',
                transitionProperty: "width, background-color"
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Attention</span>
            <span className="font-medium">{Math.round(attention)}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{
                width: `${attention}%`,
                transitionProperty: "width"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
