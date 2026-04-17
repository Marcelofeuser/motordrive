import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { AlertTriangle, Shield, Calendar, Bell, FileText } from "lucide-react";

const defaultAlerts = [
  { icon: AlertTriangle, title: "Multa pendente", desc: "Vencimento em 5 dias - 40% desconto disponível", color: "text-secondary" },
  { icon: Shield, title: "CNH vencendo", desc: "Renovação em 30 dias", color: "text-warning" },
  { icon: Calendar, title: "Revisão agendada", desc: "Troca de óleo em 500 km", color: "text-primary" },
  { icon: Bell, title: "IPVA", desc: "Parcela 3/12 vence em 15 dias", color: "text-velocity-green" },
];

export default function Multas() {
  const [importedFines, setImportedFines] = useState<Record<string, unknown>[]>([]);

  const handleFineExtracted = (data: Record<string, unknown>) => {
    setImportedFines((prev) => [...prev, data]);
  };

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Multas & Alertas" subtitle="Controle completo" />

      <SmartDocumentUpload
        documentType="multa"
        onDataExtracted={handleFineExtracted}
        triggerLabel="Escanear Multa com IA"
      />

      {importedFines.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">
            Multas Importadas ({importedFines.length})
          </h3>
          {importedFines.map((fine, i) => (
            <div key={i} className="glass-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary" />
                <p className="text-sm font-semibold">{(fine.descricao as string) || "Multa importada"}</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                {fine.data_infracao && <span>{fine.data_infracao as string}</span>}
                {fine.valor && <span className="text-secondary font-semibold">R$ {Number(fine.valor).toFixed(2)}</span>}
                {fine.pontos && <span>{fine.pontos as number} pts</span>}
                {fine.gravidade && <span className="capitalize">{fine.gravidade as string}</span>}
              </div>
              {fine.valor_com_desconto && (
                <p className="text-xs text-velocity-green">
                  Com desconto: R$ {Number(fine.valor_com_desconto).toFixed(2)}
                  {fine.percentual_desconto && ` (${fine.percentual_desconto}%)`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 mt-6">
        {defaultAlerts.map((a, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 ${a.color}`}>
              <a.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 mt-6">
        <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resumo CNH
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-primary">12</p>
            <p className="text-[10px] text-muted-foreground uppercase">Pontos</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-velocity-green">AB</p>
            <p className="text-[10px] text-muted-foreground uppercase">Categoria</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-warning">30d</p>
            <p className="text-[10px] text-muted-foreground uppercase">Validade</p>
          </div>
        </div>
      </div>
    </div>
  );
}
