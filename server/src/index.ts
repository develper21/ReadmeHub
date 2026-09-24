import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "./env.js";
import { connectDB } from "./db.js";
import { notFound, errorHandler } from "./middleware.js";
import { ensureAdminUser } from "./auth.js";
import authRoutes from "./routes/auth.js";
import githubRoutes from "./routes/github.js";
import readmeRoutes from "./routes/readmes.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:8080")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no origin) and whitelisted origins
      if (!origin || origins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Basic global rate limit
app.use(
  "/api",
  rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false })
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "readmeai-api", db: "mongodb", time: new Date().toISOString() })
);
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/readmes", readmeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 4000;

async function main() {
  await connectDB();
  await ensureAdminUser();
  app.listen(PORT, () => {
    console.log(`[readmeai-api] listening on http://localhost:${PORT}`);
    console.log(`[readmeai-api] AI: ${process.env.GEMINI_API_KEY ? "Gemini configured" : "template fallback (no key)"}`);
    console.log(`[readmeai-api] GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? "configured" : "not configured"}`);
  });
}

main().catch((err) => {
  console.error("[readmeai-api] failed to start:", err);
  process.exit(1);
});
