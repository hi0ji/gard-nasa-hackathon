'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AskGards = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // TODO: Connect to AI backend
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'This is a placeholder response. Connect to your AI model to enable real conversations.'
      }]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat messages area */}
      <div className="flex-1 px-4 py-6 pb-[140px] mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Ask GARDS
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Your AI-powered assistant for NASA bioscience research. Ask questions about publications,
              research insights, or explore the knowledge graph.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 max-w-2xl w-full px-4">
              <button
                onClick={() => setInput('Tell me about recent NASA bioscience publications')}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <div className="font-medium mb-1">Recent Publications</div>
                <div className="text-sm text-muted-foreground">Explore the latest research</div>
              </button>
              <button
                onClick={() => setInput('What are the key research insights?')}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <div className="font-medium mb-1">Key Insights</div>
                <div className="text-sm text-muted-foreground">Discover research trends</div>
              </button>
              <button
                onClick={() => setInput('Explain the knowledge graph connections')}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <div className="font-medium mb-1">Knowledge Graph</div>
                <div className="text-sm text-muted-foreground">Understand research relationships</div>
              </button>
              <button
                onClick={() => setInput('How can I search for specific topics?')}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <div className="font-medium mb-1">Search Tips</div>
                <div className="text-sm text-muted-foreground">Get help with searching</div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start mb-4">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Fixed input at bottom */}
      <div className="w-full px-4 py-4 fixed bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about NASA bioscience research..."
              className="resize-none max-h-40 overflow-y-auto rounded-2xl w-[calc(100%-72px)] px-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              minRows={1}
              maxRows={6}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskGards;
