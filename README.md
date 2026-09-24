# 🚀 ReadMeAI — AI-Powered README Generator

![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Connect GitHub → AI analyzes your code → professional README in seconds.**

ReadMeAI is a full-stack web app that generates polished, professional `README.md`
files for any project. Connect your GitHub account (OAuth) or enter details
manually, and the AI analyzes your repository's real code, structure and
dependencies to produce a consistent, professional README — with an integrated
AI chat to refine it further. All user data is stored in MongoDB.

## ✨ Features

- 🤖 **AI-Powered Generation** — Google Gemini writes intelligent, context-aware READMEs
- 🔍 **Deep Repository Analysis** — fetches the repo tree, curates the 20 most important files and reads them (manifests, configs, source)
- 🧠 **Smart Tech Detection** — detects languages, frameworks and tools from `package.json`, `requirements.txt`, `Cargo.toml` and more
- 📐 **Consistent Professional Format** — badges, about, features, tech stack, installation, usage, configuration table, project structure, contributing, license
- 💬 **AI Chat Assistant** — dedicated chat page + inline "refine README" drawer; chat remembers your project context
- 🔐 **GitHub OAuth Connect** — fetch your repos (public + private) with minimal scopes
- 🛡️ **Secure by Default** — bcrypt hashing, JWT httpOnly cookie sessions, AES-256-GCM encrypted GitHub tokens, rate limiting
- 🍃 **MongoDB Persistence** — users, README history, chat sessions, contributions, notifications, issues, plans
- 🪄 **Mock Data Seeding** — one command fills the DB with realistic demo data for the whole frontend
- 🧑‍💼 **Admin Dashboard** — users, READMEs, chat usage, issue triage, broadcast notifications, plans
- 📥 **Export Anywhere** — download `.md` or copy to clipboard, with live Markdown preview
- 🔁 **Offline Fallback** — no AI key? A deterministic template still produces the same professional format

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, Express 4, TypeScript, Mongoose
- **Database:** MongoDB 7 (local docker or Atlas)
- **AI:** Google Gemini (`gemini-2.0-flash`) via REST
- **Integrations:** GitHub REST API + GitHub OAuth App

## 🔌 How Frontend & Backend Connect

```
┌──────────────────────┐   /api/* (Vite proxy)   ┌──────────────────────────┐
│  React SPA           │ ──────────────────────► │  Express API             │
│  localhost:5173      │   dev: same-origin      │  localhost:4000          │
│                      │   prod: VITE_API_URL    │                          │
│  src/lib/api.ts ─────┼─────────────────────────┼──► MongoDB (mongoose)    │
└──────────────────────┘   httpOnly JWT cookies   └──────────────────────────┘
```

- **Development:** leave `VITE_API_URL` empty — the Vite dev server proxies
  same-origin `/api/*` to `http://localhost:4000` (configurable via
  `VITE_PROXY_TARGET`). No CORS headaches.
- **Production:** set `VITE_API_URL=https://api.your-domain.com` in
  `.env.production`, or serve both behind one domain and leave it empty.
- Auth uses httpOnly JWT cookies, so the browser never touches tokens directly.

## 📦 Installation

1. **Clone & install**

```bash
git clone <your-repo-url>
cd readmeai
npm install                      # frontend deps
cd server && npm install && cd .. # backend deps
```

2. **Start MongoDB** (pick one)

```bash
# Docker (recommended)
docker run -d --name readmeai-mongo -p 27017:27017 -v readmeai-mongo-data:/data/db mongo:7

# …or use a free MongoDB Atlas cluster and paste its URI into server/.env.local
```

3. **Configure environment** (all three variants are provided)

| File | Purpose |
|------|---------|
| `server/.env.example` | Documents every backend variable |
| `server/.env.local` | Local dev values (auto-loaded) |
| `server/.env.production` | Production template (loaded when `NODE_ENV=production`) |
| `.env.example` / `.env.local` / `.env.production` | Frontend (Vite) equivalents |

```bash
cp .env.example .env.local        # if you don't want the defaults
cp server/.env.example server/.env.local
```

Key backend variables (`server/.env.local`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `4000`) |
| `MONGO_URI` | `mongodb://localhost:27017/readmeai` or an Atlas SRV URI |
| `JWT_SECRET` | Cookie-session signing secret — change in production |
| `CLIENT_ORIGIN` | Allowed frontend origins for CORS |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin, auto-created on boot |
| `GEMINI_API_KEY` | [Free key](https://makersuite.google.com/app/apikey) — without it, template fallback is used |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | [OAuth App](https://github.com/settings/developers), callback `http://localhost:4000/api/github/callback` |
| `GITHUB_TOKEN` | Optional PAT for analyzing public repos of users who haven't connected OAuth |

4. **Seed mock data** (demo user, README history, chat, contributions, notifications, issues, plans)

```bash
cd server && npm run seed
```

5. **Run both processes** (two terminals)

```bash
# Terminal 1 — API server (localhost:4000)
cd server && npm run dev

# Terminal 2 — frontend (localhost:5173)
npm run dev
```

6. Open **http://localhost:5173** and sign in with the seeded demo account:

```
email:    demo@readmeai.dev
password: demo123456
```

Admin panel (`/admin-login`): `admin@readmeai.local` / `admin12345`

## 🚀 Usage

1. **Sign up / sign in** — email + password, or **Continue with GitHub**
2. **Connect GitHub** — Dashboard → *Connect GitHub* → authorize → your repos load automatically
3. **Generate** — pick a repo (or enter details manually) → *Generate README*
4. **Refine with AI Chat** — bot icon on the result, or the full **AI Chat** page
5. **Export** — preview, copy, or download `README.md`

### Generate from a repo via the API

```bash
curl -X POST http://localhost:4000/api/readmes/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"projectName":"express","repoFullName":"expressjs/express"}'
```

## 🍃 MongoDB Collections

| Collection | Stores |
|------------|--------|
| `users` | accounts, profile, GitHub connection (encrypted token), admin flag |
| `generatedreadmes` | every generated README + detected technologies + model used |
| `chatmessages` | AI chat sessions (per user, per session) |
| `contributions` | daily activity counts for the GitHub-style heatmap |
| `notifications` | per-user announcements (admin broadcast supported) |
| `userissues` | support/feedback tickets with status + priority |
| `plans` | Free / Pro / Enterprise plan definitions |

## 📁 Project Structure

```
readmeai/
├── server/                      # Express backend
│   ├── src/
│   │   ├── index.ts             # App entry: MongoDB connect, CORS, routers
│   │   ├── db.ts                # mongoose connection
│   │   ├── models.ts            # all Mongoose schemas
│   │   ├── mock-data.ts         # demo data for the whole frontend
│   │   ├── seed.ts              # npm run seed — loads mock data
│   │   ├── auth.ts              # JWT sessions, bcrypt, admin bootstrap
│   │   ├── ai.ts                # Gemini: README generation + chat + fallback
│   │   ├── github.ts            # GitHub REST, OAuth, repo analysis
│   │   ├── crypto.ts            # AES-256-GCM token encryption
│   │   ├── validation.ts        # Zod request schemas
│   │   └── routes/              # auth, github, readmes, chat, user, admin
│   ├── .env.example/.local/.production
│   └── package.json
├── src/                         # React frontend
│   ├── pages/                   # Index, Dashboard, Generate, Chat, Auth…
│   ├── components/              # Navbar, RepoCard, PreviewModal, ui/
│   ├── hooks/useAuth.tsx        # Session context
│   └── lib/api.ts               # Typed API client (proxy-aware)
├── .env.example/.local/.production   # frontend (Vite) env files
└── vite.config.ts               # port 5173 + /api proxy
```

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current session |
| GET | `/api/github/connect` | Start GitHub OAuth |
| GET | `/api/github/repos` | Fetch user's repositories |
| POST | `/api/readmes/generate` | Generate README (with repo analysis) |
| GET | `/api/readmes` | Generation history |
| POST | `/api/chat` | Send message to AI assistant |
| GET | `/api/chat/:sessionId` | Chat history |
| GET | `/api/user/profile` | Profile + contributions |
| GET | `/api/user/plans` | Available plans |
| GET | `/api/admin/stats` | Platform statistics (admin) |

## 🚀 Production Deployment

```bash
# Frontend — .env.production is baked in at build time
npm run build            # outputs dist/

# Backend
cd server
NODE_ENV=production npm start   # loads .env.production + connects MongoDB
```

- Use **MongoDB Atlas** for a managed database.
- Set `CLIENT_ORIGIN` to your frontend domain(s).
- Use a strong `JWT_SECRET` (`openssl rand -base64 48`).
- Put the API behind HTTPS so session cookies are sent `secure`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Made with ❤️ by the ReadMeAI team
