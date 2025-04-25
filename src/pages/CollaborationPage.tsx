
import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { SharedNotes } from '@/components/collaboration/SharedNotes';
import { AIChat } from '@/components/collaboration/AIChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CollaborationPage = () => {
  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-[hsl(var(--attune-purple))] mb-2">Collaboration Hub</h1>
            <p className="text-gray-600 text-lg">Work together to support student success</p>
          </div>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="notes">Shared Notes</TabsTrigger>
              <TabsTrigger value="ai-chat">AI Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-0">
              <SharedNotes />
            </TabsContent>
            <TabsContent value="ai-chat" className="mt-0">
              <AIChat />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;
