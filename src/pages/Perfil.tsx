import PageHeader from "@/components/PageHeader";
import { User, Car, Settings, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";

export default function Perfil() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_perfil"));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: "Dados do Condutor", path: "/cnh" },
    { icon: Car, label: "Veículos", path: "/veiculo" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
    { icon: Moon, label: "Aparência", path: "/configuracoes" },
  ];

  const tourSteps = [{ target: "h1", title: "Perfil 👤", description: "Gerencie informações pessoais e plano de assinatura." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Perfil" subtitle="Configurações" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_perfil"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      <div className="glass-card p-6 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-display font-bold">
            {user?.user_metadata?.full_name || "Motorista"}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className="glass-card w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full h-12 border-secondary/30 text-secondary hover:bg-secondary/10"
        onClick={signOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="perfil" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
