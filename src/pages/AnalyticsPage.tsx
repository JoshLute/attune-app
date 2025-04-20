
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Mock data for lesson outline
const lessonOutline = [
  { id: 1, topic: "Introduction to Quantum Physics", status: "attentive", timestamp: "00:00:30" },
  { id: 2, topic: "Wave-Particle Duality", status: "confused", timestamp: "00:01:15" },
  { id: 3, topic: "Heisenberg Uncertainty Principle", status: "attentive", timestamp: "00:01:45" },
  { id: 4, topic: "Quantum Entanglement", status: "attentive", timestamp: "00:02:30" },
  { id: 5, topic: "Quantum Computing Applications", status: "confused", timestamp: "00:03:10" },
  { id: 6, topic: "Final Review", status: "attentive", timestamp: "00:04:00" }
];

const UnderstandingSummary = () => {
  // Calculate understanding percentage from mock data
  const totalSegments = lessonOutline.length;
  const attentiveSegments = lessonOutline.filter(segment => segment.status === 'attentive').length;
  const confusedSegments = lessonOutline.filter(segment => segment.status === 'confused').length;
  
  const understandingPercentage = Math.round((attentiveSegments / totalSegments) * 100);
  const confusionPercentage = Math.round((confusedSegments / totalSegments) * 100);
  
  return (
    <Card className="rounded-2xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] border border-purple-100">
      <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
        <CardTitle className="text-xl">Summary</CardTitle>
        <CardDescription className="text-white text-opacity-80">4 Minutes 22 Seconds</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-600">Understanding</span>
          <span className="text-2xl font-bold text-[hsl(var(--attune-purple))]">{understandingPercentage}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-green-500" 
            style={{ width: `${understandingPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-600">Confusion</span>
          <span className="text-2xl font-bold text-red-500">{confusionPercentage}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-red-500" 
            style={{ width: `${confusionPercentage}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main AnalyticsPage component with default export
const AnalyticsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UnderstandingSummary />
        {/* Additional analytics components can be added here */}
      </div>
    </div>
  );
};

export default AnalyticsPage;
