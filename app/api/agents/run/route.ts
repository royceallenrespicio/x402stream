import { NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { sendMorphTransaction, generateMockTxHash } from '@/lib/morph';
import { VENDORS } from '../../vendors/[slug]/route';
import { sanitizePlaintext } from '@/lib/utils';

export const runtime = 'nodejs';

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const MODEL_NAME = 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, privateKey, agents: requestAgents } = body;

    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          sendEvent('status', { message: 'Assembling Custom Agent Collective...', step: 0 });

          // Fallback if no agents configured
          const agentsToRun = requestAgents && Array.isArray(requestAgents) && requestAgents.length > 0
            ? requestAgents
            : [
              { id: 'agent-1', name: 'OFWRemitRouter', role: 'Cross-Border Remittance & L2 Wallet Dispatcher', vendorSlug: 'bdo-unibank', prompt: 'Coordinate with BDO Business Treasury to automatically route incoming overseas remittance streams (USD/CAD) on-chain, executing currency conversion checks and loading PHP liquidity pools into digital wallet recipients (GCash/PayMaya) at minimal network fees.' },
              { id: 'agent-2', name: 'BenguetAgriSettle', role: 'Farm-to-Table Supply Chain Custodian', vendorSlug: 'jollibee', prompt: 'Verify cold-chain shipment GPS coordinates and temperature logs for agricultural deliveries from Benguet farms, and autonomously trigger instant cash-on-delivery payments to the local farming cooperative\'s multi-sig wallet upon warehouse gate scan confirmation.' },
              { id: 'agent-3', name: 'GridPowerOptimizer', role: 'Prepaid Smart Meter Utility Settlement', vendorSlug: 'aboitiz-equity', prompt: 'Continuously audit residential smart-grid IoT data feeds, automatically query current electric load thresholds, and authorize instant micro-payments on Morph L2 to settle utility dues, preventing power cutoffs for low-income household clusters.' }
            ];

          let previousOutput = `User Goal: ${goal}\n`;

          for (let i = 0; i < agentsToRun.length; i++) {
            const agent = agentsToRun[i];
            const vendor = VENDORS[agent.vendorSlug];

            if (!vendor) {
              sendEvent('status', { message: `Warning: Vendor slug '${agent.vendorSlug}' mapped to agent '${agent.name}' not found. Skipping...` });
              continue;
            }

            // Compute dynamic randomized delays to simulate processing execution time
            const d1 = Math.floor(Math.random() * 700) + 800;   // 800ms - 1500ms
            const d2 = Math.floor(Math.random() * 1000) + 1000; // 1000ms - 2000ms
            const d3 = Math.floor(Math.random() * 1300) + 1200; // 1200ms - 2500ms
            const d4 = Math.floor(Math.random() * 700) + 800;   // 800ms - 1500ms

            sendEvent('agent-start', {
              agentId: agent.id,
              agentName: agent.name,
              title: agent.role,
              status: 'thinking',
              message: `${agent.name} is assessing task details: "${agent.prompt}"`
            });

            // 1. LLM generates agent reasoning/thought dynamically
            let reasoning = '';
            let thoughts: string[] = [];
            try {
              if (process.env.GROQ_API_KEY) {
                const response = await generateText({
                  model: groq(MODEL_NAME),
                  maxOutputTokens: 500,
                  prompt: `You are ${agent.name}, an autonomous AI agent with the role: "${agent.role}".
Your specific task instructions are: "${agent.prompt}".
The multi-agent pipeline is working toward the collective goal: "${goal}".
Previous agent outputs so far:
"${previousOutput}"

Write 3 short internal execution log entries (each 1-3 sentences) that mimic the real-time thought process of an AI agent technically accessing a vendor's REST API using the x402 payment protocol. Focus ONLY on the technical API interaction steps.

Guardrails:
- Do NOT use JSON syntax, curly braces {}, brackets [], or markdown blockquotes in your response.
- Do NOT output any payload structure or raw code snippets.
- Write each entry as a plain text description of a step.
- Focus strictly on the following flow:
  1. First entry: Constructing the initial HTTP POST request to the vendor endpoint under /api/vendors/${agent.vendorSlug} to check resource access for ${vendor.name}'s API.
  2. Second entry: Receiving the HTTP 402 Payment Required challenge from the vendor, containing challenge details for ${vendor.cost} ETH to recipient address ${vendor.recipient} on Morph Hoodi Testnet, and preparing the EIP-712 typed payment signature.
  3. Third entry: Re-submitting the POST request with the completed Payment-Signature and Challenge-Id attached, expecting a 200 OK response with the unlocked vendor resource.

Separate each entry with a blank line. Write it as raw internal execution logs — no greetings, no conversational tone. Be terse and technical.`,
                });
                reasoning = sanitizePlaintext(response.text);
                thoughts = reasoning.split(/\n+/).map(t => t.trim()).filter(Boolean);
                if (thoughts.length < 2) {
                  thoughts = splitThoughts(reasoning);
                }
              } else {
                throw new Error('Groq key not configured');
              }
            } catch {
              thoughts = generateDynamicThoughts(
                agent.name,
                vendor.name,
                vendor.cost,
                vendor.recipient,
                goal,
                agent.vendorSlug
              );
            }

            // Send thoughts sequentially to simulate progressive step-by-step thinking
            for (let tIdx = 0; tIdx < thoughts.length; tIdx++) {
              sendEvent('agent-reasoning', {
                agentId: agent.id,
                agentName: agent.name,
                reasoning: sanitizePlaintext(thoughts[tIdx]),
                status: 'calling_vendor',
                message: `${agent.name} is assessing task step ${tIdx + 1}/${thoughts.length}...`
              });
              // Wait between thought bubbles to simulate thinking process in real-time
              await new Promise(r => setTimeout(r, 1200 + Math.random() * 600)); // 1.2s - 1.8s
            }

            // Simulate delay for pacing based on custom runTime
            await new Promise(r => setTimeout(r, d1));

            // 2. Initial Mock Call to Vendor (should trigger HTTP 402 challenge)
            const origin = req.headers.get('origin') || 'http://localhost:3000';
            const vendorUrl = `${origin}/api/vendors/${agent.vendorSlug}`;

            const firstResponse = await fetch(vendorUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                goal,
                agentName: agent.name,
                agentRole: agent.role,
                agentPrompt: agent.prompt
              })
            });

            if (firstResponse.status !== 402) {
              throw new Error(`Unexpected status ${firstResponse.status} from vendor challenge.`);
            }

            const challengeHeader = firstResponse.headers.get('Payment-Required');
            const challengeBody = await firstResponse.json();

            sendEvent('x402-challenge', {
              agentId: agent.id,
              agentName: agent.name,
              status: 'payment_challenged',
              vendorName: vendor.name,
              cost: vendor.cost,
              recipient: vendor.recipient,
              challengeHeader: challengeHeader ? JSON.parse(challengeHeader) : challengeBody.details,
              message: `HTTP 402 Payment Required! ${vendor.name} issued a payment challenge for ${vendor.cost} ETH.`
            });

            await new Promise(r => setTimeout(r, d2));

            // 3. Process L2 transaction on Morph Hoodi Testnet
            let txHash = '';
            let isRealTx = false;
            let walletError = '';

            const activeKey = privateKeyToUse(privateKey);

            if (activeKey) {
              sendEvent('wallet-signing', {
                agentId: agent.id,
                agentName: agent.name,
                message: `Signing on-chain transaction for ${vendor.cost} ETH to ${vendor.recipient} on Morph Hoodi...`
              });

              const txResult = await sendMorphTransaction(activeKey, vendor.recipient, vendor.cost);
              if (txResult.success) {
                txHash = txResult.hash;
                isRealTx = true;
              } else {
                walletError = txResult.error || 'Transaction failure.';
                txHash = generateMockTxHash();
              }
            } else {
              txHash = generateMockTxHash();
            }

            sendEvent('payment-sent', {
              agentId: agent.id,
              agentName: agent.name,
              status: 'paying',
              txHash,
              isRealTx,
              error: walletError,
              message: isRealTx
                ? `Transaction verified on Morph L2! Hash: ${txHash}`
                : activeKey
                  ? `On-chain transaction failed: ${walletError}. Falling back to simulated transaction proof: ${txHash}`
                  : `No active private key. Authorizing payment with conceptual mock signature: ${txHash}`
            });

            await new Promise(r => setTimeout(r, d3));

            // 4. Submit Payment Proof to Vendor for verification
            const secondResponse = await fetch(vendorUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Payment-Signature': txHash,
                'Challenge-Id': challengeBody.details.challengeId
              },
              body: JSON.stringify({
                goal,
                agentName: agent.name,
                agentRole: agent.role,
                agentPrompt: agent.prompt
              })
            });

            if (secondResponse.status !== 200) {
              const errBody = await secondResponse.json();
              throw new Error(`Vendor signature check failed: ${errBody.message}`);
            }

            const successBody = await secondResponse.json();

            // Settle context
            previousOutput += `\n[${agent.name} Output]:\n${successBody.result}\n`;

            sendEvent('agent-complete', {
              agentId: agent.id,
              agentName: agent.name,
              status: 'completed',
              result: successBody.result,
              verification: successBody.verification,
              realOnChain: successBody.realOnChain,
              message: `${agent.name} successfully resolved payment and unlocked vendor assets.`,
              gasFee: successBody.gasFee
            });

            await new Promise(r => setTimeout(r, d4));
          }

          // Complete multi-agent pipeline
          sendEvent('status', { message: 'All custom agents successfully executed their tasks!', step: agentsToRun.length });
          sendEvent('all-complete', { finalSummary: previousOutput });

        } catch (err: unknown) {
          console.error("Agent flow execution error:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          sendEvent('error', { message: errorMessage });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: unknown) {
    console.error('Agent route error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}

function privateKeyToUse(reqKey: string | undefined): string | null {
  if (reqKey && reqKey.trim() !== '') return reqKey.trim();
  if (process.env.HARDCODED_WALLET_KEY && process.env.HARDCODED_WALLET_KEY.trim() !== '') {
    return process.env.HARDCODED_WALLET_KEY.trim();
  }
  return null;
}

function splitThoughts(text: string): string[] {
  let cleaned = text.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const paragraphs = cleaned.split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    return paragraphs;
  }

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) {
    return [cleaned];
  }
  if (sentences.length === 2) {
    return [sentences[0], sentences[1]];
  }
  if (sentences.length === 3) {
    return [sentences[0], sentences[1], sentences[2]];
  }

  const chunkCount = 3;
  const chunks: string[][] = Array.from({ length: chunkCount }, () => []);
  sentences.forEach((sentence, idx) => {
    const chunkIdx = Math.min(Math.floor((idx / sentences.length) * chunkCount), chunkCount - 1);
    chunks[chunkIdx].push(sentence);
  });

  return chunks.map(c => c.join(' ')).filter(Boolean);
}

function generateDynamicThoughts(
  agentName: string,
  vendorName: string,
  vendorCost: string,
  vendorRecipient: string,
  goal: string,
  vendorSlug: string
): string[] {
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
  const randMs = () => randInt(45, 320);

  const chalId = `chal_${vendorSlug}_${randInt(10000, 99999)}`;
  const reqId = `req_${randInt(100000, 999999)}`;

  return [
    `Constructing HTTP POST to /api/vendors/${vendorSlug} with request ID ${reqId}. Querying ${vendorName} API for resource access required by the pipeline goal to ${goal.replace(/"/g, '')}.`,
    `Response received: HTTP 402 Payment Required. challengeId is ${chalId}, amount is ${vendorCost} ETH, and recipient address is ${vendorRecipient} on Morph Hoodi Testnet. Preparing EIP-712 payment proof with gas estimate of ${randInt(21000, 45000)} units. Signature construction latency: ${randMs()}ms.`,
    `Re-submitting POST to /api/vendors/${vendorSlug} with headers Payment-Signature and Challenge-Id ${chalId}. Awaiting 200 OK with unlocked vendor resource payload from ${vendorName}.`
  ];
}



