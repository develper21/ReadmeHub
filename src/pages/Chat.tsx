import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type ChatMsg } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SESSION_KEY = "readmeai_chat_session";

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(localStorage.getItem(SESSION_KEY) || "");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    if (!sessionId.current) {
      sessionId.current = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(SESSION_KEY, sessionId.current);
    }
    api
      .get<{ messages: ChatMsg[] }>(`/chat/${sessionId.current}`)
      .then((d) => {
        if (d.messages.length === 0) {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `Hi ${user.displayName || "there"}! 👋 I'm your README assistant.\n\nAsk me anything about writing better documentation — structure, badges, examples, or paste a section you want improved.`,
            },
          ]);
        } else {
          setMessages(d.messages);
        }
      })
      .catch(() => toast.error("Failed to load chat history", { position: "bottom-center" }))
      .finally(() => setInitializing(false));
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    setInput("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: msg }]);
    try {
      const data = await api.post<{ id: string; reply: string }>("/chat", { sessionId: sessionId.current, message: msg });
      setMessages((m) => [...m, { id: data.id, role: "assistant", content: data.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send", { position: "bottom-center" });
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    try {
      await api.delete(`/chat/${sessionId.current}`);
      setMessages([
        { id: "welcome", role: "assistant", content: "Chat cleared. What would you like help with?" },
      ]);
      toast.success("Chat cleared", { position: "bottom-center" });
    } catch {
      toast.error("Failed to clear chat", { position: "bottom-center" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-24 pb-4 px-4 flex-1 w-full max-w-3xl mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-hero flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">AI Chat</h1>
              <p className="text-xs text-muted-foreground">Your documentation assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1 text-destructive">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto clay-lg p-4 space-y-3 min-h-[400px]">
          {initializing ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-hero flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user" ? "bg-hero text-primary-foreground" : "clay-inset text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="clay-inset rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 mb-6 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about README structure, badges, examples…"
            className="clay-inset border-none"
            disabled={sending}
          />
          <Button variant="hero" size="icon" onClick={send} disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
