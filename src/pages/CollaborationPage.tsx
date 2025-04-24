
import React from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { SharedNotes } from '@/components/collaboration/SharedNotes';
import { AIChat } from '@/components/collaboration/AIChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAssistant } from '@/components/AIAssistant';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Button } from '@/components/ui/button';

const CollaborationPage = () => {
  const { 
    startRecording, 
    stopRecording, 
    isRecording, 
    transcription, 
    error 
  } = useSpeechToText();

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-[hsl(var(--attune-purple))] mb-2">
              Collaboration Hub
            </h1>
            <p className="text-gray-600 text-lg">
              Work together to support student success
            </p>
          </div>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="notes">Shared Notes</TabsTrigger>
              <TabsTrigger value="ai-chat">AI Insights</TabsTrigger>
              <TabsTrigger value="speech-to-text">Speech to Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="mt-0">
              <SharedNotes />
            </TabsContent>
            
            <TabsContent value="ai-chat" className="mt-0">
              <AIAssistant />
            </TabsContent>
            
            <TabsContent value="speech-to-text" className="mt-0">
              <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                {transcription && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-2">Transcription:</h3>
                    <p>{transcription}</p>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;
