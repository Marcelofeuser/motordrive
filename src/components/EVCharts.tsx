import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  ResponsiveContainer, Cell, Tooltip, Area, AreaChart,
} from "recharts";

interface UsageEntry {
  id: string; date: string; km_total: number; battery_consumption: number;
}

interface ChargingEntry {
  id: string; date: string; kwh_charged: number; total_cost: number;
  charging_type: string;
}

interface Props {
  usageEntries: UsageEntry[];
  chargingEntries: ChargingEntry[];
}

const formatDate = (d: string) => {
  const parts = d.split("-");
  return `${parts[2]}/${parts[1]}`;
};

export default function EVCharts({ usageEntries, chargingEntries }: Props) {
  const efficiencyData = useMemo(() =>
    [...usageEntries].reverse().map(u => ({
      date: formatDate(u.date),
      kmPerPercent: u.battery_consumption > 0 ? +(u.km_total / u.battery_consumption).toFixed(2) : 0,
      km: u.km_total,
      consumption: u.battery_consumption,
    })),
  [usageEntries]);

  const costData = useMemo(() =>
    [...chargingEntries].reverse().map(c => ({
      date: formatDate(c.date),
      cost: c.total_cost,
      kwh: c.kwh_charged,
      type: c.charging_type,
    })),
  [chargingEntries]);

  const typeBreakdown = useMemo(() => {
    const map: Record<string, { kwh: number; cost: number; count: number }> = {};
    chargingEntries.forEach(c => {
      if (!map[c.charging_type]) map[c.charging_type] = { kwh: 0, cost: 0, count: 0 };
      map[c.charging_type].kwh += c.kwh_charged;
      map[c.charging_type].cost += c.total_cost;
      map[c.charging_type].count++;
    });
    const labels: Record<string, string> = { home: "Casa", public: "Público", fast: "Rápido", free: "Grátis" };
    const colors: Record<string, string> = { home: "hsl(var(--velocity-green))", public: "hsl(var(--electric))", fast: "hsl(var(--warning, 45 100% 50%))", free: "hsl(183 100% 50% / 0.4)" };
    return Object.entries(map).map(([type, data]) => ({
      name: labels[type] || type,
      kwh: +data.kwh.toFixed(1),
      cost: +data.cost.toFixed(2),
      count: data.count,
      color: colors[type] || "hsl(183 100% 50%)",
    }));
  }, [chargingEntries]);

  if (usageEntries.length === 0 && chargingEntries.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">Adicione dados para visualizar gráficos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-1">
      {/* Efficiency over time */}
      {efficiencyData.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Eficiência (km/% bateria)</p>
            <p className="text-[10px] text-primary font-semibold">
              Média: {(efficiencyData.reduce((s, d) => s + d.kmPerPercent, 0) / efficiencyData.length).toFixed(2)}
            </p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={efficiencyData}>
                <defs>
                  <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(183 100% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(183 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(240 5% 65%)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 5% 20%)", borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: "hsl(240 5% 65%)" }}
                  formatter={(value: number) => [`${value} km/%`, "Eficiência"]}
                />
                <Area type="monotone" dataKey="kmPerPercent" stroke="hsl(183 100% 50%)" fill="url(#effGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(183 100% 50%)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Daily KM + Battery consumption */}
      {efficiencyData.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">KM vs Consumo Bateria</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} barGap={2}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(240 5% 65%)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 5% 20%)", borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: "hsl(240 5% 65%)" }}
                />
                <Bar dataKey="km" name="KM" radius={[4, 4, 0, 0]} fill="hsl(183 100% 50%)" fillOpacity={0.7} />
                <Bar dataKey="consumption" name="Bateria %" radius={[4, 4, 0, 0]} fill="hsl(330 100% 48%)" fillOpacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charging cost history */}
      {costData.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Custo por Recarga (R$)</p>
            <p className="text-[10px] text-secondary font-semibold">
              Total: R$ {costData.reduce((s, d) => s + d.cost, 0).toFixed(2)}
            </p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} barCategoryGap="20%">
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(240 5% 65%)" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(240 10% 10%)", border: "1px solid hsl(240 5% 20%)", borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: "hsl(240 5% 65%)" }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Custo"]}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {costData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.cost === 0 ? "hsl(120 100% 55% / 0.4)" : "hsl(330 100% 48% / 0.7)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {typeBreakdown.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Recarga por Tipo</p>
          <div className="space-y-2">
            {typeBreakdown.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs font-medium w-16">{t.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(t.kwh / Math.max(...typeBreakdown.map(x => x.kwh))) * 100}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold tabular-nums w-16 text-right">{t.kwh} kWh</span>
                <span className="text-[10px] text-muted-foreground tabular-nums w-14 text-right">
                  {t.cost > 0 ? `R$ ${t.cost.toFixed(0)}` : "Grátis"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
