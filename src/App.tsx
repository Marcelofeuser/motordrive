import Ajuda from "./pages/legal/Ajuda";
import Suporte from "./pages/legal/Suporte";
import FAQ from "./pages/legal/FAQ";
import Privacidade from "./pages/legal/Privacidade";
import Termos from "./pages/legal/Termos";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import Dashboard from "@/pages/Dashboard";
import Faturamento from "@/pages/Faturamento";
import Jornada from "@/pages/Jornada";
import Abastecimento from "@/pages/Abastecimento";
import Manutencao from "@/pages/Manutencao";
import Metas from "@/pages/Metas";
import Relatorios from "@/pages/Relatorios";
import Resumo from "@/pages/Resumo";
import Multas from "@/pages/Multas";
import CNH from "@/pages/CNH";
import Eletrico from "@/pages/Eletrico";
import Veiculo from "@/pages/Veiculo";
import LucroReal from "@/pages/LucroReal";
import Perfil from "@/pages/Perfil";
import Configuracoes from "@/pages/Configuracoes";
import Integracoes from "@/pages/Integracoes";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import Planos from "@/pages/Planos";
import Reservas from "@/pages/Reservas";
import CheckoutSuccess from "@/pages/CheckoutSuccess";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const hasAccount = localStorage.getItem("motordrive_has_account") === "true";
    if (hasAccount) return <Navigate to="/login" replace />;
    window.location.href = "/landing.html";
    return null;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/faturamento" element={<Faturamento />} />
        <Route path="/jornada" element={<Jornada />} />
        <Route path="/abastecimento" element={<Abastecimento />} />
        <Route path="/manutencao" element={<Manutencao />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/resumo" element={<Resumo />} />
        <Route path="/multas" element={<Multas />} />
        <Route path="/cnh" element={<CNH />} />
        <Route path="/eletrico" element={<Eletrico />} />
        <Route path="/veiculo" element={<Veiculo />} />
        <Route path="/lucro-real" element={<LucroReal />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingActionButton />
      <BottomNav />
    </>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/ajuda" element={<Ajuda />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/login" element={<AuthRoute />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
