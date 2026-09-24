import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  displayName: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const generateSchema = z.object({
  projectName: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  techStack: z.string().max(300).optional().default(""),
  repoFullName: z.string().max(200).optional().default(""),
  repoUrl: z.string().max(400).optional().default(""),
});

export const chatSchema = z.object({
  sessionId: z.string().min(1).max(80),
  message: z.string().min(1).max(8000),
  repoName: z.string().max(120).optional(),
});

export const profileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  githubUsername: z.string().max(100).optional(),
  avatarUrl: z.string().max(500).optional(),
});

export const issueSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).optional().default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const notificationSchema = z.object({
  userId: z.string().optional().default(""),
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(2000),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
});

export const issueStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

export function parseOr400<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const err = new Error(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    (err as Error & { status?: number }).status = 400;
    throw err;
  }
  return result.data;
}
