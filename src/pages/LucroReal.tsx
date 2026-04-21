import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, DollarSign, Fuel, Wrench, Shield, Car, Utensils, CreditCard, Wifi, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Entry { id: string; label: string; value: number; category: string; }

const revenueCategories = [
  { value: "faturamento", label: "Faturamento Apps" },
  { value: "bonus", label: "Bônus" },
  { value: "gorjetas", label: "Gorjetas" },
];

const expenseCategories = [
  { value: "combustivel", label: "Combustível" },
  { value: "recarga_ev", label: "Recarga EV" },
  { value: "manutencao", label: "Manutenção" },
  { value: "seguro", label: "Seguro" },
  { value: "ipva", label: "IPVA" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "financiamento", label: "Financiamento" },
  { value: "celular", label: "Celular/Internet" },
  { value: "outros", label: "Outros" },
];

export default function LucroReal() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_lucroreal"));
  const { user } = useAuth();
  const [revenues, setRevenues] = useState<Entry[]>([]);
  const [expenses, setExpenses] = useState<Entry[]>([]);
  const [dialog, setDialog] = useState<"revenue" | "expense" | null>(null);
  const [form, setForm] = useState({ label: "", value: "", category: "faturamento" });

  useEffect(() => {
    if (!user) return;
    const month = new Date().toISOString().slice(0, 7);
    supabase.from("lucro_real").select("*").eq("user_id", user.id).gte("created_at", month + "-01")
      .then(({ data }) => {
        if (!data) return;
        setRevenues(data.filter((d: any) => d.type === "revenue").map((d: any) => ({ id: d.id, label: d.label, value: Number(d.value), category: d.category })));
        setExpenses(data.filter((d: any) => d.type === "expense").map((d: any) => ({ id: d.id, label: d.label, value: Number(d.value), category: d.category })));
      });
  }, [user]);

  const totalRevenue = useMemo(() => revenues.reduce((s, e) => s + e.value, 0), [revenues]);
  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.value, 0), [expenses]);
  const profit = totalRevenue - totalExpense;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const handleSave = async () => {
    if (!user || !form.value || !form.label) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }
    const type = dialog === "revenue" ? "revenue" : "expense";
    const payload = { user_id: user.id, type, label: form.label, value: parseFloat(form.value), category: form.category };
    const { data, error } = await supabase.from("lucro_real").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    const entry = { id: data.id, label: data.label, value: Number(data.value), category: data.category };
    if (type === "revenue") setRevenues(prev => [...prev, entry]);
    else setExpenses(prev => [...prev, entry]);
    toast({ title: `${type === "revenue" ? "Receita" : "Despesa"} registrada!` });
    setDialog(null);
    setForm({ label: "", value: "", category: "faturamento" });
  };

  const handleDelete = async (id: string, type: "revenue" | "expense") => {
    await supabase.from("lucro_real").delete().eq("id", id);
    if (type === "revenue") setRevenues(prev => prev.filter(e => e.id !== id));
    else setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const tourSteps = [{ target: "h1", title: "Lucro Real 💎", description: "Veja quanto você ganha após descontar despesas." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Lucro Real" subtitle="Resultado do mês" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_lucroreal"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>
      <div className="glass-card p-5 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lucro Líquido</p>
            <p className={`text-4xl font-display font-bold ${profit >= 0 ? "text-velocity-green" : "text-secondary"}`}>
              R$ {Math.abs(profit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Margem</p>
            <p className={`text-2xl font-display font-bold ${margin >= 0 ? "text-velocity-green" : "text-secondary"}`}>{margin.toFixed(1)}%</p>
          </div>
        </div>
        <Progress value={Math.min(Math.max(margin, 0), 100)} className="h-2 mb-3" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Receitas</p>
            <p className="text-lg font-bold text-velocity-green">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Despesas</p>
            <p className="text-lg font-bold text-secondary">R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button onClick={() => { setForm({ ...form, category: "faturamento" }); setDialog("revenue"); }} className="h-12 bg-velocity-green/10 text-velocity-green border border-velocity-green/20">
          <Plus className="w-4 h-4 mr-2" /> Receita
        </Button>
        <Button onClick={() => { setForm({ ...form, category: "combustivel" }); setDialog("expense"); }} className="h-12 bg-secondary/10 text-secondary border border-secondary/20">
          <Plus className="w-4 h-4 mr-2" /> Despesa
        </Button>
      </div>
      {revenues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Receitas</h3>
          <div className="space-y-2">
            {revenues.map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold">{e.label}</p>
                  <p className="text-sm font-bold text-velocity-green">R$ {e.value.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelete(e.id, "revenue")} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      {expenses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Despesas</h3>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold">{e.label}</p>
                  <p className="text-sm font-bold text-secondary">R$ {e.value.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelete(e.id, "expense")} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog === "revenue" ? "Nova Receita" : "Nova Despesa"}</DialogTitle>
            <DialogDescription>{dialog === "revenue" ? "Registre uma receita do mês" : "Registre uma despesa do mês"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(dialog === "revenue" ? revenueCategories : expenseCategories).map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Descrição" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input type="number" placeholder="Valor (R$)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <Button onClick={handleSave} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="lucroreal" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
