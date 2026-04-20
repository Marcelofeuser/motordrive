import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DayEarning { day: string; value: number; }
interface PlatformEarning { name: string; value: number; color: string; }

export interface DashboardData {
  todayGross: number; todayTrips: number; todayGoalDiff: number;
  weekTotal: number; weekData: DayEarning[]; platformData: PlatformEarning[];
  totalDistanceToday: number; netProfitToday: number; loading: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  Uber: "hsl(var(--electric))", "99": "hsl(var(--neon-pink))",
  inDrive: "hsl(var(--velocity-green))", Amazon: "hsl(var(--warning))",
  Mercado: "hsl(var(--primary))", Outros: "hsl(var(--muted-foreground))",
};
const WEEK_DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    todayGross: 0, todayTrips: 0, todayGoalDiff: 0, weekTotal: 0,
    weekData: [], platformData: [], totalDistanceToday: 0, netProfitToday: 0, loading: true,
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const weekStart = monday.toISOString().slice(0, 10);

      const [{ data: earnings }, { data: journeys }, { data: goals }] = await Promise.all([
        supabase.from("earnings").select("date,bruto,gorjetas,bonus,taxas,pedagio,platform")
          .eq("user_id", user.id).gte("date", weekStart).order("date", { ascending: true }),
        supabase.from("journeys").select("km_initial,km_final").eq("user_id", user.id).eq("date", today),
        supabase.from("goals").select("target_value,goal_type").eq("user_id", user.id),
      ]);

      const dailyGoal = goals?.find((g) => g.goal_type === "daily_earnings")?.target_value ?? 500;
      const todayEarnings = earnings?.filter((e) => e.date === today) ?? [];
      const todayGross = todayEarnings.reduce((s, e) => s + Number(e.bruto) + Number(e.gorjetas) + Number(e.bonus), 0);
      const todayExpenses = todayEarnings.reduce((s, e) => s + Number(e.taxas) + Number(e.pedagio), 0);
      const netProfitToday = todayGross - todayExpenses;
      const todayTrips = todayEarnings.length;
      const todayGoalDiff = todayGross - dailyGoal;
      const totalDistanceToday = (journeys ?? []).reduce((s, j) => s + Math.max(0, Number(j.km_final) - Number(j.km_initial)), 0);

      const weekMap: Record<string, number> = {};
      (earnings ?? []).forEach((e) => {
        const dayName = WEEK_DAYS[new Date(e.date + "T12:00:00").getDay()];
        weekMap[dayName] = (weekMap[dayName] ?? 0) + Number(e.bruto) + Number(e.gorjetas) + Number(e.bonus);
      });
      const weekData: DayEarning[] = WEEK_DAYS.map((day) => ({ day, value: weekMap[day] ?? 0 }));
      const weekTotal = Object.values(weekMap).reduce((s, v) => s + v, 0);

      const platformMap: Record<string, number> = {};
      (earnings ?? []).forEach((e) => {
        const p = e.platform || "Outros";
        platformMap[p] = (platformMap[p] ?? 0) + Number(e.bruto) + Number(e.gorjetas) + Number(e.bonus);
      });
      const platformData: PlatformEarning[] = Object.entries(platformMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value, color: PLATFORM_COLORS[name] ?? PLATFORM_COLORS["Outros"] }));

      setData({ todayGross, todayTrips, todayGoalDiff, weekTotal, weekData, platformData, totalDistanceToday, netProfitToday, loading: false });
    }
    load();
  }, [user]);

  return data;
}
