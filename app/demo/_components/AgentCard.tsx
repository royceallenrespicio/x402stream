'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentState } from '@/types/orchestrator';

export default function AgentCard({ agent }: { agent: AgentState }) {

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'thinking': return 'border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/10';
      case 'calling_vendor': return 'border-border bg-muted/20';
      case 'payment_challenged': return 'border-destructive/30 bg-destructive/5';
      case 'paying': return 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10';
      case 'completed': return 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10';
      default: return 'border-border bg-card';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'thinking':
        return <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 font-semibold gap-1 text-[9px]"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Thinking</Badge>;
      case 'calling_vendor':
        return <Badge className="bg-muted text-foreground/85 border-border font-semibold gap-1 text-[9px]"><Sparkles className="h-2.5 w-2.5 animate-pulse" /> Consulting API</Badge>;
      case 'payment_challenged':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-semibold gap-1 text-[9px]"><AlertCircle className="h-2.5 w-2.5" /> HTTP 402 Required</Badge>;
      case 'paying':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold gap-1 text-[9px]"><CreditCard className="h-2.5 w-2.5 animate-bounce" /> Settle Proof</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1 text-[9px]"><CheckCircle2 className="h-2.5 w-2.5" /> Fulfilled</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border font-medium text-[9px]">Idle</Badge>;
    }
  };

  // Neutral monochrome avatar gradients
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-zinc-400 to-zinc-600',
      'from-zinc-300 to-zinc-500',
      'from-zinc-500 to-zinc-700',
      'from-zinc-350 to-zinc-550',
      'from-zinc-200 to-zinc-400'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  return (
    <Card className={`relative overflow-hidden border transition-all duration-300 backdrop-blur-md ${getStatusBorderColor(agent.status)}`}>
      <CardContent className="p-4 flex flex-col gap-3.5">

        {/* Header section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-black font-black text-xs ${getAvatarGradient(agent.name)}`}>
              {agent.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-foreground leading-none truncate">{agent.name}</h3>
              <p className="text-[9px] text-muted-foreground mt-1 truncate">{agent.role}</p>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge(agent.status)}</div>
        </div>

        {/* Dynamic task logger */}
        <div className="rounded-lg bg-muted/40 border border-border p-2.5">
          <p className="text-[11px] text-foreground leading-normal min-h-[30px]">{agent.message}</p>
        </div>

        {/* Thoughts stream */}
        <AnimatePresence mode="wait">
          {agent.reasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] leading-relaxed text-muted-foreground border-l-2 border-muted-foreground/30 pl-2.5 overflow-hidden"
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-0.5">Agent Thoughts</div>
              &ldquo;{agent.reasoning}&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settle hash links */}
        <AnimatePresence>
          {agent.txHash && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between text-[9px] rounded-lg border border-border bg-muted/45 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${agent.isRealTx ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                {agent.isRealTx ? 'Morph Settle Proof' : 'Simulation Proof'}
              </div>
              <a
                href={`https://explorer-hoodi.morph.network/tx/${agent.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground font-bold hover:underline flex items-center gap-0.5 truncate max-w-[140px] font-mono pointer-events-auto transition-colors"
              >
                {agent.txHash.slice(0, 8)}...{agent.txHash.slice(-6)}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Progress sliding line */}
      {agent.status === 'thinking' && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse" />
      )}
    </Card>
  );
}
