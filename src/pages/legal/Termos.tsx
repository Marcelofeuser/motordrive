import { FileCheck } from "lucide-react";
import LegalLayout from "@/components/legal/LegalLayout";

export default function Termos() {
  return (
    <LegalLayout
      icon={FileCheck}
      title="Termos de Uso"
      subtitle="Regras para uso do Driver Control Pro."
      meta="Versão pública em 17 de abril de 2026"
    >
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">1. Aceitação</h2>
        <p className="text-sm leading-6 text-white/70">
          Ao utilizar o aplicativo, você concorda com estes termos e com a política de privacidade.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">2. Uso permitido</h2>
        <p className="text-sm leading-6 text-white/70">
          O app deve ser utilizado para gestão pessoal ou profissional de dados operacionais
          relacionados à atividade do motorista.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">3. Responsabilidade do usuário</h2>
        <p className="text-sm leading-6 text-white/70">
          O usuário é responsável pelos dados lançados, pela veracidade das informações e pelo uso
          legal dos documentos enviados.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">4. Funcionalidades e estimativas</h2>
        <p className="text-sm leading-6 text-white/70">
          Algumas análises, alertas e cálculos podem depender de dados informados pelo usuário e
          podem representar estimativas operacionais.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-lg font-medium">5. Suspensão e encerramento</h2>
        <p className="text-sm leading-6 text-white/70">
          Podemos atualizar, limitar ou remover funcionalidades do app para manutenção, segurança,
          conformidade técnica ou evolução do produto.
        </p>
      </section>
    </LegalLayout>
  );
}
