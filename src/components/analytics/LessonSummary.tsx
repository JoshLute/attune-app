
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  <Card className="rounded-2xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] border border-purple-100">
    <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
      <CardTitle className="text-xl">Summary</CardTitle>
      <CardDescription className="text-white text-opacity-80">4 Minutes 22 Seconds</CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="mb-2">
        <span className="text-base text-gray-600">Understanding</span>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
          <Progress value={understanding} indicatorColor={understandingColor} className="h-4 bg-gray-200 transition-all duration-300" />
        </div>
        <div className="flex justify-end text-sm text-gray-600 mb-1">{understanding}%</div>
      </div>
      <div className="mb-2">
        <span className="text-base text-gray-600">Attention</span>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
          <Progress value={attention} indicatorColor={attentionColor} className="h-4 bg-gray-200 transition-all duration-300" />
        </div>
        <div className="flex justify-end text-sm text-gray-600 mb-1">{attention}%</div>
      </div>
      <div className="mt-4">
        <h4 className="text-base font-semibold text-gray-700">What was said</h4>
        <p className="text-sm mt-1 text-gray-700">{summary}</p>
      </div>
    </CardContent>
  </Card>
);
