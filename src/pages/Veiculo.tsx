import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import { Car, Fuel, Hash, MapPin } from "lucide-react";

interface VeiculoData {
  marca?: string;
  modelo?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  placa?: string;
  cor?: string;
  renavam?: string;
  chassi?: string;
  combustivel?: string;
  potencia?: string;
  cilindrada?: string;
  categoria?: string;
  municipio?: string;
  estado?: string;
  proprietario?: string;
  cpf_cnpj?: string;
}

export default function Veiculo() {
  const [veiculoData, setVeiculoData] = useState<VeiculoData | null>(null);

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Veículo" subtitle="Dados do carro" />

      <SmartDocumentUpload
        documentType="crv"
        onDataExtracted={(data) => setVeiculoData(data as unknown as VeiculoData)}
        triggerLabel="Escanear CRV/CRLV com IA"
      />

      {veiculoData ? (
        <div className="mt-4 space-y-3">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {veiculoData.marca} {veiculoData.modelo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {veiculoData.ano_fabricacao}{veiculoData.ano_modelo ? `/${veiculoData.ano_modelo}` : ""} — {veiculoData.cor}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Hash, label: "Placa", value: veiculoData.placa },
                { icon: Hash, label: "Renavam", value: veiculoData.renavam },
                { icon: Fuel, label: "Combustível", value: veiculoData.combustivel },
                { icon: Car, label: "Potência", value: veiculoData.potencia },
                { icon: MapPin, label: "Município", value: veiculoData.municipio ? `${veiculoData.municipio}/${veiculoData.estado}` : null },
                { icon: Car, label: "Categoria", value: veiculoData.categoria },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <f.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-medium">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {veiculoData.proprietario && (
            <div className="glass-card p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Proprietário</p>
              <p className="text-sm font-medium">{veiculoData.proprietario}</p>
              {veiculoData.cpf_cnpj && <p className="text-xs text-muted-foreground">{veiculoData.cpf_cnpj}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 text-center mt-4">
          <p className="text-muted-foreground">Escaneie seu CRV/CRLV para preencher os dados do veículo.</p>
        </div>
      )}
    </div>
  );
}
