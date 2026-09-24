import { Router } from "express";
import { randomToken } from "../crypto.js";
import { requireAuth, signSession, verifySession, type AuthedRequest } from "../auth.js";
import { githubConfigured, oauthAuthorizeUrl, exchangeCodeForToken, fetchGithubUser, fetchUserRepos, fetchPublicRepos, encryptToken, decryptToken, type GithubRepo } from "../github.js";
import { asyncH } from "../middleware.js";
import { User } from "../models.js";
import { publicUser } from "./auth.js";
import { uuid } from "../crypto.js";

const router = Router();

// Short-lived signed state (10 min) so we can verify the OAuth round-trip
const states = new Map<string, number>();
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [k, t] of states) if (t < cutoff) states.delete(k);
}, 60 * 1000).unref?.();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function repoToJson(r: GithubRepo) {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    language: r.language,
    stargazersCount: r.stargazers_count,
    forksCount: r.forks_count,
    openIssuesCount: r.open_issues_count,
    private: Boolean(r.private),
    updatedAt: r.updated_at,
  };
}

/** GET /api/github/status — is GitHub integration configured + connected? */
router.get(
  "/status",
  requireAuth,
  asyncH(async (req, res) => {
    const user = await User.findById((req as AuthedRequest).user!.uid).lean();
    res.json({
      configured: githubConfigured(),
      connected: Boolean(user?.githubTokenEnc),
      username: user?.githubUsername ?? null,
    });
  })
);

/** GET /api/github/connect — start OAuth (must be signed in) */
router.get("/connect", requireAuth, (req, res) => {
  if (!githubConfigured()) return res.status(501).json({ error: "GitHub OAuth is not configured on the server" });
  const state = randomToken(16);
  states.set(state, Date.now());
  res.redirect(oauthAuthorizeUrl(state, `${req.protocol}://${req.get("host")}/api/github/callback`));
});

/** GET /api/github/callback — OAuth redirect target */
router.get(
  "/callback",
  asyncH(async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;
    const clientOrigin = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0]?.trim();
    if (error || !code || !state || !states.has(state)) {
      return res.redirect(`${clientOrigin}/auth/callback?github=error`);
    }
    states.delete(state);

    const token = await exchangeCodeForToken(code, `${req.protocol}://${req.get("host")}/api/github/callback`);
    const ghUser = await fetchGithubUser(token);

    // Identify the app user via the readmeai session cookie (if present)
    const appToken = req.cookies?.readmeai_token;
    const session = appToken ? verifySession(appToken) : null;

    let targetUser;
    if (session) {
      targetUser = await User.findByIdAndUpdate(
        session.uid,
        {
          githubUsername: ghUser.login,
          githubId: String(ghUser.id),
          githubTokenEnc: encryptToken(token),
          githubFollowers: ghUser.followers,
          githubFollowing: ghUser.following,
          githubPublicRepos: ghUser.public_repos,
          avatarUrl: { $ifNull: ["$avatarUrl", ghUser.avatar_url] },
        },
        { new: true }
      );
    } else {
      // Sign in / sign up purely via GitHub
      targetUser = await User.findOne({ githubId: String(ghUser.id) });
      if (!targetUser) {
        targetUser = await User.create({
          email: ghUser.email || `${ghUser.login}@users.noreply.github.com`,
          passwordHash: null,
          displayName: ghUser.name || ghUser.login,
          avatarUrl: ghUser.avatar_url,
          githubUsername: ghUser.login,
          githubId: String(ghUser.id),
          githubTokenEnc: encryptToken(token),
          githubFollowers: ghUser.followers,
          githubFollowing: ghUser.following,
          githubPublicRepos: ghUser.public_repos,
        });
      } else {
        Object.assign(targetUser, {
          githubTokenEnc: encryptToken(token),
          githubFollowers: ghUser.followers,
          githubFollowing: ghUser.following,
          githubPublicRepos: ghUser.public_repos,
        });
        await targetUser.save();
      }
    }

    res.cookie("readmeai_token", signSession({ uid: String(targetUser!._id), email: targetUser!.email, admin: targetUser!.isAdmin }), COOKIE_OPTS);
    res.redirect(`${clientOrigin}/auth/callback?github=success`);
  })
);

/** GET /api/github/repos — user's repositories (auth via stored GitHub token) */
router.get(
  "/repos",
  requireAuth,
  asyncH(async (req, res) => {
    const user = await User.findById((req as AuthedRequest).user!.uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    let repos: GithubRepo[] = [];
    if (user.githubTokenEnc) {
      const token = decryptToken(user.githubTokenEnc);
      repos = await fetchUserRepos(token);
      try {
        const more = await fetchUserRepos(token, 2);
        if (more.length) repos = [...repos, ...more];
      } catch { /* ignore */ }
    } else if (user.githubUsername) {
      repos = await fetchPublicRepos(user.githubUsername);
    } else {
      return res.status(400).json({
        error: "GitHub not connected. Connect your GitHub account first.",
        code: "GITHUB_NOT_CONNECTED",
      });
    }

    repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    res.json({ repos: repos.map(repoToJson), connected: Boolean(user.githubTokenEnc) });
  })
);

/** POST /api/github/disconnect */
router.post(
  "/disconnect",
  requireAuth,
  asyncH(async (req, res) => {
    await User.findByIdAndUpdate((req as AuthedRequest).user!.uid, {
      githubTokenEnc: null,
      githubId: null,
    });
    res.json({ ok: true });
  })
);

export default router;
