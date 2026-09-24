import type { Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { signSession, hashPassword, comparePassword, requireAuth, type AuthedRequest } from "../auth.js";
import { registerSchema, loginSchema, parseOr400 } from "../validation.js";
import { asyncH } from "../middleware.js";
import { User } from "../models.js";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function issueSession(res: Response, uid: string, email: string, admin: boolean) {
  const token = signSession({ uid, email, admin });
  res.cookie("readmeai_token", token, COOKIE_OPTS);
  return token;
}

export function publicUser(u: {
  id?: string;
  _id?: unknown;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  githubUsername?: string | null;
  isAdmin?: boolean;
  createdAt?: Date;
  githubFollowers?: number;
  githubFollowing?: number;
  githubPublicRepos?: number;
}) {
  return {
    id: u.id ?? String(u._id),
    email: u.email,
    displayName: u.displayName ?? null,
    avatarUrl: u.avatarUrl ?? null,
    bio: u.bio ?? null,
    githubUsername: u.githubUsername ?? null,
    isAdmin: Boolean(u.isAdmin),
    createdAt: u.createdAt ?? new Date().toISOString(),
    github: {
      followers: u.githubFollowers ?? 0,
      following: u.githubFollowing ?? 0,
      publicRepos: u.githubPublicRepos ?? 0,
    },
  };
}

/** POST /api/auth/register */
router.post(
  "/register",
  asyncH(async (req, res) => {
    const { email, password, displayName } = parseOr400(registerSchema, req.body);
    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const hash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash: hash,
      displayName: displayName || email.split("@")[0],
    });

    issueSession(res, String(user._id), email, false);
    res.status(201).json({ user: publicUser(user.toObject()) });
  })
);

/** POST /api/auth/login */
router.post(
  "/login",
  asyncH(async (req, res) => {
    const { email, password } = parseOr400(loginSchema, req.body);
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    issueSession(res, String(user._id), user.email, user.isAdmin);
    res.json({ user: publicUser(user.toObject()) });
  })
);

/** POST /api/auth/logout */
router.post("/logout", (req, res) => {
  res.clearCookie("readmeai_token");
  res.json({ ok: true });
});

/** GET /api/auth/me */
router.get(
  "/me",
  requireAuth,
  asyncH(async (req, res) => {
    const { uid } = (req as AuthedRequest).user!;
    const user = await User.findById(uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  })
);

export default router;
