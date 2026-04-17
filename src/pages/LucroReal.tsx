import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, TrendingDown, DollarSign, Fuel, Wrench, Shield, Car, Utensils, CreditCard, Wifi, Plus, Trash2, Zap } from "lucide-react";
import { useElectricData } from "@/hooks/useElectricData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Entry {
  id: string;
  label: string;
  value: number;
  category: string;
  icon: React.ElementType;
}

const revenueCategories = [
  { value: "faturamento", label: "Faturamento Apps", icon: DollarSign },
  { value: "bonus", label: "Bônus", icon: TrendingUp },
  { value: "gorjetas", label: "Gorjetas", icon: DollarSign },
];

const expenseCategories = [
  { value: "combustivel", label: "Combustível", icon: Fuel },
  { value: "recarga_ev", label: "Recarga EV", icon: Zap },
  { value: "manutencao", label: "Manutenção", icon: Wrench },
  { value: "seguro", label: "Seguro", icon: Shield },
  { value: "ipva", label: "IPVA", icon: Car },
  { value: "financiamento", label: "Financiamento", icon: CreditCard },
  { value: "alimentacao", label: "Alimentação", icon: Utensils },
  { value: "pedagio", label: "Pedágio", icon: Car },
  { value: "internet", label: "Internet/Celular", icon: Wifi },
];

const defaultRevenues: Entry[] = [
  { id: "r1", label: "Faturamento Apps", value: 4200, category: "faturamento", icon: DollarSign },
  { id: "r2", label: "Bônus", value: 380, category: "bonus", icon: TrendingUp },
  { id: "r3", label: "Gorjetas", value: 165, category: "gorjetas", icon: DollarSign },
];

const defaultExpenses: Entry[] = [
  { id: "e1", label: "Combustível", value: 1450, category: "combustivel", icon: Fuel },
  { id: "e2", label: "Manutenção", value: 320, category: "manutencao", icon: Wrench },
  { id: "e3", label: "Seguro", value: 280, category: "seguro", icon: Shield },
  { id: "e4", label: "IPVA", value: 150, category: "ipva", icon: Car },
  { id: "e5", label: "Alimentação", value: 390, category: "alimentacao", icon: Utensils },
  { id: "e6", label: "Internet/Celular", value: 80, category: "internet", icon: Wifi },
];

export default function LucroReal() {
  const ev = useElectricData();
  const [revenues, setRevenues] = useState<Entry[]>(defaultRevenues);
  const evExpense: Entry = useMemo(() => ({
    id: "ev_auto",
    label: "Recarga EV",
    value: ev.totalChargingCost,
    category: "recarga_ev",
    icon: Zap,
  }), [ev.totalChargingCost]);
  const [expenses, setExpenses] = useState<Entry[]>(defaultExpenses);
  const [dialogType, setDialogType] = useState<"receita" | "despesa" | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newValue, setNewValue] = useState("");

  const totalReceitas = useMemo(() => revenues.reduce((s, r) => s + r.value, 0), [revenues]);
  const allExpenses = useMemo(() => [...expenses, evExpense], [expenses, evExpense]);
  const totalDespesas = useMemo(() => allExpenses.reduce((s, e) => s + e.value, 0), [allExpenses]);
  const lucro = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;
  const custoKm = 3200 > 0 ? totalDespesas / 3200 : 0; // placeholder 3200 km

  const handleAdd = () => {
    if (!newCategory || !newValue) return;
    const val = parseFloat(newValue);
    if (isNaN(val) || val <= 0) return;

    const cats = dialogType === "receita" ? revenueCategories : expenseCategories;
    const cat = cats.find((c) => c.value === newCategory);
    if (!cat) return;

    const entry: Entry = {
      id: `${Date.now()}`,
      label: cat.label,
      value: val,
      category: cat.value,
      icon: cat.icon,
    };

    if (dialogType === "receita") {
      setRevenues((prev) => [...prev, entry]);
    } else {
      setExpenses((prev) => [...prev, entry]);
    }
    setDialogType(null);
    setNewCategory("");
    setNewValue("");
  };

  const removeEntry = (id: string, type: "receita" | "despesa") => {
    if (type === "receita") setRevenues((prev) => prev.filter((r) => r.id !== id));
    else setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Lucro Real" subtitle="Receitas vs Despesas" />

      {/* Hero Card */}
      <div className="glass-card p-5 mb-4">
        <div className="text-center mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Lucro Líquido</p>
          <p className={`text-3xl font-display font-bold ${lucro >= 0 ? "text-velocity-green" : "text-secondary"}`}>
            R$ {lucro.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground uppercase w-14">Margem</span>
          <Progress value={Math.max(0, Math.min(100, margem))} className="h-2 flex-1" />
          <span className={`text-xs font-bold min-w-[40px] text-right ${margem >= 30 ? "text-velocity-green" : margem >= 15 ? "text-warning" : "text-secondary"}`}>
            {margem.toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Receitas</p>
            <p className="text-sm font-bold text-velocity-green">R$ {totalReceitas.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Despesas</p>
            <p className="text-sm font-bold text-secondary">R$ {totalDespesas.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Custo/km</p>
            <p className="text-sm font-bold text-primary">R$ {custoKm.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Receitas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-velocity-green" />
            <h3 className="text-sm font-display font-semibold">Receitas</h3>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-velocity-green" onClick={() => setDialogType("receita")}>
            <Plus className="w-3 h-3 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {revenues.map((r) => (
            <div key={r.id} className="glass-card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-velocity-green/20 flex items-center justify-center">
                <r.icon className="w-4 h-4 text-velocity-green" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{r.label}</p>
              </div>
              <p className="text-sm font-bold text-velocity-green">R$ {r.value.toFixed(2)}</p>
              <button onClick={() => removeEntry(r.id, "receita")} className="text-muted-foreground/50 hover:text-secondary">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Despesas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-display font-semibold">Despesas</h3>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-secondary" onClick={() => setDialogType("despesa")}>
            <Plus className="w-3 h-3 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {/* Auto EV expense */}
          {ev.totalChargingCost > 0 && (
            <div className="glass-card p-3 flex items-center gap-3 border border-primary/20">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">Recarga EV</p>
                <p className="text-[10px] text-muted-foreground">Auto • módulo elétrico</p>
              </div>
              <p className="text-sm font-bold text-secondary">R$ {ev.totalChargingCost.toFixed(2)}</p>
            </div>
          )}
          {expenses.map((e) => (
            <div key={e.id} className="glass-card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <e.icon className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">{e.label}</p>
              </div>
              <p className="text-sm font-bold text-secondary">R$ {e.value.toFixed(2)}</p>
              <button onClick={() => removeEntry(e.id, "despesa")} className="text-muted-foreground/50 hover:text-secondary">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Saúde Financeira */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Saúde Financeira
        </h3>
        <div className="space-y-2">
          {[
            { label: "Combustível / Receita", value: revenues.length ? ((allExpenses.find(e => e.category === "combustivel")?.value || 0) / totalReceitas * 100) : 0, limit: 35, color: "bg-warning" },
            { label: "Recarga EV / Receita", value: revenues.length ? (ev.totalChargingCost / totalReceitas * 100) : 0, limit: 20, color: "bg-primary" },
            { label: "Manutenção / Receita", value: revenues.length ? ((allExpenses.find(e => e.category === "manutencao")?.value || 0) / totalReceitas * 100) : 0, limit: 10, color: "bg-secondary" },
            { label: "Margem Líquida", value: margem, limit: 100, color: "bg-velocity-green" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{item.label}</span>
                <span className="font-medium">{item.value.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${Math.min(100, item.value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={!!dialogType} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="max-w-sm bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              {dialogType === "receita" ? "Nova Receita" : "Nova Despesa"}
            </DialogTitle>
            <DialogDescription>Adicione um valor para o cálculo do lucro real.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                {(dialogType === "receita" ? revenueCategories : expenseCategories).map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Valor (R$)" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            <Button className="w-full bg-primary text-black font-semibold" onClick={handleAdd}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
