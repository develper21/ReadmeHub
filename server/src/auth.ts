import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "./models.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL = "7d";

export interface JwtPayloadShape {
  uid: string;
  email: string;
  admin: boolean;
}

export interface AuthedRequest extends Request {
  user?: JwtPayloadShape;
}

export function signSession(payload: JwtPayloadShape): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifySession(token: string): JwtPayloadShape | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayloadShape;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Bootstraps the admin account from ADMIN_EMAIL/ADMIN_PASSWORD on startup. */
export async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      if (!existing.isAdmin) {
        existing.isAdmin = true;
        await existing.save();
        console.log(`[auth] upgraded existing user to admin: ${email}`);
      }
      return;
    }
    await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      displayName: "Administrator",
      isAdmin: true,
    });
    console.log(`[auth] bootstrap admin created: ${email}`);
  } catch (err) {
    console.error("[auth] admin bootstrap skipped:", (err as Error).message);
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = (req.cookies?.readmeai_token as string) || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const payload = token ? verifySession(token) : null;
  if (!payload) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  (req as AuthedRequest).user = payload;
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as AuthedRequest).user;
  if (!user?.admin) {
    res.status(403).json({ error: "Admin privileges required" });
    return;
  }
  next();
};
