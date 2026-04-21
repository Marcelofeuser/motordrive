import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

const categories = ["Preventiva", "Corretiva", "Pneus", "Óleo", "Freios", "Elétrica", "Outros"];

interface MaintenanceEntry {
  id: string; date: string; category: string; tipo: string; valor: number; km: number; obs: string;
}

export default function Manutencao() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_manutencao"));
  const { user } = useAuth();
  const [selectedCat, setSelectedCat] = useState("Preventiva");
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [form, setForm] = useState({ data: new Date().toISOString().slice(0, 10), tipo: "", valor: "", km: "", obs: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("maintenance").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setEntries(data.map((d: any) => ({ id: d.id, date: d.date, category: d.category, tipo: d.tipo ?? "", valor: Number(d.valor), km: Number(d.km), obs: d.obs ?? "" })));
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.valor) { toast({ title: "Preencha o valor", variant: "destructive" }); return; }
    const payload = { user_id: user.id, date: form.data, category: selectedCat, tipo: form.tipo, valor: parseFloat(form.valor) || 0, km: parseFloat(form.km) || 0, obs: form.obs };
    const { data, error } = await supabase.from("maintenance").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setEntries(prev => [{ id: data.id, date: data.date, category: data.category, tipo: data.tipo ?? "", valor: Number(data.valor), km: Number(data.km), obs: data.obs ?? "" }, ...prev]);
    toast({ title: "Manutenção registrada!", description: `${selectedCat} - R$ ${form.valor}` });
    setForm({ ...form, tipo: "", valor: "", km: "", obs: "" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("maintenance").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const tourSteps = [{ target: "h1", title: "Manutenção 🔧", description: "Registre manutenções para calcular custo de operação." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Manutenção" subtitle="Registrar serviço" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_manutencao"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
        {categories.map((c) => (
          <button key={c} onClick={() => setSelectedCat(c)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedCat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Data</Label>
          <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="bg-muted border-border mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tipo / Serviço</Label>
            <Input placeholder="Ex: Troca de óleo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="bg-muted border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Valor (R$)</Label>
            <Input type="number" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">KM Atual</Label>
            <Input type="number" placeholder="0" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} className="bg-muted border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Observação</Label>
            <Input placeholder="Opcional" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} className="bg-muted border-border mt-1" />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
          Salvar Manutenção
        </Button>
      </motion.div>
      {entries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h3>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{e.category}</span>
                    {e.tipo && <span className="text-xs text-muted-foreground">• {e.tipo}</span>}
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                  </div>
                  <p className="text-sm font-bold text-secondary">R$ {e.valor.toFixed(2)}</p>
                  {e.km > 0 && <p className="text-[10px] text-muted-foreground">{e.km.toLocaleString()} km</p>}
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="manutencao" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
