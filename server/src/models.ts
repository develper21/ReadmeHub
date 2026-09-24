import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null },
    displayName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null },
    githubUsername: { type: String, default: null, index: true },
    githubId: { type: String, default: null, index: true },
    githubTokenEnc: { type: String, default: null },
    githubFollowers: { type: Number, default: 0 },
    githubFollowing: { type: Number, default: 0 },
    githubPublicRepos: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const GeneratedReadmeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    repoName: { type: String, required: true },
    repoFullName: { type: String, default: null },
    repoUrl: { type: String, default: null },
    content: { type: String, required: true },
    technologies: { type: [String], default: [] },
    model: { type: String, default: null },
  },
  { timestamps: true }
);

const ChatMessageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    repoName: { type: String, default: null },
  },
  { timestamps: true }
);
ChatMessageSchema.index({ user: 1, sessionId: 1, createdAt: 1 });

const ContributionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activityDate: { type: String, required: true }, // YYYY-MM-DD
    activityType: { type: String, default: "readme_generated" },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);
ContributionSchema.index({ user: 1, activityDate: 1, activityType: 1 }, { unique: true });

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserIssueSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

const PlanSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    priceMonthly: { type: Number, default: 0 },
    maxReadmesPerMonth: { type: Number, default: 5 }, // -1 = unlimited
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
export const GeneratedReadme = mongoose.model("GeneratedReadme", GeneratedReadmeSchema);
export const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
export const Contribution = mongoose.model("Contribution", ContributionSchema);
export const Notification = mongoose.model("Notification", NotificationSchema);
export const UserIssue = mongoose.model("UserIssue", UserIssueSchema);
export const Plan = mongoose.model("Plan", PlanSchema);
