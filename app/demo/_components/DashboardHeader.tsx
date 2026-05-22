'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface DashboardHeaderProps {
  running: boolean;
  customAgentsLength: number;
  resetPipeline: () => void;
}

export default function DashboardHeader({
  running,
  customAgentsLength,
  resetPipeline,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-fluid-lg font-black tracking-tight text-foreground flex items-center gap-2">
          Multi-Agent Dashboard
        </h1>
        <p className="text-fluid-sm text-muted-foreground mt-1 max-w-xl">
          Configure custom machine agents, assign L2 vendor APIs, and trigger cooperative pipeline executions over Morph testnet.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={resetPipeline}
          variant="outline"
          disabled={running}
          className="border-border bg-card hover:bg-accent text-foreground font-semibold text-xs h-9 px-3 pointer-events-auto cursor-pointer"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}
