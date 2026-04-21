import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Zap, Shield, BarChart3, Clock, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PRICE_MONTHLY = "price_1TOX5pE2JgwvDIdFE2UHHtVv";
const PRICE_ANNUAL  = "price_1TOX5pE2JgwvDIdFT9NQ5C1Q";

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function Planos() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSubscription();
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Assinatura ativada! Bem-vindo ao Pro.");
      window.history.replaceState({}, "", "/planos");
      setTimeout(fetchSubscription, 2000);
    }
  }, [user]);

  const fetchSubscription = async () => {
    setSubLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end")
      .eq("user_id", user!.id)
      .maybeSingle();
    setSub(data);
    setSubLoading(false);
  };

  const handleCheckout = async (priceId: string, label: string) => {
    if (!session) { navigate("/login"); return; }
    setLoading(label);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_id: priceId,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/planos`,
        },
        headers: currentSession ? { Authorization: `Bearer ${currentSession.access_token}` } : undefined,
      });
      if (error || !data?.url) throw new Error(error?.message || "Erro ao criar checkout");
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Erro ao iniciar checkout");
      setLoading(null);
    }
  };

  const isPro = sub?.plan === "pro" && ["active", "trialing"].includes(sub?.status ?? "");
  const isTrialing = sub?.status === "trialing";

  const freeFeatures = ["Dashboard basico","Registro de corridas","Controle de abastecimento","Historico de 30 dias"];
  const proFeatures = ["Tudo do Free","Relatorios avancados","Lucro real detalhado","Exportacao de dados (CSV)","Controle de jornada","Metas e projecoes","Gestao de multas e CNH","Integracoes externas","Suporte prioritario","Historico ilimitado"];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white pb-24">
      <div className="pt-12 pb-8 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
          <Star className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">7 dias gratis no Pro</span>
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Escolha seu plano</h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">Controle total da sua renda como motorista de aplicativo</p>
        <div className="inline-flex items-center gap-1 bg-white/5 rounded-xl p-1 mt-6">
          <button onClick={() => setBilling("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>Mensal</button>
          <button onClick={() => setBilling("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === "annual" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}>
            Anual <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-17%</span>
          </button>
        </div>
      </div>

      {!subLoading && isPro && (
        <div className="max-w-sm mx-auto px-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-300">{isTrialing ? "Trial ativo" : "Plano Pro ativo"}</p>
              {sub?.current_period_end && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {isTrialing ? "Trial termina" : sub.cancel_at_period_end ? "Cancela" : "Renova"} em {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-sm mx-auto px-4 space-y-4">
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="font-bold text-lg">Free</h2><p className="text-xs text-gray-500 mt-0.5">Para comecar</p></div>
            <div className="text-right"><p className="text-2xl font-bold">R$ 0</p><p className="text-xs text-gray-500">para sempre</p></div>
          </div>
          <div className="space-y-2.5 mb-6">
            {freeFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-gray-400" /></div>
                <span className="text-sm text-gray-400">{f}</span>
              </div>
            ))}
          </div>
          <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-gray-500 cursor-not-allowed">{!isPro ? "Plano atual" : "Plano basico"}</button>
        </div>

        <div className="relative bg-gradient-to-b from-blue-600/20 to-[#0d1117] border border-blue-500/30 rounded-2xl p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">Recomendado</span>
          </div>
          <div className="flex items-center justify-between mb-4 mt-1">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">Pro <Zap className="w-4 h-4 text-yellow-400" /></h2>
              <p className="text-xs text-gray-500 mt-0.5">Controle total</p>
            </div>
            <div className="text-right">
              {billing === "monthly" ? (
                <><p className="text-2xl font-bold">R$ 39<span className="text-base font-semibold">,90</span></p><p className="text-xs text-gray-500">por mes</p></>
              ) : (
                <><p className="text-2xl font-bold">R$ 33<span className="text-base font-semibold">,25</span></p><p className="text-xs text-gray-500">por mes · R$ 399/ano</p></>
              )}
            </div>
          </div>
          <div className="space-y-2.5 mb-6">
            {proFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-blue-400" /></div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>
          {isPro ? (
            <button disabled className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600/30 text-blue-300 cursor-not-allowed">Plano ativo</button>
          ) : (
            <button onClick={() => handleCheckout(billing === "monthly" ? PRICE_MONTHLY : PRICE_ANNUAL, billing)} disabled={!!loading} className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading === billing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" />Comecar trial gratis de 7 dias</>}
            </button>
          )}
          <p className="text-center text-xs text-gray-500 mt-3">Sem cobranca nos primeiros 7 dias · Cancele quando quiser</p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[{icon: Clock, label: "7 dias", sub: "gratis"},{icon: Shield, label: "Seguro", sub: "Stripe"},{icon: BarChart3, label: "Cancele", sub: "quando quiser"}].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <item.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
