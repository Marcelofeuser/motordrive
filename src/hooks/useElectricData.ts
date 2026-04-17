import { useMemo } from "react";

export interface EVMetrics {
  totalKm: number;
  totalKwh: number;
  totalChargingCost: number;
  kmPerKwh: number;
  costPerKm: number;
  avgDailyKm: number;
  monthlyChargingCost: number;
}

// Sample data mirroring Eletrico.tsx — will be replaced with DB queries after auth
const sampleUsage = [
  { km_total: 142, battery_consumption: 63 },
  { km_total: 150, battery_consumption: 72 },
  { km_total: 130, battery_consumption: 55 },
];

const sampleCharging = [
  { kwh_charged: 45, total_cost: 32.50 },
  { kwh_charged: 50, total_cost: 0 },
  { kwh_charged: 40, total_cost: 55 },
];

export function useElectricData(): EVMetrics {
  return useMemo(() => {
    const totalKm = sampleUsage.reduce((s, u) => s + u.km_total, 0);
    const totalKwh = sampleCharging.reduce((s, c) => s + c.kwh_charged, 0);
    const totalChargingCost = sampleCharging.reduce((s, c) => s + c.total_cost, 0);
    const kmPerKwh = totalKwh > 0 ? totalKm / totalKwh : 0;
    const costPerKm = totalKm > 0 ? totalChargingCost / totalKm : 0;
    const days = sampleUsage.length || 1;
    const avgDailyKm = totalKm / days;
    const monthlyChargingCost = (totalChargingCost / days) * 30;

    return { totalKm, totalKwh, totalChargingCost, kmPerKwh, costPerKm, avgDailyKm, monthlyChargingCost };
  }, []);
}
