import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Zap, Battery, BatteryCharging, MapPin, Clock, Plus, Trash2, TrendingUp, TrendingDown, Home, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EVCharts from "@/components/EVCharts";

interface UsageEntry { id: string; date: string; km_initial: number; km_final: number; km_total: number; battery_initial: number; battery_final: number; battery_consumption: number; }
interface ChargingEntry { id: string; date: string; kwh_charged: number; total_cost: number; cost_per_kwh: number; charging_type: "home"|"public"|"fast"|"free"; location: string; duration_minutes: number; battery_before: number; battery_after: number; }
type DialogMode = "usage" | "charging" | null;

const chargingTypeLabels: Record<string, { label: string; color: string }> = {
  home: { label: "🏠 Casa", color: "text-velocity-green" },
  public: { label: "🔌 Público", color: "text-primary" },
  fast: { label: "⚡ Rápido", color: "text-secondary" },
  free: { label: "🎁 Gratuito", color: "text-muted-foreground" },
};

export default function Eletrico() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_eletrico"));
  const { user } = useAuth();
  const [usageEntries, setUsageEntries] = useState<UsageEntry[]>([]);
  const [chargingEntries, setChargingEntries] = useState<ChargingEntry[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const [showAllCharging, setShowAllCharging] = useState(false);

  const [usageForm, setUsageForm] = useState({ date: new Date().toISOString().slice(0,10), km_initial: "", km_final: "", battery_initial: "100", battery_final: "" });
  const [chargingForm, setChargingForm] = useState({ date: new Date().toISOString().slice(0,10), kwh_charged: "", total_cost: "", charging_type: "home", location: "", duration_minutes: "", battery_before: "", battery_after: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("electric_usage").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setUsageEntries(data.map((d: any) => ({ id: d.id, date: d.date, km_initial: Number(d.km_initial), km_final: Number(d.km_final), km_total: Number(d.km_total ?? 0), battery_initial: Number(d.battery_initial), battery_final: Number(d.battery_final), battery_consumption: Number(d.battery_consumption ?? 0) }))); });
    supabase.from("electric_charging").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setChargingEntries(data.map((d: any) => ({ id: d.id, date: d.date, kwh_charged: Number(d.kwh_charged), total_cost: Number(d.total_cost), cost_per_kwh: Number(d.cost_per_kwh ?? 0), charging_type: d.charging_type, location: d.location ?? "", duration_minutes: Number(d.duration_minutes ?? 0), battery_before: Number(d.battery_before ?? 0), battery_after: Number(d.battery_after ?? 0) }))); });
  }, [user]);

  const metrics = useMemo(() => {
    const totalKm = usageEntries.reduce((s, u) => s + u.km_total, 0);
    const totalKwh = chargingEntries.reduce((s, c) => s + c.kwh_charged, 0);
    const totalCost = chargingEntries.reduce((s, c) => s + c.total_cost, 0);
    return { totalKm, totalKwh, totalCost, kmPerKwh: totalKwh > 0 ? totalKm / totalKwh : 0, costPerKm: totalKm > 0 ? totalCost / totalKm : 0 };
  }, [usageEntries, chargingEntries]);

  const handleSaveUsage = async () => {
    if (!user || !usageForm.km_final || !usageForm.battery_final) { toast({ title: "Preencha KM final e bateria final", variant: "destructive" }); return; }
    const payload = { user_id: user.id, date: usageForm.date, km_initial: parseFloat(usageForm.km_initial) || 0, km_final: parseFloat(usageForm.km_final), battery_initial: parseFloat(usageForm.battery_initial) || 100, battery_final: parseFloat(usageForm.battery_final) };
    const { data, error } = await supabase.from("electric_usage").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setUsageEntries(prev => [{ id: data.id, date: data.date, km_initial: Number(data.km_initial), km_final: Number(data.km_final), km_total: Number(data.km_total ?? 0), battery_initial: Number(data.battery_initial), battery_final: Number(data.battery_final), battery_consumption: Number(data.battery_consumption ?? 0) }, ...prev]);
    toast({ title: "Uso registrado!" });
    setDialogMode(null);
    setUsageForm({ date: new Date().toISOString().slice(0,10), km_initial: "", km_final: "", battery_initial: "100", battery_final: "" });
  };

  const handleSaveCharging = async () => {
    if (!user || !chargingForm.kwh_charged) { toast({ title: "Preencha kWh carregado", variant: "destructive" }); return; }
    const payload = { user_id: user.id, date: chargingForm.date, kwh_charged: parseFloat(chargingForm.kwh_charged), total_cost: parseFloat(chargingForm.total_cost) || 0, charging_type: chargingForm.charging_type, location: chargingForm.location, duration_minutes: parseInt(chargingForm.duration_minutes) || 0, battery_before: parseFloat(chargingForm.battery_before) || 0, battery_after: parseFloat(chargingForm.battery_after) || 0 };
    const { data, error } = await supabase.from("electric_charging").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setChargingEntries(prev => [{ id: data.id, date: data.date, kwh_charged: Number(data.kwh_charged), total_cost: Number(data.total_cost), cost_per_kwh: Number(data.cost_per_kwh ?? 0), charging_type: data.charging_type, location: data.location ?? "", duration_minutes: Number(data.duration_minutes ?? 0), battery_before: Number(data.battery_before ?? 0), battery_after: Number(data.battery_after ?? 0) }, ...prev]);
    toast({ title: "Recarga registrada!" });
    setDialogMode(null);
    setChargingForm({ date: new Date().toISOString().slice(0,10), kwh_charged: "", total_cost: "", charging_type: "home", location: "", duration_minutes: "", battery_before: "", battery_after: "" });
  };

  const deleteUsage = async (id: string) => { await supabase.from("electric_usage").delete().eq("id", id); setUsageEntries(prev => prev.filter(e => e.id !== id)); };
  const deleteCharging = async (id: string) => { await supabase.from("electric_charging").delete().eq("id", id); setChargingEntries(prev => prev.filter(e => e.id !== id)); };

  const tourSteps = [{ target: "h1", title: "Elétrico ⚡", description: "Registre recargas e acompanhe eficiência em km/kWh." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Elétrico" subtitle="Gestão do veículo EV" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_eletrico"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase mb-1">KM Total</p>
          <p className="text-lg font-bold font-display">{metrics.totalKm.toFixed(0)}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase mb-1">km/kWh</p>
          <p className="text-lg font-bold font-display text-primary">{metrics.kmPerKwh.toFixed(1)}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase mb-1">R$/km</p>
          <p className="text-lg font-bold font-display text-secondary">R$ {metrics.costPerKm.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button onClick={() => setDialogMode("usage")} className="h-12 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
          <MapPin className="w-4 h-4 mr-2" /> Registrar Uso
        </Button>
        <Button onClick={() => setDialogMode("charging")} className="h-12 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20">
          <BatteryCharging className="w-4 h-4 mr-2" /> Registrar Recarga
        </Button>
      </div>

      {/* Usage history */}
      {usageEntries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Uso</h3>
          <div className="space-y-2">
            {(showAllUsage ? usageEntries : usageEntries.slice(0, 3)).map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{e.km_total.toFixed(1)} km</span>
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bateria: {e.battery_initial}% → {e.battery_final}% ({e.battery_consumption.toFixed(0)}% usado)</p>
                </div>
                <button onClick={() => deleteUsage(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {usageEntries.length > 3 && (
              <button onClick={() => setShowAllUsage(!showAllUsage)} className="text-xs text-primary flex items-center gap-1">
                {showAllUsage ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver todos ({usageEntries.length})</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Charging history */}
      {chargingEntries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recargas</h3>
          <div className="space-y-2">
            {(showAllCharging ? chargingEntries : chargingEntries.slice(0, 3)).map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${chargingTypeLabels[e.charging_type]?.color}`}>{chargingTypeLabels[e.charging_type]?.label}</span>
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.kwh_charged} kWh • R$ {e.total_cost.toFixed(2)} {e.location && `• ${e.location}`}</p>
                </div>
                <button onClick={() => deleteCharging(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {chargingEntries.length > 3 && (
              <button onClick={() => setShowAllCharging(!showAllCharging)} className="text-xs text-primary flex items-center gap-1">
                {showAllCharging ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver todos ({chargingEntries.length})</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage Dialog */}
      <Dialog open={dialogMode === "usage"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar Uso</DialogTitle><DialogDescription>KM e bateria do dia</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input type="date" value={usageForm.date} onChange={(e) => setUsageForm({ ...usageForm, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-xs text-muted-foreground mb-1">KM Inicial</p><Input type="number" placeholder="0" value={usageForm.km_initial} onChange={(e) => setUsageForm({ ...usageForm, km_initial: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">KM Final</p><Input type="number" placeholder="0" value={usageForm.km_final} onChange={(e) => setUsageForm({ ...usageForm, km_final: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">Bateria Inicial (%)</p><Input type="number" placeholder="100" value={usageForm.battery_initial} onChange={(e) => setUsageForm({ ...usageForm, battery_initial: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">Bateria Final (%)</p><Input type="number" placeholder="0" value={usageForm.battery_final} onChange={(e) => setUsageForm({ ...usageForm, battery_final: e.target.value })} /></div>
            </div>
            <Button onClick={handleSaveUsage} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charging Dialog */}
      <Dialog open={dialogMode === "charging"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Registrar Recarga</DialogTitle><DialogDescription>Dados da recarga</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input type="date" value={chargingForm.date} onChange={(e) => setChargingForm({ ...chargingForm, date: e.target.value })} />
            <Select value={chargingForm.charging_type} onValueChange={(v) => setChargingForm({ ...chargingForm, charging_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">🏠 Casa</SelectItem>
                <SelectItem value="public">🔌 Público</SelectItem>
                <SelectItem value="fast">⚡ Rápido</SelectItem>
                <SelectItem value="free">🎁 Gratuito</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-xs text-muted-foreground mb-1">kWh Carregado</p><Input type="number" placeholder="0" value={chargingForm.kwh_charged} onChange={(e) => setChargingForm({ ...chargingForm, kwh_charged: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">Custo Total (R$)</p><Input type="number" placeholder="0" value={chargingForm.total_cost} onChange={(e) => setChargingForm({ ...chargingForm, total_cost: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">Duração (min)</p><Input type="number" placeholder="0" value={chargingForm.duration_minutes} onChange={(e) => setChargingForm({ ...chargingForm, duration_minutes: e.target.value })} /></div>
              <div><p className="text-xs text-muted-foreground mb-1">Local</p><Input placeholder="Opcional" value={chargingForm.location} onChange={(e) => setChargingForm({ ...chargingForm, location: e.target.value })} /></div>
            </div>
            <Button onClick={handleSaveCharging} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="eletrico" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
