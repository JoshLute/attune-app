
import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const MAX_NOTES = 5; // Limit the number of notes

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
    };

    // Keep only the most recent MAX_NOTES
    const updatedNotes = [note, ...notes].slice(0, MAX_NOTES);

    setNotes(updatedNotes);
    setNewNote('');
    toast({
      title: "Note Added",
      description: "Your note has been saved successfully.",
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast({
      title: "Note Deleted",
      description: "The note has been removed.",
    });
  };

  return (
    <div className="rounded-3xl p-6 bg-gray-50 dark:bg-gray-900 neumorphic">
      <div className="flex items-center mb-4">
        <FileText className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Session Notes</h2>
      </div>
      
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a note about the session..."
        className="mb-2 dark:bg-gray-800 dark:text-gray-300"
      />
      
      <Button 
        onClick={handleAddNote} 
        className="w-full mb-4"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Note
      </Button>

      <ScrollArea className="h-[200px] w-full">
        <div className="space-y-3 pr-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="rounded-xl py-3 px-4 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900 neumorphic-pressed flex items-start"
            >
              <div className="flex-grow">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{note.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDeleteNote(note.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
