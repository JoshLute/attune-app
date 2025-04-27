import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LessonSummary } from '@/components/analytics/LessonSummary';
import { Progress } from "@/components/ui/progress";

/*interface Note {
  id: string;
  content: string;
  timestamp: Date;
}*/

export type Note = {
  id: number;
  content: string;
  state: string;
  color: string;
  score: number;
};

const stateColors: Record<string, string> = {
  "Understanding": "text-green-400 font-mono",
  "Confused": "text-red-400 font-mono",
  "Control": "text-blue-400 font-mono",
  "Default": "text-gray-600",
};


type NotesSectionProps = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  understanding: number;
  setUnderstanding: React.Dispatch<React.SetStateAction<number>>;
  attention: number;
  setAttention: React.Dispatch<React.SetStateAction<number>>;
};

export function NotesSection({ notes, setNotes , understanding, setUnderstanding, attention, setAttention}: NotesSectionProps) {


  const understandingColor = "#1E90FF"; // blue
  const attentionColor = "#22c55e"; // green

  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <FileText className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Notable Moments</h2>
      </div>

       {/* <LessonSummary
          understanding={10}
          attention={20}
          summary={"EYAH"}
        /> */}

      <ScrollArea className="h-[400px] w-full">
        <span className="text-base text-gray-600">Understanding</span>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <Progress value={understanding} indicatorColor={understandingColor} className="h-4 bg-gray-200 transition-all duration-300" />
                </div>
                {/* <div className="flex justify-end text-sm text-gray-600 mb-1">{understanding}%</div> */}
        
                <span className="text-base text-gray-600">Attention</span>
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <Progress value={attention} indicatorColor={attentionColor} className="h-4 bg-gray-200 transition-all duration-300" />
                </div>
                {/* <div className="flex justify-end text-sm text-gray-600 mb-1">{attention}%</div> */}




        <div className="space-y-3 pr-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="rounded-xl py-3 px-4 bg-white border border-purple-100 shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)] flex items-start"
            >
              <div className="flex-grow">
                <p className="text-sm text-gray-700 mb-1">{note.content}</p>
                <p className={stateColors[note.state]}>{note.state} {note.score}%</p>
                
              </div>

            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}