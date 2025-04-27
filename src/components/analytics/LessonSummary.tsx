
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from '@/components/ui/scroll-area';

// The suggested colors for bars
const understandingColor = "#1E90FF"; // blue
const attentionColor = "#22c55e"; // green

interface LessonSummaryProps {
  understanding: number;
  attention: number;
  summary: string;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  understanding,
  attention,
  summary,
}) => (
  <ScrollArea className="h-[120px] w-full">
    <span className="text-base text-gray-600">Understanding</span>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
          <Progress value={understanding} indicatorColor={understandingColor} className="h-4 bg-gray-200 transition-all duration-300" />
        </div>
        {/* <div className="flex justify-end text-sm text-gray-600 mb-1">{understanding}%</div> */}

        <span className="text-base text-gray-600">Attention</span>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
          <Progress value={attention} indicatorColor={attentionColor} className="h-4 bg-gray-200 transition-all duration-300" />
        </div>
        {/* <div className="flex justify-end text-sm text-gray-600 mb-1">{attention}%</div> */}


    </ScrollArea>

);
