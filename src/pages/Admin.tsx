import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, AlertCircle, Bell, CreditCard, Shield, BarChart3, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { api, type Issue, type Plan, type User } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminReadme {
  id: string;
  repo_name: string;
  repo_full_name: string | null;
  technologies: string[];
  model: string | null;
  created_at: string;
  email: string;
}

interface AdminStats {
  users: number;
  readmes: number;
  openIssues: number;
  activePlans: number;
  chats: number;
}

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<(User & { is_admin?: number })[]>([]);
  const [readmes, setReadmes] = useState<AdminReadme[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [notifForm, setNotifForm] = useState({ userId: "", title: "", message: "", type: "info" });
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin-login");
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const load = async () => {
      try {
        const [statsRes, usersRes, readmesRes, issuesRes, plansRes] = await Promise.all([
          api.get<{ stats: AdminStats }>("/admin/stats"),
          api.get<{ users: User[] }>("/admin/users"),
          api.get<{ readmes: AdminReadme[] }>("/admin/readmes"),
          api.get<{ issues: Issue[] }>("/admin/issues"),
          api.get<{ plans: Plan[] }>("/user/plans"),
        ]);
        setStats(statsRes.stats);
        setUsers(usersRes.users);
        setReadmes(readmesRes.readmes);
        setIssues(issuesRes.issues);
        setPlans(plansRes.plans);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load admin data", { position: "bottom-center" });
      }
    };
    load();
  }, [user, isAdmin]);

  const sendNotification = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setSendingNotif(true);
    try {
      const d = await api.post<{ sent: number }>("/admin/notifications", notifForm);
      toast.success(`Notification sent to ${d.sent} user(s)!`, { position: "bottom-center" });
      setNotifForm({ userId: "", title: "", message: "", type: "info" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send", { position: "bottom-center" });
    } finally {
      setSendingNotif(false);
    }
  };

  const updateIssueStatus = async (id: string, status: string) => {
    await api.patch(`/admin/issues/${id}`, { status });
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    toast.success(`Issue marked as ${status}`, { position: "bottom-center" });
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-hero flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { icon: Users, value: stats?.users ?? "…", label: "Total Users" },
            { icon: FileText, value: stats?.readmes ?? "…", label: "READMEs" },
            { icon: Bot, value: stats?.chats ?? "…", label: "Chat Messages" },
            { icon: AlertCircle, value: stats?.openIssues ?? "…", label: "Open Issues" },
            { icon: CreditCard, value: stats?.activePlans ?? "…", label: "Active Plans" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clay p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-hero flex items-center justify-center flex-shrink-0">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="clay-sm mb-6 flex-wrap">
            <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="readmes"><FileText className="h-3.5 w-3.5 mr-1" />READMEs</TabsTrigger>
            <TabsTrigger value="issues"><AlertCircle className="h-3.5 w-3.5 mr-1" />Issues</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-3.5 w-3.5 mr-1" />Notifications</TabsTrigger>
            <TabsTrigger value="plans"><CreditCard className="h-3.5 w-3.5 mr-1" />Plans</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="clay p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-semibold">User</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Email</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">GitHub</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Role</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">Joined</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{u.displayName || "—"}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3 text-muted-foreground">{u.githubUsername || "—"}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isAdmin ? "bg-hero text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {u.isAdmin ? "admin" : "user"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="readmes">
            <div className="space-y-3">
              {readmes.map((r) => (
                <div key={r.id} className="clay p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-foreground">{r.repo_name}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">by {r.email} • via {r.model || "unknown"}</p>
                  {r.technologies?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">{r.technologies.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}</div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="clay p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-foreground text-sm">{issue.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${issue.status === "open" ? "bg-accent text-accent-foreground" : issue.status === "resolved" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{issue.status}</span>
                    </div>
                    <div className="flex gap-1">
                      {issue.status === "open" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => updateIssueStatus(issue.id, "in_progress")}>In Progress</Button>
                          <Button size="sm" variant="default" onClick={() => updateIssueStatus(issue.id, "resolved")}>Resolve</Button>
                        </>
                      )}
                    </div>
                  </div>
                  {issue.description && <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="clay p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground">Send Notification</h3>
              <Input placeholder="User ID (leave empty for all users)" value={notifForm.userId} onChange={(e) => setNotifForm({ ...notifForm, userId: e.target.value })} className="clay-inset border-none" />
              <Input placeholder="Title" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} className="clay-inset border-none" />
              <Textarea placeholder="Message" value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} className="clay-inset border-none" />
              <div className="flex gap-2">
                {["info", "success", "warning", "error"].map((t) => (
                  <Button key={t} variant={notifForm.type === t ? "default" : "ghost"} size="sm" onClick={() => setNotifForm({ ...notifForm, type: t })} className="capitalize">{t}</Button>
                ))}
              </div>
              <Button variant="hero" onClick={sendNotification} disabled={sendingNotif} className="gap-2">
                {sendingNotif ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Notification
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="clay p-6">
                  <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="text-3xl font-display font-black text-gradient mt-3">
                    ${plan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-sm text-muted-foreground">✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="clay p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-display font-bold text-foreground">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.users ?? 0} users • {stats?.readmes ?? 0} READMEs generated • {stats?.chats ?? 0} chat messages • {stats?.openIssues ?? 0} open issues
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="clay-sm p-4">
                  <h4 className="font-display font-bold text-foreground text-sm mb-2">Daily Activity</h4>
                  <div className="h-32 flex items-end gap-1">
                    {Array.from({ length: 14 }, (_, i) => {
                      const h = Math.random() * 100 + 10;
                      return <div key={i} className="flex-1 bg-primary/40 rounded-t-md transition-all hover:bg-primary" style={{ height: `${h}%` }} />;
                    })}
                  </div>
                </div>
                <div className="clay-sm p-4">
                  <h4 className="font-display font-bold text-foreground text-sm mb-2">AI Usage</h4>
                  <div className="h-32 flex items-end gap-1">
                    {Array.from({ length: 14 }, (_, i) => {
                      const h = Math.random() * 100 + 10;
                      return <div key={i} className="flex-1 bg-accent/60 rounded-t-md transition-all hover:bg-accent" style={{ height: `${h}%` }} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
