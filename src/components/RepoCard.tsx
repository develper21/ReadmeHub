import { motion } from "framer-motion";
import { Star, GitFork, AlertCircle, Lock, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Repo } from "@/lib/api";

export type { Repo };

const langColors: Record<string, string> = {
  TypeScript: "hsl(210 80% 55%)",
  JavaScript: "hsl(50 90% 50%)",
  Python: "hsl(210 60% 45%)",
  Java: "hsl(20 80% 50%)",
  Go: "hsl(190 70% 45%)",
  Rust: "hsl(20 60% 40%)",
  Ruby: "hsl(0 70% 50%)",
  PHP: "hsl(240 50% 55%)",
  CSS: "hsl(270 50% 55%)",
  HTML: "hsl(15 80% 55%)",
  C: "hsl(200 30% 45%)",
  "C++": "hsl(340 60% 50%)",
  "C#": "hsl(120 40% 40%)",
  Swift: "hsl(15 90% 55%)",
  Kotlin: "hsl(270 60% 55%)",
};

interface RepoCardProps {
  repo: Repo;
  onGenerate: (repo: Repo) => void;
  index: number;
}

const RepoCard = ({ repo, onGenerate, index }: RepoCardProps) => {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="clay p-5 flex flex-col gap-3 hover:shadow-[var(--clay-shadow-lg)] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {repo.private ? (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <h3 className="font-display font-bold text-foreground truncate">{repo.name}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
        {repo.description || "No description available"}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: langColors[repo.language] || "hsl(var(--muted-foreground))" }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          {repo.stargazersCount}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          {repo.forksCount}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {repo.openIssuesCount}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-muted-foreground">Updated {timeAgo(repo.updatedAt)}</span>
        <Button
          variant="hero"
          size="sm"
          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onGenerate(repo)}
        >
          Generate
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default RepoCard;
