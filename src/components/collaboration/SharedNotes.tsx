
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  role: 'teacher' | 'therapist' | 'parent';
}

export const SharedNotes = () => {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: "Johnny showed great progress in math today. He's getting more confident with fractions.",
      author: "Ms. Thompson",
      timestamp: new Date('2024-04-18T10:00:00'),
      role: 'teacher'
    },
    {
      id: '2',
      content: "Had a breakthrough session discussing emotions. Johnny is opening up more about his feelings.",
      author: "Dr. Martinez",
      timestamp: new Date('2024-04-17T15:30:00'),
      role: 'therapist'
    }
  ]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      author: "Dr. Lute",
      timestamp: new Date(),
      role: 'therapist'
    };

    setNotes([note, ...notes]);
    setNewNote('');
    toast({
      title: "Note Added",
      description: "Your note has been successfully added to the collaboration board.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-white to-[#F1F0FB] p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note about the student's progress..."
          className="min-h-[120px] mb-4"
        />
        <Button onClick={handleAddNote} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl bg-gradient-to-br from-[#F1F0FB] to-white p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]"
          >
            <p className="text-gray-700 mb-4">{note.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium mr-2">{note.author}</span>
              <span className="text-gray-400">
                {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
