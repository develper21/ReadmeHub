import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, GitBranch, BookOpen, Calendar, Mail, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContributionGraph from "@/components/ContributionGraph";
import { useAuth } from "@/hooks/useAuth";
import { api, type Profile } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contributions, setContributions] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ profile: Profile; contributions: { date: string; count: number }[] }>("/user/profile")
      .then((d) => {
        setProfile(d.profile);
        setContributions(d.contributions);
      })
      .catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const initials = (profile?.displayName || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 shadow-[var(--clay-shadow)]">
              <AvatarImage src={profile?.avatarUrl || user.avatarUrl || ""} />
              <AvatarFallback className="bg-hero text-primary-foreground text-2xl font-display font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display font-bold text-2xl text-foreground">{profile?.displayName || "User"}</h1>
              {profile?.bio && <p className="text-muted-foreground text-sm mt-1">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                {profile?.githubUsername && (
                  <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />@{profile.githubUsername}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: BookOpen, value: profile?.stats.readmeCount ?? 0, label: "READMEs Generated" },
            { icon: Users, value: profile?.stats.followers ?? 0, label: "Followers" },
            { icon: Users, value: profile?.stats.following ?? 0, label: "Following" },
            { icon: GitBranch, value: profile?.stats.publicRepos ?? 0, label: "Public Repos" },
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

        {/* Contribution Graph */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ContributionGraph data={contributions} />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
