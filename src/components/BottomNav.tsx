import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, DollarSign, Route, Fuel, Wrench, Target,
  FileText, AlertTriangle, User, Zap, Car, Shield, TrendingUp, BarChart3, PiggyBank,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mainTabs = [
  { icon: LayoutDashboard, label: "Início", path: "/" },
  { icon: DollarSign, label: "Ganhos", path: "/faturamento" },
  { icon: Route, label: "Jornada", path: "/jornada" },
  { icon: Fuel, label: "Abastece", path: "/abastecimento" },
  { icon: User, label: "Mais", path: "__more__" },
];

const moreTabs = [
  { icon: Wrench, label: "Manutenção", path: "/manutencao" },
  { icon: Zap, label: "Elétrico", path: "/eletrico" },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: TrendingUp, label: "Lucro Real", path: "/lucro-real" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: BarChart3, label: "Resumo", path: "/resumo" },
  { icon: AlertTriangle, label: "Multas", path: "/multas" },
  { icon: Shield, label: "CNH", path: "/cnh" },
  { icon: Car, label: "Veículo", path: "/veiculo" },
  { icon: PiggyBank, label: "Reservas", path: "/reservas" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string) => {
    if (path === "__more__") return false;
    return location.pathname === path;
  };

  const isMoreActive = moreTabs.some((t) => location.pathname === t.path);

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2"
            >
              <div className="glass-card p-4 grid grid-cols-4 gap-3">
                {moreTabs.map((tab) => (
                  <button
                    key={tab.path}
                    onClick={() => { navigate(tab.path); setShowMore(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      isActive(tab.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 inset-x-0 z-40 safe-area-bottom">
        <div className="bg-night-900/90 backdrop-blur-xl border-t border-border h-20 px-2">
          <div className="max-w-md mx-auto h-full flex justify-around items-center">
            {mainTabs.map((tab) => {
              const active = tab.path === "__more__" ? isMoreActive : isActive(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => {
                    if (tab.path === "__more__") { setShowMore(!showMore); }
                    else { setShowMore(false); navigate(tab.path); }
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-primary mb-0.5" />}
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
