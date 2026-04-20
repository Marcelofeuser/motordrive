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

const platforms = ["Uber", "99", "inDrive", "Amazon", "Mercado", "Outros"];

interface Earning {
  id: string; date: string; platform: string;
  bruto: number; gorjetas: number; bonus: number; dinheiro: number;
  taxas: number; pedagio: number; corridas: number; outros: number;
}

export default function Faturamento() {
  const { user } = useAuth();
  const [selected, setSelected] = useState("Uber");
  const [entries, setEntries] = useState<Earning[]>([]);
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    bruto: "", gorjetas: "", bonus: "", dinheiro: "",
    taxas: "", pedagio: "", corridas: "", outros: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("earnings").select("*").order("date", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setEntries(data.map((d: any) => ({
          id: d.id, date: d.date, platform: d.platform,
          bruto: Number(d.bruto), gorjetas: Number(d.gorjetas),
          bonus: Number(d.bonus), dinheiro: Number(d.dinheiro),
          taxas: Number(d.taxas), pedagio: Number(d.pedagio),
          corridas: Number(d.corridas ?? 0), outros: Number(d.outros ?? 0),
        })));
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.bruto) { toast({ title: "Preencha o valor bruto", variant: "destructive" }); return; }
    const payload = {
      user_id: user.id, date: form.data, platform: selected,
      bruto: parseFloat(form.bruto) || 0,
      gorjetas: parseFloat(form.gorjetas) || 0,
      bonus: parseFloat(form.bonus) || 0,
      dinheiro: parseFloat(form.dinheiro) || 0,
      taxas: parseFloat(form.taxas) || 0,
      pedagio: parseFloat(form.pedagio) || 0,
      corridas: parseInt(form.corridas) || 0,
      outros: parseFloat(form.outros) || 0,
    };
    const { data, error } = await supabase.from("earnings").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setEntries(prev => [{
      id: data.id, date: data.date, platform: data.platform,
      bruto: Number(data.bruto), gorjetas: Number(data.gorjetas),
      bonus: Number(data.bonus), dinheiro: Number(data.dinheiro),
      taxas: Number(data.taxas), pedagio: Number(data.pedagio),
      corridas: Number(data.corridas ?? 0), outros: Number(data.outros ?? 0),
    }, ...prev]);
    toast({ title: "Ganho registrado!", description: `${selected} - R$ ${form.bruto}` });
    setForm({ ...form, bruto: "", gorjetas: "", bonus: "", dinheiro: "", taxas: "", pedagio: "", corridas: "", outros: "" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("earnings").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const fields = [
    { key: "bruto", label: "Valor Bruto" },
    { key: "gorjetas", label: "Gorjetas" },
    { key: "bonus", label: "Bônus" },
    { key: "dinheiro", label: "Dinheiro" },
    { key: "taxas", label: "Taxas" },
    { key: "pedagio", label: "Pedágio" },
    { key: "outros", label: "Outros" },
    { key: "corridas", label: "Nº de Corridas", integer: true },
  ];

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Faturamento" subtitle="Registrar ganhos" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
        {platforms.map((p) => (
          <button key={p} onClick={() => setSelected(p)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selected === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {p}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Data</Label>
          <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="bg-muted border-border mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label, integer }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
              <Input
                type="number"
                placeholder={integer ? "0" : "0,00"}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="bg-muted border-border mt-1 text-lg font-display"
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
          Salvar Ganho
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
                    <span className="text-xs font-semibold">{e.platform}</span>
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                    {e.corridas > 0 && <span className="text-[10px] text-primary">{e.corridas} corridas</span>}
                  </div>
                  <p className="text-sm font-bold text-velocity-green">R$ {e.bruto.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {[
                      e.gorjetas > 0 && `Gorj: R$${e.gorjetas.toFixed(2)}`,
                      e.bonus > 0 && `Bônus: R$${e.bonus.toFixed(2)}`,
                      e.taxas > 0 && `Taxas: R$${e.taxas.toFixed(2)}`,
                      e.outros > 0 && `Outros: R$${e.outros.toFixed(2)}`,
                    ].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
