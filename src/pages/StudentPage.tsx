
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, AlertTriangle, Activity } from 'lucide-react';

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

const StudentPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const student = studentId ? studentsData[studentId] : null;
  const [notes, setNotes] = useState(student?.notes || '');
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

  const StatusIcon = () => {
    switch (student.status) {
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

  const getStatusDescription = () => {
    switch (student.status) {
      case 'attentive':
        return `${student.name} is demonstrating strong focus during class sessions. Their engagement metrics show consistent attention.`;
      case 'confused':
        return `${student.name} appears to be struggling with the current material. Consider scheduling a 1:1 session to address concerns.`;
      case 'inattentive':
        return `${student.name} has shown decreased focus in recent sessions. Monitor engagement levels and consider alternative teaching approaches.`;
      default:
        return '';
    }
  };

  const handleSaveNotes = () => {
    // In a real app, this would update to the backend
    toast({
      title: "Notes saved",
      description: "Student notes have been updated",
    });
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-10">
            <div className="h-20 w-20 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-[hsl(var(--attune-purple))]">{student.name}</h1>
              <div className="flex items-center mt-2">
                <span className={`h-3 w-3 rounded-full mr-2 ${statusColors[student.status]}`}></span>
                <span className="text-gray-700 flex items-center gap-2">
                  {statusText[student.status]}
                  <StatusIcon />
                </span>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] mb-6">
            <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-2">Status Assessment</h2>
            <p className="text-gray-700">{getStatusDescription()}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Understanding</h2>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500" 
                  style={{ width: `${student.understanding}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right font-medium">{student.understanding}%</div>
            </div>
            
            <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Confusion</h2>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-500" 
                  style={{ width: `${student.confusion}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right font-medium">{student.confusion}%</div>
            </div>
          </div>
          
          <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Notes</h2>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </div>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[150px] w-full p-3 border rounded-md"
              placeholder="Add detailed notes about this student..."
            />
          </div>
          
          <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
            <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Recent Activity</h2>
            <p className="text-gray-500 italic">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
