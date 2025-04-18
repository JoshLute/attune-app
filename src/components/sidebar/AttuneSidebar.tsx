
import React from 'react';
import { AttuneIcon } from './AttuneIcon';
import { StudentCard } from './StudentCard';
import { NavItem } from './NavItem';
import { SidebarSection } from './SidebarSection';
import { ProfileSection } from './ProfileSection';
import { Home, FileText, BarChart, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function AttuneSidebar() {
  const location = useLocation();
  const isRecording = location.pathname === '/recording';
  
  // Mock data for student cards
  const students = [
    {
      id: 'jonathan',
      name: 'Jonathan Sum',
      status: 'attentive' as const,
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=jonathan',
      understanding: 90
    },
    {
      id: 'jp',
      name: 'JP Vela',
      status: 'confused' as const,
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=jp',
      understanding: 20
    },
    {
      id: 'cooper',
      name: 'Cooper Randeen',
      status: 'inattentive' as const,
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=cooper',
      understanding: 50
    }
  ];

  return (
    <aside className="w-64 h-screen bg-gray-50 border-r border-purple-100 flex flex-col shadow-[5px_0_15px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-4 flex items-center">
        <AttuneIcon />
        <h1 className="ml-2 text-xl font-bold text-[hsl(var(--attune-purple))]">Attune</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Students Section */}
        <SidebarSection title="Students">
          {students.map(student => (
            <StudentCard 
              key={student.id}
              id={student.id}
              name={student.name}
              understanding={student.understanding}
              avatarUrl={student.avatarUrl}
            />
          ))}
        </SidebarSection>

        {/* Navigation Section */}
        <SidebarSection title="Navigation">
          <NavItem 
            icon={<Home size={18} />} 
            label="Home" 
            href="/"
            isActive={location.pathname === '/'}
          />
          <NavItem 
            icon={<FileText size={18} />} 
            label="Collaboration"
            href="/collaboration"
            isActive={location.pathname === '/collaboration'}
          />
          <NavItem 
            icon={<BarChart size={18} />} 
            label="Analytics"
            href="/analytics"
            isActive={location.pathname === '/analytics'}
          />
          <NavItem 
            icon={
              <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_301_9)">
                  <path
                    d="M3.41666 18.4375V12.4583M3.41666 9.04167V3.0625M10.25 18.4375V10.75M10.25 7.33333V3.0625M17.0833 18.4375V14.1667M17.0833 10.75V3.0625M0.854156 12.4583H5.97916M7.68749 7.33333H12.8125M14.5208 14.1667H19.6458"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_301_9">
                    <rect
                      width="20.5"
                      height="20.5"
                      fill="white"
                      transform="translate(0 0.5)"
                    ></rect>
                  </clipPath>
                </defs>
              </svg>
            } 
            label={isRecording ? "Recording in Progress" : "Start New Recording"}
            href="/recording"
            isActive={location.pathname === '/recording'}
            isRecording={isRecording}
          />
        </SidebarSection>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <ProfileSection 
          name="Dr. Lute" 
          avatarUrl="https://api.dicebear.com/7.x/personas/svg?seed=lute" 
        />
      </div>
    </aside>
  );
}
