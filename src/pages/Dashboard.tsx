import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Fuel,
  MapPin,
  Target,
  AlertTriangle,
  Zap,
  Battery,
  BatteryCharging,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { useElectricData } from "@/hooks/useElectricData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const weekData = [
  { day: "Seg", value: 320 },
  { day: "Ter", value: 450 },
  { day: "Qua", value: 280 },
  { day: "Qui", value: 510 },
  { day: "Sex", value: 620 },
  { day: "Sáb", value: 740 },
  { day: "Dom", value: 420 },
];

const platformData = [
  { name: "Uber", value: 1840, color: "hsl(var(--electric))" },
  { name: "99", value: 960, color: "hsl(var(--neon-pink))" },
  { name: "inDrive", value: 520, color: "hsl(var(--velocity-green))" },
];

export default function Dashboard() {
  const ev = useElectricData();
  return (
    <div className="px-4 pt-8 pb-28 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase">
            Status: Em Operação
          </p>
          <h1 className="text-3xl font-display font-bold tracking-tighter">
            Driver <span className="text-primary">Control</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-velocity-green animate-pulse-glow" />
          <span className="text-xs text-velocity-green font-semibold">Online</span>
        </div>
      </div>

      {/* Main Earnings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-6 mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 opacity-50" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Faturamento Bruto • Hoje</p>
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-2xl font-display font-light">R$</span>
            <span className="text-6xl font-display font-bold tracking-tighter tabular-nums">
              742,<span className="text-4xl opacity-50">85</span>
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta</p>
                <p className="text-velocity-green font-display font-medium text-sm">+R$ 142,85</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Corridas</p>
                <p className="font-display font-medium text-sm">18</p>
              </div>
            </div>
            <div className="h-10 w-24 flex items-end gap-1">
              {weekData.slice(-5).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary rounded-t-sm"
                  style={{ height: `${(d.value / 740) * 100}%`, opacity: 0.3 + i * 0.17 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Distância" value="214.8" unit="km" icon={MapPin} />
        <StatCard label="Lucro Líquido" value="R$ 512" variant="green" icon={TrendingUp} />
        <StatCard label="Eficiência" value="R$ 2,85" unit="/km" subtitle="+12% vs média" variant="electric" icon={Zap} />
        <StatCard label="Combustível" value="12.8" unit="km/L" icon={Fuel} />
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ganhos da Semana
          </h3>
          <span className="text-xs text-primary font-medium">R$ 3.340</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(240 5% 65%)" }}
              />
              <YAxis hide />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {weekData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === weekData.length - 2 ? "hsl(183 100% 50%)" : "hsl(183 100% 50% / 0.25)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 mb-6"
      >
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Por Plataforma
        </h3>
        <div className="space-y-3">
          {platformData.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs font-medium w-16">{p.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p.value / 1840) * 100}%`,
                    backgroundColor: p.color,
                  }}
                />
              </div>
              <span className="text-xs font-display font-semibold tabular-nums w-20 text-right">
                R$ {p.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* EV Summary */}
      {ev.totalKm > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Elétrico
            </h3>
            <span className="text-xs text-velocity-green font-medium">{ev.kmPerKwh.toFixed(1)} km/kWh</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">KM Total</p>
              <p className="text-sm font-bold">{ev.totalKm.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Custo Recarga</p>
              <p className="text-sm font-bold text-secondary">R$ {ev.totalChargingCost.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">R$/km</p>
              <p className="text-sm font-bold text-primary">R$ {ev.costPerKm.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border border-secondary/30 bg-secondary/5 rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Multa pendente</p>
          <p className="text-xs text-muted-foreground">Vencimento em 5 dias • Desconto de 40% disponível</p>
        </div>
      </motion.div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
