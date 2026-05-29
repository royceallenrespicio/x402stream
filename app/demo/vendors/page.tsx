'use client';

import React from 'react';
import { useOrchestrator } from '@/app/demo/_providers/OrchestratorProvider';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import VendorStatus from '@/app/demo/_components/VendorStatus';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function VendorsPage() {
  const { agents } = useOrchestrator();

  const activeAgent = agents.find(
    (a) => a.status === 'calling_vendor' || a.status === 'paying' || a.status === 'payment_challenged'
  );
  const activeSlug = activeAgent?.vendorSlug;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="pb-4 border-b border-border">
        <h1 className="text-fluid-lg font-black tracking-tight text-foreground flex items-center gap-2">
          Mock Vendors
        </h1>
        <p className="text-fluid-sm text-muted-foreground mt-1">
          Explore and manage the simulated enterprise APIs integrated with the x402 settlement system.
        </p>
      </div>

      <div className="w-full">
        <VendorStatus activeSlug={activeSlug} />
      </div>
    </motion.div>
  );
}
