import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Loader2, Eye, Copy, Download, Check, FileText, RefreshCw, Bot, Sparkle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PreviewModal from "@/components/PreviewModal";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Generate = () => {
  const [params] = useSearchParams();
  const repoName = params.get("repo") || "";
  const fullName = params.get("full_name") || "";
  const repoUrl = params.get("url") || "";
  const { user } = useAuth();

  const [name, setName] = useState(repoName);
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (repoName) setName(repoName);
  }, [repoName]);

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a project name", { position: "bottom-center" });
      return;
    }
    setLoading(true);
    setMarkdown("");
    try {
      const data = await api.post<{ readme: string; model: string; technologies: string[]; analyzed: boolean }>(
        "/readmes/generate",
        {
          projectName: name,
          description,
          techStack,
          repoFullName: fullName,
          repoUrl,
        }
      );
      setMarkdown(data.readme);
      setModel(data.model);
      toast.success(
        data.model === "template-fallback"
          ? "README generated with template (AI key not configured)"
          : "README generated successfully! 🎉",
        { position: "bottom-center" }
      );
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Generation failed", { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Copied to clipboard!", { position: "bottom-center" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("README downloaded!", { position: "bottom-center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-black text-foreground mb-2">
            Generate <span className="text-gradient">README</span>
          </h1>
          <p className="text-muted-foreground">
            {fullName ? `Analyzing ${fullName} from GitHub` : "Fill in your project details and let AI do the rest"}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="clay p-8 mb-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Project Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-awesome-project" className="clay-inset border-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your project..." className="clay-inset border-none min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Tech Stack</label>
              <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, TypeScript, Node.js, PostgreSQL..." className="clay-inset border-none" />
            </div>
            {fullName && (
              <div className="clay-sm p-3 text-sm text-muted-foreground flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-primary flex-shrink-0" />
                Connected to <span className="font-semibold text-foreground">{fullName}</span> — AI will analyze the actual code, structure and dependencies.
              </div>
            )}
            <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleGenerate} disabled={loading}>
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Analyzing & generating...</> : <><Sparkles className="h-5 w-5" />Generate README</>}
            </Button>
          </div>
        </motion.div>

        {markdown && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-display font-bold text-foreground">Generated README</h2>
                  {model && <p className="text-xs text-muted-foreground">via {model}</p>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setChatOpen(true)} title="Improve with AI chat"><Bot className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4" /></Button>
                <Button variant="clay" size="sm" onClick={handleCopy} className="gap-1">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="hero" size="sm" onClick={handleDownload} className="gap-1"><Download className="h-4 w-4" />Download</Button>
              </div>
            </div>
            <pre className="clay-inset p-4 rounded-xl text-sm font-mono text-foreground whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto">{markdown}</pre>
          </motion.div>
        )}
      </div>
      <Footer />
      <PreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} markdown={markdown} repoName={name} />
      {chatOpen && <ChatDrawer repoName={name} onClose={() => setChatOpen(false)} onApply={setMarkdown} />}
    </div>
  );
};

// Inline chat drawer for refining the generated README
const ChatDrawer = ({ repoName, onClose, onApply }: { repoName: string; onClose: () => void; onApply: (md: string) => void }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: `Hi! I can help refine the README for **${repoName}**. What would you like to change?` },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`gen-${repoName}-${Date.now()}`);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || sending) return;
    setSending(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    try {
      const data = await api.post<{ reply: string }>("/chat", { sessionId: sessionId.current, message: msg, repoName });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      // If the reply contains a full README (starts with # title), offer to apply
      if (data.reply.trimStart().startsWith("# ")) {
        onApply(data.reply);
        toast.success("README updated from chat!", { position: "bottom-center" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chat failed", { position: "bottom-center" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        className="w-full max-w-md h-full bg-background clay-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-foreground">README Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-hero text-primary-foreground" : "clay-inset text-foreground"}`}>
                {m.content.length > 1200 ? m.content.slice(0, 1200) + "…" : m.content}
              </div>
            </div>
          ))}
          {sending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="e.g. Add a badges section for React and Node"
            className="clay-inset border-none"
          />
          <Button variant="hero" size="icon" onClick={() => send()} disabled={sending}><Send className="h-4 w-4" /></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Generate;
