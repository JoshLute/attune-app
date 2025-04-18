
import React from 'react';
import { AlertTriangle, MessageSquare, Users } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BehaviorMarkerProps {
  cx: number;
  cy: number;
  tag: string;
}

export const BehaviorMarker: React.FC<BehaviorMarkerProps> = ({ cx, cy, tag }) => {
  const getIcon = () => {
    switch (tag) {
      case 'Visibly Confused':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Verbal Outburst':
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'Distracting Others':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <g transform={`translate(${cx - 8},${cy - 8})`}>
            {getIcon()}
          </g>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tag}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
