import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Fuel, TrendingUp } from "lucide-react";

const fuelTypes = ["Gasolina", "Etanol", "Diesel", "GNV"];

interface FuelEntry {
  id: string;
  date: string;
  fuel_type: string;
  km: number;
  liters: number;
  total_cost: number;
}

export default function Abastecimento() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_abastecimento"));
  const { user } = useAuth();
  const [selectedFuel, setSelectedFuel] = useState("Gasolina");
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    km: "", litros: "", valor: "",
  });

  const custoLitro = form.valor && form.litros
    ? (Number(form.valor) / Number(form.litros)).toFixed(2)
    : "--";

  // Calculate average consumption (km/l) from history
  const mediaConsumo = useMemo(() => {
    if (entries.length < 2) return null;
    // entries are ordered desc by date; we need pairs
    const sorted = [...entries].sort((a, b) => a.km - b.km);
    let totalKm = 0;
    let totalLiters = 0;
    for (let i = 1; i < sorted.length; i++) {
      const kmDiff = sorted[i].km - sorted[i - 1].km;
      if (kmDiff > 0) {
        totalKm += kmDiff;
        totalLiters += sorted[i].liters;
      }
    }
    return totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : null;
  }, [entries]);

  useEffect(() => {
    if (!user) return;
    supabase.from("fueling").select("*").order("date", { ascending: false }).limit(50)
      .then(({ data }) => {
        if (data) setEntries(data.map((d: any) => ({ id: d.id, date: d.date, fuel_type: d.fuel_type, km: Number(d.km), liters: Number(d.liters), total_cost: Number(d.total_cost) })));
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.litros || !form.valor) {
      toast({ title: "Preencha litros e valor", variant: "destructive" });
      return;
    }
    const payload = {
      user_id: user.id,
      date: form.data,
      fuel_type: selectedFuel,
      km: parseFloat(form.km) || 0,
      liters: parseFloat(form.litros) || 0,
      total_cost: parseFloat(form.valor) || 0,
    };
    const { data, error } = await supabase.from("fueling").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setEntries(prev => [{ id: data.id, date: data.date, fuel_type: data.fuel_type, km: Number(data.km), liters: Number(data.liters), total_cost: Number(data.total_cost) }, ...prev]);
    toast({ title: "Abastecimento registrado!", description: `${form.litros}L de ${selectedFuel} — R$ ${custoLitro}/L` });
    setForm({ ...form, km: "", litros: "", valor: "" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("fueling").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const tourSteps = [{ target: "h1", title: "Abastecimento ⛽", description: "Registre cada abastecimento para calcular custo por km." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Abastecimento" subtitle="Registrar combustível" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_abastecimento"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {fuelTypes.map((f) => (
          <button key={f} onClick={() => setSelectedFuel(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedFuel === f ? "bg-warning text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {f}
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
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">KM Atual</Label>
            <Input type="number" placeholder="0" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Litros</Label>
            <Input type="number" placeholder="0" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total (R$)</Label>
          <Input type="number" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
        </div>

        {/* Auto-calculated: Price per liter */}
        {form.valor && form.litros && (
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Custo por Litro</p>
              <p className="text-2xl font-display font-bold text-warning">R$ {custoLitro}</p>
            </div>
          </div>
        )}

        {/* Average consumption - shows from 2nd entry onwards */}
        {mediaConsumo && (
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Média de Consumo</p>
              <p className="text-2xl font-display font-bold text-accent">{mediaConsumo} km/L</p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
          Salvar Abastecimento
        </Button>
      </motion.div>

      {entries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h3>
          <div className="space-y-2">
            {entries.map((e, idx) => {
              // Calculate per-entry consumption if possible
              const sorted = [...entries].sort((a, b) => a.km - b.km);
              const sortedIdx = sorted.findIndex(s => s.id === e.id);
              let entryConsumption: string | null = null;
              if (sortedIdx > 0) {
                const kmDiff = sorted[sortedIdx].km - sorted[sortedIdx - 1].km;
                if (kmDiff > 0 && e.liters > 0) {
                  entryConsumption = (kmDiff / e.liters).toFixed(1);
                }
              }

              return (
                <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{e.fuel_type}</span>
                      <span className="text-[10px] text-muted-foreground">{e.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {e.liters}L • R$ {e.total_cost.toFixed(2)} • R$ {(e.total_cost / e.liters).toFixed(2)}/L
                      {entryConsumption && ` • ${entryConsumption} km/L`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="abastecimento" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
