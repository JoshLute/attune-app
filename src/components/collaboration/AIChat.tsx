
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

export const AIChat = () => {
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant powered by Gemini. I can help you analyze student data and identify trends. What would you like to know?",
      isAI: true,
      timestamp: new Date()
    }
  ]);

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true);
      toast({
        title: "API Key Set",
        description: "Your Gemini API key has been saved for this session.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `As an educational assistant, analyze this query about student data and trends: ${message}. 
                     Provide insights and suggestions that could help teachers, therapists, and parents better support the student.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        isAI: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
      });
      console.error("Gemini API error:", error);
    }
  };

  if (!isApiKeySet) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-white to-[#F1F0FB] p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Set up Gemini AI</h3>
          <p className="text-sm text-gray-600">Please enter your Gemini API key to continue. You can get one from the Google AI Studio.</p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1"
            />
            <Button onClick={handleSetApiKey}>Set Key</Button>
          </div>
        </div>
      </div>
    );
  }

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
                    <span className="font-medium">Gemini AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about student trends, behavior patterns, or suggestions..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} className="px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
