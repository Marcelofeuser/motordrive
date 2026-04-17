// src/pages/legal/Privacidade.tsx
import { Shield } from "lucide-react";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Política de Privacidade</h1>
            <p className="text-sm text-white/60">Última atualização: abril de 2026</p>
          </div>
        </div>

        <div className="space-y-3">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">1. Dados coletados</h2>
            <p className="text-sm leading-6 text-white/70">
              O Driver Control Pro pode coletar dados de perfil, veículo, CNH, documentos,
              multas, registros financeiros, notificações e preferências do aplicativo.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">2. Finalidade de uso</h2>
            <p className="text-sm leading-6 text-white/70">
              Usamos os dados para fornecer funcionalidades do app, alertas, relatórios,
              automações, organização financeira e melhoria da experiência do usuário.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">3. Compartilhamento</h2>
            <p className="text-sm leading-6 text-white/70">
              Os dados não são vendidos. Eles só podem ser compartilhados quando necessário para
              operação técnica, armazenamento, autenticação, suporte ou obrigação legal.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">4. Segurança</h2>
            <p className="text-sm leading-6 text-white/70">
              Adotamos controles técnicos razoáveis para proteger os dados, incluindo autenticação,
              permissões e armazenamento estruturado.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">5. Seus direitos</h2>
            <p className="text-sm leading-6 text-white/70">
              Você pode solicitar acesso, correção, exportação ou exclusão dos seus dados, conforme
              as funcionalidades disponíveis no app e a legislação aplicável.
            </p>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4">
            <h2 className="mb-2 text-lg font-medium text-red-200">6. Exclusão de dados</h2>
            <p className="text-sm leading-6 text-red-100/90">
              O app permite zerar registros operacionais ou excluir a conta inteira, mediante fluxo
              de confirmação reforçada.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}