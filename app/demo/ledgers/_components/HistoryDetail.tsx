'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Coins, Users, FileText, Copy, Check, Info, ShieldCheck, Zap, ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettlementHistoryItem } from '@/types/orchestrator';
import QRCodeContainer from '@/app/demo/_components/QRCodeContainer';

interface LedgerItemRowProps {
  entry: {
    id: string;
    timestamp: string;
    agent: string;
    vendor: string;
    status: string;
    recipient: string;
    cost: string;
    txHash?: string;
    gasFee?: string;
  };
}

function LedgerItemRow({ entry }: LedgerItemRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-card rounded-xl p-4 flex flex-col gap-3">
      {/* Header info */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="min-w-0">
          <span className="text-[9px] font-mono text-muted-foreground/60">{entry.timestamp}</span>
          <h4 className="text-xs font-bold text-foreground truncate">
            {entry.agent} &rarr; {entry.vendor}
          </h4>
        </div>
        <Badge
          variant="outline"
          className={`text-[8px] font-bold px-1.5 py-0 rounded-md shrink-0 uppercase tracking-wide ${
            entry.status === 'fulfilled'
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
              : entry.status === 'paying'
              ? 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400'
              : 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400'
          }`}
        >
          {entry.status}
        </Badge>
      </div>

      {/* Body details and inline QR code */}
      <div className="flex flex-row items-center justify-between gap-4 min-w-0 w-full">
        <div className="text-[10px] space-y-1.5 text-muted-foreground font-medium flex-1 min-w-0">
          <div className="truncate">TO RECIPIENT: <span className="font-mono text-foreground font-semibold">{entry.recipient}</span></div>
          <div>TRANSACTION COST: <span className="font-mono text-foreground font-bold">{entry.cost} ETH</span></div>
          {entry.gasFee && (
            <div>GAS FEE: <span className="font-mono text-foreground font-semibold">{entry.gasFee}</span></div>
          )}
          {entry.txHash && (
            <>
              <div className="truncate pb-1">TX HASH: <span className="font-mono text-foreground font-semibold">{entry.txHash}</span></div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => handleCopy(entry.txHash!)}
                  className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-input py-1 px-2.5 rounded-lg cursor-pointer pointer-events-auto transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Hash
                    </>
                  )}
                </button>
                <a
                  href={`https://explorer-hoodi.morph.network/tx/${entry.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 py-1 px-2.5 rounded-lg cursor-pointer pointer-events-auto text-center transition-all"
                >
                  Explorer <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </>
          )}
        </div>
        {entry.txHash && (
          <QRCodeContainer value={entry.txHash} minimal />
        )}
      </div>
    </div>
  );
}

interface DetectedItemRowProps {
  hash: string;
  idx: number;
}

function DetectedItemRow({ hash, idx }: DetectedItemRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border bg-card rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div>
          <span className="text-[9px] font-mono text-muted-foreground/60">Detected from logs</span>
          <h4 className="text-xs font-bold text-foreground">Transaction #{idx + 1}</h4>
        </div>
        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-1.5 py-0 rounded-md">
          ON-CHAIN PROOF
        </Badge>
      </div>

      <div className="flex flex-row items-center justify-between gap-4 min-w-0 w-full">
        <div className="text-[10px] space-y-1.5 text-muted-foreground font-medium flex-1 min-w-0">
          <div className="truncate pb-1">TX HASH: <span className="font-mono text-foreground font-semibold">{hash}</span></div>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => handleCopy(hash)}
              className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-input py-1 px-2.5 rounded-lg cursor-pointer pointer-events-auto transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy Hash
                </>
              )}
            </button>
            <a
              href={`https://explorer-hoodi.morph.network/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 py-1 px-2.5 rounded-lg cursor-pointer pointer-events-auto text-center transition-all"
            >
              Explorer <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
        <QRCodeContainer value={hash} minimal />
      </div>
    </div>
  );
}

interface HistoryDetailProps {
  selectedItem: SettlementHistoryItem | undefined;
}

export default function HistoryDetail({ selectedItem }: HistoryDetailProps) {
  // Extract transaction hashes from summary for legacy runs
  const txHashes = React.useMemo(() => {
    if (!selectedItem?.summary) return [];
    const matches = selectedItem.summary.match(/0x[a-fA-F0-9]{64}/g) || [];
    return Array.from(new Set(matches));
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-6">
        <Info className="h-8 w-8 text-muted-foreground/60 mb-2.5" />
        <p className="text-muted-foreground text-xs font-semibold">Select an entry from the ledger list</p>
        <p className="text-muted-foreground/80 text-[10px] mt-0.5 max-w-[200px]">
          Select an archived settlement to view its complete logs and generated final payload.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedItem.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 h-full flex flex-col justify-start"
    >
      {/* Detail Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            SETTLED TRANSACTION SUMMARY
          </span>
        </div>
        <h2 className="text-sm font-extrabold text-foreground leading-normal pr-4">
          {selectedItem.goal}
        </h2>
      </div>

      {/* Technical Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-border bg-card p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Timestamp
          </span>
          <span className="text-xs font-mono font-bold text-foreground mt-1.5">
            {selectedItem.timestamp.split(', ')[1] || selectedItem.timestamp}
          </span>
        </Card>
        
        <Card className="border border-border bg-card p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Coins className="h-3 w-3" /> Total Cost
          </span>
          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {selectedItem.totalCost} ETH
          </span>
        </Card>

        <Card className="border border-border bg-card p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Users className="h-3 w-3" /> Agent Count
          </span>
          <span className="text-xs font-bold text-foreground mt-1.5">
            {selectedItem.agentsCount} Workspace Agents
          </span>
        </Card>

        <Card className="border border-border bg-card p-3 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            {selectedItem.realOnChain ? <ShieldCheck className="h-3 w-3 text-emerald-500" /> : <Zap className="h-3 w-3 text-muted-foreground" />}
            Network Status
          </span>
          <span className={`text-xs font-bold mt-1.5 ${selectedItem.realOnChain ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {selectedItem.realOnChain ? 'Morph L2 Hoodi' : 'Simulated Verification'}
          </span>
        </Card>
      </div>

      {/* Structured Final Summary Content */}
      <div className="space-y-2 shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Structured Output Summary Payload
        </span>
        <Card className="border border-border bg-card p-4 rounded-xl overflow-y-auto max-h-[240px]">
          <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap select-text selection:bg-accent break-words">
            {selectedItem.summary}
          </pre>
        </Card>
      </div>

      {/* Transaction Ledger & QR Codes */}
      {selectedItem.ledger && selectedItem.ledger.length > 0 ? (
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5" /> Settled Step Transactions
          </span>
          <div className="space-y-3">
            {selectedItem.ledger.map((entry) => (
              <LedgerItemRow key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ) : (
        // Fallback: parse transaction hashes from summary text if ledger is empty (e.g. legacy runs)
        txHashes.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" /> Detected Session Transactions
            </span>
            <div className="space-y-3">
              {txHashes.map((hash, idx) => (
                <DetectedItemRow key={idx} hash={hash} idx={idx} />
              ))}
            </div>
          </div>
        )
      )}
    </motion.div>
  );
}
