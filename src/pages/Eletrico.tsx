import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Zap, Battery, BatteryCharging, MapPin, Clock, Plus, Trash2,
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, BarChart3,
  Home, Globe, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import EVCharts from "@/components/EVCharts";

interface UsageEntry {
  id: string; date: string; km_initial: number; km_final: number; km_total: number;
  battery_initial: number; battery_final: number; battery_consumption: number;
}

interface ChargingEntry {
  id: string; date: string; kwh_charged: number; total_cost: number; cost_per_kwh: number;
  charging_type: "home" | "public" | "fast" | "free"; location: string;
  duration_minutes: number; battery_before: number; battery_after: number;
}

type DialogMode = "usage" | "charging" | null;

const chargingTypeLabels: Record<string, { label: string; color: string }> = {
  home: { label: "🏠 Casa", color: "text-velocity-green" },
  public: { label: "🌐 Público", color: "text-primary" },
  fast: { label: "⚡ Rápido", color: "text-warning" },
  free: { label: "🎁 Grátis", color: "text-velocity-green" },
};

const sampleUsage: UsageEntry[] = [
  { id: "u1", date: "2026-04-16", km_initial: 12400, km_final: 12542, km_total: 142, battery_initial: 95, battery_final: 32, battery_consumption: 63 },
  { id: "u2", date: "2026-04-15", km_initial: 12250, km_final: 12400, km_total: 150, battery_initial: 100, battery_final: 28, battery_consumption: 72 },
  { id: "u3", date: "2026-04-14", km_initial: 12120, km_final: 12250, km_total: 130, battery_initial: 90, battery_final: 35, battery_consumption: 55 },
];

const sampleCharging: ChargingEntry[] = [
  { id: "c1", date: "2026-04-16", kwh_charged: 45, total_cost: 32.50, cost_per_kwh: 0.72, charging_type: "home", location: "Casa", duration_minutes: 360, battery_before: 32, battery_after: 95 },
  { id: "c2", date: "2026-04-15", kwh_charged: 50, total_cost: 0, cost_per_kwh: 0, charging_type: "free", location: "Shopping Center", duration_minutes: 45, battery_before: 28, battery_after: 100 },
  { id: "c3", date: "2026-04-14", kwh_charged: 40, total_cost: 55, cost_per_kwh: 1.375, charging_type: "fast", location: "Posto Shell EV", duration_minutes: 30, battery_before: 15, battery_after: 90 },
];

export default function Eletrico() {
  const [usageEntries, setUsageEntries] = useState<UsageEntry[]>(sampleUsage);
  const [chargingEntries, setChargingEntries] = useState<ChargingEntry[]>(sampleCharging);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("dashboard");

  const [uDate, setUDate] = useState(new Date().toISOString().split("T")[0]);
  const [uKmI, setUKmI] = useState("");
  const [uKmF, setUKmF] = useState("");
  const [uBatI, setUBatI] = useState("");
  const [uBatF, setUBatF] = useState("");

  const [cDate, setCDate] = useState(new Date().toISOString().split("T")[0]);
  const [cKwh, setCKwh] = useState("");
  const [cCost, setCCost] = useState("");
  const [cType, setCType] = useState<string>("home");
  const [cLoc, setCLoc] = useState("");
  const [cDur, setCDur] = useState("");
  const [cBatBefore, setCBatBefore] = useState("");
  const [cBatAfter, setCBatAfter] = useState("");

  const metrics = useMemo(() => {
    const totalKm = usageEntries.reduce((s, e) => s + e.km_total, 0);
    const totalKwh = chargingEntries.reduce((s, e) => s + e.kwh_charged, 0);
    const totalCost = chargingEntries.reduce((s, e) => s + e.total_cost, 0);
    const kmPerKwh = totalKwh > 0 ? totalKm / totalKwh : 0;
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
    const avgDailyKm = usageEntries.length > 0 ? totalKm / usageEntries.length : 0;
    const avgConsumption = usageEntries.length > 0 ? usageEntries.reduce((s, e) => s + e.battery_consumption, 0) / usageEntries.length : 0;
    const weeklyChargeCost = totalCost;
    const monthlyChargeCost = totalCost * (30 / Math.max(chargingEntries.length, 1));
    const avgKmPerPercent = usageEntries.length > 0
      ? usageEntries.reduce((s, e) => s + (e.battery_consumption > 0 ? e.km_total / e.battery_consumption : 0), 0) / usageEntries.length
      : 0;
    const estimatedAutonomy = avgKmPerPercent * 100;
    return { totalKm, totalKwh, totalCost, kmPerKwh, costPerKm, avgDailyKm, avgConsumption, weeklyChargeCost, monthlyChargeCost, estimatedAutonomy };
  }, [usageEntries, chargingEntries]);

  const insights = useMemo(() => {
    const items: { text: string; type: "positive" | "warning" | "info" }[] = [];
    if (metrics.kmPerKwh >= 6) items.push({ text: "Sua eficiência está acima da média! 🎉", type: "positive" });
    else if (metrics.kmPerKwh > 0) items.push({ text: "Seu consumo pode ser otimizado. Tente eco mode.", type: "warning" });
    const homeCost = chargingEntries.filter(c => c.charging_type === "home").reduce((s, c) => s + c.total_cost, 0);
    const otherCost = chargingEntries.filter(c => c.charging_type !== "home" && c.charging_type !== "free").reduce((s, c) => s + c.total_cost, 0);
    if (otherCost > homeCost && homeCost > 0) items.push({ text: "Carregar em casa reduziria seus custos.", type: "info" });
    if (metrics.avgConsumption > 70) items.push({ text: "Consumo de bateria alto. Verifique pressão dos pneus.", type: "warning" });
    if (metrics.costPerKm < 0.15 && metrics.costPerKm > 0) items.push({ text: "Custo/km excelente comparado a combustível!", type: "positive" });
    const freeSessions = chargingEntries.filter(c => c.charging_type === "free").length;
    if (freeSessions > 0) items.push({ text: `${freeSessions} carga(s) gratuita(s) — economia real!`, type: "positive" });
    return items.length > 0 ? items : [{ text: "Adicione dados para receber insights personalizados.", type: "info" }];
  }, [metrics, chargingEntries]);

  const alerts = useMemo(() => {
    const items: { text: string; severity: "critical" | "warning" | "info" }[] = [];
    const lastUsage = usageEntries[0];
    if (lastUsage && lastUsage.battery_final < 20) items.push({ text: `Bateria baixa: ${lastUsage.battery_final}% após última jornada`, severity: "critical" });
    if (metrics.avgConsumption > 65) items.push({ text: "Consumo médio acima de 65% — verifique eficiência", severity: "warning" });
    if (metrics.costPerKm > 0.30) items.push({ text: "Custo/km anormal — revise padrão de recarga", severity: "warning" });
    return items;
  }, [usageEntries, metrics]);

  const addUsage = () => {
    const kmI = parseFloat(uKmI), kmF = parseFloat(uKmF), batI = parseFloat(uBatI), batF = parseFloat(uBatF);
    if ([kmI, kmF, batI, batF].some(isNaN) || kmF <= kmI || batI <= batF) {
      toast({ title: "Dados inválidos", description: "Verifique os valores.", variant: "destructive" }); return;
    }
    setUsageEntries(prev => [{ id: `u${Date.now()}`, date: uDate, km_initial: kmI, km_final: kmF, km_total: kmF - kmI, battery_initial: batI, battery_final: batF, battery_consumption: batI - batF }, ...prev]);
    setDialogMode(null); setUKmI(""); setUKmF(""); setUBatI(""); setUBatF("");
    toast({ title: "Uso registrado!" });
  };

  const addCharging = () => {
    const kwh = parseFloat(cKwh), cost = parseFloat(cCost) || 0;
    const batB = parseFloat(cBatBefore), batA = parseFloat(cBatAfter), dur = parseInt(cDur) || 0;
    if (isNaN(kwh) || kwh <= 0) { toast({ title: "kWh inválido", variant: "destructive" }); return; }
    setChargingEntries(prev => [{ id: `c${Date.now()}`, date: cDate, kwh_charged: kwh, total_cost: cost, cost_per_kwh: kwh > 0 ? cost / kwh : 0, charging_type: cType as ChargingEntry["charging_type"], location: cLoc, duration_minutes: dur, battery_before: isNaN(batB) ? 0 : batB, battery_after: isNaN(batA) ? 0 : batA }, ...prev]);
    setDialogMode(null); setCKwh(""); setCCost(""); setCLoc(""); setCDur(""); setCBatBefore(""); setCBatAfter("");
    toast({ title: "Recarga registrada!" });
  };

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const SectionHeader = ({ id, icon: Icon, title, iconColor }: { id: string; icon: React.ElementType; title: string; iconColor: string }) => (
    <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h3 className="text-sm font-display font-semibold">{title}</h3>
      </div>
      {expandedSection === id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Veículo Elétrico" subtitle="Consumo & Recarga" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button className="h-14 bg-primary/20 text-primary border border-primary/30 font-semibold gap-2" variant="outline" onClick={() => setDialogMode("usage")}>
          <Battery className="w-5 h-5" /> Registrar Uso
        </Button>
        <Button className="h-14 bg-velocity-green/20 text-velocity-green border border-velocity-green/30 font-semibold gap-2" variant="outline" onClick={() => setDialogMode("charging")}>
          <BatteryCharging className="w-5 h-5" /> Nova Recarga
        </Button>
      </div>

      {/* Dashboard */}
      <div className="glass-card p-4 mb-3">
        <SectionHeader id="dashboard" icon={BarChart3} title="Dashboard" iconColor="text-primary" />
        {expandedSection === "dashboard" && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-[10px] text-muted-foreground uppercase">KM Total</p><p className="text-xl font-display font-bold text-primary">{metrics.totalKm.toFixed(0)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">kWh Total</p><p className="text-xl font-display font-bold text-velocity-green">{metrics.totalKwh.toFixed(1)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase">Custo Total</p><p className="text-xl font-display font-bold text-secondary">R$ {metrics.totalCost.toFixed(0)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "km/kWh", value: metrics.kmPerKwh.toFixed(2), color: "text-primary" },
                { label: "R$/km", value: `R$ ${metrics.costPerKm.toFixed(3)}`, color: "text-velocity-green" },
                { label: "Média diária", value: `${metrics.avgDailyKm.toFixed(0)} km`, color: "text-foreground" },
                { label: "Autonomia est.", value: `${metrics.estimatedAutonomy.toFixed(0)} km`, color: "text-warning" },
              ].map((m, i) => (
                <div key={i} className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                  <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Eficiência Bateria</span><span>{metrics.avgConsumption.toFixed(0)}% consumo médio</span>
              </div>
              <Progress value={100 - metrics.avgConsumption} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Custo/dia</p><p className="text-xs font-bold">{chargingEntries.length > 0 ? `R$ ${(metrics.totalCost / chargingEntries.length).toFixed(2)}` : "—"}</p></div>
              <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Custo/sem</p><p className="text-xs font-bold">R$ {metrics.weeklyChargeCost.toFixed(2)}</p></div>
              <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Custo/mês</p><p className="text-xs font-bold">R$ {metrics.monthlyChargeCost.toFixed(0)}</p></div>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="glass-card p-4 mb-3">
        <SectionHeader id="charts" icon={BarChart3} title="Gráficos" iconColor="text-velocity-green" />
        {expandedSection === "charts" && (
          <EVCharts usageEntries={usageEntries} chargingEntries={chargingEntries} />
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="glass-card p-4 mb-3">
          <SectionHeader id="alerts" icon={AlertTriangle} title={`Alertas (${alerts.length})`} iconColor="text-warning" />
          {expandedSection === "alerts" && (
            <div className="space-y-2 pt-1">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${a.severity === "critical" ? "bg-secondary/10 border border-secondary/20" : a.severity === "warning" ? "bg-warning/10 border border-warning/20" : "bg-primary/10 border border-primary/20"}`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === "critical" ? "text-secondary" : a.severity === "warning" ? "text-warning" : "text-primary"}`} />
                  <p className="text-xs">{a.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      <div className="glass-card p-4 mb-3">
        <SectionHeader id="insights" icon={Lightbulb} title="Insights IA" iconColor="text-velocity-green" />
        {expandedSection === "insights" && (
          <div className="space-y-2 pt-1">
            {insights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${ins.type === "positive" ? "bg-velocity-green/10" : ins.type === "warning" ? "bg-warning/10" : "bg-primary/10"}`}>
                <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ins.type === "positive" ? "text-velocity-green" : ins.type === "warning" ? "text-warning" : "text-primary"}`} />
                <p className="text-xs">{ins.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage History */}
      <div className="glass-card p-4 mb-3">
        <SectionHeader id="usage" icon={Battery} title={`Uso Diário (${usageEntries.length})`} iconColor="text-primary" />
        {expandedSection === "usage" && (
          <div className="space-y-2 pt-1">
            {usageEntries.map((e) => (
              <div key={e.id} className="bg-muted/30 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{e.km_total} km</p>
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">🔋 {e.battery_initial}% → {e.battery_final}%</span>
                    <span className="text-[10px] text-primary font-medium">-{e.battery_consumption}%</span>
                  </div>
                </div>
                <button onClick={() => setUsageEntries(prev => prev.filter(u => u.id !== e.id))} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charging History */}
      <div className="glass-card p-4 mb-3">
        <SectionHeader id="charging" icon={BatteryCharging} title={`Recargas (${chargingEntries.length})`} iconColor="text-velocity-green" />
        {expandedSection === "charging" && (
          <div className="space-y-2 pt-1">
            {chargingEntries.map((c) => {
              const ct = chargingTypeLabels[c.charging_type];
              return (
                <div key={c.id} className="bg-muted/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{c.kwh_charged} kWh</p>
                      <span className={`text-[10px] ${ct.color}`}>{ct.label}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{c.date}</span>
                      {c.location && <span className="truncate">{c.location}</span>}
                      {c.total_cost > 0 ? <span className="text-secondary font-medium">R$ {c.total_cost.toFixed(2)}</span> : <span className="text-velocity-green font-medium">Grátis</span>}
                    </div>
                  </div>
                  <button onClick={() => setChargingEntries(prev => prev.filter(x => x.id !== c.id))} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Usage Dialog */}
      <Dialog open={dialogMode === "usage"} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-w-sm bg-background border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Registrar Uso</DialogTitle>
            <DialogDescription>Dados do trajeto elétrico do dia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="date" value={uDate} onChange={(e) => setUDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="KM inicial" value={uKmI} onChange={(e) => setUKmI(e.target.value)} />
              <Input type="number" placeholder="KM final" value={uKmF} onChange={(e) => setUKmF(e.target.value)} />
            </div>
            {uKmI && uKmF && parseFloat(uKmF) > parseFloat(uKmI) && (
              <p className="text-xs text-primary font-medium">Total: {(parseFloat(uKmF) - parseFloat(uKmI)).toFixed(1)} km</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Bateria inicial %" value={uBatI} onChange={(e) => setUBatI(e.target.value)} />
              <Input type="number" placeholder="Bateria final %" value={uBatF} onChange={(e) => setUBatF(e.target.value)} />
            </div>
            {uBatI && uBatF && parseFloat(uBatI) > parseFloat(uBatF) && (
              <p className="text-xs text-warning font-medium">Consumo: {(parseFloat(uBatI) - parseFloat(uBatF)).toFixed(1)}%</p>
            )}
            <Button className="w-full bg-primary text-black font-semibold" onClick={addUsage}>Salvar Uso</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charging Dialog */}
      <Dialog open={dialogMode === "charging"} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-w-sm bg-background border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-velocity-green">Nova Recarga</DialogTitle>
            <DialogDescription>Registre uma sessão de carregamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="kWh carregados" value={cKwh} onChange={(e) => setCKwh(e.target.value)} />
              <Input type="number" placeholder="Custo total R$" value={cCost} onChange={(e) => setCCost(e.target.value)} />
            </div>
            {cKwh && cCost && parseFloat(cKwh) > 0 && (
              <p className="text-xs text-primary font-medium">R$ {(parseFloat(cCost) / parseFloat(cKwh)).toFixed(4)}/kWh</p>
            )}
            <Select value={cType} onValueChange={setCType}>
              <SelectTrigger><SelectValue placeholder="Tipo de recarga" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">🏠 Casa</SelectItem>
                <SelectItem value="public">🌐 Público</SelectItem>
                <SelectItem value="fast">⚡ Rápido</SelectItem>
                <SelectItem value="free">🎁 Gratuito</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Local da recarga" value={cLoc} onChange={(e) => setCLoc(e.target.value)} />
            <Input type="number" placeholder="Duração (minutos)" value={cDur} onChange={(e) => setCDur(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Bateria antes %" value={cBatBefore} onChange={(e) => setCBatBefore(e.target.value)} />
              <Input type="number" placeholder="Bateria depois %" value={cBatAfter} onChange={(e) => setCBatAfter(e.target.value)} />
            </div>
            <Button className="w-full bg-velocity-green text-black font-semibold" onClick={addCharging}>Salvar Recarga</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
