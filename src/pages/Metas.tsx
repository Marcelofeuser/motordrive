import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Target, TrendingUp, Calendar, DollarSign, Pencil, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Goal {
  id?: string;
  goal_type: string;
  label: string;
  target_value: number;
  icon: LucideIcon;
  variant: "default" | "electric" | "pink" | "green";
}

const defaultGoals: Goal[] = [
  { goal_type: "daily", label: "Meta Diária", target_value: 600, icon: Target, variant: "electric" },
  { goal_type: "weekly", label: "Meta Semanal", target_value: 3500, icon: Calendar, variant: "default" },
  { goal_type: "monthly", label: "Meta Mensal", target_value: 14000, icon: TrendingUp, variant: "green" },
  { goal_type: "profit", label: "Meta Lucro", target_value: 8000, icon: DollarSign, variant: "pink" },
];

export default function Metas() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_metas"));
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("goals").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        setGoals(defaultGoals.map(dg => {
          const found = data.find((d: any) => d.goal_type === dg.goal_type);
          return found ? { ...dg, id: found.id, target_value: Number(found.target_value), label: found.label || dg.label } : dg;
        }));
      }
    });
  }, [user]);

  const startEdit = (goalType: string, currentValue: number) => {
    setEditing(goalType);
    setEditValue(currentValue.toString());
  };

  const saveEdit = async (goal: Goal) => {
    if (!user) return;
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0) { setEditing(null); return; }

    if (goal.id) {
      await supabase.from("goals").update({ target_value: val }).eq("id", goal.id);
    } else {
      const { data } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: goal.goal_type,
        label: goal.label,
        target_value: val,
      }).select().single();
      if (data) goal.id = data.id;
    }

    setGoals(prev => prev.map(g => g.goal_type === goal.goal_type ? { ...g, target_value: val, id: goal.id } : g));
    setEditing(null);
    toast({ title: "Meta atualizada!" });
  };

  // Placeholder progress (would come from real earnings data)
  const progress = [
    { label: "Faturamento", pct: 68, color: "bg-primary" },
    { label: "Lucro", pct: 55, color: "bg-velocity-green" },
    { label: "Km", pct: 72, color: "bg-secondary" },
  ];

  const tourSteps = [{ target: "h1", title: "Suas Metas 🎯", description: "Defina metas diárias, semanais e mensais." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Metas" subtitle="Seus objetivos" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_metas"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {goals.map((g) => (
          <div key={g.goal_type} className="relative">
            {editing === g.goal_type ? (
              <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{g.label}</p>
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-10 text-lg font-display font-bold bg-muted border-border"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(g)} className="flex-1 h-8 rounded-lg bg-velocity-green/20 text-velocity-green flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(null)} className="flex-1 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <StatCard label={g.label} value={`R$ ${g.target_value.toLocaleString("pt-BR")}`} icon={g.icon} variant={g.variant} />
                <button
                  onClick={() => startEdit(g.goal_type, g.target_value)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-muted/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Progresso Mensal
        </h3>
        <div className="space-y-4">
          {progress.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-display font-semibold">{item.pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="metas" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
