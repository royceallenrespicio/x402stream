'use client';

import React from 'react';
import { AgentState } from '@/types/orchestrator';
import AgentCard from '@/app/demo/_components/AgentCard';

interface ActiveExecutionMonitorProps {
  agents: AgentState[];
  running: boolean;
}

export default function ActiveExecutionMonitor({
  agents,
  running,
}: ActiveExecutionMonitorProps) {
  if (agents.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${running ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground/60'}`} />
          Active Agent execution monitor
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
