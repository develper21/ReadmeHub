import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { profileSchema, issueSchema, parseOr400 } from "../validation.js";
import { asyncH } from "../middleware.js";
import { User, Contribution, GeneratedReadme, Notification, UserIssue, Plan } from "../models.js";

const router = Router();

// ── Profile ──────────────────────────────────────────────────────────────────
router.get(
  "/profile",
  requireAuth,
  asyncH(async (req, res) => {
    const uid = (req as AuthedRequest).user!.uid;
    const u = await User.findById(uid).lean();
    if (!u) return res.status(404).json({ error: "User not found" });

    const readmeCount = await GeneratedReadme.countDocuments({ user: uid });
    const contributions = await Contribution.find({ user: uid })
      .select("activityDate count -_id")
      .sort({ activityDate: 1 })
      .lean();

    res.json({
      profile: {
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        githubUsername: u.githubUsername,
        createdAt: u.createdAt,
        stats: {
          readmeCount,
          followers: u.githubFollowers ?? 0,
          following: u.githubFollowing ?? 0,
          publicRepos: u.githubPublicRepos ?? 0,
        },
      },
      contributions: contributions.map((c) => ({ date: c.activityDate, count: c.count })),
    });
  })
);

router.put(
  "/profile",
  requireAuth,
  asyncH(async (req, res) => {
    const input = parseOr400(profileSchema, req.body);
    const uid = (req as AuthedRequest).user!.uid;
    const u = await User.findByIdAndUpdate(
      uid,
      {
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.githubUsername !== undefined && { githubUsername: input.githubUsername }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      { new: true }
    ).lean();
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json({
      profile: {
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        githubUsername: u.githubUsername,
      },
    });
  })
);

// ── Notifications ────────────────────────────────────────────────────────────
router.get(
  "/notifications",
  requireAuth,
  asyncH(async (req, res) => {
    const rows = await Notification.find({ user: (req as AuthedRequest).user!.uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({
      notifications: rows.map((n) => ({
        id: String(n._id),
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        created_at: n.createdAt,
      })),
    });
  })
);

router.patch(
  "/notifications/:id/read",
  requireAuth,
  asyncH(async (req, res) => {
    await Notification.updateOne({ _id: req.params.id, user: (req as AuthedRequest).user!.uid }, { read: true });
    res.json({ ok: true });
  })
);

// ── Issues (support / feedback) ──────────────────────────────────────────────
router.get(
  "/issues",
  requireAuth,
  asyncH(async (req, res) => {
    const rows = await UserIssue.find({ user: (req as AuthedRequest).user!.uid })
      .sort({ createdAt: -1 })
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
      })),
    });
  })
);

router.post(
  "/issues",
  requireAuth,
  asyncH(async (req, res) => {
    const input = parseOr400(issueSchema, req.body);
    const issue = await UserIssue.create({ user: (req as AuthedRequest).user!.uid, ...input });
    res.status(201).json({
      issue: {
        id: String(issue._id),
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        created_at: issue.createdAt,
        updated_at: issue.updatedAt,
      },
    });
  })
);

// ── Plans (public info) ──────────────────────────────────────────────────────
router.get(
  "/plans",
  requireAuth,
  asyncH(async (_req, res) => {
    const rows = await Plan.find({ isActive: true }).sort({ priceMonthly: 1 }).lean();
    res.json({
      plans: rows.map((p) => ({
        id: String(p._id),
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        maxReadmesPerMonth: p.maxReadmesPerMonth,
        features: p.features,
      })),
    });
  })
);

// ── AI usage stats for the current user ──────────────────────────────────────
router.get(
  "/usage",
  requireAuth,
  asyncH(async (req, res) => {
    const uid = (req as AuthedRequest).user!.uid;
    const monthCount = await GeneratedReadme.countDocuments({
      user: uid,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    res.json({
      usage: {
        plan: "Free",
        readmeThisMonth: monthCount,
        limit: 5,
      },
    });
  })
);

export default router;
