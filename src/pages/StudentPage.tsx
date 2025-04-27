
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LessonSwitcher } from "@/components/analytics/LessonSwitcher";
import { Separator } from '@/components/ui/separator';
import { BookOpen, Activity, AlertTriangle, Eye, Download, FileText, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Note, NotesSection } from '@/components/analytics/NotesSection';
import axios from 'axios';

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



// Request student lessons from the server
async function requestStudentLessons(studentId) {
  const data = {
    id: studentId,
    timeRange: "lesson"
  };
  let response = await axios.post('http://localhost:5001/student_lessons', data);
  return response.data.lessons;
  // console.log(response.data.history);
}

// Request student data from the server
async function requestLessonData(studentId, lesson) {
  const data = {
    id: studentId,
    lesson: lesson,
    timeRange: "lesson"
  };
  let response = await axios.post('http://localhost:5001/student_history', data);

  // console.log(response.data);
  // let response_obj = JSON.parse(response.data);
  // console.log(response.data.transcripts)
  return [response.data.history, response.data.transcripts];
}

// Request student data from the server
async function requestWeekData(studentId) {
  const data = {
    id: studentId,
    timeRange: "week"
  };
  let response = await axios.post('http://localhost:5001/student_history', data);
  console.log(response.data);
  return response.data.history;
}

async function requestMonthData(studentId) {
  const data = {
    id: studentId,
    timeRange: "week"
  };
  let response = await axios.post('http://localhost:5001/student_history', data);
  return response.data.history;
  // console.log(response.data.history);
}

async function requestYearData(studentId) {
  const data = {
    id: studentId,
    timeRange: "year"
  };
  let response = await axios.post('http://localhost:5001/student_history', data);
  return response.data.history;
  // console.log(response.data.history);
}


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
  const [timestampNotes, setTimestampNotes] = useState<Note[]>([]);
  const [understanding, setUnderstanding] = useState(0);
  const [attention, setAttention] = useState(0);
  const [status, setStatus] = useState("");


  const [analyticsData, setAnalyticsData] = useState<Array<{
    timestamp: string;
    attention: number;
    understanding: number;
  }>>([]);
  const [timeRange, setTimeRange] = useState<'lesson' | 'week' | 'month' | 'year'>('lesson');
  const [isLoading, setIsLoading] = useState(true);
  // TODO: change this to dynamically list the sessions for given student
  const [lessons, setLessons] = useState<string[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  
  const { toast } = useToast();

  // requestStudentData(studentId)
  // console.log(student_data);

  useEffect(() => {
    if (studentId) {

      // const student = studentsData[studentId];)
      console.log("Refresh (Student changed)");
      setTimestampNotes([]);
      setUnderstanding(0);
      setAttention(0);
      setStatus("");
      setAnalyticsData([]);
      setLessons([]);
      setSelectedLessonId("");
      setIsLoading(false);
    }
  
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setLessons(await requestStudentLessons(studentId));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      }
    };
  
    fetchAnalytics();
  }, [studentId]);

  
  useEffect(() => {
    const updateAnalytics = async () => {
      if (!studentId) return;
      
      let data = [];
  
      if (timeRange === "lesson" && selectedLessonId !== '') {
        const [lessonData] = await requestLessonData(studentId, selectedLessonId);
        data = lessonData;
      } else if (timeRange === "week") {
        data = await requestWeekData(studentId);
      } else if (timeRange === "month") {
        data = await requestMonthData(studentId);
      } else if (timeRange === "year") {
        data = await requestYearData(studentId);
      }
  
      setAnalyticsData(data);
      updateAverages(data);
    };
  
    updateAnalytics();
  }, [timeRange]);
  



  function updateAverages(data){
    // Get average understanding and attention
    const totals = data.reduce(
      (acc, item) => {
        acc.understanding += item.understanding;
        acc.attention += item.attention;
        acc.confusion += item.confused;
        return acc;
      },
      { understanding: 0, attention: 0, confusion: 0 }
    );
    
    const count = data.length;
    
    const averageUnderstanding = totals.understanding / count;
    const averageAttention = totals.attention / count;
    const averageConfusion = totals.confusion / count;

    setUnderstanding(averageUnderstanding);
    setAttention(averageAttention);
    
    if((averageUnderstanding+averageConfusion)>0){
      if(averageAttention < 50){
        setStatus("inattentive");
      } else if(averageConfusion > averageUnderstanding){
        setStatus("confused");
      } else {
        setStatus("attentive");
      }
    }
  }



  const handleLessonChange = async (newValue: string) => {
    setSelectedLessonId(newValue);
    let [data, transcripts] = await requestLessonData(studentId, newValue);
    setTimeRange("lesson");
    console.log(data);
    setAnalyticsData(data);
    updateAverages(data);



    let transcriptNotesObjs = []
    for(let i = 0; i<transcripts.length; i++){
      if (transcripts[i] == "-"){
        continue;
      }


      let highest = data[i].understanding;
      let state = "Understanding";
      let color = "green";

      if (data[i].confused > highest){
        highest = data[i].confused;
        state = "Confused"
        color = "red";
      }


      console.log(transcripts[i]);

      const curNote: Note = {
        id: i,
        content: transcripts[i],
        state: state,
        color: color,
        score: highest,
      };
      transcriptNotesObjs.push(curNote);
    }

    setTimestampNotes(() => transcriptNotesObjs);
    // setTimestampNotes(transcriptNotesObjs)
    // console.log(timestampNotes);
    // console.log(data);
  };


  const handleTimeRangeChange = async (newValue: string) => {
    // Push data of just that lesson
    let data = []

    if(newValue == "lesson"){
      // setSelectedLessonId(newValue);
      if(selectedLessonId == ''){
        return;
      }
      console.log(selectedLessonId);
      // data = await requestLessonData(studentId, selectedLessonId);
      // setTimeRange("lesson");
      handleLessonChange(selectedLessonId);
    }

    // Push data of just the past week
    else if (newValue == "week"){
      data = await requestWeekData(studentId);
      setTimeRange("week");
      setTimestampNotes([]);
      // setAnalyticsData(data)
    }
    
    // Push data of just the past month
    else if (newValue == "month"){
      data = await requestMonthData(studentId);
      setTimeRange("month");
      setTimestampNotes([]);
      // setAnalyticsData(data)
    }

    // Push data of the past year
    else if (newValue == "year"){
      data = await requestYearData(studentId);
      setTimeRange("year");
      setTimestampNotes([]);
      // setAnalyticsData(data)
    }
    // console.log(data);
    // updateAverages(data);
    setAnalyticsData(data);
  };



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
    inattentive: "bg-gray-500",
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
    confused: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    control: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
  };

  // Get student-specific chart data for the selected time range
  /*const chartDataOld = studentId && analyticsDataByStudent[studentId] 
    ? analyticsDataByStudent[studentId][timeRange]
    : [];*/

  let chartData = []
  const chartDataLoading = analyticsData;//studentsData[studentId]['day']
  if (!isLoading) {
    chartData = chartDataLoading
  }
  // console.log("Chart data", chartData);
  // console.log("Chart data", chartData);
  

  const studentSuggestions = aiSuggestionsByStudent[studentId as keyof typeof aiSuggestionsByStudent] || [];
  

  
  // Get time range title
  const getTimeRangeTitle = () => {
    switch(timeRange) {
      case 'lesson':
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
                  <span className={`h-3 w-3 rounded-full mr-2 ${statusColors[status]}`}></span>
                  <span className="text-gray-700 flex items-center gap-2">
                    {statusText[status]}
                    <StatusIcon status={status} />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <LessonSwitcher
                value={selectedLessonId}
                onChange={handleLessonChange}
                lessons = {lessons}
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
                  <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{student.name}'s {getTimeRangeTitle()}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.08)]">
                    <Button
                      variant={timeRange == 'lesson' ? 'default' : 'outline'}
                      className={`rounded-r-none border-r-0 ${timeRange == 'lesson' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => handleTimeRangeChange('lesson')}
                    >
                      Lesson
                    </Button>
                    <Button
                      variant={timeRange === 'week' ? 'default' : 'outline'}
                      className={`rounded-none border-x-0 ${timeRange === 'week' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => handleTimeRangeChange('week')}
                    >
                      Week
                    </Button>
                    <Button
                      variant={timeRange === 'month' ? 'default' : 'outline'}
                      className={`rounded-l-none border-l-0 ${timeRange === 'month' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
                      size="sm"
                      onClick={() => handleTimeRangeChange('month')}
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
                      data={chartData.map(({ transcript, ...rest }) => rest)}
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
                        stroke="#FC6203"
                        fill="#FF99EE"
                        fillOpacity={0.3}
                      />

                      <Area
                        type="monotone"
                        dataKey="confused"
                        name="Confused"
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
            
            <NotesSection notes={timestampNotes} setNotes={setTimestampNotes} understanding={understanding} setUnderstanding={setUnderstanding} attention={attention} setAttention={setAttention}/>
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
              {status === 'attentive' && 
                `${student.name} has been performing well in class, demonstrating strong engagement with an understanding level of ${understanding}%. 
                Continue with the current teaching approach while offering additional challenges to maintain interest.`
              }
              {status === 'confused' && 
                `${student.name} appears to be struggling with recent material, showing only ${understanding}% understanding. 
                Consider scheduling a one-on-one session to identify specific areas of difficulty and provide additional support.`
              }
              {status === 'inattentive' && 
                `${student.name}'s attention level has been concerning recently, with focus metrics at only ${attention}%. 
                Understanding is at ${understanding}%. Try incorporating more interactive elements that might better engage this learning style.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
