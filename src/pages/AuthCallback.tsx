import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const status = params.get("github");
    refresh().then(() => {
      if (status === "success") {
        toast.success("GitHub connected! 🎉", { position: "bottom-center" });
        navigate("/dashboard", { replace: true });
      } else if (status === "error") {
        toast.error("GitHub connection failed. Please try again.", { position: "bottom-center" });
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [params, navigate, refresh]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
