'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Avatar,
} from '@/components/ui/avatar';
import {
  Key, ExternalLink, Eye, EyeOff, Info,
  Copy, Check, Trash2, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom dynamic gradient based on EVM address string for Web3 visual identities
const getAddressGradient = (address: string) => {
  if (!address || address.length < 10) return 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
  const hex = address.replace('0x', '');
  const char1 = hex.charCodeAt(0) || 0;
  const char2 = hex.charCodeAt(2) || 0;
  const char3 = hex.charCodeAt(4) || 0;
  const char4 = hex.charCodeAt(6) || 0;

  const hue1 = (char1 * 7) % 360;
  const hue2 = (char2 * 11) % 360;
  const deg = (char3 * 3) % 360;
  const sat = 75 + (char4 % 15); // 75-90%
  const light = 45 + (char1 % 10); // 45-55%

  return `linear-gradient(${deg}deg, hsl(${hue1}, ${sat}%, ${light}%), hsl(${hue2}, ${sat}%, ${light}%))`;
};

interface PrivateKeyConfigProps {
  privateKey: string;
  setPrivateKey: (val: string) => void;
  realAddress: string | null;
}

export default function PrivateKeyConfig({
  privateKey,
  setPrivateKey,
  realAddress,
}: PrivateKeyConfigProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(e.target.value);
  };

  const handleCopy = () => {
    if (realAddress) {
      navigator.clipboard.writeText(realAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-lg">
      <CardHeader className="pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted border border-border text-muted-foreground shadow-inner">
            <Key className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-foreground font-bold text-sm">Blockchain Private Key</CardTitle>
            <CardDescription className="text-muted-foreground text-[11px] mt-0.5">
              Configure an EVM compatible private key to sign and broadcast real transaction proof.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Identity Profile Banner */}
        <AnimatePresence mode="wait">
          {realAddress && (
            <motion.div
              key="web3-identity"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pb-5 border-b border-border mb-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <Avatar size="lg" className="border-2 border-emerald-500/20 shadow-md">
                    <div
                      className="w-full h-full flex items-center justify-center font-mono font-bold text-white text-xs"
                      style={{ background: getAddressGradient(realAddress) }}
                    >
                      {realAddress.slice(2, 4).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground font-bold text-xs tracking-wide">Connected EVM Identity</h4>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0 hover:bg-emerald-500/25">
                        Morph Testnet
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <code className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border break-all select-all">
                        {realAddress}
                      </code>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleCopy}
                            className="p-1 rounded-md bg-muted border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {copied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.7, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0.7, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.7, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="text-[10px] font-semibold">{copied ? 'Copied address!' : 'Copy Wallet Address'}</span>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`https://explorer-hoodi.morph.network/address/${realAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-muted border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="text-[10px] font-semibold">View on Morph Explorer</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto self-end md:self-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setPrivateKey('');
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto h-8 text-[11px] font-bold text-rose-400 hover:text-rose-350 border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 pointer-events-auto transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Disconnect Wallet
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="text-[10px] font-semibold">Wipe key and return to Mock simulation mode</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                EVM Private Key (64-char Hex)
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground hover:text-foreground transition-colors">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-2.5 bg-card border border-border text-foreground rounded-xl">
                  <p className="text-[10px] leading-relaxed">
                    <strong>Local Storage Guarantee</strong>: Your private key is kept inside your browser's local sandbox storage. We never upload your key to any server.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer pointer-events-auto transition-colors"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showKey ? 'Hide Raw Key' : 'Reveal Key'}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="text-[10px] font-semibold">{showKey ? 'Mask private key content' : 'Display raw private key character string'}</span>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your EVM Holesky/Hoodi Private Key (0x...)"
              value={privateKey}
              onChange={handlePrivateKeyChange}
              className="h-10 pr-10 border-border bg-muted/50 text-foreground text-xs focus:border-primary/80 rounded-xl transition-all font-mono"
            />
            <div className="absolute right-3.5 top-3 flex items-center justify-center text-muted-foreground">
              <Key className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Status Indicator boxes when not active */}
        {!realAddress && (
          <AnimatePresence mode="wait">
            {privateKey ? (
              <motion.div
                key="invalid-key"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Alert className="border-rose-500/20 bg-rose-500/5 text-rose-400 py-3 rounded-xl flex items-start gap-2.5">
                  <span className="text-base select-none mt-0.5">⚠️</span>
                  <AlertDescription className="text-[11px] leading-relaxed text-rose-455 font-medium">
                    Invalid key format. Ensure it is a 64-character hexadecimal EVM key (32 bytes).
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : (
              <motion.div
                key="simulation-mode"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Alert className="border-border bg-card text-muted-foreground py-3 rounded-xl">
                  <AlertDescription className="text-[11px] flex items-start gap-2.5">
                    <Info className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-muted-foreground/80">
                      Currently running in <strong className="text-foreground">Simulation Mock Mode</strong>. The Multi-Agent platform will generate valid mock signatures and broadcast simulated transaction proofs without consuming live testnet gas.
                    </span>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
