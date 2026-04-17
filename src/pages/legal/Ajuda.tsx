// src/pages/legal/Ajuda.tsx
import { HelpCircle, Car, FileText, Bell, BarChart3, ShieldAlert } from "lucide-react";

const items = [
  {
    icon: Car,
    title: "Veículos e documentos",
    text: "Cadastre veículos, acompanhe licenciamento, seguro, IPVA, CNH e documentos importantes em um só lugar.",
  },
  {
    icon: ShieldAlert,
    title: "Multas e recursos",
    text: "Registre multas, acompanhe prazos, configure alertas de desconto antecipado e organize defesa ou recurso.",
  },
  {
    icon: BarChart3,
    title: "Ganhos e lucro real",
    text: "Monitore faturamento, custos, combustível, manutenção, pedágios e visualize seu lucro líquido real.",
  },
  {
    icon: Bell,
    title: "Alertas automáticos",
    text: "Receba lembretes sobre CNH, multas, revisões, metas, seguro, IPVA e licenciamento.",
  },
  {
    icon: FileText,
    title: "Importação de documentos",
    text: "Envie foto, PDF ou print para preencher dados com mais rapidez e reduzir digitação manual.",
  },
];

export default function Ajuda() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Central de Ajuda</h1>
            <p className="text-sm text-white/60">Tudo o que você precisa para usar o app.</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-medium">{item.title}</h2>
                </div>
                <p className="text-sm leading-6 text-white/70">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-2 text-base font-medium">Ainda precisa de ajuda?</h3>
          <p className="text-sm leading-6 text-white/70">
            Use a opção <span className="font-medium text-white">Falar com suporte</span> para
            entrar em contato com a equipe do Driver Control Pro.
          </p>
        </div>
      </div>
    </div>
  );
}