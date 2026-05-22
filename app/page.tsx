'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { Play, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function HomePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center w-full py-4 md:py-8"
    >
      {/* Hero Branding */}
      <motion.div variants={itemVariants} className="text-center mb-10 md:mb-14 max-w-2xl px-4">
        <h1 className="text-fluid-xl font-black tracking-tight text-foreground mb-3">
          x402stream
        </h1>
        <p className="text-fluid-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Machine-to-machine autonomous payment pipelines powered by HTTP 402 challenges,
          settling transactions on the Morph L2 blockchain network.
        </p>

        {/* Feature pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-2 mt-5"
        >
          {[
            { icon: Zap, label: 'x402 Protocol' },
            { icon: Shield, label: 'Morph L2' },
            { icon: Globe, label: 'Multi-Agent' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-[11px] font-semibold"
            >
              <pill.icon className="h-3 w-3 text-muted-foreground/80" />
              {pill.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Centered Single Card Container */}
      <div className="w-full max-w-md px-4">

        {/* Demo Mode Card */}
        <motion.div variants={cardVariants}>
          <Link href="/demo" className="block group pointer-events-auto">
            <Card className="relative overflow-hidden border border-border bg-card/65 backdrop-blur-sm h-full transition-all duration-300 hover:border-primary/50 hover:bg-accent/40 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30">
              <CardContent className="p-6 md:p-8 flex flex-col justify-between min-h-[220px] md:min-h-[260px]">
                <div>
                  {/* Icon + Badge row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-md"
                    >
                      <Play className="h-5 w-5 fill-current" />
                    </motion.div>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      Simulation
                    </Badge>
                  </div>

                  <h2 className="text-fluid-lg font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">
                    Demo Mode
                  </h2>
                  <p className="text-fluid-sm text-muted-foreground leading-relaxed transition-colors">
                    Explore the multi-agent dashboard with simulated mock payments.
                    No private key required — perfect for testing workflows.
                  </p>
                </div>

                {/* Bottom action hint */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Mock Signatures
                  </span>
                  <motion.span
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

      </div>

      {/* Footer text */}
      <motion.p
        variants={itemVariants}
        className="text-[11px] text-muted-foreground/85 mt-8 md:mt-12 text-center px-4"
      >
        Built on Morph L2 · HTTP 402 Standard · Autonomous Agent Pipelines
      </motion.p>
    </motion.div>
  );
}
