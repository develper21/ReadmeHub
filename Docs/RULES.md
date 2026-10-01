# 📋 Development Rules

## ReadMeAI – Project Guidelines for AI & Human Collaborators

This document defines the development rules, coding standards, and best practices for the ReadMeAI application. These rules ensure consistency, maintainability, security, and quality across the codebase. Both AI assistants and human contributors must follow these guidelines.

---

## 1. General Principles

These rules apply to the entire project.

- [ ] Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- [ ] Keep the code clean, readable and well-structured.
- [ ] Prioritize simplicity and maintainability.
- [ ] Do not duplicate logic. Reuse existing components, utilities or services.
- [ ] Make small, focused changes instead of large, risky edits.
- [ ] Do not modify unrelated files.
- [ ] Write self-explanatory code with meaningful variable and function names.
- [ ] Always re-read a file before editing — multiple collaborators work on this repo in parallel.

## 2. Technology & Coding Standards

Rules related to the tech stack and coding style.

| | Area | Rule |
|---|------|------|
| 🟦 | **Language** | Use TypeScript everywhere. Avoid `any` unless absolutely necessary. |
| 🧩 | **Frontend** | React 18 function components + hooks only. No class components. |
| ⚙️ | **Backend** | Express 4 (ESM, TypeScript) run via `tsx`. Async route handlers wrapped in `asyncH`. |
| 🎨 | **Styling** | Use Tailwind CSS + shadcn/ui. Follow the design system in DESIGN.md (clay/neumorphism tokens). |
| 📁 | **State & Data** | Use the typed API client in `src/lib/api.ts`; never hand-roll `fetch` in components. |
| ✅ | **Validation** | Every write endpoint must parse its body with a Zod schema from `server/src/validation.ts`. |
| 🔐 | **Auth & Security** | Auth via JWT httpOnly cookie (`readmeai_token`) with Bearer fallback. bcrypt cost 12. GitHub tokens AES-256-GCM encrypted. Never log secrets. |
| 🗄️ | **Database** | Mongoose 8 only. Models live in `server/src/models.ts`. No raw driver calls scattered in routes. |
| 🤖 | **AI** | OpenAI via plain REST (`gpt-4o-mini`). Always keep the template fallback path working. |
| 🧪 | **Testing** | `npm test` (Vitest) and `tsc --noEmit` must pass before any commit. |
| 📦 | **Dependencies** | Use stable, well-maintained packages. Avoid adding deps for things the stdlib/Tailwind can do. |
| 📄 | **File Naming** | Use clear, consistent names: components `PascalCase.tsx`, lib files `kebab-case.ts`, server modules `kebab-case.ts`. |

## 3. Project Structure

Follow the defined folder structure in ARCHITECTURE.md. Do not reorganize without discussion.

- [ ] Reusable UI components go in `src/components/` (shadcn primitives in `src/components/ui/`).
- [ ] Route pages stay in `src/pages/`; feature logic in `src/hooks/` / `src/lib/`.
- [ ] Server route files belong in `server/src/routes/` — one file per feature, mounted in `server/src/index.ts`.
- [ ] Database and external service logic stays in `server/src/` modules (`models.ts`, `github.ts`, `ai.ts`) — never in the frontend.
- [ ] Common utilities go in `src/lib/` or `server/src/middleware.ts`.
- [ ] Shared types live in `src/lib/api.ts` (client) and `server/src/readme-types.ts` (shared README types).
- [ ] Documentation changes go in `Docs/`; Postman updates in both `postman/` and `server/postman/`.
- [ ] Do not create new folders without a clear structural reason.

## 4. Git & Workflow

- [ ] Branch from `main`; keep commits small and descriptive.
- [ ] Never commit `.env`, `server/.env.local` or `server/.env.production`.
- [ ] Verify with `npx tsc --noEmit` (frontend + server) and `npm test` before pushing.
- [ ] Update `Docs/TASKS.md` + `Docs/MEMORY.md` after completing a phase or task.
