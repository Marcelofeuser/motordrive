import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { IdCard, Calendar, Award, AlertTriangle } from "lucide-react";

interface CNHData {
  nome?: string;
  cpf?: string;
  data_nascimento?: string;
  numero_registro?: string;
  categoria?: string;
  validade?: string;
  primeira_habilitacao?: string;
  orgao_emissor?: string;
  observacoes?: string;
  ear?: string;
}

export default function CNH() {
  const [cnhData, setCnhData] = useState<CNHData | null>(null);

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="CNH" subtitle="Habilitação" />

      <SmartDocumentUpload
        documentType="cnh"
        onDataExtracted={(data) => setCnhData(data as unknown as CNHData)}
        triggerLabel="Escanear CNH com IA"
      />

      {cnhData ? (
        <div className="mt-4 space-y-3">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{cnhData.nome || "—"}</p>
                <p className="text-xs text-muted-foreground">{cnhData.cpf || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Registro", value: cnhData.numero_registro },
                { label: "Categoria", value: cnhData.categoria },
                { label: "Validade", value: cnhData.validade },
                { label: "1ª Habilitação", value: cnhData.primeira_habilitacao },
                { label: "Órgão", value: cnhData.orgao_emissor },
                { label: "EAR", value: cnhData.ear },
              ].filter(f => f.value).map((f, i) => (
                <div key={i}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Award className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-display font-bold">{cnhData.categoria || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Categoria</p>
              </div>
              <div>
                <Calendar className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-lg font-display font-bold">{cnhData.validade || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Validade</p>
              </div>
              <div>
                <AlertTriangle className="w-5 h-5 text-velocity-green mx-auto mb-1" />
                <p className="text-lg font-display font-bold">0</p>
                <p className="text-[10px] text-muted-foreground uppercase">Pontos</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center mt-4">
          <p className="text-muted-foreground">Escaneie sua CNH para preencher automaticamente.</p>
        </div>
      )}
    </div>
  );
}
