import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { generateSchema, parseOr400 } from "../validation.js";
import { generateReadmeWithAI } from "../ai.js";
import { analyzeRepo } from "../github.js";
import { decryptToken } from "../crypto.js";
import { asyncH } from "../middleware.js";
import { GeneratedReadme, Contribution, User } from "../models.js";

const router = Router();

const toReadmeJson = (r: {
  _id: unknown;
  repoName: string;
  repoFullName?: string | null;
  repoUrl?: string | null;
  content: string;
  technologies: string[];
  model?: string | null;
  createdAt?: Date;
}) => ({
  id: String(r._id),
  repoName: r.repoName,
  repoFullName: r.repoFullName ?? null,
  repoUrl: r.repoUrl ?? null,
  content: r.content,
  technologies: r.technologies ?? [],
  model: r.model ?? null,
  createdAt: r.createdAt ?? new Date().toISOString(),
});

/** GET /api/readmes — history for the signed-in user */
router.get(
  "/",
  requireAuth,
  asyncH(async (req, res) => {
    const rows = await GeneratedReadme.find({ user: (req as AuthedRequest).user!.uid })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ readmes: rows.map(toReadmeJson) });
  })
);

/** POST /api/readmes/generate — AI README generation (repo analysis + OpenAI + fallback) */
router.post(
  "/generate",
  requireAuth,
  asyncH(async (req, res) => {
    const input = parseOr400(generateSchema, req.body);
    const { uid, email } = (req as AuthedRequest).user!;

    const user = await User.findById(uid).lean();
    const author = user?.displayName || email.split("@")[0];

    let repoCtx;
    let analyzed = false;
    if (input.repoFullName) {
      const ghToken = user?.githubTokenEnc
        ? decryptToken(user.githubTokenEnc)
        : process.env.GITHUB_TOKEN || null; // server-level fallback for public repos
      try {
        repoCtx = await analyzeRepo(input.repoFullName, ghToken);
        analyzed = Boolean(repoCtx.files?.length);
      } catch (err) {
        const status = (err as Error & { status?: number }).status;
        if (status === 404) {
          return res.status(404).json({ error: `Repository "${input.repoFullName}" not found or not accessible` });
        }
        console.error("[generate] repo analysis failed, continuing without it:", err);
      }
    }

    const ctx = repoCtx ?? {
      name: input.projectName,
      description: input.description,
      url: input.repoUrl || undefined,
      detectedTech: input.techStack ? input.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    const result = await generateReadmeWithAI(ctx, input.techStack, author);

    const doc = await GeneratedReadme.create({
      user: uid,
      repoName: input.projectName,
      repoFullName: input.repoFullName || null,
      repoUrl: input.repoUrl || null,
      content: result.readme,
      technologies: result.technologies,
      model: result.model,
    });

    // daily contribution (upsert + increment)
    const today = new Date().toISOString().split("T")[0];
    await Contribution.findOneAndUpdate(
      { user: uid, activityDate: today, activityType: "readme_generated" },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    res.status(201).json({
      id: String(doc._id),
      readme: result.readme,
      model: result.model,
      technologies: result.technologies,
      analyzed,
    });
  })
);

/** GET /api/readmes/:id — single README */
router.get(
  "/:id",
  requireAuth,
  asyncH(async (req, res) => {
    const row = await GeneratedReadme.findOne({ _id: req.params.id, user: (req as AuthedRequest).user!.uid }).lean();
    if (!row) return res.status(404).json({ error: "README not found" });
    res.json({ readme: toReadmeJson(row) });
  })
);

/** DELETE /api/readmes/:id */
router.delete(
  "/:id",
  requireAuth,
  asyncH(async (req, res) => {
    const info = await GeneratedReadme.deleteOne({ _id: req.params.id, user: (req as AuthedRequest).user!.uid });
    if (!info.deletedCount) return res.status(404).json({ error: "README not found" });
    res.json({ ok: true });
  })
);

export default router;
