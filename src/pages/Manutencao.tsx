import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const categories = ["Preventiva", "Corretiva", "Pneus", "Óleo", "Freios", "Elétrica", "Outros"];

export default function Manutencao() {
  const [selectedCat, setSelectedCat] = useState("Preventiva");
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    tipo: "",
    valor: "",
    km: "",
    obs: "",
  });

  const handleSave = () => {
    toast({ title: "Manutenção registrada!", description: `${selectedCat} - R$ ${form.valor}` });
    setForm({ ...form, tipo: "", valor: "", km: "", obs: "" });
  };

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Manutenção" subtitle="Registrar serviço" />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === c
                ? "bg-velocity-green text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Data</Label>
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="bg-muted border-border mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Descrição</Label>
          <Input
            placeholder="Ex: Troca de óleo"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="bg-muted border-border mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Valor (R$)</Label>
            <Input
              type="number"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              className="bg-muted border-border mt-1 text-lg font-display"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">KM Atual</Label>
            <Input
              type="number"
              placeholder="0"
              value={form.km}
              onChange={(e) => setForm({ ...form, km: e.target.value })}
              className="bg-muted border-border mt-1 text-lg font-display"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
        >
          Salvar Manutenção
        </Button>
      </motion.div>
    </div>
  );
}
