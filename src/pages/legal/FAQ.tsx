// src/pages/legal/FAQ.tsx
import { BookOpen } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">FAQ</h1>
            <p className="text-sm text-white/60">Perguntas frequentes do aplicativo.</p>
          </div>
        </div>

        <div className="space-y-3">
          {faq.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h2 className="mb-2 text-base font-medium">{item.q}</h2>
              <p className="text-sm leading-6 text-white/70">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}