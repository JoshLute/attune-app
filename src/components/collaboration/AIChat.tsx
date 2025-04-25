
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useSessionsContext } from '@/contexts/SessionsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  sessionReferences?: string[];
}

export const AIChat = () => {
  const [message, setMessage] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI teaching assistant. I can help analyze student performance and provide insights. Select a session for context-aware responses.",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sessions } = useSessionsContext();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isAI: false,
      timestamp: new Date(),
      sessionReferences: selectedSession ? [selectedSession] : []
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: message.trim(),
          sessionId: selectedSession 
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isAI: true,
        timestamp: new Date(),
        sessionReferences: selectedSession ? [selectedSession] : []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setMessages(prev => [
      {
        id: Date.now().toString(),
        content: "Session context loaded. I now have access to the session's understanding levels, attention patterns, and teacher notes.",
        isAI: true,
        timestamp: new Date(),
        sessionReferences: [sessionId]
      }
    ]);
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-white to-[#F1F0FB] p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="mb-4">
        <Select onValueChange={handleSessionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a session for context" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.title} - {session.date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`rounded-xl p-4 max-w-[80%] ${
                  msg.isAI
                    ? 'bg-gradient-to-r from-[hsl(var(--attune-light-purple))] to-white'
                    : 'bg-gradient-to-l from-[hsl(var(--attune-purple))] to-[hsl(var(--attune-light-purple))] text-white'
                }`}
              >
                {msg.isAI && (
                  <div className="flex items-center mb-2">
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                )}
                <p>{msg.content}</p>
                {msg.sessionReferences && msg.sessionReferences.length > 0 && (
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <Link2 className="h-3 w-3 mr-1" />
                    <span>References session data</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about student performance, patterns, or specific sessions..."
            className="min-h-[60px]"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            className="px-4"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
