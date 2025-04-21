import React, { useState } from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BookOpen, Activity, AlertTriangle, Eye, Lightbulb, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LessonSummary } from "@/components/analytics/LessonSummary";
import { LessonSwitcher } from "@/components/analytics/LessonSwitcher";
import { PartsToReviewSection } from "@/components/analytics/PartsToReviewSection";

// Mock data for the analytics chart
const analyticsDataToday = [
  { timestamp: '00:00', attention: 90, understanding: 95, transcript: "Today we're going to learn about photosynthesis." },
  { timestamp: '02:30', attention: 85, understanding: 80, transcript: "The process requires sunlight, water, and carbon dioxide." },
  { timestamp: '05:00', attention: 60, understanding: 40, transcript: "The light reactions happen in the thylakoid membrane." },
  { timestamp: '07:30', attention: 70, understanding: 30, transcript: "ATP and NADPH are produced in this stage." },
  { timestamp: '10:00', attention: 80, understanding: 60, transcript: "Next, the Calvin cycle uses these products." },
  { timestamp: '12:30', attention: 90, understanding: 85, transcript: "Carbon fixation happens during this cycle." },
  { timestamp: '15:00', attention: 95, understanding: 90, transcript: "Let's review what we've learned about photosynthesis." },
];

const analyticsDataWeek = [
  { timestamp: 'Mon', attention: 85, understanding: 80, transcript: "Monday's photosynthesis lesson" },
  { timestamp: 'Tue', attention: 75, understanding: 70, transcript: "Tuesday's cellular respiration lesson" },
  { timestamp: 'Wed', attention: 90, understanding: 85, transcript: "Wednesday's genetics lesson" },
  { timestamp: 'Thu', attention: 65, understanding: 55, transcript: "Thursday's evolution lesson" },
  { timestamp: 'Fri', attention: 80, understanding: 75, transcript: "Friday's ecology lesson" },
];

const analyticsDataMonth = [
  { timestamp: 'Week 1', attention: 80, understanding: 75, transcript: "First week of the month" },
  { timestamp: 'Week 2', attention: 85, understanding: 80, transcript: "Second week of the month" },
  { timestamp: 'Week 3', attention: 75, understanding: 70, transcript: "Third week of the month" },
  { timestamp: 'Week 4', attention: 90, understanding: 85, transcript: "Fourth week of the month" },
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

// --- Mock lesson list --- //
const lessons = [
  {
    id: "lesson-1",
    name: "Photosynthesis - April 20",
    analytics: [
      { timestamp: '00:00', attention: 90, understanding: 95, transcript: "Today we're going to learn about photosynthesis." },
      { timestamp: '02:30', attention: 85, understanding: 80, transcript: "The process requires sunlight, water, and carbon dioxide." },
      { timestamp: '05:00', attention: 60, understanding: 40, transcript: "The light reactions happen in the thylakoid membrane." },
      { timestamp: '07:30', attention: 70, understanding: 30, transcript: "ATP and NADPH are produced in this stage." },
      { timestamp: '10:00', attention: 80, understanding: 60, transcript: "Next, the Calvin cycle uses these products." },
      { timestamp: '12:30', attention: 90, understanding: 85, transcript: "Carbon fixation happens during this cycle." },
      { timestamp: '15:00', attention: 95, understanding: 90, transcript: "Let's review what we've learned about photosynthesis." },
    ],
    outline: [
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
    ],
    summary: "This lesson introduced students to photosynthesis, covered the light reactions and Calvin cycle, and ended with a review.",
  },
  {
    id: "lesson-2",
    name: "Genetics - April 18",
    analytics: [
      { timestamp: '00:00', attention: 75, understanding: 70, transcript: "Let's start with basic concepts in genetics." },
      { timestamp: '03:00', attention: 60, understanding: 65, transcript: "A gene is a segment of DNA that codes for a protein." },
      { timestamp: '06:00', attention: 85, understanding: 80, transcript: "Dominant and recessive traits are inherited differently." },
      { timestamp: '09:00', attention: 80, understanding: 85, transcript: "Punnett squares help predict genetic outcomes." }
    ],
    outline: [
      { 
        timestamp: '00:00 - 04:00', 
        topic: 'Introduction to Genetics', 
        status: 'attentive',
        transcript: "Let's start with basic concepts in genetics."
      },
      { 
        timestamp: '04:00 - 07:00', 
        topic: 'Genetic Terminology', 
        status: 'confused',
        transcript: "A gene is a segment of DNA that codes for a protein."
      },
      { 
        timestamp: '07:00 - 10:00', 
        topic: 'Inheritance Patterns', 
        status: 'attentive',
        transcript: "Dominant and recessive traits are inherited differently."
      }
    ],
    summary: "Reviewed basic genetics, gene definitions, and how traits are inherited, using Punnett squares for demonstration.",
  }
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
  // Use the first lesson as default
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const { toast } = useToast();

  // Find the lesson
  const selectedLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];
  const { analytics: analyticsData, outline: lessonOutline, summary } = selectedLesson;

  // Compute average understanding & attention for summary (rounded)
  const understandingAvg = Math.round(
    analyticsData.reduce((acc, cur) => acc + cur.understanding, 0) / analyticsData.length
  );
  const attentionAvg = Math.round(
    analyticsData.reduce((acc, cur) => acc + cur.attention, 0) / analyticsData.length
  );
  
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const lessonTitle = sessionStorage.getItem('currentLessonTitle') || 'Lesson Title';
  
  const getDataByTimeRange = () => {
    switch (timeRange) {
      case 'today':
        return analyticsDataToday;
      case 'week':
        return analyticsDataWeek;
      case 'month':
        return analyticsDataMonth;
      default:
        return analyticsDataToday;
    }
  };
  
  const chartConfig = {
    attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF with the report data
    toast({
      title: "Report Downloaded",
      description: "Your lesson summary report has been downloaded",
    });
    console.log("Downloading report...");
  };
  
  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
              <p className="text-gray-500">Get insights from class sessions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <LessonSwitcher
                lessonIds={lessons.map(l => l.id)}
                lessonNames={lessons.map(l => l.name)}
                value={selectedLessonId}
                onChange={setSelectedLessonId}
              />
              <Button 
                onClick={handleDownloadReport} 
                className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-dark-purple))]"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
                  <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{selectedLesson.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.08)]">
                    <Button
                      variant={timeRange === 'today' ? 'default' : 'outline'}
                      className={`rounded-r-none border-r-0 ${timeRange === 'today' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('today')}
                    >
                      Today
                    </Button>
                    <Button
                      variant={timeRange === 'week' ? 'default' : 'outline'}
                      className={`rounded-none border-x-0 ${timeRange === 'week' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('week')}
                    >
                      This Week
                    </Button>
                    <Button
                      variant={timeRange === 'month' ? 'default' : 'outline'}
                      className={`rounded-l-none border-l-0 ${timeRange === 'month' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('month')}
                    >
                      This Month
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
                    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
                  }}
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
                        dataKey="attention"
                        name="Attention"
                        stroke="#3CB371"
                        fill="#9FE2BF"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="understanding"
                        name="Understanding"
                        stroke="#1E90FF"
                        fill="#ADD8E6"
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
                      <span className="text-sm">{item.transcript}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <AISuggestionsSection />
              <LessonSummary
                understanding={understandingAvg}
                attention={attentionAvg}
                summary={summary}
              />
            </div>
          </div>

          <PartsToReviewSection analytics={analyticsData} className="mt-10" />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
