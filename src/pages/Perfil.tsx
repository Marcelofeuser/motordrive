import PageHeader from "@/components/PageHeader";
import { User, Car, Settings, Moon, LogOut, Crown, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
}

export default function Perfil() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_perfil"));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("subscriptions").select("plan, status, current_period_end")
      .eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setSub(data));
  }, [user]);

  const menuItems = [
    { icon: User, label: "Dados do Condutor", path: "/cnh" },
    { icon: Car, label: "Veículos", path: "/veiculo" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
    { icon: Moon, label: "Aparência", path: "/configuracoes" },
  ];

  const tourSteps = [{ target: "h1", title: "Perfil 👤", description: "Gerencie informações pessoais e plano de assinatura." }];

  const isPro = sub?.plan === "pro" && ["active", "trialing"].includes(sub?.status ?? "");
  const isVitalicio = sub?.current_period_end && new Date(sub.current_period_end).getFullYear() >= 2099;
  const isTrialing = sub?.status === "trialing";

  const getPlanLabel = () => {
    if (!isPro) return { label: "Free", color: "text-gray-400", bg: "bg-white/5", icon: Shield };
    if (isVitalicio) return { label: "Pro Vitalício ♾️", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Crown };
    if (isTrialing) return { label: "Trial Pro", color: "text-blue-400", bg: "bg-blue-500/10", icon: Crown };
    return { label: "Pro", color: "text-blue-400", bg: "bg-blue-500/10", icon: Crown };
  };

  const planInfo = getPlanLabel();

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Perfil" subtitle="Configurações" />
      <div className="flex justify-end -mt-2 mb-2">
        <button onClick={() => { localStorage.removeItem("tour_perfil"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs">
          <HelpCircle className="w-4 h-4" /> Ajuda
        </button>
      </div>

      {/* Card usuário */}
      <div className="glass-card p-6 flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold">
            {user?.user_metadata?.full_name || "Motorista"}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Card plano */}
      <div className={`${planInfo.bg} border border-white/10 rounded-2xl p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <planInfo.icon className={`w-5 h-5 ${planInfo.color}`} />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Plano atual</p>
              <p className={`font-bold text-sm ${planInfo.color}`}>{planInfo.label}</p>
            </div>
          </div>
          {isPro && !isVitalicio && sub?.current_period_end && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-xs">{isTrialing ? "Trial até" : "Renova em"}</p>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5">
                {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
          {isVitalicio && (
            <div className="text-right">
              <p className="text-xs text-yellow-400 font-semibold">Acesso permanente</p>
              <p className="text-xs text-gray-500">Sem expiração</p>
            </div>
          )}
          {!isPro && (
            <button onClick={() => navigate("/planos")} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-all">
              Upgrade
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {menuItems.map((item) => (
          <button key={item.label} onClick={() => item.path && navigate(item.path)}
            className="glass-card w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <Button variant="outline" className="w-full h-12 border-secondary/30 text-secondary hover:bg-secondary/10" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="perfil" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
