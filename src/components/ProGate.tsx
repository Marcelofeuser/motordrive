import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

export function ProGate({ children }: { children: React.ReactNode }) {
  const { hasProAccess, loading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublic = ["/planos", "/login", "/auth", "/checkout"].some(p =>
    location.pathname.startsWith(p)
  );

  useEffect(() => {
    if (loading || isPublic) return;
    if (!hasProAccess) {
      navigate("/planos");
    }
  }, [hasProAccess, loading, isPublic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return <>{children}</>;
}
