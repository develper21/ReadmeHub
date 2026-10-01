# 🧠 Project Memory

## ReadMeAI – Context, Progress & Important Notes

This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions or for new contributors.

---

<div align="center">

| 📅 Last Updated | 📍 Current Phase | 🎯 Progress |
|:---:|:---:|:---:|
| **Oct 1, 2026** | **Phase 7** | ▓▓▓▓▓▓▓▓░░ 81% |
| 10:30 AM | Docs & Testing | 26/32 tasks |

</div>

## 🎯 Current Status

- ✅ Project setup completed (Vite, React, TypeScript, Tailwind, shadcn/ui)
- ✅ Git repository initialized and pushed to GitHub
- ✅ Supabase + Lovable completely removed (deps, config, code)
- ✅ Express + MongoDB backend completed (auth, GitHub, AI, chat, user, admin)
- ✅ AI switched Gemini → **OpenAI** (`gpt-4o-mini`), template fallback intact
- ✅ OpenAI + Render + Netlify deployment configs in place
- ✅ Postman collections (frontend + server) with all 32 routes
- 🔄 Docs/ folder written (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY) — final review pending
- ⬜ Production deploy pending (Atlas + Render + Netlify wiring)

## 🔑 Important Context

- **Workspace:** `/home/narvin/Documents/Web/ReadmeHub` — branch `main`
- **Parallel collaborators:** multiple agents/humans edit this repo — **always re-read files before editing**
- **Env files are secret:** `.env`, `server/.env.local`, `server/.env.production` are git-ignored and must never be committed or logged
- **Demo creds (seeded via `npm run seed`):** `demo@readmeai.dev / demo123456`
- **Admin creds (bootstrap):** `admin@readmeai.local / admin12345` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- **Cookie:** `readmeai_token` (JWT, 7d, httpOnly) · Bearer fallback for API clients
- **AI model:** `gpt-4o-mini` via `OPENAI_MODEL`; no key → `template-fallback` mode
- **GitHub tokens:** AES-256-GCM encrypted at rest (key derived from `JWT_SECRET`)
- **Ports:** frontend `5173` (Vite proxy `/api` → `4000`), backend `4000`

## ✅ Completed Tasks

| # | Task | Completed On |
|---|------|--------------|
| 1.1 | Initialize Vite + React + TypeScript project | Sep 25, 2026 |
| 1.2 | Configure Tailwind CSS + shadcn/ui | Sep 26, 2026 |
| 1.3 | Set up Git repository | Sep 26, 2026 |
| 1.4 | Configure ESLint + Vitest | Sep 27, 2026 |
| 1.5 | Dark clay theme setup | Sep 27, 2026 |
| 2.1 | Auth pages UI (login, signup) | Sep 27, 2026 |
| 2.2 | Implement signup/login logic | Sep 27, 2026 |
| 2.3 | Remove Supabase + Lovable entirely | Sep 30, 2026 |
| 2.4 | JWT auth backend (register/login/logout/me) | Sep 30, 2026 |
| 2.5 | Protected routes + auth hook | Sep 30, 2026 |
| 2.6 | Bootstrap admin from env | Sep 30, 2026 |
| 3.1 | Express server skeleton | Sep 30, 2026 |
| 3.2 | MongoDB + Mongoose models | Sep 30, 2026 |
| 3.3 | OpenAI integration (`gpt-4o-mini`) | Sep 30, 2026 |
| 3.4 | README format spec + template fallback | Sep 30, 2026 |
| 3.5 | Generate endpoint (`/api/readmes/generate`) | Sep 30, 2026 |
| 3.6 | Live Markdown preview + export | Sep 30, 2026 |
| 3.7 | Usage tracking | Sep 30, 2026 |
| 4.1 | GitHub OAuth flow | Sep 30, 2026 |
| 4.2 | AES-256-GCM token encryption | Sep 30, 2026 |
| 4.3 | Fetch user repos endpoint | Sep 30, 2026 |
| 4.4 | Repo analyzer (`analyzeRepo`) | Sep 30, 2026 |
| 4.5 | Repo picker on Generate page | Sep 30, 2026 |
| 5.1 | Chat page UI + drawer | Sep 30, 2026 |
| 5.2 | Chat backend + history | Sep 30, 2026 |
| 5.3 | Repo-aware chat context | Oct 1, 2026 |
| 5.4 | Chat rate limiting | Oct 1, 2026 |
| 6.1–6.6 | Dashboard, profile, notifications, issues, plans, admin panel | Oct 1, 2026 |
| 7.1 | Professional root README.md | Oct 1, 2026 |
| 7.2 | Postman collections (frontend + server) | Oct 1, 2026 |
| 8.1 | Render config (`render.yaml`) | Oct 1, 2026 |
| 8.2 | Netlify config (`netlify.toml`, `_redirects`) | Oct 1, 2026 |

## 🔄 In Progress

| # | Task | Started On | Notes |
|---|------|------------|-------|
| 7.3 | Docs/ folder (6 files) | Oct 1, 2026 | This folder — self-review pending |

## ⬜ Up Next

| # | Task | Priority | Notes |
|---|------|----------|-------|
| 7.4 | Backend route unit tests | Medium | Vitest + supertest |
| 7.5 | E2E smoke test (generate → export) | Low | Playwright candidate |
| 8.3 | Provision MongoDB Atlas | High | Set `MONGO_URI` on Render |
| 8.4 | First production deploy + smoke test | High | Update GitHub OAuth callback URL |

## 💡 Lessons Learned

- **Template fallback is a feature, not a hack** — the app demos perfectly without an OpenAI key
- **Plain REST over SDK for OpenAI** — fewer deps, trivial model swaps via env
- **Encrypted third-party tokens (AES-256-GCM) from day one** — no plaintext debt to fix later
- **Zod at every write endpoint** — 400s are consistent and predictable (`{ error: string }`)
