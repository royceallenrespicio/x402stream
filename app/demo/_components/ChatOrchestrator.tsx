'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Terminal, RotateCcw, Bot, Play, X } from 'lucide-react';
import { AgentState, LedgerEntry, ExecutionSession } from '@/types/orchestrator';
import { motion } from 'motion/react';
import ChatMessageBubble, { ChatMessage } from './chat/ChatMessageBubble';

interface ChatOrchestratorProps {
  goal: string;
  running: boolean;
  pipelineLogs: string[];
  errorText: string;
  currentStepInfo: string;
  startPipeline: () => Promise<void>;
  resetPipeline: () => void;
  agents: AgentState[];
  finalSummary?: string;

  // Sessions
  sessions: ExecutionSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  deleteSession: (id: string) => void;
  ledger: LedgerEntry[];
  setGoal: (goal: string) => void;
}

export default function ChatOrchestrator({
  goal,
  running,
  pipelineLogs,
  errorText,
  currentStepInfo,
  startPipeline,
  resetPipeline,
  agents,
  finalSummary,
  sessions,
  activeSessionId,
  setActiveSessionId,
  deleteSession,
  ledger,
  setGoal,
}: ChatOrchestratorProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle auto-scroll
  useEffect(() => {
    if (running) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pipelineLogs.length, errorText, running]);

  // Parse logs into structured messages
  const parseLogs = (): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    const sessPrefix = activeSessionId || 'default';

    const activeSession = sessions.find(s => s.id === activeSessionId) || null;
    const sessionGoal = activeSession ? activeSession.goal : goal;

    // Add user goal at the top if there is logs or if it's currently running
    if (sessionGoal && (pipelineLogs.length > 0 || running)) {
      messages.push({
        id: `${sessPrefix}-user-goal`,
        sender: 'User',
        content: sessionGoal,
        timestamp: '',
        type: 'user',
      });
    }

    pipelineLogs.forEach((log, index) => {
      const match = log.match(/^\[([^\]]+)\]:\s*(.*)$/);
      if (!match) {
        messages.push({
          id: `${sessPrefix}-log-${index}`,
          sender: 'System',
          content: log,
          timestamp: '',
          type: 'system',
        });
        return;
      }

      const tag = match[1];
      let content = match[2];
      let sender = tag;
      let timestamp = '';
      let type: ChatMessage['type'] = 'system';

      if (tag.includes(' - ')) {
        const parts = tag.split(' - ');
        sender = parts[0];
        timestamp = parts[1];
      }

      // Detect transaction hash
      const txHashMatch = content.match(/0x[a-fA-F0-9]{64}/);
      const txHash = txHashMatch ? txHashMatch[0] : undefined;

      if (sender === 'SYSTEM') {
        sender = 'System';
        type = 'system';
      } else if (sender.startsWith('WALLET')) {
        sender = 'Wallet';
        type = 'wallet';
      } else if (sender === 'x402 GATEWAY') {
        sender = 'Gateway';
        type = 'gateway';
      } else if (sender.endsWith(' THOUGHT')) {
        sender = sender.replace(' THOUGHT', '');
        type = 'agent_thought';
        if (content.startsWith('"') && content.endsWith('"')) {
          content = content.slice(1, -1);
        }
      } else if (sender === 'PIPELINE ERROR') {
        sender = 'System';
        type = 'error';
      } else {
        type = 'agent_status';
      }

      // Lookup matching ledger entry for gateway challenges
      let challengeId: string | undefined;
      let cost: string | undefined;
      let recipient: string | undefined;
      let vendorName: string | undefined;

      if (type === 'gateway') {
        const entry = ledger.find(l => content.includes(l.vendor) || l.agent === sender);
        if (entry) {
          challengeId = entry.id;
          cost = entry.cost;
          recipient = entry.recipient;
          vendorName = entry.vendor;
        }
      }

      messages.push({
        id: `${sessPrefix}-log-${index}`,
        sender,
        content,
        timestamp,
        type,
        txHash,
        challengeId,
        cost,
        recipient,
        vendorName,
      });
    });

    if (errorText) {
      messages.push({
        id: `${sessPrefix}-error-msg`,
        sender: 'System',
        content: errorText,
        timestamp: '',
        type: 'error',
      });
    }

    return messages;
  };

  const parsedMessages = parseLogs();

  // Progress calculations
  const totalAgents = agents.length;
  const completedAgents = agents.filter((a) => a.status === 'completed').length;

  let progressValue = 0;
  if (running) {
    progressValue = totalAgents > 0 ? Math.round((completedAgents / totalAgents) * 90) : 10;
    if (progressValue < 10) progressValue = 10;
  } else if (finalSummary || pipelineLogs.some(l => l.includes('verified') || l.includes('complete'))) {
    progressValue = 100;
  }

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-xl flex flex-col overflow-hidden h-[750px] shadow-2xl rounded-2xl transition-all duration-300 py-0">
      {/* Integrated Header and Sessions Tab Bar */}
      <CardHeader className="py-2.5 px-4 border-b border-border bg-background/80 shrink-0 flex flex-row items-center gap-4 justify-between h-14">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-6 w-6 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <span className="hidden md:inline text-[10px] font-black text-foreground uppercase tracking-wider">
            Console Stream
          </span>
        </div>

        {/* Sessions Tab Bar */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none select-none px-2 justify-start">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isRun = session.running;
            const isComp = session.finalSummary && !session.running && !session.errorText;
            const isErr = !!session.errorText;

            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${isActive
                  ? 'bg-muted border-border text-foreground'
                  : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSessionMarker"
                    className="absolute inset-0 bg-muted border border-border rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <span className="flex h-1.5 w-1.5 relative">
                  {isRun && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isRun
                    ? 'bg-amber-500'
                    : isErr
                      ? 'bg-destructive'
                      : isComp
                        ? 'bg-emerald-500'
                        : 'bg-muted-foreground/60'
                    }`} />
                </span>

                <span className="truncate max-w-[80px] sm:max-w-[120px] font-sans">
                  {session.title}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="ml-1 opacity-40 hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all pointer-events-auto cursor-pointer"
                >
                  <X className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {running && (
            <span className="hidden sm:inline-flex text-[9px] text-amber-500 font-bold items-center gap-1 bg-amber-550/5 px-2 py-0.5 rounded-full border border-amber-500/10 animate-pulse">
              <span className="h-1 w-1 rounded-full bg-amber-500" />
              Executing
            </span>
          )}
          <Button
            onClick={resetPipeline}
            disabled={running}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border h-8 px-2 text-[9px] font-bold uppercase tracking-wider cursor-pointer pointer-events-auto transition-all"
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Clear
          </Button>
        </div>
      </CardHeader>

      {/* Progress and status subheader */}
      <div className="py-2.5 px-5 border-b border-border/40 bg-muted/10 shrink-0 space-y-2 flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[10px] font-bold text-muted-foreground">
          <span className="truncate max-w-[280px] sm:max-w-md text-muted-foreground">
            STAGE STATUS: <span className="font-semibold text-foreground/80">{currentStepInfo}</span>
          </span>
          <span className="font-mono text-muted-foreground shrink-0">
            {progressValue}% EXECUTION
          </span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-muted" />
      </div>

      {/* Chat messages viewport */}
      <CardContent className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs scrollbar-thin select-text">
        {parsedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="text-foreground text-xs font-bold uppercase tracking-wider">Mesh Awaiting Instruction</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Trigger a manual agent run above or configure custom goals to view cooperative agent executions.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {parsedMessages.map((msg, idx) => {
              const prevMsg = idx > 0 ? parsedMessages[idx - 1] : null;
              const isConsecutive = prevMsg && prevMsg.sender === msg.sender && prevMsg.type === msg.type;
              return (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  isConsecutive={!!isConsecutive}
                />
              );
            })}
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      {/* Goal Input Section */}
      <div className="p-4 border-t border-border bg-card shrink-0 select-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!goal.trim() || running) return;
            startPipeline();
          }}
          className="flex flex-col gap-2"
        >
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Multi-Agent Pipeline Objective (use only to run multiple agents)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={running}
              placeholder="Specify the cooperative goal for the entire multi-agent pipeline..."
              className="flex-1 min-h-[50px] max-h-[120px] text-xs px-3 py-2 border border-input bg-background rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none font-sans leading-relaxed disabled:opacity-50"
              rows={2}
            />
            <Button
              type="submit"
              disabled={running || !goal.trim()}
              className="h-[50px] px-5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl cursor-pointer pointer-events-auto shrink-0 flex items-center justify-center gap-1.5 self-stretch sm:self-center"
            >
              <Play className="h-3.5 w-3.5" /> Run Pipeline
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

