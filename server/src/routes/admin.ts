import { Router } from "express";
import { requireAuth, requireAdmin } from "../auth.js";
import { notificationSchema, issueStatusSchema, parseOr400 } from "../validation.js";
import { asyncH } from "../middleware.js";
import { User, GeneratedReadme, ChatMessage, UserIssue, Notification, Plan } from "../models.js";

const router = Router();

router.use(requireAuth, requireAdmin);

/** GET /api/admin/stats */
router.get(
  "/stats",
  asyncH(async (_req, res) => {
    const [users, readmes, openIssues, activePlans, chats] = await Promise.all([
      User.countDocuments(),
      GeneratedReadme.countDocuments(),
      UserIssue.countDocuments({ status: "open" }),
      Plan.countDocuments({ isActive: true }),
      ChatMessage.countDocuments({ role: "user" }),
    ]);
    res.json({ stats: { users, readmes, openIssues, activePlans, chats } });
  })
);

/** GET /api/admin/users */
router.get(
  "/users",
  asyncH(async (_req, res) => {
    const rows = await User.find().sort({ createdAt: -1 }).lean();
    res.json({
      users: rows.map((u) => ({
        id: String(u._id),
        email: u.email,
        displayName: u.displayName,
        githubUsername: u.githubUsername,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      })),
    });
  })
);

/** GET /api/admin/readmes */
router.get(
  "/readmes",
  asyncH(async (_req, res) => {
    const rows = await GeneratedReadme.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate<{ user: { email: string } | null }>("user", "email")
      .lean();
    res.json({
      readmes: rows.map((r) => ({
        id: String(r._id),
        repo_name: r.repoName,
        repo_full_name: r.repoFullName,
        technologies: r.technologies ?? [],
        model: r.model,
        created_at: r.createdAt,
        email: (r.user as { email?: string } | null)?.email ?? "—",
      })),
    });
  })
);

/** GET /api/admin/issues */
router.get(
  "/issues",
  asyncH(async (_req, res) => {
    const rows = await UserIssue.find()
      .sort({ createdAt: -1 })
      .populate<{ user: { email: string } | null }>("user", "email")
      .lean();
    res.json({
      issues: rows.map((i) => ({
        id: String(i._id),
        title: i.title,
        description: i.description,
        status: i.status,
        priority: i.priority,
        created_at: i.createdAt,
        updated_at: i.updatedAt,
        email: (i.user as { email?: string } | null)?.email ?? "—",
      })),
    });
  })
);

/** PATCH /api/admin/issues/:id */
router.patch(
  "/issues/:id",
  asyncH(async (req, res) => {
    const input = parseOr400(issueStatusSchema, req.body);
    const info = await UserIssue.updateOne({ _id: req.params.id }, { status: input.status });
    if (!info.matchedCount) return res.status(404).json({ error: "Issue not found" });
    res.json({ ok: true });
  })
);

/** POST /api/admin/notifications — send to one user or broadcast to all */
router.post(
  "/notifications",
  asyncH(async (req, res) => {
    const input = parseOr400(notificationSchema, req.body);
    if (input.userId) {
      await Notification.create({ user: input.userId, title: input.title, message: input.message, type: input.type });
      return res.status(201).json({ sent: 1 });
    }
    const users = await User.find().select("_id").lean();
    await Notification.insertMany(
      users.map((u) => ({ user: String(u._id), title: input.title, message: input.message, type: input.type }))
    );
    res.status(201).json({ sent: users.length });
  })
);

export default router;
