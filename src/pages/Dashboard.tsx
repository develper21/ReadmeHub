import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, LayoutGrid, List, GitBranch, Star, GitFork, Loader2, Github, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RepoCard from "@/components/RepoCard";
import { useNavigate } from "react-router-dom";
import { api, GITHUB_CONNECT_URL, type Repo } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadRepos = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ repos: Repo[]; connected: boolean }>("/github/repos");
      setRepos(data.repos);
      setConnected(data.connected);
    } catch (err) {
      if (err instanceof Error && err.message.includes("GITHUB_NOT_CONNECTED")) {
        setConnected(false);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to load repositories", { position: "bottom-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadRepos();
    else setLoading(false);
  }, [user]);

  const languages = useMemo(() => {
    const langs = new Set(repos.map((r) => r.language).filter(Boolean));
    return Array.from(langs) as string[];
  }, [repos]);

  const filtered = useMemo(() => {
    return repos.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase());
      const matchLang = !langFilter || r.language === langFilter;
      return matchSearch && matchLang;
    });
  }, [repos, search, langFilter]);

  const totalStars = repos.reduce((a, r) => a + r.stargazersCount, 0);
  const totalForks = repos.reduce((a, r) => a + r.forksCount, 0);

  const handleGenerate = (repo: Repo) => {
    navigate(`/generate?repo=${encodeURIComponent(repo.name)}&full_name=${encodeURIComponent(repo.fullName)}&url=${encodeURIComponent(repo.htmlUrl)}`);
  };

  const handleConnect = () => {
    window.location.href = GITHUB_CONNECT_URL;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
        {!connected && !loading ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-hero flex items-center justify-center mx-auto mb-4">
              <Github className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Connect your GitHub</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Link your GitHub account to fetch your repositories and generate AI-powered READMEs for them.
            </p>
            <Button variant="hero" size="lg" className="gap-2" onClick={handleConnect}>
              <Github className="h-5 w-5" />
              Connect GitHub
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: GitBranch, value: repos.length, label: "Repositories" },
                { icon: Star, value: totalStars.toLocaleString(), label: "Total Stars" },
                { icon: GitFork, value: totalForks, label: "Total Forks" },
                { icon: FileText, value: "—", label: "READMEs Generated" },
              ].map((s) => (
                <div key={s.label} className="clay p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-hero flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Search & Filter */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="clay p-4 mb-8 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 clay-inset border-none" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={langFilter === null ? "default" : "ghost"} size="sm" onClick={() => setLangFilter(null)}>
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  All
                </Button>
                {languages.map((lang) => (
                  <Button key={lang} variant={langFilter === lang ? "default" : "ghost"} size="sm" onClick={() => setLangFilter(langFilter === lang ? null : lang)}>
                    {lang}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 clay-sm p-1">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={loadRepos} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Repo grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
                {filtered.map((repo, i) => (
                  <RepoCard key={repo.id} repo={repo} onGenerate={handleGenerate} index={i} />
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="clay p-12 text-center">
                <p className="text-muted-foreground font-body">No repositories match your search.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
