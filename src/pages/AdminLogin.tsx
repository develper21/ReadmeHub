import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type User } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post<{ user: User }>("/auth/login", { email, password });
      if (!data.user.isAdmin) {
        await api.post("/auth/logout");
        throw new Error("Access denied. Admin privileges required.");
      }
      await refresh();
      toast.success("Welcome, Admin!", { position: "bottom-center" });
      navigate("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-hero flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <h2 className="font-display font-bold text-2xl text-center text-foreground mb-1">Admin Access</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Authorized personnel only</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 clay-inset border-none" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 clay-inset border-none" required />
          </div>
          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
