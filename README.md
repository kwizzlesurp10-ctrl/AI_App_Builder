<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI App Builder — Agent-Swarm Powered

A conversational AI application builder powered by a **living agent swarm**. Describe your app through natural language and watch specialized AI agents collaboratively generate UI mockups, database schemas, frontend code, backend code, and themes in real time.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                      │
│  ┌──────────────┐  ┌────────────────────────────┐    │
│  │ ChatInterface │  │ PreviewPane (UI/Code/Schema)│    │
│  └──────┬───────┘  └────────────┬───────────────┘    │
│         │                       │                     │
│  ┌──────┴───────────────────────┴───────────────┐    │
│  │              App Orchestrator                  │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                 │
│  ┌──────────────────┴───────────────────────────┐    │
│  │           Agent Swarm Runtime                  │    │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐   │    │
│  │  │MessageBus│ │Orchestrator│ │Swarm Memory │   │    │
│  │  └─────────┘ └──────────┘ └──────────────┘   │    │
│  │                                                │    │
│  │  10 Specialized Agents:                        │    │
│  │  • Orchestrator Prime  • Aria (UI Designer)    │    │
│  │  • Atlas (Schema)      • Nova (Frontend)       │    │
│  │  • Forge (Backend)     • Prism (Theme)         │    │
│  │  • Sentinel (Reviewer) • Verify (Testing)      │    │
│  │  • Pipeline (DevOps)   • Shield (Security)     │    │
│  └────────────────────────────────────────────────┘    │
│                     │                                 │
│  ┌──────────────────┴───────────────────────────┐    │
│  │    Enhanced Gemini Service (retry + rate limit)│    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                 │
└─────────────────────┼─────────────────────────────────┘
                      │
              ┌───────┴────────┐
              │ Google Gemini  │
              │   (2.5 Pro)    │
              └────────────────┘
```

## Features

- **Conversational App Building** — Describe your app in natural language and iterate through chat
- **Live Agent Swarm** — 10 specialized agents with pub/sub messaging, shared memory, and task routing
- **Real-time Preview** — See UI mockups, schemas, and code update live as you describe features
- **Session Persistence** — Your work is automatically saved to localStorage and restored on refresh
- **XSS Protection** — All user/AI content is sanitized before rendering
- **Error Recovery** — React Error Boundary catches and recovers from rendering errors
- **Retry with Backoff** — API calls automatically retry with exponential backoff (3 attempts)
- **Rate Limiting** — Client-side rate limiting prevents API quota exhaustion
- **Accessibility** — ARIA labels, semantic roles, keyboard navigation

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Setup

```bash
# Install dependencies
npm install

# Configure your API key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
docker compose up --build
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build to `dist/` |
| `npm start` | Preview production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | TypeScript type checking |

## Agent Swarm

The application ships with a built-in agent swarm runtime. Each agent has specialized capabilities:

| Agent | Role | Capabilities |
|---|---|---|
| **Orchestrator Prime** | Task decomposition & routing | Decomposes requests, routes to specialists |
| **Aria** | UI Designer | Accessible mockups, responsive design |
| **Atlas** | Schema Architect | Prisma schemas, data modeling, indexes |
| **Nova** | Frontend Engineer | React/TypeScript components, hooks |
| **Forge** | Backend Engineer | REST APIs, authentication, validation |
| **Prism** | Theme Stylist | Color theory, WCAG contrast, dark mode |
| **Sentinel** | Code Reviewer | Security audit, performance analysis |
| **Verify** | Test Engineer | Unit/integration tests, coverage |
| **Pipeline** | DevOps Engineer | CI/CD, Docker, monitoring |
| **Shield** | Security Auditor | OWASP compliance, threat modeling |

The swarm dashboard at the bottom of the chat panel shows real-time agent status and activity.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS
- **Build:** Vite 6
- **AI:** Google Gemini 2.5 Pro via `@google/genai`
- **Testing:** Vitest, Testing Library
- **Linting:** ESLint with TypeScript rules
- **CI/CD:** GitHub Actions
- **Container:** Docker multi-stage build

## Project Structure

```
├── App.tsx                         # Main app component
├── index.tsx                       # React entry point
├── types.ts                        # Shared TypeScript types
├── constants.ts                    # App constants & system prompt
├── components/
│   ├── ChatInterface.tsx           # Chat UI with message display
│   ├── PreviewPane.tsx             # Tabbed artifact preview
│   ├── UIMockup.tsx                # Live UI mockup renderer
│   ├── CodeBlock.tsx               # Code display with copy
│   ├── ErrorBoundary.tsx           # Error recovery boundary
│   └── swarm/
│       └── SwarmDashboard.tsx      # Agent swarm status panel
├── services/
│   ├── geminiService.ts            # Base Gemini API client
│   ├── swarmGeminiService.ts       # Enhanced service with retry/rate-limit
│   ├── persistenceService.ts       # Session save/load
│   ├── sanitize.ts                 # Input/output sanitization
│   └── swarm/
│       ├── index.ts                # Public API
│       ├── types.ts                # Swarm type definitions
│       ├── orchestrator.ts         # Central swarm coordinator
│       ├── messageBus.ts           # Pub/sub event bus
│       ├── agents/
│       │   └── definitions.ts      # Agent definitions & lookup
│       └── memory/
│           └── swarmMemory.ts      # Persistent shared memory
├── tests/                          # Unit & integration tests
├── .github/workflows/ci.yml       # CI pipeline
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml              # Container orchestration
└── .env.example                    # Environment template
```

## License

Private — see repository for details.
