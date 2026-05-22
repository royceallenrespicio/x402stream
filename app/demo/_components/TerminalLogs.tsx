'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalLogsProps {
  pipelineLogs: string[];
  running: boolean;
  errorText: string;
  cardClassName?: string;
}

export default function TerminalLogs({
  pipelineLogs,
  running,
  errorText,
  cardClassName = 'h-[400px]',
}: TerminalLogsProps) {
  return (
    <div className="space-y-4 flex flex-col h-full">
      <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Live SSE Stream</h2>

      <Card className={`border border-border bg-muted/20 backdrop-blur-xl flex flex-col overflow-hidden ${cardClassName}`}>
        <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full bg-muted-foreground/60 ${running ? 'animate-ping' : ''}`} />
              Terminal Log Buffer
            </span>
            <Badge variant="outline" className="border-border text-[9px] text-muted-foreground font-mono uppercase bg-muted/50">
              ACTIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-y-auto flex-1 font-mono text-[10px] text-foreground space-y-2.5">
          {pipelineLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <Terminal className="h-7 w-7 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-[10px] font-semibold">Log buffer empty</p>
              <p className="text-muted-foreground/80 text-[9px] mt-0.5">Trigger a pipeline run to stream raw console logs</p>
            </div>
          ) : (
            pipelineLogs.map((log, index) => {
              let colorClass = 'text-muted-foreground/80';
              if (log.startsWith('[SYSTEM')) colorClass = 'text-foreground font-semibold';
              else if (log.startsWith('[WALLET')) colorClass = 'text-emerald-600 dark:text-emerald-400 font-medium';
              else if (log.startsWith('[x402')) colorClass = 'text-amber-600 dark:text-amber-500 font-medium';
              else if (log.includes('THOUGHT')) colorClass = 'text-zinc-550 dark:text-zinc-450 italic';
              else if (log.includes('PIPELINE ERROR')) colorClass = 'text-rose-600 dark:text-rose-400 font-black';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`leading-relaxed break-all border-b border-border/40 pb-1.5 ${colorClass}`}
                >
                  {log}
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Alert error */}
      <AnimatePresence>
        {errorText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="pt-1"
          >
            <Alert variant="destructive" className="border-rose-500/20 bg-rose-500/5 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-bold text-xs">Execution Failed</AlertTitle>
              <AlertDescription className="text-[10px] leading-normal mt-1">{errorText}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
