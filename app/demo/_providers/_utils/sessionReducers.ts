import {
  ExecutionSession,
  SettlementHistoryItem,
  PipelineEventData
} from '@/types/orchestrator';

export interface ReducerContext {
  refreshRealBalance: () => void;
  setMockBalance: React.Dispatch<React.SetStateAction<number>>;
  setSettlementHistory: React.Dispatch<React.SetStateAction<SettlementHistoryItem[]>>;
  setAlertStack: React.Dispatch<React.SetStateAction<SettlementHistoryItem[]>>;
  vendorsData: Array<{ slug: string; cost: string }>;
}

export function reducePipelineEvent(
  session: ExecutionSession,
  event: string,
  data: PipelineEventData,
  timestamp: string,
  context: ReducerContext
): ExecutionSession {
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
          setTimeout(context.refreshRealBalance, 2500);
        }
      }
      break;

    case 'agent-complete':
      if (data.agentId && data.result && data.message) {
        const aid = data.agentId;
        const res = data.result;
        const amsg = data.message;
        const isReal = !!data.realOnChain;
        const gasFee = data.gasFee || '0.000021 ETH';

        updatedAgents = updatedAgents.map(a => a.id === aid ? { ...a, status: 'completed', message: amsg, result: res } : a);

        updatedLedger = updatedLedger.map(l => l.agent === (data.agentName || aid) && (l.status === 'paying' || l.status === 'challenged') ? {
          ...l,
          status: 'fulfilled',
          realOnChain: isReal,
          gasFee: gasFee
        } : l);

        if (!isReal) {
          const agentObj = updatedAgents.find(a => a.id === aid);
          const vendorSlug = agentObj?.vendorSlug;
          const vendor = context.vendorsData.find(v => v.slug === vendorSlug);
          const cost = vendor ? parseFloat(vendor.cost) : 0.00;
          context.setMockBalance(prev => Math.max(0, prev - cost));
        }

        updatedLogs.push(`[${data.agentName || aid}]: Step resolved! Resource unlocked successfully. Gas Fee: ${gasFee}`);
      }
      break;

    case 'all-complete':
      if (data.finalSummary) {
        // Guard: skip if session already completed
        if (!session.running || session.finalSummary) return session;

        updatedRunning = false;
        updatedFinalSummary = data.finalSummary;
        updatedLogs.push(`[SYSTEM]: All cooperative steps verified. Complete workflow goals achieved.`);

        context.refreshRealBalance();

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
          context.setSettlementHistory(prev => {
            // Guard: prevent duplicate entries for the same session
            if (prev.some(item => item.sessionId === currentSessionId)) return prev;
            const next = [newItem, ...prev];
            localStorage.setItem('x402stream_history', JSON.stringify(next));
            return next;
          });
          context.setAlertStack(prev => {
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
}
