'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCustomAgentsState } from '@/app/demo/_providers/_hooks/useCustomAgentsState';
import { useWalletState } from '@/app/demo/_providers/_hooks/useWalletState';
import {
  CustomAgent,
  AgentState,
  SettlementHistoryItem,
  LedgerEntry,
  ExecutionSession,
  PipelineEventData,
} from '@/types/orchestrator';
import vendorsData from '@/app/_data/vendors.json';
import { reducePipelineEvent } from '@/app/demo/_providers/_utils/sessionReducers';

interface OrchestratorContextType {
  // Goals & Execution
  goal: string;
  setGoal: (g: string) => void;
  running: boolean;
  pipelineLogs: string[];
  finalSummary: string;
  errorText: string;
  currentStepInfo: string;
  startPipeline: () => Promise<void>;
  resetPipeline: () => void;

  // Custom Agents
  customAgents: CustomAgent[];
  setCustomAgents: React.Dispatch<React.SetStateAction<CustomAgent[]>>;
  addCustomAgent: (agent: Omit<CustomAgent, 'id'>) => boolean;
  updateCustomAgent: (id: string, agent: Omit<CustomAgent, 'id'>) => void;
  deleteCustomAgent: (id: string) => void;
  loadPresets: () => void;

  // Real-Time Running Agents
  agents: AgentState[];

  // Ledger & Historical Txs
  ledger: LedgerEntry[];

  // Wallet
  privateKey: string;
  setPrivateKey: (key: string) => void;
  realAddress: string;
  mockBalance: number;
  setMockBalance: React.Dispatch<React.SetStateAction<number>>;
  realBalance: string;
  refreshRealBalance: () => Promise<void>;

  // Settlement History & Alert Stack
  settlementHistory: SettlementHistoryItem[];
  setSettlementHistory: React.Dispatch<React.SetStateAction<SettlementHistoryItem[]>>;
  alertStack: SettlementHistoryItem[];
  dismissAlert: (id: string) => void;
  runSingleAgent: (agent: CustomAgent) => Promise<void>;

  // Sessions
  sessions: ExecutionSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  deleteSession: (id: string) => void;
}

const OrchestratorContext = createContext<OrchestratorContextType | undefined>(undefined);

export function OrchestratorProvider({ children }: { children: React.ReactNode }) {
  const [globalGoal, setGlobalGoal] = useState('');
  const [sessions, setSessions] = useState<ExecutionSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Modular state hooks
  const {
    customAgents,
    setCustomAgents,
    addCustomAgent,
    updateCustomAgent,
    deleteCustomAgent,
    loadPresets
  } = useCustomAgentsState();

  const {
    privateKey,
    setPrivateKey,
    mockBalance,
    setMockBalance,
    realBalance,
    realAddress,
    refreshRealBalance
  } = useWalletState();

  // Settlement History states
  const [settlementHistory, setSettlementHistory] = useState<SettlementHistoryItem[]>([]);
  const [alertStack, setAlertStack] = useState<SettlementHistoryItem[]>([]);

  const dismissAlert = useCallback((id: string) => {
    setAlertStack(prev => prev.filter(item => item.id !== id));
  }, []);

  // Active Session derived values for backward compatibility
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const goal = globalGoal;
  const running = activeSession ? activeSession.running : false;
  const pipelineLogs = activeSession ? activeSession.pipelineLogs : [];
  const finalSummary = activeSession ? activeSession.finalSummary : '';
  const errorText = activeSession ? activeSession.errorText : '';
  const currentStepInfo = activeSession ? activeSession.currentStepInfo : 'System Standby - Configure your custom agents and enter an orchestrator goal';
  const agents = activeSession ? activeSession.agents : [];
  const ledger = activeSession ? activeSession.ledger : [];

  const setGoal = (newGoal: string) => {
    setGlobalGoal(newGoal);
  };

  // Load settlement history on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('x402stream_history');
      if (savedHistory) {
        setSettlementHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const resetPipeline = () => {
    if (activeSessionId) {
      deleteSession(activeSessionId);
    } else {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  // SSE event parsing
  const handlePipelineEvent = useCallback((sessionId: string, event: string, data: PipelineEventData) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      return reducePipelineEvent(session, event, data, timestamp, {
        refreshRealBalance,
        setMockBalance,
        setSettlementHistory,
        setAlertStack,
        vendorsData
      });
    }));
  }, [refreshRealBalance, setMockBalance, setSettlementHistory, setAlertStack]);

  // Run the Multi-Agent orchestrator pipeline
  const startPipeline = async () => {
    if (!goal.trim()) return;
    if (customAgents.length === 0) return;

    const sessionId = `session-${Date.now()}`;
    const initialRunningState = customAgents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      vendorSlug: a.vendorSlug,
      status: 'idle' as const,
      message: 'Standby - awaiting sequence queue allocation'
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newSession: ExecutionSession = {
      id: sessionId,
      title: `Pipeline: ${goal.slice(0, 20)}${goal.length > 20 ? '...' : ''}`,
      timestamp,
      goal: goal,
      running: true,
      pipelineLogs: ['[SYSTEM]: Launching autonomous x402 payment multi-agent network...'],
      finalSummary: '',
      errorText: '',
      currentStepInfo: 'System Standby - Configure your custom agents and enter an orchestrator goal',
      agents: initialRunningState,
      ledger: [],
      progressValue: 0
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(sessionId);

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal: goal,
          privateKey: privateKey || undefined,
          agents: customAgents
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start agent orchestrator: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No SSE stream available from orchestrator.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1].trim();
          const parsedData = JSON.parse(dataMatch[1].trim()) as PipelineEventData;

          handlePipelineEvent(sessionId, event, parsedData);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        errorText: errorMessage,
        running: false,
        pipelineLogs: [...s.pipelineLogs, `[PIPELINE ERROR]: ${errorMessage}`]
      } : s));
    }
  };

  const runSingleAgent = async (agent: CustomAgent) => {
    const sessionId = `session-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const initialRunningState = [{
      id: agent.id,
      name: agent.name,
      role: agent.role,
      vendorSlug: agent.vendorSlug,
      status: 'idle' as const,
      message: 'Standby - initiating individual agent execution'
    }];

    const newSession: ExecutionSession = {
      id: sessionId,
      title: `${agent.name} Manual Run`,
      timestamp,
      goal: `Manually run agent ${agent.name} (${agent.role}): ${agent.prompt}`,
      running: true,
      pipelineLogs: [`[SYSTEM - ${timestamp}]: Triggering single agent manual run for ${agent.name}...`],
      finalSummary: '',
      errorText: '',
      currentStepInfo: 'Standby - initiating individual agent execution',
      agents: initialRunningState,
      ledger: [],
      progressValue: 0
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(sessionId);

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal: `Manually run agent ${agent.name} (${agent.role}): ${agent.prompt}`,
          privateKey: privateKey || undefined,
          agents: [agent]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start agent: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No SSE stream available.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1].trim();
          const parsedData = JSON.parse(dataMatch[1].trim()) as PipelineEventData;

          handlePipelineEvent(sessionId, event, parsedData);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        errorText: errorMessage,
        running: false,
        pipelineLogs: [...s.pipelineLogs, `[PIPELINE ERROR]: ${errorMessage}`]
      } : s));
    }
  };

  return (
    <OrchestratorContext.Provider value={{
      goal,
      setGoal,
      running,
      pipelineLogs,
      finalSummary,
      errorText,
      currentStepInfo,
      startPipeline,
      resetPipeline,
      customAgents,
      setCustomAgents,
      addCustomAgent,
      updateCustomAgent,
      deleteCustomAgent,
      loadPresets,
      agents,
      ledger,
      privateKey,
      setPrivateKey,
      realAddress,
      mockBalance,
      setMockBalance,
      realBalance,
      refreshRealBalance,
      settlementHistory,
      setSettlementHistory,
      alertStack,
      dismissAlert,
      runSingleAgent,
      sessions,
      activeSessionId,
      setActiveSessionId,
      deleteSession
    }}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export function useOrchestrator() {
  const context = useContext(OrchestratorContext);
  if (context === undefined) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
}
