'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wallet, Key, RefreshCw, Coins } from 'lucide-react';
import { getAccountFromKey, getMorphBalance } from '@/lib/morph';
import { motion } from 'motion/react';

export default function WalletWidget({
  mockBalance,
  privateKey,
  setPrivateKey,
  realAddress,
  setRealAddress
}: {
  mockBalance: number;
  privateKey: string;
  setPrivateKey: (key: string) => void;
  realAddress: string;
  setRealAddress: (addr: string) => void;
}) {
  const [realBalance, setRealBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const fetchRealBalance = useCallback(async (address: string) => {
    setLoading(true);
    const balance = await getMorphBalance(address);
    setRealBalance(balance);
    setLoading(false);
  }, []);

  // Sync real address on private key changes
  useEffect(() => {
    if (privateKey) {
      const account = getAccountFromKey(privateKey);
      if (account) {
        const timer = setTimeout(() => {
          setRealAddress(account.address);
          fetchRealBalance(account.address);
        }, 0);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setRealAddress('');
        }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        setRealAddress('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [privateKey, setRealAddress, fetchRealBalance]);

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(e.target.value);
  };

  return (
    <Card className="relative overflow-hidden border border-border bg-card backdrop-blur-xl">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground font-bold">x402 Agent Wallet</CardTitle>
              <CardDescription className="text-muted-foreground">Conceptual stablecoin & testnet balance</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5">
            Morph Hoodi Testnet
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balances container */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-muted-foreground" />
              Mock ETH Balance
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {mockBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH
            </div>
            <div className="text-[10px] text-muted-foreground/80 mt-1">Autonomous gas-free simulated budget</div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Morph Testnet ETH
              </div>
              {realAddress && (
                <button
                  onClick={() => fetchRealBalance(realAddress)}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground truncate">
              {realAddress ? `${parseFloat(realBalance).toFixed(4)} ETH` : 'N/A'}
            </div>
            <div className="text-[10px] text-muted-foreground/80 mt-1 truncate">
              {realAddress ? `${realAddress.slice(0, 6)}...${realAddress.slice(-4)}` : 'Setup private key to query'}
            </div>
          </div>
        </div>

        {/* Private key configurator toggler */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground/90 hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
          >
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            {showKeyInput ? 'Hide key parameters' : 'Configure Testnet Private Key'}
          </button>

          {showKeyInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground font-medium">EVM Private Key (Holesky/Hoodi)</label>
                <Input
                  type="password"
                  placeholder="0x..."
                  value={privateKey}
                  onChange={handlePrivateKeyChange}
                  className="h-9 border-input bg-background text-xs text-foreground focus:border-ring"
                />
              </div>

              {realAddress ? (
                <Alert className="border-emerald-500/20 bg-emerald-500/5 text-muted-foreground py-2.5">
                  <AlertDescription className="text-[11px] leading-relaxed flex items-center justify-between">
                    <span>
                      Active: <strong>{realAddress.slice(0, 10)}...{realAddress.slice(-8)}</strong>
                    </span>
                    <a
                      href={`https://explorer-hoodi.morph.network/address/${realAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      View Explorer
                    </a>
                  </AlertDescription>
                </Alert>
              ) : privateKey ? (
                <Alert className="border-destructive/20 bg-destructive/5 text-destructive py-2.5">
                  <AlertDescription className="text-[11px]">
                    Invalid private key structure. Must be a 64-character hex string.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-8 border-input bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold"
                >
                  <a
                    href="https://bridge-holesky.morphl2.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bridge Faucet
                  </a>
                </Button>
                <Button
                  onClick={() => {
                    // Quick faucet instructions mock
                    alert("To fund your Morph Hoodi wallet:\n1. Get Sepolia / Holesky Test ETH\n2. Use the Morph Bridge (https://bridge-holesky.morphl2.io) to bridge ETH to Morph Holesky Testnet.");
                  }}
                  variant="outline"
                  className="flex-1 h-8 border-input bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold"
                >
                  Faucet Guide
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
