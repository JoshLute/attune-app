
import React from 'react';
import { useParams } from 'react-router-dom';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';

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
                <span className="text-gray-700">{statusText[student.status]}</span>
              </div>
            </div>
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
            
            <div className="rounded-2xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] md:col-span-2">
              <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Notes</h2>
              <p className="text-gray-700">{student.notes}</p>
            </div>
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
