
import React from 'react';
import { AlertTriangle, MessageSquare, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BehaviorTag } from '@/types/BehaviorEvent';

interface BehaviorMarkerProps {
  cx: number;
  cy: number;
  tag: BehaviorTag | string;
  timestamp?: string;
}

export const BehaviorMarker: React.FC<BehaviorMarkerProps> = ({ cx, cy, tag, timestamp }) => {
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
        <TooltipTrigger asChild>
          <g transform={`translate(${cx - 8},${cy - 8})`} style={{ cursor: 'pointer' }}>
            {getIcon()}
          </g>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p className="font-medium">{tag}</p>
            {timestamp && <p className="text-xs text-muted-foreground">{timestamp}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
