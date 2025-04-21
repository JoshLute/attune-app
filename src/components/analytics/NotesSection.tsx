
import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: "Remember: Johnny prefers to be called on only when he raises his hand.",
      timestamp: new Date('2024-04-20T14:30:00'),
    },
    {
      id: '2',
      content: "Overall good engagement during the photosynthesis lesson. Visual aids were particularly effective.",
      timestamp: new Date('2024-04-20T15:15:00'),
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote('');
    toast({
      title: "Note Added",
      description: "Your note has been saved successfully.",
    });
  };

  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <FileText className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Session Notes</h2>
      </div>
      
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a note about the session..."
        className="mb-2"
      />
      
      <Button 
        onClick={handleAddNote} 
        className="w-full mb-4"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Note
      </Button>

      <div className="space-y-3">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="rounded-xl py-3 px-4 bg-white border border-purple-100 shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)]"
          >
            <p className="text-sm text-gray-700 mb-1">{note.content}</p>
            <p className="text-xs text-gray-500">
              {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
