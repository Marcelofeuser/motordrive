import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Route, Fuel, Wrench } from "lucide-react";

const quickActions = [
  { icon: DollarSign, label: "Ganho", path: "/faturamento", color: "bg-primary text-primary-foreground" },
  { icon: Route, label: "Jornada", path: "/jornada", color: "bg-secondary text-secondary-foreground" },
  { icon: Fuel, label: "Abastecer", path: "/abastecimento", color: "bg-warning text-primary-foreground" },
  { icon: Wrench, label: "Manutenção", path: "/manutencao", color: "bg-velocity-green text-primary-foreground" },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open &&
            quickActions.map((action, i) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  navigate(action.path);
                  setOpen(false);
                }}
                className="flex items-center gap-3"
              >
                <span className="text-xs font-semibold bg-card px-3 py-1.5 rounded-lg border border-border">
                  {action.label}
                </span>
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_30px_hsl(var(--electric)/0.4)]"
        >
          <Plus className={`w-6 h-6 transition-transform ${open ? "rotate-45" : ""}`} />
        </motion.button>
      </div>
    </>
  );
}
