'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Lock, AlertTriangle, User, ArrowUpRight } from 'lucide-react';
import QRCodeContainer from '@/app/demo/_components/QRCodeContainer';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'user' | 'system' | 'wallet' | 'gateway' | 'agent_thought' | 'agent_status' | 'error';
  txHash?: string;
  challengeId?: string;
  cost?: string;
  recipient?: string;
  vendorName?: string;
}

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  isConsecutive?: boolean;
}

export default function ChatMessageBubble({ msg, isConsecutive }: ChatMessageBubbleProps) {
  const isUser = msg.type === 'user';
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center text-center my-3"
      >
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 border border-border px-3 py-1 rounded-full shadow-sm select-none">
          {msg.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full items-start ${isConsecutive ? 'mt-1' : 'mt-4'}`}
    >
      {/* Left Avatar for Agents */}
      {!isUser && (
        <div className="mr-2.5 mt-0.5 shrink-0 select-none">
          {!isConsecutive ? (
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${msg.type === 'wallet'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : msg.type === 'gateway'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : msg.type === 'error'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
              }`}>
              {msg.type === 'wallet' ? (
                <Wallet className="h-3.5 w-3.5" />
              ) : msg.type === 'gateway' ? (
                <Lock className="h-3.5 w-3.5" />
              ) : msg.type === 'error' ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                msg.sender.slice(0, 2).toUpperCase()
              )}
            </div>
          ) : (
            <div className="h-7 w-7" />
          )}
        </div>
      )}

      {/* Message Bubble container */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%] w-full`}>
        {/* Sender header */}
        {!isUser && !isConsecutive && (
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1 ml-1 select-none">
            {msg.sender} {msg.type === 'agent_thought' ? '• Thought' : ''}
          </span>
        )}

        {/* Bubble itself */}
        <div className={`rounded-2xl px-4 py-2.5 leading-relaxed break-words border shadow-md ${isUser
          ? 'bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-100 dark:border-zinc-700/50 rounded-tr-sm'
          : msg.type === 'agent_thought'
            ? 'bg-muted/50 text-muted-foreground rounded-tl-sm border-border italic text-[11px]'
            : msg.type === 'wallet'
              ? 'bg-emerald-500/5 text-emerald-500 rounded-tl-sm border-emerald-500/10'
              : msg.type === 'gateway'
                ? 'bg-amber-500/5 text-amber-500 rounded-tl-sm border-amber-500/10 font-mono text-[11px]'
                : msg.type === 'error'
                  ? 'bg-destructive/5 text-destructive rounded-tl-sm border-destructive/10 font-bold'
                  : 'bg-muted/20 text-foreground/80 rounded-tl-sm border-border'
          }`}>
          {msg.content}

          {/* Render transaction links if applicable */}
          {msg.txHash && (
            <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-end select-none">
              <a
                href={`https://explorer-hoodi.morph.network/tx/${msg.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border pointer-events-auto transition-colors hover:bg-opacity-20 ${msg.type === 'wallet'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                  }`}
              >
                TX Explorer <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>

        {msg.type === 'wallet' && msg.txHash && (
          <QRCodeContainer
            value={msg.txHash}
          />
        )}
      </div>

      {/* Right Avatar for User */}
      {isUser && (
        <div className="ml-2.5 mt-0.5 shrink-0 select-none">
          <div className="h-7 w-7 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700/50">
            <User className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
