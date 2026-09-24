/**
 * GitHub REST + OAuth service.
 * Tokens are stored encrypted (AES-256-GCM) in the users table.
 */
import type { RepoContext } from "./readme-types.js";
import { decryptToken, encryptToken } from "./crypto.js";

const API = "https://api.github.com";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export const githubConfigured = () => Boolean(CLIENT_ID && CLIENT_SECRET);

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  updated_at: string;
  default_branch: string;
  topics?: string[];
  license?: { spdx_id: string; name: string } | null;
}

interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface BlobResponse {
  content?: string;
  encoding?: string;
}

async function gh<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw Object.assign(new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`), { status: res.status === 401 ? 401 : 502 });
  }
  return (await res.json()) as T;
}

// ── OAuth ────────────────────────────────────────────────────────────────────
export function oauthAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email repo",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: redirectUri }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) {
    throw Object.assign(new Error(data.error_description || "GitHub OAuth token exchange failed"), { status: 400 });
  }
  return data.access_token;
}

// ── User + repos ─────────────────────────────────────────────────────────────
export async function fetchGithubUser(token: string): Promise<GithubUser> {
  return gh<GithubUser>("/user", token);
}

export async function fetchUserRepos(token: string, page = 1): Promise<GithubRepo[]> {
  return gh<GithubRepo[]>(
    `/user/repos?sort=pushed&per_page=100&page=${page}&affiliation=owner,collaborator&visibility=all`,
    token
  );
}

export async function fetchPublicRepos(username: string): Promise<GithubRepo[]> {
  return gh<GithubRepo[]>(`/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`, "");
}

// ── Repo analysis ────────────────────────────────────────────────────────────
const SKIP_DIRS = [
  "node_modules", "dist", "build", "vendor", ".git", "__pycache__", ".next", ".venv",
  "venv", "coverage", ".idea", ".vscode", "target", "bin/obj", ".gradle", ".cache",
];
const BINARY_EXT = /\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|gz|tar|mp4|mp3|wav|woff2?|ttf|eot|otf|lock|bin|exe|dll|so|dylib|class|jar|pyc|wasm)$/i;
const IMPORTANT_FILE_WEIGHTS: [RegExp, number][] = [
  [/^package\.json$|^pyproject\.toml$|^requirements\.txt$|^cargo\.toml$|^go\.mod$|^pom\.xml$|^composer\.json$/i, 100],
  [/^readme/i, 90],
  [/^(vite|webpack|rollup|next|nuxt|angular|vue)\.config\./i, 85],
  [/^(dockerfile|docker-compose)/i, 80],
  [/^(src|app|lib|server|client)\//i, 60],
  [/^\.env\.example$|^\.env\.sample$/i, 70],
  [/\.(ts|tsx|js|jsx|py|go|rs|java|kt|rb|php|cs|c|cpp|vue|svelte)$/i, 50],
  [/^license|^contributing/i, 30],
];

const scoreFile = (path: string): number => {
  for (const [re, weight] of IMPORTANT_FILE_WEIGHTS) if (re.test(path)) return weight;
  return 10;
};

/** Builds a rich RepoContext (tech detection + curated file excerpts) for AI generation. */
export async function analyzeRepo(fullName: string, token: string | null, maxFiles = 20, maxBytesPerFile = 40_000): Promise<RepoContext> {
  const authFetch = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw Object.assign(new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`), { status: res.status === 404 ? 404 : 502 });
    }
    return (await res.json()) as T;
  };

  const meta = await authFetch<GithubRepo>(`/repos/${fullName}`);
  const branch = meta.default_branch || "main";

  const treeRes = await authFetch<{ tree: TreeEntry[] }>(`/repos/${fullName}/git/trees/${branch}?recursive=1`);
  const files = treeRes.tree.filter(
    (e) =>
      e.type === "blob" &&
      !BINARY_EXT.test(e.path) &&
      !SKIP_DIRS.some((d) => e.path === d || e.path.startsWith(`${d}/`)) &&
      (e.size ?? 0) < 200_000 &&
      !e.path.split("/").some((seg) => seg.startsWith("."))
  );

  const fileTree = files
    .slice(0, 400)
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)
    .slice(0, 200)
    .map((e) => e.path);

  // Curate top files: metadata/manifests first, then important source files
  const curated = files
    .map((e) => ({ path: e.path, score: scoreFile(e.path) + Math.max(0, 20 - (e.path.split("/").length * 5)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles);

  const contents: { path: string; content: string }[] = [];
  for (const f of curated) {
    try {
      const blob = await authFetch<BlobResponse>(`/repos/${fullName}/contents/${encodeURIComponent(f.path).replace(/%2F/g, "/")}?ref=${branch}`);
      const text = blob.content && blob.encoding === "base64" ? Buffer.from(blob.content, "base64").toString("utf8") : "";
      contents.push({ path: f.path, content: text.slice(0, maxBytesPerFile) });
    } catch {
      // skip files that fail to fetch
    }
  }

  return {
    name: meta.name,
    fullName: meta.full_name,
    description: meta.description || "",
    url: meta.html_url,
    language: meta.language || undefined,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    license: meta.license?.spdx_id || null,
    defaultBranch: branch,
    topics: meta.topics,
    fileTree,
    files: contents,
    detectedTech: [],
  };
}

export { encryptToken, decryptToken };
