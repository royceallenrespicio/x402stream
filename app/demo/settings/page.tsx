'use client';

import React from 'react';
import { useOrchestrator } from '@/app/demo/_providers/OrchestratorProvider';
import { motion } from 'motion/react';

// Modular Components
import SettingsHeader from '@/app/demo/settings/_components/SettingsHeader';
import PrivateKeyConfig from '@/app/demo/settings/_components/PrivateKeyConfig';

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export default function SettingsPage() {
  const {
    privateKey,
    setPrivateKey,
    realAddress,
  } = useOrchestrator();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Settings Header */}
      <SettingsHeader realAddress={realAddress} />

      {/* Private Key Configuration Card */}
      <PrivateKeyConfig
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        realAddress={realAddress}
      />
    </motion.div>
  );
}
