'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, User, Bot } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AdminAssistantPlayerWorkflowProps {
  sportSlug?: string;
  sportName?: string;
}

/**
 * Admin Assistant Player Workflow
 * Manages player stats, team assignments, and match events via conversational interface
 */
export function AdminAssistantPlayerWorkflow({
  sportSlug = 'cricket',
  sportName = 'Cricket',
}: AdminAssistantPlayerWorkflowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I'm your ${sportName} Admin Assistant. I can help you:
      
• Add players to teams
• Track individual player statistics
• Manage team rosters
• Process match events with player stats
• View player performance

What would you like to do?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Connect to backend agent API
      // For now, provide contextual responses based on user input
      let assistantResponse = '';

      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('add player') || lowerInput.includes('create player')) {
        assistantResponse = `I can help you add a player. Please provide:
1. Player name
2. Jersey number (optional)
3. Role/Position
4. Team they belong to

You can say: "Add player John Doe number 7 as a Batsman to Team A"`;
      } else if (lowerInput.includes('player stats') || lowerInput.includes('statistics')) {
        assistantResponse = `I can show you player statistics from recent matches. Which player's stats would you like to see? Or would you like:

• Top scorers
• Best performers by role
• Recent performance trends

Just let me know!`;
      } else if (lowerInput.includes('team roster') || lowerInput.includes('squad')) {
        assistantResponse = `I can help manage team rosters. Which team would you like to manage?

I can:
• Show current roster
• Add players
• Remove players
• Update player information

Type a team name to proceed.`;
      } else if (lowerInput.includes('match') || lowerInput.includes('event')) {
        assistantResponse = `I can help track match events and update player stats. 

Tell me:
1. Which player performed the action
2. What action (goal, run, wicket, etc.)
3. Any additional details

Example: "John scored a goal" or "Virat hit a 4"`;
      } else if (lowerInput.includes('leaderboard') || lowerInput.includes('top')) {
        assistantResponse = `Here are the top performers:

🥇 Top Scorer: Player A (145 runs)
🥈 Top Wicket Taker: Player B (12 wickets)
🥉 Most Assists: Player C (8 assists)

Type a player name for detailed stats.`;
      } else {
        assistantResponse = `I can help with ${sportName} admin tasks. Try asking me to:
• Add players
• Show player stats
• Manage team rosters
• Track match events
• View leaderboards

What would you like to do?`;
      }

      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <Card className="bg-card/50 border-border shadow-md h-[600px] flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {sportName} Admin Assistant
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Manage players, teams, and match events</p>
          </div>
          <Badge variant="secondary">{sportSlug}</Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pr-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-muted-foreground rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="bg-muted px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Assistant is thinking...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about teams, players, or match events..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
