'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ArrowUpRight, Check, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QRCodeContainerProps {
  value: string; // The tx hash
  minimal?: boolean;
}

export default function QRCodeContainer({ value, minimal = false }: QRCodeContainerProps) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    const config = { attributes: true, attributeFilter: ['class'] };
    observer.observe(document.documentElement, config);

    return () => observer.disconnect();
  }, []);

  const qrData =
    value.startsWith('0x') && value.length === 66
      ? `https://explorer-hoodi.morph.network/tx/${value}`
      : value;

  const qrImageUrl = isDark
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${minimal ? '100x100' : '160x160'}&data=${encodeURIComponent(qrData)}&color=ffffff&bgcolor=09090b`
    : `https://api.qrserver.com/v1/create-qr-code/?size=${minimal ? '100x100' : '160x160'}&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (minimal) {
    return (
      <div className="relative shrink-0 flex items-center justify-center bg-muted/40 border border-border p-1.5 rounded-lg w-24 h-24 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/40">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-card/85 rounded-lg"
            >
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
        <img
          src={qrImageUrl}
          alt="Morph L2 Transaction QR"
          className="w-full h-full object-contain rounded-md"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-border bg-card p-4 rounded-xl flex flex-col md:flex-row gap-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 max-w-lg w-full mt-2.5">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 h-[80px] w-[80px] rounded-full filter blur-[40px] opacity-10 bg-emerald-500" />

      {/* QR Code Graphic Frame */}
      <div className="relative shrink-0 flex items-center justify-center bg-muted/40 border border-border p-2.5 rounded-lg w-[164px] h-[164px] mx-auto md:mx-0">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-card/85 rounded-lg"
            >
              <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
              <span className="text-[9px] text-muted-foreground mt-2 font-mono">ENCODING QR...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <img
          src={qrImageUrl}
          alt="Morph L2 Transaction QR"
          className="w-full h-full object-contain rounded-md"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>

      {/* QR Details */}
      <div className="flex-1 flex flex-col justify-between gap-2.5">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
            Morph Blockchain
          </span>

          <h4 className="text-xs font-black text-foreground tracking-wide uppercase flex items-center gap-1.5 pt-1">
            <QrCode className="h-3.5 w-3.5 shrink-0" />
            Morph L2 Transaction QR
          </h4>
          <p className="text-[10px] text-muted-foreground leading-normal font-medium">
            Scan to view block details on Morph Hoodi Testnet.
          </p>
        </div>

        {/* Dynamic Context Parameters */}
        <div className="bg-muted/30 border border-border rounded-lg px-2.5 py-1.5 space-y-1 font-mono text-[9px] text-muted-foreground">
          <div className="truncate">TX HASH: <span className="text-foreground">{value.slice(0, 16)}...</span></div>
          <div>CHAIN: <span className="text-foreground font-bold">Morph Hoodi L2</span></div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-input py-1.5 px-2 rounded-lg cursor-pointer pointer-events-auto transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Payload
              </>
            )}
          </button>

          {value.startsWith('0x') && (
            <a
              href={`https://explorer-hoodi.morph.network/tx/${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 py-1.5 px-2 rounded-lg cursor-pointer pointer-events-auto text-center transition-all"
            >
              Explorer <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
