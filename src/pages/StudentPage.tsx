
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Activity, AlertTriangle, Eye, Download, FileText, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentData {
  id: number;
  name: string;
  status: 'attentive' | 'confused' | 'inattentive';
  avatarUrl: string;
  understanding: number;
  confusion: number;
  engagement: number;
  notes: string;
}

// Mock student data
const studentsData: Record<string, StudentData> = {
  'jonathan': {
    id: 1,
    name: 'Jonathan Sum',
    status: 'attentive',
    avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=jonathan',
    understanding: 68,
    confusion: 32,
    engagement: 85,
    notes: 'Jonathan has been showing good progress in recent lessons. Asks insightful questions.'
  },
  'jp': {
    id: 2,
    name: 'JP Vela',
    status: 'confused',
    avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=jp',
    understanding: 24,
    confusion: 76,
    engagement: 45,
    notes: 'JP has been struggling with recent topics. Consider additional 1:1 time.'
  },
  'cooper': {
    id: 3,
    name: 'Cooper Randeen',
    status: 'inattentive',
    avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=cooper',
    understanding: 45,
    confusion: 55,
    engagement: 30,
    notes: 'Cooper seems distracted in class. Check in on external factors affecting focus.'
  }
};

// Mock data for student analytics - different for each student and timeframes
const analyticsDataByStudent = {
  'jonathan': {
    'day': [
      { timestamp: '9:00 AM', attention: 85, understanding: 75 },
      { timestamp: '10:00 AM', attention: 90, understanding: 80 },
      { timestamp: '11:00 AM', attention: 80, understanding: 70 },
      { timestamp: '1:00 PM', attention: 95, understanding: 85 },
      { timestamp: '2:00 PM', attention: 85, understanding: 90 },
    ],
    'week': [
      { timestamp: 'Mon', attention: 85, understanding: 70 },
      { timestamp: 'Tue', attention: 90, understanding: 75 },
      { timestamp: 'Wed', attention: 88, understanding: 80 },
      { timestamp: 'Thu', attention: 92, understanding: 85 },
      { timestamp: 'Fri', attention: 95, understanding: 90 },
    ],
    'month': [
      { timestamp: 'Week 1', attention: 80, understanding: 75 },
      { timestamp: 'Week 2', attention: 85, understanding: 80 },
      { timestamp: 'Week 3', attention: 90, understanding: 85 },
      { timestamp: 'Week 4', attention: 95, understanding: 90 },
    ],
  },
  'jp': {
    'day': [
      { timestamp: '9:00 AM', attention: 40, understanding: 30 },
      { timestamp: '10:00 AM', attention: 35, understanding: 25 },
      { timestamp: '11:00 AM', attention: 30, understanding: 20 },
      { timestamp: '1:00 PM', attention: 25, understanding: 15 },
      { timestamp: '2:00 PM', attention: 45, understanding: 35 },
    ],
    'week': [
      { timestamp: 'Mon', attention: 45, understanding: 35 },
      { timestamp: 'Tue', attention: 30, understanding: 20 },
      { timestamp: 'Wed', attention: 25, understanding: 15 },
      { timestamp: 'Thu', attention: 40, understanding: 30 },
      { timestamp: 'Fri', attention: 35, understanding: 25 },
    ],
    'month': [
      { timestamp: 'Week 1', attention: 50, understanding: 40 },
      { timestamp: 'Week 2', attention: 40, understanding: 30 },
      { timestamp: 'Week 3', attention: 30, understanding: 20 },
      { timestamp: 'Week 4', attention: 35, understanding: 25 },
    ],
  },
  'cooper': {
    'day': [
      { timestamp: '9:00 AM', attention: 55, understanding: 45 },
      { timestamp: '10:00 AM', attention: 40, understanding: 35 },
      { timestamp: '11:00 AM', attention: 30, understanding: 25 },
      { timestamp: '1:00 PM', attention: 35, understanding: 30 },
      { timestamp: '2:00 PM', attention: 45, understanding: 40 },
    ],
    'week': [
      { timestamp: 'Mon', attention: 60, understanding: 50 },
      { timestamp: 'Tue', attention: 40, understanding: 45 },
      { timestamp: 'Wed', attention: 35, understanding: 30 },
      { timestamp: 'Thu', attention: 30, understanding: 25 },
      { timestamp: 'Fri', attention: 45, understanding: 40 },
    ],
    'month': [
      { timestamp: 'Week 1', attention: 55, understanding: 50 },
      { timestamp: 'Week 2', attention: 45, understanding: 40 },
      { timestamp: 'Week 3', attention: 40, understanding: 35 },
      { timestamp: 'Week 4', attention: 50, understanding: 45 },
    ],
  },
};

// Student-specific AI suggestions
const aiSuggestionsByStudent = {
  'jonathan': [
    "Jonathan responds well to visual learning materials",
    "Consider giving Jonathan more advanced challenges to maintain engagement"
  ],
  'jp': [
    "Break down complex topics into smaller chunks for JP",
    "JP would benefit from additional practice problems with step-by-step solutions"
  ],
  'cooper': [
    "Cooper engages more during interactive activities",
    "Try seating Cooper away from distractions and closer to the front of class"
  ],
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

const StudentPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const student = studentId ? studentsData[studentId] : null;
  const [notes, setNotes] = useState(student?.notes || '');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const { toast } = useToast();

  if (!student) {
    return (
      <div className="flex h-screen bg-white">
        <AttuneSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">Student Not Found</h1>
            <p className="mt-4">Sorry, we couldn't find this student in our records.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    attentive: "bg-green-500",
    confused: "bg-red-500",
    inattentive: "bg-yellow-500"
  };

  const statusText = {
    attentive: "Attentive",
    confused: "Confused",
    inattentive: "Inattentive"
  };

  const handleSaveNotes = () => {
    // In a real app, this would update to the backend
    studentsData[studentId!].notes = notes;
    toast({
      title: `Notes saved for ${student.name}`,
      description: "Student notes have been updated",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: `Report Downloaded`,
      description: `${student.name}'s progress report has been downloaded`,
    });
  };

  const chartConfig = {
    attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
  };

  // Get student-specific chart data for the selected time range
  const chartData = studentId && analyticsDataByStudent[studentId] 
    ? analyticsDataByStudent[studentId][timeRange]
    : [];
    
  const studentSuggestions = aiSuggestionsByStudent[studentId as keyof typeof aiSuggestionsByStudent] || [];

  // Calculate understanding percentage based on the most recent data point
  const latestDataPoint = chartData[chartData.length - 1];
  const understandingPercentage = latestDataPoint ? latestDataPoint.understanding : student.understanding;
  
  // Calculate time proportions based on student status
  const getTimeProps = () => {
    switch(student.status) {
      case 'attentive':
        return { attentive: '7m 00s', confused: '3m 00s', inattentive: '5m 00s', attentivePerc: '47%', confusedPerc: '20%', inattentivePerc: '33%' };
      case 'confused':
        return { attentive: '3m 00s', confused: '9m 00s', inattentive: '3m 00s', attentivePerc: '20%', confusedPerc: '60%', inattentivePerc: '20%' };
      case 'inattentive':
        return { attentive: '2m 00s', confused: '3m 00s', inattentive: '10m 00s', attentivePerc: '13%', confusedPerc: '20%', inattentivePerc: '67%' };
      default:
        return { attentive: '5m 00s', confused: '5m 00s', inattentive: '5m 00s', attentivePerc: '33%', confusedPerc: '33%', inattentivePerc: '33%' };
    }
  };
  
  const timeProps = getTimeProps();
  
  // Get time range title
  const getTimeRangeTitle = () => {
    switch(timeRange) {
      case 'day':
        return "Today's Progress";
      case 'week':
        return "Weekly Progress";
      case 'month':
        return "Monthly Progress";
      default:
        return "Progress";
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)] mr-4">
                <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">{student.name}</h1>
                <div className="flex items-center mt-1">
                  <span className={`h-3 w-3 rounded-full mr-2 ${statusColors[student.status]}`}></span>
                  <span className="text-gray-700 flex items-center gap-2">
                    {statusText[student.status]}
                    <StatusIcon status={student.status} />
                  </span>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleDownloadReport} 
              className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-dark-purple))]"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
                  <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{student.name}'s {getTimeRangeTitle()}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.08)]">
                    <Button
                      variant={timeRange === 'day' ? 'default' : 'outline'}
                      className={`rounded-r-none border-r-0 ${timeRange === 'day' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('day')}
                    >
                      Day
                    </Button>
                    <Button
                      variant={timeRange === 'week' ? 'default' : 'outline'}
                      className={`rounded-none border-x-0 ${timeRange === 'week' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('week')}
                    >
                      Week
                    </Button>
                    <Button
                      variant={timeRange === 'month' ? 'default' : 'outline'}
                      className={`rounded-l-none border-l-0 ${timeRange === 'month' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => setTimeRange('month')}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
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
            </div>
            
            <div>
              <Card className="rounded-2xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] border border-purple-100">
                <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
                  <CardTitle className="text-xl">Summary</CardTitle>
                  <CardDescription className="text-white text-opacity-80">{getTimeRangeTitle()}</CardDescription>
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
                        <TableCell className="text-right">{timeProps.attentive}</TableCell>
                        <TableCell className="text-right">{timeProps.attentivePerc}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-red-600" /> Confused
                        </TableCell>
                        <TableCell className="text-right">{timeProps.confused}</TableCell>
                        <TableCell className="text-right">{timeProps.confusedPerc}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-1">
                          <Activity size={14} className="text-yellow-600" /> Inattentive
                        </TableCell>
                        <TableCell className="text-right">{timeProps.inattentive}</TableCell>
                        <TableCell className="text-right">{timeProps.inattentivePerc}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <div className="flex items-center mb-4">
                <Lightbulb className="mr-2 text-[hsl(var(--attune-purple))]" />
                <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Teaching Suggestions</h2>
              </div>
              <div className="space-y-3">
                {studentSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="rounded-xl py-2 px-4 bg-white border border-purple-100 shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)]"
                  >
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Notes</h2>
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </div>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px] w-full p-3 border rounded-md"
                placeholder={`Add detailed notes about ${student.name}...`}
              />
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
            <div className="flex items-center mb-4">
              <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Performance Insights</h2>
            </div>
            <p className="mb-4">
              {student.status === 'attentive' && 
                `${student.name} has been performing well in class, demonstrating strong engagement with an understanding level of ${understandingPercentage}%. 
                Continue with the current teaching approach while offering additional challenges to maintain interest.`
              }
              {student.status === 'confused' && 
                `${student.name} appears to be struggling with recent material, showing only ${understandingPercentage}% understanding. 
                Consider scheduling a one-on-one session to identify specific areas of difficulty and provide additional support.`
              }
              {student.status === 'inattentive' && 
                `${student.name}'s attention level has been concerning recently, with focus metrics at only ${student.engagement}%. 
                Understanding is at ${understandingPercentage}%. Try incorporating more interactive elements that might better engage this learning style.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
