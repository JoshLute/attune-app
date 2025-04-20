import React, { useEffect, useState } from 'react';
import { AttuneSidebar } from "@/components/sidebar/AttuneSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TranscriptSection } from "@/components/recording/TranscriptSection";
import { useNavigate } from "react-router-dom";
import { BarChart } from 'lucide-react';

// A simple line chart using recharts
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const summary = {
  duration: '4 Minutes 22 Seconds',
  understanding: 70,
  confusion: 30,
};
const lessonTitle = sessionStorage.getItem('currentLessonTitle') || 'Recent Lesson';
const transcript = JSON.parse(sessionStorage.getItem('currentTranscript') || '[]');

// Graph Data Example
const chartData = [
  { name: '0:30', Understanding: 95, Confusion: 5 },
  { name: '1:15', Understanding: 80, Confusion: 20 },
  { name: '1:45', Understanding: 78, Confusion: 22 },
  { name: '2:30', Understanding: 70, Confusion: 30 },
  { name: '3:10', Understanding: 59, Confusion: 41 },
  { name: '4:00', Understanding: 60, Confusion: 40 },
];

const AnalyticsPage = () => {
  // Optionally, retrieve dynamic session data, such as transcript
  const [liveTranscript, setLiveTranscript] = useState<string[]>(transcript);

  useEffect(() => {
    // If you want to keep transcript live as updates happen
    const handleStorage = () => {
      const updated = JSON.parse(sessionStorage.getItem('currentTranscript') || '[]');
      setLiveTranscript(updated);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">
                Analytics Dashboard
              </h1>
              <div className="mt-1 text-gray-500 text-md">
                <span className="font-semibold text-gray-700">Lesson:</span> {lessonTitle}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-2 bg-[hsl(var(--attune-light-purple))] text-[hsl(var(--attune-purple))] px-4 py-2 rounded-lg text-sm font-medium">
                <BarChart className="w-4 h-4" /> Analytics
              </span>
            </div>
          </div>
          {/* Summaries and Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="rounded-2xl overflow-hidden shadow border border-purple-100">
              <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
                <CardTitle className="text-xl">Summary</CardTitle>
                <CardDescription className="text-white text-opacity-80">
                  {summary.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg text-gray-700">Understanding</span>
                  <span className="text-2xl font-bold text-[hsl(var(--attune-purple))]">{summary.understanding}%</span>
                </div>
                <Progress value={summary.understanding} className="h-3 bg-gray-200 mb-3" indicatorColor="#22c55e" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg text-gray-700">Confusion</span>
                  <span className="text-2xl font-bold text-red-500">{summary.confusion}%</span>
                </div>
                <Progress value={summary.confusion} className="h-3 bg-gray-200" indicatorColor="#ef4444" />
              </CardContent>
            </Card>
            {/* Graph section */}
            <Card className="rounded-2xl overflow-hidden shadow border border-purple-100">
              <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
                <CardTitle className="text-xl">Class Engagement Over Time</CardTitle>
                <CardDescription className="text-white text-opacity-80">Lesson Timeline</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 min-h-[260px]">
                <ResponsiveContainer width="100%" height={190}>
                  <ReBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Understanding" fill="#22c55e" />
                    <Bar dataKey="Confusion" fill="#ef4444" />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Live Transcript Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-[hsl(var(--attune-purple))]">Live Transcript</h2>
            <div className="bg-[#F1F0FB] p-6 rounded-3xl">
              <div className="bg-white p-4 rounded-xl max-h-60 min-h-[80px] overflow-y-auto shadow-inner">
                {liveTranscript.length > 0 ? (
                  liveTranscript.map((text, idx) => (
                    <p key={idx} className="py-1 border-b border-gray-100 last:border-none">
                      {text}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No transcript has been recorded for this session yet.</p>
                )}
              </div>
            </div>
          </div>
          {/* Optionally add more analytics sections */}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
