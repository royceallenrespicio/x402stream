'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface HistoryHeaderProps {
  settlementHistoryLength: number;
  clearAllHistory: () => void;
}

export default function HistoryHeader({
  settlementHistoryLength,
  clearAllHistory,
}: HistoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800/60">
      <div>
        <h1 className="text-fluid-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
          Settlement Ledger History
          <Badge variant="outline" className="border-zinc-700/40 bg-zinc-800/20 text-zinc-400 text-[10px] font-bold">
            {settlementHistoryLength} Settled
          </Badge>
        </h1>
        <p className="text-fluid-sm text-zinc-550 mt-1 max-w-xl">
          Audit trail ledger containing completed cooperative multi-agent execution payloads, cost aggregates, and structured deliverables.
        </p>
      </div>

      {settlementHistoryLength > 0 && (
        <Button
          onClick={clearAllHistory}
          variant="outline"
          className="border-rose-955 hover:bg-rose-950/20 text-rose-400 hover:text-rose-350 font-semibold text-xs h-9 px-3 shrink-0 pointer-events-auto cursor-pointer"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear History
        </Button>
      )}
    </div>
  );
}
