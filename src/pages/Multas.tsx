import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { AlertTriangle, Shield, Calendar, Bell, Trash2, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Multa {
  id: string; auto_infracao?: string; data_infracao?: string; descricao?: string;
  valor?: number; vencimento?: string; status: string; desconto_percent: number;
}

export default function Multas() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_multas"));
  const { user } = useAuth();
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("multas").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMultas(data.map((d: any) => ({ id: d.id, auto_infracao: d.auto_infracao, data_infracao: d.data_infracao, descricao: d.descricao, valor: d.valor ? Number(d.valor) : undefined, vencimento: d.vencimento, status: d.status, desconto_percent: Number(d.desconto_percent) })));
        setLoading(false);
      });
  }, [user]);

  const handleExtracted = async (data: Record<string, unknown>) => {
    if (!user) return;
    const payload = { user_id: user.id, ...data, status: "pendente", desconto_percent: 40 };
    const { data: inserted, error } = await supabase.from("multas").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar multa", description: error.message, variant: "destructive" }); return; }
    setMultas(prev => [{ id: inserted.id, auto_infracao: inserted.auto_infracao, data_infracao: inserted.data_infracao, descricao: inserted.descricao, valor: inserted.valor ? Number(inserted.valor) : undefined, vencimento: inserted.vencimento, status: inserted.status, desconto_percent: Number(inserted.desconto_percent) }, ...prev]);
    toast({ title: "Multa registrada!" });
  };

  const handlePagar = async (id: string) => {
    await supabase.from("multas").update({ status: "paga" }).eq("id", id);
    setMultas(prev => prev.map(m => m.id === id ? { ...m, status: "paga" } : m));
    toast({ title: "Multa marcada como paga!" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("multas").delete().eq("id", id);
    setMultas(prev => prev.filter(m => m.id !== id));
  };

  const pendentes = multas.filter(m => m.status === "pendente");
  const pagas = multas.filter(m => m.status === "paga");

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const tourSteps = [{ target: "h1", title: "Multas 🚨", description: "Registre multas e acompanhe prazos de recurso." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Multas & Alertas" subtitle="Controle completo" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_multas"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      <SmartDocumentUpload
        documentType="multa"
        onDataExtracted={handleExtracted}
        triggerLabel="Escanear Multa com IA"
      />

      {/* Resumo */}
      {pendentes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-secondary">{pendentes.length}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Total</p>
            <p className="text-2xl font-bold text-secondary">
              R$ {pendentes.reduce((s, m) => s + (m.valor ?? 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pendentes</h3>
          <div className="space-y-3">
            {pendentes.map((m) => (
              <div key={m.id} className="border border-secondary/30 bg-secondary/5 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm font-semibold">{m.descricao || "Multa"}</span>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {m.auto_infracao && <p className="text-xs text-muted-foreground mb-1">Auto: {m.auto_infracao}</p>}
                {m.valor && (
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-lg font-bold text-secondary">R$ {m.valor.toFixed(2)}</p>
                    </div>
                    {m.desconto_percent > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Com {m.desconto_percent}% desconto</p>
                        <p className="text-lg font-bold text-velocity-green">R$ {(m.valor * (1 - m.desconto_percent / 100)).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
                {m.vencimento && <p className="text-xs text-muted-foreground mb-3">Vencimento: {m.vencimento}</p>}
                <Button onClick={() => handlePagar(m.id)} size="sm" className="w-full h-8 bg-velocity-green/10 text-velocity-green border border-velocity-green/20 hover:bg-velocity-green/20">
                  <CheckCircle className="w-3.5 h-3.5 mr-2" /> Marcar como paga
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagas */}
      {pagas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pagas</h3>
          <div className="space-y-2">
            {pagas.map((m) => (
              <div key={m.id} className="glass-card p-3 flex items-center gap-3 opacity-60">
                <CheckCircle className="w-4 h-4 text-velocity-green flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold">{m.descricao || "Multa"}</p>
                  {m.valor && <p className="text-xs text-muted-foreground">R$ {m.valor.toFixed(2)}</p>}
                </div>
                <button onClick={() => handleDelete(m.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {multas.length === 0 && (
        <div className="mt-8 glass-card p-8 text-center">
          <Shield className="w-10 h-10 text-velocity-green mx-auto mb-3" />
          <p className="text-sm font-semibold">Nenhuma multa registrada</p>
          <p className="text-xs text-muted-foreground mt-1">Escaneie um auto de infração com IA</p>
        </div>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="multas" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
