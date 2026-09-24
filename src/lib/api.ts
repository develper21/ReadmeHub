/**
 * Frontend API client for the ReadMeAI Express backend.
 *
 * How the frontend connects to the backend:
 * - Development:  Vite dev server proxies same-origin `/api/*` to the backend
 *                 (see vite.config.ts → server.proxy). No CORS needed.
 * - Production:   Set VITE_API_URL to the backend's base URL (e.g. https://api.example.com).
 *                 If unset, same-origin /api is assumed (e.g. behind nginx).
 *
 * Auth uses httpOnly JWT cookies (credentials: "include").
 */

/** Base URL of the API. Empty string = same origin. */
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

/** Where the backend's GitHub OAuth entry point lives (absolute). */
export const GITHUB_CONNECT_URL = API_URL
  ? `${API_URL}/api/github/connect`
  : "/api/github/connect";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error || `Request failed (${res.status})`, (data as { code?: string }).code);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUsername: string | null;
  isAdmin: boolean;
  createdAt: string;
  github?: { followers: number; following: number; publicRepos: number };
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  private: boolean;
  updatedAt: string;
}

export interface GeneratedReadme {
  id: string;
  repoName: string;
  repoFullName: string | null;
  repoUrl: string | null;
  content: string;
  technologies: string[];
  model: string | null;
  createdAt: string;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  repoName?: string | null;
  createdAt?: string;
}

export interface Profile {
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUsername: string | null;
  createdAt: string;
  stats: { readmeCount: number; followers: number; following: number; publicRepos: number };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  maxReadmesPerMonth: number;
  features: string[];
}
