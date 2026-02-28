# ScamShield Pro

> An interactive AI-powered scam awareness training game — chat with a live scammer bot and learn to recognize manipulation tactics in real time.

### [▶ Live Demo → scam-agent.kclynguyenkhanh.workers.dev](https://scam-agent.kclynguyenkhanh.workers.dev/)

---

## Overview

ScamShield Pro simulates a real-world phishing attack — you receive messages from an AI scammer that adapts its tactics based on your responses, just like a real social engineering attempt. Your goal is to identify and flag the manipulation tactics before the scammer convinces you.

Built during a hackathon using **Cloudflare Agents SDK** and **Workers AI** (Llama 3.1 8B), the entire app runs on Cloudflare's edge infrastructure with no traditional backend server.

---

## Features

- **Live AI Scammer** — Powered by Llama 3.1 8B via Cloudflare Workers AI. The scammer adapts dynamically to your replies, escalating or backing off based on your responses.
- **Real-time WebSocket Chat** — Persistent connection via Cloudflare Durable Objects. Each game session gets its own isolated stateful agent.
- **Tactic Flagging System** — Identify scam tactics (Authority, False Urgency, Fear, Suspicious Links, etc.) and earn points for correct identifications.
- **Risk Meter** — Tracks your exposure based on unflagged tactics. Drops only on correct flags — wrong guesses don't reward you.
- **3 Difficulty Levels** — Easy (1 tactic/message), Medium (2–3 tactics), Hard (3–4 tactics, aggressive escalation).
- **Session Summary** — Post-game breakdown of caught vs. missed tactics, accuracy, score, and educational tips.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI | Shadcn/UI, Tailwind CSS |
| AI Model | Llama 3.1 8B Instruct via Cloudflare Workers AI |
| Real-time | Cloudflare Agents SDK (`useAgent`, `useAgentChat`) |
| State Persistence | Cloudflare Durable Objects (SQLite-backed) |
| Deployment | Cloudflare Workers with static asset serving |

---

## Architecture

```
Browser
  └── React 19 (Vite)
        └── useAgent() ──WebSocket──▶ Cloudflare Worker (ScamAgent)
                                            ├── AIChatAgent (Durable Object)
                                            │     └── Conversation history (SQLite)
                                            └── Workers AI
                                                  └── Llama 3.1 8B Instruct
```

The frontend connects to a **Cloudflare Durable Object** via WebSocket. Each game session creates a unique Durable Object instance that holds the full conversation history. The AI model streams responses inline with an embedded tactic annotation format (`TACTICS: Authority, False Urgency\n---\nMessage`) that the client parses to power the flagging system — no extra API calls needed.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Cloudflare account](https://cloudflare.com) (free tier)

### Local Development

```bash
# Install dependencies
npm install
cd worker && npm install && cd ..

# Run frontend + worker simultaneously
npm run dev:all
```

The frontend runs at `http://localhost:8080`, the Cloudflare Worker at `http://localhost:8787`.

### Deploy to Cloudflare

```bash
# Build the frontend
npm run build

# Deploy worker + static assets in one command
cd worker && npx wrangler deploy
```

Your app will be live at `https://scam-agent.YOUR-NAME.workers.dev`.

---

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── GameScreen.tsx     # Main game — chat UI, scoring, risk meter
│   │   └── Summary.tsx        # Post-game results and difficulty selector
│   └── components/
│       ├── ChatMessage.tsx    # Message bubble with Flag Tactic button
│       ├── GameSidebar.tsx    # Score, accuracy, streak, risk meter
│       └── FlagTacticModal.tsx # Tactic selection modal
└── worker/
    └── src/
        └── index.ts           # Cloudflare Worker — ScamAgent, system prompt, difficulty logic
```

---

## Scam Tactics Covered

| Tactic | Description |
|---|---|
| Authority | Claiming to represent a trusted institution |
| False Urgency | Artificial time pressure ("act within 15 minutes") |
| Fear | Threatening negative consequences |
| Suspicious Link | Fake verification URLs |
| Impersonation | Pretending to be a named person or brand |
| Scarcity | Limited-time or exclusive offers |
| Reward Bait | Offering money, credits, or prizes |
