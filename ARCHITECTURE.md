# x402stream — C4 Model Architecture

> **Machine-to-machine autonomous payment pipelines** powered by HTTP 402 challenges, settling transactions on the **Morph L2** blockchain network.

This document describes the architecture of **x402stream** using the [C4 Model](https://c4model.com) — a hierarchical set of diagrams that zoom in from a high-level system overview down to code-level structures.

---

## Table of Contents

- [Level 1 — System Context](#level-1--system-context)
- [Level 2 — Container](#level-2--container)
- [Level 3 — Component](#level-3--component)
  - [Frontend Components](#level-3a--frontend-components)
  - [Backend API Components](#level-3b--backend-api-components)
- [Level 4 — Code](#level-4--code)
  - [Orchestrator Provider State Machine](#level-4a--orchestrator-provider-state-machine)
  - [Agent Pipeline Execution Flow](#level-4b--agent-pipeline-execution-flow)
  - [x402 Payment Challenge Protocol](#level-4c--x402-payment-challenge-protocol)
  - [Type Definitions](#level-4d--type-definitions)
- [Data Flow — End-to-End Pipeline](#data-flow--end-to-end-pipeline)
- [Technology Stack](#technology-stack)

---

## Level 1 — System Context

The highest-level view showing **x402stream** and its relationships with external actors and systems.

```mermaid
C4Context
    title System Context Diagram — x402stream

    Person(user, "Operator", "Configures AI agents, defines pipeline goals, and monitors autonomous payment settlements")

    System(x402stream, "x402stream", "Multi-agent autonomous payment orchestration platform using HTTP 402 challenges on Morph L2")

    System_Ext(groqCloud, "Groq Cloud API", "Provides Llama 3.3 70B LLM inference for agent reasoning and vendor response generation")
    System_Ext(morphL2, "Morph Hoodi Testnet", "Layer 2 EVM blockchain for on-chain settlement, balance lookups, and transaction receipts")
    System_Ext(browser, "Web Browser", "Client-side application runtime, localStorage persistence, and SSE stream consumption")

    Rel(user, x402stream, "Defines goals, configures agents, monitors pipelines", "HTTPS")
    Rel(x402stream, groqCloud, "Sends prompts, receives LLM completions", "HTTPS / REST")
    Rel(x402stream, morphL2, "Broadcasts transactions, reads balances, verifies receipts", "JSON-RPC over HTTPS")
    Rel(x402stream, browser, "Serves SPA, streams SSE events, persists state", "HTTPS / SSE")
```

**Key Relationships:**

| Relationship | Protocol | Purpose |
|---|---|---|
| Operator → x402stream | HTTPS | Configure agents, set goals, trigger pipelines |
| x402stream → Groq Cloud | HTTPS REST | LLM reasoning (agent thoughts & vendor results) |
| x402stream → Morph L2 | JSON-RPC | Broadcast txns, read balances, verify receipts |
| x402stream → Browser | HTTPS + SSE | Serve UI, real-time event streaming |

---

## Level 2 — Container

Zooms into x402stream to reveal the major containers (deployable units / runtime processes).

```mermaid
C4Container
    title Container Diagram — x402stream

    Person(user, "Operator")

    System_Boundary(x402, "x402stream Platform") {
        Container(spa, "Single-Page Application", "React 19, Next.js 16, Motion", "Client-side dashboard with real-time SSE streaming, agent workspace, chat console, and wallet management")
        Container(nextApi, "Next.js API Routes", "Node.js, Vercel AI SDK", "Server-side endpoints handling agent orchestration pipeline and vendor x402 challenges")
        Container(vendorSim, "Vendor Simulator", "Next.js API Route", "Mock enterprise APIs that issue HTTP 402 Payment Required challenges and verify payment proofs")
        ContainerDb(localStorage, "Browser localStorage", "Key-Value Store", "Persists private keys, mock balance, settlement history, and theme preferences")
        ContainerDb(vendorDb, "Vendor Database", "Static JSON", "24 mock enterprise vendors across 5 categories with cost, recipient, and metadata")
    }

    System_Ext(groqCloud, "Groq Cloud API", "Llama 3.3 70B LLM")
    System_Ext(morphL2, "Morph Hoodi Testnet", "L2 EVM Chain")

    Rel(user, spa, "Interacts via browser", "HTTPS")
    Rel(spa, nextApi, "POST /api/agents/run", "HTTPS + SSE")
    Rel(nextApi, vendorSim, "POST /api/vendors/[slug]", "Internal HTTP")
    Rel(nextApi, groqCloud, "generateText()", "HTTPS")
    Rel(nextApi, morphL2, "sendTransaction(), getBalance()", "JSON-RPC")
    Rel(vendorSim, groqCloud, "generateText()", "HTTPS")
    Rel(vendorSim, morphL2, "getTransactionReceipt()", "JSON-RPC")
    Rel(spa, localStorage, "Read/Write state", "Web API")
    Rel(nextApi, vendorDb, "Loads vendor config", "File I/O")
    Rel(vendorSim, vendorDb, "Loads vendor config", "File I/O")
```

### Container Descriptions

| Container | Technology | Responsibility |
|---|---|---|
| **SPA** | React 19 + Next.js 16 + Motion | Interactive dashboard, agent workspace, SSE chat console, wallet widget, vendor browser |
| **API Routes** | Node.js + Vercel AI SDK | Agent pipeline orchestration, LLM reasoning, SSE event streaming, transaction broadcasting |
| **Vendor Simulator** | Next.js Dynamic Route | Issues HTTP 402 challenges, verifies payment signatures, generates LLM-powered vendor responses |
| **localStorage** | Browser Web API | Client-side persistence for wallet keys, mock balance, settlement history, theme |
| **Vendor Database** | Static JSON file | 24 preconfigured mock vendors with pricing, categories, and recipient addresses |

---

## Level 3 — Component

### Level 3a — Frontend Components

Zooms into the SPA container to show the React component architecture.

```mermaid
C4Component
    title Component Diagram — Frontend (SPA)

    Container_Boundary(spa, "Single-Page Application") {

        Component(rootLayout, "RootLayout", "Server Component", "HTML shell, font loading, wraps app in OrchestratorProvider + AppLayout")
        Component(appLayout, "AppLayout", "Client Component", "Sidebar navigation, top header bar, mobile bottom nav, wallet display, theme toggle, floating alert queue")

        Component(homePage, "HomePage", "Client Component", "Landing page with hero branding, feature pills, and demo mode entry card")
        Component(demoPage, "DemoPage", "Client Component", "Main dashboard page orchestrating AgentWorkspace, ChatOrchestrator, and AgentFormModal")

        Component(agentWorkspace, "AgentWorkspace", "Client Component", "Displays agent cards grid, add/edit/delete agents, load presets, trigger single-agent runs")
        Component(chatOrchestrator, "ChatOrchestrator", "Client Component", "SSE chat console with session tabs, progress bar, parsed message bubbles, and goal input form")
        Component(agentFormModal, "AgentFormModal", "Client Component", "Dialog for creating/editing custom agents with vendor selection combobox")

        Component(vendorsPage, "VendorsPage", "Client Component", "Vendor catalog grid showing all 24 mock enterprise APIs with live status indicators")
        Component(ledgersPage, "LedgersPage", "Client Component", "Master-detail settlement history with resizable panels, pagination, and transaction details")
        Component(settingsPage, "SettingsPage", "Client Component", "Private key configuration, wallet address derivation, and balance management")

        Component(orchestratorProvider, "OrchestratorProvider", "React Context", "Central state management: goals, sessions, agents, ledger, wallet, history, and SSE event handling")
        Component(walletHook, "useWalletState", "Custom Hook", "Manages private key, derives EVM address, tracks mock/real balances, auto-refreshes from Morph RPC")
        Component(agentsHook, "useCustomAgentsState", "Custom Hook", "CRUD operations for custom agents with preset loading and 10-agent limit")
    }

    Rel(rootLayout, orchestratorProvider, "Wraps children")
    Rel(rootLayout, appLayout, "Wraps children")
    Rel(appLayout, homePage, "Renders on /")
    Rel(appLayout, demoPage, "Renders on /demo")
    Rel(appLayout, vendorsPage, "Renders on /demo/vendors")
    Rel(appLayout, ledgersPage, "Renders on /demo/ledgers")
    Rel(appLayout, settingsPage, "Renders on /demo/settings")

    Rel(demoPage, agentWorkspace, "Renders")
    Rel(demoPage, chatOrchestrator, "Renders")
    Rel(demoPage, agentFormModal, "Renders")

    Rel(orchestratorProvider, walletHook, "Composes")
    Rel(orchestratorProvider, agentsHook, "Composes")
```

#### Frontend Component Inventory

| Component | File | Purpose |
|---|---|---|
| `RootLayout` | `app/layout.tsx` | Server component shell, font setup, global providers |
| `AppLayout` | `app/demo/_components/AppLayout.tsx` | Sidebar + header + mobile nav + alert stack |
| `HomePage` | `app/page.tsx` | Landing page with animated hero |
| `DemoPage` | `app/demo/page.tsx` | Main dashboard orchestration |
| `AgentWorkspace` | `app/demo/_components/AgentWorkspace.tsx` | Agent cards grid with CRUD |
| `ChatOrchestrator` | `app/demo/_components/ChatOrchestrator.tsx` | SSE chat console + session tabs |
| `AgentFormModal` | `app/demo/_components/AgentFormModal.tsx` | Create/edit agent dialog |
| `ChatMessageBubble` | `app/demo/_components/chat/ChatMessageBubble.tsx` | Individual chat message renderer |
| `AgentCard` | `app/demo/_components/AgentCard.tsx` | Single agent status card |
| `VendorStatus` | `app/demo/_components/VendorStatus.tsx` | Vendor grid with live status |
| `WalletWidget` | `app/demo/_components/WalletWidget.tsx` | Wallet balance + QR code |
| `TerminalLogs` | `app/demo/_components/TerminalLogs.tsx` | Raw terminal log viewer |
| `DashboardHeader` | `app/demo/_components/DashboardHeader.tsx` | Dashboard page header |
| `ActiveExecutionMonitor` | `app/demo/_components/ActiveExecutionMonitor.tsx` | Execution status indicator |
| `QRCodeContainer` | `app/demo/_components/QRCodeContainer.tsx` | QR code for wallet address |
| `OrchestratorProvider` | `app/demo/_providers/OrchestratorProvider.tsx` | Central React Context provider |
| `useWalletState` | `app/demo/_providers/_hooks/useWalletState.ts` | Wallet state management hook |
| `useCustomAgentsState` | `app/demo/_providers/_hooks/useCustomAgentsState.ts` | Agent CRUD hook |
| `useIsMobile` | `hooks/use-mobile.ts` | Responsive breakpoint detection |

---

### Level 3b — Backend API Components

Zooms into the Next.js API Routes and Vendor Simulator containers.

```mermaid
C4Component
    title Component Diagram — Backend (API Routes)

    Container_Boundary(api, "Next.js API Layer") {

        Component(agentRunRoute, "POST /api/agents/run", "Route Handler", "Orchestrates multi-agent pipeline: LLM reasoning → vendor challenge → payment → verification, streamed via SSE")
        Component(vendorRoute, "POST /api/vendors/[slug]", "Dynamic Route", "Implements x402 protocol: issues HTTP 402 challenges on first call, verifies payment signatures on retry")

        Component(groqProvider, "Groq LLM Provider", "AI SDK", "Initializes Groq client with Llama 3.3 70B model for text generation")
        Component(morphLib, "Morph L2 Library", "Viem", "Chain config, wallet/public clients, balance queries, transaction broadcasting, mock hash generation")
        Component(vendorDb, "Vendor Database", "JSON Import", "Static vendor registry with 24 entries across 5 industry categories")

        Component(sseEncoder, "SSE Stream Encoder", "ReadableStream", "Encodes pipeline events into Server-Sent Events format for real-time client consumption")
        Component(thoughtGen, "Thought Generator", "Function", "Generates fallback agent reasoning when Groq API is unavailable, with agent-specific templates")
        Component(txVerifier, "Transaction Verifier", "Viem", "Looks up transaction receipts on Morph Hoodi to verify real on-chain payments")
    }

    System_Ext(groqApi, "Groq Cloud")
    System_Ext(morphChain, "Morph Hoodi RPC")

    Rel(agentRunRoute, groqProvider, "Agent reasoning")
    Rel(agentRunRoute, vendorRoute, "HTTP 402 challenge flow")
    Rel(agentRunRoute, morphLib, "sendMorphTransaction()")
    Rel(agentRunRoute, sseEncoder, "Emits SSE events")
    Rel(agentRunRoute, thoughtGen, "Fallback reasoning")

    Rel(vendorRoute, vendorDb, "Loads vendor config")
    Rel(vendorRoute, groqProvider, "Dynamic vendor response")
    Rel(vendorRoute, txVerifier, "On-chain receipt lookup")

    Rel(groqProvider, groqApi, "HTTPS")
    Rel(morphLib, morphChain, "JSON-RPC")
    Rel(txVerifier, morphChain, "JSON-RPC")
```

#### Backend Component Inventory

| Component | File | Purpose |
|---|---|---|
| Agent Run Route | `app/api/agents/run/route.ts` | Multi-agent pipeline orchestrator with SSE streaming |
| Vendor Route | `app/api/vendors/[slug]/route.ts` | x402 challenge issuer and payment verifier |
| Morph Library | `lib/morph.ts` | Viem-based blockchain integration layer |
| Vendor Database | `app/_data/vendors.json` | Static vendor configuration (24 entries) |
| Utilities | `lib/utils.ts` | `cn()` classname merging utility |

---

## Level 4 — Code

### Level 4a — Orchestrator Provider State Machine

The `OrchestratorProvider` is the central nervous system of the frontend. It manages all application state and processes SSE events from the backend.

```mermaid
stateDiagram-v2
    title Agent Lifecycle State Machine

    [*] --> idle: Session Created

    idle --> thinking: agent-start event
    thinking --> calling_vendor: agent-reasoning event
    calling_vendor --> payment_challenged: x402-challenge event
    payment_challenged --> paying: wallet-signing / payment-sent event
    paying --> completed: agent-complete event

    completed --> [*]: All agents done

    state "Error Recovery" as error {
        thinking --> [*]: pipeline error
        calling_vendor --> [*]: vendor error
        paying --> [*]: transaction failure
    }

    note right of idle
        Initial state when
        session is created
    end note

    note right of payment_challenged
        HTTP 402 received
        Ledger entry created
    end note

    note right of completed
        Vendor resource unlocked
        Ledger marked fulfilled
    end note
```

#### SSE Event → State Transition Map

| SSE Event | Agent Status | Ledger Action | Side Effects |
|---|---|---|---|
| `agent-start` | `idle` → `thinking` | — | Log entry added |
| `agent-reasoning` | `thinking` → `calling_vendor` | — | Reasoning bubble displayed |
| `x402-challenge` | → `payment_challenged` | New entry: `challenged` | Challenge details logged |
| `wallet-signing` | → `paying` | — | Signing notification |
| `payment-sent` | → `paying` | Update: `paying` + txHash | Balance refresh (if real tx) |
| `agent-complete` | → `completed` | Update: `fulfilled` | Mock balance deducted |
| `all-complete` | — (session ends) | — | History saved, alert shown |
| `error` | — (session ends) | — | Error logged, pipeline stopped |

---

### Level 4b — Agent Pipeline Execution Flow

The core runtime sequence when a multi-agent pipeline is triggered.

```mermaid
sequenceDiagram
    autonumber
    participant U as Operator (Browser)
    participant O as OrchestratorProvider
    participant A as POST /api/agents/run
    participant G as Groq Cloud (Llama 3.3)
    participant V as POST /api/vendors/[slug]
    participant M as Morph L2 (Hoodi)

    U->>O: startPipeline(goal, agents)
    O->>O: Create ExecutionSession
    O->>A: POST {goal, privateKey, agents[]}

    loop For each Agent in pipeline
        A->>A: SSE → agent-start
        A->>G: generateText(agent reasoning prompt)
        G-->>A: 3 reasoning thought entries
        A->>A: SSE → agent-reasoning (×3)

        A->>V: POST /api/vendors/[slug] (no Payment-Signature)
        V-->>A: HTTP 402 + Payment-Required header
        A->>A: SSE → x402-challenge

        alt Real Private Key Available
            A->>M: sendTransaction(to, amount)
            M-->>A: Transaction hash + receipt
            A->>A: SSE → payment-sent (isRealTx: true)
        else No Key / Tx Failed
            A->>A: generateMockTxHash()
            A->>A: SSE → payment-sent (isRealTx: false)
        end

        A->>V: POST /api/vendors/[slug] (with Payment-Signature + Challenge-Id)
        V->>M: getTransactionReceipt(hash)
        V->>G: generateText(vendor result prompt)
        G-->>V: Vendor system log response
        V-->>A: HTTP 200 + result payload
        A->>A: SSE → agent-complete
    end

    A->>A: SSE → all-complete
    A-->>O: Stream closes
    O->>O: Save to settlementHistory
    O->>U: Display alert + update ledger
```

---

### Level 4c — x402 Payment Challenge Protocol

The HTTP 402 challenge-response protocol implemented by the vendor simulator.

```mermaid
sequenceDiagram
    autonumber
    participant Agent as AI Agent (Server)
    participant Vendor as Vendor API /api/vendors/[slug]
    participant Chain as Morph Hoodi L2

    Note over Agent,Vendor: Phase 1 — Challenge Issuance
    Agent->>Vendor: POST {goal, agentName, agentRole}
    Note over Vendor: No Payment-Signature header detected
    Vendor->>Vendor: Generate challengeId
    Vendor-->>Agent: HTTP 402 Payment Required
    Note over Vendor: Response Headers:<br/>Payment-Required: {<br/>  amount: "0.00007",<br/>  currency: "ETH",<br/>  recipient: "0xE95a...",<br/>  chainId: 2910,<br/>  challengeId: "chal_..."<br/>}

    Note over Agent,Vendor: Phase 2 — Payment Settlement
    Agent->>Chain: sendTransaction(recipient, amount)
    Chain-->>Agent: txHash: 0x...

    Note over Agent,Vendor: Phase 3 — Proof Verification
    Agent->>Vendor: POST {goal, agentName, ...}
    Note over Agent: Headers:<br/>Payment-Signature: 0x...(txHash)<br/>Challenge-Id: chal_...
    Vendor->>Chain: getTransactionReceipt(txHash)
    Chain-->>Vendor: Receipt {status: success, to: 0xE95a...}
    Vendor->>Vendor: Verify recipient match
    Vendor-->>Agent: HTTP 200 {result, verification, realOnChain}
```

#### x402 Challenge Payload Schema

```
Payment-Required Header (JSON):
┌──────────────────────────────────────────┐
│ {                                        │
│   "amount":      "0.00007",    // ETH    │
│   "currency":    "ETH",                  │
│   "recipient":   "0xE95a...c065",        │
│   "chainId":     2910,         // Morph  │
│   "challengeId": "chal_bdo-unibank_..." │
│ }                                        │
└──────────────────────────────────────────┘
```

---

### Level 4d — Type Definitions

Core TypeScript interfaces that define the data model (`types/orchestrator.ts`).

```mermaid
classDiagram
    direction LR

    class CustomAgent {
        +string id
        +string name
        +string role
        +string vendorSlug
        +string prompt
    }

    class AgentState {
        +string id
        +string name
        +string role
        +string vendorSlug
        +Status status
        +string message
        +string reasoning
        +string result
        +string txHash
        +boolean isRealTx
    }

    class ExecutionSession {
        +string id
        +string title
        +string timestamp
        +string goal
        +boolean running
        +string[] pipelineLogs
        +string finalSummary
        +string errorText
        +string currentStepInfo
        +AgentState[] agents
        +LedgerEntry[] ledger
        +number progressValue
    }

    class LedgerEntry {
        +string id
        +string timestamp
        +string agent
        +string vendor
        +string cost
        +string recipient
        +LedgerStatus status
        +string txHash
        +boolean realOnChain
        +string message
    }

    class SettlementHistoryItem {
        +string id
        +string sessionId
        +string timestamp
        +string goal
        +string summary
        +number agentsCount
        +string totalCost
        +boolean realOnChain
        +LedgerEntry[] ledger
    }

    class VendorInfo {
        +string slug
        +string name
        +string category
        +string role
        +string cost
        +string recipient
        +string description
    }

    ExecutionSession "1" *-- "0..*" AgentState : contains
    ExecutionSession "1" *-- "0..*" LedgerEntry : contains
    SettlementHistoryItem "1" *-- "0..*" LedgerEntry : archives
    CustomAgent "1" ..> "1" VendorInfo : references via vendorSlug
    AgentState --|> CustomAgent : extends fields
```

#### Status Enumerations

```
AgentState.status:
  idle → thinking → calling_vendor → payment_challenged → paying → completed

LedgerEntry.status:
  challenged → paying → fulfilled
                      → failed
```

---

## Data Flow — End-to-End Pipeline

A comprehensive view of data flowing through the entire system during a single pipeline execution.

```mermaid
flowchart TB
    subgraph CLIENT["Browser (Client)"]
        direction TB
        UI["Dashboard UI"]
        CTX["OrchestratorProvider<br/>(React Context)"]
        LS["localStorage<br/>• Private Key<br/>• Mock Balance<br/>• Settlement History<br/>• Theme"]
    end

    subgraph SERVER["Next.js Server (Node.js)"]
        direction TB
        API["/api/agents/run<br/>(SSE Stream)"]
        VND["/api/vendors/[slug]<br/>(x402 Gateway)"]
        MRP["lib/morph.ts<br/>(Viem Client)"]
        VDB["vendors.json<br/>(24 Vendors)"]
    end

    subgraph EXTERNAL["External Services"]
        direction TB
        GROQ["Groq Cloud<br/>Llama 3.3 70B"]
        MORPH["Morph Hoodi Testnet<br/>Chain ID: 2910<br/>RPC: rpc-hoodi.morph.network"]
    end

    UI -->|"1. User configures agents & goal"| CTX
    CTX -->|"2. POST /api/agents/run"| API
    CTX <-->|"Persist/Restore"| LS

    API -->|"3. LLM reasoning"| GROQ
    GROQ -->|"Agent thoughts"| API

    API -->|"4. First call (no signature)"| VND
    VND -->|"HTTP 402 + challenge"| API
    VND -->|"Load vendor config"| VDB

    API -->|"5. Broadcast tx"| MRP
    MRP -->|"sendTransaction()"| MORPH
    MORPH -->|"txHash + receipt"| MRP
    MRP -->|"hash"| API

    API -->|"6. Retry with proof"| VND
    VND -->|"Verify on-chain"| MORPH
    VND -->|"Generate result"| GROQ
    VND -->|"HTTP 200 + result"| API

    API -.->|"7. SSE Events Stream"| CTX
    CTX -->|"8. Update UI state"| UI

    style CLIENT fill:#1a1a2e,stroke:#16213e,color:#e2e2e2
    style SERVER fill:#0f3460,stroke:#16213e,color:#e2e2e2
    style EXTERNAL fill:#533483,stroke:#16213e,color:#e2e2e2
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js | 16.2.6 | Full-stack React framework with App Router |
| **Runtime** | React | 19.2.4 | UI component library |
| **Language** | TypeScript | ^5 | Type-safe development |
| **Styling** | Tailwind CSS | ^4 | Utility-first CSS |
| **UI Components** | Shadcn/UI (Radix) | Latest | Accessible component primitives |
| **Animations** | Motion (Framer) | ^12.39 | Declarative animations |
| **AI/LLM** | Vercel AI SDK + Groq | ^6 / ^3 | LLM integration with Llama 3.3 70B |
| **Blockchain** | Viem | ^2.50 | EVM wallet, transactions, chain interaction |
| **Chain** | Morph Hoodi Testnet | Chain 2910 | L2 settlement layer |
| **Icons** | Lucide React | ^1.16 | Icon library |
| **Package Manager** | pnpm | — | Fast, disk-efficient package manager |

---

## File Structure Overview

```
x402stream/
├── app/
│   ├── _data/
│   │   └── vendors.json              # 24 mock vendor definitions
│   ├── api/
│   │   ├── agents/
│   │   │   └── run/
│   │   │       └── route.ts          # Multi-agent pipeline (SSE)
│   │   └── vendors/
│   │       └── [slug]/
│   │           └── route.ts          # x402 vendor simulator
│   ├── demo/
│   │   ├── _components/              # Dashboard UI components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentFormModal.tsx
│   │   │   ├── AgentWorkspace.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── ChatOrchestrator.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── QRCodeContainer.tsx
│   │   │   ├── TerminalLogs.tsx
│   │   │   ├── VendorStatus.tsx
│   │   │   ├── WalletWidget.tsx
│   │   │   ├── ActiveExecutionMonitor.tsx
│   │   │   └── chat/
│   │   │       └── ChatMessageBubble.tsx
│   │   ├── _providers/
│   │   │   ├── OrchestratorProvider.tsx  # Central state context
│   │   │   └── _hooks/
│   │   │       ├── useCustomAgentsState.ts
│   │   │       └── useWalletState.ts
│   │   ├── ledgers/                   # Settlement history page
│   │   ├── settings/                  # Wallet configuration page
│   │   ├── vendors/                   # Vendor catalog page
│   │   └── page.tsx                   # Main dashboard page
│   ├── globals.css
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Landing page
├── components/
│   └── ui/                            # Shadcn/UI primitives (23 components)
├── hooks/
│   └── use-mobile.ts                  # Responsive breakpoint hook
├── lib/
│   ├── morph.ts                       # Morph L2 blockchain library
│   └── utils.ts                       # Classname utility
├── types/
│   └── orchestrator.ts                # Core TypeScript interfaces
├── public/                            # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
└── ARCHITECTURE.md                    # This document
```

---

*Architecture documented using the [C4 Model](https://c4model.com) by Simon Brown.*
*Last updated: May 2026*
