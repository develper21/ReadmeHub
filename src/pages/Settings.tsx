import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Plus, AlertCircle, Github, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { api, GITHUB_CONNECT_URL, type Issue, type Notification } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ displayName: "", bio: "", githubUsername: "", avatarUrl: "" });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", priority: "medium" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get<{ profile: { displayName: string; bio: string; githubUsername: string; avatarUrl: string } }>("/user/profile").then((d) => {
      setProfile({
        displayName: d.profile.displayName || "",
        bio: d.profile.bio || "",
        githubUsername: d.profile.githubUsername || "",
        avatarUrl: d.profile.avatarUrl || "",
      });
    });
    api.get<{ issues: Issue[] }>("/user/issues").then((d) => setIssues(d.issues));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/user/profile", {
        displayName: profile.displayName,
        bio: profile.bio,
        githubUsername: profile.githubUsername,
        avatarUrl: profile.avatarUrl,
      });
      toast.success("Profile updated!", { position: "bottom-center" });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save", { position: "bottom-center" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!newIssue.title.trim()) return;
    try {
      const d = await api.post<{ issue: Issue }>("/user/issues", newIssue);
      setIssues([d.issue, ...issues]);
      setNewIssue({ title: "", description: "", priority: "medium" });
      toast.success("Issue submitted!", { position: "bottom-center" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit", { position: "bottom-center" });
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await api.post("/github/disconnect");
      toast.success("GitHub disconnected", { position: "bottom-center" });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", { position: "bottom-center" });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-foreground mb-6">Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="clay-sm mb-6 w-full sm:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Display Name</label>
                <Input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} className="clay-inset border-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Bio</label>
                <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="clay-inset border-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">GitHub Username</label>
                <Input value={profile.githubUsername} onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })} className="clay-inset border-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Avatar URL</label>
                <Input value={profile.avatarUrl} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} className="clay-inset border-none" />
              </div>
              <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="github">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-hero flex items-center justify-center">
                  <Github className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">GitHub Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.githubUsername ? `Connected as @${user.githubUsername}` : "Not connected"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting GitHub lets the AI analyze your actual repositories — code structure, dependencies and
                docs — to generate accurate READMEs. We request read-only access plus the ability to read your repos.
              </p>
              {user.githubUsername ? (
                <Button variant="destructive" onClick={handleDisconnectGitHub} className="gap-2">
                  <Unlink className="h-4 w-4" /> Disconnect GitHub
                </Button>
              ) : (
                <Button variant="hero" onClick={() => (window.location.href = GITHUB_CONNECT_URL)} className="gap-2">
                  <Link2 className="h-4 w-4" /> Connect GitHub
                </Button>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="issues">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="clay p-6 space-y-4">
                <h3 className="font-display font-bold text-foreground">Report an Issue</h3>
                <Input placeholder="Issue title" value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} className="clay-inset border-none" />
                <Textarea placeholder="Describe the issue..." value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} className="clay-inset border-none" />
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((p) => (
                    <Button key={p} variant={newIssue.priority === p ? "default" : "ghost"} size="sm" onClick={() => setNewIssue({ ...newIssue, priority: p })} className="capitalize">{p}</Button>
                  ))}
                </div>
                <Button variant="hero" onClick={handleSubmitIssue} className="gap-2"><Plus className="h-4 w-4" />Submit Issue</Button>
              </div>

              {issues.map((issue) => (
                <div key={issue.id} className="clay p-4 flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${issue.status === "open" ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-foreground text-sm">{issue.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${issue.status === "open" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{issue.status}</span>
                      <span className="text-xs text-muted-foreground capitalize">{issue.priority}</span>
                    </div>
                    {issue.description && <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.get<{ notifications: Notification[] }>("/user/notifications").then((d) => setNotifications(d.notifications));
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/user/notifications/${id}/read`);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {notifications.length === 0 && (
        <div className="clay p-8 text-center text-muted-foreground">No notifications yet</div>
      )}
      {notifications.map((n) => (
        <div key={n.id} className={`clay p-4 cursor-pointer transition-opacity ${n.read ? "opacity-60" : ""}`} onClick={() => !n.read && markRead(n.id)}>
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-foreground">{n.title}</h4>
            {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
        </div>
      ))}
    </motion.div>
  );
};

export default Settings;
