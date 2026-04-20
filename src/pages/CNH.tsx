import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { IdCard, Calendar, Award, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CNHData {
  nome?: string; cpf?: string; data_nascimento?: string; numero_registro?: string;
  categoria?: string; validade?: string; primeira_habilitacao?: string;
  orgao_emissor?: string; observacoes?: string; ear?: string;
}

export default function CNH() {
  const { user } = useAuth();
  const [cnhData, setCnhData] = useState<CNHData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("cnh").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setCnhData(data); setLoading(false); });
  }, [user]);

  const handleExtracted = async (data: Record<string, unknown>) => {
    if (!user) return;
    const payload = { user_id: user.id, ...data };
    const existing = await supabase.from("cnh").select("id").eq("user_id", user.id).maybeSingle();
    if (existing.data) {
      await supabase.from("cnh").update(payload).eq("user_id", user.id);
    } else {
      await supabase.from("cnh").insert(payload);
    }
    setCnhData(data as CNHData);
    toast({ title: "CNH salva com sucesso!" });
  };

  const isExpiring = () => {
    if (!cnhData?.validade) return false;
    const parts = cnhData.validade.split("/");
    if (parts.length !== 3) return false;
    const validade = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const diff = (validade.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="CNH" subtitle="Habilitação" />

      <SmartDocumentUpload
        documentType="cnh"
        onDataExtracted={handleExtracted}
        triggerLabel="Escanear CNH com IA"
      />

      {cnhData && (
        <div className="mt-6 space-y-4">
          {isExpiring() && (
            <div className="border border-secondary/30 bg-secondary/5 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0" />
              <p className="text-sm text-secondary font-medium">CNH vencendo em breve!</p>
            </div>
          )}

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <IdCard className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Dados Pessoais</h3>
            </div>
            {[
              { label: "Nome", value: cnhData.nome },
              { label: "CPF", value: cnhData.cpf },
              { label: "Data de Nascimento", value: cnhData.data_nascimento },
              { label: "Nº Registro", value: cnhData.numero_registro },
              { label: "Órgão Emissor", value: cnhData.orgao_emissor },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Habilitação</h3>
            </div>
            {[
              { label: "Categoria", value: cnhData.categoria },
              { label: "Validade", value: cnhData.validade },
              { label: "1ª Habilitação", value: cnhData.primeira_habilitacao },
              { label: "EAR", value: cnhData.ear },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <span className={`text-sm font-medium ${f.label === "Validade" && isExpiring() ? "text-secondary" : ""}`}>{f.value}</span>
              </div>
            ))}
          </div>

          {cnhData.observacoes && (
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
              <p className="text-sm">{cnhData.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
