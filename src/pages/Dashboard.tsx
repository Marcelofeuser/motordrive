import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Fuel, MapPin, Zap, AlertTriangle, Car, ChevronRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import { useElectricData } from "@/hooks/useElectricData";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface VeiculoData { placa?: string; marca?: string; modelo?: string; ano_fabricacao?: string; cor?: string; }

export default function Dashboard() {
  const ev = useElectricData();
  const dash = useDashboardData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState<VeiculoData | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("veiculo").select("placa,marca,modelo,ano_fabricacao,cor").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setVeiculo(data); });
  }, [user]);

  const maxWeek = Math.max(...dash.weekData.map((d) => d.value), 1);
  const todayName = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][new Date().getDay()];
  const [reaisInt, reaisDec] = dash.todayGross
    .toLocaleString("pt-BR", { minimumFractionDigits: 2 }).split(",");

  return (
    <div className="px-4 pt-8 pb-28 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase">Status: Em Operação</p>
          <h1 className="text-3xl font-display font-bold tracking-tighter">
            Driver <span className="text-primary">Control</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-velocity-green animate-pulse-glow" />
          <span className="text-xs text-velocity-green font-semibold">Online</span>
        </div>
      </div>

      {/* Veículo ativo */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate("/veiculo")}
        className="w-full glass-card p-4 flex items-center gap-3 mb-6 hover:bg-muted/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Car className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          {veiculo ? (
            <>
              <p className="text-sm font-semibold">
                {[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "Meu Veículo"}
                {veiculo.ano_fabricacao && <span className="text-muted-foreground font-normal"> {veiculo.ano_fabricacao}</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {[veiculo.placa, veiculo.cor].filter(Boolean).join(" • ") || "Toque para ver detalhes"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted-foreground">Nenhum veículo cadastrado</p>
              <p className="text-xs text-primary">Toque para cadastrar</p>
            </>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </motion.button>

      {/* Main Earnings Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden glass-card p-6 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 opacity-50" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Faturamento Bruto • Hoje</p>
          {dash.loading ? (
            <div className="h-16 w-48 bg-muted/40 animate-pulse rounded-xl" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground text-2xl font-display font-light">R$</span>
              <span className="text-6xl font-display font-bold tracking-tighter tabular-nums">
                {reaisInt},<span className="text-4xl opacity-50">{reaisDec}</span>
              </span>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta</p>
                {dash.loading ? <div className="h-5 w-20 bg-muted/40 animate-pulse rounded" /> : (
                  <p className={`font-display font-medium text-sm ${dash.todayGoalDiff >= 0 ? "text-velocity-green" : "text-secondary"}`}>
                    {dash.todayGoalDiff >= 0 ? "+" : "-"}R$ {Math.abs(dash.todayGoalDiff).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Corridas</p>
                {dash.loading ? <div className="h-5 w-8 bg-muted/40 animate-pulse rounded" /> : (
                  <p className="font-display font-medium text-sm">{dash.todayTrips}</p>
                )}
              </div>
            </div>
            <div className="h-10 w-24 flex items-end gap-1">
              {dash.weekData.slice(-5).map((d, i) => (
                <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${(d.value / maxWeek) * 100}%`, opacity: 0.3 + i * 0.17 }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Distância" value={dash.totalDistanceToday > 0 ? dash.totalDistanceToday.toFixed(1) : "—"} unit={dash.totalDistanceToday > 0 ? "km" : ""} icon={MapPin} />
        <StatCard label="Lucro Líquido" value={`R$ ${Math.round(dash.netProfitToday)}`} variant="green" icon={TrendingUp} />
        <StatCard label="Semana" value={`R$ ${Math.round(dash.weekTotal)}`} variant="electric" icon={Zap} />
        <StatCard label="Corridas" value={String(dash.todayTrips)} icon={DollarSign} />
      </div>

      {/* Weekly Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ganhos da Semana</h3>
          <span className="text-xs text-primary font-medium">R$ {dash.weekTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
        {dash.loading ? <div className="h-32 bg-muted/30 animate-pulse rounded-lg" /> : (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dash.weekData} barCategoryGap="20%">
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(240 5% 65%)" }} />
                <YAxis hide />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dash.weekData.map((d, i) => (
                    <Cell key={i} fill={d.day === todayName ? "hsl(183 100% 50%)" : "hsl(183 100% 50% / 0.25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Platform Breakdown */}
      {!dash.loading && dash.platformData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 mb-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Por Plataforma</h3>
          <div className="space-y-3">
            {dash.platformData.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-medium w-16">{p.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.value / dash.platformData[0].value) * 100}%`, backgroundColor: p.color }} />
                </div>
                <span className="text-xs font-display font-semibold tabular-nums w-20 text-right">R$ {p.value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* EV Summary */}
      {ev.totalKm > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Elétrico
            </h3>
            <span className="text-xs text-velocity-green font-medium">{ev.kmPerKwh.toFixed(1)} km/kWh</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-muted-foreground uppercase">KM Total</p><p className="text-sm font-bold">{ev.totalKm.toFixed(0)}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Custo Recarga</p><p className="text-sm font-bold text-secondary">R$ {ev.totalChargingCost.toFixed(0)}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">R$/km</p><p className="text-sm font-bold text-primary">R$ {ev.costPerKm.toFixed(2)}</p></div>
          </div>
        </motion.div>
      )}

      {/* Alert */}
      {!dash.loading && dash.todayTrips > 0 && dash.todayGoalDiff < 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border border-secondary/30 bg-secondary/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Meta do dia não atingida</p>
            <p className="text-xs text-muted-foreground">Faltam R$ {Math.abs(dash.todayGoalDiff).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para bater a meta</p>
          </div>
        </motion.div>
      )}

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
