
import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  <div className="rounded-3xl p-5 bg-[hsl(var(--attune-light-purple))] text-white text-center min-w-[280px] flex flex-col gap-2">
    <div className="bg-white text-[hsl(var(--attune-purple))] rounded-xl py-2 font-medium">
      {date}
    </div>
    <div className="text-2xl font-semibold mt-2">
      {understandingPercent}%
    </div>
    <div>
      Understanding
    </div>
    <div className="text-2xl font-semibold mt-2">
      {confusedPercent}%
    </div>
    <div>
      Confused
    </div>
    <div className="mt-4">
      {keyMoments} Key Moments
    </div>
  </div>
);

const Index = () => {
  const sessionData = [
    { date: "Yesterday", understandingPercent: 68, confusedPercent: 32, keyMoments: 4 },
    { date: "May 1", understandingPercent: 24, confusedPercent: 76, keyMoments: 8 },
    { date: "April 30", understandingPercent: 88, confusedPercent: 12, keyMoments: 2 },
    { date: "April 29", understandingPercent: 45, confusedPercent: 55, keyMoments: 6 }
  ];

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[hsl(var(--attune-purple))] mb-2">Welcome Back, Josh</h1>
            <p className="text-gray-600 text-lg">Meet students where they are. Then help them rise.</p>
          </div>
          
          <div className="mb-12">
            <Carousel className="w-full">
              <CarouselContent className="-ml-4 md:-ml-6">
                {sessionData.map((session, index) => (
                  <CarouselItem key={index} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
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

          <div className="flex flex-col md:flex-row gap-6">
            <Button variant="outline" size="lg" className="flex-1 py-8 text-xl rounded-3xl border-2 shadow-lg hover:bg-[hsl(var(--attune-light-purple))] hover:text-white hover:border-[hsl(var(--attune-purple))]">
              <div className="text-[hsl(var(--attune-purple))] text-2xl font-bold">Start New Recording</div>
            </Button>
            
            <Button variant="outline" size="lg" className="flex-1 py-8 text-xl rounded-3xl border-2 shadow-lg hover:bg-[hsl(var(--attune-light-purple))] hover:text-white hover:border-[hsl(var(--attune-purple))]">
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
