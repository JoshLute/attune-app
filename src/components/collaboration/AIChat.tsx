import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

const api_key = ""

export const AIChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you analyze student data and identify trends. What would you like to know?",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);


    const neuralEngineeringTranscript = `
      okay so in FFT we often model signals by decomposing them into sums of sinusoids at different frequencies
      Confused 58%
      so for a single signal the Fourier transform shows how much of each frequency is present at different times
      Understanding 84%
      uh the equation typically looks like X(k) equals sum over n of x(n) times e to the minus j 2 pi k n over N
      Confused 63%
      N here is the total number of samples, it controls the frequency resolution of the transform
      Understanding 91%
      now if we apply a step function as input, its Fourier transform shows strong low-frequency components
      Confused 47%
      you can find dominant frequencies by looking for peaks in the magnitude of the Fourier-transformed signal
      Understanding 88%
      and then if we have multiple signals we can use multi-dimensional FFTs to transform them simultaneously
      Confused 72%
      similar to working with images, except now the Fourier coefficients represent 2D spatial frequency content
      Understanding 90%
      so you can think of it like analyzing a signal’s structure but through its frequency domain representation
      Confused 52%
      alright let’s move on to how windowing impacts the leakage and resolution tradeoffs in FFT analysis
      Understanding 95%
    `;

    const notes = "JP only got 6 hours of sleep and he's more tired right after lunch. Break down complex topics into smaller chunks for JP";

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          // model: 'gpt-4.5-preview',
          messages: [
            { role: 'system', content: "You are an AI assistant. You can help you analyze student confusion and understanding data and identify trends. The end user is a teacher who is reading the eeg signals of their students. they are teaching neural engineering in this specific lesson. Limit responses to 100 words or less and in plain text." },
            ...messages.map(m => ({
              role: m.isAI ? 'assistant' : 'user', 
              content: m.content
            })),
            { role: 'user', content: message },           
            { role: 'user', content: `Here is my data: ${neuralEngineeringTranscript}` },          
            { role: 'user', content: `Here are some notes I took for myself: ${notes}` }              
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      console.log(data);
      const aiContent = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setLoading(false);
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
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl p-4 max-w-[80%] bg-gradient-to-r from-[hsl(var(--attune-light-purple))] to-white">
                <div className="flex items-center mb-2">
                  <Bot className="h-4 w-4 mr-2" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <p>Typing...</p>
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
          />
          <Button onClick={handleSendMessage} className="px-4" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
