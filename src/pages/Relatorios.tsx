import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Fuel, Wrench } from "lucide-react";

type Period = "7d" | "30d" | "90d";

interface EarningRow { date: string; bruto: number; gorjetas: number; bonus: number; taxas: number; pedagio: number; platform: string; }
interface FuelRow { date: string; total_cost: number; }
interface MaintenanceRow { date: string; valor: number; }

export default function Relatorios() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [fueling, setFueling] = useState<FuelRow[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().slice(0, 10);

    Promise.all([
      supabase.from("earnings").select("date,bruto,gorjetas,bonus,taxas,pedagio,platform").eq("user_id", user.id).gte("date", fromStr),
      supabase.from("fueling").select("date,total_cost").eq("user_id", user.id).gte("date", fromStr),
      supabase.from("maintenance").select("date,valor").eq("user_id", user.id).gte("date", fromStr),
    ]).then(([e, f, m]) => {
      setEarnings((e.data ?? []).map((d: any) => ({ date: d.date, bruto: Number(d.bruto), gorjetas: Number(d.gorjetas), bonus: Number(d.bonus), taxas: Number(d.taxas), pedagio: Number(d.pedagio), platform: d.platform })));
      setFueling((f.data ?? []).map((d: any) => ({ date: d.date, total_cost: Number(d.total_cost) })));
      setMaintenance((m.data ?? []).map((d: any) => ({ date: d.date, valor: Number(d.valor) })));
      setLoading(false);
    });
  }, [user, period]);

  const stats = useMemo(() => {
    const totalBruto = earnings.reduce((s, e) => s + e.bruto + e.gorjetas + e.bonus, 0);
    const totalTaxas = earnings.reduce((s, e) => s + e.taxas + e.pedagio, 0);
    const totalCombustivel = fueling.reduce((s, f) => s + f.total_cost, 0);
    const totalManutencao = maintenance.reduce((s, m) => s + m.valor, 0);
    const totalDespesas = totalTaxas + totalCombustivel + totalManutencao;
    const lucro = totalBruto - totalDespesas;
    const margem = totalBruto > 0 ? (lucro / totalBruto) * 100 : 0;
    return { totalBruto, totalTaxas, totalCombustivel, totalManutencao, totalDespesas, lucro, margem };
  }, [earnings, fueling, maintenance]);

  const platformData = useMemo(() => {
    const map: Record<string, number> = {};
    earnings.forEach(e => { map[e.platform] = (map[e.platform] ?? 0) + e.bruto + e.gorjetas + e.bonus; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [earnings]);

  const COLORS = ["hsl(183 100% 50%)", "hsl(320 80% 60%)", "hsl(142 76% 45%)", "hsl(45 90% 55%)", "hsl(240 60% 65%)"];

  // Daily chart data
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    earnings.forEach(e => { map[e.date] = (map[e.date] ?? 0) + e.bruto + e.gorjetas + e.bonus; });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ date: date.slice(5), value }));
  }, [earnings]);

  const periods: { label: string; value: Period }[] = [
    { label: "7 dias", value: "7d" },
    { label: "30 dias", value: "30d" },
    { label: "90 dias", value: "90d" },
  ];

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Relatórios" subtitle="Análise completa" />

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {periods.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${period === p.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : earnings.length === 0 && fueling.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhum dado no período selecionado</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-velocity-green" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Faturamento</p>
              </div>
              <p className="text-xl font-bold text-velocity-green">R$ {stats.totalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-secondary" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Despesas</p>
              </div>
              <p className="text-xl font-bold text-secondary">R$ {stats.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lucro</p>
              </div>
              <p className={`text-xl font-bold ${stats.lucro >= 0 ? "text-velocity-green" : "text-secondary"}`}>R$ {stats.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Margem</p>
              </div>
              <p className={`text-xl font-bold ${stats.margem >= 0 ? "text-velocity-green" : "text-secondary"}`}>{stats.margem.toFixed(1)}%</p>
            </div>
          </div>

          {/* Daily chart */}
          {dailyData.length > 1 && (
            <div className="glass-card p-5 mb-6">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Faturamento por dia</h3>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} barCategoryGap="20%">
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(240 5% 65%)" }} interval={Math.floor(dailyData.length / 6)} />
                    <YAxis hide />
                    <Tooltip formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Faturamento"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(183 100% 50% / 0.5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Platform breakdown */}
          {platformData.length > 0 && (
            <div className="glass-card p-5 mb-6">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Por plataforma</h3>
              <div className="space-y-3">
                {platformData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-16">{p.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(p.value / platformData[0].value) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-display font-semibold tabular-nums w-20 text-right">R$ {p.value.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense breakdown */}
          <div className="glass-card p-5 mb-6">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Despesas</h3>
            <div className="space-y-3">
              {[
                { label: "Taxas plataformas", value: stats.totalTaxas, icon: DollarSign },
                { label: "Combustível", value: stats.totalCombustivel, icon: Fuel },
                { label: "Manutenção", value: stats.totalManutencao, icon: Wrench },
              ].filter(d => d.value > 0).map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <d.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-medium flex-1">{d.label}</span>
                  <span className="text-xs font-bold text-secondary">R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
