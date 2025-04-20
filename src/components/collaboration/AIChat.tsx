
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

export const AIChat = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you analyze student data and identify trends. What would you like to know?",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isAI: false,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Sample student data to provide context to the AI
      // In a real app, this would come from your state or database
      const mockStudentData = {
        name: "Student",
        understanding: 68,
        attention: 75,
        recentPerformance: "improving",
        topics: ["fractions", "decimals", "percentages"]
      };

      // Call Gemini API via our edge function
      const response = await aiService.generateInsights({
        type: "chat",
        context: message,
        data: mockStudentData
      });

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response || "I'm sorry, I couldn't generate a response. Please try again.",
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in AI chat:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-white to-[#F1F0FB] p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
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
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl p-4 bg-gradient-to-r from-[hsl(var(--attune-light-purple))] to-white">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--attune-purple))] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--attune-purple))] animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--attune-purple))] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about student trends, behavior patterns, or suggestions..."
            className="min-h-[60px]"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
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
