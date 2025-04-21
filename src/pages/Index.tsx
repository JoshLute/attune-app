import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { UsersRound, Brain, Clock, Sparkles } from 'lucide-react';
import { useSessions } from '@/contexts/SessionsContext';

const SessionCard = ({ 
  date, 
  understandingPercent, 
  confusedPercent, 
  keyMoments 
}: { 
  date: string;
  understandingPercent: number;
  confusedPercent: number;
  keyMoments: number;
}) => (
  <div className="rounded-3xl p-5 bg-gradient-to-br from-[#F1F0FB] to-white text-[hsl(var(--attune-purple))] text-center min-w-[280px] flex flex-col gap-2 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_10px_rgba(0,0,0,0.08),_-3px_-3px_10px_rgba(255,255,255,0.7)] transition-all duration-300">
    <div className="bg-white/80 backdrop-blur-sm text-[hsl(var(--attune-purple))] rounded-xl py-2 font-medium shadow-inner">
      {date}
    </div>
    <div className="text-2xl font-semibold mt-2">
      {understandingPercent}%
    </div>
    <div className="text-sm text-gray-600">
      Understanding
    </div>
    <div className="text-2xl font-semibold mt-2">
      {confusedPercent}%
    </div>
    <div className="text-sm text-gray-600">
      Confused
    </div>
    <div className="mt-4 text-sm text-gray-600">
      {keyMoments} Key Moments
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-white to-[#F1F0FB] shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
    <div className="p-3 rounded-xl bg-[hsl(var(--attune-light-purple))]">
      <Icon className="w-6 h-6 text-[hsl(var(--attune-purple))]" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{value}</p>
    </div>
  </Card>
);

const Index = () => {
  const { sessions } = useSessions();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--attune-purple))] mb-2">Welcome Back, Josh</h1>
            <p className="text-gray-600 text-lg">Meet students where they are. Then help them rise.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={UsersRound} label="Total Students" value="24" />
            <StatsCard icon={Brain} label="Avg. Understanding" value="76%" />
            <StatsCard icon={Clock} label="Hours Taught" value="127" />
            <StatsCard icon={Sparkles} label="Key Moments" value="142" />
          </div>
          
          {/* Recent Sessions Carousel */}
          <div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Recent Sessions</h2>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4 md:-ml-6">
                {sessions.map((session) => (
                  <CarouselItem 
                    key={session.id} 
                    className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3 cursor-pointer"
                    onClick={() => navigate(`/analytics?lesson=${session.id}`)}
                  >
                    <SessionCard 
                      date={session.date}
                      understandingPercent={session.understandingPercent}
                      confusedPercent={session.confusedPercent}
                      keyMoments={session.keyMoments}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6">
            <Link to="/recording" className="flex-1">
              <Button variant="outline" size="lg" className="w-full py-8 text-xl rounded-3xl border-2 bg-gradient-to-br from-white to-[#F1F0FB] shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.08),_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:translate-y-[-2px] transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--attune-light-purple))] hover:to-[hsl(var(--attune-purple))] hover:text-white hover:border-[hsl(var(--attune-purple))]">
                <div className="text-[hsl(var(--attune-purple))] text-2xl font-bold">Start New Recording</div>
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="flex-1 py-8 text-xl rounded-3xl border-2 bg-gradient-to-br from-white to-[#F1F0FB] shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.08),_-2px_-2px_5px_rgba(255,255,255,0.7)] hover:translate-y-[-2px] transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--attune-light-purple))] hover:to-[hsl(var(--attune-purple))] hover:text-white hover:border-[hsl(var(--attune-purple))]">
              <div className="text-[hsl(var(--attune-purple))] text-2xl font-bold flex items-center gap-2">
                Settings
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
