import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { Car, Fuel, Hash, MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VeiculoData {
  marca?: string; modelo?: string; ano_fabricacao?: string; ano_modelo?: string;
  placa?: string; cor?: string; renavam?: string; chassi?: string;
  combustivel?: string; potencia?: string; cilindrada?: string;
  categoria?: string; municipio?: string; estado?: string;
  proprietario?: string; cpf_cnpj?: string;
}

export default function Veiculo() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_veiculo"));
  const { user } = useAuth();
  const [veiculoData, setVeiculoData] = useState<VeiculoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [placaInput, setPlacaInput] = useState("");
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    supabase.from("veiculo").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setVeiculoData(data); setLoading(false); });
  }, [user]);

  const consultarPlaca = async () => {
    if (!user || !placaInput) return;
    setConsultando(true);
    try {
      const { data, error } = await supabase.functions.invoke("consultar-placa", {
        body: { placa: placaInput, tipo: "veiculo" },
      });
      if (error) throw error;
      if (data?.status !== "ok") throw new Error(data?.mensagem || "Erro na consulta");
      const v = data.dados.informacoes_veiculo.dados_veiculo;
      const t = data.dados.informacoes_veiculo.dados_tecnicos;
      const extracted: Record<string, unknown> = {
        marca: v.marca, modelo: v.modelo,
        ano_fabricacao: v.ano_fabricacao, ano_modelo: v.ano_modelo,
        placa: v.placa, cor: v.cor, combustivel: v.combustivel,
        municipio: v.municipio, estado: v.uf_municipio,
        potencia: t?.potencia, cilindrada: t?.cilindradas,
      };
      await handleExtracted(extracted);
    } catch (err: any) {
      toast({ title: "Erro na consulta", description: err.message, variant: "destructive" });
    } finally {
      setConsultando(false);
    }
  };

  

  const handleExtracted = async (data: Record<string, unknown>) => {
    if (!user) return;
    const payload = { user_id: user.id, ...data };
    const existing = await supabase.from("veiculo").select("id").eq("user_id", user.id).maybeSingle();
    let error;
    if (existing.data) {
      ({ error } = await supabase.from("veiculo").update(payload).eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("veiculo").insert(payload));
    }
    if (error) { toast({ title: "Erro ao salvar veículo", description: error.message, variant: "destructive" }); return; }
    setVeiculoData(data as VeiculoData);
    toast({ title: "Veículo salvo com sucesso!" });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const tourSteps = [{ target: "h1", title: "Veículo 🚗", description: "Cadastre seu veículo para controle preciso de custos." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Veículo" subtitle="Dados do carro" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_veiculo"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Digite a placa (ex: ONQ7019)"
          value={placaInput}
          onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
          className="bg-muted border-border font-mono"
          maxLength={8}
        />
        <button
          onClick={consultarPlaca}
          disabled={consultando || !placaInput}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
        >
          {consultando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {consultando ? "..." : "Consultar"}
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Digite a placa (ex: ONQ7019)"
          value={placaInput}
          onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
          className="bg-muted border-border font-mono"
          maxLength={8}
        />
        <button
          onClick={consultarPlaca}
          disabled={consultando || !placaInput}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
        >
          {consultando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {consultando ? "..." : "Consultar"}
        </button>
      </div>
      <SmartDocumentUpload
        documentType="crv"
        onDataExtracted={handleExtracted}
        triggerLabel="Escanear CRLV com IA"
      />

      {veiculoData && (
        <div className="mt-6 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Identificação</h3>
            </div>
            {[
              { label: "Marca / Modelo", value: veiculoData.marca && veiculoData.modelo ? `${veiculoData.marca} ${veiculoData.modelo}` : veiculoData.marca || veiculoData.modelo },
              { label: "Ano", value: veiculoData.ano_fabricacao && veiculoData.ano_modelo ? `${veiculoData.ano_fabricacao}/${veiculoData.ano_modelo}` : veiculoData.ano_fabricacao },
              { label: "Placa", value: veiculoData.placa },
              { label: "Cor", value: veiculoData.cor },
              { label: "Categoria", value: veiculoData.categoria },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Documentação</h3>
            </div>
            {[
              { label: "RENAVAM", value: veiculoData.renavam },
              { label: "Chassi", value: veiculoData.chassi },
              { label: "Proprietário", value: veiculoData.proprietario },
              { label: "CPF/CNPJ", value: veiculoData.cpf_cnpj },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Fuel className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Técnico</h3>
            </div>
            {[
              { label: "Combustível", value: veiculoData.combustivel },
              { label: "Potência", value: veiculoData.potencia },
              { label: "Cilindrada", value: veiculoData.cilindrada },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </div>

          {(veiculoData.municipio || veiculoData.estado) && (
            <div className="glass-card p-4 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm">{[veiculoData.municipio, veiculoData.estado].filter(Boolean).join(" - ")}</p>
            </div>
          )}
        </div>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="veiculo" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
