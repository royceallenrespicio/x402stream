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
} from '@/types/orchestrator';
import vendorsData from '@/app/_data/vendors.json';

interface PipelineEventData {
  message?: string;
  agentId?: string;
  agentName?: string;
  title?: string;
  status?: 'idle' | 'thinking' | 'calling_vendor' | 'payment_challenged' | 'paying' | 'completed';
  reasoning?: string;
  challengeHeader?: {
    challengeId: string;
  };
  vendorName?: string;
  cost?: string;
  recipient?: string;
  txHash?: string;
  isRealTx?: boolean;
  result?: string;
  verification?: string;
  realOnChain?: boolean;
  finalSummary?: string;
  error?: string;
}

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

      let updatedLogs = [...session.pipelineLogs];
      let updatedAgents = [...session.agents];
      let updatedLedger = [...session.ledger];
      let updatedRunning = session.running;
      let updatedFinalSummary = session.finalSummary;
      let updatedErrorText = session.errorText;
      let updatedStepInfo = session.currentStepInfo;

      switch (event) {
        case 'status':
          if (data.message) {
            updatedStepInfo = data.message;
            updatedLogs.push(`[SYSTEM - ${timestamp}]: ${data.message}`);
          }
          break;

        case 'agent-start':
          if (data.agentId && data.status && data.message) {
            const aid = data.agentId;
            const astatus = data.status;
            const amsg = data.message;
            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: astatus, message: amsg } : a);
            updatedLogs.push(`[${data.agentName || aid}]: Initiating task delegation...`);
          }
          break;

        case 'agent-reasoning':
          if (data.agentId && data.status && data.message && data.reasoning) {
            const aid = data.agentId;
            const astatus = data.status;
            const amsg = data.message;
            const reason = data.reasoning;
            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: astatus, message: amsg, reasoning: reason } : a);
            updatedLogs.push(`[${data.agentName || aid} THOUGHT]: "${reason}"`);
          }
          break;

        case 'x402-challenge':
          if (data.agentId && data.status && data.message && data.challengeHeader && data.vendorName && data.cost && data.recipient) {
            const aid = data.agentId;
            const astatus = data.status;
            const amsg = data.message;
            const vname = data.vendorName;
            const vcost = data.cost;
            const vrecipient = data.recipient;
            const chalId = data.challengeHeader.challengeId;

            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: astatus, message: amsg } : a);

            updatedLedger = [
              {
                id: chalId,
                timestamp,
                agent: data.agentName || aid,
                vendor: vname,
                cost: vcost,
                recipient: vrecipient,
                status: 'challenged',
                message: amsg
              },
              ...updatedLedger
            ];

            updatedLogs.push(`[x402 GATEWAY]: HTTP 402 Payment Required! Challenge issued by ${vname}. Recipient: ${vrecipient}, Cost: ${vcost} ETH.`);
          }
          break;

        case 'wallet-signing':
          if (data.agentId && data.message) {
            const aid = data.agentId;
            const amsg = data.message;
            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: 'paying', message: amsg } : a);
          }
          break;

        case 'payment-sent':
          if (data.agentId && data.message && data.txHash) {
            const aid = data.agentId;
            const amsg = data.message;
            const hash = data.txHash;
            const isReal = !!data.isRealTx;

            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: 'paying', message: amsg, txHash: hash, isRealTx: isReal } : a);

            updatedLedger = updatedLedger.map(l => l.status === 'challenged' && l.agent === (data.agentName || aid) ? {
              ...l,
              status: 'paying',
              txHash: hash,
              realOnChain: isReal
            } : l);

            if (isReal) {
              updatedLogs.push(`[WALLET]: Signed & broadcasted L2 transaction on Morph Hoodi! Hash: ${hash}`);
            } else if (data.error) {
              updatedLogs.push(`[WALLET - WARNING]: On-chain transaction failed: ${data.error}`);
              updatedLogs.push(`[WALLET - FALLBACK]: Simulating mock signature proof instead: ${hash}`);
            } else {
              updatedLogs.push(`[WALLET - SIMULATION]: No private key configured. Using conceptual mock signature: ${hash}`);
            }

            if (isReal) {
              setTimeout(refreshRealBalance, 2500);
            }
          }
          break;

        case 'agent-complete':
          if (data.agentId && data.result && data.message) {
            const aid = data.agentId;
            const res = data.result;
            const amsg = data.message;
            const isReal = !!data.realOnChain;

            updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: 'completed', message: amsg, result: res } : a);

            updatedLedger = updatedLedger.map(l => l.agent === (data.agentName || aid) && (l.status === 'paying' || l.status === 'challenged') ? {
              ...l,
              status: 'fulfilled',
              realOnChain: isReal
            } : l);

            if (!isReal) {
              const agentObj = customAgents.find(a => a.id === aid);
              const vendorSlug = agentObj?.vendorSlug;
              const vendor = vendorsData.find(v => v.slug === vendorSlug);
              const cost = vendor ? parseFloat(vendor.cost) : 0.00;
              setMockBalance(prev => Math.max(0, prev - cost));
            }

            updatedLogs.push(`[${data.agentName || aid}]: Step resolved! Resource unlocked successfully.`);
          }
          break;

        case 'all-complete':
          if (data.finalSummary) {
            // Guard: skip if session already completed
            if (!session.running || session.finalSummary) return session;

            updatedRunning = false;
            updatedFinalSummary = data.finalSummary;
            updatedLogs.push(`[SYSTEM]: All cooperative steps verified. Complete workflow goals achieved.`);

            refreshRealBalance();

            const isReal = updatedLedger.some(l => l.realOnChain);
            const totalCost = updatedLedger.reduce((sum, l) => sum + parseFloat(l.cost || '0'), 0).toFixed(5);

            const newItemId = `settle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const currentSessionId = session.id;
            const newItem: SettlementHistoryItem = {
              id: newItemId,
              sessionId: currentSessionId,
              timestamp: new Date().toLocaleString(),
              goal: session.goal,
              summary: data.finalSummary,
              agentsCount: updatedAgents.length,
              totalCost,
              realOnChain: isReal,
              ledger: updatedLedger
            };

            setTimeout(() => {
              setSettlementHistory(prev => {
                // Guard: prevent duplicate entries for the same session
                if (prev.some(item => item.sessionId === currentSessionId)) return prev;
                const next = [newItem, ...prev];
                localStorage.setItem('x402stream_history', JSON.stringify(next));
                return next;
              });
              setAlertStack(prev => {
                if (prev.some(item => item.sessionId === currentSessionId)) return prev;
                return [...prev, newItem];
              });
            }, 10);
          }
          break;

          case 'error':
            if (data.message) {
              const amsg = data.message;
              updatedErrorText = amsg;
              updatedRunning = false;
              updatedLogs.push(`[PIPELINE ERROR]: ${amsg}`);
            }
            break;
      }

      // Compute progress
      const totalA = updatedAgents.length;
      const completedA = updatedAgents.filter(a => a.status === 'completed').length;
      let computedProgress = 0;
      if (updatedRunning) {
        computedProgress = totalA > 0 ? Math.round((completedA / totalA) * 90) : 10;
        if (computedProgress < 10) computedProgress = 10;
      } else if (updatedFinalSummary || updatedLogs.some(l => l.includes('verified') || l.includes('complete'))) {
        computedProgress = 100;
      }

      return {
        ...session,
        pipelineLogs: updatedLogs,
        agents: updatedAgents,
        ledger: updatedLedger,
        running: updatedRunning,
        finalSummary: updatedFinalSummary,
        errorText: updatedErrorText,
        currentStepInfo: updatedStepInfo,
        progressValue: computedProgress
      };
    }));
  }, [refreshRealBalance, setMockBalance, customAgents]);

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
