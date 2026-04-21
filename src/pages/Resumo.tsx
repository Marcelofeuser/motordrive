import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, Fuel, Wrench, AlertTriangle, Route, DollarSign } from "lucide-react";

type Period = "week" | "month" | "year" | "all";

interface EarningRow { date: string; platform: string; bruto: number; gorjetas: number; bonus: number; taxas: number; pedagio: number; outros: number; corridas: number; }
interface FuelRow { date: string; liters: number; total_cost: number; km: number; }
interface MaintenanceRow { date: string; category: string; valor: number; }
interface MultaRow { date: string; valor: number; status: string; }
interface JourneyRow { date: string; km_initial: number; km_final: number; }

export default function Resumo() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_resumo"));
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [fueling, setFueling] = useState<FuelRow[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([]);
  const [multas, setMultas] = useState<MultaRow[]>([]);
  const [journeys, setJourneys] = useState<JourneyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const getFromDate = (p: Period) => {
    const now = new Date();
    if (p === "week") { const d = new Date(now); d.setDate(now.getDate() - 7); return d.toISOString().slice(0, 10); }
    if (p === "month") { const d = new Date(now); d.setMonth(now.getMonth() - 1); return d.toISOString().slice(0, 10); }
    if (p === "year") { const d = new Date(now); d.setFullYear(now.getFullYear() - 1); return d.toISOString().slice(0, 10); }
    return "2000-01-01";
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const from = getFromDate(period);

    Promise.all([
      supabase.from("earnings").select("date,platform,bruto,gorjetas,bonus,taxas,pedagio,outros,corridas").eq("user_id", user.id).gte("date", from),
      supabase.from("fueling").select("date,liters,total_cost,km").eq("user_id", user.id).gte("date", from),
      supabase.from("maintenance").select("date,category,valor").eq("user_id", user.id).gte("date", from),
      supabase.from("multas").select("date:created_at,valor,status").eq("user_id", user.id).gte("created_at", from),
      supabase.from("journeys").select("date,km_initial,km_final").eq("user_id", user.id).gte("date", from),
    ]).then(([e, f, m, mu, j]) => {
      setEarnings((e.data ?? []).map((d: any) => ({ date: d.date, platform: d.platform, bruto: Number(d.bruto), gorjetas: Number(d.gorjetas), bonus: Number(d.bonus), taxas: Number(d.taxas), pedagio: Number(d.pedagio), outros: Number(d.outros ?? 0), corridas: Number(d.corridas ?? 0) })));
      setFueling((f.data ?? []).map((d: any) => ({ date: d.date, liters: Number(d.liters), total_cost: Number(d.total_cost), km: Number(d.km) })));
      setMaintenance((m.data ?? []).map((d: any) => ({ date: d.date, category: d.category, valor: Number(d.valor) })));
      setMultas((mu.data ?? []).map((d: any) => ({ date: d.date, valor: Number(d.valor ?? 0), status: d.status })));
      setJourneys((j.data ?? []).map((d: any) => ({ date: d.date, km_initial: Number(d.km_initial), km_final: Number(d.km_final) })));
      setLoading(false);
    });
  }, [user, period]);

  const stats = useMemo(() => {
    // Earnings por plataforma
    const platformMap: Record<string, { bruto: number; corridas: number; liquido: number }> = {};
    earnings.forEach(e => {
      if (!platformMap[e.platform]) platformMap[e.platform] = { bruto: 0, corridas: 0, liquido: 0 };
      platformMap[e.platform].bruto += e.bruto + e.gorjetas + e.bonus + e.outros;
      platformMap[e.platform].corridas += e.corridas;
      platformMap[e.platform].liquido += e.bruto + e.gorjetas + e.bonus + e.outros - e.taxas - e.pedagio;
    });

    const totalBruto = Object.values(platformMap).reduce((s, p) => s + p.bruto, 0);
    const totalLiquido = Object.values(platformMap).reduce((s, p) => s + p.liquido, 0);
    const totalCorridas = Object.values(platformMap).reduce((s, p) => s + p.corridas, 0);

    // Abastecimento
    const totalLitros = fueling.reduce((s, f) => s + f.liters, 0);
    const totalCombustivel = fueling.reduce((s, f) => s + f.total_cost, 0);

    // KM
    const totalKm = journeys.reduce((s, j) => s + Math.max(0, j.km_final - j.km_initial), 0);

    // Manutenção por categoria
    const manutencaoMap: Record<string, number> = {};
    maintenance.forEach(m => { manutencaoMap[m.category] = (manutencaoMap[m.category] ?? 0) + m.valor; });
    const totalManutencao = maintenance.reduce((s, m) => s + m.valor, 0);

    // Multas pagas
    const multasPagas = multas.filter(m => m.status === "paga").reduce((s, m) => s + m.valor, 0);
    const multasPendentes = multas.filter(m => m.status === "pendente").reduce((s, m) => s + m.valor, 0);

    return { platformMap, totalBruto, totalLiquido, totalCorridas, totalLitros, totalCombustivel, totalKm, manutencaoMap, totalManutencao, multasPagas, multasPendentes };
  }, [earnings, fueling, maintenance, multas, journeys]);

  const periods: { label: string; value: Period }[] = [
    { label: "Semana", value: "week" },
    { label: "Mês", value: "month" },
    { label: "Ano", value: "year" },
    { label: "Total", value: "all" },
  ];

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const tourSteps = [{ target: "h1", title: "Resumo 📋", description: "Visão completa de todas as movimentações." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Resumo Total" subtitle="Visão completa" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_resumo"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

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
      ) : (
        <>
          {/* Faturamento por App */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-velocity-green" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Faturamento por App</h3>
            </div>
            {Object.entries(stats.platformMap).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado no período</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.platformMap).sort((a, b) => b[1].bruto - a[1].bruto).map(([platform, data]) => (
                  <div key={platform} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{platform}</span>
                      <span className="text-sm font-bold text-velocity-green">R$ {fmt(data.bruto)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Líquido: <span className="text-primary">R$ {fmt(data.liquido)}</span></span>
                      {data.corridas > 0 && <span>{data.corridas} corridas</span>}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-velocity-green">R$ {fmt(stats.totalBruto)}</p>
                    <p className="text-xs text-primary">Líq: R$ {fmt(stats.totalLiquido)}</p>
                  </div>
                </div>
                {stats.totalCorridas > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total de corridas</span>
                    <span className="text-sm font-bold">{stats.totalCorridas}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KM Total */}
          {stats.totalKm > 0 && (
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Route className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quilometragem</h3>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">KM total percorrido</span>
                <span className="text-lg font-bold">{stats.totalKm.toFixed(1)} km</span>
              </div>
            </div>
          )}

          {/* Abastecimento */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-warning" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Abastecimento</h3>
            </div>
            {stats.totalLitros === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum abastecimento no período</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de litros</span>
                  <span className="text-sm font-bold">{stats.totalLitros.toFixed(1)} L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gasto total</span>
                  <span className="text-sm font-bold text-secondary">R$ {fmt(stats.totalCombustivel)}</span>
                </div>
                {stats.totalLitros > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preço médio/litro</span>
                    <span className="text-sm font-bold text-warning">R$ {fmt(stats.totalCombustivel / stats.totalLitros)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manutenção por item */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Manutenção</h3>
            </div>
            {stats.totalManutencao === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma manutenção no período</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.manutencaoMap).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{cat}</span>
                    <span className="text-sm font-bold text-secondary">R$ {fmt(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                  <span className="text-sm font-bold text-secondary">R$ {fmt(stats.totalManutencao)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Multas */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-secondary" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Multas</h3>
            </div>
            {stats.multasPagas === 0 && stats.multasPendentes === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma multa no período</p>
            ) : (
              <div className="space-y-2">
                {stats.multasPendentes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pendentes</span>
                    <span className="text-sm font-bold text-secondary">R$ {fmt(stats.multasPendentes)}</span>
                  </div>
                )}
                {stats.multasPagas > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pagas</span>
                    <span className="text-sm font-bold text-velocity-green">R$ {fmt(stats.multasPagas)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resultado final */}
          <div className="glass-card p-5 mb-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resultado Final</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faturamento bruto</span>
                <span className="text-sm font-bold text-velocity-green">R$ {fmt(stats.totalBruto)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Combustível</span>
                <span className="text-sm font-bold text-secondary">- R$ {fmt(stats.totalCombustivel)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Manutenção</span>
                <span className="text-sm font-bold text-secondary">- R$ {fmt(stats.totalManutencao)}</span>
              </div>
              {stats.multasPagas > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Multas pagas</span>
                  <span className="text-sm font-bold text-secondary">- R$ {fmt(stats.multasPagas)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm font-semibold">Lucro Real</span>
                <span className={`text-lg font-bold ${(stats.totalLiquido - stats.totalCombustivel - stats.totalManutencao - stats.multasPagas) >= 0 ? "text-velocity-green" : "text-secondary"}`}>
                  R$ {fmt(stats.totalLiquido - stats.totalCombustivel - stats.totalManutencao - stats.multasPagas)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="resumo" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
