import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Zap, ArrowRight, Loader2 } from "lucide-react";

export default function CheckoutSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("pro");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      await new Promise(r => setTimeout(r, 2000));
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.plan) setPlan(data.plan);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 relative">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-black" />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2 tracking-tight">Bem-vindo ao Pro!</h1>
      <p className="text-gray-400 text-sm mb-2">Sua assinatura foi ativada com sucesso.</p>
      <p className="text-gray-500 text-xs mb-8">Voce tem 7 dias de trial gratuito. Nenhuma cobranca por enquanto.</p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Ativando seu plano...
        </div>
      ) : (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-6 py-3 mb-8">
          <p className="text-blue-300 text-sm font-semibold">Plano Pro ativo ✓</p>
        </div>
      )}

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => navigate("/dashboard-home")}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          Ir para o Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
