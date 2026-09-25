/**
 * OpenAI AI service (REST, no SDK needed).
 * - generateReadme: professional README.md generation
 * - chat: conversational README assistant (used by the Chat page)
 * Both fall back to deterministic templates when OPENAI_API_KEY is absent.
 */
import type { ChatMessage, RepoContext, GeneratedReadme } from "./readme-types.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const aiConfigured = () => Boolean(process.env.OPENAI_API_KEY);

async function openaiChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw Object.assign(
      new Error(`OpenAI API error ${res.status}: ${text.slice(0, 300)}`),
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Professional README format (shared by AI prompt AND fallback template)
// ─────────────────────────────────────────────────────────────────────────────
export const README_FORMAT_SPEC = `Structure the README in EXACTLY this professional format, section by section:

1. "# <emoji> <Project Name>" — one-line H1 title with a relevant emoji.
2. Badges row: shields.io badges for the main technologies, e.g.
   ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
   (style=for-the-badge, real logo slugs, 3-7 badges max).
3. One-line blockquote tagline "> ..." describing the project.
4. "## 📋 About" — 2-4 sentence description of what the project does and why it exists.
5. "## ✨ Features" — bullet list with emoji per feature (6-10 bullets).
6. "## 🛠️ Tech Stack" — grouped bullets or small table (language, frameworks, tools, database...).
7. "## 📦 Installation" — numbered steps with bash code blocks (clone, install deps, env setup, run).
8. "## 🚀 Usage" — at least one realistic code/command block plus short explanation; screenshots section placeholder if useful.
9. "## ⚙️ Configuration" — table of environment variables/config options (Name | Description | Default).
10. "## 📁 Project Structure" — fenced tree of the actual directory layout.
11. "## 🤝 Contributing" — short fork/branch/PR steps.
12. "## 📄 License" — license name with link (default MIT).
13. Footer: "---" separator + "Made with ❤️ by <author>".

Rules:
- Proper GitHub-flavored Markdown only: headers, tables, fenced code blocks with language tags.
- Use the REAL project structure, commands and dependencies from the provided context when available.
- Do NOT invent features that contradict the code. If info is missing, use sensible placeholders.
- Never wrap the whole output in markdown fences. Output raw Markdown only.`;

export function detectTechnologies(ctx: RepoContext): string[] {
  const tech = new Set<string>();
  const add = (t: string) => tech.add(t);

  const files = ctx.files ?? [];
  const paths = files.map((f) => f.path.toLowerCase());
  const has = (suffix: string) =>
    paths.some((p) => p.endsWith(suffix) || p.includes(`/${suffix}`));
  const contents = files
    .map((f) => f.content)
    .join("\n")
    .slice(0, 200_000);

  if (has("package.json")) {
    add("Node.js");
    try {
      const pkg = JSON.parse(
        files.find((f) => f.path.endsWith("package.json"))!.content
      );
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const map: Record<string, string> = {
        react: "React",
        "react-dom": "React",
        next: "Next.js",
        vue: "Vue.js",
        svelte: "Svelte",
        "@angular/core": "Angular",
        express: "Express",
        fastify: "Fastify",
        nestjs: "NestJS",
        typescript: "TypeScript",
        tailwindcss: "Tailwind CSS",
        prisma: "Prisma",
        "better-sqlite3": "SQLite",
        mongoose: "MongoDB",
        "react-native": "React Native",
        electron: "Electron",
        vite: "Vite",
        jest: "Jest",
        vitest: "Vitest",
      };
      for (const [dep, label] of Object.entries(map)) if (deps[dep]) add(label);
    } catch {
      /* ignore malformed package.json */
    }
  }
  if (has("requirements.txt") || has("pyproject.toml")) {
    add("Python");
    if (contents.includes("django")) add("Django");
    if (contents.includes("flask")) add("Flask");
    if (contents.includes("fastapi")) add("FastAPI");
  }
  if (has("cargo.toml")) add("Rust");
  if (has("go.mod")) add("Go");
  if (has("pom.xml") || has("build.gradle")) add("Java");
  if (has("composer.json")) add("PHP");
  if (has("gemfile")) add("Ruby");
  if (has("dockerfile")) add("Docker");
  if (contents.includes("docker-compose")) add("Docker Compose");
  if (ctx.language) add(ctx.language);

  return Array.from(tech).slice(0, 12);
}

function badgeLine(tech: string[]): string {
  const logoMap: Record<string, string> = {
    React: "react",
    "Next.js": "nextdotjs",
    Vue: "vuedotjs",
    Svelte: "svelte",
    Angular: "angular",
    Express: "express",
    TypeScript: "typescript",
    JavaScript: "javascript",
    "Node.js": "nodedotjs",
    Python: "python",
    Django: "django",
    Flask: "flask",
    FastAPI: "fastapi",
    Rust: "rust",
    Go: "go",
    Java: "openjdk",
    PHP: "php",
    Ruby: "ruby",
    Docker: "docker",
    "Docker Compose": "docker",
    SQLite: "sqlite",
    Prisma: "prisma",
    MongoDB: "mongodb",
    PostgreSQL: "postgresql",
    MySQL: "mysql",
    "Tailwind CSS": "tailwindcss",
    Vite: "vite",
    Electron: "electron",
    "React Native": "react",
    Kotlin: "kotlin",
    Swift: "swift",
    Dart: "dart",
    Flutter: "flutter",
  };
  return tech
    .slice(0, 7)
    .map((t) => {
      const slug = logoMap[t] || "";
      const color = "20232A";
      const logoPart = slug ? `&logo=${slug}&logoColor=white` : "";
      return `![${t}](https://img.shields.io/badge/${encodeURIComponent(
        t
      )}-${color}?style=for-the-badge${logoPart})`;
    })
    .join(" ");
}

function treeBlock(ctx: RepoContext): string {
  if (ctx.fileTree?.length) {
    return "```\n" + ctx.fileTree.slice(0, 30).join("\n") + "\n```";
  }
  return (
    "```\n" +
    `${ctx.name}/\n├── src/\n│   ├── components/\n│   ├── pages/\n│   └── utils/\n├── public/\n├── package.json\n└── README.md` +
    "\n```"
  );
}

/** Deterministic fallback README using the same professional format spec. */
export function fallbackReadme(
  ctx: RepoContext,
  techInput = "",
  author = "the author"
): GeneratedReadme {
  const tech = ctx.detectedTech?.length
    ? ctx.detectedTech
    : detectTechnologies(ctx).length
      ? detectTechnologies(ctx)
      : techInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

  const description = ctx.description || "A project built with modern technologies.";
  const license = ctx.license || "MIT";

  const configTable = tech.includes("Node.js")
    ? `| Variable | Description | Default |\n|----------|-------------|---------|\n| \`PORT\` | Port the server listens on | \`3000\` |\n| \`API_KEY\` | External API key | — |`
    : `| Variable | Description | Default |\n|----------|-------------|---------|\n| \`ENV\` | Runtime environment | \`development\` |`;

  const runCmd = tech.includes("Python") ? "python main.py" : "npm run dev";
  const installCmd = tech.includes("Python")
    ? "pip install -r requirements.txt"
    : "npm install";

  const readme = `# 🚀 ${ctx.name}

${badgeLine(tech)}

> ${description}

## 📋 About

${description}

## ✨ Features

- ✨ Modern, developer-friendly design
- 🚀 Quick setup — running locally in under 5 minutes
- 🔧 Configurable via environment variables
- 📦 ${tech.length ? `Built with ${tech.slice(0, 3).join(", ")}` : "Minimal dependency footprint"}
- 📝 Well-documented with a professional README (this one!)
- 🤝 Open to contributions

## 🛠️ Tech Stack

${tech.length ? tech.map((t) => `- **${t}**`).join("\n") : "- See repository for details"}

## 📦 Installation

1. Clone the repository

\`\`\`bash
git clone ${ctx.url || `https://github.com/user/${ctx.name}.git`}
cd ${ctx.name}
\`\`\`

2. Install dependencies

\`\`\`bash
${installCmd}
\`\`\`

3. Configure environment variables

\`\`\`bash
cp .env.example .env
\`\`\`

4. Start the development server

\`\`\`bash
${runCmd}
\`\`\`

## 🚀 Usage

Once running, open the app and explore its main features:

\`\`\`bash
${runCmd}
\`\`\`

## ⚙️ Configuration

${configTable}

## 📁 Project Structure

${treeBlock(ctx)}

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing\`)
5. Open a Pull Request

## 📄 License

Distributed under the ${license} License. See \`LICENSE\` for more information.

---

Made with ❤️ by ${author}`;

  return { readme, model: "template-fallback", technologies: tech };
}

// ─────────────────────────────────────────────────────────────────────────────
// README generation via OpenAI
// ─────────────────────────────────────────────────────────────────────────────
export async function generateReadmeWithAI(
  ctx: RepoContext,
  techInput = "",
  author = "the author"
): Promise<GeneratedReadme> {
  const detected = detectTechnologies(ctx);
  const technologies = detected.length
    ? detected
    : techInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  const repoFacts = [
    `Project name: ${ctx.name}`,
    ctx.fullName ? `Repository: ${ctx.fullName}` : "",
    ctx.description ? `Description: ${ctx.description}` : "",
    ctx.language ? `Primary language: ${ctx.language}` : "",
    ctx.topics?.length ? `Topics: ${ctx.topics.join(", ")}` : "",
    typeof ctx.stars === "number" ? `Stars: ${ctx.stars}, Forks: ${ctx.forks ?? "?"}` : "",
    ctx.license ? `License: ${ctx.license}` : "",
    techInput ? `User-specified tech: ${techInput}` : "",
    detected.length ? `Detected technologies: ${detected.join(", ")}` : "",
    ctx.fileTree?.length ? `Directory tree:\n${ctx.fileTree.slice(0, 40).join("\n")}` : "",
    ctx.files?.length
      ? `Key files (path -> excerpt):\n${ctx.files
          .map((f) => `--- ${f.path} ---\n${f.content.slice(0, 2500)}`)
          .join("\n\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `Generate a complete professional README.md for this project.\n\nPROJECT CONTEXT:\n${repoFacts}\n\n${README_FORMAT_SPEC}`;

  let ai: string | null = null;
  try {
    ai = await openaiChat(
      "You are an expert technical writer who produces polished, professional GitHub README.md files.",
      userPrompt
    );
  } catch (err) {
    console.error("[ai] OpenAI generation failed, using fallback:", (err as Error).message);
  }

  if (ai && ai.trim().length > 200) {
    return { readme: ai.trim(), model: MODEL, technologies };
  }
  // AI unavailable or output too short -> template fallback (same professional format)
  const fb = fallbackReadme(ctx, techInput, author);
  return { ...fb, technologies: technologies.length ? technologies : fb.technologies };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Chat assistant (README helper)
// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithAI(
  messages: ChatMessage[],
  opts: { repoName?: string; repoContext?: RepoContext } = {}
): Promise<{ reply: string; model: string }> {
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const systemPrompt = `You are "ReadMeAI Assistant" — an expert documentation helper inside a README generator app.
You help users write, improve and fix README.md files and answer questions about documentation best practices.
When the user asks for a README or section, reply with proper GitHub-flavored Markdown (badges, tables, fenced code blocks).
${opts.repoName ? `The user is currently working on a project called "${opts.repoName}".` : ""}
${opts.repoContext ? `Project context you may use:\n${JSON.stringify({ name: opts.repoContext.name, description: opts.repoContext.description, language: opts.repoContext.language, detectedTech: opts.repoContext.detectedTech }, null, 0)}` : ""}
Be concise, friendly and practical. Format answers in Markdown.`;

  const transcript = messages
    .slice(-12)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  let ai: string | null = null;
  try {
    ai = await openaiChat(systemPrompt, transcript);
  } catch (err) {
    console.error("[ai] OpenAI chat failed, using offline reply:", (err as Error).message);
  }

  if (ai && ai.trim()) {
    return { reply: ai.trim(), model: MODEL };
  }

  return {
    reply: `I'm running in offline mode (no AI key configured), but here's what I can suggest for **${opts.repoName || "your project"}**:

A strong README should include, in order:

1. **Title + badges** — \`# Project\` plus shields.io badges for your stack.
2. **Tagline** — a one-line \`> quote\` summarizing the app.
3. **About** — 2-4 sentences on what it does and why.
4. **Features** — bullet list with emojis.
5. **Tech Stack** — grouped by language/framework/database.
6. **Installation** — numbered steps with bash blocks.
7. **Usage** — real command examples.
8. **Configuration** — env-variable table.
9. **Project Structure** — directory tree.
10. **Contributing & License** — PR steps + license.

Your question was: _"${lastUser.slice(0, 200)}"_

Generate a full README from the **Generate** page — it always produces this format, even offline!`,
    model: "offline-assistant",
  };
}
