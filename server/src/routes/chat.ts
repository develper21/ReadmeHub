import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { chatSchema, parseOr400 } from "../validation.js";
import { chatWithAI } from "../ai.js";
import { asyncH } from "../middleware.js";
import { rateLimit } from "express-rate-limit";
import { ChatMessage, GeneratedReadme } from "../models.js";

const router = Router();

// Chat-specific rate limit: 30 messages / 5 min / user
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => (req as AuthedRequest).user?.uid || req.ip || "anon",
  standardHeaders: "draft-7",
});

const toMsgJson = (m: { _id: unknown; role: string; content: string; repoName?: string | null; createdAt?: Date }) => ({
  id: String(m._id),
  role: m.role as "user" | "assistant",
  content: m.content,
  repoName: m.repoName ?? null,
  createdAt: m.createdAt ?? new Date().toISOString(),
});

/** GET /api/chat/:sessionId — conversation history */
router.get(
  "/:sessionId",
  requireAuth,
  asyncH(async (req, res) => {
    const rows = await ChatMessage.find({ user: (req as AuthedRequest).user!.uid, sessionId: req.params.sessionId })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();
    res.json({ messages: rows.map(toMsgJson) });
  })
);

/** POST /api/chat — send a message, get AI reply (context-aware of current repo) */
router.post(
  "/",
  requireAuth,
  chatLimiter,
  asyncH(async (req, res) => {
    const input = parseOr400(chatSchema, req.body);
    const uid = (req as AuthedRequest).user!.uid;

    // Load recent conversation for continuity
    const history = await ChatMessage.find({ user: uid, sessionId: input.sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    history.reverse();

    // If the chat is tied to a repo, include the last generated README as context
    let repoContext;
    if (input.repoName) {
      const latest = await GeneratedReadme.findOne({ user: uid, repoName: input.repoName })
        .sort({ createdAt: -1 })
        .lean();
      if (latest) {
        repoContext = {
          name: latest.repoName,
          detectedTech: latest.technologies ?? [],
          description: latest.content.slice(0, 4000),
        };
      }
    }

    const messages = [...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user" as const, content: input.message }];

    const userMsg = await ChatMessage.create({ user: uid, sessionId: input.sessionId, role: "user", content: input.message, repoName: input.repoName || null });

    const { reply, model } = await chatWithAI(messages, { repoName: input.repoName, repoContext });

    const replyDoc = await ChatMessage.create({ user: uid, sessionId: input.sessionId, role: "assistant", content: reply, repoName: input.repoName || null });

    res.json({ id: String(replyDoc._id), userMessageId: String(userMsg._id), reply, model });
  })
);

/** DELETE /api/chat/:sessionId — clear a conversation */
router.delete(
  "/:sessionId",
  requireAuth,
  asyncH(async (req, res) => {
    await ChatMessage.deleteMany({ user: (req as AuthedRequest).user!.uid, sessionId: req.params.sessionId });
    res.json({ ok: true });
  })
);

export default router;
