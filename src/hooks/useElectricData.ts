import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EVMetrics {
  totalKm: number;
  totalKwh: number;
  totalChargingCost: number;
  kmPerKwh: number;
  costPerKm: number;
  avgDailyKm: number;
  monthlyChargingCost: number;
}

export function useElectricData(): EVMetrics {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EVMetrics>({
    totalKm: 0, totalKwh: 0, totalChargingCost: 0,
    kmPerKwh: 0, costPerKm: 0, avgDailyKm: 0, monthlyChargingCost: 0,
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: usage }, { data: charging }] = await Promise.all([
        supabase.from("electric_usage").select("km_total,battery_consumption").eq("user_id", user.id),
        supabase.from("electric_charging").select("kwh_charged,total_cost").eq("user_id", user.id),
      ]);

      const totalKm = (usage ?? []).reduce((s, u) => s + Number(u.km_total ?? 0), 0);
      const totalKwh = (charging ?? []).reduce((s, c) => s + Number(c.kwh_charged ?? 0), 0);
      const totalChargingCost = (charging ?? []).reduce((s, c) => s + Number(c.total_cost ?? 0), 0);
      const kmPerKwh = totalKwh > 0 ? totalKm / totalKwh : 0;
      const costPerKm = totalKm > 0 ? totalChargingCost / totalKm : 0;
      const days = Math.max((usage ?? []).length, 1);
      const avgDailyKm = totalKm / days;
      const monthlyChargingCost = (totalChargingCost / days) * 30;

      setMetrics({ totalKm, totalKwh, totalChargingCost, kmPerKwh, costPerKm, avgDailyKm, monthlyChargingCost });
    }
    load();
  }, [user]);

  return metrics;
}
