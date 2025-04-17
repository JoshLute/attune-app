
import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Activity, AlertTriangle, Eye, Lightbulb } from 'lucide-react';

// Mock data for the analytics chart
const analyticsData = [
  { timestamp: '00:00', inattention: 10, confusion: 5, transcript: "Today we're going to learn about photosynthesis." },
  { timestamp: '02:30', inattention: 15, confusion: 20, transcript: "The process requires sunlight, water, and carbon dioxide." },
  { timestamp: '05:00', inattention: 40, confusion: 60, transcript: "The light reactions happen in the thylakoid membrane." },
  { timestamp: '07:30', inattention: 30, confusion: 70, transcript: "ATP and NADPH are produced in this stage." },
  { timestamp: '10:00', inattention: 20, confusion: 40, transcript: "Next, the Calvin cycle uses these products." },
  { timestamp: '12:30', inattention: 10, confusion: 15, transcript: "Carbon fixation happens during this cycle." },
  { timestamp: '15:00', inattention: 5, confusion: 10, transcript: "Let's review what we've learned about photosynthesis." },
];

// Mock data for the lesson outline
const lessonOutline = [
  { 
    timestamp: '00:00 - 05:00', 
    topic: 'Introduction to Photosynthesis', 
    status: 'attentive',
    transcript: "Today we're going to learn about photosynthesis. The process requires sunlight, water, and carbon dioxide."
  },
  { 
    timestamp: '05:00 - 08:00', 
    topic: 'Light Reactions', 
    status: 'confused',
    transcript: "The light reactions happen in the thylakoid membrane. ATP and NADPH are produced in this stage."
  },
  { 
    timestamp: '08:00 - 13:00', 
    topic: 'Calvin Cycle', 
    status: 'inattentive',
    transcript: "Next, the Calvin cycle uses these products. Carbon fixation happens during this cycle."
  },
  { 
    timestamp: '13:00 - 15:00', 
    topic: 'Summary and Review', 
    status: 'attentive',
    transcript: "Let's review what we've learned about photosynthesis."
  },
];

// AI Suggestions for teaching
const aiSuggestions = [
  "Take a break before starting practice problems",
  "Jonathan doesn't like to be called on unless he intentionally raises his hand. His attention decreased significantly"
];

// Helper to determine the status background colors in neumorphic style
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'attentive':
      return "bg-green-100 text-green-700 border-green-200";
    case 'confused':
      return "bg-red-100 text-red-700 border-red-200";
    case 'inattentive':
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Helper to determine the status icon
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'attentive':
      return <Eye size={16} className="text-green-600" />;
    case 'confused':
      return <AlertTriangle size={16} className="text-red-600" />;
    case 'inattentive':
      return <Activity size={16} className="text-yellow-600" />;
    default:
      return null;
  }
};

const LessonOutlineCard = ({ item }: { item: typeof lessonOutline[0] }) => {
  const statusStyles = getStatusStyles(item.status);
  
  return (
    <div className={`mb-3 rounded-xl p-3 border ${statusStyles} shadow-[2px_2px_5px_rgba(0,0,0,0.08),_-2px_-2px_5px_rgba(255,255,255,0.8)]`}>
      <div className="flex items-center gap-2 mb-1">
        <StatusIcon status={item.status} />
        <h3 className="font-medium">{item.topic}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
      <p className="text-sm">{item.transcript}</p>
    </div>
  );
};

const UnderstandingSummary = () => {
  // Calculate understanding percentage from mock data
  const totalSegments = lessonOutline.length;
  const attentiveSegments = lessonOutline.filter(segment => segment.status === 'attentive').length;
  const understandingPercentage = Math.round((attentiveSegments / totalSegments) * 100);
  
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <Eye size={14} className="text-green-600" /> Attentive
              </TableCell>
              <TableCell className="text-right">7m 00s</TableCell>
              <TableCell className="text-right">47%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <AlertTriangle size={14} className="text-red-600" /> Confused
              </TableCell>
              <TableCell className="text-right">3m 00s</TableCell>
              <TableCell className="text-right">20%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <Activity size={14} className="text-yellow-600" /> Inattentive
              </TableCell>
              <TableCell className="text-right">5m 00s</TableCell>
              <TableCell className="text-right">33%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AISuggestionsSection = () => {
  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <Lightbulb className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">AI Suggestions</h2>
      </div>
      <div className="space-y-3">
        {aiSuggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="rounded-xl py-2 px-4 bg-white border border-purple-100 shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)]"
          >
            <p className="text-sm text-gray-700">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const chartConfig = {
    inattention: { theme: { light: "#F9D876", dark: "#E5AC00" } },
    confusion: { theme: { light: "#F97676", dark: "#E50000" } }
  };
  
  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-500 mb-6">Get insights from today's class sessions</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
                  <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Lesson Title</h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="inattention"
                        name="Inattention"
                        stroke="#E5AC00"
                        fill="#F9D876"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="confusion"
                        name="Confusion"
                        stroke="#E50000"
                        fill="#F97676"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 shadow-inner bg-white">
                  {analyticsData.map((item, index) => (
                    <div key={index} className="mb-2">
                      <span className="text-xs font-semibold text-[hsl(var(--attune-purple))]">[{item.timestamp}]</span>
                      <span className="ml-2 text-sm">{item.transcript}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <UnderstandingSummary />
              
              <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
                <div className="flex items-center mb-4">
                  <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
                  <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Lesson Outline</h2>
                </div>
                <div className="overflow-y-auto max-h-[400px] pr-1">
                  {lessonOutline.map((item, index) => (
                    <LessonOutlineCard key={index} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <AISuggestionsSection />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
