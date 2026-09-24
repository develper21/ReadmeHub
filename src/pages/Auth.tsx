import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, Loader2, FileText, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, GITHUB_CONNECT_URL, type User } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin ? { email, password } : { email, password, displayName };
      const data = await api.post<{ user: User }>(path, body);
      toast.success(isLogin ? "Welcome back!" : "Account created! 🎉", { position: "bottom-center" });
      navigate("/dashboard");
      void data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = () => {
    // Backend route starts the GitHub OAuth flow (also acts as pure GitHub sign-in)
    window.location.href = GITHUB_CONNECT_URL;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay p-8 w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-hero flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            ReadMe<span className="text-gradient">AI</span>
          </span>
        </Link>

        <h2 className="font-display font-bold text-2xl text-center text-foreground mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isLogin ? "Sign in to your account" : "Sign up to get started"}
        </p>

        <Button variant="clay" className="w-full gap-2 mb-4" onClick={handleGitHub}>
          <Github className="h-4 w-4" />
          Continue with GitHub
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 clay-inset border-none"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 clay-inset border-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 clay-inset border-none"
              required
              minLength={6}
            />
          </div>
          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
