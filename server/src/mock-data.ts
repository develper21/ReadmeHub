/**
 * Mock/demo data for the whole frontend.
 * Used to seed a fresh MongoDB database (npm run seed) so the UI has
 * meaningful content to show on first run: demo users, README history,
 * chat sessions, contributions heatmap, notifications, issues and plans.
 */
export const MOCK_PLANS = [
  {
    name: "Free",
    description: "Basic plan for individuals",
    priceMonthly: 0,
    maxReadmesPerMonth: 5,
    features: ["5 READMEs/month", "AI chat assistant", "Markdown export", "Repo analysis (public)"],
  },
  {
    name: "Pro",
    description: "For power users and serious developers",
    priceMonthly: 9.99,
    maxReadmesPerMonth: 50,
    features: ["50 READMEs/month", "Private repo analysis", "Priority AI chat", "Custom badge styles", "README history"],
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    priceMonthly: 29.99,
    maxReadmesPerMonth: -1,
    features: ["Unlimited READMEs", "Team workspaces", "Custom branding", "API access", "Dedicated support"],
  },
];

export const MOCK_DEMO_USER = {
  email: "demo@readmeai.dev",
  password: "demo123456",
  displayName: "Demo Developer",
  bio: "Full-stack developer exploring AI tooling. Loves clean docs.",
  githubUsername: "octocat",
  isAdmin: false,
};

export const MOCK_ADMIN_USER = {
  email: "admin@readmeai.local",
  password: "admin12345",
  displayName: "Administrator",
  isAdmin: true,
};

export const MOCK_READMES = (userId: string) => [
  {
    user: userId,
    repoName: "nebula-dashboard",
    repoFullName: "octocat/nebula-dashboard",
    repoUrl: "https://github.com/octocat/nebula-dashboard",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    model: "gemini-2.0-flash",
    createdAt: daysAgoDate(0),
    content: `# 🚀 Nebula Dashboard

![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

> A real-time analytics dashboard with beautiful visualizations.

## 📋 About

Nebula Dashboard aggregates metrics from multiple sources and renders them in
real time with charts, filters and alerts.

## ✨ Features

- 📊 Live charts with WebSocket updates
- 🔔 Threshold alerts
- 🌓 Dark mode
- 📱 Fully responsive
`,
  },
  {
    user: userId,
    repoName: "snippy-cli",
    repoFullName: "octocat/snippy-cli",
    repoUrl: "https://github.com/octocat/snippy-cli",
    technologies: ["Node.js", "TypeScript"],
    model: "template-fallback",
    createdAt: daysAgoDate(1),
    content: `# ✂️ Snippy CLI

> Manage your code snippets from the terminal.

## 🚀 Usage

\`\`\`bash
snippy add "my snippet" --lang ts
snippy search react
\`\`\`
`,
  },
  {
    user: userId,
    repoName: "pulse-api",
    repoFullName: "octocat/pulse-api",
    repoUrl: "https://github.com/octocat/pulse-api",
    technologies: ["Express", "MongoDB", "Node.js"],
    model: "gemini-2.0-flash",
    createdAt: daysAgoDate(3),
    content: `# 💓 Pulse API

> Health-check and uptime monitoring REST API.

## 📦 Installation

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
  },
];

export const MOCK_CHAT_MESSAGES = (userId: string) => [
  {
    user: userId,
    sessionId: "mock-session-1",
    role: "user" as const,
    content: "What sections should a professional README have?",
    createdAt: hoursAgoDate(2),
  },
  {
    user: userId,
    sessionId: "mock-session-1",
    role: "assistant" as const,
    content: `A professional README usually includes, in this order:

1. **Title + badges** — \`# Project\` plus shields.io badges
2. **Tagline** — one-line \`> quote\`
3. **About** — 2-4 sentences
4. **Features** — emoji bullets
5. **Tech Stack**
6. **Installation** — numbered steps with bash blocks
7. **Usage** — real examples
8. **Configuration** — env table
9. **Project Structure** — directory tree
10. **Contributing & License**

Want me to generate one for your project? Use the Generate page! 🚀`,
    createdAt: hoursAgoDate(2),
  },
];

export const MOCK_CONTRIBUTIONS = (userId: string) => {
  const days: { user: string; activityDate: string; count: number }[] = [];
  const pattern = [1, 0, 2, 3, 1, 0, 0, 4, 2, 1, 5, 2, 0, 1, 3, 2, 6, 1, 0, 2, 4, 3, 1, 0, 2, 7, 3, 2];
  pattern.forEach((count, i) => {
    if (count > 0) {
      days.push({ user: userId, activityDate: daysAgoDate(pattern.length - 1 - i), count });
    }
  });
  return days;
};

export const MOCK_NOTIFICATIONS = (userId: string) => [
  {
    user: userId,
    title: "Welcome to ReadMeAI! 🎉",
    message: "Connect your GitHub and generate your first professional README today.",
    type: "info",
    read: false,
    createdAt: hoursAgoDate(1),
  },
  {
    user: userId,
    title: "Pro tip 💡",
    message: "Add your Gemini API key in server/.env to unlock full AI-powered generation.",
    type: "success",
    read: false,
    createdAt: daysAgoDate(1),
  },
];

export const MOCK_ISSUES = (userId: string) => [
  {
    user: userId,
    title: "Dark mode toggle flickers on load",
    description: "When refreshing the page, the theme briefly flashes light before switching to dark.",
    status: "open",
    priority: "medium",
    createdAt: daysAgoDate(2),
  },
  {
    user: userId,
    title: "Add export to PDF option",
    description: "It would be great to export the generated README as a styled PDF.",
    status: "in_progress",
    priority: "low",
    createdAt: daysAgoDate(5),
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function hoursAgoDate(hours: number): Date {
  return new Date(Date.now() - hours * 3600 * 1000);
}
