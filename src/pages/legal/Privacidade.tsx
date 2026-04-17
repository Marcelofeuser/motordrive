import { Shield } from "lucide-react";
import LegalLayout from "@/components/legal/LegalLayout";

export default function Privacidade() {
  return (
    <LegalLayout
      icon={Shield}
      title="Política de Privacidade"
      subtitle="Como tratamos dados e solicitações relacionadas à conta."
      meta="Última atualização: 17 de abril de 2026"
    >
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">1. Dados coletados</h2>
        <p className="text-sm leading-6 text-white/70">
          O Driver Control Pro pode coletar dados de perfil, veículo, CNH, documentos, multas,
          registros financeiros, preferências do aplicativo e eventos técnicos necessários para o
          funcionamento da plataforma.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">2. Finalidade de uso</h2>
        <p className="text-sm leading-6 text-white/70">
          Os dados são utilizados para exibir funcionalidades do app, automatizar preenchimentos,
          gerar alertas, consolidar relatórios, melhorar a experiência do usuário e manter a
          segurança operacional da conta.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">3. Compartilhamento</h2>
        <p className="text-sm leading-6 text-white/70">
          Os dados não são vendidos. Eles podem ser compartilhados apenas com fornecedores
          necessários para autenticação, infraestrutura, armazenamento, processamento solicitado
          pelo usuário, suporte técnico e cumprimento de obrigação legal.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">4. Segurança</h2>
        <p className="text-sm leading-6 text-white/70">
          Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados, incluindo
          autenticação, controles de acesso, isolamento por conta e armazenamento estruturado.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">5. Seus direitos</h2>
        <p className="text-sm leading-6 text-white/70">
          Você pode solicitar acesso, correção, exportação ou exclusão dos seus dados conforme as
          funcionalidades disponíveis no aplicativo e a legislação aplicável.
        </p>
      </section>

      <section
        id="exclusao"
        className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4"
      >
        <h2 className="mb-2 text-lg font-medium text-red-200">6. Exclusão de dados</h2>
        <p className="text-sm leading-6 text-red-100/90">
          O app permite zerar registros operacionais ou excluir a conta inteira mediante confirmação
          reforçada. Quando necessário, também é possível solicitar suporte pelo e-mail oficial.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">7. Contato</h2>
        <p className="text-sm leading-6 text-white/70">
          Para dúvidas sobre privacidade, uso de dados ou exclusão de conta, entre em contato por{" "}
          <a
            href="mailto:suporte@drivercontrolpro.com"
            className="font-medium text-white underline underline-offset-4"
          >
            suporte@drivercontrolpro.com
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
