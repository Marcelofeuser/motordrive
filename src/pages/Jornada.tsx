import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { Clock, MapPin, Trash2 } from "lucide-react";

interface Journey {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  km_initial: number;
  km_final: number;
}

export default function Jornada() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Journey[]>([]);
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    horaInicio: "", horaFim: "", kmInicial: "", kmFinal: "",
  });

  const kmTotal = form.kmFinal && form.kmInicial ? Number(form.kmFinal) - Number(form.kmInicial) : 0;
  const todayKm = entries.filter(e => e.date === new Date().toISOString().slice(0, 10)).reduce((s, e) => s + (e.km_final - e.km_initial), 0);

  useEffect(() => {
    if (!user) return;
    supabase.from("journeys").select("*").order("date", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setEntries(data.map((d: any) => ({ id: d.id, date: d.date, start_time: d.start_time, end_time: d.end_time, km_initial: Number(d.km_initial), km_final: Number(d.km_final) })));
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.kmInicial || !form.kmFinal) return;
    const payload = {
      user_id: user.id,
      date: form.data,
      start_time: form.horaInicio || null,
      end_time: form.horaFim || null,
      km_initial: parseFloat(form.kmInicial),
      km_final: parseFloat(form.kmFinal),
    };
    const { data, error } = await supabase.from("journeys").insert(payload).select().single();
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    if (data) setEntries(prev => [{ id: data.id, date: data.date, start_time: data.start_time, end_time: data.end_time, km_initial: Number(data.km_initial), km_final: Number(data.km_final) }, ...prev]);
    toast({ title: "Jornada registrada!", description: `${kmTotal} km percorridos` });
    setForm({ ...form, horaInicio: "", horaFim: "", kmInicial: "", kmFinal: "" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("journeys").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Jornada" subtitle="KM e horas trabalhadas" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Km Hoje" value={todayKm.toFixed(1)} unit="km" icon={MapPin} variant="electric" />
        <StatCard label="Horas" value="--" unit="hrs" icon={Clock} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Data</Label>
          <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="bg-muted border-border mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hora Início</Label>
            <Input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hora Fim</Label>
            <Input type="time" value={form.horaFim} onChange={(e) => setForm({ ...form, horaFim: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">KM Inicial</Label>
            <Input type="number" placeholder="0" value={form.kmInicial} onChange={(e) => setForm({ ...form, kmInicial: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">KM Final</Label>
            <Input type="number" placeholder="0" value={form.kmFinal} onChange={(e) => setForm({ ...form, kmFinal: e.target.value })} className="bg-muted border-border mt-1 text-lg font-display" />
          </div>
        </div>

        {kmTotal > 0 && (
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">KM Total</p>
            <p className="text-3xl font-display font-bold text-primary">{kmTotal.toFixed(1)} km</p>
          </div>
        )}

        <Button onClick={handleSave} className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
          Salvar Jornada
        </Button>
      </motion.div>

      {entries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h3>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{(e.km_final - e.km_initial).toFixed(1)} km</span>
                    <span className="text-[10px] text-muted-foreground">{e.date}</span>
                  </div>
                  {e.start_time && e.end_time && (
                    <p className="text-[10px] text-muted-foreground">{e.start_time.slice(0, 5)} → {e.end_time.slice(0, 5)}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(e.id)} className="text-muted-foreground/40 hover:text-secondary"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
