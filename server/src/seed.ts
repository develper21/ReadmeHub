/**
 * Seed script: loads mock-data.ts into MongoDB.
 * Run: npm run seed   (or: npx tsx src/seed.ts)
 * Safe to re-run — clears collections first, then inserts fresh mock data.
 */
import "./env.js";
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "./db.js";
import { User, GeneratedReadme, ChatMessage, Contribution, Notification, UserIssue, Plan } from "./models.js";
import {
  MOCK_PLANS, MOCK_DEMO_USER, MOCK_ADMIN_USER, MOCK_READMES,
  MOCK_CHAT_MESSAGES, MOCK_CONTRIBUTIONS, MOCK_NOTIFICATIONS, MOCK_ISSUES,
} from "./mock-data.js";

async function seed() {
  await connectDB();

  console.log("[seed] clearing collections…");
  await Promise.all([
    User.deleteMany({}),
    GeneratedReadme.deleteMany({}),
    ChatMessage.deleteMany({}),
    Contribution.deleteMany({}),
    Notification.deleteMany({}),
    UserIssue.deleteMany({}),
    Plan.deleteMany({}),
  ]);

  console.log("[seed] plans…");
  await Plan.insertMany(MOCK_PLANS);

  console.log("[seed] users…");
  const demoHash = await bcrypt.hash(MOCK_DEMO_USER.password, 12);
  const adminHash = await bcrypt.hash(MOCK_ADMIN_USER.password, 12);
  const demo = await User.create({ ...MOCK_DEMO_USER, passwordHash: demoHash });
  await User.create({ ...MOCK_ADMIN_USER, passwordHash: adminHash });
  console.log(`[seed] demo login → ${MOCK_DEMO_USER.email} / ${MOCK_DEMO_USER.password}`);

  console.log("[seed] readmes, chat, contributions, notifications, issues…");
  await GeneratedReadme.insertMany(MOCK_READMES(String(demo._id)));
  await ChatMessage.insertMany(MOCK_CHAT_MESSAGES(String(demo._id)));
  await Contribution.insertMany(MOCK_CONTRIBUTIONS(String(demo._id)));
  await Notification.insertMany(MOCK_NOTIFICATIONS(String(demo._id)));
  await UserIssue.insertMany(MOCK_ISSUES(String(demo._id)));

  const counts = {
    users: await User.countDocuments(),
    plans: await Plan.countDocuments(),
    readmes: await GeneratedReadme.countDocuments(),
    chats: await ChatMessage.countDocuments(),
    contributions: await Contribution.countDocuments(),
    notifications: await Notification.countDocuments(),
    issues: await UserIssue.countDocuments(),
  };
  console.log("[seed] done ✅", counts);
  await disconnectDB();
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
