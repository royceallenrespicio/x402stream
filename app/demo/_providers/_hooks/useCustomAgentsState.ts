'use client';

import { useState } from 'react';
import { CustomAgent } from '@/types/orchestrator';

export const PRESET_AGENTS: CustomAgent[] = [
  {
    id: 'agent-1',
    name: 'OFWRemitRouter',
    role: 'Cross-Border Remittance & L2 Wallet Dispatcher',
    vendorSlug: 'bdo-unibank',
    prompt: 'Coordinate with BDO Business Treasury to automatically route incoming overseas remittance streams (USD/CAD) on-chain, executing currency conversion checks and loading PHP liquidity pools into digital wallet recipients (GCash/PayMaya) at minimal network fees.'
  },
  {
    id: 'agent-2',
    name: 'BenguetAgriSettle',
    role: 'Farm-to-Table Supply Chain Custodian',
    vendorSlug: 'jollibee',
    prompt: 'Verify cold-chain shipment GPS coordinates and temperature logs for agricultural deliveries from Benguet farms, and autonomously trigger instant cash-on-delivery payments to the local farming cooperative\'s multi-sig wallet upon warehouse gate scan confirmation.'
  },
  {
    id: 'agent-3',
    name: 'GridPowerOptimizer',
    role: 'Prepaid Smart Meter Utility Settlement',
    vendorSlug: 'aboitiz-equity',
    prompt: 'Continuously audit residential smart-grid IoT data feeds, automatically query current electric load thresholds, and authorize instant micro-payments on Morph L2 to settle utility dues, preventing power cutoffs for low-income household clusters.'
  }
];

export function useCustomAgentsState() {
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(PRESET_AGENTS);

  const addCustomAgent = (agent: Omit<CustomAgent, 'id'>): boolean => {
    if (customAgents.length >= 10) return false;
    const newId = `agent-${Date.now()}`;
    setCustomAgents(prev => [...prev, { ...agent, id: newId }]);
    return true;
  };

  const updateCustomAgent = (id: string, updated: Omit<CustomAgent, 'id'>) => {
    setCustomAgents(prev => prev.map(a => a.id === id ? { ...updated, id } : a));
  };

  const deleteCustomAgent = (id: string) => {
    setCustomAgents(prev => prev.filter(a => a.id !== id));
  };

  const loadPresets = () => {
    setCustomAgents(PRESET_AGENTS);
  };

  return {
    customAgents,
    setCustomAgents,
    addCustomAgent,
    updateCustomAgent,
    deleteCustomAgent,
    loadPresets
  };
}
