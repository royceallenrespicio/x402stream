export interface CustomAgent {
  id: string;
  name: string;
  role: string;
  vendorSlug: string;
  prompt: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  vendorSlug: string;
  status: 'idle' | 'thinking' | 'calling_vendor' | 'payment_challenged' | 'paying' | 'completed';
  message: string;
  reasoning?: string;
  result?: string;
  txHash?: string;
  isRealTx?: boolean;
}

export interface SettlementHistoryItem {
  id: string;
  sessionId?: string;
  timestamp: string;
  goal: string;
  summary: string;
  agentsCount: number;
  totalCost: string;
  realOnChain: boolean;
  ledger?: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  agent: string;
  vendor: string;
  cost: string;
  recipient: string;
  status: 'challenged' | 'paying' | 'fulfilled' | 'failed';
  txHash?: string;
  realOnChain?: boolean;
  message: string;
}

export interface ExecutionSession {
  id: string;
  title: string;
  timestamp: string;
  goal: string;
  running: boolean;
  pipelineLogs: string[];
  finalSummary: string;
  errorText: string;
  currentStepInfo: string;
  agents: AgentState[];
  ledger: LedgerEntry[];
  progressValue: number;
}
