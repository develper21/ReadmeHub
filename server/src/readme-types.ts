export interface RepoContext {
  name: string;
  fullName?: string;
  description?: string;
  url?: string;
  language?: string;
  stars?: number;
  forks?: number;
  license?: string | null;
  defaultBranch?: string;
  topics?: string[];
  files?: { path: string; content: string }[];
  detectedTech?: string[];
  fileTree?: string[];
}

export interface TechStack {
  language?: string;
  frameworks?: string[];
  packageManager?: string;
  runCommand?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeneratedReadme {
  readme: string;
  model: string;
  technologies: string[];
}
