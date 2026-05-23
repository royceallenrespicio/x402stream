'use client';

import React from 'react';

interface DashboardHeaderProps {
  running: boolean;
  customAgentsLength: number;
}

export default function DashboardHeader({
  running,
  customAgentsLength,
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
    </div>
  );
}
