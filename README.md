# 🚀 ReadMeAI — AI-Powered README Generator

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)

> Generate professional, AI-powered README.md files for any GitHub repository — in seconds.

**ReadMeAI** connects to your GitHub, analyzes your actual code (structure, dependencies, configs), and uses OpenAI to produce a polished, professional README with badges, installation guides, usage examples, and more. Includes an AI chat assistant to refine any README conversationally.

## ✨ Features

- 🤖 **OpenAI-powered generation** — `gpt-4o-mini` by default, any OpenAI model via `OPENAI_MODEL`
- 🔍 **Deep repo analysis** — fetches up to 20 key files (manifests, configs, source) + full directory tree from GitHub
- 🎨 **Professional format, guaranteed** — badges → tagline → about → features → tech stack → installation → usage → configuration → structure → contributing → license, even in offline fallback mode
- 💬 **AI chat assistant** — dedicated chat page + inline drawer on the Generate page to refine READMEs conversationally
- 🐙 **GitHub OAuth** — sign in with GitHub or connect later; repos fetched from the GitHub API, tokens stored AES-256-GCM encrypted
- 📥 **Export** — download as `README.md` or copy to clipboard, with live Markdown preview
- 📊 **Profile dashboard** — contribution heatmap, README history, GitHub stats
- 🛡️ **Admin panel** — users, READMEs, issues, broadcast notifications, plans
- 🔐 **Secure by default** — JWT httpOnly cookie sessions, bcrypt password hashing, CORS allow-list, rate limiting, Zod validation
- ⚡ **Graceful degradation** — no OpenAI key? A deterministic template generates the same professional format

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router |
| Backend | Node.js 20, Express 4, TypeScript (ESM) |
| Database | MongoDB (Mongoose 8) |
| AI | OpenAI Chat Completions REST API (`gpt-4o-mini`) |
| Auth | JWT (httpOnly cookies), bcrypt, GitHub OAuth |
| Validation | Zod schemas on every write endpoint |
| Deploy | Render (API) + Netlify (SPA) |

## 📦 Prerequisites

- **Node.js 20+**
- **MongoDB** — local (`docker run -p 27017:27017 mongo`) or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **OpenAI API key** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **GitHub OAuth App** — [github.com/settings/developers](https://github.com/settings/developers) (optional, needed for repo fetching / GitHub sign-in)

## 🚀 Quick Start (Local)

### 1. Clone & install

```bash
git clone <your-repo-url> readmeai
cd readmeai
npm install          # frontend deps (root)
cd server && npm install && cd ..   # backend deps
```

### 2. Configure environment

```bash
cp server/.env.example server/.env.local
cp .env.example .env.local   # frontend (optional in dev)
```

Edit `server/.env.local`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173,http://localhost:8080
JWT_SECRET=run-openssl-rand-base64-48
ADMIN_EMAIL=admin@readmeai.local
ADMIN_PASSWORD=admin12345
MONGO_URI=mongodb://localhost:27017/readmeai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_TOKEN=...            # optional: analyzes public repos without OAuth
```

### 3. (Optional) Seed demo data

```bash
cd server && npm run seed && cd ..
```

Creates `demo@readmeai.dev` / `demo123456` plus sample READMEs, chats, contributions.

### 4. Run

```bash
# Terminal 1 — backend (http://localhost:4000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173, proxies /api → :4000)
npm run dev
```

### 5. GitHub OAuth App setup

In your OAuth App settings:

- **Homepage URL:** `http://localhost:5173`
- **Authorization callback URL:** `http://localhost:4000/api/github/callback`

## 📖 How to Use

1. **Sign in** — email/password or **Continue with GitHub**
2. **Connect GitHub** (if not signed in via GitHub) — Dashboard → *Connect GitHub*
3. **Pick a repository** — browse your repos, search & filter by language
4. **Generate** — AI reads your code and writes the README (30–60s)
5. **Refine** — open the AI chat drawer and ask for changes ("add a badges section for React")
6. **Export** — copy or download `README.md`

## 🧩 Professional README Format

Every generated README (AI **and** offline fallback) follows this exact structure:

```
# <emoji> Project Name
<shields.io badges for the detected stack>
> One-line tagline

## 📋 About        — what & why (2-4 sentences)
## ✨ Features     — emoji bullet list
## 🛠️ Tech Stack   — languages, frameworks, tools
## 📦 Installation — clone → install → env → run (bash blocks)
## 🚀 Usage        — real command examples
## ⚙️ Configuration — env-variable table
## 📁 Project Structure — actual directory tree
## 🤝 Contributing — fork/branch/PR steps
## 📄 License      — MIT by default
---
Made with ❤️ by <author>
```

## 🔌 API Overview

Base URL: `/api` (dev: proxied by Vite; prod: `VITE_API_URL`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` · `/auth/login` · `/auth/logout` | Email/password auth (JWT cookie) |
| `GET`  | `/auth/me` | Current session user |
| `GET`  | `/github/status` | OAuth configured + connected? |
| `GET`  | `/github/connect` → `/github/callback` | GitHub OAuth flow |
| `GET`  | `/github/repos` | User's repositories (private + public) |
| `POST` | `/github/disconnect` | Unlink GitHub |
| `POST` | `/readmes/generate` | Analyze repo + generate README |
| `GET`  | `/readmes` · `/readmes/:id` | README history |
| `POST` | `/chat` | AI chat message (context-aware) |
| `GET/DELETE` | `/chat/:sessionId` | Chat history / clear |
| `GET/PUT` | `/user/profile` | Profile + contribution data |
| `GET`  | `/user/notifications` · `/user/issues` · `/user/plans` · `/user/usage` | User resources |
| `GET`  | `/admin/stats` · `/admin/users` · `/admin/readmes` · `/admin/issues` | Admin (role-guarded) |
| `PATCH`| `/admin/issues/:id` | Update issue status |
| `POST` | `/admin/notifications` | Broadcast notification |
| `GET`  | `/health` | Health check |

## 📁 Project Structure

```
readmeai/
├── server/                 # Express + MongoDB backend
│   ├── src/
│   │   ├── index.ts        # App bootstrap, CORS, rate limits, routes
│   │   ├── env.ts          # .env loader (.env.local / .env.production)
│   │   ├── db.ts           # Mongoose connection
│   │   ├── models.ts       # User, Readme, Chat, Contribution, ... schemas
│   │   ├── auth.ts         # JWT sessions, bcrypt, admin bootstrap, guards
│   │   ├── ai.ts           # OpenAI service + format spec + fallback
│   │   ├── github.ts       # GitHub REST + OAuth + repo analysis
│   │   ├── crypto.ts       # AES-256-GCM token encryption
│   │   ├── validation.ts   # Zod schemas
│   │   ├── middleware.ts   # error handler, async wrapper
│   │   └── routes/         # auth, github, readmes, chat, user, admin
│   ├── .env.example        # env template
│   └── package.json
├── src/                    # React SPA
│   ├── pages/              # Index, Auth, AuthCallback, Dashboard, Generate,
│   │                       # Chat, Profile, Settings, Admin, AdminLogin
│   ├── components/         # Navbar, HeroSection, RepoCard, PreviewModal, ...
│   ├── hooks/useAuth.tsx   # Session context
│   └── lib/api.ts          # Typed API client (credentials: include)
├── netlify.toml            # Netlify deploy config (frontend)
├── render.yaml             # Render blueprint (backend)
└── vite.config.ts          # Dev proxy /api → localhost:4000
```

## 🚢 Deployment

### Backend → Render

1. Push the repo to GitHub
2. Render Dashboard → **New → Blueprint** → select the repo — `render.yaml` is auto-detected
3. Fill in the `sync: false` env vars: `MONGO_URI` (Atlas URL), `CLIENT_ORIGIN` (your Netlify URL), `OPENAI_API_KEY`, `GITHUB_CLIENT_ID/SECRET`, `ADMIN_EMAIL/ADMIN_PASSWORD`
4. Deploy — health check runs at `/api/health`

### Frontend → Netlify

1. Netlify → **Add new site → Import project** → select the repo — `netlify.toml` is auto-detected
2. Add environment variable: `VITE_API_URL = https://<your-render-app>.onrender.com`
3. Deploy — the SPA fallback (`/* → /index.html`) is pre-configured
4. Back in Render, set `CLIENT_ORIGIN` to the Netlify URL (CORS + cookies)

> **Tip:** For same-origin cookies on Netlify, uncomment the `/api/*` proxy redirect in `netlify.toml` and leave `VITE_API_URL` empty.
>
> **Note:** The backend build runs TypeScript on the server (`tsc`), so `typescript`, `tsx` and `@types/*` are intentionally listed in production `dependencies` — Render sets `NODE_ENV=production`, which would otherwise skip devDependencies and break the build.

## 🔒 Security

- ✅ JWT sessions in **httpOnly** cookies (7-day expiry)
- ✅ Passwords hashed with **bcrypt** (cost 12)
- ✅ GitHub tokens encrypted at rest (**AES-256-GCM**, key derived from `JWT_SECRET`)
- ✅ Short-lived signed OAuth **state** validation (10 min)
- ✅ **CORS allow-list** + credentials
- ✅ **Rate limiting** (120 req/min global, 30 msgs/5min chat)
- ✅ **Zod validation** on every mutating endpoint
- ✅ Admin routes double-guarded (`requireAuth` + `requireAdmin`)

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Repos not loading | Connect GitHub on the Dashboard; check `GITHUB_CLIENT_ID/SECRET` and the callback URL |
| READMEs say "template fallback" | `OPENAI_API_KEY` is missing/invalid on the server |
| CORS errors after deploy | Set `CLIENT_ORIGIN` on Render to your exact Netlify URL (scheme included) |
| Cookies not sent cross-origin | Use the Netlify `/api/*` proxy redirect, or ensure both `CLIENT_ORIGIN` and `VITE_API_URL` use HTTPS |
| MongoDB connection refused | Verify `MONGO_URI`; Atlas requires allowing Render's outbound IPs (allow `0.0.0.0/0` or Render egress) |
| Admin login fails | Set `ADMIN_EMAIL` + `ADMIN_PASSWORD` on the server and restart |

## 🗺️ Roadmap

- [ ] Streaming chat responses (SSE)
- [ ] Multiple AI providers (Anthropic, Gemini) behind one interface
- [ ] One-click "commit README to repo" via GitHub API
- [ ] README templates/themes marketplace
- [ ] Stripe billing for Pro plans

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by the ReadMeAI team
