'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function LedgerHeader() {
  return (
    <div className="pb-4 border-b border-border">
      <h1 className="text-fluid-lg font-black tracking-tight text-foreground flex items-center gap-2">
        Transaction Ledger
      </h1>
      <p className="text-fluid-sm text-muted-foreground mt-1">
        Review archived multi-agent sequence run summaries, final execution payloads, and transaction cost logs.
      </p>
    </div>
  );
}
