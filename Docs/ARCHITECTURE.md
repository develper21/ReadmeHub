# 🏛 System Architecture

## ReadMeAI – AI README Generator (React + Express + MongoDB + OpenAI)

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the **ReadMeAI** application.

---

## 1. High-Level Architecture

ReadMeAI follows a classic client-server architecture — a React SPA talking to a Node.js/Express REST API over HTTPS, backed by MongoDB and OpenAI.

```
┌──────────────┐      HTTPS / JSON       ┌──────────────────┐      ┌───────────────────┐      ┌──────────────┐
│     User     │ ◄─────────────────────► │  React Frontend  │ ◄──► │  Express Backend  │ ◄──► │   MongoDB    │
│ (Web Browser)│      (REST API)         │  (Vite + TS SPA) │      │ (REST API + Auth) │      │  (Mongoose)  │
└──────────────┘                         └──────────────────┘      └─────────┬─────────┘      └──────────────┘
                                                                            │
                                                              ┌─────────────┴─────────────┐
                                                              ▼                           ▼
                                                     ┌────────────────┐          ┌───────────────────┐
                                                     │     OpenAI     │          │   GitHub API      │
                                                     │ (gpt-4o-mini)  │          │ (OAuth + Repos)   │
                                                     └────────────────┘          └───────────────────┘
```

**Data flow (README generation):**
1. User clicks **Generate** → frontend POSTs to `/api/readmes/generate`
2. Backend validates input (Zod) → analyzes the GitHub repo (tree + 20 curated files) if `repoFullName` given
3. Repo context + user input sent to **OpenAI** (`gpt-4o-mini`) — template fallback if no key
4. Result saved to MongoDB + contribution heatmap updated → frontend renders with live Markdown preview

**Data flow (chat):** messages stored in MongoDB per `sessionId`; last 10 messages sent as conversation context; optional repo README attached as AI context.

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript + Vite | UI framework, type safety, dev server & builds |
| UI/Styling | Tailwind CSS, shadcn/ui, Framer Motion | Clay/neumorphism dark UI, components, animation |
| Routing | React Router | SPA navigation, protected routes |
| Backend | Node.js 20 + Express 4 (ESM, TypeScript) | REST API, middleware, static JSON handling |
| Database | MongoDB + Mongoose 8 | Users, READMEs, chats, notifications, issues, plans |
| AI | OpenAI Chat Completions REST (`gpt-4o-mini`) | README generation + chat, template fallback |
| Auth | JWT (httpOnly cookie `readmeai_token`, 7d), bcrypt (12), GitHub OAuth | Sessions, password hashing, social sign-in |
| Encryption | Node crypto AES-256-GCM | GitHub token encryption at rest |
| Validation | Zod | Request body schemas on every write endpoint |
| Rate limiting | express-rate-limit | 120 req/min global, 30 msgs/5min chat |
| Dev tooling | tsx (dev), TypeScript project refs, ESLint, Vitest | DX and checks |
| Deployment | Render (API, `render.yaml`) + Netlify (SPA, `netlify.toml`) | Hosting, health checks, SPA redirects |

## 3. Folder Structure

The project follows a split frontend/backend structure to keep client and API concerns isolated and scalable.

```
ReadMeAI/
├── index.html                  # SPA entry
├── vite.config.ts              # Vite + /api proxy → localhost:4000
├── netlify.toml                # Netlify SPA config
├── render.yaml                 # Render API config
├── Docs/                       # Project documentation (you are here)
│   ├── PRD.md                  # Product requirements
│   ├── ARCHITECTURE.md         # This file
│   ├── RULES.md                # Development rules
│   ├── DESIGN.md               # Design system
│   ├── TASKS.md                # Task breakdown & status
│   └── MEMORY.md               # Project memory / context
├── postman/                    # Frontend-side Postman collection
│   └── postman.json            # All API routes (import in Postman)
├── public/                     # Static assets + _redirects
└── src/                        # ── Frontend (React) ──
    ├── components/             # UI components (shadcn/ui + custom)
    │   └── ui/                 # shadcn primitives
    ├── pages/                  # Route pages (Auth, Dashboard, Generate, Chat…)
    ├── components/…            # feature components
    ├── hooks/                  # Custom hooks (auth, toast…)
    ├── lib/                    # api.ts (typed API client), utils
    └── test/                   # Vitest setup
server/                         # ── Backend (Express) ──
├── postman/postman.json        # Server-side Postman collection
├── .env.example                # Env template
├── tsconfig.json / package.json
└── src/
    ├── index.ts                # App entry: express app, CORS, rate limit, route mounting
    ├── env.ts                  # Env loading & validation
    ├── db.ts                   # Mongoose connection
    ├── models.ts               # User, GeneratedReadme, ChatMessage, Notification, UserIssue, Plan, Contribution
    ├── auth.ts                 # JWT sign/verify, bcrypt, requireAuth/requireAdmin, admin bootstrap
    ├── crypto.ts               # AES-256-GCM encrypt/decrypt, random tokens
    ├── github.ts               # OAuth URL, token exchange, repos, analyzeRepo()
    ├── ai.ts                   # OpenAI calls, README_FORMAT_SPEC, detectTechnologies, fallbackReadme
    ├── validation.ts           # Zod schemas (register, login, generate, chat, profile, issue…)
    ├── middleware.ts           # asyncH, notFound, errorHandler
    ├── readme-types.ts         # Shared README format types
    ├── seed.ts / mock-data.ts  # Demo data seeding (npm run seed)
    └── routes/
        ├── auth.ts             # /api/auth/*
        ├── github.ts           # /api/github/*
        ├── readmes.ts          # /api/readmes/*
        ├── chat.ts             # /api/chat/*
        ├── user.ts             # /api/user/*
        └── admin.ts            # /api/admin/*  (requireAuth + requireAdmin)
```

## 4. Key Design Decisions

- **JWT in httpOnly cookie + Bearer fallback** — XSS-safe default, Postman-friendly alternative
- **AES-256-GCM token encryption** — GitHub OAuth tokens never stored in plaintext (key from JWT_SECRET)
- **OpenAI without SDK** — plain `fetch` to `https://api.openai.com/v1/chat/completions`; zero extra deps, easy to swap models via `OPENAI_MODEL`
- **Template fallback** — `fallbackReadme()` produces the same professional format without an API key; the app never hard-fails
- **Zod at the edge** — every write endpoint parses the body through a schema; invalid input → `400 { error }` before any logic
- **Split Postman collections** — same 32-request coverage on both frontend (`postman/`) and server (`server/postman/`) sides
- **Graceful degradation everywhere** — repo analysis failure continues without context; DB is the only hard dependency

## 5. Environments & Deployment

| Piece | Where | Notes |
|-------|-------|-------|
| API | **Render** (`render.yaml`, service `readmeai-api`) | rootDir `server`, build `npm ci && npm run build`, health check `/api/health` |
| SPA | **Netlify** (`netlify.toml`, `public/_redirects`) | build `npm run build`, publish `dist`, SPA fallback `/* → /index.html 200` |
| Dev proxy | `vite.config.ts` | `/api` → `VITE_PROXY_TARGET` (default `http://localhost:4000`) |
| Database | MongoDB Atlas / local | `MONGO_URI` (default `mongodb://localhost:27017/readmeai`) |
| CORS | `CLIENT_ORIGIN` | Comma-separated allow-list, credentials enabled |
