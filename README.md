# 🌌 x402stream

> **Autonomous Machine-to-Machine Payment Pipelines** powered by the **HTTP 402 Payment Required** protocol and settled on the **Morph L2** blockchain network.

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Viem](https://img.shields.io/badge/Viem-2.50.4-black?style=flat-square&logo=ethereum&logoColor=white)](https://viem.sh)
[![Morph L2](https://img.shields.io/badge/Morph_L2-Hoodi_Testnet-yellow?style=flat-square)](https://morphl2.io)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange?style=flat-square)](https://groq.com)

**x402stream** is a state-of-the-art multi-agent autonomous payment orchestration platform. It enables AI agents to coordinate, reason, and autonomously settle payments with third-party service vendors using standard web protocols. By leveraging **HTTP 402 (Payment Required)** challenges and **Morph L2 (Hoodi Testnet)** smart execution, x402stream demonstrates the future of agentic web economy where AI agents pay for the APIs and services they consume to achieve a complex user-defined goal.

---

## 🌟 Key Features

- **🤖 Multi-Agent Orchestration**: Spin up pipelines of up to 10 autonomous agents working in sequence to achieve complex, composite goals (e.g., market analysis, risk modeling, data ingestion).
- **💳 HTTP 402 Challenge Protocol**: Implements a complete HTTP 402 challenge-response gateway. Vendors issue cryptographic challenges containing price, recipient, and challenge IDs, which agents solve on-the-fly.
- **⚡ Morph L2 Blockchain Settlement**: Settles transaction proofs directly on the high-performance **Morph Hoodi Testnet** using native ETH. Supports both real wallet private keys (using Viem) and seamless mock transaction fallbacks.
- **📡 Real-Time SSE Streams**: Experience live AI execution thoughts, state transitions, ledger ledger bookings, and wallet signatures streamed via a highly responsive Server-Sent Events (SSE) connection.
- **💼 Interactive Operator Dashboard**: A beautiful, premium interface featuring:
  - **Agent Workspace**: Manage custom agent configurations and build execution pipelines.
  - **Sleek Chat Console**: Talk to the orchestrator, submit complex goals, and watch agents execute.
  - **Master Ledger**: A detailed transaction auditor featuring resizable panels and paginated settlement history.
  - **Dynamic Vendor Directory**: Explore 24 mock enterprise APIs across 5 distinct service categories (Finance, AI & Data, Storage, Messaging, and Risk Analysis).
  - **Embedded Wallet Widget**: Manage derived EVM keys, scan QR codes, and monitor real-time balances.

---

## 🔄 The x402 Protocol Flow

The core of the platform is the machine-to-machine HTTP 402 Payment Challenge loop. It follows three distinct phases:

```
                                  ┌────────────────────────┐
                                  │   Operator (Browser)   │
                                  └──────────┬─────────────┘
                                             │  POST /api/agents/run
                                             ▼
  ┌───────────────────────────────────────────────────────────────────────────────────────┐
  │                           x402stream Agent Pipeline (Server)                          │
  └──────┬───────────────────────────────┬───────────────────────────────▲────────────────┘
         │                               │                               │
         │ 1. Initial Request            │ 3. Sign & Broadcast Tx        │ 4. Retry with Proof
         │    (No signature)             │    (Viem client)              │    (Payment-Signature)
         ▼                               ▼                               │
┌────────────────┐               ┌────────────────┐              ┌───────┴────────┐
│ Vendor Gateway │               │    Morph L2    │              │ Vendor Gateway │
│ /api/vendors/  │               │ Hoodi Testnet  │              │ /api/vendors/  │
└────────┬───────┘               └────────────────┘              └───────┬────────┘
         │                                                               │
         │ 2. HTTP 402 Challenge                                         │ 5. HTTP 200 Success
         │    (Payment-Required Headers)                                 │    (Dynamic LLM Result)
         ▼                                                               ▼
  [Challenge Issued]                                              [Resource Unlocked]
```

1. **Challenge Issuance**: The agent initiates an API request. The Vendor Simulator detects no valid payment signature and responds with a standard `HTTP 402 Payment Required` payload containing:
   - `amount`: Cost of the API call in native ETH (e.g., `0.00007 ETH`).
   - `recipient`: The vendor's designated EVM receive address.
   - `challengeId`: A unique session-bound challenge hash.
2. **Payment Settlement**: The agent parses the headers, derives/signs an EVM transfer to the recipient address, and broadcasts it to the **Morph L2** network.
3. **Proof Verification**: The agent retries the vendor request, attaching the `Payment-Signature` (transaction hash) and `Challenge-Id` in the headers. The vendor verifies the transaction's validity on-chain and unlocks the LLM-powered resource response!

---

## 🛠️ Project Structure & Architecture

For a deep-dive breakdown of the project directories, component hierarchy, sequence diagrams, and state machines, please refer to the comprehensive [ARCHITECTURE.md](ARCHITECTURE.md) document.

---

## ⚙️ Installation & Setup

Ensure you have **Node.js (v18+)** and **pnpm** installed.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/royceallenrespicio/x402stream.git
cd x402stream
pnpm install
```

### 2. Configure Environment Variables
Copy the `.env.example` to `.env.local` (or `.env`):
```bash
cp .env.example .env.local
```

Open `.env.local` and define your variables:
```env
# Required for agent thinking and vendor response generation
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: Hardcode an EVM Private Key for on-chain Morph L2 Testnet transactions
# If left blank, you can input a private key directly in the UI dashboard settings,
# or run the application in "Demo Mode" with safe simulated transactions!
HARDCODED_WALLET_KEY=0x...
```

---

## 🚀 Running the Platform

To launch the Next.js development server:

```bash
pnpm dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to experience the platform.

### Standard Scripts

- `pnpm dev`: Starts the application in local development mode.
- `pnpm build`: Performs a production bundle optimization build.
- `pnpm start`: Serves the production-built bundle locally.
- `pnpm lint`: Triggers the ESLint utility to check code standard conformity.

---

## ⛓️ Blockchain Network Details

x402stream interacts natively with the **Morph Hoodi Testnet**:

- **Chain Name**: Morph Hoodi Testnet
- **Chain ID**: `2910`
- **RPC URL**: `https://rpc-hoodi.morph.network`
- **Currency**: `ETH`
- **Block Explorer**: `https://explorer-hoodi.morph.network`

*Need testnet funds?* Grab some native ETH from the [Morph Faucet](https://faucet-hoodi.morph.network/) to perform real, end-to-end on-chain agent payment settlements!

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
