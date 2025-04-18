
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: string[];
}

export const AISuggestions = ({ suggestions }: AISuggestionsProps) => {
  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <Lightbulb className="mr-2 text-[hsl(var(--attune-purple))]" />
        <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">AI Suggestions</h2>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="rounded-xl py-2 px-4 bg-white border border-purple-100 shadow-[2px_2px_5px_rgba(0,0,0,0.05),_-2px_-2px_5px_rgba(255,255,255,0.8)]"
          >
            <p className="text-sm text-gray-700">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
