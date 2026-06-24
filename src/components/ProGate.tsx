import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { hasProAccess, loading } = useSubscription();
  const navigate = useNavigate();
  const isPlanos = window.location.pathname === "/planos";
  const isCheckout = window.location.pathname.startsWith("/checkout");

  useEffect(() => {
    if (loading) return;
    if (!hasProAccess && !isPlanos && !isCheckout) {
      navigate("/planos");
    }
  }, [hasProAccess, loading, isPlanos, isCheckout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return <>{children}</>;
}