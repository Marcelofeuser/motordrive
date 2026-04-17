import { BookOpen } from "lucide-react";
import LegalLayout from "@/components/legal/LegalLayout";

const faq = [
  {
    q: "Como cadastrar meu veículo?",
    a: "Acesse a área Veículo, toque em adicionar veículo e informe placa, modelo, ano e dados principais.",
  },
  {
    q: "Como registrar uma multa?",
    a: "Entre em Multas e envie foto, PDF ou preencha manualmente os dados do auto de infração.",
  },
  {
    q: "O app calcula meu lucro real?",
    a: "Sim. O cálculo considera faturamento, combustível, energia, manutenção, taxas e demais custos lançados.",
  },
  {
    q: "Posso receber alertas automáticos?",
    a: "Sim. Você pode ativar lembretes para CNH, multas, IPVA, licenciamento, revisões e metas.",
  },
  {
    q: "Posso apagar meus registros sem excluir a conta?",
    a: "Sim. Em Configurações > Zona de Risco existe a opção de zerar dados de registros com confirmação.",
  },
];

export default function FAQ() {
  return (
    <LegalLayout
      icon={BookOpen}
      title="FAQ"
      subtitle="Perguntas frequentes do aplicativo."
    >
      {faq.map((item) => (
        <div
          key={item.q}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
        >
          <h2 className="mb-2 text-base font-medium">{item.q}</h2>
          <p className="text-sm leading-6 text-white/70">{item.a}</p>
        </div>
      ))}
    </LegalLayout>
  );
}
